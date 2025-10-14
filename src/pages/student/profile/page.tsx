import React, { useState, useMemo, useEffect } from 'react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';
import { bookmarkService, Bookmark } from '@/services/bookmarkService';

const StudentProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);

  // Bookmark filters
  const [bookmarkSearch, setBookmarkSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock user data
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    bio: 'Passionate full-stack developer with a love for creating innovative web applications. Currently specializing in React and Node.js technologies.',
    joinedDate: '2024-01-15',
    avatar: 'AJ',
    skills: ['React', 'JavaScript', 'Node.js', 'Python', 'MongoDB'],
    interests: ['Web Development', 'AI/ML', 'Cloud Computing', 'Open Source']
  });

  // Real bookmarks data from service
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Load bookmarks from service on component mount
  useEffect(() => {
    const loadedBookmarks = bookmarkService.getBookmarks();
    setBookmarks(loadedBookmarks);
  }, []);

  // Filter and sort bookmarks
  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;

    // Filter by search term
    if (bookmarkSearch) {
      filtered = filtered.filter(bookmark =>
        bookmark.lessonTitle.toLowerCase().includes(bookmarkSearch.toLowerCase()) ||
        bookmark.courseTitle.toLowerCase().includes(bookmarkSearch.toLowerCase())
      );
    }

    // Filter by course
    if (courseFilter !== 'all') {
      filtered = filtered.filter(bookmark => bookmark.courseId === courseFilter);
    }

    // Sort bookmarks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime();
        case 'oldest':
          return new Date(a.bookmarkedAt).getTime() - new Date(b.bookmarkedAt).getTime();
        case 'progress':
          return b.progress - a.progress;
        case 'title':
          return a.lessonTitle.localeCompare(b.lessonTitle);
        default:
          return 0;
      }
    });

    return filtered;
  }, [bookmarks, bookmarkSearch, courseFilter, sortBy]);

  // Get unique courses for filter dropdown
  const uniqueCourses = useMemo(() => {
    const courses = new Map();
    bookmarks.forEach(bookmark => {
      courses.set(bookmark.courseId, bookmark.courseTitle);
    });
    return Array.from(courses.entries()).map(([id, title]) => ({ id, title }));
  }, [bookmarks]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-user-line' },
    { id: 'bookmarks', label: 'My Bookmarks', icon: 'ri-bookmark-line' },
    { id: 'achievements', label: 'Achievements', icon: 'ri-trophy-line' },
    { id: 'settings', label: 'Settings', icon: 'ri-settings-line' }
  ];

  const stats = [
    { label: 'Courses Enrolled', value: '8', icon: 'ri-book-line', color: 'blue' },
    { label: 'Completed', value: '3', icon: 'ri-check-line', color: 'green' },
    { label: 'Hours Learned', value: '124', icon: 'ri-time-line', color: 'purple' },
    { label: 'Certificates', value: '2', icon: 'ri-award-line', color: 'orange' }
  ];

  const achievements = [
    { title: 'First Course Completed', description: 'Completed your first course', date: '2024-01-20', icon: 'ri-trophy-line', color: 'yellow' },
    { title: 'Quick Learner', description: 'Completed 5 lessons in one day', date: '2024-01-18', icon: 'ri-flashlight-line', color: 'blue' },
    { title: 'Consistent Student', description: '7-day learning streak', date: '2024-01-16', icon: 'ri-calendar-check-line', color: 'green' }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSaveProfile = () => {
    setShowEditModal(false);
    // Save profile logic here
  };

  const viewBookmark = (bookmark: Bookmark) => {
    setSelectedBookmark(bookmark);
    setShowBookmarkModal(true);
  };

  const removeBookmark = (bookmarkId: string) => {
    const success = bookmarkService.removeBookmark(bookmarkId);
    if (success) {
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    }
  };

  const continueLesson = (bookmark: Bookmark) => {
    setShowBookmarkModal(false);
    // Navigate to lesson logic here
    console.log(`Continue lesson: ${bookmark.lessonTitle} in course: ${bookmark.courseTitle}`);
  };

  const clearBookmarkFilters = () => {
    setBookmarkSearch('');
    setCourseFilter('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage your account and track your learning progress
          </p>
        </div>
        <Button onClick={() => setShowEditModal(true)}>
          <i className="ri-edit-line mr-2"></i>
          Edit Profile
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl">
            {user.avatar}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600 mt-1">{user.email}</p>
            <p className="text-sm text-gray-500 mt-2">{user.bio}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
              <span className="flex items-center text-sm text-gray-500">
                <i className="ri-map-pin-line mr-1"></i>
                {user.location}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <i className="ri-calendar-line mr-1"></i>
                Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
              <i className={`${stat.icon} text-2xl text-${stat.color}-600`}></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{user.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-900">{user.location}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Interests</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Technical Skills</label>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Learning Interests</label>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <span key={interest} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">My Bookmarks</h3>
              <p className="text-sm text-gray-600 mt-1">Lessons you've bookmarked for quick access</p>
            </div>
            <div className="text-sm text-gray-500">
              {filteredBookmarks.length} of {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Bookmark Filters */}
          <Card className="bg-gray-50/50">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input
                      type="text"
                      placeholder="Search bookmarks by lesson or course title..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      value={bookmarkSearch}
                      onChange={(e) => setBookmarkSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
                  <select 
                    value={courseFilter} 
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Courses</option>
                    {uniqueCourses.map((course) => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="progress">Progress (High to Low)</option>
                    <option value="title">Lesson Title (A-Z)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearBookmarkFilters}
                    className="whitespace-nowrap"
                  >
                    <i className="ri-refresh-line mr-2"></i>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBookmarks.map((bookmark) => (
                <Card key={bookmark.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group border border-gray-200 hover:border-blue-300"
                      onClick={() => viewBookmark(bookmark)}>
                  <div className="p-3 space-y-3">
                    {bookmark.thumbnailUrl && (
                      <div className="aspect-video rounded-md overflow-hidden bg-gray-100 relative">
                        <img 
                          src={bookmark.thumbnailUrl} 
                          alt={bookmark.lessonTitle}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBookmark(bookmark.id);
                            }}
                            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-blue-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200 shadow-sm"
                          >
                            <i className="ri-bookmark-fill text-sm"></i>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors leading-tight">
                          {bookmark.lessonTitle}
                        </h4>
                        <p className="text-xs text-blue-600 font-medium mb-1 truncate">
                          {bookmark.courseTitle}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {bookmark.instructor}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="font-medium">{bookmark.progress}%</span>
                          <span className="text-xs">{bookmark.lessonDuration}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${bookmark.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-gray-400 truncate">
                          {formatDate(bookmark.bookmarkedAt)}
                        </span>
                        <div className="flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <i className="ri-arrow-right-line text-xs mr-1"></i>
                          <span className="text-xs font-medium">Continue</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-bookmark-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {bookmarkSearch || courseFilter !== 'all' ? 'No matching bookmarks found' : 'No bookmarks yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {bookmarkSearch || courseFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Bookmark lessons during your courses to save them for quick access later'
                }
              </p>
              {bookmarkSearch || courseFilter !== 'all' ? (
                <Button onClick={clearBookmarkFilters}>
                  <i className="ri-refresh-line mr-2"></i>
                  Clear Filters
                </Button>
              ) : (
                <Button>
                  <i className="ri-book-line mr-2"></i>
                  Browse Courses
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'achievements' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements</h3>
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-12 h-12 rounded-full bg-${achievement.color}-100 flex items-center justify-center`}>
                  <i className={`${achievement.icon} text-2xl text-${achievement.color}-600`}></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(achievement.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive updates about your courses</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-600">Get notified about deadlines and updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                <i className="ri-delete-bin-line mr-2"></i>
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={user.phone}
                onChange={(e) => setUser(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={user.location}
              onChange={(e) => setUser(prev => ({ ...prev, location: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              value={user.bio}
              onChange={(e) => setUser(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bookmark Detail Modal */}
      <Modal 
        isOpen={showBookmarkModal} 
        onClose={() => setShowBookmarkModal(false)}
        title="Bookmark Details"
      >
        {selectedBookmark && (
          <div className="space-y-4">
            {selectedBookmark.thumbnailUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={selectedBookmark.thumbnailUrl} 
                  alt={selectedBookmark.lessonTitle}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedBookmark.lessonTitle}
              </h3>
              <p className="text-blue-600 font-medium mb-1">
                {selectedBookmark.courseTitle}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Instructor: {selectedBookmark.instructor}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress: {selectedBookmark.progress}%</span>
                  <span>Duration: {selectedBookmark.lessonDuration}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${selectedBookmark.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                Bookmarked on {formatDate(selectedBookmark.bookmarkedAt)}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => removeBookmark(selectedBookmark.id)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <i className="ri-bookmark-line mr-2"></i>
                Remove Bookmark
              </Button>
              <Button onClick={() => continueLesson(selectedBookmark)}>
                <i className="ri-play-line mr-2"></i>
                Continue Lesson
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentProfile;
