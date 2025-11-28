import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const AlertContext = React.createContext<{
  variant: string;
}>({
  variant: 'default'
});

export function Alert({ children, className = '', variant = 'default' }: AlertProps) {
  const baseClasses = 'relative w-full rounded-lg border p-4';
  
  const variantClasses = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  return (
    <AlertContext.Provider value={{ variant }}>
      <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
        {children}
      </div>
    </AlertContext.Provider>
  );
}

export function AlertDescription({ children, className = '' }: AlertDescriptionProps) {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  );
}

export function AlertIcon({ className = '' }: { className?: string }) {
  const { variant } = React.useContext(AlertContext);
  
  const iconClasses = 'w-4 h-4';
  
  switch (variant) {
    case 'destructive':
      return <AlertCircle className={`${iconClasses} ${className}`} />;
    case 'success':
      return <CheckCircle className={`${iconClasses} ${className}`} />;
    case 'warning':
      return <AlertCircle className={`${iconClasses} ${className}`} />;
    default:
      return <Info className={`${iconClasses} ${className}`} />;
  }
}
