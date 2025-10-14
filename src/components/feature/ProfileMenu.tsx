import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { useUserTheme } from '@/contexts/UserThemeContext';

interface ProfileMenuProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export default function ProfileMenu({ user }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useUserTheme();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Force light mode for mentors
  useEffect(() => {
    if (user.role === 'mentor' && theme === 'dark') {
      setTheme('light');
      console.log('🎨 ProfileMenu: Forced light mode for mentor');
    }
  }, [user.role, theme, setTheme]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate('/auth/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getProfilePath = () => {
    switch (user.role) {
      case 'student':
        return '/student/profile';
      case 'mentor':
        return '/mentor/profile';
      case 'admin':
        return '/admin/profile';
      default:
        return '/profile';
    }
  };

  const getSettingsPath = () => {
    switch (user.role) {
      case 'student':
        return '/student/settings';
      case 'mentor':
        return '/mentor/settings';
      case 'admin':
        return '/admin/settings';
      default:
        return '/settings';
    }
  };

  const getWishlistPath = () => {
    switch (user.role) {
      case 'student':
        return '/student/wishlist';
      case 'mentor':
        return '/mentor/wishlist';
      default:
        return '/wishlist';
    }
  };

  const menuItems = [
    {
      label: 'View Profile',
      icon: 'ri-user-line',
      path: getProfilePath(),
    },
    {
      label: 'Settings',
      icon: 'ri-settings-line',
      path: getSettingsPath(),
    },
    {
      label: 'My Wishlist',
      icon: 'ri-heart-line',
      path: getWishlistPath(),
    },
    {
      label: 'Notifications',
      icon: 'ri-notification-line',
      path: '#',
    },
  ];

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Avatar Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="profile-avatar"
          aria-label="Open profile menu"
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            getInitials(user.name)
          )}
        </button>

        {/* Desktop Menu */}
        {isOpen && !isMobile && (
          <div className="profile-menu animate-slide-down">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-orange-500 rounded-full mt-1 capitalize">
                {user.role}
              </span>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="profile-menu-item"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="profile-menu-icon">
                    <i className={item.icon}></i>
                  </div>
                  {item.label}
                </Link>
              ))}
              
              <button
                onClick={handleLogout}
                className="profile-menu-item"
              >
                <div className="profile-menu-icon">
                  <i className="ri-logout-circle-line"></i>
                </div>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && (
        <>
          {/* Backdrop */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Mobile Menu */}
          <div className={`profile-menu-mobile ${isOpen ? 'open' : ''}`}>
            {/* Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

            {/* User Info Header */}
            <div className="text-center mb-6">
              <div className="profile-avatar mx-auto mb-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <p className="text-lg font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-orange-500 rounded-full mt-2 capitalize">
                {user.role}
              </span>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="profile-menu-mobile-item"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="profile-menu-icon">
                    <i className={item.icon}></i>
                  </div>
                  {item.label}
                </Link>
              ))}
              
              <button
                onClick={handleLogout}
                className="profile-menu-mobile-item"
              >
                <div className="profile-menu-icon">
                  <i className="ri-logout-circle-line"></i>
                </div>
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}