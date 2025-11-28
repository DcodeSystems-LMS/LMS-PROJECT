import { useState, useEffect } from 'react';

export const useSidebar = (storageKey: string = 'sidebar-collapsed') => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : false;
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem(storageKey, JSON.stringify(newValue));
      return newValue;
    });
  };

  const collapseSidebar = () => {
    setIsCollapsed(true);
    localStorage.setItem(storageKey, JSON.stringify(true));
  };

  const expandSidebar = () => {
    setIsCollapsed(false);
    localStorage.setItem(storageKey, JSON.stringify(false));
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        setIsCollapsed(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  return {
    isCollapsed,
    toggleSidebar,
    collapseSidebar,
    expandSidebar
  };
};