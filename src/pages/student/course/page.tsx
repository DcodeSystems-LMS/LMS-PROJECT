
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';
import CollapsibleSection from '@/components/base/CollapsibleSection';
import DataService from '@/services/dataService';
import { authService } from '@/lib/auth';
import { bookmarkService } from '@/services/bookmarkService';
import CustomVideoPlayer from '@/components/feature/CustomVideoPlayer';
import HybridVideoPlayer from '@/components/feature/HybridVideoPlayer';
import { instantPreloadService } from '@/services/instantPreloadService';
import { globalPreloader } from '@/services/globalPreloader';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor?: {
    name: string;
    email: string;
  };
  price: number;
  duration_hours: number;
  level: string;
  category: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
  objectives?: string[];
  requirements?: string[];
  tags?: string[];
  lessons?: any[];
}

const CourseLearningPage: React.FC = () => {
  const { courseId } = useParams();
  const [activeLesson, setActiveLesson] = useState(1);
  const [bookmarkedLessons, setBookmarkedLessons] = useState<number[]>([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionCategory, setQuestionCategory] = useState('general');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  
  // Real data states
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Download materials states
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [availableMaterials, setAvailableMaterials] = useState<any[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      initializeData();
    }
  }, [courseId]);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        setError('Please log in to access course content');
        return;
      }
      setCurrentUser(user);

      console.log('🔄 Fetching course data for:', courseId);

      // Check if student is enrolled in the course
      const isEnrolled = await DataService.isStudentEnrolled(user.id, courseId);
      if (!isEnrolled) {
        setError('You are not enrolled in this course. Please enroll first to access course content.');
        return;
      }

      // Fetch course data
      const courses = await DataService.getCourses();
      const course = courses.find(c => c.id === courseId);
      
      if (!course) {
        setError('Course not found');
        return;
      }

      // Add sample data for objectives, requirements, and tags if not present
      const courseWithSampleData = {
        ...course,
        objectives: course.objectives || [
          'Learn the fundamentals of ReactJS and its core concepts',
          'Understand JSX syntax and component structure',
          'Master state management with useState and useEffect hooks',
          'Build interactive user interfaces with React components',
          'Implement routing and navigation in React applications',
          'Deploy React applications to production environments'
        ],
        requirements: course.requirements || [
          'Basic knowledge of HTML, CSS, and JavaScript',
          'Understanding of ES6+ JavaScript features',
          'Node.js and npm installed on your computer',
          'A code editor like VS Code',
          'Basic understanding of web development concepts'
        ],
        tags: course.tags || ['React', 'JavaScript', 'Frontend', 'Web Development', 'UI/UX', 'Beginner Friendly']
      };

      setCourseData(courseWithSampleData);
      console.log('✅ Course data loaded:', courseWithSampleData);

      // Load bookmarked lessons for this course
      const bookmarks = bookmarkService.getBookmarks();
      const courseBookmarks = bookmarks
        .filter(b => b.courseId === courseId)
        .map(b => parseInt(b.lessonId));
      setBookmarkedLessons(courseBookmarks);

          // 🚀 INSTANT PRELOADING: Preload all video URLs immediately for 1-second loading
          const allVideoUrls = (course?.lessons || []).map(lesson => lesson.videoUrl).filter(Boolean);
          if (allVideoUrls.length > 0) {
            console.log('🚀 INSTANT PRELOAD: Starting preload for', allVideoUrls.length, 'videos');
            const startTime = performance.now();
            
            // Add all videos to global preloader queue for instant loading
            allVideoUrls.forEach(url => globalPreloader.addToPreloadQueue(url));
            
            // Also preload first video immediately for instant playback
            if (allVideoUrls.length > 0) {
              instantPreloadService.preloadVideo(allVideoUrls[0]).then(() => {
                const endTime = performance.now();
                const duration = (endTime - startTime).toFixed(2);
                console.log(`🚀 INSTANT PRELOAD: First video ready in ${duration}ms`);
              });
            }
          }

    } catch (error) {
      console.error('❌ Error loading course data:', error);
      setError('Failed to load course content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get lessons from course data or use default
  const lessons = courseData?.lessons || [
    {
      id: 1,
      title: 'Course Introduction',
      videoType: 'youtube',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      language: 'english',
      description: 'Welcome to the course!'
    }
  ];

  const currentLesson = lessons.find((lesson: any, index: number) => index + 1 === activeLesson) || lessons[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading course content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <div className="text-red-600 mb-4">
              <i className="ri-error-warning-line text-4xl"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Course</h2>
            <p className="text-gray-600 mb-4">{error || 'Course not found'}</p>
            <Link to="/student/my-courses">
              <Button variant="outline">
                <i className="ri-arrow-left-line mr-2"></i>
                Back to My Courses
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const handleBookmark = (lessonId: number) => {
    if (!courseData) return;
    
    const lessonIdStr = lessonId.toString();
    const isBookmarked = bookmarkService.isBookmarked(courseData.id, lessonIdStr);
    
    if (isBookmarked) {
      // Remove bookmark
      const success = bookmarkService.removeBookmarkByLesson(courseData.id, lessonIdStr);
      if (success) {
        setBookmarkedLessons(prev => prev.filter(id => id !== lessonId));
        setShowSuccessMessage('Bookmark removed successfully!');
      }
    } else {
      // Add bookmark
      const currentLesson = courseData.lessons?.find(l => l.id === lessonId);
      if (currentLesson) {
        const newBookmark = bookmarkService.addBookmark({
          courseId: courseData.id,
          courseTitle: courseData.title,
          lessonTitle: currentLesson.title,
          lessonId: lessonIdStr,
          instructor: courseData.instructor?.name || 'Unknown Instructor',
          progress: 0, // Default progress
          lessonDuration: currentLesson.duration || 'Unknown',
          thumbnailUrl: courseData.thumbnail
        });
        
        if (newBookmark) {
          setBookmarkedLessons(prev => [...prev, lessonId]);
          setShowSuccessMessage('Lesson bookmarked successfully!');
        }
      }
    }
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleSubmitQuestion = () => {
    if (questionText.trim()) {
      // Create discussion entry that will appear in discussions page
      const discussionEntry = {
        id: Date.now(),
        courseId: courseId || '1',
        courseTitle: courseData.title,
        lessonTitle: currentLesson.title,
        question: questionText.trim(),
        category: questionCategory,
        submittedAt: new Date().toISOString(),
        status: 'pending' as const,
        replies: [],
        lastActivity: new Date().toISOString()
      };
      
      // In real app, this would save to database and sync with discussions page
      console.log('Question submitted and added to discussions:', discussionEntry);
      
      setShowQuestionModal(false);
      setQuestionText('');
      setQuestionCategory('general');
      setShowSuccessMessage('Your question has been submitted and added to your discussions!');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  const markLessonComplete = (lessonId: number) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons(prev => [...prev, lessonId]);
      setShowSuccessMessage('Lesson marked as complete!');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  // Download materials functions
  const handleDownloadMaterials = async () => {
    if (!courseId) return;
    
    try {
      setMaterialsLoading(true);
      setShowDownloadModal(true);
      
      // Fetch available materials for this course
      const materials = await DataService.getCourseMaterials(courseId);
      
      console.log('📋 Materials received in frontend:', materials);
      
      setAvailableMaterials(materials || []);
      
      if (!materials || materials.length === 0) {
        setShowSuccessMessage('No materials available for this course yet.');
        setTimeout(() => setShowSuccessMessage(''), 3000);
      } else {
        console.log('✅ Materials set in state:', materials.length, 'materials');
      }
    } catch (error) {
      console.error('Error loading materials:', error);
      setShowSuccessMessage('Failed to load materials. Please try again.');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const downloadMaterial = async (materialId: string) => {
    try {
      console.log('📥 Starting download for material ID:', materialId);
      
      // Get download URL from the service
      const { url, error } = await DataService.getMaterialDownloadUrl(materialId);
      
      if (error || !url) {
        console.error('❌ Download URL error:', error);
        throw new Error(error?.message || 'Failed to get download URL');
      }

      console.log('✅ Download URL obtained, starting download...');

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = ''; // Let the browser determine the filename
      link.target = '_blank'; // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ Download initiated successfully');
      return true;
    } catch (error) {
      console.error('❌ Download failed:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Object not found')) {
        throw new Error('File not found in storage. Please contact your instructor.');
      } else if (error.message.includes('Material not found')) {
        throw new Error('Material not found. It may have been removed.');
      } else if (error.message.includes('file path is missing')) {
        throw new Error('File path is missing. Please contact your instructor.');
      } else {
        throw new Error(`Download failed: ${error.message}`);
      }
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedMaterials.length === 0) return;

    try {
      // Download each selected material
      for (const materialId of selectedMaterials) {
        await downloadMaterial(materialId);
        // Small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setShowSuccessMessage(`Successfully downloaded ${selectedMaterials.length} file${selectedMaterials.length > 1 ? 's' : ''}!`);
      setTimeout(() => setShowSuccessMessage(''), 3000);
      setShowDownloadModal(false);
      setSelectedMaterials([]);
    } catch (error) {
      console.error('Download error:', error);
      setShowSuccessMessage('Some downloads failed. Please try again.');
      setTimeout(() => setShowSuccessMessage(''), 3000);
    }
  };

  const handleSelectAll = () => {
    if (selectedMaterials.length === availableMaterials.length) {
      setSelectedMaterials([]);
    } else {
      setSelectedMaterials(availableMaterials.map(m => m.id));
    }
  };

  const getTotalSize = () => {
    return selectedMaterials.reduce((total, id) => {
      const material = availableMaterials.find(m => m.id === id);
      if (material && material.size) {
        const sizeNum = parseFloat(material.size);
        const unit = material.size.includes('MB') ? 1024 : 1;
        return total + (sizeNum * unit);
      }
      return total;
    }, 0);
  };

  const formatSize = (kb: number) => {
    if (kb >= 1024) {
      return `${(kb / 1024).toFixed(1)} MB`;
    }
    return `${kb.toFixed(1)} KB`;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return 'ri-play-circle-line';
      case 'quiz': return 'ri-question-line';
      case 'project': return 'ri-code-line';
      default: return 'ri-file-line';
    }
  };

  // Convert YouTube URL to embed URL
  const convertToEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // If it's already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Extract video ID from various YouTube URL formats
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    
    // If no video ID found, return original URL
    return url;
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in-right">
          <div className="flex items-center">
            <i className="ri-check-circle-line mr-2"></i>
            {showSuccessMessage}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500">
        <Link to="/student/my-courses" className="hover:text-blue-600">My Courses</Link>
        <i className="ri-arrow-right-s-line mx-2"></i>
        <span className="text-gray-900">{courseData.title}</span>
      </nav>

      {/* Course Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{courseData.title}</h1>
            <p className="text-gray-600">by {courseData.instructor?.name || 'Mentor'}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Progress</div>
            <div className="text-2xl font-bold text-blue-600">
              {lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0}%
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
            style={{ 
              width: `${lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0}%` 
            }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{completedLessons.length} of {lessons.length} lessons completed</span>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500">{courseData.level} • {courseData.duration_hours}h</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm pr-8"
            >
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{currentLesson.title}</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBookmark(currentLesson.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    bookmarkedLessons.includes(currentLesson.id)
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <i className={bookmarkedLessons.includes(currentLesson.id) ? 'ri-bookmark-fill' : 'ri-bookmark-line'}></i>
                </button>
                <button
                  onClick={() => setShowQuestionModal(true)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  title="Ask a question - will be added to your discussions"
                >
                  <i className="ri-question-line"></i>
                </button>
              </div>
            </div>

            {currentLesson && (
              <div className="space-y-4">
                {currentLesson.videoUrl ? (
                  <CustomVideoPlayer
                    videoUrl={currentLesson.videoUrl}
                    title={currentLesson.title}
                    forceCustomPlayer={true}
                    progressCheckpoints={[10, 30, 60, 120, 300]} // Example checkpoints at 10s, 30s, 1min, 2min, 5min
                    onProgressCheckpoint={async (currentTime, checkpoint) => {
                      console.log(`🎯 Checkpoint reached at ${currentTime}s (checkpoint: ${checkpoint}s)`);
                      
                      // Simulate data processing - replace with your actual logic
                      // This could be saving progress, analyzing content, etc.
                      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000)); // 2-5 second delay
                      
                      console.log(`✅ Data processing complete for checkpoint ${checkpoint}s`);
                      
                      // Return true to resume playback, false to keep paused
                      return true;
                    }}
                    onTimeUpdate={(currentTime, duration) => {
                      // You can save progress here if needed
                      console.log(`Video progress: ${currentTime}/${duration}`);
                    }}
                  />
                ) : (
                  <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                    <div className="text-center text-white">
                      <i className="ri-video-line text-4xl mb-2"></i>
                      <p>No video available</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Language: {currentLesson.language || 'English'}</span>
                  {!completedLessons.includes(activeLesson) && (
                    <Button size="sm" onClick={() => markLessonComplete(activeLesson)}>
                      <i className="ri-check-line mr-2"></i>
                      Mark Complete
                    </Button>
                  )}
                </div>
                
                {/* Collapsible Sections */}
                <div className="mt-6 bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Description Section */}
                  {currentLesson.description && (
                    <CollapsibleSection
                      title="Description"
                      icon="ri-file-text-line"
                      defaultExpanded={true}
                    >
                      <p>{currentLesson.description}</p>
                    </CollapsibleSection>
                  )}
                  
                  {/* Course Objectives Section */}
                  {courseData?.objectives && courseData.objectives.length > 0 && (
                    <CollapsibleSection
                      title="Course Objectives"
                      icon="ri-target-line"
                    >
                      <ul className="space-y-2">
                        {courseData.objectives.map((objective, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <i className="ri-checkbox-circle-line text-green-600 mt-0.5 flex-shrink-0"></i>
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleSection>
                  )}
                  
                  {/* Course Requirements Section */}
                  {courseData?.requirements && courseData.requirements.length > 0 && (
                    <CollapsibleSection
                      title="Course Requirements"
                      icon="ri-list-check-2"
                    >
                      <ul className="space-y-2">
                        {courseData.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <i className="ri-arrow-right-s-line text-blue-600 mt-0.5 flex-shrink-0"></i>
                            <span>{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleSection>
                  )}
                  
                  {/* Course Tags Section */}
                  {courseData?.tags && courseData.tags.length > 0 && (
                    <CollapsibleSection
                      title="Course Tags"
                      icon="ri-price-tag-3-line"
                    >
                      <div className="flex flex-wrap gap-2">
                        {courseData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CollapsibleSection>
                  )}
                </div>
              </div>
            )}

            {currentLesson.type === 'quiz' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-question-line text-2xl text-orange-600"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Quiz</h3>
                <p className="text-gray-600 mb-4">Test your knowledge with this interactive quiz</p>
                <Button>Start Quiz</Button>
              </div>
            )}

            {currentLesson.type === 'project' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-code-line text-2xl text-purple-600"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Hands-on Project</h3>
                <p className="text-gray-600 mb-4">Apply what you've learned in this practical project</p>
                <Button>Start Project</Button>
              </div>
            )}
          </Card>

          {/* Lesson Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline"
              disabled={activeLesson === 1}
              onClick={() => setActiveLesson(prev => Math.max(1, prev - 1))}
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Previous
            </Button>
            <Button 
              disabled={activeLesson === lessons.length}
              onClick={() => setActiveLesson(prev => Math.min(lessons.length, prev + 1))}
            >
              Next
              <i className="ri-arrow-right-line ml-2"></i>
            </Button>
          </div>
        </div>

        {/* Lesson List Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Course Content</h3>
            <div className="space-y-2">
              {lessons.map((lesson: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveLesson(index + 1)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeLesson === index + 1
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        completedLessons.includes(index + 1)
                          ? 'bg-green-100 text-green-600'
                          : activeLesson === index + 1
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <i className={
                          completedLessons.includes(index + 1)
                            ? 'ri-check-line'
                            : activeLesson === index + 1
                            ? 'ri-play-line'
                            : 'ri-play-circle-line'
                        }></i>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{lesson.title}</div>
                        <div className="text-xs text-gray-500">{lesson.language || 'English'}</div>
                      </div>
                    </div>
                    {bookmarkedLessons.includes(index + 1) && (
                      <i className="ri-bookmark-fill text-yellow-500"></i>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" fullWidth onClick={handleDownloadMaterials}>
                <i className="ri-download-line mr-2"></i>
                Download Materials
              </Button>
              <Button variant="outline" size="sm" fullWidth>
                <i className="ri-team-line mr-2"></i>
                Join Study Group
              </Button>
              <Button variant="outline" size="sm" fullWidth>
                <i className="ri-message-line mr-2"></i>
                Contact Instructor
              </Button>
              <Link to="/student/discussions">
                <Button variant="outline" size="sm" fullWidth>
                  <i className="ri-chat-3-line mr-2"></i>
                  View My Questions
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Learning Path Progress */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Learning Path Progress</h3>
            <p className="text-sm text-gray-600">{courseData.category}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-lg font-bold text-blue-600">
              {completedLessons.length} of {lessons.length} modules completed
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {lessons.map((lesson: any, index: number) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                completedLessons.includes(index + 1)
                  ? 'bg-green-100 text-green-600'
                  : activeLesson === index + 1
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <i className={
                  completedLessons.includes(index + 1)
                    ? 'ri-check-line'
                    : activeLesson === index + 1
                    ? 'ri-play-line'
                    : 'ri-lock-line'
                }></i>
              </div>
              <span className="text-xs text-gray-600 text-center max-w-16">
                {lesson.title.length > 12 ? lesson.title.substring(0, 12) + '...' : lesson.title}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Question Modal */}
      <Modal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <i className="ri-question-line text-blue-600"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ask a Question</h3>
              <p className="text-sm text-gray-600">About: {currentLesson.title}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Category
              </label>
              <select
                value={questionCategory}
                onChange={(e) => setQuestionCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="general">General Question</option>
                <option value="technical">Technical Issue</option>
                <option value="concept">Concept Clarification</option>
                <option value="assignment">Assignment Help</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Question
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type your question here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {questionText.length}/500 characters
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start">
                <i className="ri-information-line text-blue-600 mt-0.5 mr-2"></i>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Your question will be:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Added to your Discussions tab for easy tracking</li>
                    <li>• Sent to course mentors for expert answers</li>
                    <li>• Available for review and follow-up questions</li>
                    <li>• Mentors typically respond within 24 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSubmitQuestion}
              disabled={!questionText.trim()}
              className="flex-1"
            >
              <i className="ri-send-plane-line mr-2"></i>
              Submit Question
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowQuestionModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Download Materials Modal */}
      <Modal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <i className="ri-download-line text-blue-600"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Download Course Materials</h3>
              <p className="text-sm text-gray-600">Select materials to download</p>
            </div>
          </div>

          {materialsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading materials...</p>
            </div>
          ) : availableMaterials.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-file-download-line text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">No materials available for this course yet.</p>
              <p className="text-sm text-gray-500 mt-2">Check back later or contact your instructor.</p>
              <p className="text-xs text-gray-400 mt-2">Debug: availableMaterials.length = {availableMaterials.length}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMaterials.length === availableMaterials.length}
                    onChange={handleSelectAll}
                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900">
                    Select All ({availableMaterials.length} files)
                  </span>
                </label>
                {selectedMaterials.length > 0 && (
                  <span className="text-sm text-gray-600">
                    Total: {formatSize(getTotalSize())}
                  </span>
                )}
              </div>

              {/* Materials List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {availableMaterials.map((material) => (
                  <div key={material.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(material.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMaterials(prev => [...prev, material.id]);
                        } else {
                          setSelectedMaterials(prev => prev.filter(id => id !== material.id));
                        }
                      }}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <i className={`ri-file-${material.category === 'slides' ? 'ppt' : 
                          material.category === 'code' ? 'code' : 
                          material.category === 'handouts' ? 'text' : 'file'}-line text-blue-600 mr-2`}></i>
                        <div>
                          <div className="font-medium text-gray-900">{material.title}</div>
                          <div className="text-sm text-gray-500">
                            {material.size} • {material.category} • {material.download_count || 0} downloads
                          </div>
                        </div>
                      </div>
                      {material.description && (
                        <p className="text-xs text-gray-600 mt-1">{material.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Download Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleDownloadSelected}
                  disabled={selectedMaterials.length === 0}
                  className="flex-1"
                >
                  <i className="ri-download-line mr-2"></i>
                  Download Selected ({selectedMaterials.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDownloadModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CourseLearningPage;
