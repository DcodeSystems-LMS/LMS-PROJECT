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
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="heading-secondary text-gray-900">Welcome back, Dr. Sarah!</h1>
            <p className="text-body text-gray-600">Here's what's happening with your mentoring today</p>
          </div>
          <Button 
            className="min-h-[44px]"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            <i className="ri-calendar-line mr-2"></i>
            Schedule Session
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-section">
        <div className="dashboard-grid">
          <Card variant="stats" className="animate-fade-in-up">
            <div className="flex items-center">
              <div className="p-4 bg-blue-100 rounded-xl">
                <i className="ri-group-line text-2xl text-blue-600"></i>
              </div>
              <div className="ml-6">
                <p className="text-caption text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">124</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <i className="ri-arrow-up-line mr-1"></i>
                  +8 this month
                </p>
              </div>
            </div>
          </Card>

          <Card variant="stats" className="animate-fade-in-up animate-delay-100">
            <div className="flex items-center">
              <div className="p-4 bg-green-100 rounded-xl">
                <i className="ri-calendar-check-line text-2xl text-green-600"></i>
              </div>
              <div className="ml-6">
                <p className="text-caption text-gray-600">Sessions This Week</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <i className="ri-calendar-line mr-1"></i>
                  3 today
                </p>
              </div>
            </div>
          </Card>

          <Card variant="stats" className="animate-fade-in-up animate-delay-200">
            <div className="flex items-center">
              <div className="p-4 bg-yellow-100 rounded-xl">
                <i className="ri-star-line text-2xl text-yellow-600"></i>
              </div>
              <div className="ml-6">
                <p className="text-caption text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} className="ri-star-fill text-yellow-400 text-sm"></i>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card variant="stats" className="animate-fade-in-up animate-delay-300">
            <div className="flex items-center">
              <div className="p-4 bg-purple-100 rounded-xl">
                <i className="ri-money-rupee-circle-line text-2xl text-purple-600"></i>
              </div>
              <div className="ml-6">
                <p className="text-caption text-gray-600">Monthly Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹2,70,000</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <i className="ri-arrow-up-line mr-1"></i>
                  +15% from last month
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="dashboard-section">
        <Card variant="dashboard" className="animate-fade-in-up">
          <div className="flex justify-between items-center mb-8">
            <h2 className="heading-tertiary text-gray-900">Today's Schedule</h2>
            <Link to="/mentor/sessions" className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
              View All Sessions
            </Link>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">JS</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">JavaScript Fundamentals - Doubt Session</h3>
                <p className="text-gray-600">With John Smith and 4 others</p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <i className="ri-time-line mr-1"></i>
                  2:00 PM - 3:00 PM
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" className="min-h-[36px]">
                  Reschedule
                </Button>
                <Button 
                  size="sm" 
                  className="min-h-[36px]"
                  onClick={() => handleStartSession({
                    title: 'JavaScript Fundamentals - Doubt Session',
                    students: 'John Smith and 4 others',
                    time: '2:00 PM - 3:00 PM',
                    type: 'Doubt Session'
                  })}
                >
                  Start Session
                </Button>
              </div>
            </div>

            <div className="flex items-center p-6 bg-green-50 rounded-xl border border-green-200">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">PY</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Python Data Structures - Group Study</h3>
                <p className="text-gray-600">With Alice Johnson and 6 others</p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <i className="ri-time-line mr-1"></i>
                  4:30 PM - 5:30 PM
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" className="min-h-[36px]">
                  View Details
                </Button>
                <Button size="sm" className="min-h-[36px]">
                  Prepare
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Student Progress */}
        <Card variant="dashboard" className="animate-fade-in-up">
          <h2 className="heading-tertiary text-gray-900 mb-6">Recent Student Progress</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">AS</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">Alice Smith</h3>
                  <p className="text-sm text-gray-600">Completed React.js Module 3</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">95%</p>
                <p className="text-xs text-gray-500">Score</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">JD</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">John Doe</h3>
                  <p className="text-sm text-gray-600">Submitted Python Assignment</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">Pending</p>
                <p className="text-xs text-gray-500">Review</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold text-sm">MJ</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">Mike Johnson</h3>
                  <p className="text-sm text-gray-600">Started JavaScript Course</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-purple-600">12%</p>
                <p className="text-xs text-gray-500">Progress</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Course Performance */}
        <Card variant="dashboard" className="animate-fade-in-up animate-delay-100">
          <h2 className="heading-tertiary text-gray-900 mb-6">Course Performance</h2>
          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900">React.js Fundamentals</h3>
                <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Active</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-gray-900">45</p>
                  <p className="text-xs text-gray-600">Students</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">4.7</p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">87%</p>
                  <p className="text-xs text-gray-600">Completion</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-900">Python for Beginners</h3>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">Popular</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-gray-900">78</p>
                  <p className="text-xs text-gray-600">Students</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">4.9</p>
                  <p className="text-xs text-gray-600">Rating</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">92%</p>
                  <p className="text-xs text-gray-600">Completion</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
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
