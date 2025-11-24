import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSidebarSettings } from '@/contexts/SidebarSettingsContext';

interface SidebarSettingsDropdownProps {
  className?: string;
}

export default function SidebarSettingsDropdown({ className = '' }: SidebarSettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'above' | 'below'>('below');
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { settings, setMode } = useSidebarSettings();

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerRect(rect);
      
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 420; // Height for all 3 options + save button
      
      // Check if there's enough space below
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Only position above if there's clearly not enough space below
      if (spaceBelow < 200 && spaceAbove > 200) {
        setDropdownPosition('above');
      } else {
        setDropdownPosition('below');
      }
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setTriggerRect(rect);
        
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        if (spaceBelow < 200 && spaceAbove > 200) {
          setDropdownPosition('above');
        } else {
          setDropdownPosition('below');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const handleModeChange = (mode: 'hover' | 'always-open' | 'button-toggle') => {
    setMode(mode);
    setIsOpen(false);
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'hover': return 'Hover to Open/Close';
      case 'always-open': return 'Always Open';
      case 'button-toggle': return 'Button Toggle';
      default: return 'Hover to Open/Close';
    }
  };

  const getCurrentModeLabel = () => {
    return getModeLabel(settings.mode);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-primary hover:bg-gray-100 rounded-lg transition-all duration-200"
      >
        <i className="ri-settings-3-line text-lg"></i>
        <span>Features</span>
        <i className={`ri-arrow-down-s-line text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && triggerRect && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            ref={dropdownRef}
            className="fixed w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999] flex flex-col"
            style={{
              left: `${triggerRect.right - 256}px`, // Position to the right of trigger
              top: dropdownPosition === 'above' 
                ? `${triggerRect.top - 420}px` 
                : `${triggerRect.bottom + 8}px`,
              maxHeight: '80vh',
              overflowY: 'auto',
              width: '256px'
            }}>
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Side Nav Bar Toggles</h3>
            <p className="text-xs text-gray-500 mt-1">Choose how the sidebar behaves</p>
          </div>

          {/* Options */}
          <div className="py-1 flex-1">
            {/* Hover to Open/Close */}
            <button
              onClick={() => handleModeChange('hover')}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-200 ${
                settings.mode === 'hover'
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <i className="ri-mouse-line text-lg"></i>
                <div className="text-left">
                  <div className="font-medium">Hover to Open/Close</div>
                  <div className="text-xs text-gray-500">Opens on hover, closes when cursor leaves</div>
                </div>
              </div>
              {settings.mode === 'hover' && (
                <i className="ri-check-line text-brand-primary"></i>
              )}
            </button>

            {/* Always Open */}
            <button
              onClick={() => handleModeChange('always-open')}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-200 ${
                settings.mode === 'always-open'
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <i className="ri-eye-line text-lg"></i>
                <div className="text-left">
                  <div className="font-medium">Always Open</div>
                  <div className="text-xs text-gray-500">Sidebar stays open permanently</div>
                </div>
              </div>
              {settings.mode === 'always-open' && (
                <i className="ri-check-line text-brand-primary"></i>
              )}
            </button>

            {/* Button Toggle */}
            <button
              onClick={() => handleModeChange('button-toggle')}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-200 ${
                settings.mode === 'button-toggle'
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <i className="ri-toggle-line text-lg"></i>
                <div className="text-left">
                  <div className="font-medium">Button Toggle</div>
                  <div className="text-xs text-gray-500">Manual toggle with button control</div>
                </div>
              </div>
              {settings.mode === 'button-toggle' && (
                <i className="ri-check-line text-brand-primary"></i>
              )}
            </button>
          </div>

          {/* Current Mode Indicator */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-600">
              Current: <span className="font-medium text-gray-900">{getCurrentModeLabel()}</span>
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6 px-4">
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer whitespace-nowrap"
              onClick={() => setIsOpen(false)}
            >
              Save Settings
            </button>
          </div>
        </div>
        </>,
        document.body
      )}
    </div>
  );
}
