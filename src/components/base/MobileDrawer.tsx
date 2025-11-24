import React, { useEffect } from 'react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function MobileDrawer({ isOpen, onClose, children, title }: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      // Lock vertical scroll while drawer is open but keep horizontal locked via CSS
      document.body.style.overflowY = 'hidden';
    } else {
      // Revert to stylesheet defaults (keeps overflow-x hidden globally)
      document.body.style.overflowY = '';
    }

    return () => {
      document.body.style.overflowY = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden touch-pan-y overflow-x-hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-x-hidden touch-pan-y ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="overflow-y-auto h-full pb-4">
          {children}
        </div>
      </div>
    </>
  );
}