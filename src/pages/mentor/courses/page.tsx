import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import DataService from '@/services/dataService';
import { authService } from '@/lib/auth';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  duration_hours: number;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
  students_count?: number;
  rating?: number;
  objectives?: string[];
  requirements?: string[];
  tags?: string[];
  lessons?: any[];
}

const MentorCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Modal states
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [addingLesson, setAddingLesson] = useState<Course | null>(null);
  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: '',
    duration_hours: '',
    objectives: [''],
    requirements: [''],
    tags: ''
  });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    videoType: 'youtube' as 'youtube' | 'upload',
    videoUrl: '',
    videoFile: null as File | null,
    language: 'English',
    description: ''
  });
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [draggedLesson, setDraggedLesson] = useState<number | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [lessonSuccess, setLessonSuccess] = useState('');

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        setError('Please log in to view your courses');
        return;
      }
      setCurrentUser(user);
      
      // Fetch courses created by this mentor
      const allCourses = await DataService.getCourses();
      const mentorCourses = allCourses.filter(course => course.instructor_id === user.id);
      setCourses(mentorCourses);
      
      console.log('✅ Mentor courses loaded:', mentorCourses);
    } catch (error) {
      console.error('❌ Error loading mentor courses:', error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewCourse = (course: Course) => {
    console.log('🔍 Viewing course:', course.id);
    setViewingCourse(course);
  };

  const handleEditCourse = (course: Course) => {
    console.log('✏️ Editing course:', course.id);
    setEditingCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price.toString(),
      duration_hours: course.duration_hours.toString(),
      objectives: course.objectives || [''],
      requirements: course.requirements || [''],
      tags: course.tags ? course.tags.join(', ') : ''
    });
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddObjective = () => {
    setEditForm(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const handleRemoveObjective = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const handleAddRequirement = () => {
    setEditForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const handleRemoveRequirement = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingCourse) return;

    try {
      setEditLoading(true);
      setEditSuccess('');

      // Prepare update data
      const updateData = {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        level: editForm.level.toLowerCase(),
        price: parseInt(editForm.price) || 0,
        duration_hours: parseInt(editForm.duration_hours) || 0,
        objectives: editForm.objectives.filter(obj => obj.trim() !== ''),
        requirements: editForm.requirements.filter(req => req.trim() !== ''),
        tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        updated_at: new Date().toISOString()
      };

      console.log('💾 Updating course with data:', updateData);

      // Update course in database
      await DataService.updateCourse(editingCourse.id, updateData);

      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === editingCourse.id 
          ? { ...course, ...updateData }
          : course
      ));

      setEditSuccess('Course updated successfully!');
      setEditingCourse(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setEditSuccess(''), 3000);

    } catch (error) {
      console.error('❌ Error updating course:', error);
      setError('Failed to update course. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddLesson = (course: Course) => {
    console.log('➕ Adding lesson to course:', course.id);
    setAddingLesson(course);
    setShowAddLessonForm(false);
    setLessonForm({
      title: '',
      videoType: 'youtube',
      videoUrl: '',
      videoFile: null,
      language: 'English',
      description: ''
    });
  };

  const handleShowAddLessonForm = () => {
    setShowAddLessonForm(true);
    // Reset form when opening
    setLessonForm({
      title: '',
      videoType: 'youtube',
      videoUrl: '',
      videoFile: null,
      language: 'English',
      description: ''
    });
  };

  const handleLessonFormChange = (field: string, value: any) => {
    setLessonForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleSaveLesson = async () => {
    if (!addingLesson) {
      console.log('❌ No course selected for adding lesson');
      return;
    }

    try {
      setLessonLoading(true);
      setLessonSuccess('');

      // Validate form
      if (!lessonForm.title.trim()) {
        setError('Please enter a lesson title');
        return;
      }

      if (lessonForm.videoType === 'youtube' && !validateYouTubeUrl(lessonForm.videoUrl)) {
        setError('Please enter a valid YouTube URL');
        return;
      }

      if (lessonForm.videoType === 'upload' && !lessonForm.videoFile) {
        setError('Please select a video file');
        return;
      }

      // Get current lessons count to determine new lesson ID
      const currentLessons = addingLesson.lessons || [];
      const newLessonId = currentLessons.length + 1;

      // Create new lesson object
      const newLesson = {
        id: newLessonId,
        title: lessonForm.title,
        videoType: lessonForm.videoType,
        videoUrl: lessonForm.videoUrl,
        language: lessonForm.language,
        description: lessonForm.description
      };

      // Add lesson to course
      const updatedLessons = [...currentLessons, newLesson];
      
      // Update course in database
      await DataService.updateCourse(addingLesson.id, {
        lessons: updatedLessons,
        updated_at: new Date().toISOString()
      });

      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === addingLesson.id 
          ? { ...course, lessons: updatedLessons }
          : course
      ));

      setLessonSuccess('Lesson added successfully!');
      setShowAddLessonForm(false);
      
      // Update the addingLesson state to reflect the new lesson
      setAddingLesson(prev => prev ? {
        ...prev,
        lessons: updatedLessons
      } : null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setLessonSuccess(''), 3000);

    } catch (error) {
      console.error('❌ Error adding lesson:', error);
      setError('Failed to add lesson. Please try again.');
    } finally {
      setLessonLoading(false);
    }
  };

  const handleEditLesson = (lesson: any, course: Course) => {
    console.log('✏️ Editing lesson:', lesson.id);
    setEditingLesson({ ...lesson, courseId: course.id });
    setLessonForm({
      title: lesson.title,
      videoType: lesson.videoType,
      videoUrl: lesson.videoUrl,
      videoFile: null,
      language: lesson.language,
      description: lesson.description
    });
  };

  const handleSaveLessonEdit = async () => {
    if (!editingLesson) return;

    try {
      setLessonLoading(true);
      setLessonSuccess('');

      // Validate form
      if (!lessonForm.title.trim()) {
        setError('Please enter a lesson title');
        return;
      }

      if (lessonForm.videoType === 'youtube' && !validateYouTubeUrl(lessonForm.videoUrl)) {
        setError('Please enter a valid YouTube URL');
        return;
      }

      // Find the course
      const course = courses.find(c => c.id === editingLesson.courseId);
      if (!course) return;

      // Update the lesson in the lessons array
      const updatedLessons = course.lessons?.map(lesson => 
        lesson.id === editingLesson.id 
          ? {
              ...lesson,
              title: lessonForm.title,
              videoType: lessonForm.videoType,
              videoUrl: lessonForm.videoUrl,
              language: lessonForm.language,
              description: lessonForm.description
            }
          : lesson
      ) || [];

      // Update course in database
      await DataService.updateCourse(editingLesson.courseId, {
        lessons: updatedLessons,
        updated_at: new Date().toISOString()
      });

      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === editingLesson.courseId 
          ? { ...course, lessons: updatedLessons }
          : course
      ));

      setLessonSuccess('Lesson updated successfully!');
      setEditingLesson(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setLessonSuccess(''), 3000);

    } catch (error) {
      console.error('❌ Error updating lesson:', error);
      setError('Failed to update lesson. Please try again.');
    } finally {
      setLessonLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, lessonId: number) => {
    setDraggedLesson(lessonId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: number, courseId: string) => {
    e.preventDefault();
    
    if (draggedLesson === null || draggedLesson === targetId) return;

    const course = courses.find(c => c.id === courseId);
    if (!course || !course.lessons) return;

    const draggedIndex = course.lessons.findIndex(l => l.id === draggedLesson);
    const targetIndex = course.lessons.findIndex(l => l.id === targetId);

    const newLessons = [...course.lessons];
    const draggedItem = newLessons.splice(draggedIndex, 1)[0];
    newLessons.splice(targetIndex, 0, draggedItem);

    // Update lesson IDs to match new order
    const reorderedLessons = newLessons.map((lesson, index) => ({
      ...lesson,
      id: index + 1
    }));

    try {
      // Update course in database
      await DataService.updateCourse(courseId, {
        lessons: reorderedLessons,
        updated_at: new Date().toISOString()
      });

      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, lessons: reorderedLessons }
          : course
      ));

      setLessonSuccess('Lessons reordered successfully!');
      setTimeout(() => setLessonSuccess(''), 3000);

    } catch (error) {
      console.error('❌ Error reordering lessons:', error);
      setError('Failed to reorder lessons. Please try again.');
    }

    setDraggedLesson(null);
  };

  const handleDeleteCourse = async (course: Course) => {
    try {
      setDeleteLoading(true);
      
      console.log('🗑️ Attempting to delete course:', course.id, course.title);
      
      // Delete course from database
      await DataService.deleteCourse(course.id);
      
      console.log('✅ Course deleted from database successfully');
      
      // Update local state
      setCourses(prev => prev.filter(c => c.id !== course.id));
      
      setEditSuccess('Course deleted successfully!');
      setTimeout(() => setEditSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      console.error('❌ Error details:', error.message);
      setError(`Failed to delete course: ${error.message}`);
    } finally {
      setDeleteLoading(false);
      setDeletingCourse(null);
    }
  };

  const handleCloseModals = () => {
    setViewingCourse(null);
    setEditingCourse(null);
    setAddingLesson(null);
    setEditingLesson(null);
    setDeletingCourse(null);
    setShowAddLessonForm(false);
    setEditSuccess('');
    setLessonSuccess('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <div className="text-red-600 mb-4">
              <i className="ri-error-warning-line text-4xl"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Courses</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={initializeData} variant="outline">
              <i className="ri-refresh-line mr-2"></i>
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <p className="mt-2 text-gray-600">
                Manage and track your own published courses
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                onClick={() => window.location.href = '/mentor/all-courses'}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                <i className="ri-book-2-line mr-2"></i>
                All Courses
              </Button>
              <Button
                onClick={() => window.location.href = '/mentor/upload-course'}
                variant="neon"
              >
                <i className="ri-add-line mr-2"></i>
                Create New Course
              </Button>
              <Button
                onClick={initializeData}
                variant="outline"
              >
                <i className="ri-refresh-line mr-2"></i>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <i className="ri-book-open-line text-2xl text-blue-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <i className="ri-user-line text-2xl text-green-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.reduce((sum, course) => sum + (course.students_count || 0), 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <i className="ri-money-rupee-circle-line text-2xl text-yellow-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(courses.reduce((sum, course) => sum + (course.price * (course.students_count || 0)), 0))}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <i className="ri-star-line text-2xl text-purple-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {courses.length > 0 
                    ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <i className="ri-book-open-line text-6xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
            <p className="text-gray-600 mb-6">
              Start creating your first course to share your knowledge with students.
            </p>
            <Button
              onClick={() => window.location.href = '/mentor/upload-course'}
              variant="neon"
            >
              <i className="ri-add-line mr-2"></i>
              Create Your First Course
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Course Thumbnail */}
                <div className="aspect-video bg-gray-200 relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="ri-book-open-line text-4xl text-gray-400"></i>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                      {course.level}
                    </span>
                  </div>
                  
                  {/* Delete Badge */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => setDeletingCourse(course)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                      title="Delete Course"
                    >
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <div className="mb-3">
                    <span className="text-sm text-blue-600 font-medium">{course.category}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <i className="ri-time-line mr-1"></i>
                      <span>{course.duration_hours}h</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-user-line mr-1"></i>
                      <span>{course.students_count || 0} students</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-star-line mr-1"></i>
                      <span>{course.rating || 0}</span>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-gray-900">
                      {formatPrice(course.price)}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddLesson(course)}
                        title="Add New Lesson"
                        className="text-green-600 hover:text-green-700 hover:border-green-300"
                      >
                        <i className="ri-add-line"></i>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                        title="Edit Course"
                      >
                        <i className="ri-edit-line"></i>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/mentor/materials?course=${course.id}`)}
                        title="Manage Materials"
                      >
                        <i className="ri-file-line"></i>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCourse(course)}
                        title="View Course Details"
                      >
                        <i className="ri-eye-line"></i>
                      </Button>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Created on {formatDate(course.created_at)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Success Messages */}
        {editSuccess && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
            <div className="flex items-center">
              <i className="ri-check-line mr-2"></i>
              {editSuccess}
            </div>
          </div>
        )}
        
        {lessonSuccess && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
            <div className="flex items-center">
              <i className="ri-check-line mr-2"></i>
              {lessonSuccess}
            </div>
          </div>
        )}

        {/* View Course Modal */}
        {viewingCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Course Details</h2>
                  <button
                    onClick={handleCloseModals}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                {/* Course Header */}
                <div className="mb-6">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4 relative">
                    {viewingCourse.thumbnail ? (
                      <img
                        src={viewingCourse.thumbnail}
                        alt={viewingCourse.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="ri-book-open-line text-6xl text-gray-400"></i>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {viewingCourse.level}
                      </span>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{viewingCourse.title}</h1>
                  <p className="text-gray-600 text-lg">{viewingCourse.description}</p>
                </div>

                {/* Course Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                      <p className="text-gray-900">{viewingCourse.category}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Duration</h3>
                      <p className="text-gray-900">{viewingCourse.duration_hours} hours</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Price</h3>
                      <p className="text-gray-900 text-xl font-bold">{formatPrice(viewingCourse.price)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Students</h3>
                      <p className="text-gray-900">{viewingCourse.students_count || 0} enrolled</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Rating</h3>
                      <p className="text-gray-900">{viewingCourse.rating || 0}/5</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                      <p className="text-gray-900">{formatDate(viewingCourse.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Objectives */}
                {viewingCourse.objectives && viewingCourse.objectives.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Objectives</h3>
                    <ul className="space-y-2">
                      {viewingCourse.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <i className="ri-check-line text-green-600 mt-1 mr-2"></i>
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Requirements */}
                {viewingCourse.requirements && viewingCourse.requirements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {viewingCourse.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <i className="ri-arrow-right-line text-blue-600 mt-1 mr-2"></i>
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {viewingCourse.tags && viewingCourse.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingCourse.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lessons */}
                {viewingCourse.lessons && viewingCourse.lessons.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Lessons ({viewingCourse.lessons.length})</h3>
                    <div className="space-y-3">
                      {viewingCourse.lessons.map((lesson, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                              {lesson.description && (
                                <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lesson.videoType === 'youtube' ? (
                                <i className="ri-youtube-line text-red-600"></i>
                              ) : (
                                <i className="ri-video-line text-blue-600"></i>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleCloseModals}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handleCloseModals();
                      handleEditCourse(viewingCourse);
                    }}
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Edit Course
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Course Modal */}
        {editingCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Course</h2>
                  <button
                    onClick={handleCloseModals}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => handleEditFormChange('title', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter course title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => handleEditFormChange('category', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="DevOps">DevOps</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => handleEditFormChange('description', e.target.value)}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
                      <select
                        value={editForm.level}
                        onChange={(e) => handleEditFormChange('level', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => handleEditFormChange('price', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Hours) *</label>
                      <input
                        type="number"
                        value={editForm.duration_hours}
                        onChange={(e) => handleEditFormChange('duration_hours', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10"
                      />
                    </div>
                  </div>

                  {/* Objectives */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Objectives</label>
                    <div className="space-y-2">
                      {editForm.objectives.map((objective, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={objective}
                            onChange={(e) => {
                              const newObjectives = [...editForm.objectives];
                              newObjectives[index] = e.target.value;
                              handleEditFormChange('objectives', newObjectives);
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter objective"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveObjective(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddObjective}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <i className="ri-add-line mr-1"></i>
                        Add Objective
                      </button>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Requirements</label>
                    <div className="space-y-2">
                      {editForm.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={requirement}
                            onChange={(e) => {
                              const newRequirements = [...editForm.requirements];
                              newRequirements[index] = e.target.value;
                              handleEditFormChange('requirements', newRequirements);
                            }}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter requirement"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddRequirement}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <i className="ri-add-line mr-1"></i>
                        Add Requirement
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={(e) => handleEditFormChange('tags', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter tags separated by commas"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleCloseModals}
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <React.Fragment key="edit-loading">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </React.Fragment>
                    ) : (
                      <React.Fragment key="edit-save">
                        <i className="ri-save-line mr-2"></i>
                        Save Changes
                      </React.Fragment>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Management Modal */}
        {addingLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Manage Lessons</h2>
                    <p className="text-gray-600 mt-1">Manage lessons for "{addingLesson.title}"</p>
                  </div>
                  <button
                    onClick={handleCloseModals}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                {/* Add New Lesson Section - At Top */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">
                        Add New Lesson (Lesson {(addingLesson.lessons?.length || 0) + 1})
                      </h3>
                      <p className="text-sm text-green-600 mt-1">Click the action button to add a new lesson</p>
                    </div>
                    <Button
                      onClick={handleShowAddLessonForm}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <i className="ri-add-line mr-2"></i>
                      Add Lesson {(addingLesson.lessons?.length || 0) + 1}
                    </Button>
                  </div>
                </div>

                {/* Existing Lessons */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Existing Lessons ({addingLesson.lessons?.length || 0})
                  </h3>
                  
                  {addingLesson.lessons && addingLesson.lessons.length > 0 ? (
                    <div className="space-y-3">
                      {addingLesson.lessons.map((lesson: any, index: number) => (
                        <div
                          key={lesson.id}
                          className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-move"
                          draggable
                          onDragStart={(e) => handleDragStart(e, lesson.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, lesson.id, addingLesson.id)}
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="flex items-center space-x-2">
                              <i className="ri-drag-move-line text-gray-400"></i>
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">{lesson.id}</span>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                              {lesson.description && (
                                <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <i className="ri-global-line mr-1"></i>
                                  {lesson.language}
                                </span>
                                <span className="flex items-center">
                                  <i className={`${lesson.videoType === 'youtube' ? 'ri-youtube-line text-red-600' : 'ri-video-line text-blue-600'} mr-1`}></i>
                                  {lesson.videoType === 'youtube' ? 'YouTube' : 'Upload'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditLesson(lesson, addingLesson)}
                              title="Edit Lesson"
                            >
                              <i className="ri-edit-line"></i>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <i className="ri-video-line text-4xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">No lessons added yet</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleCloseModals}
                    disabled={lessonLoading}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Lesson Form Modal */}
        {showAddLessonForm && addingLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Add New Lesson</h2>
                    <p className="text-gray-600 mt-1">Add Lesson {(addingLesson.lessons?.length || 0) + 1} to "{addingLesson.title}"</p>
                  </div>
                  <button
                    onClick={() => setShowAddLessonForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Lesson Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title *</label>
                    <input
                      type="text"
                      value={lessonForm.title}
                      onChange={(e) => handleLessonFormChange('title', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter lesson title"
                    />
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={lessonForm.language}
                      onChange={(e) => handleLessonFormChange('language', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Telugu">తెలుగు (Telugu)</option>
                      <option value="Hindi">हिंदी (Hindi)</option>
                    </select>
                  </div>

                  {/* Video Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Video Source *</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="videoType"
                          value="youtube"
                          checked={lessonForm.videoType === 'youtube'}
                          onChange={(e) => handleLessonFormChange('videoType', e.target.value)}
                          className="mr-2"
                        />
                        <span>YouTube URL</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="videoType"
                          value="upload"
                          checked={lessonForm.videoType === 'upload'}
                          onChange={(e) => handleLessonFormChange('videoType', e.target.value)}
                          className="mr-2"
                        />
                        <span>Upload MP4</span>
                      </label>
                    </div>
                  </div>

                  {/* Video Input */}
                  {lessonForm.videoType === 'youtube' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL *</label>
                      <input
                        type="url"
                        value={lessonForm.videoUrl}
                        onChange={(e) => handleLessonFormChange('videoUrl', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      {lessonForm.videoUrl && !validateYouTubeUrl(lessonForm.videoUrl) && (
                        <div className="text-red-600 text-sm mt-1">Please enter a valid YouTube URL</div>
                      )}
                      {lessonForm.videoUrl && validateYouTubeUrl(lessonForm.videoUrl) && (
                        <div className="text-green-600 text-sm mt-1">✓ Valid YouTube URL</div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video File *</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="video/mp4"
                          onChange={(e) => handleLessonFormChange('videoFile', e.target.files?.[0] || null)}
                          className="hidden"
                          id="video-upload"
                        />
                        <label htmlFor="video-upload" className="cursor-pointer">
                          <i className="ri-upload-cloud-line text-3xl text-gray-400 mb-2"></i>
                          <div className="text-gray-600">
                            Drop your MP4 file here or <span className="text-blue-600">click to browse</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Maximum file size: 500MB</div>
                        </label>
                        {lessonForm.videoFile && (
                          <div className="mt-3 text-sm text-green-600">
                            ✓ File selected: {lessonForm.videoFile.name}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lesson Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={lessonForm.description}
                      onChange={(e) => handleLessonFormChange('description', e.target.value)}
                      rows={3}
                      maxLength={300}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of what this lesson covers"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {lessonForm.description.length}/300 characters
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddLessonForm(false)}
                    disabled={lessonLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveLesson}
                    disabled={lessonLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {lessonLoading ? (
                      <React.Fragment key="lesson-loading">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding Lesson...
                      </React.Fragment>
                    ) : (
                      <React.Fragment key="lesson-add">
                        <i className="ri-add-line mr-2"></i>
                        Add Lesson {(addingLesson.lessons?.length || 0) + 1}
                      </React.Fragment>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Lesson Modal */}
        {editingLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Lesson {editingLesson.id}</h2>
                    <p className="text-gray-600 mt-1">Update lesson details</p>
                  </div>
                  <button
                    onClick={() => setEditingLesson(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Lesson Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title *</label>
                    <input
                      type="text"
                      value={lessonForm.title}
                      onChange={(e) => handleLessonFormChange('title', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter lesson title"
                    />
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={lessonForm.language}
                      onChange={(e) => handleLessonFormChange('language', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Telugu">తెలుగు (Telugu)</option>
                      <option value="Hindi">हिंदी (Hindi)</option>
                    </select>
                  </div>

                  {/* Video Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Video Source *</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="editVideoType"
                          value="youtube"
                          checked={lessonForm.videoType === 'youtube'}
                          onChange={(e) => handleLessonFormChange('videoType', e.target.value)}
                          className="mr-2"
                        />
                        <span>YouTube URL</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="editVideoType"
                          value="upload"
                          checked={lessonForm.videoType === 'upload'}
                          onChange={(e) => handleLessonFormChange('videoType', e.target.value)}
                          className="mr-2"
                        />
                        <span>Upload MP4</span>
                      </label>
                    </div>
                  </div>

                  {/* Video Input */}
                  {lessonForm.videoType === 'youtube' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL *</label>
                      <input
                        type="url"
                        value={lessonForm.videoUrl}
                        onChange={(e) => handleLessonFormChange('videoUrl', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      {lessonForm.videoUrl && !validateYouTubeUrl(lessonForm.videoUrl) && (
                        <div className="text-red-600 text-sm mt-1">Please enter a valid YouTube URL</div>
                      )}
                      {lessonForm.videoUrl && validateYouTubeUrl(lessonForm.videoUrl) && (
                        <div className="text-green-600 text-sm mt-1">✓ Valid YouTube URL</div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video File *</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="video/mp4"
                          onChange={(e) => handleLessonFormChange('videoFile', e.target.files?.[0] || null)}
                          className="hidden"
                          id="edit-video-upload"
                        />
                        <label htmlFor="edit-video-upload" className="cursor-pointer">
                          <i className="ri-upload-cloud-line text-3xl text-gray-400 mb-2"></i>
                          <div className="text-gray-600">
                            Drop your MP4 file here or <span className="text-blue-600">click to browse</span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Maximum file size: 500MB</div>
                        </label>
                        {lessonForm.videoFile && (
                          <div className="mt-3 text-sm text-green-600">
                            ✓ File selected: {lessonForm.videoFile.name}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Lesson Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={lessonForm.description}
                      onChange={(e) => handleLessonFormChange('description', e.target.value)}
                      rows={3}
                      maxLength={300}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief description of what this lesson covers"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {lessonForm.description.length}/300 characters
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setEditingLesson(null)}
                    disabled={lessonLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveLessonEdit}
                    disabled={lessonLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {lessonLoading ? (
                      <React.Fragment key="lesson-update-loading">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </React.Fragment>
                    ) : (
                      <React.Fragment key="lesson-update-save">
                        <i className="ri-save-line mr-2"></i>
                        Update Lesson
                      </React.Fragment>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <i className="ri-error-warning-line text-3xl text-red-500"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Delete Course</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone.</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700">
                    Are you sure you want to delete <strong>"{deletingCourse.title}"</strong>? 
                    This will permanently remove the course and all its lessons.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeletingCourse(null)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleDeleteCourse(deletingCourse)}
                    disabled={deleteLoading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleteLoading ? (
                      <React.Fragment key="delete-loading">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </React.Fragment>
                    ) : (
                      <React.Fragment key="delete-confirm">
                        <i className="ri-delete-bin-line mr-2"></i>
                        Delete Course
                      </React.Fragment>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorCourses;
