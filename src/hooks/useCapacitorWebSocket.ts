import { useEffect, useRef, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

interface UseCapacitorWebSocketProps {
  url: string;
  onMessage: (data: unknown) => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
}

export const useCapacitorWebSocket = ({
  url,
  onMessage,
  onError,
  autoReconnect = true,
}: UseCapacitorWebSocketProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    console.log(`Running on ${platform}, Native: ${isNative}`);
  }, [platform, isNative]);

  const connect = useCallback(() => {
    try {
      // Ensure proper WebSocket URL
      const wsUrl = url.startsWith('ws://') || url.startsWith('wss://') 
        ? url 
        : `ws://${url}`;

      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        
        if (autoReconnect && reconnectAttempts.current < 10) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Reconnecting in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [url, onMessage, onError, autoReconnect]);

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const sendMessage = (data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [url, connect]);

  return {
    isConnected,
    sendMessage,
    reconnect: connect,
    disconnect,
    isNative,
    platform,
  };
};
