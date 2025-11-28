import React, { useState, useEffect } from 'react';
import ScheduleSessionModal from './components/ScheduleSessionModal';
import ViewProgressModal from './components/ViewProgressModal';
import SendMessageModal from './components/SendMessageModal';
import DataService from '@/services/dataService';
import type { ExtendedProfile } from '@/services/dataService';

const MentorStudents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<ExtendedProfile | null>(null);
  const [students, setStudents] = useState<ExtendedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modals, setModals] = useState({
    scheduleSession: false,
    viewProgress: false,
    sendMessage: false
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Get current mentor ID from auth service
        const { authService } = await import('@/lib/auth');
        const currentUser = await authService.getCurrentUser();
        
        if (!currentUser?.id) {
          console.warn('No authenticated user found');
          return;
        }
        
        // Get sessions for this mentor to find their students
        const sessions = await DataService.getSessions(currentUser.id, 'mentor');
        const enrollments = await DataService.getEnrollments();
        
        // Get unique student IDs from sessions
        const studentIds = [...new Set(sessions.map(s => s.student_id))];
        
        // Fetch student profiles
        const studentProfiles = await Promise.all(
          studentIds.map(id => DataService.getProfile(id))
        );
        
        // Enhance student data with enrollment information
        const enhancedStudents = studentProfiles.filter(Boolean).map(student => {
          const studentEnrollments = enrollments.filter(e => e.student_id === student!.id);
          const latestEnrollment = studentEnrollments.sort((a, b) => 
            new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime()
          )[0];
          
          const studentSessions = sessions.filter(s => s.student_id === student!.id);
          const lastSession = studentSessions.sort((a, b) => 
            new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
          )[0];
          
          return {
            ...student!,
            course: latestEnrollment?.course?.title || 'No course enrolled',
            progress: latestEnrollment?.progress || 0,
            status: studentEnrollments.length > 0 ? 'active' : 'inactive',
            joinDate: latestEnrollment?.enrolled_at || student!.created_at,
            lastSession: lastSession ? new Date(lastSession.scheduled_at).toLocaleDateString() : 'No sessions',
            totalSessions: studentSessions.length,
            avatar: student!.name.split(' ').map(n => n[0]).join('').toUpperCase()
          };
        });
        
        setStudents(enhancedStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    return 'bg-red-500';
  };

  const openModal = (modalType: keyof typeof modals, student: any) => {
    setSelectedStudent(student);
    setModals(prev => ({ ...prev, [modalType]: true }));
  };

  const closeModal = (modalType: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalType]: false }));
    setSelectedStudent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Students</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Manage and track your students' progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3 bg-blue-100 rounded-full">
            <i className="ri-group-line text-lg sm:text-2xl text-blue-600"></i>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{students.length}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Students</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3 bg-green-100 rounded-full">
            <i className="ri-user-check-line text-lg sm:text-2xl text-green-600"></i>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{students.filter(s => s.status === 'active').length}</div>
          <div className="text-xs sm:text-sm text-gray-600">Active Students</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3 bg-purple-100 rounded-full">
            <i className="ri-trophy-line text-lg sm:text-2xl text-purple-600"></i>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">82%</div>
          <div className="text-xs sm:text-sm text-gray-600">Avg Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mx-auto mb-2 sm:mb-3 bg-orange-100 rounded-full">
            <i className="ri-calendar-check-line text-lg sm:text-2xl text-orange-600"></i>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">60</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Sessions</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search students by name or course..."
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <button className="flex items-center justify-center px-4 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm cursor-pointer whitespace-nowrap w-full sm:w-auto">
                <i className="ri-filter-line mr-2"></i>
                Filter: {filterStatus === 'all' ? 'All' : filterStatus === 'active' ? 'Active' : 'Inactive'}
                <i className="ri-arrow-down-s-line ml-2"></i>
              </button>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap cursor-pointer w-full sm:w-auto">
              Export List
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-medium text-xs sm:text-sm">{student.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">{student.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{student.email}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-1">
                        <span className="truncate">{student.course}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">Joined {student.joinDate}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">{student.totalSessions} sessions</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile: Progress and Status */}
                  <div className="flex flex-col sm:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Progress:</span>
                      <span className="text-xs font-medium text-gray-900">{student.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-end">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </div>
                  </div>

                  {/* Desktop: Progress and Actions */}
                  <div className="hidden sm:flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-gray-600 mr-2">Progress:</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 ml-2">{student.progress}%</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openModal('sendMessage', student)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Send Message"
                      >
                        <i className="ri-message-line"></i>
                      </button>
                      <button 
                        onClick={() => openModal('scheduleSession', student)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                        title="Schedule Session"
                      >
                        <i className="ri-calendar-line"></i>
                      </button>
                      <button 
                        onClick={() => openModal('viewProgress', student)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title="View Progress"
                      >
                        <i className="ri-bar-chart-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-xs sm:text-sm text-gray-600">
                      Last session: {student.lastSession}
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <button 
                        onClick={() => openModal('scheduleSession', student)}
                        className="bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer w-full sm:w-auto"
                      >
                        Schedule Session
                      </button>
                      <button 
                        onClick={() => openModal('viewProgress', student)}
                        className="border border-gray-300 text-gray-700 px-3 py-2 rounded text-xs hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer w-full sm:w-auto"
                      >
                        View Progress
                      </button>
                      <button 
                        onClick={() => openModal('sendMessage', student)}
                        className="border border-gray-300 text-gray-700 px-3 py-2 rounded text-xs hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer w-full sm:w-auto"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-line text-xl sm:text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-sm sm:text-base text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedStudent && (
        <>
          <ScheduleSessionModal
            isOpen={modals.scheduleSession}
            onClose={() => closeModal('scheduleSession')}
            student={selectedStudent}
          />
          <ViewProgressModal
            isOpen={modals.viewProgress}
            onClose={() => closeModal('viewProgress')}
            student={selectedStudent}
          />
          <SendMessageModal
            isOpen={modals.sendMessage}
            onClose={() => closeModal('sendMessage')}
            student={selectedStudent}
          />
        </>
      )}
    </div>
  );
};

export default MentorStudents;