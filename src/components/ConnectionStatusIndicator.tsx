import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Activity
} from 'lucide-react';
import type { ConnectionStatus } from '../hooks/useConnectionHeartbeat';

interface ConnectionStatusIndicatorProps {
  connectionStatus: ConnectionStatus;
  onManualSync?: () => void;
  isManualSyncLoading?: boolean;
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  connectionStatus,
  onManualSync,
  isManualSyncLoading = false,
  className = '',
  showDetails = true,
  compact = false,
}) => {
  const {
    isChecking,
    lastSuccessfulSync,
    lastSyncAttempt,
    consecutiveFailures,
    connectionQuality,
    syncInterval,
  } = connectionStatus;

  // Format time ago
  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Get status color based on connection quality
  const getStatusColor = (): string => {
    switch (connectionQuality) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'poor':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'offline':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    }
    
    switch (connectionQuality) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good':
        return <Wifi className="w-4 h-4 text-blue-500" />;
      case 'poor':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get status text
  const getStatusText = (): string => {
    if (isChecking) return 'Checking...';
    
    switch (connectionQuality) {
      case 'excellent':
        return 'Connected';
      case 'good':
        return 'Connected';
      case 'poor':
        return 'Poor Connection';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  // Get sync interval text
  const getSyncIntervalText = (): string => {
    const seconds = Math.floor(syncInterval / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {onManualSync && (
          <button
            onClick={onManualSync}
            disabled={isManualSyncLoading || isChecking}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            title="Manual Sync"
          >
            <RefreshCw className={`w-3 h-3 ${isManualSyncLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Connection Status
          </h3>
        </div>
        {onManualSync && (
          <button
            onClick={onManualSync}
            disabled={isManualSyncLoading || isChecking}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3 h-3 ${isManualSyncLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        )}
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <Activity className="w-3 h-3 text-gray-400" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>

        {/* Sync Interval */}
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3 text-gray-400" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">Sync Interval</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {getSyncIntervalText()}
            </p>
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          {/* Last Sync */}
          <div className="mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-gray-400" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Successful Sync</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {formatTimeAgo(lastSuccessfulSync)}
                </p>
              </div>
            </div>
          </div>

          {/* Connection Quality Indicator */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Connection Quality</span>
              <span className={`text-xs font-medium ${getStatusColor()}`}>
                {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  connectionQuality === 'excellent' ? 'bg-green-500' :
                  connectionQuality === 'good' ? 'bg-blue-500' :
                  connectionQuality === 'poor' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{
                  width: connectionQuality === 'excellent' ? '100%' :
                         connectionQuality === 'good' ? '75%' :
                         connectionQuality === 'poor' ? '50%' : '0%'
                }}
              />
            </div>
          </div>

          {/* Failure Count */}
          {consecutiveFailures > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-red-800 dark:text-red-200">
                    Connection Issues
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    {consecutiveFailures} consecutive sync failures
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Last Attempt */}
          {lastSyncAttempt && !lastSuccessfulSync && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                    Last Attempt
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    {formatTimeAgo(lastSyncAttempt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
