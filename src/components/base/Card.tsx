
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  interactive?: boolean;
  variant?: 'default' | 'stats' | 'feature' | 'testimonial' | 'dashboard';
  noPadding?: boolean;
  onClick?: () => void;
}

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  glass = false,
  interactive = false,
  variant = 'default',
  noPadding = false,
  onClick
}: CardProps) {
  const baseClasses = 'card-base';
  
  const variantClasses = {
    default: glass ? 'glass' : 'bg-white border border-gray-100',
    stats: 'card-stats',
    feature: 'glass-feature',
    testimonial: 'glass-testimonial', 
    dashboard: 'dashboard-card'
  };
  
  const interactiveClasses = interactive || hover ? 'card-interactive' : '';
  const paddingClasses = noPadding ? '!p-0' : '';
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${paddingClasses} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
