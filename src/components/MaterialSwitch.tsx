import React, { useState } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Material Design Switch Component
 * 
 * Features:
 * - Material Design switch styling
 * - Haptic feedback on Android
 * - Proper touch targets
 * - Accessibility support
 * - Smooth animations
 */
interface MaterialSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const MaterialSwitch: React.FC<MaterialSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  className = '',
  size = 'medium'
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleToggle = async () => {
    if (disabled) return;

    // Haptic feedback for Android
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }

    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  const sizeClasses = {
    small: {
      switch: 'w-8 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-3'
    },
    medium: {
      switch: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    large: {
      switch: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-1">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      
      <button
        type="button"
        className={`
          ${currentSize.switch}
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${checked 
            ? 'bg-blue-600' 
            : 'bg-gray-200 dark:bg-gray-700'
          }
          ${isPressed ? 'scale-95' : 'scale-100'}
        `}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className={`
            ${currentSize.thumb}
            inline-block transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
            ${checked ? currentSize.translate : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
};
