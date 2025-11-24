import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import Modal from '@/components/base/Modal';

interface Discussion {
  id: number;
  courseId: string;
  courseTitle: string;
  lessonTitle: string;
  question: string;
  category: 'general' | 'technical' | 'concept' | 'assignment' | 'other';
  submittedAt: string;
  status: 'pending' | 'answered' | 'closed';
  replies: Reply[];
  lastActivity: string;
}

interface Reply {
  id: number;
  author: string;
  role: 'mentor' | 'student';
  content: string;
  timestamp: string;
}

const StudentDiscussions: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Discussion | null>(null);

  // Mock discussions data - in real app this would come from API
  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: 1,
      courseId: '1',
      courseTitle: 'Advanced React Development',
      lessonTitle: 'Context API Deep Dive',
      question: 'How do I properly implement context providers in a large application? I\'m having trouble with performance issues when the context value changes frequently.',
      category: 'technical',
      submittedAt: '2024-01-16T10:30:00Z',
      status: 'answered',
      lastActivity: '2024-01-16T14:20:00Z',
      replies: [
        {
          id: 1,
          author: 'Sarah Johnson',
          role: 'mentor',
          content: 'Great question! For large applications, you should split your contexts based on update frequency and scope. Use React.memo() for components that don\'t need to re-render on every context change.',
          timestamp: '2024-01-16T12:45:00Z'
        },
        {
          id: 2,
          author: 'Alex Johnson',
          role: 'student',
          content: 'Thank you! That makes sense. Should I create separate contexts for user data and app settings?',
          timestamp: '2024-01-16T13:10:00Z'
        },
        {
          id: 3,
          author: 'Sarah Johnson',
          role: 'mentor',
          content: 'Exactly! Separate contexts will prevent unnecessary re-renders. User data changes frequently, while app settings are more static.',
          timestamp: '2024-01-16T14:20:00Z'
        }
      ]
    },
    {
      id: 2,
      courseId: '2',
      courseTitle: 'Node.js Backend Mastery',
      lessonTitle: 'Database Integration',
      question: 'What are the best practices for connecting to MongoDB in a production environment? Should I use connection pooling?',
      category: 'concept',
      submittedAt: '2024-01-14T14:15:00Z',
      status: 'pending',
      lastActivity: '2024-01-14T14:15:00Z',
      replies: []
    },
    {
      id: 3,
      courseId: '3',
      courseTitle: 'JavaScript Fundamentals',
      lessonTitle: 'Error Handling',
      question: 'Can someone explain the difference between try-catch and promise rejection handling? I\'m confused about when to use each approach.',
      category: 'general',
      submittedAt: '2024-01-10T09:45:00Z',
      status: 'answered',
      lastActivity: '2024-01-12T16:30:00Z',
      replies: [
        {
          id: 4,
          author: 'Mike Chen',
          role: 'mentor',
          content: 'Try-catch is for synchronous code and async/await. Promise rejection handling (.catch()) is for promise chains. Both serve different purposes in error handling.',
          timestamp: '2024-01-11T10:20:00Z'
        },
        {
          id: 5,
          author: 'Alex Johnson',
          role: 'student',
          content: 'So for async/await I should use try-catch, but for .then() chains I should use .catch()?',
          timestamp: '2024-01-11T11:05:00Z'
        },
        {
          id: 6,
          author: 'Mike Chen',
          role: 'mentor',
          content: 'Correct! Try-catch with async/await makes error handling more readable and consistent with synchronous code patterns.',
          timestamp: '2024-01-12T16:30:00Z'
        }
      ]
    },
    {
      id: 4,
      courseId: '1',
      courseTitle: 'Advanced React Development',
      lessonTitle: 'Custom Hooks',
      question: 'I\'m creating a custom hook for data fetching. How should I handle loading states and error handling within the hook?',
      category: 'technical',
      submittedAt: '2024-01-08T16:20:00Z',
      status: 'closed',
      lastActivity: '2024-01-09T10:15:00Z',
      replies: [
        {
          id: 7,
          author: 'Sarah Johnson',
          role: 'mentor',
          content: 'You should return an object with data, loading, and error states. Use useReducer for complex state management or useState for simpler cases.',
          timestamp: '2024-01-09T10:15:00Z'
        }
      ]
    },
    {
      id: 5,
      courseId: '4',
      courseTitle: 'Full Stack Web Development',
      lessonTitle: 'API Design',
      question: 'What\'s the difference between REST and GraphQL APIs? When should I choose one over the other?',
      category: 'concept',
      submittedAt: '2024-01-05T11:30:00Z',
      status: 'answered',
      lastActivity: '2024-01-06T09:45:00Z',
      replies: [
        {
          id: 8,
          author: 'David Wilson',
          role: 'mentor',
          content: 'REST is simpler and widely supported. GraphQL gives you more flexibility but adds complexity. For simple CRUD operations, REST is fine. For complex data requirements, consider GraphQL.',
          timestamp: '2024-01-06T09:45:00Z'
        }
      ]
    }
  ]);

  const filterOptions = [
    { key: 'all', label: 'All Questions', count: discussions.length },
    { key: 'pending', label: 'Pending', count: discussions.filter(d => d.status === 'pending').length },
    { key: 'answered', label: 'Answered', count: discussions.filter(d => d.status === 'answered').length },
    { key: 'closed', label: 'Closed', count: discussions.filter(d => d.status === 'closed').length }
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'answered': { color: 'bg-green-100 text-green-800 border-green-200', text: 'Answered', icon: 'ri-check-circle-line' },
      'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Pending', icon: 'ri-time-line' },
      'closed': { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Closed', icon: 'ri-lock-line' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${config.color}`}>
        <i className={`${config.icon} mr-1`}></i>
        {config.text}
      </span>
    );
  };

  const getCategoryColor = (category: string) => {
    const categories = {
      'technical': 'bg-blue-100 text-blue-800 border-blue-200',
      'concept': 'bg-purple-100 text-purple-800 border-purple-200',
      'general': 'bg-gray-100 text-gray-800 border-gray-200',
      'assignment': 'bg-orange-100 text-orange-800 border-orange-200',
      'other': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return categories[category as keyof typeof categories] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredDiscussions = discussions.filter(discussion => {
    if (activeFilter === 'all') return true;
    return discussion.status === activeFilter;
  });

  const sortedDiscussions = [...filteredDiscussions].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    }
    return 0;
  });

  const openDiscussionDetail = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    setShowDetailModal(true);
  };

  const openActivityDetail = (discussion: Discussion, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedActivity(discussion);
    setShowActivityModal(true);
  };

  const getActivityTimeline = (discussion: Discussion) => {
    const activities = [
      {
        type: 'question',
        timestamp: discussion.submittedAt,
        description: 'Question submitted',
        icon: 'ri-question-line',
        color: 'bg-blue-100 text-blue-600'
      },
      ...discussion.replies.map((reply, index) => ({
        type: 'reply',
        timestamp: reply.timestamp,
        description: `Reply by ${reply.author} (${reply.role})`,
        icon: reply.role === 'mentor' ? 'ri-user-star-line' : 'ri-user-line',
        color: reply.role === 'mentor' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
      }))
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return activities;
  };

  const handleReply = () => {
    if (!selectedDiscussion || !replyText.trim()) return;

    const newReply: Reply = {
      id: Date.now(),
      author: 'Alex Johnson',
      role: 'student',
      content: replyText.trim(),
      timestamp: new Date().toISOString()
    };

    // Update the discussion with new reply
    setDiscussions(prev => prev.map(d => 
      d.id === selectedDiscussion.id 
        ? { 
            ...d, 
            replies: [...d.replies, newReply],
            lastActivity: new Date().toISOString()
          }
        : d
    ));

    // Update selected discussion
    setSelectedDiscussion(prev => prev ? {
      ...prev,
      replies: [...prev.replies, newReply],
      lastActivity: new Date().toISOString()
    } : null);

    setReplyText('');
  };

  const navigateToCourse = (courseId: string, lessonTitle: string) => {
    setShowDetailModal(false);
    // In real app, navigate to specific lesson within course
    console.log(`Navigate to course ${courseId}, lesson: ${lessonTitle}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Discussions</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">
            Track all your questions and discussions across courses
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
          >
            <option value="latest">Latest Activity</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs - Mobile Optimized */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-2">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setActiveFilter(option.key)}
            className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
              activeFilter === option.key
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {option.label}
            <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs rounded-full ${
              activeFilter === option.key
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {option.count}
            </span>
          </button>
        ))}
      </div>

      {/* Discussions List - Mobile Optimized */}
      {sortedDiscussions.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {sortedDiscussions.map((discussion) => (
            <Card key={discussion.id} className="hover:shadow-md transition-shadow cursor-pointer p-3 sm:p-6"
                  onClick={() => openDiscussionDetail(discussion)}>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${getCategoryColor(discussion.category)}`}>
                        {discussion.category}
                      </span>
                      {getStatusBadge(discussion.status)}
                      {discussion.replies.length > 0 && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <i className="ri-message-line mr-1"></i>
                          {discussion.replies.length} replies
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {discussion.question}
                    </h3>
                    <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                      <p className="flex items-center">
                        <i className="ri-book-line mr-2 text-blue-600"></i>
                        <span className="font-medium truncate">{discussion.courseTitle}</span>
                      </p>
                      <p className="flex items-center">
                        <i className="ri-play-circle-line mr-2 text-green-600"></i>
                        <span className="truncate">{discussion.lessonTitle}</span>
                      </p>
                    </div>
                    <div 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded px-2 py-1 transition-colors cursor-pointer space-y-1 sm:space-y-0"
                      onClick={(e) => openActivityDetail(discussion, e)}
                      title="Click to view activity timeline"
                    >
                      <span className="flex items-center">
                        <i className="ri-time-line mr-1"></i>
                        Asked on {formatDate(discussion.submittedAt)}
                      </span>
                      <span className="flex items-center">
                        <i className="ri-history-line mr-1"></i>
                        Last activity {formatDate(discussion.lastActivity)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-3 border-t border-gray-100 space-y-2 sm:space-y-0">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToCourse(discussion.courseId, discussion.lessonTitle);
                      }}
                    >
                      <i className="ri-external-link-line mr-1 sm:mr-2"></i>
                      View in Course
                    </Button>
                  </div>
                  <div className="text-xs text-gray-400 text-center sm:text-right">
                    Click to view full discussion
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-chat-3-line text-xl sm:text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {activeFilter === 'all' ? 'No discussions yet' : `No ${activeFilter} discussions`}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
            {activeFilter === 'all' 
              ? 'Ask questions during your lessons to start discussions with mentors'
              : `You don't have any ${activeFilter} discussions at the moment`
            }
          </p>
          <Link to="/student/my-courses">
            <Button className="w-full sm:w-auto">
              <i className="ri-book-line mr-2"></i>
              Browse Courses
            </Button>
          </Link>
        </div>
      )}

      {/* Discussion Detail Modal - Mobile Optimized */}
      <Modal 
        isOpen={showDetailModal} 
        onClose={() => setShowDetailModal(false)}
        className="max-w-4xl"
      >
        {selectedDiscussion && (
          <div className="p-3 sm:p-6">
            {/* Header - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${getCategoryColor(selectedDiscussion.category)}`}>
                    {selectedDiscussion.category}
                  </span>
                  {getStatusBadge(selectedDiscussion.status)}
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {selectedDiscussion.question}
                </h2>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <p className="flex items-center">
                    <i className="ri-book-line mr-2 text-blue-600"></i>
                    <span className="font-medium truncate">{selectedDiscussion.courseTitle}</span>
                  </p>
                  <p className="flex items-center">
                    <i className="ri-play-circle-line mr-2 text-green-600"></i>
                    <span className="truncate">{selectedDiscussion.lessonTitle}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Asked on {formatDate(selectedDiscussion.submittedAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-xs"
                  onClick={() => navigateToCourse(selectedDiscussion.courseId, selectedDiscussion.lessonTitle)}
                >
                  <i className="ri-external-link-line mr-1 sm:mr-2"></i>
                  Go to Lesson
                </Button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 w-full sm:w-auto"
                >
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>
            </div>

            {/* Replies - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {selectedDiscussion.replies.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                    <i className="ri-message-line mr-2"></i>
                    Replies ({selectedDiscussion.replies.length})
                  </h3>
                  {selectedDiscussion.replies.map((reply) => (
                    <div key={reply.id} className="flex space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-white text-xs sm:text-sm ${
                        reply.role === 'mentor' ? 'bg-blue-600' : 'bg-purple-600'
                      }`}>
                        {reply.author.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{reply.author}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            reply.role === 'mentor' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {reply.role === 'mentor' ? 'Mentor' : 'Student'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(reply.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                  <i className="ri-message-line text-xl sm:text-2xl text-gray-400 mb-2"></i>
                  <p className="text-sm sm:text-base text-gray-600">No replies yet. Be the first to continue the discussion!</p>
                </div>
              )}
            </div>

            {/* Reply Form - Mobile Optimized */}
            {selectedDiscussion.status !== 'closed' && (
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Add a Reply</h3>
                <div className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Continue the discussion..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-xs sm:text-sm"
                    rows={3}
                    maxLength={1000}
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="text-xs text-gray-500">
                      {replyText.length}/1000 characters
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-xs"
                        onClick={() => setReplyText('')}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        className="w-full sm:w-auto text-xs"
                        onClick={handleReply}
                        disabled={!replyText.trim()}
                      >
                        <i className="ri-send-plane-line mr-1 sm:mr-2"></i>
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Activity Timeline Modal - Mobile Optimized */}
      <Modal 
        isOpen={showActivityModal} 
        onClose={() => setShowActivityModal(false)}
        className="max-w-2xl"
      >
        {selectedActivity && (
          <div className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Activity Timeline
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {selectedActivity.question}
                </p>
              </div>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 w-full sm:w-auto"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Course Info - Mobile Optimized */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ri-book-line text-lg sm:text-xl text-blue-600"></i>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{selectedActivity.courseTitle}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedActivity.lessonTitle}</p>
                </div>
              </div>
            </div>

            {/* Timeline - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Discussion Activity</h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {getActivityTimeline(selectedActivity).map((activity, index) => (
                  <div key={index} className="relative flex items-start space-x-3 sm:space-x-4 pb-4 sm:pb-6 last:pb-0">
                    {/* Timeline dot */}
                    <div className={`relative z-10 w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 border-white shadow-md flex items-center justify-center ${activity.color}`}>
                      <i className={`${activity.icon} text-sm sm:text-lg`}></i>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1 sm:pt-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                      
                      {activity.type === 'question' && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Question was submitted for review
                        </p>
                      )}
                      
                      {activity.type === 'reply' && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          New response added to discussion
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats - Mobile Optimized */}
            <div className="border-t border-gray-200 pt-3 sm:pt-4 mt-4 sm:mt-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">
                    {selectedActivity.replies.length}
                  </div>
                  <div className="text-xs text-gray-500">Total Replies</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900">
                    {Math.ceil((new Date(selectedActivity.lastActivity).getTime() - new Date(selectedActivity.submittedAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-xs text-gray-500">Days Active</div>
                </div>
                <div>
                  <div className="text-base sm:text-lg font-semibold text-gray-900 capitalize">
                    {selectedActivity.status}
                  </div>
                  <div className="text-xs text-gray-500">Current Status</div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-3 sm:pt-4 mt-4 sm:mt-6 border-t border-gray-200 space-y-2 sm:space-y-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs"
                onClick={() => {
                  setShowActivityModal(false);
                  openDiscussionDetail(selectedActivity);
                }}
              >
                <i className="ri-message-line mr-1 sm:mr-2"></i>
                View Full Discussion
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs"
                onClick={() => navigateToCourse(selectedActivity.courseId, selectedActivity.lessonTitle)}
              >
                <i className="ri-external-link-line mr-1 sm:mr-2"></i>
                Go to Lesson
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentDiscussions;