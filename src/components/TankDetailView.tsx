import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/useWebSocket';
import { useToast } from './useToast';
import { PullToRefresh } from './PullToRefresh';
import { 
  ArrowLeft, 
  Droplets, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Settings
} from 'lucide-react';

/**
 * WhatsApp-Style Tank Detail View Component
 * 
 * Features:
 * - Chat-style interface for tank details
 * - Message bubble data display
 * - Real-time updates with animations
 * - WhatsApp-style action bar
 * - Tank visualization with progress
 * - Historical data in message format
 * - Haptic feedback for interactions
 */

interface TankDetailViewProps {
  tankName: string;
  tankType: 'upper' | 'lower';
  onBack: () => void;
}

interface TankMessage {
  id: string;
  type: 'system' | 'data' | 'alert' | 'status';
  timestamp: Date;
  content: string;
  level?: number;
  status?: 'good' | 'warning' | 'critical';
}

export const TankDetailView: React.FC<TankDetailViewProps> = ({
  tankName,
  tankType,
  onBack,
}) => {
  const { appState, sendMessage } = useWebSocket();
  const toast = useToast();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<TankMessage[]>([]);
  const [, setIsRefreshing] = useState(false);

  // Get current tank data
  const getCurrentTankData = () => {
    const tankData = appState.tankData[tankName.toLowerCase() as 'tankA' | 'tankB'];
    return tankData[tankType];
  };

  const currentLevel = getCurrentTankData();

  /**
   * Generate tank messages based on current data
   */
  const generateMessages = useCallback((): TankMessage[] => {
    const tankMessages: TankMessage[] = [];
    const now = new Date();

    // System status message
    tankMessages.push({
      id: 'system-1',
      type: 'system',
      timestamp: new Date(now.getTime() - 300000), // 5 minutes ago
      content: `Tank ${tankName} ${tankType} monitoring started`,
    });

    // Current level message
    const levelStatus = currentLevel >= 80 ? 'good' : 
                       currentLevel >= 50 ? 'warning' : 
                       currentLevel >= 20 ? 'warning' : 'critical';
    
    tankMessages.push({
      id: 'data-1',
      type: 'data',
      timestamp: new Date(now.getTime() - 120000), // 2 minutes ago
      content: `Current level: ${currentLevel}%`,
      level: currentLevel,
      status: levelStatus,
    });

    // Status message
    if (levelStatus === 'critical') {
      tankMessages.push({
        id: 'alert-1',
        type: 'alert',
        timestamp: new Date(now.getTime() - 60000), // 1 minute ago
        content: `⚠️ Tank level is critically low! Consider refilling.`,
      });
    } else if (levelStatus === 'warning') {
      tankMessages.push({
        id: 'alert-2',
        type: 'alert',
        timestamp: new Date(now.getTime() - 60000),
        content: `⚠️ Tank level is getting low. Monitor closely.`,
      });
    } else {
      tankMessages.push({
        id: 'status-1',
        type: 'status',
        timestamp: new Date(now.getTime() - 60000),
        content: `✅ Tank level is healthy`,
      });
    }

    // Historical data (simulated)
    const historicalLevels = [85, 82, 78, 75, 70, 65, 60, 55, 50, 45];
    historicalLevels.forEach((level, index) => {
      const timestamp = new Date(now.getTime() - (index + 1) * 300000); // Every 5 minutes
      const status = level >= 80 ? 'good' : level >= 50 ? 'warning' : 'critical';
      
      tankMessages.push({
        id: `data-${index + 2}`,
        type: 'data',
        timestamp,
        content: `Level reading: ${level}%`,
        level,
        status,
      });
    });

    return tankMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [currentLevel, tankName, tankType]);

  useEffect(() => {
    setMessages(generateMessages());
  }, [currentLevel, tankName, tankType, generateMessages]);

  /**
   * Handle pull-to-refresh
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Send data request
      sendMessage({ type: 'getAllData' });
      
      // Update messages
      setMessages(generateMessages());
      
      toast.showToast({
        type: 'success',
        message: 'Tank data refreshed',
      });
    } catch {
      toast.showToast({
        type: 'error',
        message: 'Failed to refresh data',
      });
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  /**
   * Get message bubble class based on type
   */
  const getMessageBubbleClass = (message: TankMessage) => {
    const baseClass = 'wa-message-bubble';
    
    switch (message.type) {
      case 'system':
        return `${baseClass} received`;
      case 'data':
        return `${baseClass} sent`;
      case 'alert':
        return `${baseClass} received`;
      case 'status':
        return `${baseClass} sent`;
      default:
        return `${baseClass} received`;
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  /**
   * Get tank avatar
   */
  const getTankAvatar = () => {
    const initials = tankName.charAt(0) + tankType.charAt(0).toUpperCase();
    return initials;
  };

  /**
   * Get level trend
   */
  const getLevelTrend = () => {
    if (messages.length < 2) return null;
    
    const current = messages.find(m => m.type === 'data' && m.level === currentLevel);
    const previous = messages.find(m => m.type === 'data' && m.level !== currentLevel);
    
    if (!current || !previous || !current.level || !previous.level) return null;
    
    const trend = current.level - previous.level;
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-wa-light-bg dark:bg-wa-dark-bg">
      {/* WhatsApp-Style Header */}
      <header className="wa-header">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="wa-header-button"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <div className="wa-avatar">
              {getTankAvatar()}
            </div>
            <div className={`wa-status-dot ${currentLevel > 20 ? 'online' : 'offline'}`} />
          </div>
          
          <div>
            <h1 className="wa-header-title">
              Tank {tankName} - {tankType.charAt(0).toUpperCase() + tankType.slice(1)}
            </h1>
            <p className="text-sm opacity-90">
              {currentLevel}% • {formatTimestamp(new Date())}
            </p>
          </div>
        </div>

        <div className="wa-header-actions">
          <button
            onClick={() => navigate('/settings')}
            className="wa-header-button"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tank Visualization */}
      <div className="px-4 py-4 bg-wa-light-panel dark:bg-wa-dark-panel border-b border-wa-light-border dark:border-wa-dark-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-6 h-6 text-wa-teal-500" />
            <span className="text-wa-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
              Current Level
            </span>
            {getLevelTrend()}
          </div>
          <div className="text-right">
            <div className="text-wa-2xl font-bold text-wa-light-text dark:text-wa-dark-text">
              {currentLevel}%
            </div>
            <div className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
              {currentLevel >= 80 ? 'Excellent' :
               currentLevel >= 50 ? 'Good' :
               currentLevel >= 20 ? 'Low' : 'Critical'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-wa-light-border dark:bg-wa-dark-border rounded-full h-4 mb-2">
          <div
            className={`h-4 rounded-full transition-all duration-1000 ${
              currentLevel >= 80 ? 'bg-green-500' :
              currentLevel >= 50 ? 'bg-yellow-500' :
              currentLevel >= 20 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${currentLevel}%` }}
          />
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-wa-sm">
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-wa-light-text-muted dark:text-wa-dark-text-muted" />
            <span className="text-wa-light-text-muted dark:text-wa-dark-text-muted">
              Monitoring Active
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-wa-light-text-muted dark:text-wa-dark-text-muted" />
            <span className="text-wa-light-text-muted dark:text-wa-dark-text-muted">
              Last updated: {formatTimestamp(new Date())}
            </span>
          </div>
        </div>
      </div>

      {/* Chat-Style Messages */}
      <PullToRefresh onRefresh={handleRefresh} className="flex-1 page-scrollable">
        <div className="page-content">
        <div className="px-4 py-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="animate-wa-slide-up">
              <div className={getMessageBubbleClass(message)}>
                <div className="flex items-start gap-2">
                  {message.type === 'data' && getStatusIcon(message.status)}
                  <div className="flex-1">
                    <div className="text-wa-sm font-medium mb-1">
                      {message.content}
                    </div>
                    {message.level && (
                      <div className="text-wa-xs opacity-75">
                        Level: {message.level}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-wa-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1 ml-2">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          ))}

          {/* Empty state if no messages */}
          {messages.length === 0 && (
            <div className="wa-empty-state">
              <Droplets className="wa-empty-state-icon" />
              <h3 className="wa-empty-state-title">No Data Available</h3>
              <p className="wa-empty-state-description">
                Pull down to refresh and load tank data
              </p>
            </div>
          )}
        </div>
        </div>
      </PullToRefresh>

      {/* Floating Action Button for Quick Actions */}
      <button
        onClick={handleRefresh}
        className="wa-fab"
        title="Refresh Data"
      >
        <Zap className="w-6 h-6" />
      </button>
    </div>
  );
};

export default TankDetailView;
