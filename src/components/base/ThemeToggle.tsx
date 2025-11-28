import React from 'react';
import { useUserTheme } from '@/contexts/UserThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'minimal' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'default', 
  size = 'md', 
  showLabel = true,
  className = '' 
}) => {
  const { theme, toggleTheme } = useUserTheme();

  const sizeClasses = {
    sm: 'w-10 h-6',
    md: 'w-12 h-7',
    lg: 'w-14 h-8'
  };

  const knobSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
          theme === 'dark' 
            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
            : 'bg-purple-500/20 text-purple-600 hover:bg-purple-500/30'
        } ${className}`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <i className={`${theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line'} text-lg`}></i>
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-theme-text-secondary">
            {theme === 'dark' ? 'Dark' : 'Light'} Mode
          </span>
        )}
        <button
          onClick={toggleTheme}
          className={`relative inline-flex items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary ${sizeClasses[size]} ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-600 to-orange-500 border-transparent'
              : 'bg-gray-200 border-gray-300'
          }`}
        >
          <span
            className={`inline-block rounded-full bg-white shadow-lg transform transition-all duration-300 ${knobSizes[size]} ${
              theme === 'dark' 
                ? `translate-x-${size === 'sm' ? '4' : size === 'md' ? '5' : '6'}` 
                : 'translate-x-1'
            }`}
          >
            <i className={`absolute inset-0 flex items-center justify-center text-xs ${
              theme === 'dark' ? 'text-orange-500 ri-moon-fill' : 'text-yellow-500 ri-sun-fill'
            }`}></i>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between p-4 bg-theme-card-bg border border-theme-card-border rounded-lg ${className}`}>
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
        }`}>
          <i className={`${theme === 'dark' ? 'ri-moon-line' : 'ri-sun-line'} text-lg`}></i>
        </div>
        <div>
          <h3 className="font-medium text-theme-text-primary">Appearance</h3>
          <p className="text-sm text-theme-text-secondary">
            Switch between light and dark themes
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-theme-text-secondary">
          {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
        <button
          onClick={toggleTheme}
          className={`relative inline-flex items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary hover:scale-105 ${sizeClasses[size]} ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-600 to-orange-500 border-transparent shadow-lg shadow-purple-500/30'
              : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
          }`}
        >
          <span
            className={`inline-block rounded-full bg-white shadow-lg transform transition-all duration-300 ${knobSizes[size]} ${
              theme === 'dark' 
                ? `translate-x-${size === 'sm' ? '4' : size === 'md' ? '5' : '6'}` 
                : 'translate-x-1'
            }`}
          >
            <i className={`absolute inset-0 flex items-center justify-center text-xs transition-all duration-300 ${
              theme === 'dark' 
                ? 'text-orange-500 ri-moon-fill' 
                : 'text-yellow-500 ri-sun-fill'
            }`}></i>
          </span>
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;