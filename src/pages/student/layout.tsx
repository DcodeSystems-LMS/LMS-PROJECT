import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import MobileDrawer from '@/components/base/MobileDrawer';
import ProfileMenu from '@/components/feature/ProfileMenu';
import ThemeToggle from '@/components/base/ThemeToggle';
import Tooltip from '@/components/base/Tooltip';
import NotificationDropdown from '@/components/feature/NotificationDropdown';
import SidebarToggleButton from '@/components/feature/SidebarToggleButton';
import SidebarSettingsDropdown from '@/components/feature/SidebarSettingsDropdown';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';
import { useSidebar } from '@/hooks/useSidebar';
import { useSidebarSettings } from '@/contexts/SidebarSettingsContext';

const navigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: 'ri-dashboard-line' },
  { name: 'My Courses', href: '/student/my-courses', icon: 'ri-book-line' },
  { name: 'Continue Learning', href: '/student/continue', icon: 'ri-play-circle-line' },
  { name: 'Assessments', href: '/student/assessments', icon: 'ri-file-list-line' },
  { name: 'Code Playground', href: '/playground', icon: 'ri-code-line' },
  { name: 'Schedule', href: '/student/schedule', icon: 'ri-calendar-line' },
  { name: 'Resume Builder', href: '/student/resume-builder', icon: 'ri-file-text-line' },
  { name: 'Achievements', href: '/student/achievements', icon: 'ri-trophy-line' },
  { name: 'Job Placements', href: '/student/placements', icon: 'ri-briefcase-line' },
  { name: 'Discussions', href: '/student/discussions', icon: 'ri-chat-3-line' },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar } = useSidebar('student-sidebar-collapsed');
  const { settings } = useSidebarSettings();

  // Determine sidebar state based on settings
  const getSidebarState = () => {
    switch (settings.mode) {
      case 'always-open':
        return true;
      case 'button-toggle':
        return settings.isOpen;
      case 'hover':
      default:
        return isHovered;
    }
  };

  const isSidebarExpanded = getSidebarState();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          console.log('No user found, redirecting to sign in');
          navigate('/auth/signin');
          return;
        }
        if (currentUser.role !== 'student') {
          console.log('User is not student, redirecting to sign in');
          navigate('/auth/signin');
          return;
        }
        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Redirect to sign in page for auth errors
        navigate('/auth/signin');
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-secondary flex items-center justify-center">
        <div className="text-center">
          <SimpleDCODESpinner size="lg" className="mb-4" />
          <p className="text-theme-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  return (
    <div className="min-h-screen bg-theme-bg-secondary overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div 
        className={`hidden lg:fixed lg:top-16 lg:bottom-0 lg:flex lg:flex-col transition-all duration-300 ease-in-out z-30 ${
          isSidebarExpanded ? 'lg:w-64' : 'lg:w-16'
        }`}
        onMouseEnter={() => settings.mode === 'hover' && setIsHovered(true)}
        onMouseLeave={() => settings.mode === 'hover' && setIsHovered(false)}
      >
        <div className="flex flex-col flex-grow pt-5 bg-theme-card-bg border-r border-theme-border shadow-sm overflow-hidden overflow-x-hidden glass-dark">
          {/* Sidebar now starts without logo */}

          {/* Toggle Button - Above Sidebar */}
          <div className="px-3 mb-2">
            <SidebarToggleButton className="w-full" />
          </div>

          {/* Navigation */}
          <nav className="mt-5 flex-1 flex flex-col divide-y divide-theme-border overflow-y-auto scrollbar-hide">
            <div className={`px-3 space-y-1 ${isSidebarExpanded ? '' : 'px-2'}`}>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const navItem = (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`dashboard-nav-item flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-md'
                        : 'text-theme-text-secondary hover:bg-theme-hover-bg hover:text-brand-primary'
                    } ${isSidebarExpanded ? '' : 'justify-center px-2'}`}
                  >
                    <i className={`${item.icon} text-lg flex-shrink-0 ${
                      isSidebarExpanded ? 'mr-3' : 'flex justify-center items-center'
                    }`}></i>
                    <span className={`truncate transition-all duration-300 ${
                      isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                    }`}>
                      {item.name}
                    </span>
                  </Link>
                );

                return isSidebarExpanded ? (
                  <div key={item.name} className="relative block">{navItem}</div>
                ) : (
                  <div key={item.name} className="relative block">
                    <Tooltip content={item.name} position="right">
                      {navItem}
                    </Tooltip>
                  </div>
                );
              })}
            </div>

            {/* Theme Toggle in Sidebar */}
            <div className={`px-3 py-4 ${isCollapsed ? 'px-2' : ''}`}>
              {isCollapsed ? (
                <Tooltip content="Toggle Theme" position="right">
                  <div className="flex justify-center">
                    <ThemeToggle variant="icon-only" />
                  </div>
                </Tooltip>
              ) : (
                <ThemeToggle variant="minimal" size="sm" showLabel={true} />
              )}
            </div>
          </nav>

          {/* User Info */}
          <div className={`flex-shrink-0 p-4 border-t border-theme-border ${
            isCollapsed ? 'px-2' : ''
          }`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="flex-shrink-0">
                <div className={`rounded-full bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-center text-white font-semibold transition-all duration-300 ${
                  isCollapsed ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
                }`}>
                  {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              </div>
              <div className={`ml-3 flex-1 min-w-0 transition-all duration-300 ${
                isCollapsed ? 'opacity-0 w-0 overflow-hidden ml-0' : 'opacity-100'
              }`}>
                <p className="text-sm font-medium text-theme-text-primary truncate">
                  {user.name}
                </p>
                <p className="text-xs text-theme-text-tertiary truncate">
                  Student
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        title="Navigation"
      >
        <div className="px-4 py-6">
          {/* Logo */}
          <div className="mb-8">
            <Link to="/" className="flex items-center justify-center">
              <img 
                src="/DCODE LOGO.png" 
                alt="DCODE Systems" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-md'
                      : 'text-theme-text-secondary hover:bg-theme-hover-bg hover:text-brand-primary'
                  }`}
                >
                  <i className={`${item.icon} mr-3 text-lg flex-shrink-0`}></i>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle in Mobile */}
          <div className="mt-8 pt-6 border-t border-theme-border">
            <ThemeToggle variant="default" size="md" />
          </div>

          {/* User Info */}
          <div className="mt-8 pt-6 border-t border-theme-border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-center text-white font-semibold">
                  {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-theme-text-primary">
                  {user.name}
                </p>
                <p className="text-sm text-theme-text-tertiary">
                  Student
                </p>
              </div>
            </div>
          </div>
        </div>
      </MobileDrawer>

      {/* Main content */}
      <div className={`lg:flex lg:flex-col lg:flex-1 transition-all duration-300 overflow-x-hidden ${
        isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-16'
      }`}>
        {/* Top bar - Fixed Height */}
        <div className="fixed top-0 left-0 right-0 z-40 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-theme-border bg-theme-card-bg/95 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:pl-24 lg:pr-8">
          {/* Mobile menu button */}
          <button
            type="button"
            className="p-2.5 text-theme-text-secondary lg:hidden hover:bg-theme-hover-bg rounded-lg transition-colors duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <i className="ri-menu-line text-xl"></i>
          </button>


          {/* Mobile Logo - Centered */}
          <div className="flex-1 flex justify-center lg:hidden">
            <Link to="/" className="flex items-center">
              <img 
                src="/DCODE LOGO.png" 
                alt="DCODE Systems" 
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-theme-border lg:hidden" aria-hidden="true" />

          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center absolute left-0 top-0 h-16 px-4 z-50">
            <Link to="/" className="flex items-center">
              <img 
                src="/DCODE LOGO.png" 
                alt="DCODE Systems" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1">
              {/* You can add search or other content here */}
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <NotificationDropdown>
                <button
                  type="button"
                  className="-m-2.5 p-2.5 text-theme-text-tertiary hover:text-theme-text-secondary hover:bg-theme-hover-bg rounded-lg transition-colors duration-200"
                >
                  <span className="sr-only">View notifications</span>
                  <i className="ri-notification-line text-xl"></i>
                </button>
              </NotificationDropdown>

              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-theme-border" aria-hidden="true" />

              {/* Profile dropdown */}
              <ProfileMenu user={user} />
            </div>
          </div>

          {/* Mobile Profile and Theme */}
          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle variant="icon-only" />
            <ProfileMenu user={user} />
          </div>
        </div>

        {/* Page content */}
        <main className={`flex-1 pt-16 pr-4 lg:pr-6 transition-all duration-300 ${
          isSidebarExpanded ? 'lg:pl-6' : 'lg:pl-4'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
