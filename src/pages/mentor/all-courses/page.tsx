import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import DataService, { ExtendedCourse } from '@/services/dataService';
import { authService } from '@/lib/auth';

interface Course extends ExtendedCourse {
  instructor_name?: string;
  instructor_email?: string;
}

const MentorAllCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  
  // Modal states
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  
  // Statistics
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    avgRating: 0
  });

  useEffect(() => {
    loadCurrentUser();
    loadAllCourses();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadAllCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Loading all courses...');
      
      // Get all courses with instructor information using DataService
      const coursesData = await DataService.getCourses();
      
      console.log('✅ Courses data received:', coursesData);

      // Transform the data to include instructor information
      const transformedCourses = coursesData.map(course => ({
        ...course,
        instructor_name: course.instructor?.name || 'Unknown',
        instructor_email: course.instructor?.email || 'Unknown'
      }));

      console.log('✅ Transformed courses:', transformedCourses);
      setCourses(transformedCourses);
      
      // Calculate statistics
      const totalStudents = transformedCourses.reduce((sum, course) => sum + (course.students_count || 0), 0);
      const totalRevenue = transformedCourses.reduce((sum, course) => sum + (course.price * (course.students_count || 0)), 0);
      const avgRating = transformedCourses.length > 0 
        ? transformedCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / transformedCourses.length 
        : 0;

      setStats({
        totalCourses: transformedCourses.length,
        totalStudents,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10
      });

    } catch (error) {
      console.error('❌ Error loading all courses:', error);
      setError(`Failed to load courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const categories = [...new Set(courses.map(course => course.category))];
  const levels = [...new Set(courses.map(course => course.level))];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isMyCourse = (course: Course) => {
    return currentUser && course.instructor_id === currentUser.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading all courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
          <p className="text-gray-600 mt-1">Browse all courses uploaded by all mentors</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => navigate('/mentor/upload-course')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <i className="ri-add-line mr-2"></i>
            Upload New Course
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <i className="ri-book-open-line text-2xl text-blue-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <i className="ri-group-line text-2xl text-green-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
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
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Courses</label>
            <input
              type="text"
              placeholder="Search by title, description, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <i className="ri-error-warning-line text-red-400 mr-3 mt-0.5"></i>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="p-12 text-center">
          <i className="ri-book-open-line text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory || selectedLevel 
              ? 'Try adjusting your search criteria.'
              : 'No courses have been uploaded yet.'
            }
          </p>
          <Button
            onClick={() => navigate('/mentor/upload-course')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <i className="ri-add-line mr-2"></i>
            Upload First Course
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {/* Course Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <i className="ri-book-open-line text-6xl text-white opacity-50"></i>
                  </div>
                )}
                
                {/* Level Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.level}
                  </span>
                </div>

                {/* My Course Badge */}
                {isMyCourse(course) && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      My Course
                    </span>
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="mb-2">
                  <span className="text-sm font-medium text-blue-600">{course.category}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                {/* Instructor Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <i className="ri-user-line text-gray-400 mr-2"></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.instructor_name}</p>
                      <p className="text-xs text-gray-500">{course.instructor_email}</p>
                    </div>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <i className="ri-time-line mr-1"></i>
                    <span>{course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-group-line mr-1"></i>
                    <span>{course.students_count || 0} students</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-star-line mr-1"></i>
                    <span>{course.rating || 0}</span>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(course.price)}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewingCourse(course)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <i className="ri-eye-line"></i>
                    </button>
                    
                    {isMyCourse(course) && (
                      <button
                        onClick={() => navigate(`/mentor/courses?edit=${course.id}`)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Edit Course"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                    )}
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

      {/* Course Details Modal */}
      {viewingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{viewingCourse.title}</h2>
                <button
                  onClick={() => setViewingCourse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{viewingCourse.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Category</h3>
                    <p className="text-gray-600">{viewingCourse.category}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Level</h3>
                    <p className="text-gray-600 capitalize">{viewingCourse.level}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Duration</h3>
                    <p className="text-gray-600">{viewingCourse.duration_hours} hours</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Price</h3>
                    <p className="text-gray-600">{formatPrice(viewingCourse.price)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Instructor</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{viewingCourse.instructor_name}</p>
                    <p className="text-sm text-gray-600">{viewingCourse.instructor_email}</p>
                  </div>
                </div>

                {viewingCourse.objectives && viewingCourse.objectives.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Learning Objectives</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {viewingCourse.objectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {viewingCourse.requirements && viewingCourse.requirements.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Requirements</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {viewingCourse.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setViewingCourse(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Close
                </Button>
                {isMyCourse(viewingCourse) && (
                  <Button
                    onClick={() => {
                      setViewingCourse(null);
                      navigate(`/mentor/courses?edit=${viewingCourse.id}`);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Edit Course
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorAllCourses;
