import { useEffect } from 'react';
import { useUserTheme } from '@/contexts/UserThemeContext';

/**
 * Custom hook for mentor theme management
 * Forces light mode for mentor users and prevents dark mode switching
 */
export const useMentorTheme = (userRole: string) => {
  const { theme, setTheme, setDarkModeEnabled } = useUserTheme();

  useEffect(() => {
    if (userRole === 'mentor') {
      // Force light mode for mentors by disabling dark mode
      setDarkModeEnabled(false);
      console.log('🎨 useMentorTheme: Forced light mode for mentor');
    }
  }, [userRole, setDarkModeEnabled]);

  return {
    theme: userRole === 'mentor' ? 'light' : theme,
    setTheme: userRole === 'mentor' ? (newTheme: 'light' | 'dark') => {
      if (newTheme === 'dark') {
        console.log('🚫 useMentorTheme: Dark mode disabled for mentors');
        return;
      }
      setTheme(newTheme);
    } : setTheme,
    setDarkModeEnabled: userRole === 'mentor' ? (enabled: boolean) => {
      if (enabled) {
        console.log('🚫 useMentorTheme: Dark mode disabled for mentors');
        return;
      }
      setDarkModeEnabled(enabled);
    } : setDarkModeEnabled
  };
};
