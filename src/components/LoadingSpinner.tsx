import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Enhanced LoadingSpinner Component
 * 
 * Features:
 * - Multiple size options with smooth animations
 * - Customizable text and colors
 * - Accessibility support with proper ARIA labels
 * - Optimized performance with CSS animations
 * - Pulsing background effect for better visual feedback
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  color?: 'blue' | 'green' | 'red' | 'purple';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  color = 'blue'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'text-blue-500 border-blue-200',
    green: 'text-green-500 border-green-200',
    red: 'text-red-500 border-red-200',
    purple: 'text-purple-500 border-purple-200'
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center min-h-[200px] space-y-4 ${className}`}
      role="status"
      aria-label={text}
    >
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin ${colorClasses[color].split(' ')[0]}`} />
        <div className={`absolute inset-0 rounded-full border-2 ${colorClasses[color].split(' ')[1]} animate-pulse`}></div>
      </div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};
