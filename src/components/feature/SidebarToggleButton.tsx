import React from 'react';
import { useSidebarSettings } from '@/contexts/SidebarSettingsContext';

interface SidebarToggleButtonProps {
  className?: string;
}

export default function SidebarToggleButton({ className = '' }: SidebarToggleButtonProps) {
  const { settings, toggleSidebar } = useSidebarSettings();

  // Only show button in button-toggle mode
  if (settings.mode !== 'button-toggle') {
    return null;
  }

  return (
    <button
      onClick={toggleSidebar}
      className={`flex items-center justify-center p-2 text-gray-600 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-all duration-200 ${className}`}
      title={settings.isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <i className={`ri-${settings.isOpen ? 'menu-fold' : 'menu-unfold'}-line text-lg`}></i>
    </button>
  );
}
