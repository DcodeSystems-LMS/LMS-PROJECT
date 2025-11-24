import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import SimpleDCODESpinner from '@/components/base/SimpleDCODESpinner';
import { authService } from '@/lib/auth';
import MobileDrawer from '@/components/base/MobileDrawer';
import ProfileMenu from '@/components/feature/ProfileMenu';
import NotificationDropdown from '@/components/feature/NotificationDropdown';
import Tooltip from '@/components/base/Tooltip';
import SidebarToggleButton from '@/components/feature/SidebarToggleButton';
import SidebarSettingsDropdown from '@/components/feature/SidebarSettingsDropdown';
import { useSidebar } from '@/hooks/useSidebar';
import { useMentorTheme } from '@/hooks/useMentorTheme';
import { useSidebarSettings } from '@/contexts/SidebarSettingsContext';

const navigation = [
  { name: 'Dashboard', href: '/mentor/dashboard', icon: 'ri-dashboard-line' },
  { name: 'My Students', href: '/mentor/students', icon: 'ri-group-line' },
  { name: 'Student Discussions', href: '/mentor/discussions', icon: 'ri-message-line' },
  { name: 'Sessions', href: '/mentor/sessions', icon: 'ri-calendar-check-line' },
  { name: 'My Courses', href: '/mentor/courses', icon: 'ri-book-open-line' },
  { name: 'All Courses', href: '/mentor/all-courses', icon: 'ri-book-2-line' },
  { name: 'Upload Course', href: '/mentor/upload-course', icon: 'ri-upload-cloud-line' },
  { name: 'Course Materials', href: '/mentor/materials', icon: 'ri-file-line' },
  { name: 'Assessments', href: '/mentor/assessments', icon: 'ri-file-list-line' },
  { name: 'Feedback', href: '/mentor/feedback', icon: 'ri-star-line' },
  { name: 'Payments', href: '/mentor/payments', icon: 'ri-money-dollar-circle-line' },
];

export default function MentorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar } = useSidebar('mentor-sidebar-collapsed');
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
  
  // Force light mode for mentor panel
  useMentorTheme(user?.role || 'mentor');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          console.log('No user found, redirecting to sign in');
          navigate('/auth/signin');
          return;
        }
        if (currentUser.role !== 'mentor') {
          console.log('User is not mentor, redirecting to sign in');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <SimpleDCODESpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div 
        className={`hidden lg:fixed lg:top-16 lg:bottom-0 lg:flex lg:flex-col transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'lg:w-64' : 'lg:w-16'
        }`}
        onMouseEnter={() => settings.mode === 'hover' && setIsHovered(true)}
        onMouseLeave={() => settings.mode === 'hover' && setIsHovered(false)}
      >
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 shadow-sm overflow-hidden overflow-x-hidden">
          {/* Sidebar now starts without logo */}

          {/* Toggle Button - Above Sidebar */}
          <div className="px-3 mb-2">
            <SidebarToggleButton className="w-full" />
          </div>

          {/* Navigation */}
          <nav className="mt-5 flex-1 flex flex-col divide-y divide-gray-100 overflow-y-auto scrollbar-hide">
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
                        : 'text-gray-700 hover:bg-gray-100 hover:text-brand-primary'
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
          </nav>

          {/* User Info */}
          <div className={`flex-shrink-0 p-4 border-t border-gray-200 ${
            isSidebarExpanded ? '' : 'px-2'
          }`}>
            <div className={`flex items-center ${isSidebarExpanded ? '' : 'justify-center'}`}>
              <div className="flex-shrink-0">
                <div className={`rounded-full bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-center text-white font-semibold transition-all duration-300 ${
                  isSidebarExpanded ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
                }`}>
                  {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              </div>
              <div className={`ml-3 flex-1 min-w-0 transition-all duration-300 ${
                isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden ml-0'
              }`}>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Mentor
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
                      : 'text-gray-700 hover:bg-gray-100 hover:text-brand-primary'
                  }`}
                >
                  <i className={`${item.icon} mr-3 text-lg flex-shrink-0`}></i>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-center text-white font-semibold">
                  {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-gray-900">
                  {user.name}
                </p>
                <p className="text-sm text-gray-500">
                  Mentor
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
        <div className="fixed top-0 left-0 right-0 z-40 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:pl-24 lg:pr-8">
          {/* Mobile menu button */}
          <button
            type="button"
            className="p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-lg transition-colors duration-200"
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
          <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

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
                  className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <span className="sr-only">View notifications</span>
                  <i className="ri-notification-line text-xl"></i>
                </button>
              </NotificationDropdown>

              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

              {/* Profile dropdown */}
              <ProfileMenu user={user} />
            </div>
          </div>

          {/* Mobile Profile */}
          <div className="lg:hidden">
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
