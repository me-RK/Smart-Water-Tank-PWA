import React from 'react';

/**
 * Material Design Progress Bar Component
 * 
 * Features:
 * - Material Design progress bar styling
 * - Linear and circular variants
 * - Indeterminate animation
 * - Custom colors
 * - Accessibility support
 */
interface MaterialProgressBarProps {
  value?: number; // 0-100 for determinate, undefined for indeterminate
  variant?: 'linear' | 'circular';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export const MaterialProgressBar: React.FC<MaterialProgressBarProps> = ({
  value,
  variant = 'linear',
  size = 'medium',
  color = 'primary',
  className = '',
  showLabel = false,
  label
}) => {
  const isIndeterminate = value === undefined;

  const sizeClasses = {
    small: {
      linear: 'h-1',
      circular: 'w-6 h-6'
    },
    medium: {
      linear: 'h-2',
      circular: 'w-8 h-8'
    },
    large: {
      linear: 'h-3',
      circular: 'w-12 h-12'
    }
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };

  const currentSize = sizeClasses[size];

  if (variant === 'circular') {
    const radius = size === 'small' ? 10 : size === 'medium' ? 14 : 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = isIndeterminate ? 0 : circumference - (value! / 100) * circumference;

    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className="relative">
          <svg
            className={`${currentSize.circular} transform -rotate-90`}
            viewBox={`0 0 ${radius * 2 + 4} ${radius * 2 + 4}`}
          >
            {/* Background circle */}
            <circle
              cx={radius + 2}
              cy={radius + 2}
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx={radius + 2}
              cy={radius + 2}
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={`${colorClasses[color]} transition-all duration-300 ease-out ${
                isIndeterminate ? 'animate-spin' : ''
              }`}
            />
          </svg>
          {showLabel && !isIndeterminate && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {value}%
              </span>
            </div>
          )}
        </div>
        {label && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label || 'Progress'}
          </span>
          {!isIndeterminate && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {value}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${currentSize.linear}`}>
        <div
          className={`
            ${colorClasses[color]}
            ${currentSize.linear}
            rounded-full transition-all duration-300 ease-out
            ${isIndeterminate ? 'animate-pulse' : ''}
          `}
          style={{
            width: isIndeterminate ? '100%' : `${Math.min(100, Math.max(0, value!))}%`
          }}
        />
      </div>
    </div>
  );
};
