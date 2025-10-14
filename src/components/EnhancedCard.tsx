import React, { useState } from 'react';

/**
 * Enhanced Card Component
 * 
 * Features:
 * - Multiple variants and styles
 * - Hover effects and animations
 * - Interactive states
 * - Gradient backgrounds
 * - Shadow effects
 * - Responsive design
 */
interface EnhancedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient' | 'glass';
  hover?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  variant = 'default',
  hover = true,
  interactive = false,
  className = '',
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = 'rounded-xl transition-all duration-300 ease-out';

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg',
    elevated: 'bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700',
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 shadow-lg',
    glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-lg'
  };

  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-105' : '';
  const interactiveClasses = interactive ? 'cursor-pointer' : '';

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
        ${variantClasses[variant]}
        ${hoverClasses}
        ${interactiveClasses}
        ${isHovered ? 'ring-2 ring-blue-500/20' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
    >
      {children}
    </div>
  );
};
