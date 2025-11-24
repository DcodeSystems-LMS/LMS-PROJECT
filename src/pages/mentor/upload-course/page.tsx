
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/base/Card';
import DataService from '@/services/dataService';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import Button from '@/components/base/Button';
import VideoUploadDropzone from '@/components/feature/VideoUploadDropzone';

interface Lesson {
  id: number;
  title: string;
  videoType: 'youtube' | 'upload';
  videoUrl: string;
  videoFile: File | null;
  language: string;
  description: string;
}

interface CourseMaterial {
  id: number;
  title: string;
  description: string;
  file: File | null;
  category: string;
  lessonId?: number;
}

const MentorUploadCourse: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: '',
    coverImage: '',
    duration: '',
    difficulty: 'beginner',
    objectives: [''],
    requirements: [''],
    tags: ''
  });

  const [lessons, setLessons] = useState<Lesson[]>([
    {
      id: 1,
      title: '',
      videoType: 'youtube' as const,
      videoUrl: '',
      videoFile: null,
      language: 'English',
      description: ''
    }
  ]);

  const [draggedLesson, setDraggedLesson] = useState<number | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([
    {
      id: 1,
      title: '',
      description: '',
      file: null,
      category: 'general'
    }
  ]);

  // Initialize data on component mount
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
      
      // Fetch categories from existing courses
      const courses = await DataService.getCourses();
      const uniqueCategories = [...new Set(courses.map(course => course.category))];
      setCategories(uniqueCategories);
      
      console.log('✅ Upload course page initialized');
    } catch (error) {
      console.error('❌ Error initializing upload course page:', error);
      setError('Failed to initialize page. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Course Info', icon: 'ri-information-line' },
    { id: 2, title: 'Lessons', icon: 'ri-video-line' },
    { id: 3, title: 'Materials', icon: 'ri-file-line' },
    { id: 4, title: 'Preview', icon: 'ri-eye-line' }
  ];

  const languages = [
    { value: 'English', label: 'English' },
    { value: 'Telugu', label: 'తెలుగు (Telugu)' },
    { value: 'Hindi', label: 'हिंदी (Hindi)' }
  ];

  const materialCategories = [
    { value: 'general', label: 'General' },
    { value: 'slides', label: 'Lecture Slides' },
    { value: 'handout', label: 'Handouts' },
    { value: 'code', label: 'Code Files' },
    { value: 'reference', label: 'Reference Materials' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'solution', label: 'Solutions' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const addLesson = () => {
    const newLesson: Lesson = {
      id: Date.now(),
      title: '',
      videoType: 'youtube',
      videoUrl: '',
      videoFile: null,
      language: 'English',
      description: ''
    };
    setLessons(prev => [...prev, newLesson]);
  };

  const removeLesson = (id: number) => {
    if (lessons.length === 1) return;
    
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      setLessons(prev => prev.filter(lesson => lesson.id !== id));
    }
  };

  const updateLesson = (id: number, field: keyof Lesson, value: any) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === id ? { ...lesson, [field]: value } : lesson
    ));
  };

  const handleVideoUploaded = (lessonId: number, videoUrl: string, videoFile: File) => {
    console.log('✅ Video uploaded successfully:', { lessonId, videoUrl, videoFile });
    
    // Update the lesson with the uploaded video URL
    setLessons(lessons.map(lesson => 
      lesson.id === lessonId 
        ? { 
            ...lesson, 
            videoUrl: videoUrl,
            videoFile: videoFile,
            videoType: 'upload' as const
          } 
        : lesson
    ));
    
    setSuccess(`Video uploaded successfully: ${videoFile.name}`);
  };

  const handleVideoUploadError = (error: string) => {
    console.error('❌ Video upload error:', error);
    setError(`Video upload failed: ${error}`);
  };

  // Material management functions
  const addMaterial = () => {
    const newMaterial: CourseMaterial = {
      id: Date.now(),
      title: '',
      description: '',
      file: null,
      category: 'general'
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const removeMaterial = (id: number) => {
    if (materials.length === 1) return;
    
    if (window.confirm('Are you sure you want to delete this material?')) {
      setMaterials(prev => prev.filter(material => material.id !== id));
    }
  };

  const updateMaterial = (id: number, field: keyof CourseMaterial, value: any) => {
    setMaterials(prev => prev.map(material => {
      if (material.id === id) {
        // Ensure category is always a string
        if (field === 'category' && typeof value !== 'string') {
          value = String(value || 'general');
        }
        return { ...material, [field]: value };
      }
      return material;
    }));
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

  const validateYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return courseData.title.trim() !== '' && 
               courseData.description.trim() !== '' && 
               courseData.category !== '' && 
               courseData.level !== '' && 
               courseData.price !== '';
      case 2:
        return lessons.every(lesson => {
          const hasTitle = lesson.title.trim() !== '';
          const hasValidVideo = lesson.videoType === 'youtube' 
            ? validateYouTubeUrl(lesson.videoUrl)
            : lesson.videoFile !== null;
          return hasTitle && hasValidVideo;
        });
      default:
        return true;
    }
  };

  const checkDuplicateTitles = () => {
    const titles = lessons.map(l => l.title.trim().toLowerCase()).filter(t => t !== '');
    return titles.length === new Set(titles).size;
  };

  const handleDragStart = (e: React.DragEvent, lessonId: number) => {
    setDraggedLesson(lessonId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    
    if (draggedLesson === null || draggedLesson === targetId) return;

    const draggedIndex = lessons.findIndex(l => l.id === draggedLesson);
    const targetIndex = lessons.findIndex(l => l.id === targetId);

    const newLessons = [...lessons];
    const draggedItem = newLessons.splice(draggedIndex, 1)[0];
    newLessons.splice(targetIndex, 0, draggedItem);

    setLessons(newLessons);
    setDraggedLesson(null);
  };

  const generateThumbnailUrl = (lesson: Lesson) => {
    if (lesson.videoType === 'youtube' && validateYouTubeUrl(lesson.videoUrl)) {
      const videoId = lesson.videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    }
    return null;
  };

  const handleCreateCourse = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!currentUser) {
        setError('You must be logged in to create a course.');
        return;
      }

      console.log('🚀 Creating course with data:', courseData);
      console.log('🚀 Lessons:', lessons);

      // Prepare course data for database
      const courseDataForDB = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        instructor_id: currentUser.id,
        price: parseInt(courseData.price) || 0,
        duration_hours: parseInt(courseData.duration) || 0,
        level: courseData.level.toLowerCase() as "beginner" | "intermediate" | "advanced", // Convert to lowercase for database constraint
        difficulty: courseData.difficulty as "beginner" | "intermediate" | "advanced", // Add missing difficulty field
        objectives: courseData.objectives.filter(obj => obj.trim() !== ''),
        requirements: courseData.requirements.filter(req => req.trim() !== ''),
        tags: courseData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        thumbnail: courseData.coverImage,
        lessons: lessons.map(lesson => ({
          title: lesson.title,
          videoType: lesson.videoType,
          videoUrl: lesson.videoUrl,
          language: lesson.language,
          description: lesson.description
        }))
      };

      console.log('🚀 Course data for database:', courseDataForDB);

      // Create course using DataService
      const createdCourse = await DataService.createCourse(courseDataForDB);
      
      console.log('✅ Course created successfully:', createdCourse);
      
      // Upload materials if any
      if (materials.length > 0 && materials.some(m => m.file && m.title.trim())) {
        console.log('📁 Uploading course materials...');
        const materialsToUpload = materials.filter(m => m.file && m.title.trim());
        
        for (const material of materialsToUpload) {
          if (material.file) {
            try {
              await DataService.uploadCourseMaterial(createdCourse.id, material.file, {
                title: material.title,
                description: material.description,
                category: material.category,
                lessonId: material.lessonId ? parseInt(material.lessonId.toString()) : undefined
              });
              console.log(`✅ Material uploaded: ${material.title}`);
            } catch (materialError) {
              console.error(`❌ Error uploading material ${material.title}:`, materialError);
              // Continue with other materials even if one fails
            }
          }
        }
      }
      
      setSuccess('Course created successfully! Redirecting to courses...');
      
      // Redirect to mentor courses page after 2 seconds
      setTimeout(() => {
        navigate('/mentor/courses');
      }, 2000);

    } catch (error) {
      console.error('❌ Error creating course:', error);
      setError(`Failed to create course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      if (currentStep === 2 && !checkDuplicateTitles()) {
        alert('Please ensure all lesson titles are unique.');
        return;
      }
      alert('Please fill all required fields before proceeding.');
      return;
    }
    setCurrentStep(Math.min(4, currentStep + 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Upload New Course</h1>
        <p className="text-gray-600 mt-1">Create and publish a new course for students</p>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="ri-error-warning-line text-red-400"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="ri-check-line text-green-400"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Optimized Progress Steps */}
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Desktop Steps */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between py-2">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`flex items-center group cursor-pointer transition-all duration-300 ${
                    currentStep === step.id ? 'scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                >
                  {/* Step Circle */}
                  <div className="relative">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                      currentStep > step.id 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : currentStep === step.id
                        ? 'bg-blue-600 border-blue-600 text-white animate-pulse'
                        : 'bg-white border-gray-300 text-gray-400 group-hover:border-blue-300 group-hover:text-blue-400'
                    }`}>
                      {currentStep > step.id ? (
                        <i className="ri-check-line text-sm"></i>
                      ) : (
                        <i className={`${step.icon} text-sm`}></i>
                      )}
                    </div>
                    
                    {/* Step Number Badge */}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.id}
                    </div>
                  </div>
                  
                  {/* Step Title */}
                  <div className="ml-2">
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      currentStep >= step.id 
                        ? 'text-blue-600' 
                        : 'text-gray-500 group-hover:text-blue-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className={`mx-4 w-8 h-0.5 transition-all duration-300 ${
                      currentStep > step.id 
                        ? 'bg-green-400' 
                        : currentStep === step.id
                        ? 'bg-blue-400'
                        : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile Steps - Compact Design */}
          <div className="sm:hidden">
            {/* Mobile Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Step {currentStep} of {steps.length}</span>
                <span className="font-medium text-blue-600">{Math.round((currentStep / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Mobile Step Indicators */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                >
                  {/* Step Circle */}
                  <div className={`relative w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                    currentStep > step.id 
                      ? 'bg-green-500 border-green-500' 
                      : currentStep === step.id 
                      ? 'bg-blue-500 border-blue-500 animate-pulse' 
                      : 'bg-white border-gray-300'
                  }`}>
                    {currentStep > step.id ? (
                      <i className="ri-check-line text-white text-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></i>
                    ) : (
                      <i className={`${step.icon} text-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                        currentStep === step.id ? 'text-white' : 'text-gray-400'
                      }`}></i>
                    )}
                    
                    {/* Step Number */}
                    <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center ${
                      currentStep >= step.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.id}
                    </div>
                  </div>
                  
                  {/* Step Title */}
                  <span className={`text-xs mt-1 text-center font-medium transition-colors duration-300 ${
                    currentStep >= step.id 
                      ? 'text-blue-600' 
                      : currentStep === step.id
                      ? 'text-blue-500'
                      : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-4 left-8 w-6 h-0.5 transition-all duration-300 ${
                      currentStep > step.id 
                        ? 'bg-green-400' 
                        : currentStep === step.id
                        ? 'bg-blue-400'
                        : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Step Content */}
      <Card>
        {/* Step 1: Course Info - Mobile Optimized */}
        {currentStep === 1 && (
          <div className="px-2 sm:px-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Course Information</h2>
            <div className="space-y-3 sm:space-y-4">
              {/* Course Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Course Title *</label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter course title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Description *</label>
                <textarea
                  value={courseData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe what students will learn in this course"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {courseData.description.length}/500 characters
                </div>
              </div>

              {/* Basic Info Grid - Mobile First */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category *</label>
                  <select
                    value={courseData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                  >
                    <option value="">Select Category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Level *</label>
                  <select
                    value={courseData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    value={courseData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="999"
                    min="0"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Duration (Hours)</label>
                <input
                  type="number"
                  value={courseData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                  min="0"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Cover Image URL</label>
                <input
                  type="url"
                  value={courseData.coverImage}
                  onChange={(e) => handleInputChange('coverImage', e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                {courseData.coverImage && (
                  <div className="mt-2">
                    <img 
                      src={courseData.coverImage} 
                      alt="Course cover preview"
                      className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Course Objectives - Mobile Optimized */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Course Objectives</label>
                {courseData.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-1 sm:gap-2 mb-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => {
                        const newObjectives = [...courseData.objectives];
                        newObjectives[index] = e.target.value;
                        setCourseData(prev => ({ ...prev, objectives: newObjectives }));
                      }}
                      className="flex-1 p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Objective ${index + 1}`}
                    />
                    {courseData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newObjectives = courseData.objectives.filter((_, i) => i !== index);
                          setCourseData(prev => ({ ...prev, objectives: newObjectives }));
                        }}
                        className="px-2 sm:px-3 py-2 text-red-600 hover:text-red-700 text-sm"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setCourseData(prev => ({ ...prev, objectives: [...prev.objectives, ''] }))}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Add Objective
                </button>
              </div>

              {/* Course Requirements - Mobile Optimized */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Course Requirements</label>
                {courseData.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-1 sm:gap-2 mb-2">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => {
                        const newRequirements = [...courseData.requirements];
                        newRequirements[index] = e.target.value;
                        setCourseData(prev => ({ ...prev, requirements: newRequirements }));
                      }}
                      className="flex-1 p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Requirement ${index + 1}`}
                    />
                    {courseData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newRequirements = courseData.requirements.filter((_, i) => i !== index);
                          setCourseData(prev => ({ ...prev, requirements: newRequirements }));
                        }}
                        className="px-2 sm:px-3 py-2 text-red-600 hover:text-red-700 text-sm"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setCourseData(prev => ({ ...prev, requirements: [...prev.requirements, ''] }))}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Add Requirement
                </button>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={courseData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="React, JavaScript, Frontend"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Lessons */}
        {currentStep === 2 && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Course Lessons</h2>
                <p className="text-sm text-gray-600">Add lessons and arrange them in order</p>
              </div>
              <Button size="sm" onClick={addLesson}>
                <i className="ri-add-line mr-2"></i>
                Add Lesson
              </Button>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div 
                  key={lesson.id} 
                  className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, lesson.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, lesson.id)}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <i className="ri-drag-move-line text-gray-400 cursor-move"></i>
                        <h3 className="font-medium text-gray-900">Lesson {index + 1}</h3>
                      </div>
                    </div>
                    {lessons.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeLesson(lesson.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Lesson Title and Language */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title *</label>
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter lesson title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                          value={lesson.language}
                          onChange={(e) => updateLesson(lesson.id, 'language', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                        >
                          {languages.map(lang => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Video Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Video Source *</label>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`videoType-${lesson.id}`}
                            value="youtube"
                            checked={lesson.videoType === 'youtube'}
                            onChange={(e) => updateLesson(lesson.id, 'videoType', e.target.value as 'youtube')}
                            className="mr-2"
                          />
                          <span>YouTube URL</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`videoType-${lesson.id}`}
                            value="upload"
                            checked={lesson.videoType === 'upload'}
                            onChange={(e) => updateLesson(lesson.id, 'videoType', e.target.value as 'upload')}
                            className="mr-2"
                          />
                          <span>Upload MP4</span>
                        </label>
                      </div>
                    </div>

                    {/* Video Input */}
                    {lesson.videoType === 'youtube' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL *</label>
                        <input
                          type="url"
                          value={lesson.videoUrl}
                          onChange={(e) => updateLesson(lesson.id, 'videoUrl', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                        {lesson.videoUrl && !validateYouTubeUrl(lesson.videoUrl) && (
                          <div className="text-red-600 text-sm mt-1">Please enter a valid YouTube URL</div>
                        )}
                        {lesson.videoUrl && validateYouTubeUrl(lesson.videoUrl) && (
                          <div className="mt-3">
                            <div className="text-sm text-green-600 mb-2">✓ Valid YouTube URL</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video File *</label>
                        <VideoUploadDropzone
                          lessonId={lesson.id}
                          onVideoUploaded={(videoUrl, videoFile) => handleVideoUploaded(lesson.id, videoUrl, videoFile)}
                          onUploadError={handleVideoUploadError}
                          maxFileSize={500}
                          acceptedFormats={['video/mp4', 'video/webm', 'video/avi', 'video/mov']}
                        />
                      </div>
                    )}

                    {/* Lesson Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                      <textarea
                        value={lesson.description}
                        onChange={(e) => updateLesson(lesson.id, 'description', e.target.value)}
                        rows={2}
                        maxLength={300}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of what this lesson covers"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {lesson.description.length}/300 characters
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {lessons.length === 0 && (
              <div className="text-center py-8">
                <i className="ri-video-line text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No lessons added yet. Click "Add Lesson" to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Materials */}
        {currentStep === 3 && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Course Materials</h2>
                <p className="text-sm text-gray-600">Upload additional materials like slides, handouts, and code files</p>
              </div>
              <Button size="sm" onClick={addMaterial}>
                <i className="ri-add-line mr-2"></i>
                Add Material
              </Button>
            </div>

            {materials.length > 0 ? (
              <div className="space-y-4">
                {materials.map((material, index) => (
                  <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Material {index + 1}</h3>
                          <p className="text-sm text-gray-500">Upload course material</p>
                        </div>
                      </div>
                      {materials.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeMaterial(material.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Material Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Material Title *</label>
                        <input
                          type="text"
                          value={material.title}
                          onChange={(e) => updateMaterial(material.id, 'title', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., CSS Flexbox Lecture Slides"
                        />
                      </div>

                      {/* Material Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={typeof material.category === 'string' ? material.category : 'general'}
                          onChange={(e) => updateMaterial(material.id, 'category', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {materialCategories.map(category => (
                            <option key={category.value} value={category.value}>{category.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload File *</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.txt,.js,.ts,.html,.css,.py,.java,.cpp,.c"
                          onChange={(e) => updateMaterial(material.id, 'file', e.target.files?.[0] || null)}
                          className="hidden"
                          id={`material-upload-${material.id}`}
                        />
                        <label htmlFor={`material-upload-${material.id}`} className="cursor-pointer">
                          {material.file ? (
                            <div className="flex items-center justify-center space-x-3">
                              <i className={`${getFileIcon(material.file.name)} text-2xl text-blue-600`}></i>
                              <div className="text-left">
                                <div className="text-sm font-medium text-gray-900">{material.file.name}</div>
                                <div className="text-xs text-gray-500">{formatFileSize(material.file.size)}</div>
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
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={material.description}
                        onChange={(e) => updateMaterial(material.id, 'description', e.target.value)}
                        rows={2}
                        maxLength={300}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of this material (optional)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="ri-file-line text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No materials added yet. Click "Add Material" to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Preview */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Course Preview</h2>
            
            {/* Course Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {courseData.coverImage && (
                  <div>
                    <img 
                      src={courseData.coverImage} 
                      alt={courseData.title}
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className={courseData.coverImage ? 'lg:col-span-2' : 'lg:col-span-3'}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{courseData.title}</h3>
                  <p className="text-gray-600 mb-4">{courseData.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <i className="ri-bookmark-line mr-1"></i>
                      {String(courseData.category || '')}
                    </span>
                    <span className="flex items-center">
                      <i className="ri-signal-tower-line mr-1"></i>
                      {String(courseData.level || '')}
                    </span>
                    <span className="flex items-center">
                      <i className="ri-money-rupee-circle-line mr-1"></i>
                      ₹{String(courseData.price || '')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} • Multi-language support
                  </div>
                </div>
              </div>
            </div>

            {/* Lessons Preview */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Course Content</h4>
              <div className="space-y-3">
                {lessons.map((lesson, index) => {
                  const thumbnail = generateThumbnailUrl(lesson);
                  return (
                    <div key={lesson.id} className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                      </div>
                      
                      {thumbnail && (
                        <div className="w-16 h-12 mr-4 flex-shrink-0">
                          <img 
                            src={thumbnail} 
                            alt={lesson.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-1 sm:space-y-0">
                          <div>
                            <h5 className="font-medium text-gray-900 truncate">{lesson.title}</h5>
                            {lesson.description && (
                              <p className="text-sm text-gray-600 truncate">{lesson.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <i className="ri-global-line mr-1"></i>
                              {String(lesson.language || '')}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <i className={`${lesson.videoType === 'youtube' ? 'ri-youtube-line' : 'ri-file-video-line'} mr-1`}></i>
                              {lesson.videoType === 'youtube' ? 'YouTube' : 'Upload'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Language Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <i className="ri-translate-line text-green-600 mr-2 mt-0.5"></i>
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Multi-language Course</h4>
                  <p className="text-green-800 text-sm mb-2">
                    Your course includes lessons in multiple languages:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(lessons.map(l => String(l.language || '')))).map(language => (
                      <span key={language} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {language} ({lessons.filter(l => String(l.language || '') === language).length} lesson{lessons.filter(l => String(l.language || '') === language).length !== 1 ? 's' : ''})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Course Materials Preview */}
            {materials.length > 0 && materials.some(m => m.title.trim()) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Materials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials.filter(m => m.title.trim()).map((material, index) => (
                    <div key={material.id} className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <i className={`${material.file ? getFileIcon(material.file.name) : 'ri-file-line'} text-blue-600`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{material.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="capitalize">{String(material.category || '')}</span>
                          {material.file && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(material.file.size)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <i className="ri-information-line mr-1"></i>
                  {materials.filter(m => m.title.trim()).length} material{materials.filter(m => m.title.trim()).length !== 1 ? 's' : ''} will be available for download
                </div>
              </div>
            )}

            {/* Publish Confirmation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <i className="ri-information-line text-blue-600 mr-2 mt-0.5"></i>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Ready to Publish?</h4>
                  <p className="text-blue-800 text-sm">
                    Once published, your course will be available to students. You can always edit the content later from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            fullWidth={window.innerWidth < 640}
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button 
              onClick={nextStep}
              fullWidth={window.innerWidth < 640}
            >
              Next
              <i className="ri-arrow-right-line ml-2"></i>
            </Button>
          ) : (
            <Button
              onClick={handleCreateCourse}
              variant="brand"
              fullWidth={window.innerWidth < 640}
              disabled={loading}
            >
              <i className="ri-upload-line mr-2"></i>
              {loading ? 'Creating Course...' : 'Publish Course'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MentorUploadCourse;
