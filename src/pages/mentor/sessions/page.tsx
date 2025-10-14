
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
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
            <p className="text-gray-600 mt-2">Manage your mentoring sessions</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer">
            Schedule Session
          </button>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-blue-100 rounded-full">
            <i className="ri-calendar-line text-2xl text-blue-600"></i>
          </div>
          <div className="text-2xl font-bold text-gray-900">8</div>
          <div className="text-sm text-gray-600">This Week</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-green-100 rounded-full">
            <i className="ri-time-line text-2xl text-green-600"></i>
          </div>
          <div className="text-2xl font-bold text-gray-900">24</div>
          <div className="text-sm text-gray-600">Hours This Month</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-yellow-100 rounded-full">
            <i className="ri-star-line text-2xl text-yellow-600"></i>
          </div>
          <div className="text-2xl font-bold text-gray-900">4.8</div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-purple-100 rounded-full">
            <i className="ri-group-line text-2xl text-purple-600"></i>
          </div>
          <div className="text-2xl font-bold text-gray-900">156</div>
          <div className="text-sm text-gray-600">Total Sessions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'upcoming' && (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">{session.avatar}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{session.subject}</h3>
                        <p className="text-sm text-gray-600">with {session.student}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <i className="ri-calendar-line mr-1"></i>
                            {session.date}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-time-line mr-1"></i>
                            {session.time}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            session.type === 'Group' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {session.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status}
                      </span>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap cursor-pointer">
                        Join Session
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm whitespace-nowrap cursor-pointer">
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="space-y-4">
              {completedSessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">{session.avatar}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{session.subject}</h3>
                        <p className="text-sm text-gray-600">with {session.student}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <i className="ri-calendar-line mr-1"></i>
                            {session.date}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-time-line mr-1"></i>
                            {session.time}
                          </span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {session.type}
                          </span>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`ri-star-${i < session.rating ? 'fill' : 'line'} text-yellow-400 text-sm`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">({session.rating}/5)</span>
                          </div>
                          <p className="text-sm text-gray-700 italic">"{session.feedback}"</p>
                        </div>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer whitespace-nowrap">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'cancelled' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-calendar-close-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Cancelled Sessions</h3>
              <p className="text-gray-600">You don't have any cancelled sessions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorSessions;
