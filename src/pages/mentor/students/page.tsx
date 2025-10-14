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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-600 mt-2">Manage and track your students' progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-blue-100 rounded-full">
            <i className="ri-group-line text-2xl text-blue-600"></i>
          </div>
          <div className="text-2xl font-bold text-gray-900">{students.length}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-green-100 rounded-full">
            <i className="ri-user-check-line text-2xl text-green-600"></i>
          </div>
          <div className="text-2xl font-bold text-gray-900">{students.filter(s => s.status === 'active').length}</div>
          <div className="text-sm text-gray-600">Active Students</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-purple-100 rounded-full">
            <i className="ri-trophy-line text-2xl text-purple-600"></i>
          </div>
          <div className="text-2xl font-bold text-gray-900">82%</div>
          <div className="text-sm text-gray-600">Avg Progress</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 bg-orange-100 rounded-full">
            <i className="ri-calendar-check-line text-2xl text-orange-600"></i>
          </div>
          <div className="text-2xl font-bold text-gray-900">60</div>
          <div className="text-sm text-gray-600">Total Sessions</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search students by name or course..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm cursor-pointer whitespace-nowrap">
                <i className="ri-filter-line mr-2"></i>
                Filter: {filterStatus === 'all' ? 'All' : filterStatus === 'active' ? 'Active' : 'Inactive'}
                <i className="ri-arrow-down-s-line ml-2"></i>
              </button>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap cursor-pointer">
              Export List
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">{student.avatar}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{student.course}</span>
                        <span>•</span>
                        <span>Joined {student.joinDate}</span>
                        <span>•</span>
                        <span>{student.totalSessions} sessions</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
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
                      >
                        <i className="ri-message-line"></i>
                      </button>
                      <button 
                        onClick={() => openModal('scheduleSession', student)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <i className="ri-calendar-line"></i>
                      </button>
                      <button 
                        onClick={() => openModal('viewProgress', student)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <i className="ri-bar-chart-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Last session: {student.lastSession}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openModal('scheduleSession', student)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Schedule Session
                      </button>
                      <button 
                        onClick={() => openModal('viewProgress', student)}
                        className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        View Progress
                      </button>
                      <button 
                        onClick={() => openModal('sendMessage', student)}
                        className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-line text-2xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
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