import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import DataService from '@/services/dataService';

interface Notification {
  id: string;
  type: 'achievement' | 'course' | 'reminder' | 'system' | 'assessment' | 'mentor' | 'placement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: string;
  color: string;
  actionUrl?: string;
  actionText?: string;
}

const StudentNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get current user ID (in real app, this would come from auth context)
        const currentUserId = 'current-user-id'; // Placeholder
        
        const notificationsData = await DataService.getNotifications(currentUserId);
        
        // Transform notifications to match the expected format
        const transformedNotifications: Notification[] = notificationsData.map(notification => ({
          id: notification.id,
          type: notification.type as any,
          title: notification.title,
          message: notification.message,
          timestamp: notification.created_at,
          read: notification.read,
          icon: getIconForType(notification.type),
          color: getColorForType(notification.type),
          actionUrl: undefined, // Would need additional fields in schema
          actionText: undefined
        }));
        
        setNotifications(transformedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to empty array if no notifications
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'achievement': return 'ri-medal-line';
      case 'course': return 'ri-book-line';
      case 'assessment': return 'ri-file-list-line';
      case 'reminder': return 'ri-calendar-line';
      case 'mentor': return 'ri-user-line';
      case 'system': return 'ri-notification-line';
      default: return 'ri-notification-line';
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'achievement': return 'yellow';
      case 'course': return 'blue';
      case 'assessment': return 'purple';
      case 'reminder': return 'green';
      case 'mentor': return 'indigo';
      case 'system': return 'gray';
      default: return 'gray';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
    setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
  };

  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const deleteSelectedNotifications = () => {
    setNotifications(prev =>
      prev.filter(notification => !selectedNotifications.includes(notification.id))
    );
    setSelectedNotifications([]);
  };

  const markSelectedAsRead = () => {
    setNotifications(prev =>
      prev.map(notification =>
        selectedNotifications.includes(notification.id)
          ? { ...notification, read: true }
          : notification
      )
    );
    setSelectedNotifications([]);
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
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      return date.toLocaleDateString();
    }
  };

  const getNotificationColor = (color: string) => {
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      gold: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.actionUrl) {
      if (!notification.read) {
        markAsRead(notification.id);
      }
      navigate(notification.actionUrl);
    }
  };

  const filterOptions = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'read', label: 'Read', count: notifications.length - unreadCount },
    { key: 'achievement', label: 'Achievements', count: notifications.filter(n => n.type === 'achievement').length },
    { key: 'course', label: 'Courses', count: notifications.filter(n => n.type === 'course').length },
    { key: 'assessment', label: 'Assessments', count: notifications.filter(n => n.type === 'assessment').length },
    { key: 'reminder', label: 'Reminders', count: notifications.filter(n => n.type === 'reminder').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Notifications</h1>
          <p className="text-theme-text-secondary mt-1">
            Stay updated with your learning progress and important updates
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedNotifications.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={markSelectedAsRead}
                className="whitespace-nowrap"
              >
                <i className="ri-check-line mr-2"></i>
                Mark Read ({selectedNotifications.length})
              </Button>
              <Button
                variant="outline"
                onClick={deleteSelectedNotifications}
                className="text-red-600 border-red-600 hover:bg-red-50 whitespace-nowrap"
              >
                <i className="ri-delete-bin-line mr-2"></i>
                Delete ({selectedNotifications.length})
              </Button>
            </>
          )}
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} className="whitespace-nowrap">
              <i className="ri-check-double-line mr-2"></i>
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
            <i className="ri-notification-line text-2xl text-blue-600"></i>
          </div>
          <div className="text-2xl font-bold text-theme-text-primary mb-1">{notifications.length}</div>
          <div className="text-sm text-theme-text-secondary">Total</div>
        </Card>
        <Card className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
            <i className="ri-mail-unread-line text-2xl text-red-600"></i>
          </div>
          <div className="text-2xl font-bold text-theme-text-primary mb-1">{unreadCount}</div>
          <div className="text-sm text-theme-text-secondary">Unread</div>
        </Card>
        <Card className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
            <i className="ri-mail-check-line text-2xl text-green-600"></i>
          </div>
          <div className="text-2xl font-bold text-theme-text-primary mb-1">{notifications.length - unreadCount}</div>
          <div className="text-sm text-theme-text-secondary">Read</div>
        </Card>
        <Card className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
            <i className="ri-trophy-line text-2xl text-yellow-600"></i>
          </div>
          <div className="text-2xl font-bold text-theme-text-primary mb-1">
            {notifications.filter(n => n.type === 'achievement').length}
          </div>
          <div className="text-sm text-theme-text-secondary">Achievements</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                filter === option.key
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-theme-hover-bg text-theme-text-secondary hover:bg-theme-card-bg hover:text-theme-text-primary'
              }`}
            >
              {option.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filter === option.key
                  ? 'bg-white/20 text-white'
                  : 'bg-theme-border text-theme-text-tertiary'
              }`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-theme-hover-bg rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-notification-off-line text-2xl text-theme-text-tertiary"></i>
            </div>
            <h3 className="text-lg font-medium text-theme-text-primary mb-2">No notifications found</h3>
            <p className="text-theme-text-secondary">
              {filter === 'all' 
                ? 'You\'re all caught up! No notifications to show.'
                : `No ${filter} notifications found.`
              }
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`transition-all hover:shadow-md cursor-pointer ${
                !notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10 border-l-4 border-l-brand-primary' : ''
              } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-brand-primary/50' : ''}`}
            >
              <div className="flex items-start space-x-4">
                {/* Selection Checkbox */}
                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelectNotification(notification.id)}
                    className="w-4 h-4 text-brand-primary bg-theme-card-bg border-theme-border rounded focus:ring-brand-primary focus:ring-2 cursor-pointer"
                  />
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  getNotificationColor(notification.color)
                }`}>
                  <i className={`${notification.icon} text-lg`}></i>
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-semibold text-theme-text-primary ${
                        !notification.read ? 'font-bold' : ''
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs text-theme-text-tertiary whitespace-nowrap">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-brand-primary hover:text-brand-secondary transition-colors duration-200 p-1"
                          title="Mark as read"
                        >
                          <i className="ri-check-line text-sm"></i>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-theme-text-tertiary hover:text-red-500 transition-colors duration-200 p-1"
                        title="Delete notification"
                      >
                        <i className="ri-close-line text-sm"></i>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-theme-text-secondary mb-3 leading-relaxed">
                    {notification.message}
                  </p>

                  {/* Action Button */}
                  {notification.actionText && (
                    <Button
                      variant="outline"
                      onClick={() => handleNotificationAction(notification)}
                      className="text-sm px-3 py-1.5 h-auto"
                    >
                      {notification.actionText}
                      <i className="ri-arrow-right-line ml-1"></i>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Load More (if needed) */}
      {filteredNotifications.length > 0 && filteredNotifications.length >= 10 && (
        <div className="text-center">
          <Button variant="outline">
            <i className="ri-refresh-line mr-2"></i>
            Load More Notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;