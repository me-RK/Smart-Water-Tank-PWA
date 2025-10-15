import React, { useState } from 'react';

/**
 * Material Design Card Component
 * 
 * Features:
 * - Material Design elevation system
 * - Hover and focus states
 * - Interactive variants
 * - Responsive design
 * - Accessibility support
 */
interface MaterialCardProps {
  children: React.ReactNode;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  interactive?: boolean;
  hoverable?: boolean;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'small' | 'medium' | 'large';
  rounded?: 'none' | 'small' | 'medium' | 'large';
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  children,
  elevation = 1,
  interactive = false,
  hoverable = true,
  className = '',
  onClick,
  padding = 'medium',
  rounded = 'medium'
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseClasses = 'bg-white dark:bg-gray-800 transition-all duration-200 ease-out';

  const elevationClasses = {
    0: 'shadow-none',
    1: 'shadow-elevation-1',
    2: 'shadow-elevation-2',
    3: 'shadow-elevation-3',
    4: 'shadow-elevation-4',
    5: 'shadow-elevation-5'
  };

  const paddingClasses = {
    none: '',
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const roundedClasses = {
    none: 'rounded-none',
    small: 'rounded-md',
    medium: 'rounded-lg',
    large: 'rounded-xl'
  };

  const interactiveClasses = interactive ? 'cursor-pointer' : '';
  const hoverClasses = hoverable && interactive ? 'hover:shadow-elevation-3 hover:-translate-y-1' : '';
  const focusClasses = isFocused ? 'ring-2 ring-blue-500 ring-offset-2' : '';

  const handleClick = () => {
    if (interactive && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (interactive && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${elevationClasses[elevation]}
        ${paddingClasses[padding]}
        ${roundedClasses[rounded]}
        ${interactiveClasses}
        ${hoverClasses}
        ${focusClasses}
        ${className}
      `}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
    >
      {children}
    </div>
  );
};
