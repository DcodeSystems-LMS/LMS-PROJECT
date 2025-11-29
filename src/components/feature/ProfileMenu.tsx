import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragCurrentY, setDragCurrentY] = useState(0);
  const [dragVelocity, setDragVelocity] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useUserTheme();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      console.log('📱 Mobile check:', isMobileView, 'Width:', window.innerWidth);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Also check on mount
    setTimeout(checkMobile, 100);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
      document.body.style.height = 'unset';
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
      document.body.style.height = 'unset';
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobile, isOpen]);

  // Debug mobile state
  useEffect(() => {
    console.log('📱 Mobile state changed:', { isMobile, isOpen });
  }, [isMobile, isOpen]);

  // Prevent background scrolling and pull-to-refresh when mobile menu is open
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (isMobile && isOpen) {
        // Don't prevent if touching menu items or their children
        const target = e.target as HTMLElement;
        if (target.closest('.profile-menu-mobile-item') || 
            target.closest('.profile-menu-mobile') ||
            target.closest('a') ||
            target.closest('button')) {
          console.log('🔍 Allowing touch on menu item:', target);
          return;
        }
        
        console.log('🔍 Preventing touch on:', target);
        // Prevent pull-to-refresh
        if (e.touches[0].clientY > 0) {
          e.preventDefault();
        }
        // Prevent all scrolling
        e.preventDefault();
      }
    };

    if (isMobile && isOpen) {
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('touchstart', preventScroll, { passive: false });
    }

    return () => {
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('touchstart', preventScroll);
    };
  }, [isMobile, isOpen]);

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

  // Touch event handlers for drag gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    // Don't start dragging if touching menu items or their children
    const target = e.target as HTMLElement;
    if (target.closest('.profile-menu-mobile-item') || 
        target.closest('a') || 
        target.closest('button') ||
        target.closest('.profile-menu-icon')) {
      console.log('🔍 Not starting drag on menu item:', target);
      return;
    }
    
    console.log('🔍 Starting drag on:', target);
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragCurrentY(e.touches[0].clientY);
    
    // Prevent background scrolling and pull-to-refresh
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent Chrome's pull-to-refresh
    if (e.touches[0].clientY > 0) {
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragStartY;
    const velocity = deltaY - (dragCurrentY - dragStartY);
    
    // Always prevent default to stop background scrolling
    e.preventDefault();
    e.stopPropagation();
    
    // Only allow downward drag
    if (deltaY > 0) {
      setDragCurrentY(currentY);
      setDragVelocity(velocity);
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isDragging) return;
    
    const deltaY = dragCurrentY - dragStartY;
    const screenHeight = window.innerHeight;
    const threshold = Math.min(150, screenHeight * 0.2); // 20% of screen height or 150px max
    const velocityThreshold = 60; // Higher velocity threshold for quick swipe
    
    // Close if dragged far enough or with enough velocity
    if (deltaY > threshold || Math.abs(dragVelocity) > velocityThreshold) {
      // Close the menu immediately with slide-down animation
      setIsClosing(true);
      setIsDragging(false);
      setDragStartY(0);
      setDragCurrentY(0);
      setDragVelocity(0);
      
      // Close with requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        setTimeout(() => {
          setIsOpen(false);
          setIsClosing(false);
        }, 250); // Match the fade animation duration
      });
    } else {
      // Snap back to original position with smooth animation
      setIsDragging(false);
      setDragStartY(0);
      setDragCurrentY(0);
      setDragVelocity(0);
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
      path: '/admin/notifications',
    },
  ];

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Avatar Button */}
        <button
          onClick={() => {
            console.log('🔍 Profile button clicked:', { isMobile, isOpen });
            setIsOpen(!isOpen);
          }}
          className="profile-avatar"
          aria-label="Open profile menu"
        >
          {typeof user.avatar === 'string' && user.avatar ? (
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

      {/* Mobile Menu - Rendered as Portal */}
      {console.log('🔍 Mobile menu render check:', { isMobile, isOpen })}
      {isMobile && isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[9998]"
            style={{
              animation: isClosing ? 'fadeOut 0.2s ease-out' : 'fadeIn 0.3s ease-out',
              opacity: isClosing ? 0 : 1,
              transition: 'opacity 0.2s ease-out'
            }}
            onClick={() => setIsOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
          />

          {/* Mobile Menu - Fixed positioning with animation and drag support */}
          <div 
            className={`profile-menu-mobile open ${isClosing ? 'closing' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              background: 'white',
              borderTop: '1px solid #e5e7eb',
              borderRadius: '1rem 1rem 0 0',
              boxShadow: '0 -8px 25px rgba(43, 38, 126, 0.12)',
              padding: '1.5rem 1rem calc(1.5rem + env(safe-area-inset-bottom))',
              transform: isDragging 
                ? `translateY(${Math.max(0, Math.min(dragCurrentY - dragStartY, 200))}px)` 
                : isClosing 
                  ? 'translateY(100%)' 
                  : 'translateY(0)',
              opacity: isClosing ? 0 : isDragging && (dragCurrentY - dragStartY) > 80 ? 0.7 : 1,
              transition: isDragging 
                ? 'none' 
                : isClosing
                  ? 'transform 0.25s cubic-bezier(0.55, 0.06, 0.68, 0.19), opacity 0.2s ease-out'
                  : 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease-in',
              maxHeight: '80vh',
              overflowY: 'auto',
              animation: isClosing ? 'none' : 'slideUpIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            {/* Handle - Draggable indicator */}
            <div 
              className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing"
              style={{
                backgroundColor: isDragging 
                  ? (dragCurrentY - dragStartY) > 80 
                    ? '#ef4444' // Red when close to closing
                    : '#9ca3af' // Gray when dragging
                  : '#d1d5db', // Light gray when not dragging
                transform: isDragging && (dragCurrentY - dragStartY) > 80 ? 'scaleX(1.2)' : 'scaleX(1)',
                transition: 'background-color 0.2s ease, transform 0.2s ease'
              }}
            ></div>

            {/* User Info Header */}
            <div className="text-center mb-6">
              <div className="profile-avatar mx-auto mb-3">
                {typeof user.avatar === 'string' && user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
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
                  onClick={(e) => {
                    console.log('🔍 Menu item clicked:', item.label, item.path);
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  onMouseDown={(e) => {
                    console.log('🔍 Menu item mouse down:', item.label);
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    console.log('🔍 Menu item touch start:', item.label);
                    e.stopPropagation();
                  }}
                  onTouchEnd={(e) => {
                    console.log('🔍 Menu item touch end:', item.label);
                    e.stopPropagation();
                  }}
                >
                  <div className="profile-menu-icon">
                    <i className={item.icon}></i>
                  </div>
                  {item.label}
                </Link>
              ))}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                  setIsOpen(false);
                }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
                className="profile-menu-mobile-item"
              >
                <div className="profile-menu-icon">
                  <i className="ri-logout-circle-line"></i>
                </div>
                Logout
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}