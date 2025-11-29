import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';
import DataService from '@/services/dataService';
import { authService } from '@/lib/auth';
import { bookmarkService } from '@/services/bookmarkService';
import CustomVideoPlayer from '@/components/feature/CustomVideoPlayer';
import HybridVideoPlayer from '@/components/feature/HybridVideoPlayer';
import YouTubeEmbed from '@/components/feature/YouTubeEmbed';
import { instantPreloadService } from '@/services/instantPreloadService';
import { globalPreloader } from '@/services/globalPreloader';

const StudentContinue: React.FC = () => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [questionCategory, setQuestionCategory] = useState('general');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [availableMaterials, setAvailableMaterials] = useState<any[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [currentLesson, setCurrentLesson] = useState({
    courseTitle: 'Full Stack Web Development',
    lessonTitle: 'CSS Flexbox Layout',
    lessonNumber: 8,
    totalLessons: 48,
    progress: 67,
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '25 minutes',
    lastWatched: '12:34'
  });

  const upcomingTasks = [
    { id: 1, title: 'Complete CSS Grid Exercise', type: 'Practice', dueIn: '2 days' },
    { id: 2, title: 'HTML & CSS Quiz', type: 'Assessment', dueIn: '5 days' },
    { id: 3, title: 'Build Responsive Layout', type: 'Project', dueIn: '1 week' }
  ];

  const recentLessons = [
    { id: 1, title: 'CSS Positioning', completed: true, duration: '18 min' },
    { id: 2, title: 'CSS Box Model', completed: true, duration: '22 min' },
    { id: 3, title: 'HTML Forms', completed: true, duration: '30 min' },
    { id: 4, title: 'HTML Semantic Elements', completed: true, duration: '15 min' }
  ];

  // Load materials on component mount
  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setMaterialsLoading(true);
      
      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        console.warn('User not authenticated');
        return;
      }
      setCurrentUser(user);

      // 🚀 INSTANT PRELOADING: Preload current video immediately for 1-second loading
      if (currentLesson.videoUrl) {
        console.log('🚀 INSTANT PRELOAD: Starting preload for current video');
        const startTime = performance.now();
        
        // Add to global preloader queue
        globalPreloader.addToPreloadQueue(currentLesson.videoUrl);
        
        // Also preload immediately for instant playback
        instantPreloadService.preloadVideo(currentLesson.videoUrl).then(() => {
          const endTime = performance.now();
          const duration = (endTime - startTime).toFixed(2);
          console.log(`🚀 INSTANT PRELOAD: Current video preloaded in ${duration}ms`);
        });
      }

      // For now, we'll use a mock course ID. In a real app, this would come from the current lesson/course context
      const courseId = '1'; // This should be dynamic based on current course
      
      // Load materials for the current course
      const materials = await DataService.getMaterialsForStudent(courseId, user.id);
      
      // Transform materials to match the expected format
      const transformedMaterials = materials.map(material => ({
        id: material.id,
        name: material.title,
        type: material.file_extension.toUpperCase(),
        size: formatFileSize(material.file_size),
        icon: getFileIcon(material.file_name),
        description: material.description || 'Course material',
        category: material.category,
        downloadCount: material.download_count
      }));
      
      setAvailableMaterials(transformedMaterials);
      console.log('✅ Materials loaded:', transformedMaterials);
    } catch (error) {
      console.error('❌ Error loading materials:', error);
      // Fallback to empty array if loading fails
      setAvailableMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'ri-file-pdf-line';
      case 'doc':
      case 'docx': return 'ri-file-word-line';
      case 'ppt':
      case 'pptx': return 'ri-file-ppt-line';
      case 'xls':
      case 'xlsx': return 'ri-file-excel-line';
      case 'zip':
      case 'rar': return 'ri-file-zip-line';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'ri-image-line';
      case 'mp4':
      case 'avi':
      case 'mov': return 'ri-video-line';
      case 'mp3':
      case 'wav': return 'ri-music-line';
      case 'txt': return 'ri-file-text-line';
      case 'js':
      case 'ts':
      case 'html':
      case 'css':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c': return 'ri-code-line';
      default: return 'ri-file-line';
    }
  };

  // Check if URL is a YouTube URL
  const isYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    
    const youtubePatterns = [
      /youtube\.com\/watch\?v=/,
      /youtube\.com\/embed\//,
      /youtu\.be\//,
      /youtube\.com\/v\//,
      /youtube\.com\/.*[?&]v=/
    ];
    
    return youtubePatterns.some(pattern => pattern.test(url));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleResume = () => {
    // Simulate resuming video or redirecting to lesson
    console.log('Resuming lesson at', currentLesson.lastWatched);
  };

  const handleRestart = () => {
    // Simulate restarting the lesson
    console.log('Restarting lesson');
    setCurrentLesson(prev => ({ ...prev, lastWatched: '0:00' }));
  };

  const handleBookmark = () => {
    const courseId = '1'; // This would be dynamic based on current course
    const lessonId = '1'; // This would be dynamic based on current lesson
    
    if (isBookmarked) {
      // Remove bookmark
      const success = bookmarkService.removeBookmarkByLesson(courseId, lessonId);
      if (success) {
        setIsBookmarked(false);
        setShowSuccessMessage('Bookmark removed successfully!');
      }
    } else {
      // Add bookmark
      const newBookmark = bookmarkService.addBookmark({
        courseId: courseId,
        courseTitle: currentLesson.courseTitle,
        lessonTitle: currentLesson.lessonTitle,
        lessonId: lessonId,
        instructor: 'Unknown Instructor', // This would be dynamic
        progress: currentLesson.progress,
        lessonDuration: currentLesson.duration,
        thumbnailUrl: undefined
      });
      
      if (newBookmark) {
        setIsBookmarked(true);
        setShowSuccessMessage('Lesson bookmarked successfully!');
      }
    }
    setTimeout(() => setShowSuccessMessage(''), 3000);
  };

  const handleAskQuestion = () => {
    setShowQuestionModal(true);
  };

  const handleSubmitQuestion = () => {
    if (questionText.trim()) {
      // Create discussion entry that will appear in discussions page
      const discussionEntry = {
        id: Date.now(),
        courseId: '1', // This would be dynamic based on current course
        courseTitle: currentLesson.courseTitle,
        lessonTitle: currentLesson.lessonTitle,
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

  const handleDownloadMaterials = () => {
    setShowDownloadModal(true);
  };

  const handleMaterialSelection = (materialId: string) => {
    setSelectedMaterials(prev => 
      prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMaterials(
      selectedMaterials.length === availableMaterials.length
        ? []
        : availableMaterials.map(m => m.id)
    );
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
    return `${Math.round(kb)} KB`;
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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Continue Learning</h1>
        <p className="text-gray-600 mt-1">Pick up where you left off and keep making progress</p>
      </div>

      {/* Current Lesson - Improved Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="relative">
              {isYouTubeUrl(currentLesson.videoUrl) ? (
                <YouTubeEmbed
                  videoUrl={currentLesson.videoUrl}
                  title={currentLesson.lessonTitle}
                  controls={true}
                  showFullscreen={false}
                />
              ) : (
              <CustomVideoPlayer
                videoUrl={currentLesson.videoUrl}
                title={currentLesson.lessonTitle}
                progressCheckpoints={[15, 45, 90, 180]} // Example checkpoints for continue page
                onProgressCheckpoint={async (currentTime, checkpoint) => {
                  console.log(`🎯 Continue page checkpoint reached at ${currentTime}s`);
                  
                  // Simulate saving progress or other data processing
                  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000)); // 1.5-3.5 second delay
                  
                  console.log(`✅ Progress saved for checkpoint ${checkpoint}s`);
                  return true; // Resume playback
                }}
                onTimeUpdate={(currentTime, duration) => {
                  // Save progress for resume functionality
                  const progressPercent = (currentTime / duration) * 100;
                  console.log(`Video progress: ${progressPercent.toFixed(1)}%`);
                }}
              />
              )}
              <div className="absolute bottom-4 left-4 bg-black/75 text-white px-3 py-2 rounded-lg text-sm font-medium">
                Resume at {currentLesson.lastWatched}
              </div>
            </div>
          </Card>
        </div>

        {/* Lesson Info Section */}
        <div className="space-y-6">
          {/* Lesson Header */}
          <Card>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{currentLesson.lessonTitle}</h2>
                <p className="text-sm text-gray-600">{currentLesson.courseTitle}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Lesson {currentLesson.lessonNumber} of {currentLesson.totalLessons}</span>
                <span className="text-sm text-gray-500">{currentLesson.duration}</span>
              </div>
            </div>
          </Card>

          {/* Progress Section */}
          <Card>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${currentLesson.progress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">{currentLesson.progress}% Complete</div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`w-full justify-start transition-all duration-200 ${
                    isBookmarked ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : ''
                  }`}
                  onClick={handleBookmark}
                >
                  <i className={`${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'} mr-2`}></i>
                  {isBookmarked ? 'Bookmarked' : 'Bookmark Lesson'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleDownloadMaterials}
                >
                  <i className="ri-download-line mr-2"></i>
                  Download Materials
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleAskQuestion}
                >
                  <i className="ri-question-line mr-2"></i>
                  Ask Question
                </Button>
                <Link to="/student/discussions">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <i className="ri-chat-3-line mr-2"></i>
                    View My Questions
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Question Modal */}
      <Modal isOpen={showQuestionModal} onClose={() => setShowQuestionModal(false)}>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <i className="ri-question-line text-blue-600"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ask a Question</h3>
              <p className="text-sm text-gray-600">About: {currentLesson.lessonTitle}</p>
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
        <div className="p-6 max-w-2xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <i className="ri-download-cloud-line text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Download Course Materials</h3>
              <p className="text-sm text-gray-600">CSS Flexbox Layout - Lesson 8</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMaterials.length === availableMaterials.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Select All Materials</span>
              </label>
              {selectedMaterials.length > 0 && (
                <div className="text-sm text-gray-600">
                  {selectedMaterials.length} selected • {formatSize(getTotalSize())}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
            {materialsLoading ? (
              <div className="text-center py-8">
                <i className="ri-loader-4-line text-2xl text-gray-400 animate-spin mb-2"></i>
                <p className="text-gray-500">Loading materials...</p>
              </div>
            ) : availableMaterials.length === 0 ? (
              <div className="text-center py-8">
                <i className="ri-file-line text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No materials available for this course yet.</p>
                <p className="text-sm text-gray-400 mt-1">Check back later or contact your instructor.</p>
              </div>
            ) : (
              availableMaterials.map((material) => {
              const isSelected = selectedMaterials.includes(material.id);
              const isDownloading = downloadProgress[material.id] !== undefined;
              const progress = downloadProgress[material.id] || 0;

              return (
                <div
                  key={material.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleMaterialSelection(material.id)}
                      disabled={isDownloading}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <i className={`${material.icon} text-gray-600`}></i>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{material.name}</h4>
                            <p className="text-xs text-gray-500">{material.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">{material.type}</div>
                          <div className="text-xs text-gray-500">{material.size}</div>
                        </div>
                      </div>
                      
                      {isDownloading && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Downloading...</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
              })
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                {selectedMaterials.length === 0 
                  ? 'No materials selected' 
                  : `${selectedMaterials.length} material${selectedMaterials.length > 1 ? 's' : ''} selected`
                }
              </div>
              {selectedMaterials.length > 0 && (
                <div className="text-sm font-medium text-gray-900">
                  Total size: {formatSize(getTotalSize())}
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <i className="ri-information-line text-blue-600 mt-0.5 mr-2"></i>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Download Information:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Materials will be downloaded to your default downloads folder</li>
                    <li>• All materials are available offline after download</li>
                    <li>• Materials include the latest updates and corrections</li>
                    <li>• Files are virus-scanned and safe to download</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDownloadSelected}
                disabled={selectedMaterials.length === 0 || Object.keys(downloadProgress).length > 0 || materialsLoading || availableMaterials.length === 0}
                className="flex-1"
              >
                {Object.keys(downloadProgress).length > 0 ? (
                  <>
                    <i className="ri-loader-4-line mr-2 animate-spin"></i>
                    Downloading...
                  </>
                ) : (
                  <>
                    <i className="ri-download-line mr-2"></i>
                    Download Selected ({selectedMaterials.length})
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDownloadModal(false)}
                disabled={Object.keys(downloadProgress).length > 0}
              >
                {Object.keys(downloadProgress).length > 0 ? 'Downloading...' : 'Cancel'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            <Link to="/student/assessments">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                  task.type === 'Practice' ? 'bg-blue-100' :
                  task.type === 'Assessment' ? 'bg-orange-100' : 'bg-purple-100'
                }`}>
                  <i className={`${
                    task.type === 'Practice' ? 'ri-pencil-line text-blue-600' :
                    task.type === 'Assessment' ? 'ri-question-line text-orange-600' : 
                    'ri-code-line text-purple-600'
                  }`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <p className="text-sm text-gray-600">Due in {task.dueIn}</p>
                </div>
                <Button variant="outline" size="sm">Start</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Lessons */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Completed</h2>
          <div className="space-y-3">
            {recentLessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-check-line text-green-600"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                  <p className="text-sm text-gray-600">{lesson.duration}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <i className="ri-replay-line"></i>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Learning Path */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Path Progress</h2>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Full Stack Web Development</span>
            <span className="text-sm text-gray-500">8 of 12 modules completed</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              { name: 'HTML Basics', status: 'completed' },
              { name: 'CSS Fundamentals', status: 'completed' },
              { name: 'CSS Layout', status: 'current' },
              { name: 'JavaScript Basics', status: 'upcoming' },
              { name: 'DOM Manipulation', status: 'upcoming' },
              { name: 'React Fundamentals', status: 'upcoming' }
            ].map((module, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  module.status === 'completed' ? 'bg-green-100 text-green-600' :
                  module.status === 'current' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <i className={`${
                    module.status === 'completed' ? 'ri-check-line' :
                    module.status === 'current' ? 'ri-play-line' :
                    'ri-lock-line'
                  }`}></i>
                </div>
                <div className="text-xs text-gray-600">{module.name}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentContinue;
