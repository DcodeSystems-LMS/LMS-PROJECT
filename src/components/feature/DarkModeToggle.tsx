import React from 'react';
import { useUserTheme } from '@/contexts/UserThemeContext';

interface DarkModeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const { isDarkModeEnabled, setDarkModeEnabled, isUserAuthenticated } = useUserTheme();

  const handleToggle = () => {
    if (isUserAuthenticated) {
      setDarkModeEnabled(!isDarkModeEnabled);
    }
  };

  if (!isUserAuthenticated) {
    return null; // Don't show toggle for unauthenticated users
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabel && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Dark Mode
        </label>
      )}
      
      <button
        onClick={handleToggle}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2
          ${isDarkModeEnabled 
            ? 'bg-brand-primary' 
            : 'bg-gray-200 dark:bg-gray-700'
          }
        `}
        role="switch"
        aria-checked={isDarkModeEnabled}
        aria-label="Toggle dark mode"
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${isDarkModeEnabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      
      {showLabel && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {isDarkModeEnabled ? 'Enabled' : 'Disabled'}
        </span>
      )}
    </div>
  );
};

export default DarkModeToggle;
