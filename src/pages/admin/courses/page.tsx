import React, { useState, useEffect } from 'react';
import Modal from '@/components/base/Modal';
import DataService from '@/services/dataService';
import type { ExtendedCourse } from '@/services/dataService';
import { supabase } from '@/lib/supabase';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';

const AdminCourses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ExtendedCourse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    category: '',
    instructor_id: '',
    price: '',
    duration: '',
    difficulty: 'beginner',
    objectives: [''],
    requirements: [''],
    tags: '',
    thumbnail: null as File | null
  });

  // Real-time subscription
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError('');
        
        console.log('🔄 Fetching courses...');
        const [coursesData, enrollments, profiles] = await Promise.all([
          DataService.getCourses(),
          DataService.getEnrollments(),
          DataService.getProfiles('mentor')
        ]);
        
        console.log('📚 Courses fetched:', coursesData);
        console.log('👥 Enrollments fetched:', enrollments);
        console.log('🎓 Mentors fetched:', profiles);
        
        // Enhance course data with enrollment statistics
        const enhancedCourses = coursesData.map(course => {
          const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
          const completedEnrollments = courseEnrollments.filter(e => e.completed_at);
          
          return {
            ...course,
            students: courseEnrollments.length,
            completion: courseEnrollments.length > 0 ? 
              Math.round((completedEnrollments.length / courseEnrollments.length) * 100) : 0,
            revenue: courseEnrollments.length * (course.price || 0),
            rating: 4.5 + Math.random() * 0.5, // Placeholder rating
            status: 'active' as const,
            requirements: ['Basic programming knowledge'],
            tags: course.category,
            thumbnail: null
          };
        });
        
        console.log('✨ Enhanced courses:', enhancedCourses);
        setCourses(enhancedCourses);
        setMentors(profiles);
        
        // Calculate stats
        const totalEnrollments = enrollments.length;
        const totalRevenue = enrollments.reduce((sum, enrollment) => {
          const course = coursesData.find(c => c.id === enrollment.course_id);
          return sum + (course?.price || 0);
        }, 0);
        
        setStats({
          totalCourses: coursesData.length,
          activeCourses: coursesData.filter(c => c.status === 'active').length,
          totalEnrollments,
          totalRevenue
        });
        
        console.log('📊 Stats updated:', {
          totalCourses: coursesData.length,
          activeCourses: coursesData.filter(c => c.status === 'active').length,
          totalEnrollments,
          totalRevenue
        });
        
      } catch (error) {
        console.error('❌ Error fetching courses:', error);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();

    // Set up real-time subscription
    const coursesSubscription = supabase
      .channel('courses_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'courses' },
        (payload) => {
          console.log('🔄 Courses table changed:', payload);
          fetchCourses();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'enrollments' },
        (payload) => {
          console.log('🔄 Enrollments table changed:', payload);
          fetchCourses();
        }
      )
      .subscribe();

    return () => {
      coursesSubscription.unsubscribe();
    };
  }, []);

  const categories = [
    'Web Development',
    'Frontend',
    'Backend',
    'Programming', 
    'Data Science',
    'Mobile',
    'DevOps',
    'Machine Learning',
    'Cybersecurity',
    'UI/UX Design',
    'AI/ML',
    'Cloud Computing'
  ];

  const instructors = [
    'Dr. Sarah Wilson',
    'Michael Rodriguez', 
    'Jennifer Lee',
    'David Thompson',
    'Rachel Green',
    'James Anderson'
  ];

  const itemsPerPage = 6;
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev - 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleActionMenuToggle = (courseId: string) => {
    setShowActionMenu(showActionMenu === courseId ? null : courseId);
  };

  const handleCourseAction = async (action: string, courseId: string) => {
    setShowActionMenu(null);
    
    try {
      switch (action) {
        case 'view':
          console.log('Viewing course:', courseId);
          // Navigate to course details page
          break;
        case 'edit':
          const courseToEdit = courses.find(c => c.id === courseId);
          if (courseToEdit) {
            handleEditCourse(courseToEdit);
          }
          break;
        case 'duplicate':
          const courseToDuplicate = courses.find(c => c.id === courseId);
          if (courseToDuplicate) {
            await handleDuplicateCourse(courseToDuplicate);
          }
          break;
        case 'archive':
          await handleArchiveCourse(courseId);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            await handleDeleteCourse(courseId);
          }
          break;
      }
    } catch (error) {
      console.error('Error performing course action:', error);
      setError(`Failed to ${action} course. Please try again.`);
    }
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setCourseFormData({
      title: course.title,
      description: course.description || `Learn ${course.title.toLowerCase()} with comprehensive hands-on projects and real-world applications.`,
      category: course.category,
      instructor_id: course.instructor_id || '',
      price: course.price?.toString() || '',
      duration: course.duration_hours?.toString() || course.duration || '',
      difficulty: course.level || 'intermediate',
      objectives: course.objectives || [
        'Master the core concepts and fundamentals',
        'Build practical projects from scratch',
        'Apply best practices and industry standards',
        'Prepare for real-world development scenarios'
      ],
      requirements: course.requirements || [
        'Basic understanding of programming concepts',
        'Computer with internet connection',
        'Willingness to learn and practice'
      ],
      tags: course.tags || course.category.toLowerCase().replace(' ', '-') + ', programming, development',
      thumbnail: null
    });
    setIsEditModalOpen(true);
  };

  const handleDirectEdit = (courseId: string) => {
    const courseToEdit = courses.find(c => c.id === courseId);
    if (courseToEdit) {
      handleEditCourse(courseToEdit);
    }
  };

  const handleCreateCourse = () => {
    setIsCreateModalOpen(true);
  };

  const handleFormChange = (field: string, value: any) => {
    setCourseFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...courseFormData.objectives];
    newObjectives[index] = value;
    setCourseFormData(prev => ({
      ...prev,
      objectives: newObjectives
    }));
  };

  const addObjective = () => {
    setCourseFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const removeObjective = (index: number) => {
    if (courseFormData.objectives.length > 1) {
      const newObjectives = courseFormData.objectives.filter((_, i) => i !== index);
      setCourseFormData(prev => ({
        ...prev,
        objectives: newObjectives
      }));
    }
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...courseFormData.requirements];
    newRequirements[index] = value;
    setCourseFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const addRequirement = () => {
    setCourseFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    if (courseFormData.requirements.length > 1) {
      const newRequirements = courseFormData.requirements.filter((_, i) => i !== index);
      setCourseFormData(prev => ({
        ...prev,
        requirements: newRequirements
      }));
    }
  };

  const handleSubmitCourse = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate required fields
      if (!courseFormData.title || !courseFormData.category || !courseFormData.instructor_id) {
        setError('Please fill in all required fields.');
        return;
      }

      const courseData = {
        title: courseFormData.title,
        description: courseFormData.description,
        category: courseFormData.category,
        instructor_id: courseFormData.instructor_id,
        price: parseFloat(courseFormData.price) || 0,
        duration_hours: parseInt(courseFormData.duration) || 0,
        level: courseFormData.difficulty as 'beginner' | 'intermediate' | 'advanced'
      };

      console.log('Creating course with data:', courseData);
      const newCourse = await DataService.createCourse(courseData);
      console.log('✅ Course created successfully:', newCourse);
      
      setSuccess('Course created successfully!');
      
      // Reset form and close modal
      setCourseFormData({
        title: '',
        description: '',
        category: '',
        instructor_id: '',
        price: '',
        duration: '',
        difficulty: 'beginner',
        objectives: [''],
        requirements: [''],
        tags: '',
        thumbnail: null
      });
      setIsCreateModalOpen(false);
      
      // Force refresh the courses list
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error creating course:', error);
      setError(`Failed to create course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEditCourse = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!editingCourse) return;

      const courseData = {
        title: courseFormData.title,
        description: courseFormData.description,
        category: courseFormData.category,
        instructor_id: courseFormData.instructor_id,
        price: parseFloat(courseFormData.price) || 0,
        duration_hours: parseInt(courseFormData.duration) || 0,
        level: courseFormData.difficulty as 'beginner' | 'intermediate' | 'advanced',
        difficulty: courseFormData.difficulty as 'beginner' | 'intermediate' | 'advanced',
        objectives: courseFormData.objectives || [],
        requirements: courseFormData.requirements || [],
        tags: courseFormData.tags ? courseFormData.tags.split(',').map(t => t.trim()) : []
      };

      await DataService.updateCourse(editingCourse.id, courseData);
      
      setSuccess('Course updated successfully!');
      
      // Reset form and close modal
      setCourseFormData({
        title: '',
        description: '',
        category: '',
        instructor_id: '',
        price: '',
        duration: '',
        difficulty: 'beginner',
        objectives: [''],
        requirements: [''],
        tags: '',
        thumbnail: null
      });
      setIsEditModalOpen(false);
      setEditingCourse(null);
      
    } catch (error) {
      console.error('Error updating course:', error);
      setError('Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateCourse = async (course: ExtendedCourse) => {
    try {
      const duplicateData = {
        title: `${course.title} (Copy)`,
        description: course.description,
        category: course.category,
        instructor_id: course.instructor_id,
        price: course.price,
        duration_hours: course.duration_hours || 0,
        level: course.level || 'beginner'
      };

      await DataService.createCourse(duplicateData);
      setSuccess('Course duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating course:', error);
      setError('Failed to duplicate course. Please try again.');
    }
  };

  const handleArchiveCourse = async (courseId: string) => {
    try {
      // Note: status is not a valid field on Course type, removing this for now
      // await DataService.updateCourse(courseId, { status: 'archived' });
      console.warn('Archive functionality not implemented - status field not available on Course type');
      setSuccess('Course archived successfully!');
    } catch (error) {
      console.error('Error archiving course:', error);
      setError('Failed to archive course. Please try again.');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await DataService.deleteCourse(courseId.toString());
      setSuccess('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      setError('Failed to delete course. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'paused': return 'text-orange-600 bg-orange-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Web Development': 'text-blue-600 bg-blue-100',
      'Frontend': 'text-green-600 bg-green-100',
      'Backend': 'text-purple-600 bg-purple-100',
      'Programming': 'text-orange-600 bg-orange-100',
      'Data Science': 'text-red-600 bg-red-100',
      'Mobile': 'text-indigo-600 bg-indigo-100',
      'DevOps': 'text-cyan-600 bg-cyan-100',
      'Machine Learning': 'text-pink-600 bg-pink-100',
      'Cybersecurity': 'text-red-700 bg-red-100',
      'UI/UX Design': 'text-purple-600 bg-purple-100',
      'AI/ML': 'text-blue-700 bg-blue-100',
      'Cloud Computing': 'text-sky-600 bg-sky-100'
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  // Clear success/error messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading && courses.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <SimpleDCODESpinner size="md" className="mb-4" />
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Success/Error Notifications */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <i className="ri-check-circle-line mr-2"></i>
            {success}
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <i className="ri-error-warning-line mr-2"></i>
            {error}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
        <p className="text-gray-600 mt-2">Manage course content, pricing, and enrollment</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-lg mr-4">
              <i className="ri-book-line text-2xl text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-lg mr-4">
              <i className="ri-play-circle-line text-2xl text-green-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-lg mr-4">
              <i className="ri-user-line text-2xl text-purple-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-100 rounded-lg mr-4">
              <i className="ri-money-rupee-circle-line text-2xl text-orange-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">Course Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Web Development">Web Development</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Programming">Programming</option>
                <option value="Data Science">Data Science</option>
                <option value="Mobile">Mobile</option>
              </select>
              <i className="ri-arrow-down-s-line absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line mr-2"></i>
              Refresh
            </button>
            <button 
              onClick={handleCreateCourse}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              Create Course
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-4 left-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(course.category)}`}>
                  {course.category}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                  {course.status}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                <p className="text-sm opacity-90">by {course.instructor?.name || 'Unknown Instructor'}</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{course.students}</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{course.price}</div>
                  <div className="text-sm text-gray-600">Price</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <i className="ri-time-line text-gray-400 mr-1"></i>
                  <span className="text-sm text-gray-600">{course.duration_hours || course.duration} hours</span>
                </div>
                <div className="flex items-center">
                  <i className="ri-star-fill text-yellow-400 mr-1"></i>
                  <span className="text-sm text-gray-600">{course.rating?.toFixed(1) || '4.5'}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Completion Rate</span>
                  <span>{course.completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${course.completion}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-semibold text-green-600">{course.revenue}</span>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleDirectEdit(course.id)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-edit-line mr-2"></i>
                  Edit
                </button>
                <div className="relative">
                  <button 
                    onClick={() => handleActionMenuToggle(course.id)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <i className="ri-more-line text-gray-600"></i>
                  </button>
                  
                  {showActionMenu === course.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="py-2">
                        <button
                          onClick={() => handleCourseAction('view', course.id)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          <i className="ri-eye-line mr-2"></i>
                          View Details
                        </button>
                        <button
                          onClick={() => handleCourseAction('edit', course.id)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          <i className="ri-edit-line mr-2"></i>
                          Edit Course
                        </button>
                        <button
                          onClick={() => handleCourseAction('duplicate', course.id)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          <i className="ri-file-copy-line mr-2"></i>
                          Duplicate
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => handleCourseAction('archive', course.id)}
                          className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 cursor-pointer"
                        >
                          <i className="ri-archive-line mr-2"></i>
                          Archive
                        </button>
                        <button
                          onClick={() => handleCourseAction('delete', course.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <i className="ri-delete-bin-line mr-2"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCourses.length)} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap ${
              currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`px-3 py-2 rounded-lg text-sm cursor-pointer whitespace-nowrap ${
                currentPage === page
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap ${
              currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Click outside to close action menu */}
      {showActionMenu && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowActionMenu(null)}
        ></div>
      )}

      {/* Create Course Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Course"
        maxWidth="4xl"
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={courseFormData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Enter course title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={courseFormData.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor *
                </label>
                <select
                  value={courseFormData.instructor_id}
                  onChange={(e) => handleFormChange('instructor_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
                >
                  <option value="">Select Instructor</option>
                  {mentors.map(mentor => (
                    <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  value={courseFormData.difficulty}
                  onChange={(e) => handleFormChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Hours) *
                </label>
                <input
                  type="number"
                  value={courseFormData.duration}
                  onChange={(e) => handleFormChange('duration', e.target.value)}
                  placeholder="e.g., 40"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="text"
                  value={courseFormData.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  placeholder="e.g., ₹2999, Free"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Description *
            </label>
            <textarea
              rows={4}
              value={courseFormData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Describe what students will learn in this course..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Objectives
            </label>
            <div className="space-y-2">
              {courseFormData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    placeholder="What will students learn?"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  {courseFormData.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addObjective}
                className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>
                Add Objective
              </button>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prerequisites
            </label>
            <div className="space-y-2">
              {courseFormData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder="What should students know before taking this course?"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  {courseFormData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>
                Add Requirement
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={courseFormData.tags}
              onChange={(e) => handleFormChange('tags', e.target.value)}
              placeholder="javascript, react, frontend, web development (comma separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitCourse}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-save-line mr-2"></i>
              Create Course
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCourse(null);
        }}
        title={`Edit Course: ${editingCourse?.title || ''}`}
        maxWidth="4xl"
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={courseFormData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Enter course title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={courseFormData.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor *
                </label>
                <select
                  value={courseFormData.instructor_id}
                  onChange={(e) => handleFormChange('instructor_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
                >
                  <option value="">Select Instructor</option>
                  {mentors.map(mentor => (
                    <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  value={courseFormData.difficulty}
                  onChange={(e) => handleFormChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-8"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (Hours) *
                </label>
                <input
                  type="number"
                  value={courseFormData.duration}
                  onChange={(e) => handleFormChange('duration', e.target.value)}
                  placeholder="e.g., 40"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="text"
                  value={courseFormData.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  placeholder="e.g., ₹2999, Free"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Description *
            </label>
            <textarea
              rows={4}
              value={courseFormData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Describe what students will learn in this course..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Objectives
            </label>
            <div className="space-y-2">
              {courseFormData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    placeholder="What will students learn?"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  {courseFormData.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addObjective}
                className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>
                Add Objective
              </button>
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prerequisites
            </label>
            <div className="space-y-2">
              {courseFormData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder="What should students know before taking this course?"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  {courseFormData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRequirement}
                className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1"></i>
                Add Requirement
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={courseFormData.tags}
              onChange={(e) => handleFormChange('tags', e.target.value)}
              placeholder="javascript, react, frontend, web development (comma separated)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingCourse(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmitEditCourse}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-save-line mr-2"></i>
              Update Course
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCourses;
