import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SidebarMode = 'hover' | 'always-open' | 'button-toggle';

interface SidebarSettings {
  mode: SidebarMode;
  isOpen: boolean; // For button-toggle mode
}

interface SidebarSettingsContextType {
  settings: SidebarSettings;
  setMode: (mode: SidebarMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

const SidebarSettingsContext = createContext<SidebarSettingsContextType | undefined>(undefined);

interface SidebarSettingsProviderProps {
  children: ReactNode;
}

export const SidebarSettingsProvider: React.FC<SidebarSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SidebarSettings>({
    mode: 'hover',
    isOpen: false
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('sidebar-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Failed to parse sidebar settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sidebar-settings', JSON.stringify(settings));
  }, [settings]);

  const setMode = (mode: SidebarMode) => {
    setSettings(prev => ({
      ...prev,
      mode,
      // Reset isOpen when changing modes
      isOpen: mode === 'always-open' ? true : false
    }));
  };

  const toggleSidebar = () => {
    if (settings.mode === 'button-toggle') {
      setSettings(prev => ({
        ...prev,
        isOpen: !prev.isOpen
      }));
    }
  };

  const setSidebarOpen = (isOpen: boolean) => {
    setSettings(prev => ({
      ...prev,
      isOpen
    }));
  };

  const value: SidebarSettingsContextType = {
    settings,
    setMode,
    toggleSidebar,
    setSidebarOpen
  };

  return (
    <SidebarSettingsContext.Provider value={value}>
      {children}
    </SidebarSettingsContext.Provider>
  );
};

export const useSidebarSettings = (): SidebarSettingsContextType => {
  const context = useContext(SidebarSettingsContext);
  if (context === undefined) {
    throw new Error('useSidebarSettings must be used within a SidebarSettingsProvider');
  }
  return context;
};
