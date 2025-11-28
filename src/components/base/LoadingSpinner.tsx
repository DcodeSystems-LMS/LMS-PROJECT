import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  return (
    <div className={`inline-block ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          border-4 border-gray-200 border-t-4 border-t-current rounded-full 
          ${colorClasses[color]}
          animate-spin
        `}
        style={{
          animation: 'spin 1s linear infinite'
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
