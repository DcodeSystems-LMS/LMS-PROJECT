import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';
import DataService from '@/services/dataService';
import { authService } from '@/lib/auth';
import type { ExtendedCourse, ExtendedCourseMaterial } from '@/services/dataService';

interface CourseMaterial {
  id: number;
  title: string;
  description: string;
  file: File | null;
  category: string;
  lessonId?: number;
}

const MentorMaterials: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ExtendedCourse | null>(null);
  const [materials, setMaterials] = useState<ExtendedCourseMaterial[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [filterLesson, setFilterLesson] = useState<number | 'all'>('all');
  
  const [newMaterial, setNewMaterial] = useState<CourseMaterial>({
    id: Date.now(),
    title: '',
    description: '',
    file: null,
    category: 'general'
  });

  const materialCategories = [
    { value: 'general', label: 'General' },
    { value: 'slides', label: 'Lecture Slides' },
    { value: 'handout', label: 'Handouts' },
    { value: 'code', label: 'Code Files' },
    { value: 'reference', label: 'Reference Materials' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'solution', label: 'Solutions' },
    { value: 'video', label: 'Video Materials' },
    { value: 'audio', label: 'Audio Materials' },
    { value: 'image', label: 'Images' }
  ];

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        navigate('/auth/signin');
        return;
      }
      setCurrentUser(user);
      
      // Fetch mentor's courses
      const allCourses = await DataService.getCourses();
      const mentorCourses = allCourses.filter(course => course.instructor_id === user.id);
      setCourses(mentorCourses);
      
      // Check if a specific course is requested via URL parameter
      const courseId = searchParams.get('course');
      if (courseId) {
        const course = mentorCourses.find(c => c.id === courseId);
        if (course) {
          handleCourseSelect(course);
        }
      }
      
      console.log('✅ Materials page initialized');
    } catch (error) {
      console.error('❌ Error initializing materials page:', error);
      setError('Failed to initialize page. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseMaterials = async (courseId: string) => {
    try {
      setLoading(true);
      const courseMaterials = await DataService.getCourseMaterials(courseId);
      setMaterials(courseMaterials);
      console.log('✅ Course materials loaded:', courseMaterials);
    } catch (error) {
      console.error('❌ Error loading course materials:', error);
      setError('Failed to load course materials.');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseLessons = (course: ExtendedCourse) => {
    if (course.lessons && Array.isArray(course.lessons)) {
      const lessons = course.lessons.map((lesson: any, index: number) => ({
        id: index + 1,
        title: lesson.title || `Lesson ${index + 1}`,
        description: lesson.description || '',
        videoType: lesson.videoType || 'youtube',
        videoUrl: lesson.videoUrl || ''
      }));
      setCourseLessons(lessons);
    } else {
      setCourseLessons([]);
    }
  };

  const handleCourseSelect = (course: ExtendedCourse) => {
    setSelectedCourse(course);
    loadCourseMaterials(course.id);
    loadCourseLessons(course);
    setFilterLesson('all'); // Reset filter when course changes
  };

  const handleFileChange = (file: File | null) => {
    setNewMaterial(prev => ({ ...prev, file }));
  };

  const handleUploadMaterial = async () => {
    if (!selectedCourse || !newMaterial.file || !newMaterial.title.trim()) {
      setError('Please select a course, provide a title, and choose a file.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const result = await DataService.uploadCourseMaterial(selectedCourse.id, newMaterial.file, {
        title: newMaterial.title,
        description: newMaterial.description,
        category: newMaterial.category,
        lessonId: newMaterial.lessonId ? parseInt(newMaterial.lessonId.toString()) : undefined
      });

      if (result.error) {
        throw new Error(result.error.message || 'Upload failed');
      }

      setSuccess('Material uploaded successfully!');
      setShowUploadModal(false);
      setNewMaterial({
        id: Date.now(),
        title: '',
        description: '',
        file: null,
        category: 'general'
      });

      // Reload materials
      await loadCourseMaterials(selectedCourse.id);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Error uploading material:', error);
      setError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      const result = await DataService.deleteCourseMaterial(materialId);
      if (result.error) {
        throw new Error(result.error.message || 'Delete failed');
      }

      setSuccess('Material deleted successfully!');
      if (selectedCourse) {
        await loadCourseMaterials(selectedCourse.id);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Error deleting material:', error);
      setError(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <SimpleDCODESpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Course Materials</h1>
        <p className="text-gray-600 mt-1">Upload and manage materials for your courses</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <i className="ri-check-circle-line text-green-600 mr-2 mt-0.5"></i>
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <i className="ri-error-warning-line text-red-600 mr-2 mt-0.5"></i>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Course Selection */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Course</h2>
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <i className="ri-book-line text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No courses found. Create a course first to upload materials.</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/mentor/upload-course')}
            >
              <i className="ri-add-line mr-2"></i>
              Create New Course
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedCourse?.id === course.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleCourseSelect(course)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{course.title}</h3>
                  {selectedCourse?.id === course.id && (
                    <i className="ri-check-line text-blue-600 ml-2"></i>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{course.level}</span>
                  <span>{course.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Materials Management */}
      {selectedCourse && (
        <Card>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Materials for {selectedCourse.title}</h2>
              <p className="text-sm text-gray-600">Upload and manage course materials</p>
            </div>
            <Button onClick={() => setShowUploadModal(true)}>
              <i className="ri-upload-line mr-2"></i>
              Upload Material
            </Button>
          </div>

          {/* Filter by Lesson */}
          {courseLessons.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Lesson</label>
              <select
                value={filterLesson}
                onChange={(e) => setFilterLesson(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Materials</option>
                <option value="general">General Course Materials</option>
                {courseLessons.map(lesson => (
                  <option key={lesson.id} value={lesson.id}>
                    Lesson {lesson.id}: {lesson.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <i className="ri-loader-4-line text-2xl text-gray-400 animate-spin mb-2"></i>
              <p className="text-gray-500">Loading materials...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-file-line text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No materials uploaded yet.</p>
              <p className="text-sm text-gray-400 mt-1">Click "Upload Material" to get started.</p>
            </div>
          ) : (
            <div>
              {(() => {
                const filteredMaterials = materials.filter(material => {
                  if (filterLesson === 'all') return true;
                  if (filterLesson === 'general') return !material.lesson_id;
                  return material.lesson_id === filterLesson;
                });

                return (
                  <>
                    <div className="mb-4 text-sm text-gray-600">
                      Showing {filteredMaterials.length} of {materials.length} materials
                    </div>
                    <div className="space-y-4">
                      {filteredMaterials.map((material) => (
                <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={`${getFileIcon(material.file_name)} text-blue-600`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">{material.title}</h3>
                        {material.description && (
                          <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="capitalize">{material.category}</span>
                          <span>•</span>
                          <span>{formatFileSize(material.file_size)}</span>
                          {material.lesson_id && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">
                                Lesson {material.lesson_id}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span>{material.download_count} downloads</span>
                          <span>•</span>
                          <span>Uploaded {formatDate(material.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </div>
                </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <div className="p-6 max-w-2xl">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <i className="ri-upload-cloud-line text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Upload Course Material</h3>
              <p className="text-sm text-gray-600">{selectedCourse?.title}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Material Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material Title *</label>
              <input
                type="text"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., CSS Flexbox Lecture Slides"
              />
            </div>

            {/* Material Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newMaterial.category}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {materialCategories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            {/* Lesson Selection */}
            {courseLessons.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link to Specific Lesson (Optional)</label>
                <select
                  value={newMaterial.lessonId || ''}
                  onChange={(e) => setNewMaterial(prev => ({ 
                    ...prev, 
                    lessonId: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">General Course Material</option>
                  {courseLessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      Lesson {lesson.id}: {lesson.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select a specific lesson to link this material to, or leave as "General Course Material"
                </p>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.txt,.js,.ts,.html,.css,.py,.java,.cpp,.c"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  id="material-upload"
                />
                <label htmlFor="material-upload" className="cursor-pointer">
                  {newMaterial.file ? (
                    <div className="flex items-center justify-center space-x-3">
                      <i className={`${getFileIcon(newMaterial.file.name)} text-2xl text-blue-600`}></i>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">{newMaterial.file.name}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(newMaterial.file.size)}</div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <i className="ri-upload-cloud-line text-3xl sm:text-4xl text-gray-400 mb-2"></i>
                      <div className="text-gray-600">
                        Drop your file here or <span className="text-blue-600">click to browse</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Supports: PDF, DOC, PPT, XLS, ZIP, Images, Videos, Audio, Code files
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Maximum file size: 100MB</div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Material Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newMaterial.description}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                maxLength={500}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of this material (optional)"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleUploadMaterial}
              disabled={!newMaterial.file || !newMaterial.title.trim() || uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <i className="ri-loader-4-line mr-2 animate-spin"></i>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="ri-upload-line mr-2"></i>
                  Upload Material
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MentorMaterials;
