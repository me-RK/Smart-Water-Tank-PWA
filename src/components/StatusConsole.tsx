import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../context/useWebSocket';
import { MaterialCard } from './MaterialCard';
import { 
  Terminal, 
  Wifi, 
  WifiOff, 
  Clock, 
  Activity,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

/**
 * StatusConsole Component
 * 
 * Features:
 * - Real-time device status text display
 * - Auto-scroll to latest messages
 * - Timestamp for each status update
 * - Color coding for different message types
 * - Monospace font for console-like appearance
 * - WebSocket integration for live updates
 */

interface StatusMessage {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  source: 'device' | 'system' | 'user';
}

export const StatusConsole: React.FC = () => {
  const { appState, sendMessage, isConnected } = useWebSocket();
  const [messages, setMessages] = useState<StatusMessage[]>([]);
  const [isRequestingStatus, setIsRequestingStatus] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  /**
   * Generate a unique message ID
   */
  const generateMessageId = () => {
    return `msg_${Date.now()}_${++messageIdRef.current}`;
  };

  /**
   * Add a new message to the console
   */
  const addMessage = (message: string, type: StatusMessage['type'] = 'info', source: StatusMessage['source'] = 'system') => {
    const newMessage: StatusMessage = {
      id: generateMessageId(),
      timestamp: new Date(),
      message,
      type,
      source
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Keep only last 50 messages to prevent memory issues
      return updated.slice(-50);
    });
  };

  /**
   * Request system status text from device
   */
  const requestSystemStatus = () => {
    if (!isConnected || isRequestingStatus) return;

    setIsRequestingStatus(true);
    
    // Send WebSocket command to get system status text
    sendMessage({
      type: 'getSystemStatusText'
    });

    // Reset requesting state after timeout
    setTimeout(() => {
      setIsRequestingStatus(false);
    }, 5000);
  };

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [messages]);

  /**
   * Auto-request system status text at sync interval
   */
  useEffect(() => {
    if (!isConnected) {
      addMessage('Device disconnected', 'error', 'system');
      return;
    }

    // Connection established
    addMessage('Device connected', 'success', 'system');

    // Get sync interval from settings
    const getSyncInterval = () => {
      const saved = localStorage.getItem('dashboardSyncInterval');
      return saved ? parseInt(saved, 10) : 5000; // Default 5 seconds
    };

    // Set up interval to request status text
    const interval = getSyncInterval();
    if (interval > 0) {
      const statusInterval = setInterval(() => {
        if (isConnected) {
          sendMessage({
            type: 'getSystemStatusText'
          });
        }
      }, interval);

      return () => {
        clearInterval(statusInterval);
      };
    }
  }, [isConnected, sendMessage]);

  /**
   * Display system status text when received from device
   */
  useEffect(() => {
    if (appState.systemStatusText) {
      addMessage(appState.systemStatusText, 'info', 'device');
    }
  }, [appState.systemStatusText, addMessage]);

  /**
   * Get message type icon
   */
  const getMessageIcon = (type: StatusMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'system':
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  /**
   * Get message type color
   */
  const getMessageColor = (type: StatusMessage['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'system':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <MaterialCard elevation={2} className="animate-wa-slide-up">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Terminal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                Device Status Console
              </h3>
              <p className="text-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                Real-time system messages
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Connection Status */}
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            
            {/* Request Status Button */}
            <button
              onClick={requestSystemStatus}
              disabled={!isConnected || isRequestingStatus}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
            >
              {isRequestingStatus ? 'Requesting...' : 'Get Status'}
            </button>
          </div>
        </div>

        {/* Console Display */}
        <div 
          ref={consoleRef}
          className="bg-gray-900 text-green-400 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm border border-gray-700"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Terminal className="w-8 h-8 mx-auto mb-2" />
                <p>Waiting for device status...</p>
                <p className="text-xs mt-1">Click "Get Status" to request current status</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2 py-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {getMessageIcon(msg.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-500 text-xs">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                      <span className="text-gray-600 text-xs">
                        [{msg.source.toUpperCase()}]
                      </span>
                    </div>
                    <p className={`${getMessageColor(msg.type)} break-words`}>
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Auto-updating every 30s</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Messages: {messages.length}</span>
            <button
              onClick={() => setMessages([])}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </MaterialCard>
  );
};
