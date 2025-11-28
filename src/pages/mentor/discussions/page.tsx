import React, { useState, useMemo } from 'react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';
import ViewThreadModal from './components/ViewThreadModal';

interface Discussion {
  id: number;
  studentName: string;
  studentAvatar: string;
  courseTitle: string;
  lessonTitle: string;
  question: string;
  category: string;
  submittedAt: string;
  status: 'pending' | 'answered' | 'resolved' | 'closed';
  replies: Reply[];
  priority: 'high' | 'medium' | 'low';
  isNew?: boolean;
  isUnread?: boolean;
}

interface Reply {
  id: number;
  authorName: string;
  authorType: 'mentor' | 'student';
  content: string;
  timestamp: string;
  avatar: string;
}

const MentorDiscussions: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [viewingDiscussion, setViewingDiscussion] = useState<Discussion | null>(null);

  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: 1,
      studentName: 'Alex Johnson',
      studentAvatar: 'AJ',
      courseTitle: 'Advanced React Development',
      lessonTitle: 'Context API Deep Dive',
      question: 'How do I properly implement context providers in a large application with multiple nested components? I\'m running into performance issues.',
      category: 'technical',
      submittedAt: '2024-01-16T10:30:00Z',
      status: 'pending',
      priority: 'high',
      isNew: true,
      isUnread: true,
      replies: []
    },
    {
      id: 2,
      studentName: 'Sarah Chen',
      studentAvatar: 'SC',
      courseTitle: 'Node.js Backend Mastery',
      lessonTitle: 'Database Integration',
      question: 'What are the best practices for connecting to MongoDB in a production environment? Should I use connection pooling?',
      category: 'concept',
      submittedAt: '2024-01-15T14:15:00Z',
      status: 'answered',
      priority: 'medium',
      replies: [
        {
          id: 1,
          authorName: 'Dr. Mike Wilson',
          authorType: 'mentor',
          content: 'Great question! Yes, connection pooling is essential in production. MongoDB driver automatically handles this, but you should configure the pool size based on your application needs. I recommend starting with a pool size of 10-20 connections.',
          timestamp: '2024-01-15T16:20:00Z',
          avatar: 'MW'
        },
        {
          id: 2,
          authorName: 'Sarah Chen',
          authorType: 'student',
          content: 'Thank you! How do I monitor the connection pool performance?',
          timestamp: '2024-01-15T17:10:00Z',
          avatar: 'SC'
        },
        {
          id: 3,
          authorName: 'Dr. Mike Wilson',
          authorType: 'mentor',
          content: 'You can use MongoDB Compass or implement custom monitoring using the driver\'s built-in metrics. I\'ll share some code examples in our next session.',
          timestamp: '2024-01-15T18:30:00Z',
          avatar: 'MW'
        }
      ]
    },
    {
      id: 3,
      studentName: 'David Park',
      studentAvatar: 'DP',
      courseTitle: 'JavaScript Fundamentals',
      lessonTitle: 'Error Handling',
      question: 'Can someone explain the difference between try-catch and promise rejection handling? When should I use each?',
      category: 'general',
      submittedAt: '2024-01-14T09:45:00Z',
      status: 'resolved',
      priority: 'low',
      replies: [
        {
          id: 1,
          authorName: 'Prof. Emma Davis',
          authorType: 'mentor',
          content: 'Try-catch is used for synchronous code and async/await, while .catch() is used for promise chains. Both handle errors, but try-catch provides better readability with async/await syntax.',
          timestamp: '2024-01-14T11:30:00Z',
          avatar: 'ED'
        }
      ]
    },
    {
      id: 4,
      studentName: 'Lisa Rodriguez',
      studentAvatar: 'LR',
      courseTitle: 'React Native Development',
      lessonTitle: 'Navigation Setup',
      question: 'I\'m getting a white screen when navigating between screens. The console shows no errors. What could be causing this?',
      category: 'technical',
      submittedAt: '2024-01-13T16:20:00Z',
      status: 'pending',
      priority: 'high',
      isNew: true,
      isUnread: true,
      replies: []
    },
    {
      id: 5,
      studentName: 'Tom Wilson',
      studentAvatar: 'TW',
      courseTitle: 'Python for Data Science',
      lessonTitle: 'Pandas DataFrames',
      question: 'How do I efficiently merge multiple large DataFrames without running out of memory?',
      category: 'concept',
      submittedAt: '2024-01-12T13:45:00Z',
      status: 'answered',
      priority: 'medium',
      replies: [
        {
          id: 1,
          authorName: 'Dr. Jennifer Lee',
          authorType: 'mentor',
          content: 'For large DataFrames, consider using chunking with pd.read_csv(chunksize=...) and process data in smaller batches. Also, use categorical data types and optimize memory usage with df.info(memory_usage=\'deep\').',
          timestamp: '2024-01-12T15:20:00Z',
          avatar: 'JL'
        }
      ]
    },
    {
      id: 6,
      studentName: 'Maria Garcia',
      studentAvatar: 'MG',
      courseTitle: 'UI/UX Design Principles',
      lessonTitle: 'Color Theory',
      question: 'What are the accessibility guidelines for color contrast in web design? I want to ensure my designs are inclusive.',
      category: 'general',
      submittedAt: '2024-01-11T08:30:00Z',
      status: 'pending',
      priority: 'medium',
      isUnread: true,
      replies: []
    }
  ]);

  // Filter and search discussions
  const filteredDiscussions = useMemo(() => {
    let filtered = discussions;

    // Filter by status
    if (filter === 'pending') filtered = filtered.filter(d => d.status === 'pending');
    else if (filter === 'answered') filtered = filtered.filter(d => d.status === 'answered');
    else if (filter === 'resolved') filtered = filtered.filter(d => d.status === 'resolved');
    else if (filter === 'unanswered') filtered = filtered.filter(d => d.status === 'pending' && d.replies.length === 0);
    else if (filter === 'high-priority') filtered = filtered.filter(d => d.priority === 'high');
    else if (filter === 'unread') filtered = filtered.filter(d => d.isUnread);

    // Filter by course
    if (courseFilter !== 'all') {
      filtered = filtered.filter(d => d.courseTitle === courseFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [discussions, filter, courseFilter, searchTerm]);

  // Get unique courses for filter dropdown
  const uniqueCourses = useMemo(() => {
    return [...new Set(discussions.map(d => d.courseTitle))];
  }, [discussions]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusBadge = (status: string, isNew?: boolean, isUnread?: boolean) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Pending', icon: 'ri-time-line' },
      'answered': { color: 'bg-green-100 text-green-800', text: 'Answered', icon: 'ri-check-line' },
      'resolved': { color: 'bg-blue-100 text-blue-800', text: 'Resolved', icon: 'ri-check-double-line' },
      'closed': { color: 'bg-gray-100 text-gray-800', text: 'Closed', icon: 'ri-close-line' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
          <i className={`${config.icon} mr-1`}></i>
          {config.text}
        </span>
        {isNew && (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <i className="ri-notification-line mr-1"></i>
            New
          </span>
        )}
        {isUnread && (
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
        )}
      </div>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { color: 'bg-red-100 text-red-800', text: 'High Priority' },
      'medium': { color: 'bg-orange-100 text-orange-800', text: 'Medium' },
      'low': { color: 'bg-blue-100 text-blue-800', text: 'Low' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getCategoryColor = (category: string) => {
    const categories = {
      'technical': 'bg-blue-100 text-blue-800',
      'concept': 'bg-purple-100 text-purple-800',
      'general': 'bg-gray-100 text-gray-800',
      'assignment': 'bg-orange-100 text-orange-800'
    };
    return categories[category as keyof typeof categories] || 'bg-gray-100 text-gray-800';
  };

  const handleReply = () => {
    if (!selectedDiscussion || !replyText.trim()) return;
    
    // Here you would typically send the reply to your backend
    console.log('Sending reply:', {
      discussionId: selectedDiscussion.id,
      content: replyText
    });
    
    setReplyText('');
    setShowReplyModal(false);
    setSelectedDiscussion(null);
  };

  const markAsResolved = (discussionId: number) => {
    setDiscussions(prev => 
      prev.map(d => 
        d.id === discussionId 
          ? { ...d, status: 'resolved' as const, isUnread: false }
          : d
      )
    );
  };

  const markAsRead = (discussionId: number) => {
    setDiscussions(prev => 
      prev.map(d => 
        d.id === discussionId 
          ? { ...d, isUnread: false }
          : d
      )
    );
  };

  const clearFilters = () => {
    setFilter('all');
    setCourseFilter('all');
    setSearchTerm('');
  };

  const stats = [
    { label: 'Total Questions', value: discussions.length.toString(), icon: 'ri-question-line', color: 'blue' },
    { label: 'Pending Replies', value: discussions.filter(d => d.status === 'pending').length.toString(), icon: 'ri-time-line', color: 'yellow' },
    { label: 'Unread Questions', value: discussions.filter(d => d.isUnread).length.toString(), icon: 'ri-notification-line', color: 'red' },
    { label: 'High Priority', value: discussions.filter(d => d.priority === 'high').length.toString(), icon: 'ri-alert-line', color: 'orange' }
  ];

  const handleViewThread = (discussion: Discussion) => {
    setViewingDiscussion(discussion);
    setShowThreadModal(true);
  };

  const handleAddReply = (discussionId: number, content: string) => {
    const newReply: Reply = {
      id: Date.now(),
      authorName: 'Dr. Mike Wilson',
      authorType: 'mentor',
      content: content,
      timestamp: new Date().toISOString(),
      avatar: 'MW'
    };

    setDiscussions(prev => 
      prev.map(d => 
        d.id === discussionId 
          ? { 
              ...d, 
              replies: [...d.replies, newReply],
              status: 'answered' as const,
              isUnread: false 
            }
          : d
      )
    );
  };

  const handleCourseClick = (courseTitle: string) => {
    setCourseFilter(courseTitle);
    // Optionally scroll to top or show a notification
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Student Discussions</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
            Manage and respond to student questions from all courses
          </p>
        </div>
      </div>

      {/* Clean Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="group cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => {
              if (stat.label === 'Pending Replies') setFilter('pending');
              else if (stat.label === 'Unread Questions') setFilter('unread');
              else if (stat.label === 'High Priority') setFilter('high-priority');
              else setFilter('all');
            }}
          >
            <div className="bg-white rounded-xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              {/* Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <i className={`${stat.icon} text-${stat.color}-600 text-lg`}></i>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {stat.value}
                  </div>
                </div>
              </div>
              
              {/* Label */}
              <div className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                {stat.label}
              </div>
              
              {/* Subtle accent line */}
              <div className={`mt-3 h-1 w-8 bg-${stat.color}-200 rounded-full group-hover:bg-${stat.color}-300 transition-colors`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters - Mobile Optimized */}
      <Card className="bg-gray-50/50">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
              <select 
                value={courseFilter} 
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Courses</option>
                {uniqueCourses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto text-sm">
                <i className="ri-refresh-line mr-1 sm:mr-2"></i>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Filter Tabs - Mobile Optimized */}
      <div className="flex overflow-x-auto gap-2 bg-white p-1 rounded-lg border border-gray-200">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'unanswered', label: 'Unanswered' },
          { key: 'answered', label: 'Answered' },
          { key: 'resolved', label: 'Resolved' },
          { key: 'unread', label: 'Unread' },
          { key: 'high-priority', label: 'High Priority' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap relative flex-shrink-0 ${
              filter === tab.key
                ? 'bg-blue-100 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {tab.key === 'unread' && discussions.filter(d => d.isUnread).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {discussions.filter(d => d.isUnread).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Discussions List - Mobile Optimized */}
      <div className="space-y-3 sm:space-y-4">
        {filteredDiscussions.map((discussion) => (
          <Card key={discussion.id} 
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  discussion.isUnread ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                }`}
                onClick={() => markAsRead(discussion.id)}>
            <div className="space-y-3 sm:space-y-4">
              {/* Header - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm relative flex-shrink-0">
                    {discussion.studentAvatar}
                    {discussion.isUnread && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{discussion.studentName}</h3>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <span className="text-gray-500 hidden sm:inline">•</span>
                        <span className="text-xs sm:text-sm text-gray-500">{getTimeAgo(discussion.submittedAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(discussion.category)}`}>
                        {discussion.category}
                      </span>
                      {getPriorityBadge(discussion.priority)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 flex-shrink-0">
                  {getStatusBadge(discussion.status, discussion.isNew, discussion.isUnread)}
                </div>
              </div>

              {/* Course and Lesson Info - Mobile Optimized */}
              <div 
                className="bg-gray-50 rounded-lg p-2 sm:p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCourseClick(discussion.courseTitle);
                }}
              >
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <p className="truncate">
                    <span className="font-medium">Course:</span> 
                    <span className="text-blue-600 hover:text-blue-700 ml-1 font-medium">
                      {discussion.courseTitle}
                    </span>
                  </p>
                  <p className="truncate"><span className="font-medium">Lesson:</span> {discussion.lessonTitle}</p>
                </div>
                <div className="flex items-center justify-between mt-1 sm:mt-2">
                  <span className="text-xs text-gray-500 hidden sm:inline">Click to filter by this course</span>
                  <i className="ri-arrow-right-line text-gray-400"></i>
                </div>
              </div>

              {/* Question - Mobile Optimized */}
              <div>
                <h4 className="font-medium text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Question:</h4>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base line-clamp-3">{discussion.question}</p>
              </div>

              {/* Replies */}
              {discussion.replies.length > 0 && (
                <div className="border-l-4 border-blue-200 pl-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <i className="ri-message-line mr-2"></i>
                    {discussion.replies.length} Replies
                  </h4>
                  <div className="space-y-3">
                    {discussion.replies.slice(0, 2).map((reply) => (
                      <div key={reply.id} className="flex space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                          reply.authorType === 'mentor' ? 'bg-gradient-to-r from-purple-600 to-orange-500' : 'bg-gray-400'
                        }`}>
                          {reply.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm text-gray-900">{reply.authorName}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              reply.authorType === 'mentor' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {reply.authorType}
                            </span>
                            <span className="text-xs text-gray-500">{getTimeAgo(reply.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                    {discussion.replies.length > 2 && (
                      <div 
                        className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewThread(discussion);
                        }}
                      >
                        <i className="ri-eye-line mr-1"></i>
                        View {discussion.replies.length - 2} more replies...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-3 border-t border-gray-100 space-y-2 sm:space-y-0">
                <div className="text-xs text-gray-500">
                  Submitted on {formatDateTime(discussion.submittedAt)}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs sm:text-sm flex-1 sm:flex-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDiscussion(discussion);
                      setShowReplyModal(true);
                    }}
                  >
                    <i className="ri-reply-line mr-1 sm:mr-2"></i>
                    Reply
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs sm:text-sm flex-1 sm:flex-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewThread(discussion);
                    }}
                  >
                    <i className="ri-eye-line mr-1 sm:mr-2"></i>
                    View Thread
                  </Button>
                  {discussion.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs sm:text-sm flex-1 sm:flex-none text-green-600 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsResolved(discussion.id);
                      }}
                    >
                      <i className="ri-check-line mr-1 sm:mr-2"></i>
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredDiscussions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-message-line text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || courseFilter !== 'all' || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No student questions available at the moment'
            }
          </p>
          {(searchTerm || courseFilter !== 'all' || filter !== 'all') && (
            <Button onClick={clearFilters}>
              <i className="ri-refresh-line mr-2"></i>
              Clear All Filters
            </Button>
          )}
        </div>
      )}

      {/* View Thread Modal */}
      <ViewThreadModal
        isOpen={showThreadModal}
        onClose={() => {
          setShowThreadModal(false);
          setViewingDiscussion(null);
        }}
        discussion={viewingDiscussion}
        onAddReply={handleAddReply}
      />

      {/* Reply Modal */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setReplyText('');
          setSelectedDiscussion(null);
        }}
        title="Reply to Student Question"
      >
        {selectedDiscussion && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {selectedDiscussion.studentAvatar}
                </div>
                <span className="font-medium text-gray-900">{selectedDiscussion.studentName}</span>
                <span className="text-sm text-gray-500">in {selectedDiscussion.courseTitle}</span>
              </div>
              <p className="text-sm text-gray-700 font-medium mb-1">Question:</p>
              <p className="text-sm text-gray-600">{selectedDiscussion.question}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Reply
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedDiscussion(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleReply} disabled={!replyText.trim()}>
                <i className="ri-send-plane-line mr-2"></i>
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MentorDiscussions;







