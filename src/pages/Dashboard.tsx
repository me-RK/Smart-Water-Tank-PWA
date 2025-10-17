import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/useWebSocket';
import { usePageData } from '../hooks/usePageData';
import { StatusCard } from '../components/StatusCard';
import { MaterialButton } from '../components/MaterialButton';
import { MaterialCard } from '../components/MaterialCard';
import { MaterialBottomSheet } from '../components/MaterialBottomSheet';
import { MaterialSnackbar } from '../components/MaterialSnackbar';
import { BottomNavigation } from '../components/BottomNavigation';
import { PullToRefresh } from '../components/PullToRefresh';
import { useToast } from '../components/useToast';
import { Settings, Wifi, RefreshCw, Droplets, Activity, Zap } from 'lucide-react';

/**
 * WhatsApp-Style Dashboard Component
 * 
 * Features:
 * - WhatsApp-inspired header with teal background
 * - Chat-list style tank cards with avatars
 * - Pull-to-refresh functionality
 * - Toast notifications for user feedback
 * - Bottom navigation integration
 * - Smooth animations and transitions
 * - Haptic feedback for interactions
 */

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { appState, sendMessage, isConnected } = useWebSocket();
  const { startDashboardSync, stopDashboardSync } = usePageData();
  const toast = useToast();

  // Debug logging for tank data and sensor states
  useEffect(() => {
    console.log('Dashboard - Tank Data:', appState.tankData);
    console.log('Dashboard - Sensor States:', appState.systemSettings.sensors);
    console.log('Dashboard - System Status:', appState.systemStatus);
  }, [appState.tankData, appState.systemSettings.sensors, appState.systemStatus]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    isOpen: boolean;
    message: string;
    variant: 'success' | 'error' | 'info' | 'warning';
  }>({ isOpen: false, message: '', variant: 'info' });
  
  // Auto-sync functionality
  const [syncInterval, setSyncInterval] = useState<number>(() => {
    const saved = localStorage.getItem('dashboardSyncInterval');
    return saved ? parseInt(saved, 10) : 5000; // Default 5 seconds
  });

  /**
   * Handles manual data synchronization with ESP32
   */
  const handleSyncData = useCallback(async () => {
    if (!isConnected) {
      toast.showToast({
        type: 'warning',
        message: 'Not connected to device',
      });
      return;
    }
    
    setIsRefreshing(true);
    
    try {
      // Send unified data request
    sendMessage({
      type: 'getAllData'
    });

      toast.showToast({
        type: 'success',
        message: 'Data synced successfully',
      });
    } catch {
      toast.showToast({
        type: 'error',
        message: 'Failed to sync data',
      });
    } finally {
    // Simulate refresh delay for better UX
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
    }
  }, [isConnected, sendMessage, toast]);

  /**
   * Handle pull-to-refresh
   */
  const handlePullToRefresh = useCallback(async () => {
    await handleSyncData();
  }, [handleSyncData]);

  /**
   * Updates the auto-sync interval and persists to localStorage
   */
  const updateSyncInterval = useCallback((newInterval: number) => {
    setSyncInterval(newInterval);
    localStorage.setItem('dashboardSyncInterval', newInterval.toString());
    
    // Restart auto-sync with new interval
    if (isConnected) {
      startDashboardSync();
    }
  }, [isConnected, startDashboardSync]);


  // Effect to manage auto-sync based on connection status
  useEffect(() => {
    if (!isConnected) {
      stopDashboardSync();
    }

    return () => {
      stopDashboardSync();
    };
  }, [isConnected, stopDashboardSync]);

  // Listen for sync interval changes from Settings page
  useEffect(() => {
    const handleSyncIntervalChange = (event: CustomEvent) => {
      const newInterval = event.detail.interval;
      updateSyncInterval(newInterval);
    };

    window.addEventListener('syncIntervalChanged', handleSyncIntervalChange as EventListener);
    
    return () => {
      window.removeEventListener('syncIntervalChanged', handleSyncIntervalChange as EventListener);
    };
  }, [updateSyncInterval]);


  /**
   * Handles motor toggle for manual control mode
   */
  const handleMotorToggle = (motorNumber: 1 | 2) => {
    const currentMotorState = motorNumber === 1 ? appState.systemStatus.motor1Status : appState.systemStatus.motor2Status;
    const isMotorCurrentlyOn = currentMotorState === 'ON';
    const newMotorState = !isMotorCurrentlyOn;
    
    sendMessage({
      type: newMotorState ? `motor${motorNumber}On` : `motor${motorNumber}Off`
    });

    toast.showToast({
      type: 'success',
      message: `Motor ${motorNumber} ${newMotorState ? 'started' : 'stopped'}`,
    });
  };

  /**
   * Get tank avatar based on tank name and type
   */
  const getTankAvatar = (tankName: string, tankType: string) => {
    const initials = tankName.charAt(0) + tankType.charAt(0).toUpperCase();
    return initials;
  };

  /**
   * Get tank status color
   */
  const getTankStatusColor = (level: number) => {
    if (level >= 80) return 'text-green-500';
    if (level >= 50) return 'text-yellow-500';
    if (level >= 20) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-wa-light-bg dark:bg-wa-dark-bg">
      {/* WhatsApp-Style Header */}
      <header className="wa-header">
        <div className="flex items-center gap-3">
          <div className="wa-avatar">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h1 className="wa-header-title">Smart Water Tank</h1>
            <p className="text-sm opacity-90">
              {isConnected ? 'Connected' : 'Disconnected'} • by EmptyIdea
            </p>
              </div>
            </div>

        <div className="wa-header-actions">
          {/* Devices Button */}
              <button
            onClick={() => navigate('/devices')}
            className="wa-header-button"
            title="Device Management"
          >
            <Wifi className="w-5 h-5" />
              </button>

              {/* Settings Button */}
              <button
                onClick={() => navigate('/settings')}
            className="wa-header-button"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
              </button>
        </div>
      </header>

      {/* Main Content with Pull-to-Refresh */}
      <PullToRefresh onRefresh={handlePullToRefresh} className="pb-20">
        <main className="container-responsive fluid-padding">
          {/* System Status Card */}
          <div className="fluid-margin">
            <MaterialCard elevation={2} className="animate-wa-slide-up">
            <StatusCard
              connected={appState.systemStatus.connected}
              lastUpdated={appState.systemStatus.lastUpdated}
              runtime={appState.systemStatus.runtime}
              motorStatus={appState.systemStatus.motorStatus === 'ON' ? 'ON' : 'OFF'}
              motor1Status={appState.systemStatus.motor1Status}
              motor2Status={appState.systemStatus.motor2Status}
              motor1Enabled={appState.systemStatus.motor1Enabled}
              motor2Enabled={appState.systemStatus.motor2Enabled}
              motorConfig={appState.systemStatus.motorConfig}
              mode={appState.systemStatus.mode === 'Auto Mode' ? 'auto' : 'manual'}
              autoModeReasons={appState.systemStatus.autoModeReasons ? [appState.systemStatus.autoModeReasons] : []}
              autoModeReasonMotor1={appState.systemStatus.autoModeReasonMotor1}
              autoModeReasonMotor2={appState.systemStatus.autoModeReasonMotor2}
            />
          </MaterialCard>
          </div>

          {/* Tank Monitoring Section */}
          <div className="fluid-margin">
            <div className="flex items-center justify-between fluid-margin">
              <h2 className="text-responsive-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                Tank Monitoring
              </h2>
              <div className="flex items-center gap-2">
                  <select
                    value={syncInterval}
                    onChange={(e) => updateSyncInterval(parseInt(e.target.value, 10))}
                  className="text-wa-sm bg-wa-light-panel dark:bg-wa-dark-panel border border-wa-light-border dark:border-wa-dark-border rounded-wa px-2 py-1"
                  >
                    <option value={0}>Off</option>
                    <option value={2000}>2s</option>
                    <option value={5000}>5s</option>
                    <option value={10000}>10s</option>
                    <option value={30000}>30s</option>
                    <option value={60000}>1m</option>
                  </select>
                <button
                  onClick={handleSyncData}
                  disabled={!isConnected || isRefreshing}
                  className="wa-header-button"
                  title="Sync Now"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          
            {/* Tank Cards - WhatsApp Chat Style */}
            <div className="fluid-gap-sm">
              {/* Tank A Upper */}
              {appState.systemSettings.sensors.upperTankA && (
                <div className="wa-chat-item animate-wa-slide-up">
                  <div className="relative">
                    <div className="wa-avatar">
                      {getTankAvatar('A', 'U')}
                    </div>
                    <div className={`wa-status-dot ${appState.tankData.tankA.upper > 20 ? 'online' : 'offline'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text">
                        Tank A - Upper
                      </h3>
                      <span className={`text-wa-sm font-medium ${getTankStatusColor(appState.tankData.tankA.upper)}`}>
                        {appState.tankData.tankA.upper}%
                      </span>
                    </div>
                    <div className="w-full bg-wa-light-border dark:bg-wa-dark-border rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          appState.tankData.tankA.upper >= 80 ? 'bg-green-500' :
                          appState.tankData.tankA.upper >= 50 ? 'bg-yellow-500' :
                          appState.tankData.tankA.upper >= 20 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${appState.tankData.tankA.upper}%` }}
                      />
                    </div>
                    <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                      {appState.tankData.tankA.upper >= 80 ? 'Excellent' :
                       appState.tankData.tankA.upper >= 50 ? 'Good' :
                       appState.tankData.tankA.upper >= 20 ? 'Low' : 'Critical'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Tank A Lower */}
              {appState.systemSettings.sensors.lowerTankA && (
                <div className="wa-chat-item animate-wa-slide-up">
                  <div className="relative">
                    <div className="wa-avatar">
                      {getTankAvatar('A', 'L')}
                    </div>
                    <div className={`wa-status-dot ${appState.tankData.tankA.lower > 20 ? 'online' : 'offline'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text">
                        Tank A - Lower
                      </h3>
                      <span className={`text-wa-sm font-medium ${getTankStatusColor(appState.tankData.tankA.lower)}`}>
                        {appState.tankData.tankA.lower}%
                      </span>
                    </div>
                    <div className="w-full bg-wa-light-border dark:bg-wa-dark-border rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          appState.tankData.tankA.lower >= 80 ? 'bg-green-500' :
                          appState.tankData.tankA.lower >= 50 ? 'bg-yellow-500' :
                          appState.tankData.tankA.lower >= 20 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${appState.tankData.tankA.lower}%` }}
                      />
                    </div>
                    <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                      {appState.tankData.tankA.lower >= 80 ? 'Excellent' :
                       appState.tankData.tankA.lower >= 50 ? 'Good' :
                       appState.tankData.tankA.lower >= 20 ? 'Low' : 'Critical'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Tank B Upper */}
              {appState.systemSettings.sensors.upperTankB && (
                <div className="wa-chat-item animate-wa-slide-up">
                  <div className="relative">
                    <div className="wa-avatar">
                      {getTankAvatar('B', 'U')}
                    </div>
                    <div className={`wa-status-dot ${appState.tankData.tankB.upper > 20 ? 'online' : 'offline'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text">
                        Tank B - Upper
                      </h3>
                      <span className={`text-wa-sm font-medium ${getTankStatusColor(appState.tankData.tankB.upper)}`}>
                        {appState.tankData.tankB.upper}%
                      </span>
                    </div>
                    <div className="w-full bg-wa-light-border dark:bg-wa-dark-border rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          appState.tankData.tankB.upper >= 80 ? 'bg-green-500' :
                          appState.tankData.tankB.upper >= 50 ? 'bg-yellow-500' :
                          appState.tankData.tankB.upper >= 20 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${appState.tankData.tankB.upper}%` }}
                      />
                    </div>
                    <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                      {appState.tankData.tankB.upper >= 80 ? 'Excellent' :
                       appState.tankData.tankB.upper >= 50 ? 'Good' :
                       appState.tankData.tankB.upper >= 20 ? 'Low' : 'Critical'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Tank B Lower */}
              {appState.systemSettings.sensors.lowerTankB && (
                <div className="wa-chat-item animate-wa-slide-up">
                  <div className="relative">
                    <div className="wa-avatar">
                      {getTankAvatar('B', 'L')}
                    </div>
                    <div className={`wa-status-dot ${appState.tankData.tankB.lower > 20 ? 'online' : 'offline'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text">
                        Tank B - Lower
                      </h3>
                      <span className={`text-wa-sm font-medium ${getTankStatusColor(appState.tankData.tankB.lower)}`}>
                        {appState.tankData.tankB.lower}%
                      </span>
                    </div>
                    <div className="w-full bg-wa-light-border dark:bg-wa-dark-border rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          appState.tankData.tankB.lower >= 80 ? 'bg-green-500' :
                          appState.tankData.tankB.lower >= 50 ? 'bg-yellow-500' :
                          appState.tankData.tankB.lower >= 20 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${appState.tankData.tankB.lower}%` }}
                      />
                    </div>
                    <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                      {appState.tankData.tankB.lower >= 80 ? 'Excellent' :
                       appState.tankData.tankB.lower >= 50 ? 'Good' :
                       appState.tankData.tankB.lower >= 20 ? 'Low' : 'Critical'}
                    </p>
                  </div>
                </div>
              )}
          
            {/* Show message if no tanks are enabled */}
            {!(appState.systemSettings.sensors.upperTankA || appState.systemSettings.sensors.lowerTankA || 
               appState.systemSettings.sensors.upperTankB || appState.systemSettings.sensors.lowerTankB) && (
                <div className="wa-empty-state">
                  <Droplets className="wa-empty-state-icon" />
                  <h3 className="wa-empty-state-title">No Tank Sensors Enabled</h3>
                  <p className="wa-empty-state-description">
                    Enable tank sensors in Settings to monitor tank levels
                  </p>
          </div>
        )}
            </div>
          </div>

          {/* Motor Control Section */}
          {appState.systemStatus.mode === 'Manual Mode' && (
            <div className="mb-4">
              <h2 className="text-wa-lg font-semibold text-wa-light-text dark:text-wa-dark-text mb-4">
                Motor Control
              </h2>
              
              <div className="space-y-3">
              {/* Motor 1 Control */}
              {appState.systemStatus.motor1Enabled && (
                  <div className="wa-chat-item">
                    <div className="wa-avatar">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text">
                          Motor 1
                        </h3>
                        <span className={`text-wa-sm font-medium ${
                          appState.systemStatus.motor1Status === 'ON' ? 'text-green-500' : 'text-gray-500'
                        }`}>
                          {appState.systemStatus.motor1Status}
                        </span>
                      </div>
                      <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                        Manual control available
                      </p>
                    </div>
                    <button
                      onClick={() => handleMotorToggle(1)}
                      disabled={!appState.systemStatus.connected}
                      className={`px-4 py-2 rounded-wa font-medium text-wa-sm transition-colors ${
                        appState.systemStatus.connected 
                          ? (appState.systemStatus.motor1Status === 'ON' 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white')
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {appState.systemStatus.motor1Status === 'ON' ? 'Stop' : 'Start'}
                    </button>
                </div>
              )}

              {/* Motor 2 Control */}
              {appState.systemStatus.motor2Enabled && (
                  <div className="wa-chat-item">
                    <div className="wa-avatar">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text">
                          Motor 2
                        </h3>
                        <span className={`text-wa-sm font-medium ${
                          appState.systemStatus.motor2Status === 'ON' ? 'text-green-500' : 'text-gray-500'
                        }`}>
                          {appState.systemStatus.motor2Status}
                        </span>
                      </div>
                      <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                        Manual control available
                      </p>
                    </div>
                    <button
                      onClick={() => handleMotorToggle(2)}
                      disabled={!appState.systemStatus.connected}
                      className={`px-4 py-2 rounded-wa font-medium text-wa-sm transition-colors ${
                        appState.systemStatus.connected 
                          ? (appState.systemStatus.motor2Status === 'ON' 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white')
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {appState.systemStatus.motor2Status === 'ON' ? 'Stop' : 'Start'}
                    </button>
                  </div>
                )}
                </div>
            </div>
          )}

          {/* Auto Mode Information */}
          {appState.systemStatus.mode === 'Auto Mode' && (
            <div className="mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-wa-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span className="text-wa-sm font-medium text-blue-700 dark:text-blue-300">
                    Auto Mode Active
                  </span>
                </div>
                <p className="text-wa-sm text-blue-600 dark:text-blue-400 mb-3">
                  Motors are automatically controlled based on tank levels and system settings.
                </p>
                
                {/* Motor 1 Automation Reason */}
                {appState.systemStatus.motor1Enabled && (
                  <div className="mb-2">
                    <p className="text-wa-sm text-blue-600 dark:text-blue-400">
                      <strong>Motor 1:</strong> {appState.systemStatus.motor1Status} - {appState.systemStatus.autoModeReasonMotor1}
                    </p>
                  </div>
                )}
                
                {/* Motor 2 Automation Reason */}
                {appState.systemStatus.motor2Enabled && (
                  <div className="mb-2">
                    <p className="text-wa-sm text-blue-600 dark:text-blue-400">
                      <strong>Motor 2:</strong> {appState.systemStatus.motor2Status} - {appState.systemStatus.autoModeReasonMotor2}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </PullToRefresh>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Mobile Bottom Sheet */}
      <MaterialBottomSheet
        isOpen={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
        title="Quick Actions"
      >
        <div className="space-y-4">
          <MaterialButton
            variant="primary"
            fullWidth
            onClick={() => {
              setShowBottomSheet(false);
              navigate('/devices');
            }}
            icon={<Wifi className="w-4 h-4" />}
          >
            Manage Devices
          </MaterialButton>
          
          <MaterialButton
            variant="outlined"
            fullWidth
            onClick={() => {
              setShowBottomSheet(false);
              navigate('/settings');
            }}
            icon={<Settings className="w-4 h-4" />}
          >
            Settings
          </MaterialButton>
          
          <MaterialButton
            variant="outlined"
            fullWidth
            onClick={() => {
              setShowBottomSheet(false);
              handleSyncData();
            }}
            icon={<RefreshCw className="w-4 h-4" />}
            disabled={!isConnected}
          >
            Sync Data
          </MaterialButton>
        </div>
      </MaterialBottomSheet>

      {/* Snackbar */}
      <MaterialSnackbar
        isOpen={snackbar.isOpen}
        onClose={() => setSnackbar(prev => ({ ...prev, isOpen: false }))}
        message={snackbar.message}
        variant={snackbar.variant}
      />
    </div>
  );
};