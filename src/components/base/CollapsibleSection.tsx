import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: string;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  icon,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 px-4 text-left hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <i className={`${icon} text-lg text-gray-600`}></i>
          )}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <i 
          className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-lg text-gray-500 transition-transform duration-200`}
        ></i>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="text-gray-700 leading-relaxed">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
