
import React, { useState } from 'react';

const MentorSessions: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: 8 },
    { id: 'completed', label: 'Completed', count: 45 },
    { id: 'cancelled', label: 'Cancelled', count: 3 },
  ];

  const upcomingSessions = [
    {
      id: 1,
      student: 'John Doe',
      subject: 'React Fundamentals',
      date: 'Dec 25, 2024',
      time: '09:00 AM - 10:00 AM',
      type: '1-on-1',
      status: 'confirmed',
      avatar: 'JD'
    },
    {
      id: 2,
      student: 'Jane Smith',
      subject: 'JavaScript Advanced',
      date: 'Dec 25, 2024',
      time: '11:00 AM - 12:00 PM',
      type: '1-on-1',
      status: 'pending',
      avatar: 'JS'
    },
    {
      id: 3,
      student: 'Web Dev Group',
      subject: 'Full Stack Workshop',
      date: 'Dec 25, 2024',
      time: '02:00 PM - 04:00 PM',
      type: 'Group',
      status: 'confirmed',
      avatar: 'WD'
    },
  ];

  const completedSessions = [
    {
      id: 4,
      student: 'Alice Brown',
      subject: 'Node.js Backend',
      date: 'Dec 22, 2024',
      time: '10:00 AM - 11:00 AM',
      type: '1-on-1',
      rating: 5,
      feedback: 'Excellent session! Very helpful explanations.',
      avatar: 'AB'
    },
    {
      id: 5,
      student: 'Bob Wilson',
      subject: 'React Components',
      date: 'Dec 21, 2024',
      time: '03:00 PM - 04:00 PM',
      type: '1-on-1',
      rating: 4,
      feedback: 'Good session, learned a lot about hooks.',
      avatar: 'BW'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      {/* Stunning Mobile Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sessions
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Manage your mentoring sessions</p>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap cursor-pointer font-medium">
            <i className="ri-calendar-add-line mr-2"></i>
            Schedule Session
          </button>
        </div>
      </div>

      {/* Stunning Mobile Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-4 sm:p-6 text-center transform hover:scale-105 transition-all duration-300">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 bg-white/20 rounded-full backdrop-blur-sm">
            <i className="ri-calendar-line text-lg sm:text-2xl text-white"></i>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">8</div>
          <div className="text-xs sm:text-sm text-blue-100">This Week</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-4 sm:p-6 text-center transform hover:scale-105 transition-all duration-300">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 bg-white/20 rounded-full backdrop-blur-sm">
            <i className="ri-time-line text-lg sm:text-2xl text-white"></i>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">24</div>
          <div className="text-xs sm:text-sm text-green-100">Hours This Month</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-4 sm:p-6 text-center transform hover:scale-105 transition-all duration-300">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 bg-white/20 rounded-full backdrop-blur-sm">
            <i className="ri-star-line text-lg sm:text-2xl text-white"></i>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">4.8</div>
          <div className="text-xs sm:text-sm text-yellow-100">Average Rating</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-4 sm:p-6 text-center transform hover:scale-105 transition-all duration-300">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-3 bg-white/20 rounded-full backdrop-blur-sm">
            <i className="ri-group-line text-lg sm:text-2xl text-white"></i>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white">156</div>
          <div className="text-xs sm:text-sm text-purple-100">Total Sessions</div>
        </div>
      </div>

      {/* Stunning Mobile Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-1">
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="font-semibold">{tab.label}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'upcoming' && (
            <div className="space-y-4 sm:space-y-6">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="bg-gradient-to-r from-white to-blue-50/30 rounded-2xl shadow-lg border border-blue-100/50 p-4 sm:p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm sm:text-base">{session.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{session.subject}</h3>
                        <p className="text-sm sm:text-base text-gray-600 truncate">with {session.student}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-2">
                          <span className="flex items-center">
                            <i className="ri-calendar-line mr-1 text-blue-500"></i>
                            {session.date}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-time-line mr-1 text-green-500"></i>
                            {session.time}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            session.type === 'Group' 
                              ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200' 
                              : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200'
                          }`}>
                            {session.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile: Status and Actions */}
                    <div className="flex flex-col sm:hidden space-y-3">
                      <div className="flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.status === 'confirmed' 
                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                            : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm font-medium cursor-pointer">
                          <i className="ri-video-line mr-1"></i>
                          Join
                        </button>
                        <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm font-medium cursor-pointer">
                          <i className="ri-calendar-line mr-1"></i>
                          Reschedule
                        </button>
                      </div>
                    </div>

                    {/* Desktop: Status and Actions */}
                    <div className="hidden sm:flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.status === 'confirmed' 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                          : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {session.status}
                      </span>
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm font-medium cursor-pointer">
                        <i className="ri-video-line mr-1"></i>
                        Join Session
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm font-medium cursor-pointer">
                        <i className="ri-calendar-line mr-1"></i>
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="space-y-4 sm:space-y-6">
              {completedSessions.map((session) => (
                <div key={session.id} className="bg-gradient-to-r from-white to-green-50/30 rounded-2xl shadow-lg border border-green-100/50 p-4 sm:p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm sm:text-base">{session.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{session.subject}</h3>
                        <p className="text-sm sm:text-base text-gray-600 truncate">with {session.student}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-2">
                          <span className="flex items-center">
                            <i className="ri-calendar-line mr-1 text-blue-500"></i>
                            {session.date}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-time-line mr-1 text-green-500"></i>
                            {session.time}
                          </span>
                          <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                            {session.type}
                          </span>
                        </div>
                        
                        {/* Stunning Feedback Card */}
                        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/50 shadow-sm">
                          <div className="flex items-center mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`ri-star-${i < session.rating ? 'fill' : 'line'} text-yellow-400 text-sm sm:text-base`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm sm:text-base text-gray-600 font-medium">({session.rating}/5)</span>
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 italic leading-relaxed">"{session.feedback}"</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mobile: View Details Button */}
                    <div className="flex sm:hidden">
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm font-medium cursor-pointer">
                        <i className="ri-eye-line mr-1"></i>
                        View Details
                      </button>
                    </div>

                    {/* Desktop: View Details Button */}
                    <div className="hidden sm:flex">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer whitespace-nowrap px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300">
                        <i className="ri-eye-line mr-1"></i>
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'cancelled' && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <i className="ri-calendar-close-line text-2xl sm:text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">No Cancelled Sessions</h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
                Great job! You don't have any cancelled sessions. Keep up the excellent work with your students.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorSessions;

