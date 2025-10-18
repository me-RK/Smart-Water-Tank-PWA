import { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

export interface ConnectionStatus {
  isConnected: boolean;
  isChecking: boolean;
  lastSuccessfulSync: Date | null;
  lastSyncAttempt: Date | null;
  consecutiveFailures: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  syncInterval: number; // in milliseconds
}

export interface HeartbeatConfig {
  syncInterval: number; // Default sync interval in milliseconds
  timeoutDuration: number; // Request timeout in milliseconds
  maxConsecutiveFailures: number; // Max failures before marking as offline
  exponentialBackoffBase: number; // Base delay for exponential backoff
  maxBackoffDelay: number; // Maximum backoff delay
  backgroundSyncInterval: number; // Slower sync when app is backgrounded
}

const DEFAULT_CONFIG: HeartbeatConfig = {
  syncInterval: 30000, // 30 seconds
  timeoutDuration: 15000, // 15 seconds
  maxConsecutiveFailures: 3, // 3 failed attempts = offline
  exponentialBackoffBase: 2000, // 2 seconds
  maxBackoffDelay: 30000, // 30 seconds max
  backgroundSyncInterval: 60000, // 1 minute when backgrounded
};

export const useConnectionHeartbeat = (
  sendMessage: (message: any) => void,
  isWebSocketConnected: boolean,
  config: Partial<HeartbeatConfig> = {}
) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isChecking: false,
    lastSuccessfulSync: null,
    lastSyncAttempt: null,
    consecutiveFailures: 0,
    connectionQuality: 'offline',
    syncInterval: mergedConfig.syncInterval,
  });

  const [isAppBackgrounded, setIsAppBackgrounded] = useState(false);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backoffTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataReceivedRef = useRef<Date | null>(null);

  // Track when we receive data to determine connection quality
  const updateLastDataReceived = useCallback(() => {
    lastDataReceivedRef.current = new Date();
    setConnectionStatus(prev => ({
      ...prev,
      lastSuccessfulSync: new Date(),
      consecutiveFailures: 0,
      connectionQuality: 'excellent',
    }));
  }, []);

  // Calculate connection quality based on response times and failures
  const calculateConnectionQuality = useCallback((responseTime: number, failures: number): ConnectionStatus['connectionQuality'] => {
    if (failures >= mergedConfig.maxConsecutiveFailures) {
      return 'offline';
    }
    if (responseTime < 2000) return 'excellent';
    if (responseTime < 5000) return 'good';
    return 'poor';
  }, [mergedConfig.maxConsecutiveFailures]);

  // Perform a single sync attempt with timeout
  const performSyncAttempt = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      setConnectionStatus(prev => ({
        ...prev,
        isChecking: true,
        lastSyncAttempt: new Date(),
      }));

      // Set up timeout
      timeoutRef.current = setTimeout(() => {
        const responseTime = Date.now() - startTime;
        setConnectionStatus(prev => ({
          ...prev,
          isChecking: false,
          consecutiveFailures: prev.consecutiveFailures + 1,
          connectionQuality: calculateConnectionQuality(responseTime, prev.consecutiveFailures + 1),
        }));
        resolve(false);
      }, mergedConfig.timeoutDuration);

      // Send sync request
      try {
        sendMessage({ type: 'getAllData' });
        
        // We'll resolve this when we receive a response
        // The timeout will handle the failure case
        const checkForResponse = () => {
          if (lastDataReceivedRef.current && lastDataReceivedRef.current.getTime() > startTime) {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            const responseTime = Date.now() - startTime;
            setConnectionStatus(prev => ({
              ...prev,
              isChecking: false,
              consecutiveFailures: 0,
              connectionQuality: calculateConnectionQuality(responseTime, 0),
            }));
            resolve(true);
          } else {
            setTimeout(checkForResponse, 100);
          }
        };
        checkForResponse();
      } catch (error) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setConnectionStatus(prev => ({
          ...prev,
          isChecking: false,
          consecutiveFailures: prev.consecutiveFailures + 1,
          connectionQuality: 'offline',
        }));
        resolve(false);
      }
    });
  }, [sendMessage, mergedConfig.timeoutDuration, calculateConnectionQuality]);

  // Start the heartbeat mechanism
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    if (!isWebSocketConnected) {
      return;
    }

    const interval = isAppBackgrounded ? mergedConfig.backgroundSyncInterval : mergedConfig.syncInterval;
    
    heartbeatIntervalRef.current = setInterval(async () => {
      const success = await performSyncAttempt();
      
      if (!success) {
        // Implement exponential backoff for failed attempts
        const failures = connectionStatus.consecutiveFailures + 1;
        if (failures < mergedConfig.maxConsecutiveFailures) {
          const backoffDelay = Math.min(
            mergedConfig.exponentialBackoffBase * Math.pow(2, failures - 1),
            mergedConfig.maxBackoffDelay
          );
          
          backoffTimeoutRef.current = setTimeout(() => {
            performSyncAttempt();
          }, backoffDelay);
        }
      }
    }, interval);

    setConnectionStatus(prev => ({
      ...prev,
      syncInterval: interval,
    }));
  }, [isWebSocketConnected, isAppBackgrounded, mergedConfig, performSyncAttempt, connectionStatus.consecutiveFailures]);

  // Stop the heartbeat mechanism
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (backoffTimeoutRef.current) {
      clearTimeout(backoffTimeoutRef.current);
      backoffTimeoutRef.current = null;
    }
  }, []);

  // Manual sync attempt
  const manualSync = useCallback(async (): Promise<boolean> => {
    return await performSyncAttempt();
  }, [performSyncAttempt]);

  // Update connection status based on WebSocket state
  useEffect(() => {
    if (isWebSocketConnected) {
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: true,
        connectionQuality: prev.connectionQuality === 'offline' ? 'poor' : prev.connectionQuality,
      }));
      startHeartbeat();
    } else {
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        isChecking: false,
        connectionQuality: 'offline',
        consecutiveFailures: mergedConfig.maxConsecutiveFailures,
      }));
      stopHeartbeat();
    }
  }, [isWebSocketConnected, startHeartbeat, stopHeartbeat, mergedConfig.maxConsecutiveFailures]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Note: App state listener would be implemented here for native apps
    // const handleAppStateChange = (state: AppState) => {
    //   const isBackgrounded = state.isActive === false;
    //   setIsAppBackgrounded(isBackgrounded);
    //   
    //   if (isBackgrounded) {
    //     // Slow down sync when backgrounded
    //     stopHeartbeat();
    //     if (isWebSocketConnected) {
    //       startHeartbeat();
    //     }
    //   } else {
    //     // Resume normal sync when foregrounded
    //     stopHeartbeat();
    //     if (isWebSocketConnected) {
    //       startHeartbeat();
    //     }
    //   }
    // };

    // Note: App state listener would be implemented here
    // For now, we'll use a simple approach
    const handleVisibilityChange = () => {
      const isBackgrounded = document.hidden;
      setIsAppBackgrounded(isBackgrounded);
      
      if (isBackgrounded) {
        stopHeartbeat();
        if (isWebSocketConnected) {
          startHeartbeat();
        }
      } else {
        stopHeartbeat();
        if (isWebSocketConnected) {
          startHeartbeat();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isWebSocketConnected, startHeartbeat, stopHeartbeat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

  return {
    connectionStatus,
    startHeartbeat,
    stopHeartbeat,
    manualSync,
    updateLastDataReceived,
  };
};
