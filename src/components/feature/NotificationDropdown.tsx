import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/base/Card';

interface Notification {
  id: string;
  type: 'achievement' | 'course' | 'reminder' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: string;
  color: string;
}

interface NotificationDropdownProps {
  children: React.ReactNode;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'achievement',
      title: 'New Badge Earned!',
      message: 'You earned the "Quick Learner" badge for completing 5 lessons in one day.',
      timestamp: '2024-01-15T10:30:00Z',
      read: false,
      icon: 'ri-medal-line',
      color: 'yellow'
    },
    {
      id: '2',
      type: 'course',
      title: 'Course Progress',
      message: 'You\'re 80% through the JavaScript Fundamentals course. Keep going!',
      timestamp: '2024-01-15T09:15:00Z',
      read: false,
      icon: 'ri-book-line',
      color: 'blue'
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Study Reminder',
      message: 'Don\'t forget about your scheduled study session at 2:00 PM today.',
      timestamp: '2024-01-15T08:00:00Z',
      read: true,
      icon: 'ri-calendar-line',
      color: 'green'
    },
    {
      id: '4',
      type: 'system',
      title: 'Platform Update',
      message: 'New features have been added to the assessment system. Check them out!',
      timestamp: '2024-01-14T16:45:00Z',
      read: true,
      icon: 'ri-information-line',
      color: 'purple'
    },
    {
      id: '5',
      type: 'achievement',
      title: 'Level Up!',
      message: 'Congratulations! You\'ve reached Level 3: Intermediate.',
      timestamp: '2024-01-14T14:20:00Z',
      read: true,
      icon: 'ri-trophy-line',
      color: 'gold'
    }
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const updatePosition = () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setTriggerRect(rect);
        }
      };
      
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    } else {
      setTriggerRect(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'ri-medal-line';
      case 'course':
        return 'ri-book-line';
      case 'reminder':
        return 'ri-calendar-line';
      case 'system':
        return 'ri-information-line';
      default:
        return 'ri-notification-line';
    }
  };

  const getNotificationColor = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600';
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'gold':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleViewAllNotifications = () => {
    setIsOpen(false);
    navigate('/student/notifications');
  };

  return (
    <>
      <div className="relative z-[10000]">
        <div
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer relative"
        >
          {children}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Dropdown Menu - Rendered as Portal */}
      {isOpen && triggerRect && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-transparent z-[9998]"
            onClick={() => setIsOpen(false)}
            style={{ cursor: 'default' }}
          />

          {/* Dropdown Menu */}
          <div
            ref={dropdownRef}
            className="fixed w-96 max-w-sm"
            style={{
              top: `${triggerRect.bottom + 8}px`,
              right: `${window.innerWidth - triggerRect.right}px`,
              zIndex: 9999,
            }}
          >
            <Card className="shadow-xl border-0 bg-theme-card-bg/95 backdrop-blur-md">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-theme-border">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-theme-text-primary">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-brand-primary hover:text-brand-secondary font-medium transition-colors duration-200"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <i className="ri-notification-off-line text-3xl text-theme-text-tertiary mb-3"></i>
                    <p className="text-theme-text-secondary">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-theme-border">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-theme-hover-bg transition-colors duration-200 ${
                          !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            getNotificationColor(notification.color)
                          }`}>
                            <i className={`${notification.icon} text-sm`}></i>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className={`text-sm font-medium text-theme-text-primary ${
                                !notification.read ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-2 ml-2">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-brand-primary hover:text-brand-secondary transition-colors duration-200"
                                    title="Mark as read"
                                  >
                                    <i className="ri-check-line text-sm"></i>
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-theme-text-tertiary hover:text-red-500 transition-colors duration-200"
                                  title="Delete notification"
                                >
                                  <i className="ri-close-line text-sm"></i>
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-theme-text-secondary mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-theme-text-tertiary mt-2">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-theme-border">
                  <button 
                    onClick={handleViewAllNotifications}
                    className="w-full text-center text-sm text-brand-primary hover:text-brand-secondary font-medium transition-colors duration-200"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </Card>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default NotificationDropdown;