import { createContext } from 'react';
import type { AppState, WebSocketMessage } from '../types';

export interface WebSocketContextType {
  appState: AppState;
  sendMessage: (message: WebSocketMessage) => void;
  connect: (host: string) => void;
  disconnect: () => void;
  isConnected: boolean;
  error: string | null;
  isReconnecting: boolean;
  lastError: string | null;
  deviceIP: string | null;
  setDeviceIP: (ip: string) => void;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);
