import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import Modal from '@/components/base/Modal';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';
import { authService } from '@/lib/auth';
import DataService from '@/services/dataService';
import type { ExtendedSession } from '@/services/dataService';
import Lottie from 'lottie-react';

const StudentDashboard: React.FC = () => {
  const [liveSessions, setLiveSessions] = useState<ExtendedSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ExtendedSession | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bannerAnimationData, setBannerAnimationData] = useState<any>(null);

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

  // Load Lottie animation for banner
  useEffect(() => {
    fetch('/Programming Computer.json')
      .then(response => response.json())
      .then(data => setBannerAnimationData(data))
      .catch(error => console.error('Error loading banner animation:', error));
  }, []);

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
      {/* Mobile-optimized container */}
      <div className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Banner with Lottie Animation - Mobile Optimized */}
          <div className="mb-4 sm:mb-6">
            <Card variant="dashboard" className="gradient-bg text-white relative overflow-hidden">
              <div className="relative z-10 p-3 sm:p-4 lg:p-5">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-4">
                  {/* Left Section - Welcome Text */}
                  <div className="flex-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white mb-1 lg:mb-2">
                  Welcome back, {currentUser?.name || 'Student'}!
                </h1>
                    <p className="text-xs sm:text-sm lg:text-base opacity-90 text-black dark:text-white">
                  Ready to continue your coding journey? Let's make today productive!
                </p>
                  </div>

                  {/* Right Section - Lottie Animation */}
                  {bannerAnimationData && (
                    <div className="flex-shrink-0 w-full sm:w-32 md:w-40 lg:w-48 h-24 sm:h-28 md:h-32 lg:h-36 flex items-center justify-center">
                      <Lottie 
                        animationData={bannerAnimationData} 
                        loop={true}
                        autoplay={true}
                        className="w-full h-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Floating background elements - hidden on small screens */}
              <div className="absolute top-4 right-4 floating-icon hidden sm:block opacity-20">
                <i className="ri-code-s-slash-line text-4xl lg:text-6xl"></i>
              </div>
              <div className="absolute bottom-4 right-20 floating-icon hidden lg:block opacity-20">
                <i className="ri-book-open-line text-3xl lg:text-4xl"></i>
              </div>
            </Card>
          </div>

          {/* Live Sessions Alert - Mobile Optimized */}
          {liveSessions.length > 0 && (
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <Card variant="dashboard" className="animate-fade-in-up border-l-4 border-l-red-500 bg-red-50">
                <div className="p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full mr-2 sm:mr-3">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                      <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">Live Sessions Available</h2>
                    </div>
                    <span className="text-xs sm:text-sm text-red-600 font-medium">
                      {liveSessions.filter(s => s.status === 'live').length} sessions live now
                    </span>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {liveSessions.map((session) => (
                      <div key={session.id} className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200 shadow-sm">
                        <div className="flex flex-col gap-3 sm:gap-4">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm lg:text-base flex-shrink-0 overflow-hidden">
                              {typeof session.avatar === 'string' && session.avatar ? (
                                <img src={session.avatar} alt={session.topic} className="w-full h-full object-cover" />
                              ) : (
                                ((session as any)?.mentor?.name || session.topic || 'S')
                                  .toString()
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{String(session.topic || 'Session')}</h3>
                              <p className="text-xs sm:text-sm text-gray-600 mb-2">by {String(session.mentor || 'Mentor')}</p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500">
                                <span className="flex items-center">
                                  <i className="ri-time-line mr-1"></i>
                                  {String(session.startTime || 'TBD')}
                                </span>
                                <span className="flex items-center">
                                  <i className="ri-group-line mr-1"></i>
                                  {String(session.participants || 0)}/{String(session.maxParticipants || 0)}
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
                          <div className="flex justify-end">
                            <Button 
                              onClick={() => handleJoinSession(session)}
                              size="sm"
                              className={`min-h-[36px] sm:min-h-[40px] whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 w-full sm:w-auto ${
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
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 overflow-hidden">
                    {typeof selectedSession.avatar === 'string' && selectedSession.avatar ? (
                      <img src={selectedSession.avatar} alt={selectedSession.topic} className="w-full h-full object-cover" />
                    ) : (
                      ((selectedSession as any)?.mentor?.name || selectedSession.topic || 'S')
                        .toString()
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{String(selectedSession.topic || 'Session')}</h3>
                  <p className="text-gray-600">by {String(selectedSession.mentor || 'Mentor')}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subject:</span>
                    <span className="font-medium text-gray-900">{String(selectedSession.subject || 'N/A')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Start Time:</span>
                    <span className="font-medium text-gray-900">{String(selectedSession.startTime || 'TBD')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Participants:</span>
                    <span className="font-medium text-gray-900">{String(selectedSession.participants || 0)}/{String(selectedSession.maxParticipants || 0)}</span>
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
                          This session will begin at {String(selectedSession.startTime || 'TBD')}. You'll be notified when it starts.
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
                        <SimpleDCODESpinner size="sm" className="mr-2" />
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

          {/* Modern Stats Section - Clean Design */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Your Progress</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-3 group-hover:shadow-lg group-hover:shadow-blue-200 transition-shadow">
                    <i className="ri-book-line text-white text-lg sm:text-xl"></i>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">8</div>
                  <div className="text-xs sm:text-sm text-gray-600">Enrolled Courses</div>
                </div>

                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-3 group-hover:shadow-lg group-hover:shadow-green-200 transition-shadow">
                    <i className="ri-checkbox-circle-line text-white text-lg sm:text-xl"></i>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">5</div>
                  <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                </div>

                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-3 group-hover:shadow-lg group-hover:shadow-purple-200 transition-shadow">
                    <i className="ri-trophy-line text-white text-lg sm:text-xl"></i>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">12</div>
                  <div className="text-xs sm:text-sm text-gray-600">Achievements</div>
                </div>

                <div className="text-center group hover:scale-105 transition-transform duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-3 group-hover:shadow-lg group-hover:shadow-orange-200 transition-shadow">
                    <i className="ri-time-line text-white text-lg sm:text-xl"></i>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">142</div>
                  <div className="text-xs sm:text-sm text-gray-600">Study Hours</div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Course Progress - Mobile Optimized */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <Card variant="dashboard" className="animate-fade-in-up">
              <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
                  <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900">Continue Learning</h2>
                  <Link to="/student/my-courses" className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer text-xs sm:text-sm lg:text-base">
                    View All Courses
                  </Link>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                    <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex-1">
                        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1">React.js Advanced Concepts</h3>
                        <p className="text-xs sm:text-sm lg:text-base text-gray-600">Next: State Management with Redux</p>
                      </div>
                      <Link to="/student/continue" className="w-full sm:w-auto">
                        <Button className="min-h-[36px] sm:min-h-[44px] w-full sm:w-auto text-xs sm:text-sm">
                          <i className="ri-play-circle-line mr-1 sm:mr-2"></i>
                          Continue
                        </Button>
                      </Link>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div className="bg-blue-600 h-1.5 sm:h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">75% complete</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Achievements and Upcoming Sessions - Mobile Optimized */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Recent Achievements */}
            <Card variant="dashboard" className="animate-fade-in-up">
              <div className="p-3 sm:p-4 lg:p-6">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Recent Achievements</h2>
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  <div className="flex items-start p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="p-2 sm:p-3 bg-yellow-100 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                      <i className="ri-trophy-line text-sm sm:text-lg lg:text-xl text-yellow-600"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base">JavaScript Expert</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Completed advanced JavaScript course</p>
                    </div>
                  </div>

                  <div className="flex items-start p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="p-2 sm:p-3 bg-green-100 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                      <i className="ri-medal-line text-sm sm:text-lg lg:text-xl text-green-600"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base">Quick Learner</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Completed 3 courses this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Upcoming Sessions */}
            <Card variant="dashboard" className="animate-fade-in-up animate-delay-100">
              <div className="p-3 sm:p-4 lg:p-6">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Upcoming Sessions</h2>
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  <div className="flex flex-col gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center flex-1">
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                        <i className="ri-calendar-line text-sm sm:text-lg lg:text-xl text-blue-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base">React.js Doubt Session</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Today, 3:00 PM - 4:00 PM</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="min-h-[32px] sm:min-h-[36px] w-full text-xs sm:text-sm">
                      Join
                    </Button>
                  </div>

                  <div className="flex flex-col gap-3 p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center flex-1">
                      <div className="p-2 sm:p-3 bg-purple-100 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                        <i className="ri-group-line text-sm sm:text-lg lg:text-xl text-purple-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-xs sm:text-sm lg:text-base">Career Guidance</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Tomorrow, 2:00 PM - 3:00 PM</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="min-h-[32px] sm:min-h-[36px] w-full text-xs sm:text-sm">
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
