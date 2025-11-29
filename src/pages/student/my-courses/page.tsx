import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';
import DataService from '@/services/dataService';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number;
  completed_at?: string;
  status?: 'enrolled' | 'active' | 'completed' | 'suspended' | 'cancelled';
  course?: Course;
}

export default function MyCourses() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('purchased');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollSuccess, setShowEnrollSuccess] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showWishlistNotification, setShowWishlistNotification] = useState<string>('');

  // Real data states
  const [purchasedCourses, setPurchasedCourses] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    initializeData();
    loadWishlist();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get current user
      const user = await authService.getCurrentUser();
      if (!user) {
        setError('Please log in to view your courses');
        return;
      }
      setCurrentUser(user);

      console.log('🔄 Fetching student courses data...');

      // Fetch enrolled courses
      const enrollments = await DataService.getEnrollments(user.id);
      console.log('📚 Enrolled courses:', enrollments);
      setPurchasedCourses(enrollments);

      // Fetch all available courses
      const allCourses = await DataService.getCourses();
      console.log('📖 All available courses:', allCourses);
      
      // Filter out courses the student is already enrolled in
      const enrolledCourseIds = enrollments.map(e => e.course_id);
      const availableCoursesFiltered = allCourses.filter(course => !enrolledCourseIds.includes(course.id));
      setAvailableCourses(availableCoursesFiltered);

      console.log('✅ Student courses data loaded successfully');

    } catch (error) {
      console.error('❌ Error loading student courses:', error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = () => {
    const savedWishlist = localStorage.getItem('courseWishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  };

  const saveWishlist = (wishlistData: string[]) => {
    localStorage.setItem('courseWishlist', JSON.stringify(wishlistData));
    setWishlist(wishlistData);
  };

  const handleEnrollInCourse = async (courseId: string, courseTitle: string) => {
    if (!currentUser) {
      setError('Please log in to enroll in courses');
      return;
    }

    try {
      console.log('🎓 Enrolling in course:', courseId);
      
      await DataService.enrollInCourse(currentUser.id, courseId);
      
      // Refresh data to get the latest enrollments from database
      await initializeData();
      
      setShowEnrollSuccess(true);
      setTimeout(() => setShowEnrollSuccess(false), 3000);

      console.log('✅ Successfully enrolled in course');

    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
      setError('Failed to enroll in course. Please try again.');
    }
  };

  const handleAddToWishlist = (courseId: string, courseTitle: string) => {
    const newWishlist = [...wishlist, courseId];
    saveWishlist(newWishlist);
    setShowWishlistNotification(`"${courseTitle}" added to wishlist!`);
    setTimeout(() => setShowWishlistNotification(''), 3000);
  };

  const handleRemoveFromWishlist = (courseId: string, courseTitle: string) => {
    const newWishlist = wishlist.filter(id => id !== courseId);
    saveWishlist(newWishlist);
    setShowWishlistNotification(`"${courseTitle}" removed from wishlist!`);
    setTimeout(() => setShowWishlistNotification(''), 3000);
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to render star rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const decimal = rating % 1;
    const hasHalfStar = decimal >= 0.25 && decimal < 0.75;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="ri-star-fill text-yellow-400 text-sm"></i>
        ))}
        {hasHalfStar && <i className="ri-star-half-fill text-yellow-400 text-sm"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="ri-star-line text-yellow-400 text-sm"></i>
        ))}
      </div>
    );
  };

  // Calculate original price (for discount display)
  const getOriginalPrice = (currentPrice: number) => {
    // If price is low or free, assume it's already discounted
    if (currentPrice < 1000) {
      return currentPrice * 8.35; // Example: ₹399 -> ₹3,329
    }
    return currentPrice * 1.5; // Default 50% discount assumption
  };

  const handleContinueCourse = (courseId: string) => {
    console.log('🎓 Continuing course:', courseId);
    navigate(`/student/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <SimpleDCODESpinner size="lg" className="mx-auto mb-4" />
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
                Manage your learning journey and discover new courses.
        </p>
      </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
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

        {/* Success Messages */}
        {showEnrollSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="ri-check-line text-green-400"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success!</h3>
                <div className="mt-2 text-sm text-green-700">You have successfully enrolled in the course!</div>
              </div>
            </div>
          </div>
        )}

        {showWishlistNotification && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="ri-heart-line text-blue-400"></i>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Wishlist Updated</h3>
                <div className="mt-2 text-sm text-blue-700">{showWishlistNotification}</div>
              </div>
            </div>
          </div>
        )}

      {/* Tabs */}
        <div className="mb-8">
      <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('purchased')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'purchased'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Purchased Courses ({purchasedCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Courses ({availableCourses.length})
          </button>
        </nav>
      </div>
        </div>

        {/* Course Content */}
        {activeTab === 'purchased' ? (
          <div>
            {purchasedCourses.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <i className="ri-book-open-line text-6xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't enrolled in any courses yet. Explore our available courses to get started!
                </p>
                <Button
                  onClick={() => setActiveTab('available')}
                  variant="brand"
                >
                  <i className="ri-search-line mr-2"></i>
                  Browse Available Courses
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedCourses.map((enrollment) => {
                  const course = enrollment.course;
                  if (!course) return null;

                  // Mock rating data (you can get this from course data if available)
                  const rating = 4.3;
                  const reviewCount = 2724;
                  const originalPrice = getOriginalPrice(course.price);
                  const hasDiscount = course.price < originalPrice;
                  const isPremium = (course.tags && course.tags.includes('Premium')) || false;
                  const isBestseller = (course.tags && course.tags.includes('Bestseller')) || course.price === 0;

                  return (
                    <Card key={enrollment.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full !p-0">
                      {/* Course Thumbnail with Purple Gradient Background */}
                      <div className="h-40 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-400 relative flex-shrink-0">
                        {course.thumbnail ? (
                          <div className="relative w-full h-full">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover mix-blend-overlay opacity-80"
                            />
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 via-purple-500/80 to-pink-400/80"></div>
                          </div>
                        ) : (
                          <div className="w-full h-full relative">
                            {/* Purple gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-400"></div>
                            {/* Decorative elements */}
                            <div className="absolute left-4 top-4">
                              <div className="text-white">
                                <div className="w-16 h-0.5 bg-red-500 rounded-full mb-1"></div>
                                <div className="text-3xl font-bold">ISTQB</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Progress Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                            {enrollment.progress}%
                          </span>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="px-4 pt-3 pb-4 flex flex-col flex-grow">
                        {/* Course Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-2 leading-tight">
                          {course.title}
                        </h3>

                        {/* Instructor */}
                        <p className="text-xs text-gray-700 mb-2">
                          {course.instructor?.name || 'Mentor'}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="text-sm font-semibold text-gray-900">{rating}</span>
                          {renderStars(rating)}
                          <span className="text-xs text-gray-500">({reviewCount.toLocaleString()})</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl font-bold text-gray-900">
                            {formatPrice(course.price)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons - Side by Side */}
                        <div className="flex gap-2 mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs py-2"
                            onClick={() => setSelectedCourse(course)}
                          >
                            View
                          </Button>
                          <Button 
                            size="sm"
                            className="flex-1 text-xs py-2"
                            onClick={() => handleContinueCourse(course.id)}
                          >
                            <i className="ri-play-line mr-1 text-xs"></i>
                            Continue
                          </Button>
                        </div>

                        {/* Badges at Bottom */}
                        <div className="flex gap-1.5 flex-wrap mt-auto">
                          {isPremium && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded bg-purple-600 text-white text-[10px] font-medium">
                              <i className="ri-check-line mr-1 text-xs"></i>
                              Premium
                            </span>
                          )}
                          {isBestseller && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded bg-teal-300 text-gray-900 text-[10px] font-medium">
                              Bestseller
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
                    )}
                  </div>
        ) : (
          <div>
            {availableCourses.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <i className="ri-book-open-line text-6xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Available Courses</h3>
                <p className="text-gray-600 mb-6">
                  There are no new courses available at the moment. Check back later!
                </p>
                <Button
                  onClick={initializeData}
                  variant="outline"
                >
                  <i className="ri-refresh-line mr-2"></i>
                  Refresh
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => {
                  // Mock rating data (you can get this from course data if available)
                  const rating = 4.3;
                  const reviewCount = 2724;
                  const originalPrice = getOriginalPrice(course.price);
                  const hasDiscount = course.price < originalPrice;
                  const isPremium = (course.tags && course.tags.includes('Premium')) || false;
                  const isBestseller = (course.tags && course.tags.includes('Bestseller')) || course.price === 0;

                  return (
                  <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full !p-0">
                    {/* Course Thumbnail with Purple Gradient Background */}
                    <div className="h-40 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-400 relative flex-shrink-0">
                      {course.thumbnail ? (
                        <div className="relative w-full h-full">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover mix-blend-overlay opacity-80"
                          />
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 via-purple-500/80 to-pink-400/80"></div>
                        </div>
                      ) : (
                        <div className="w-full h-full relative">
                          {/* Purple gradient background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-400"></div>
                          {/* Decorative elements */}
                          <div className="absolute left-4 top-4">
                            <div className="text-white">
                              <div className="w-16 h-0.5 bg-red-500 rounded-full mb-1"></div>
                              <div className="text-3xl font-bold">ISTQB</div>
                            </div>
                          </div>
                        </div>
                      )}
                      {wishlist.includes(course.id) && (
                        <div className="absolute top-3 right-3">
                          <i className="ri-heart-fill text-red-500 text-lg drop-shadow-lg"></i>
                        </div>
                      )}
                    </div>

                    {/* Course Content */}
                    <div className="px-4 pt-3 pb-4 flex flex-col flex-grow">
                      {/* Course Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-2 leading-tight">
                        {course.title}
                      </h3>

                      {/* Instructor */}
                      <p className="text-xs text-gray-700 mb-2">
                        {course.instructor?.name || 'Mentor'}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-sm font-semibold text-gray-900">{rating}</span>
                        {renderStars(rating)}
                        <span className="text-xs text-gray-500">({reviewCount.toLocaleString()})</span>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(course.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons - Side by Side */}
                      <div className="flex gap-2 mb-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs py-2"
                          onClick={() => setSelectedCourse(course)}
                        >
                          View
                        </Button>
                        <Button 
                          size="sm"
                          className="flex-1 text-xs py-2"
                          onClick={() => handleEnrollInCourse(course.id, course.title)}
                        >
                          <i className="ri-add-line mr-1 text-xs"></i>
                          Enroll
                        </Button>
                      </div>

                      {/* Badges at Bottom */}
                      <div className="flex gap-1.5 flex-wrap mt-auto">
                        {isPremium && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded bg-purple-600 text-white text-[10px] font-medium">
                            <i className="ri-check-line mr-1 text-xs"></i>
                            Premium
                          </span>
                        )}
                        {isBestseller && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded bg-teal-300 text-gray-900 text-[10px] font-medium">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                  );
                })}
        </div>
          )}
        </div>
      )}

        {/* Course Details Modal */}
        {selectedCourse && (
          <Modal
            isOpen={true}
            onClose={() => setSelectedCourse(null)}
            title={selectedCourse.title}
            size="lg"
          >
          <div className="space-y-6">
              {/* Course Header */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {selectedCourse.thumbnail ? (
                    <img
                      className="h-24 w-32 object-cover rounded-lg"
                      src={selectedCourse.thumbnail}
                      alt={selectedCourse.title}
                    />
                  ) : (
                    <div className="h-24 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <i className="ri-book-open-line text-2xl text-gray-400"></i>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedCourse.title}</h3>
                  <p className="text-gray-600 mb-3">{selectedCourse.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <i className="ri-user-line mr-1"></i>
                      by {selectedCourse.instructor?.name || 'Mentor'}
                    </span>
                    <span className="flex items-center">
                      <i className="ri-time-line mr-1"></i>
                      {selectedCourse.duration_hours} hours
                    </span>
                    <span className="flex items-center">
                      <i className="ri-price-tag-3-line mr-1"></i>
                      {formatPrice(selectedCourse.price)}
                    </span>
                  </div>
                </div>
            </div>
            
              {/* Course Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Course Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium">{selectedCourse.level}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{selectedCourse.category}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{selectedCourse.duration_hours} hours</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">{formatPrice(selectedCourse.price)}</span>
                  </div>
                </div>
              </div>
              
                {selectedCourse.objectives && selectedCourse.objectives.length > 0 && (
              <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Learning Objectives</h4>
                    <ul className="space-y-1 text-sm">
                      {selectedCourse.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <i className="ri-check-line text-green-600 mt-1 mr-2"></i>
                          <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
                )}
            </div>
            
              {selectedCourse.requirements && selectedCourse.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                  <ul className="space-y-1 text-sm">
                    {selectedCourse.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <i className="ri-arrow-right-line text-blue-600 mt-1 mr-2"></i>
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCourse(null)}
                >
                  Close
                </Button>
                {activeTab === 'available' ? (
              <Button 
                    onClick={() => {
                      handleEnrollInCourse(selectedCourse.id, selectedCourse.title);
                      setSelectedCourse(null);
                    }}
                  >
                    <i className="ri-add-line mr-2"></i>
                    Enroll Now
              </Button>
                ) : (
              <Button 
                    onClick={() => {
                      handleContinueCourse(selectedCourse.id);
                      setSelectedCourse(null);
                    }}
                  >
                    <i className="ri-play-line mr-2"></i>
                    Continue Learning
              </Button>
                )}
              </div>
            </div>
          </Modal>
        )}
        </div>
    </div>
  );
}