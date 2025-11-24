import React, { useState } from 'react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import ScheduleStudySessionModal from './components/ScheduleStudySessionModal';
import BookMentoringModal from './components/BookMentoringModal';
import SetReminderModal from './components/SetReminderModal';

const StudentSchedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [showStudySessionModal, setShowStudySessionModal] = useState(false);
  const [showMentoringModal, setShowMentoringModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const events = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      type: 'class',
      date: '2024-01-15',
      time: '10:00 AM - 11:30 AM',
      instructor: 'Dr. Sarah Johnson',
      location: 'Online',
      color: 'blue'
    },
    {
      id: 2,
      title: 'HTML & CSS Quiz',
      type: 'exam',
      date: '2024-01-16',
      time: '2:00 PM - 3:00 PM',
      course: 'Full Stack Web Development',
      location: 'Online',
      color: 'red'
    },
    {
      id: 3,
      title: '1-on-1 Mentoring Session',
      type: 'mentoring',
      date: '2024-01-17',
      time: '3:00 PM - 4:00 PM',
      mentor: 'Prof. Michael Chen',
      location: 'Video Call',
      color: 'green'
    },
    {
      id: 4,
      title: 'React Components Workshop',
      type: 'workshop',
      date: '2024-01-18',
      time: '1:00 PM - 3:00 PM',
      instructor: 'Dr. Sarah Johnson',
      location: 'Online',
      color: 'purple'
    },
    {
      id: 5,
      title: 'Project Submission Deadline',
      type: 'deadline',
      date: '2024-01-19',
      time: '11:59 PM',
      course: 'Full Stack Web Development',
      color: 'orange'
    }
  ];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const currentWeekDates = [];
  
  // Generate current week dates
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    currentWeekDates.push(date);
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'class': return 'ri-book-open-line';
      case 'exam': return 'ri-file-list-line';
      case 'mentoring': return 'ri-user-voice-line';
      case 'workshop': return 'ri-tools-line';
      case 'deadline': return 'ri-time-line';
      default: return 'ri-calendar-event-line';
    }
  };

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your classes, exams, and mentoring sessions</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap ${
                view === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 rounded-md text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap ${
                view === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Month
            </button>
          </div>
          <Button className="w-full sm:w-auto">
            <i className="ri-add-line mr-2"></i>
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Navigation - Mobile Optimized */}
      <Card className="p-3 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <button 
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(currentDate.getDate() - 7);
              setCurrentDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <i className="ri-arrow-left-line text-gray-600"></i>
          </button>
          
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 text-center">
            {currentWeekDates[0]?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          
          <button 
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(currentDate.getDate() + 7);
              setCurrentDate(newDate);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <i className="ri-arrow-right-line text-gray-600"></i>
          </button>
        </div>

        {/* Week View - Mobile Optimized */}
        {view === 'week' && (
          <div className="grid grid-cols-7 gap-1">
            {currentWeekDates.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={index} className={`p-2 sm:p-3 min-h-24 sm:min-h-32 border rounded-lg ${
                  isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}>
                  <div className="text-center mb-1 sm:mb-2">
                    <div className="text-xs text-gray-500 uppercase hidden sm:block">{weekDays[index]}</div>
                    <div className="text-xs text-gray-500 uppercase sm:hidden">{weekDays[index].slice(0, 3)}</div>
                    <div className={`text-sm sm:text-lg font-semibold ${
                      isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div 
                        key={event.id}
                        className={`text-xs p-1 sm:p-2 rounded bg-${event.color}-100 text-${event.color}-800 cursor-pointer hover:bg-${event.color}-200`}
                        title={event.title}
                      >
                        <div className="font-medium truncate text-xs">{event.title}</div>
                        <div className="truncate text-xs hidden sm:block">{event.time}</div>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Upcoming Events - Mobile Optimized */}
        <div className="lg:col-span-2">
          <Card className="p-3 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Upcoming Events</h2>
            <div className="space-y-3 sm:space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex flex-col sm:flex-row sm:items-start p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-${event.color}-100 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0`}>
                    <i className={`${getEventIcon(event.type)} text-${event.color}-600 text-sm sm:text-base`}></i>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{event.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-600 mt-1 space-y-1 sm:space-y-0">
                      <div className="flex items-center">
                        <i className="ri-calendar-line mr-1"></i>
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <span className="hidden sm:inline mx-2">•</span>
                      <div className="flex items-center">
                        <i className="ri-time-line mr-1"></i>
                        {event.time}
                      </div>
                    </div>
                    
                    {event.instructor && (
                      <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                        <i className="ri-user-line mr-1"></i>
                        {event.instructor}
                      </div>
                    )}
                    
                    {event.mentor && (
                      <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                        <i className="ri-user-voice-line mr-1"></i>
                        {event.mentor}
                      </div>
                    )}
                    
                    <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                      <i className="ri-map-pin-line mr-1"></i>
                      {event.location || 'Online'}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3 sm:mt-0 sm:ml-4">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                      <i className="ri-edit-line"></i>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                      <i className="ri-more-line"></i>
                    </Button>
                  </div>
                </div>
              ))}
              
              {upcomingEvents.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <i className="ri-calendar-line text-3xl sm:text-4xl mb-3"></i>
                  <p className="text-sm sm:text-base">No upcoming events</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Stats & Actions - Mobile Optimized */}
        <div className="space-y-4 sm:space-y-6">
          {/* This Week Stats */}
          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">This Week</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Classes</span>
                <span className="font-medium text-sm sm:text-base">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Exams</span>
                <span className="font-medium text-sm sm:text-base">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Mentoring</span>
                <span className="font-medium text-sm sm:text-base">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 text-sm sm:text-base">Deadlines</span>
                <span className="font-medium text-red-600 text-sm sm:text-base">1</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions - Mobile Optimized */}
          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Quick Actions</h3>
            <div className="space-y-2 sm:space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start text-xs sm:text-sm"
                onClick={() => setShowStudySessionModal(true)}
              >
                <i className="ri-calendar-event-line mr-2 sm:mr-3"></i>
                Schedule Study Session
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-xs sm:text-sm"
                onClick={() => setShowMentoringModal(true)}
              >
                <i className="ri-user-voice-line mr-2 sm:mr-3"></i>
                Book Mentoring
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-xs sm:text-sm"
                onClick={() => setShowReminderModal(true)}
              >
                <i className="ri-notification-line mr-2 sm:mr-3"></i>
                Set Reminder
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs sm:text-sm">
                <i className="ri-download-line mr-2 sm:mr-3"></i>
                Export Calendar
              </Button>
            </div>
          </Card>

          {/* Study Time Tracker - Mobile Optimized */}
          <Card className="p-3 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Study Time This Week</h3>
            <div className="text-center mb-3 sm:mb-4">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">12.5h</div>
              <div className="text-xs sm:text-sm text-gray-600">of 15h goal</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-3 sm:mb-4">
              <div className="bg-blue-600 h-2 sm:h-3 rounded-full" style={{ width: '83%' }}></div>
            </div>
            <div className="text-center">
              <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                <i className="ri-play-line mr-2"></i>
                Start Study Timer
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ScheduleStudySessionModal 
        isOpen={showStudySessionModal}
        onClose={() => setShowStudySessionModal(false)}
      />
      
      <BookMentoringModal 
        isOpen={showMentoringModal}
        onClose={() => setShowMentoringModal(false)}
      />
      
      <SetReminderModal 
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
      />
    </div>
  );
};

export default StudentSchedule;