import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (value: string) => void;
}

interface SelectValueProps {
  placeholder?: string;
  value?: string;
}

export function Select({ value, onValueChange, children, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleValueChange = (newValue: string) => {
    console.log('Select handleValueChange called with:', newValue);
    onValueChange(newValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child, { 
              isOpen, 
              setIsOpen,
              value 
            });
          }
          if (child.type === SelectContent) {
            return React.cloneElement(child, { 
              isOpen, 
              onValueChange: handleValueChange 
            });
          }
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({ 
  children, 
  className = '', 
  isOpen, 
  setIsOpen, 
  value 
}: SelectTriggerProps & { isOpen?: boolean; setIsOpen?: (open: boolean) => void; value?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('SelectTrigger clicked, current isOpen:', isOpen);
        setIsOpen?.(!isOpen);
      }}
      className={`flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {children}
      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectContent({ 
  children, 
  className = '', 
  isOpen, 
  onValueChange 
}: SelectContentProps & { isOpen?: boolean; onValueChange?: (value: string) => void }) {
  console.log('SelectContent render, isOpen:', isOpen);

  if (!isOpen) return null;

  return (
    <div className={`absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child, { 
            onClick: onValueChange 
          });
        }
        return child;
      })}
    </div>
  );
}

export function SelectItem({ 
  value, 
  children, 
  className = '', 
  onClick 
}: SelectItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('SelectItem clicked:', value);
    onClick?.(value);
  };

  return (
    <div
      onClick={handleClick}
      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${className}`}
    >
      {children}
    </div>
  );
}

export function SelectValue({ placeholder, value }: SelectValueProps) {
  console.log('SelectValue render, value:', value);
  return <span className="text-white">{value || placeholder}</span>;
}