import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/base/Button';
import Card from '@/components/base/Card';
import Modal from '@/components/base/Modal';
import ScheduleSessionModal from '@/pages/mentor/students/components/ScheduleSessionModal';
import DataService from '@/services/dataService';
import type { ExtendedSession } from '@/services/dataService';

const MentorDashboard: React.FC = () => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isStartSessionModalOpen, setIsStartSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ExtendedSession | null>(null);
  const [liveSessions, setLiveSessions] = useState<ExtendedSession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<ExtendedSession[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock student data for the modal
  const mockStudent = {
    id: 1,
    name: 'Select Student',
    course: 'General Session'
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Get current user ID from auth service
        const { authService } = await import('@/lib/auth');
        const currentUser = await authService.getCurrentUser();
        
        if (!currentUser?.id) {
          console.warn('No authenticated user found');
          return;
        }
        
        const sessions = await DataService.getSessions(currentUser.id, 'mentor');
        
        // Filter sessions by status
        const live = sessions.filter(s => s.status === 'scheduled' && 
          new Date(s.scheduled_at) <= new Date(Date.now() + 30 * 60 * 1000)); // Within next 30 minutes
        const upcoming = sessions.filter(s => s.status === 'scheduled' && 
          new Date(s.scheduled_at) > new Date());
        
        setLiveSessions(live);
        setUpcomingSessions(upcoming);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleStartSession = (sessionData: any) => {
    setSelectedSession(sessionData);
    setIsStartSessionModalOpen(true);
  };

  const handleJoinSession = () => {
    // Simulate joining the session
    window.open('https://meet.google.com/abc-defg-hij', '_blank');
    setIsStartSessionModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 sm:p-6">
      {/* Revolutionary Mobile Hero Section */}
      <div className="mb-8">
        <div className="text-center sm:text-left">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
              <i className="ri-sparkling-line mr-2"></i>
              Mentor Dashboard
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome back, Dr. Sarah! 👋
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6">Here's what's happening with your mentoring today</p>
          <button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-medium text-base w-full sm:w-auto"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            <i className="ri-calendar-add-line mr-2"></i>
            Schedule New Session
          </button>
        </div>
      </div>

      {/* Revolutionary Stats Cards */}
      <div className="mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-3xl">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <i className="ri-group-line text-2xl text-white"></i>
            </div>
            <div className="text-3xl font-bold text-white mb-1">124</div>
            <div className="text-blue-100 text-sm mb-2">Total Students</div>
            <div className="bg-white/20 rounded-full px-3 py-1 text-xs text-white">
              <i className="ri-arrow-up-line mr-1"></i>
              +8 this month
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-3xl">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <i className="ri-calendar-check-line text-2xl text-white"></i>
            </div>
            <div className="text-3xl font-bold text-white mb-1">18</div>
            <div className="text-green-100 text-sm mb-2">Sessions This Week</div>
            <div className="bg-white/20 rounded-full px-3 py-1 text-xs text-white">
              <i className="ri-calendar-line mr-1"></i>
              3 today
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl shadow-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-3xl">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <i className="ri-star-line text-2xl text-white"></i>
            </div>
            <div className="text-3xl font-bold text-white mb-1">4.8</div>
            <div className="text-yellow-100 text-sm mb-2">Average Rating</div>
            <div className="flex items-center justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className="ri-star-fill text-white text-sm"></i>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-3xl">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <i className="ri-money-rupee-circle-line text-2xl text-white"></i>
            </div>
            <div className="text-3xl font-bold text-white mb-1">₹2.7L</div>
            <div className="text-purple-100 text-sm mb-2">Monthly Earnings</div>
            <div className="bg-white/20 rounded-full px-3 py-1 text-xs text-white">
              <i className="ri-arrow-up-line mr-1"></i>
              +15% from last month
            </div>
          </div>
        </div>
      </div>

      {/* Revolutionary Today's Schedule */}
      <div className="mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">📅 Today's Schedule</h2>
                <p className="text-sm text-gray-600">Your upcoming mentoring sessions</p>
              </div>
              <Link to="/mentor/sessions" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium text-sm w-full sm:w-auto text-center">
                <i className="ri-calendar-line mr-2"></i>
                View All Sessions
              </Link>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50 p-6 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">JS</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">JavaScript Fundamentals - Doubt Session</h3>
                    <p className="text-sm text-gray-600 mb-2">With John Smith and 4 others</p>
                    <div className="flex items-center text-sm text-blue-600">
                      <i className="ri-time-line mr-2"></i>
                      <span className="font-medium">2:00 PM - 3:00 PM</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm font-medium w-full sm:w-auto">
                    <i className="ri-calendar-line mr-2"></i>
                    Reschedule
                  </button>
                  <button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm font-medium w-full sm:w-auto"
                    onClick={() => handleStartSession({
                      title: 'JavaScript Fundamentals - Doubt Session',
                      students: 'John Smith and 4 others',
                      time: '2:00 PM - 3:00 PM',
                      type: 'Doubt Session'
                    })}
                  >
                    <i className="ri-play-circle-line mr-2"></i>
                    Start Session
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 p-6 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">PY</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Python Data Structures - Group Study</h3>
                    <p className="text-sm text-gray-600 mb-2">With Alice Johnson and 6 others</p>
                    <div className="flex items-center text-sm text-green-600">
                      <i className="ri-time-line mr-2"></i>
                      <span className="font-medium">4:30 PM - 5:30 PM</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm font-medium w-full sm:w-auto">
                    <i className="ri-eye-line mr-2"></i>
                    View Details
                  </button>
                  <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg text-sm font-medium w-full sm:w-auto">
                    <i className="ri-book-open-line mr-2"></i>
                    Prepare
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Revolutionary Recent Student Progress */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">🎯 Recent Student Progress</h2>
            <p className="text-sm text-gray-600">Latest achievements from your students</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 p-4 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">AS</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-bold text-gray-900">Alice Smith</h3>
                    <p className="text-sm text-gray-600">Completed React.js Module 3</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">95%</div>
                  <p className="text-xs text-gray-500 mt-1">Score</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50 p-4 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">JD</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-bold text-gray-900">John Doe</h3>
                    <p className="text-sm text-gray-600">Submitted Python Assignment</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">Pending</div>
                  <p className="text-xs text-gray-500 mt-1">Review</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50 p-4 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">MJ</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-bold text-gray-900">Mike Johnson</h3>
                    <p className="text-sm text-gray-600">Started JavaScript Course</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">12%</div>
                  <p className="text-xs text-gray-500 mt-1">Progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revolutionary Course Performance */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">📊 Course Performance</h2>
            <p className="text-sm text-gray-600">Your courses are performing great!</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50 p-6 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-bold text-gray-900">React.js Fundamentals</h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">Active</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-gray-900">45</p>
                  <p className="text-xs text-gray-600">Students</p>
                </div>
                <div className="bg-white/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-gray-900">4.7</p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div className="bg-white/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-gray-900">87%</p>
                  <p className="text-xs text-gray-600">Completion</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 p-6 transform hover:scale-105 transition-all duration-300 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-bold text-gray-900">Python for Beginners</h3>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">Popular</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-gray-900">78</p>
                  <p className="text-xs text-gray-600">Students</p>
                </div>
                <div className="bg-white/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-gray-900">4.9</p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div className="bg-white/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-gray-900">92%</p>
                  <p className="text-xs text-gray-600">Completion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Session Modal */}
      <ScheduleSessionModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        student={mockStudent}
      />

      {/* Start Session Modal */}
      <Modal
        isOpen={isStartSessionModalOpen}
        onClose={() => setIsStartSessionModalOpen(false)}
        title="Start Session"
        size="md"
      >
        <div className="space-y-6">
          {selectedSession && (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedSession.title}</h3>
                <p className="text-gray-600 text-sm mb-1">Students: {selectedSession.students}</p>
                <p className="text-gray-600 text-sm">Time: {selectedSession.time}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Pre-Session Checklist</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-blue-600 mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Camera and microphone tested</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-blue-600 mr-2" defaultChecked />
                      <span className="text-sm text-gray-700">Session materials prepared</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded text-blue-600 mr-2" />
                      <span className="text-sm text-gray-700">Screen sharing setup ready</span>
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start">
                    <i className="ri-information-line text-yellow-600 mt-0.5 mr-2"></i>
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Session Notes</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        This is a doubt clearing session. Students may have questions about JavaScript fundamentals, 
                        variables, functions, and basic DOM manipulation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsStartSessionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleJoinSession}>
                  <i className="ri-video-line mr-2"></i>
                  Join Session
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MentorDashboard;
