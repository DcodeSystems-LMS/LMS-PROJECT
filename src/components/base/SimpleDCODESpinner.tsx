import React from 'react';

interface SimpleDCODESpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SimpleDCODESpinner: React.FC<SimpleDCODESpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`inline-block ${className}`}>
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        {/* Simple rotating ring with DCODE colors */}
        <div className="w-full h-full border-4 border-blue-600/20 border-t-blue-600 border-r-orange-500 rounded-full animate-spin"></div>
        
        {/* Inner ring */}
        <div className="absolute inset-2 border-2 border-orange-500/20 border-b-orange-500 border-l-blue-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
      </div>
    </div>
  );
};

export default SimpleDCODESpinner;
