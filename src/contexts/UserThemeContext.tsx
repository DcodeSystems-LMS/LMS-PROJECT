import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { authService } from '@/lib/auth';

type Theme = 'light' | 'dark';

interface UserThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDarkModeEnabled: boolean;
  setDarkModeEnabled: (enabled: boolean) => void;
  isUserAuthenticated: boolean;
}

const UserThemeContext = createContext<UserThemeContextType | undefined>(undefined);

export const useUserTheme = () => {
  const context = useContext(UserThemeContext);
  if (context === undefined) {
    throw new Error('useUserTheme must be used within a UserThemeProvider');
  }
  return context;
};

interface UserThemeProviderProps {
  children: React.ReactNode;
}

// Pages where dark mode should be disabled
const DISABLED_DARK_MODE_PAGES = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/create-admin',
  '/contact',
  '/courses',
  '/mentors',
  '/leaderboard',
  '/privacy',
  '/terms',
  '/cookies',
  '/verify',
  '/test-auth'
];

export const UserThemeProvider: React.FC<UserThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  // Check if current page should have dark mode disabled
  const isDarkModeDisabled = DISABLED_DARK_MODE_PAGES.includes(location.pathname);

  // Initialize theme and user data
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setIsUserAuthenticated(!!currentUser);
        setUser(currentUser);

        if (currentUser) {
          // User is authenticated - use their dark mode preference
          const userDarkMode = currentUser.dark_mode || false;
          setIsDarkModeEnabled(userDarkMode);
          
          // Only apply dark mode if user has enabled it AND we're not on a disabled page
          if (userDarkMode && !isDarkModeDisabled) {
            setThemeState('dark');
          } else {
            setThemeState('light');
          }
        } else {
          // User not authenticated - force light mode
          setIsDarkModeEnabled(false);
          setThemeState('light');
        }
      } catch (error) {
        console.error('Error initializing theme:', error);
        // Fallback to light mode
        setIsDarkModeEnabled(false);
        setThemeState('light');
      }
    };

    initializeTheme();
  }, [location.pathname, isDarkModeDisabled]);

  const setTheme = (newTheme: Theme) => {
    // Only allow theme changes if user is authenticated and not on disabled pages
    if (isUserAuthenticated && !isDarkModeDisabled) {
      setThemeState(newTheme);
      
      // Update user's dark mode preference in database
      if (user) {
        updateUserDarkModePreference(newTheme === 'dark');
      }
    } else {
      // Force light mode for unauthenticated users or disabled pages
      setThemeState('light');
    }
  };

  const toggleTheme = () => {
    if (isUserAuthenticated && !isDarkModeDisabled) {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    }
  };

  const setDarkModeEnabled = async (enabled: boolean) => {
    if (!isUserAuthenticated) return;

    setIsDarkModeEnabled(enabled);
    
    if (enabled && !isDarkModeDisabled) {
      setThemeState('dark');
    } else {
      setThemeState('light');
    }

    // Update user's preference in database
    await updateUserDarkModePreference(enabled);
  };

  const updateUserDarkModePreference = async (darkMode: boolean) => {
    try {
      if (user) {
        // Update user's dark mode preference in the database
        const { error } = await authService.updateUserProfile({
          dark_mode: darkMode
        });

        if (error) {
          console.error('Error updating dark mode preference:', error);
        }
      }
    } catch (error) {
      console.error('Error updating dark mode preference:', error);
    }
  };

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Apply theme-specific CSS variables
    if (theme === 'dark') {
      root.style.setProperty('--theme-bg-primary', '#0f0f23');
      root.style.setProperty('--theme-bg-secondary', '#1a1a2e');
      root.style.setProperty('--theme-bg-tertiary', '#16213e');
      root.style.setProperty('--theme-text-primary', '#ffffff');
      root.style.setProperty('--theme-text-secondary', '#a0a9c0');
      root.style.setProperty('--theme-text-tertiary', '#64748b');
      root.style.setProperty('--theme-border', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--theme-card-bg', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--theme-card-border', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--theme-glass-bg', 'rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--theme-glass-border', 'rgba(255, 255, 255, 0.15)');
      root.style.setProperty('--theme-input-bg', 'rgba(255, 255, 255, 0.05)');
      root.style.setProperty('--theme-hover-bg', 'rgba(255, 255, 255, 0.1)');
    } else {
      root.style.setProperty('--theme-bg-primary', '#ffffff');
      root.style.setProperty('--theme-bg-secondary', '#f8fafc');
      root.style.setProperty('--theme-bg-tertiary', '#f1f5f9');
      root.style.setProperty('--theme-text-primary', '#1f2937');
      root.style.setProperty('--theme-text-secondary', '#4b5563');
      root.style.setProperty('--theme-text-tertiary', '#6b7280');
      root.style.setProperty('--theme-border', '#e5e7eb');
      root.style.setProperty('--theme-card-bg', '#ffffff');
      root.style.setProperty('--theme-card-border', 'rgba(43, 38, 126, 0.06)');
      root.style.setProperty('--theme-glass-bg', 'rgba(255, 255, 255, 0.12)');
      root.style.setProperty('--theme-glass-border', 'rgba(43, 38, 126, 0.18)');
      root.style.setProperty('--theme-input-bg', '#ffffff');
      root.style.setProperty('--theme-hover-bg', '#f3f4f6');
    }
  }, [theme]);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDarkModeEnabled,
    setDarkModeEnabled,
    isUserAuthenticated,
  };

  return (
    <UserThemeContext.Provider value={value}>
      {children}
    </UserThemeContext.Provider>
  );
};
