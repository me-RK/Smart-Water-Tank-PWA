import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Material Design Snackbar Component
 * 
 * Features:
 * - Material Design snackbar styling
 * - Multiple variants (success, error, info, warning)
 * - Auto-dismiss functionality
 * - Action button support
 * - Accessibility support
 */
interface MaterialSnackbarProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  variant?: 'success' | 'error' | 'info' | 'warning';
  action?: {
    label: string;
    onClick: () => void;
  };
  autoHideDuration?: number;
  className?: string;
}

export const MaterialSnackbar: React.FC<MaterialSnackbarProps> = ({
  isOpen,
  onClose,
  message,
  variant = 'info',
  action,
  autoHideDuration = 4000,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      if (autoHideDuration > 0) {
        timeoutRef.current = setTimeout(() => {
          handleClose();
        }, autoHideDuration);
      }
    } else {
      setIsVisible(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, autoHideDuration, handleClose]);

  const handleActionClick = () => {
    if (action) {
      action.onClick();
      handleClose();
    }
  };

  const variantClasses = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    warning: 'bg-yellow-600 text-white'
  };

  const variantIcons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`
        android-snackbar
        ${variantClasses[variant]}
        ${isVisible ? 'show' : ''}
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        {variantIcons[variant]}
        <span className="flex-1 text-sm font-medium">{message}</span>
        
        {action && (
          <button
            onClick={handleActionClick}
            className="text-sm font-semibold underline hover:no-underline focus:outline-none focus:underline"
          >
            {action.label}
          </button>
        )}
        
        <button
          onClick={handleClose}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
};
