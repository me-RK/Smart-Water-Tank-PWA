import React, { useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { ToastContext } from './ToastContext';
import type { Toast, ToastContextType, ToastProviderProps } from './ToastTypes';

/**
 * WhatsApp-Style Toast Notification System
 * 
 * Features:
 * - WhatsApp-inspired design with smooth animations
 * - Multiple toast types (success, error, warning, info)
 * - Auto-dismiss functionality
 * - Haptic feedback for native feel
 * - Queue management for multiple toasts
 * - Dark mode support
 */


/**
 * Individual Toast Component
 */
interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose(toast.id), 300);
  }, [toast.id, onClose]);

  // Auto-dismiss after duration
  React.useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(handleClose, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, handleClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getToastClass = () => {
    const baseClass = 'wa-toast';
    switch (toast.type) {
      case 'success':
        return `${baseClass} success`;
      case 'error':
        return `${baseClass} error`;
      case 'warning':
        return `${baseClass} warning`;
      case 'info':
      default:
        return baseClass;
    }
  };

  return (
    <div
      className={`${getToastClass()} ${isVisible ? 'animate-wa-slide-down' : 'animate-wa-slide-up'}`}
      style={{
        animation: isVisible ? 'wa-slide-down 0.3s ease-out' : 'wa-slide-up 0.3s ease-out',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <div className="font-medium text-sm mb-0.5">
              {toast.title}
            </div>
          )}
          <div className="text-sm opacity-90">
            {toast.message}
          </div>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-1 text-xs font-medium underline hover:no-underline opacity-80 hover:opacity-100"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors opacity-60 hover:opacity-100"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/**
 * Toast Container Component
 */
interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

/**
 * Toast Provider Component
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(async (toastData: Omit<Toast, 'id'>) => {
    // Add haptic feedback for native feel
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {
        console.log('Haptics not available');
      }
    }

    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 3000,
      ...toastData,
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
