import { createContext } from 'react';
import type { AppState, WebSocketMessage } from '../types';
import type { ConnectionStatus } from '../hooks/useConnectionHeartbeat';

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
  // Enhanced connection management
  connectionStatus: ConnectionStatus;
  manualSync: () => Promise<boolean>;
  startHeartbeat: () => void;
  stopHeartbeat: () => void;
}

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);
