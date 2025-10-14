import React, { useState } from 'react';

/**
 * Enhanced ToggleSwitch component with improved animations and accessibility
 * Features:
 * - Smooth animations with spring effects
 * - Better accessibility support
 * - Ripple effect on interaction
 * - Improved visual feedback
 */
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'red' | 'purple' | 'indigo' | 'pink';
  showIcon?: boolean;
  className?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md',
  color = 'blue',
  showIcon = false,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-12 h-6',
    lg: 'w-16 h-8'
  };

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const colorClasses = {
    blue: checked ? 'bg-blue-500 shadow-blue-500/50' : 'bg-gray-300 dark:bg-gray-600',
    green: checked ? 'bg-green-500 shadow-green-500/50' : 'bg-gray-300 dark:bg-gray-600',
    red: checked ? 'bg-red-500 shadow-red-500/50' : 'bg-gray-300 dark:bg-gray-600',
    purple: checked ? 'bg-purple-500 shadow-purple-500/50' : 'bg-gray-300 dark:bg-gray-600',
    indigo: checked ? 'bg-indigo-500 shadow-indigo-500/50' : 'bg-gray-300 dark:bg-gray-600',
    pink: checked ? 'bg-pink-500 shadow-pink-500/50' : 'bg-gray-300 dark:bg-gray-600'
  };

  const thumbColorClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0',
    md: checked ? 'translate-x-6' : 'translate-x-0',
    lg: checked ? 'translate-x-8' : 'translate-x-0'
  };

  const handleClick = () => {
    if (!disabled) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
          {label}
        </label>
      )}
      <button
        type="button"
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
          ${isPressed ? 'scale-95' : 'scale-100'}
          relative inline-flex items-center rounded-full 
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${checked ? 'shadow-lg' : 'shadow-sm'}
        `}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Toggle switch'}
        tabIndex={disabled ? -1 : 0}
      >
        {/* Ripple effect */}
        {isPressed && !disabled && (
          <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
        )}
        
        {/* Thumb with enhanced styling */}
        <span
          className={`
            ${thumbSizeClasses[size]}
            ${thumbColorClasses[size]}
            bg-white dark:bg-gray-100 rounded-full shadow-lg 
            transform transition-all duration-300 ease-out
            inline-block relative z-10
            ${checked ? 'shadow-lg' : 'shadow-md'}
          `}
        >
          {/* Icon inside thumb (optional) */}
          {showIcon && (
            <div className="absolute inset-0 flex items-center justify-center">
              {checked ? (
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              ) : (
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
              )}
            </div>
          )}
        </span>
      </button>
    </div>
  );
};
