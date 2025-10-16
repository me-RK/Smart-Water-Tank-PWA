import { createContext } from 'react';
import type { ToastContextType } from './ToastTypes';

/**
 * Toast Context for WhatsApp-Style Notifications
 */

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
