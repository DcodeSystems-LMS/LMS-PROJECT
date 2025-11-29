
import { ReactNode } from 'react';
import SimpleDCODESpinner from './SimpleDCODESpinner';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'brand' | 'brand-secondary' | 'brand-outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  title?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  title
}: ButtonProps) {
  const baseClasses = 'interactive-element inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 shadow-sm hover:shadow-md',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-blue-500 hover:border-gray-400 shadow-sm hover:shadow-md',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-blue-500',
    brand: 'btn-brand text-white focus:ring-purple-500',
    'brand-secondary': 'btn-brand-secondary focus:ring-purple-500',
    'brand-outline': 'btn-brand-outline focus:ring-purple-500'
  };
  
  const sizes = {
    sm: 'px-4 py-2.5 text-sm min-h-[2.5rem]',
    md: 'px-6 py-3 text-sm min-h-[2.75rem]',
    lg: 'px-8 py-4 text-base min-h-[3.5rem]'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const transitionClass = 'transition-all duration-200 ease-out';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${transitionClass} ${className}`}
    >
      {loading && (
        <SimpleDCODESpinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  );
}
