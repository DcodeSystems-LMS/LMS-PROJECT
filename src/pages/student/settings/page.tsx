
import React, { useState } from 'react';
import Card from '@/components/base/Card';
import Button from '@/components/base/Button';
import DarkModeToggle from '@/components/feature/DarkModeToggle';
import SidebarSettingsDropdown from '@/components/feature/SidebarSettingsDropdown';
import { authService } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: number;
  type: 'course' | 'assessment' | 'achievement' | 'system' | 'reminder';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

const StudentSettings: React.FC = () => {
  const [user, setUser] = useState(authService.getCurrentUserSync());
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    assessmentReminders: true,
    achievementAlerts: true,
    marketingEmails: false
  });

  const [notificationsList, setNotificationsList] = useState<Notification[]>([
    {
      id: 1,
      type: 'course',
      title: 'New Lesson Available',
      message: 'Advanced React Development - State Management with Redux is now available',
      time: '2 hours ago',
      read: false,
      actionLabel: 'Start Lesson',
      actionUrl: '/student/course/1'
    },
    {
      id: 2,
      type: 'assessment',
      title: 'Quiz Reminder',
      message: 'JavaScript Fundamentals Quiz is due in 2 days',
      time: '4 hours ago',
      read: false,
      actionLabel: 'Take Quiz',
      actionUrl: '/student/assessments'
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You earned the "React Master" badge for completing 10 React lessons',
      time: '1 day ago',
      read: false,
      actionLabel: 'View Badge',
      actionUrl: '/student/achievements'
    },
    {
      id: 4,
      type: 'system',
      title: 'Maintenance Notice',
      message: 'Scheduled maintenance on Sunday 2-4 AM PST. Some features may be unavailable.',
      time: '1 day ago',
      read: true
    },
    {
      id: 5,
      type: 'reminder',
      title: 'Study Streak',
      message: 'You are on a 7-day study streak! Keep it up to reach your goal.',
      time: '2 days ago',
      read: true,
      actionLabel: 'Continue Learning',
      actionUrl: '/student/continue'
    },
    {
      id: 6,
      type: 'course',
      title: 'Course Update',
      message: 'Node.js Backend Mastery has been updated with 3 new lessons',
      time: '3 days ago',
      read: true,
      actionLabel: 'View Updates',
      actionUrl: '/student/course/2'
    }
  ]);

  const unreadCount = notificationsList.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'course': return 'ri-book-line';
      case 'assessment': return 'ri-question-line';
      case 'achievement': return 'ri-award-line';
      case 'system': return 'ri-settings-line';
      case 'reminder': return 'ri-alarm-line';
      default: return 'ri-notification-line';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-600';
      case 'assessment': return 'bg-orange-100 text-orange-600';
      case 'achievement': return 'bg-purple-100 text-purple-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      case 'reminder': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const markAsRead = (notificationId: number) => {
    setNotificationsList(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationsList(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: number) => {
    setNotificationsList(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotificationsList([]);
    setShowNotifications(false);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileUpdate = (field: string, value: string) => {
    setUser(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update user profile in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: user.name,
          email: user.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Get user initials safely
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  const getFirstName = () => {
    if (!user?.name) return '';
    return user.name.split(' ')[0] || '';
  };

  const getLastName = () => {
    if (!user?.name) return '';
    return user.name.split(' ')[1] || '';
  };

  return (
    <div className="min-h-screen bg-theme-bg-secondary">
      <div className="dashboard-container space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-text-primary">Settings</h1>
            <p className="text-theme-text-secondary mt-1">Manage your account preferences and notifications</p>
          </div>
          
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="-m-2.5 p-2.5 text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-hover-bg rounded-lg transition-colors duration-200 cursor-pointer"
            >
              <span className="sr-only">View notifications</span>
              <div className="relative">
                <i className="ri-notification-line text-xl"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-theme-card-bg rounded-lg shadow-lg border border-theme-card-border z-50 glass-dark">
                <div className="p-4 border-b border-theme-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-theme-text-primary">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-theme-text-tertiary hover:text-theme-text-secondary cursor-pointer"
                      >
                        <i className="ri-close-line text-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notificationsList.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-theme-hover-bg rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="ri-notification-off-line text-theme-text-tertiary text-xl"></i>
                      </div>
                      <p className="text-theme-text-tertiary">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-theme-border">
                      {notificationsList.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-theme-hover-bg transition-colors ${
                            !notification.read ? 'bg-blue-50/50 dark:bg-blue-500/10' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                              <i className={`${getNotificationIcon(notification.type)} text-sm`}></i>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className={`text-sm font-medium ${!notification.read ? 'text-theme-text-primary' : 'text-theme-text-secondary'}`}>
                                    {notification.title}
                                  </h4>
                                  <p className="text-sm text-theme-text-secondary mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-theme-text-tertiary mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                                
                                <div className="flex items-center space-x-1 ml-2">
                                  {!notification.read && (
                                    <button
                                      onClick={() => markAsRead(notification.id)}
                                      className="text-blue-600 hover:text-blue-700 cursor-pointer"
                                      title="Mark as read"
                                    >
                                      <i className="ri-check-line text-sm"></i>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-theme-text-tertiary hover:text-red-500 cursor-pointer"
                                    title="Delete notification"
                                  >
                                    <i className="ri-close-line text-sm"></i>
                                  </button>
                                </div>
                              </div>
                              
                              {notification.actionLabel && (
                                <div className="mt-3">
                                  <button
                                    onClick={() => {
                                      markAsRead(notification.id);
                                      setShowNotifications(false);
                                      // In a real app, you would navigate to notification.actionUrl
                                      console.log('Navigate to:', notification.actionUrl);
                                    }}
                                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
                                  >
                                    {notification.actionLabel}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {notificationsList.length > 0 && (
                  <div className="p-3 border-t border-theme-border bg-theme-bg-tertiary">
                    <button
                      onClick={clearAllNotifications}
                      className="w-full text-sm text-theme-text-secondary hover:text-red-600 cursor-pointer"
                    >
                      Clear all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <i className="ri-checkbox-circle-line mr-2"></i>
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line mr-2"></i>
              {error}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-theme-hover-bg p-1 rounded-lg w-fit">
          {[
            { key: 'profile', label: 'Profile', icon: 'ri-user-line' },
            { key: 'features', label: 'Features', icon: 'ri-magic-line' },
            { key: 'notifications', label: 'Notifications', icon: 'ri-notification-line' },
            { key: 'appearance', label: 'Appearance', icon: 'ri-palette-line' },
            { key: 'privacy', label: 'Privacy', icon: 'ri-shield-line' },
            { key: 'preferences', label: 'Preferences', icon: 'ri-settings-line' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-theme-card-bg text-blue-600 shadow-sm'
                  : 'text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar Section */}
            <Card className="text-center glass-dark">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {getUserInitials()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-theme-text-primary mb-2">{user?.name || 'User'}</h3>
              <p className="text-theme-text-secondary mb-4">Level 3 Student</p>
              <Button variant="outline" size="sm">
                <i className="ri-camera-line mr-2"></i>
                Change Avatar
              </Button>
            </Card>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card className="glass-dark">
                <h2 className="text-lg font-semibold text-theme-text-primary mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-text-primary mb-2">First Name</label>
                      <input
                        type="text"
                        value={getFirstName()}
                        onChange={(e) => handleProfileUpdate('name', e.target.value + ' ' + getLastName())}
                        className="form-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-theme-text-primary mb-2">Last Name</label>
                      <input
                        type="text"
                        value={getLastName()}
                        onChange={(e) => handleProfileUpdate('name', getFirstName() + ' ' + e.target.value)}
                        className="form-input w-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-theme-text-primary mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      onChange={(e) => handleProfileUpdate('email', e.target.value)}
                      className="form-input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-theme-text-primary mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="form-input w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-theme-text-primary mb-2">Bio</label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder="Tell us about yourself..."
                      className="form-input w-full resize-none"
                    />
                    <div className="text-xs text-theme-text-tertiary mt-1">0/500 characters</div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline">Cancel</Button>
                    <Button 
                      onClick={handleSaveChanges}
                      disabled={loading}
                      className="interactive-element"
                    >
                      {loading ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-2"></i>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <Card className="glass-dark">
            <h2 className="text-lg font-semibold text-theme-text-primary mb-4">Features</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-theme-text-primary mb-4">Side Navigation Bar</h3>
                <p className="text-theme-text-secondary mb-6">Configure how the sidebar navigation behaves in your dashboard.</p>
                
                <div className="bg-theme-hover-bg rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-md font-medium text-theme-text-primary mb-2">Sidebar Toggle Mode</h4>
                      <p className="text-sm text-theme-text-secondary">Choose how the sidebar opens and closes</p>
                    </div>
                    <SidebarSettingsDropdown />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card className="glass-dark">
            <h2 className="text-lg font-semibold text-theme-text-primary mb-4">Notification Preferences</h2>
            <div className="space-y-6">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications in browser' },
                { key: 'courseUpdates', label: 'Course Updates', description: 'Get notified about new lessons and course changes' },
                { key: 'assessmentReminders', label: 'Assessment Reminders', description: 'Reminders for upcoming quizzes and tests' },
                { key: 'achievementAlerts', label: 'Achievement Alerts', description: 'Notifications when you earn badges or certificates' },
                { key: 'marketingEmails', label: 'Marketing Emails', description: 'Promotional emails about new courses and features' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-theme-hover-bg rounded-lg">
                  <div>
                    <h3 className="font-medium text-theme-text-primary">{item.label}</h3>
                    <p className="text-sm text-theme-text-secondary">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <Card className="glass-dark">
              <h2 className="text-lg font-semibold text-theme-text-primary mb-4">Theme Preferences</h2>
              <div className="space-y-6">
                <DarkModeToggle className="w-full" showLabel={true} />
                
                <div className="p-4 bg-theme-hover-bg rounded-lg">
                  <h3 className="font-medium text-theme-text-primary mb-2">Theme Information</h3>
                  <div className="space-y-2 text-sm text-theme-text-secondary">
                    <p><strong>Light Mode:</strong> Clean, bright interface with subtle shadows and gradients</p>
                    <p><strong>Dark Mode:</strong> Deep gradients with neon accents and glassmorphism effects</p>
                    <p><strong>Auto:</strong> Follows your system preference</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="glass-dark">
              <h2 className="text-lg font-semibold text-theme-text-primary mb-4">Display Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">Font Size</label>
                  <select className="form-input w-full pr-8">
                    <option value="small">Small</option>
                    <option value="medium" selected>Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">Sidebar</label>
                  <select className="form-input w-full pr-8">
                    <option value="expanded" selected>Always Expanded</option>
                    <option value="collapsed">Always Collapsed</option>
                    <option value="auto">Auto (Remember Last State)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-text-primary mb-2">Animation</label>
                  <select className="form-input w-full pr-8">
                    <option value="full" selected>Full Animations</option>
                    <option value="reduced">Reduced Motion</option>
                    <option value="none">No Animations</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <Card className="glass-dark">
            <h2 className="text-lg font-semibold text-theme-text-primary mb-4">Privacy & Security</h2>
            <div className="space-y-6">
              <div className="p-4 bg-theme-hover-bg rounded-lg">
                <h3 className="font-medium text-theme-text-primary mb-2">Change Password</h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    className="form-input w-full"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    className="form-input w-full"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="form-input w-full"
                  />
                  <Button size="sm">Update Password</Button>
                </div>
              </div>

              <div className="p-4 bg-theme-hover-bg rounded-lg">
                <h3 className="font-medium text-theme-text-primary mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-theme-text-secondary mb-3">Add an extra layer of security to your account</p>
                <Button variant="outline" size="sm">
                  <i className="ri-shield-check-line mr-2"></i>
                  Enable 2FA
                </Button>
              </div>

              <div className="p-4 bg-theme-hover-bg rounded-lg">
                <h3 className="font-medium text-theme-text-primary mb-2">Data Privacy</h3>
                <p className="text-sm text-theme-text-secondary mb-3">Control how your data is used and shared</p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="mr-2">
                    <i className="ri-download-line mr-2"></i>
                    Download My Data
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <i className="ri-delete-bin-line mr-2"></i>
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <Card className="glass-dark">
            <h2 className="text-lg font-semibold text-theme-text-primary mb-4">Learning Preferences</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-2">Preferred Language</label>
                <select className="form-input w-full pr-8">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-2">Time Zone</label>
                <select className="form-input w-full pr-8">
                  <option value="PST">Pacific Standard Time (PST)</option>
                  <option value="MST">Mountain Standard Time (MST)</option>
                  <option value="CST">Central Standard Time (CST)</option>
                  <option value="EST">Eastern Standard Time (EST)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-2">Learning Goal</label>
                <select className="form-input w-full pr-8">
                  <option value="career">Career Change</option>
                  <option value="skill">Skill Enhancement</option>
                  <option value="hobby">Personal Interest</option>
                  <option value="academic">Academic Requirement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-text-primary mb-2">Daily Study Time Goal</label>
                <select className="form-input w-full pr-8">
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="180">3+ hours</option>
                </select>
              </div>

              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Click outside to close notifications */}
        {showNotifications && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowNotifications(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

export default StudentSettings;
