import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import Modal from '@/components/base/Modal';
import { authService } from '@/lib/auth';
import DataService from '@/services/dataService';
import type { ExtendedSession } from '@/services/dataService';

const StudentDashboard: React.FC = () => {
  const [liveSessions, setLiveSessions] = useState<ExtendedSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ExtendedSession | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  // Safely retrieve the current user; fall back to null if the service fails
  let currentUser = null;
  try {
    currentUser = authService?.getCurrentUserSync?.();
  } catch (error) {
    console.error('Error fetching current user:', error);
  }

  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        if (!currentUser?.id) return;
        
        const sessions = await DataService.getSessions(currentUser.id, 'student');
        
        // Filter for live sessions (scheduled within next 30 minutes)
        const live = sessions.filter(s => s.status === 'scheduled' && 
          new Date(s.scheduled_at) <= new Date(Date.now() + 30 * 60 * 1000));
        
        setLiveSessions(live);
      } catch (error) {
        console.error('Error fetching live sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveSessions();
  }, [currentUser?.id]);

  const handleJoinSession = (session: any) => {
    setSelectedSession(session);
    setShowJoinModal(true);
  };

  const confirmJoinSession = async () => {
    if (!selectedSession) return;
    
    setIsJoining(true);
    
    // Simulate joining process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update participant count
    setLiveSessions(prev => 
      prev.map(session => 
        session.id === selectedSession.id 
          ? { ...session, participants: session.participants + 1 }
          : session
      )
    );
    
    setIsJoining(false);
    setShowJoinModal(false);
    setSelectedSession(null);
    
    // In a real app, this would redirect to the live session room
    // For demo, we'll show a success message
    alert(`Successfully joined ${selectedSession.topic}!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first responsive container */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-6 lg:mb-8">
            <Card variant="dashboard" className="gradient-bg text-white relative overflow-hidden">
              <div className="relative z-10 p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white mb-2 lg:mb-4">
                  Welcome back, {currentUser?.name || 'Student'}!
                </h1>
                <p className="text-base sm:text-lg lg:text-xl opacity-90 text-black dark:text-white">
                  Ready to continue your coding journey? Let's make today productive!
                </p>
              </div>

              {/* Floating background elements - hidden on small screens */}
              <div className="absolute top-4 right-4 floating-icon hidden sm:block">
                <i className="ri-code-s-slash-line text-4xl lg:text-6xl"></i>
              </div>
              <div className="absolute bottom-4 right-20 floating-icon hidden lg:block">
                <i className="ri-book-open-line text-3xl lg:text-4xl"></i>
              </div>
            </Card>
          </div>

          {/* Live Sessions Alert */}
          {liveSessions.length > 0 && (
            <div className="mb-6 lg:mb-8">
              <Card variant="dashboard" className="animate-fade-in-up border-l-4 border-l-red-500 bg-red-50">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full mr-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Live Sessions Available</h2>
                    </div>
                    <span className="text-sm text-red-600 font-medium">
                      {liveSessions.filter(s => s.status === 'live').length} sessions live now
                    </span>
                  </div>

                  <div className="space-y-4">
                    {liveSessions.map((session) => (
                      <div key={session.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                              {session.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{session.topic}</h3>
                              <p className="text-xs sm:text-sm text-gray-600 mb-2">by {session.mentor}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500">
                                <span className="flex items-center">
                                  <i className="ri-time-line mr-1"></i>
                                  {session.startTime}
                                </span>
                                <span className="flex items-center">
                                  <i className="ri-group-line mr-1"></i>
                                  {session.participants}/{session.maxParticipants}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  session.status === 'live' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {session.status === 'live' ? (
                                    <span className="flex items-center">
                                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                                      LIVE
                                    </span>
                                  ) : (
                                    'Starting Soon'
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end sm:justify-start">
                            <Button 
                              onClick={() => handleJoinSession(session)}
                              size="sm"
                              className={`min-h-[40px] whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 ${
                                session.status === 'live' 
                                  ? 'bg-red-600 hover:bg-red-700' 
                                  : 'bg-yellow-600 hover:bg-yellow-700'
                              }`}
                            >
                              <i className={`${session.status === 'live' ? 'ri-live-line' : 'ri-calendar-line'} mr-1 sm:mr-2`}></i>
                              {session.status === 'live' ? 'Join Live' : 'Join Soon'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Join Session Modal */}
          <Modal
            isOpen={showJoinModal}
            onClose={() => !isJoining && setShowJoinModal(false)}
            title={selectedSession?.status === 'live' ? 'Join Live Session' : 'Join Upcoming Session'}
            size="md"
          >
            {selectedSession && (
              <div className="space-y-6 p-4 sm:p-0">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {selectedSession.avatar}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{selectedSession.topic}</h3>
                  <p className="text-gray-600">by {selectedSession.mentor}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subject:</span>
                    <span className="font-medium text-gray-900">{selectedSession.subject}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Start Time:</span>
                    <span className="font-medium text-gray-900">{selectedSession.startTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Participants:</span>
                    <span className="font-medium text-gray-900">{selectedSession.participants}/{selectedSession.maxParticipants}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedSession.status === 'live' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedSession.status === 'live' ? (
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                          LIVE NOW
                        </span>
                      ) : (
                        'Starting Soon'
                      )}
                    </span>
                  </div>
                </div>

                {selectedSession.status === 'starting-soon' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <i className="ri-information-line text-yellow-600 text-lg mr-3 mt-0.5 flex-shrink-0"></i>
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-1">Session Starting Soon</h4>
                        <p className="text-sm text-yellow-700">
                          This session will begin at {selectedSession.startTime}. You'll be notified when it starts.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowJoinModal(false)}
                    disabled={isJoining}
                    className="flex-1 min-h-[44px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmJoinSession}
                    disabled={isJoining}
                    className={`flex-1 min-h-[44px] ${
                      selectedSession.status === 'live' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    {isJoining ? (
                      <>
                        <i className="ri-loader-4-line mr-2 animate-spin"></i>
                        Joining...
                      </>
                    ) : (
                      <>
                        <i className={`${selectedSession.status === 'live' ? 'ri-live-line' : 'ri-calendar-check-line'} mr-2`}></i>
                        {selectedSession.status === 'live' ? 'Join Now' : 'Set Reminder'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Modal>

          {/* Stats Grid - Responsive */}
          <div className="mb-6 lg:mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card variant="stats" className="animate-fade-in-up">
                <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-6">
                  <div className="p-3 sm:p-4 bg-blue-100 rounded-xl mb-3 sm:mb-0 sm:mr-4 self-start sm:self-auto">
                    <i className="ri-book-line text-xl sm:text-2xl text-blue-600"></i>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Enrolled Courses</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">8</p>
                  </div>
                </div>
              </Card>

              <Card variant="stats" className="animate-fade-in-up animate-delay-100">
                <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-6">
                  <div className="p-3 sm:p-4 bg-green-100 rounded-xl mb-3 sm:mb-0 sm:mr-4 self-start sm:self-auto">
                    <i className="ri-checkbox-circle-line text-xl sm:text-2xl text-green-600"></i>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">5</p>
                  </div>
                </div>
              </Card>

              <Card variant="stats" className="animate-fade-in-up animate-delay-200">
                <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-6">
                  <div className="p-3 sm:p-4 bg-purple-100 rounded-xl mb-3 sm:mb-0 sm:mr-4 self-start sm:self-auto">
                    <i className="ri-trophy-line text-xl sm:text-2xl text-purple-600"></i>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Achievements</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </Card>

              <Card variant="stats" className="animate-fade-in-up animate-delay-300">
                <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-6">
                  <div className="p-3 sm:p-4 bg-orange-100 rounded-xl mb-3 sm:mb-0 sm:mr-4 self-start sm:self-auto">
                    <i className="ri-time-line text-xl sm:text-2xl text-orange-600"></i>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Study Hours</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">142</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Current Course Progress */}
          <div className="mb-6 lg:mb-8">
            <Card variant="dashboard" className="animate-fade-in-up">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 lg:mb-8 gap-4">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Continue Learning</h2>
                  <Link to="/student/my-courses" className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer text-sm sm:text-base">
                    View All Courses
                  </Link>
                </div>

                <div className="space-y-6">
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">React.js Advanced Concepts</h3>
                        <p className="text-sm sm:text-base text-gray-600">Next: State Management with Redux</p>
                      </div>
                      <Link to="/student/continue">
                        <Button className="min-h-[44px] w-full sm:w-auto">
                          <i className="ri-play-circle-line mr-2"></i>
                          Continue
                        </Button>
                      </Link>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">75% complete</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Achievements and Upcoming Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Recent Achievements */}
            <Card variant="dashboard" className="animate-fade-in-up">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Recent Achievements</h2>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start sm:items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="p-3 bg-yellow-100 rounded-full mr-4 flex-shrink-0">
                      <i className="ri-trophy-line text-lg sm:text-xl text-yellow-600"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">JavaScript Expert</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Completed advanced JavaScript course</p>
                    </div>
                  </div>

                  <div className="flex items-start sm:items-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="p-3 bg-green-100 rounded-full mr-4 flex-shrink-0">
                      <i className="ri-medal-line text-lg sm:text-xl text-green-600"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">Quick Learner</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Completed 3 courses this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Upcoming Sessions */}
            <Card variant="dashboard" className="animate-fade-in-up animate-delay-100">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Upcoming Sessions</h2>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center p-4 bg-blue-50 rounded-lg border border-blue-200 gap-3">
                    <div className="flex items-center flex-1">
                      <div className="p-3 bg-blue-100 rounded-full mr-4 flex-shrink-0">
                        <i className="ri-calendar-line text-lg sm:text-xl text-blue-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">React.js Doubt Session</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Today, 3:00 PM - 4:00 PM</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="min-h-[36px] w-full sm:w-auto">
                      Join
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center p-4 bg-purple-50 rounded-lg border border-purple-200 gap-3">
                    <div className="flex items-center flex-1">
                      <div className="p-3 bg-purple-100 rounded-full mr-4 flex-shrink-0">
                        <i className="ri-group-line text-lg sm:text-xl text-purple-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">Career Guidance</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Tomorrow, 2:00 PM - 3:00 PM</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="min-h-[36px] w-full sm:w-auto">
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
