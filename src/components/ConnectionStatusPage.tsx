import React, { useState, useCallback } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Settings, 
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useWebSocket } from '../context/useWebSocket';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { MaterialCard } from './MaterialCard';
import { MaterialButton } from './MaterialButton';

/**
 * Connection Status Page Component
 * 
 * Provides detailed connection status information including:
 * - Real-time connection quality indicators
 * - Sync history and statistics
 * - Manual sync controls
 * - Connection troubleshooting
 * - Network diagnostics
 */
export const ConnectionStatusPage: React.FC = () => {
  const { 
    connectionStatus, 
    manualSync, 
    isConnected, 
    deviceIP, 
    isReconnecting,
    lastError 
  } = useWebSocket();
  
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncHistory, setSyncHistory] = useState<Array<{
    timestamp: Date;
    success: boolean;
    responseTime: number;
  }>>([]);

  // Handle manual sync with history tracking
  const handleManualSync = useCallback(async () => {
    setIsManualSyncing(true);
    const startTime = Date.now();
    
    try {
      const success = await manualSync();
      const responseTime = Date.now() - startTime;
      
      // Add to sync history
      setSyncHistory(prev => [
        { timestamp: new Date(), success, responseTime },
        ...prev.slice(0, 9) // Keep only last 10 entries
      ]);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setSyncHistory(prev => [
        { timestamp: new Date(), success: false, responseTime },
        ...prev.slice(0, 9)
      ]);
    } finally {
      setIsManualSyncing(false);
    }
  }, [manualSync]);

  // Get connection quality color
  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'poor': return 'text-yellow-600 dark:text-yellow-400';
      case 'offline': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get connection quality icon
  const getConnectionQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'good': return <Activity className="w-5 h-5 text-blue-500" />;
      case 'poor': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'offline': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <WifiOff className="w-5 h-5 text-gray-500" />;
    }
  };

  // Format response time
  const formatResponseTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <Wifi className="w-6 h-6 text-green-500" />
          ) : (
            <WifiOff className="w-6 h-6 text-red-500" />
          )}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Connection Status
          </h1>
        </div>
        <MaterialButton
          onClick={handleManualSync}
          disabled={isManualSyncing || connectionStatus.isChecking}
          variant="outlined"
          size="small"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isManualSyncing ? 'animate-spin' : ''}`} />
          <span>Sync Now</span>
        </MaterialButton>
      </div>

      {/* Main Connection Status */}
      <MaterialCard elevation={2}>
        <ConnectionStatusIndicator
          connectionStatus={connectionStatus}
          onManualSync={handleManualSync}
          isManualSyncLoading={isManualSyncing}
          showDetails={true}
        />
      </MaterialCard>

      {/* Connection Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Information */}
        <MaterialCard elevation={1}>
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Device Information
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Device IP</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {deviceIP || 'Not connected'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Connection State</span>
              <div className="flex items-center space-x-2">
                {isReconnecting && <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />}
                <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isReconnecting ? 'Reconnecting...' : isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sync Interval</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {Math.floor(connectionStatus.syncInterval / 1000)}s
              </span>
            </div>
            
            {lastError && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Last Error</p>
                    <p className="text-xs text-red-700 dark:text-red-300">{lastError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </MaterialCard>

        {/* Connection Quality */}
        <MaterialCard elevation={1}>
          <div className="flex items-center space-x-2 mb-4">
            {getConnectionQualityIcon(connectionStatus.connectionQuality)}
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Connection Quality
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Overall Quality</span>
                <span className={`text-sm font-medium ${getConnectionQualityColor(connectionStatus.connectionQuality)}`}>
                  {connectionStatus.connectionQuality.charAt(0).toUpperCase() + connectionStatus.connectionQuality.slice(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    connectionStatus.connectionQuality === 'excellent' ? 'bg-green-500' :
                    connectionStatus.connectionQuality === 'good' ? 'bg-blue-500' :
                    connectionStatus.connectionQuality === 'poor' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{
                    width: connectionStatus.connectionQuality === 'excellent' ? '100%' :
                           connectionStatus.connectionQuality === 'good' ? '75%' :
                           connectionStatus.connectionQuality === 'poor' ? '50%' : '0%'
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Consecutive Failures</span>
              <span className={`text-sm font-medium ${connectionStatus.consecutiveFailures > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {connectionStatus.consecutiveFailures}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Successful Sync</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {connectionStatus.lastSuccessfulSync 
                  ? connectionStatus.lastSuccessfulSync.toLocaleTimeString()
                  : 'Never'
                }
              </span>
            </div>
          </div>
        </MaterialCard>
      </div>

      {/* Sync History */}
      {syncHistory.length > 0 && (
        <MaterialCard elevation={1}>
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Recent Sync History
            </h3>
          </div>
          
          <div className="space-y-2">
            {syncHistory.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                <div className="flex items-center space-x-3">
                  {entry.success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm font-medium ${entry.success ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.success ? 'Success' : 'Failed'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatResponseTime(entry.responseTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </MaterialCard>
      )}

      {/* Troubleshooting Tips */}
      {connectionStatus.connectionQuality === 'offline' && (
        <MaterialCard elevation={1}>
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Troubleshooting Tips
            </h3>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Check if your ESP32 device is powered on and connected to the network</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Verify that your phone/device is connected to the same WiFi network</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Try restarting the ESP32 device if the connection persists</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>Check the device IP address in the Devices page</span>
            </div>
          </div>
        </MaterialCard>
      )}
    </div>
  );
};
