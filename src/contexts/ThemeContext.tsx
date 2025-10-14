import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('dcode-theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('dcode-theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
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

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('dcode-theme');
      if (!savedTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};