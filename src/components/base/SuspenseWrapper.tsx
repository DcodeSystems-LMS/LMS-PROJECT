import React, { Suspense, ReactNode } from 'react';
import SimpleDCODESpinner from './SimpleDCODESpinner';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const DefaultFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <SimpleDCODESpinner size="lg" className="mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ 
  children, 
  fallback = <DefaultFallback /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default SuspenseWrapper;
