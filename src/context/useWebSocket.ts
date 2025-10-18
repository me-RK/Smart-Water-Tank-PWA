import { useContext } from 'react';
import { WebSocketContext } from './WebSocketContextDefinition';
import type { WebSocketContextType } from './WebSocketContextDefinition';

// Custom hook to use WebSocket context
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
