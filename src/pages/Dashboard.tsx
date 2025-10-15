import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/useWebSocket';
import { usePageData } from '../hooks/usePageData';
import { StatusCard } from '../components/StatusCard';
import { IndividualTankCard } from '../components/IndividualTankCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { MaterialButton } from '../components/MaterialButton';
import { MaterialCard } from '../components/MaterialCard';
import { MaterialBottomSheet } from '../components/MaterialBottomSheet';
import { MaterialSnackbar } from '../components/MaterialSnackbar';
import { Settings, Wifi, WifiOff, RefreshCw, Loader2, Menu } from 'lucide-react';

/**
 * Enhanced Dashboard Component
 * 
 * Main dashboard interface for the Smart Water Tank PWA featuring:
 * - Real-time system status monitoring
 * - Tank level visualization with animated progress bars
 * - Motor control interface (Manual mode)
 * - Connection management with ESP32 device
 * - Auto-sync functionality with configurable intervals
 * - Responsive design with smooth animations
 * 
 * Key Features:
 * - Live data synchronization with ESP32
 * - Dynamic UI based on sensor configuration
 * - Enhanced animations and visual feedback
 * - Connection status indicators
 * - Motor control for manual operation
 * - Auto-mode status display
 * 
 * State Management:
 * - WebSocket connection state
 * - Auto-sync interval configuration
 * - Connection/reconnection status
 * - Manual data refresh capability
 */
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { appState, sendMessage, connect, disconnect, isConnected } = useWebSocket();
  const { startDashboardSync, stopDashboardSync } = usePageData();

  // Debug logging for tank data and sensor states
  useEffect(() => {
    console.log('Dashboard - Tank Data:', appState.tankData);
    console.log('Dashboard - Sensor States:', appState.systemSettings.sensors);
    console.log('Dashboard - System Status:', appState.systemStatus);
  }, [appState.tankData, appState.systemSettings.sensors, appState.systemStatus]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectionStatus, setReconnectionStatus] = useState<string>('');
  const [isAutoReconnecting, setIsAutoReconnecting] = useState(false);
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
   * Sends a unified data request to get all system information
   */
  const handleSyncData = useCallback(async () => {
    if (!isConnected) return;
    
    setIsRefreshing(true);
    
    // Send unified data request - gets all necessary data in one call
    sendMessage({
      type: 'getAllData'
    });

    // Simulate refresh delay for better UX
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [isConnected, sendMessage]);

  /**
   * Updates the auto-sync interval and persists to localStorage
   * @param newInterval - New sync interval in milliseconds
   */
  const updateSyncInterval = useCallback((newInterval: number) => {
    setSyncInterval(newInterval);
    localStorage.setItem('dashboardSyncInterval', newInterval.toString());
    
    // Restart auto-sync with new interval
    if (isConnected) {
      startDashboardSync();
    }
  }, [isConnected, startDashboardSync]);

  // Connection handling functions
  const handleConnect = async () => {
    const lastHost = localStorage.getItem('tankHost');
    if (!lastHost) {
      // Trigger connection modal through ConnectionGuard
      window.dispatchEvent(new CustomEvent('openConnectionModal'));
      return;
    }

    setIsConnecting(true);
    try {
      await connect(lastHost);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };



  // Effect to manage auto-sync based on connection status and sync interval changes
  // Note: This is now handled by usePageData hook, so we don't need to start/stop here
  // The usePageData hook will handle page-specific data fetching
  useEffect(() => {
    // Only stop dashboard sync when disconnected
    if (!isConnected) {
      stopDashboardSync();
    }

    // Cleanup on unmount
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

  // Listen for reconnection status updates from ConnectionGuard
  useEffect(() => {
    const handleReconnectionStatus = (event: CustomEvent) => {
      setReconnectionStatus(event.detail.status);
      setIsAutoReconnecting(event.detail.status !== '');
    };

    window.addEventListener('reconnectionStatus', handleReconnectionStatus as EventListener);
    return () => {
      window.removeEventListener('reconnectionStatus', handleReconnectionStatus as EventListener);
    };
  }, []);


  /**
   * Handles motor toggle for manual control mode
   * @param motorNumber - Motor number (1 or 2) to toggle
   */
  const handleMotorToggle = (motorNumber: 1 | 2) => {
    const currentMotorState = motorNumber === 1 ? appState.systemStatus.motor1Status : appState.systemStatus.motor2Status;
    const isMotorCurrentlyOn = currentMotorState === 'ON';
    const newMotorState = !isMotorCurrentlyOn;
    
    sendMessage({
      type: newMotorState ? `motor${motorNumber}On` : `motor${motorNumber}Off`
    });
  };




  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="android-app-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WT</span>
              </div>
              <h1 className="text-responsive-lg font-bold text-white">
                Smart Water Tank
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowBottomSheet(true)}
                className="md:hidden p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Connect/Disconnect Button */}
              <MaterialButton
                variant={isConnected ? 'secondary' : 'primary'}
                size="small"
                loading={isConnecting}
                disabled={isAutoReconnecting}
                onClick={isConnected ? handleDisconnect : handleConnect}
                icon={isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                      isAutoReconnecting ? <Wifi className="w-4 h-4 animate-pulse" /> :
                      isConnected ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
                className="hidden sm:flex"
              >
                {isConnecting ? 'Connecting...' : 
                 isAutoReconnecting ? 'Reconnecting...' :
                 isConnected ? 'Disconnect' : 'Connect'}
              </MaterialButton>



              {/* Theme Toggle */}
              <ThemeToggle />

              {/* PWA Install Button */}
              <PWAInstallButton />

              {/* Settings Button */}
              <button
                onClick={() => navigate('/settings')}
                className="
                  p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                  hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors
                "
                title="System Settings"
              >
                <Settings className="w-5 h-5 transition-all duration-300 hover:scale-110 hover:rotate-12" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Status Card */}
          <MaterialCard elevation={2} className="animate-fade-in-up">
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

          {/* Tank Monitoring */}
          <MaterialCard elevation={2} className="animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-responsive-xl font-semibold text-gray-800 dark:text-gray-200">
                Tank Monitoring
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Auto-sync:
                  </label>
                  <select
                    value={syncInterval}
                    onChange={(e) => updateSyncInterval(parseInt(e.target.value, 10))}
                    className="android-input text-sm"
                  >
                    <option value={0}>Off</option>
                    <option value={2000}>2s</option>
                    <option value={5000}>5s</option>
                    <option value={10000}>10s</option>
                    <option value={30000}>30s</option>
                    <option value={60000}>1m</option>
                  </select>
                </div>
                <MaterialButton
                  variant="primary"
                  size="small"
                  loading={isRefreshing}
                  disabled={!isConnected}
                  onClick={handleSyncData}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Sync Now
                </MaterialButton>
              </div>
            </div>
          
            {/* Individual Tank Cards - Only show active sensors */}
            <div className="responsive-grid">
              {/* Tank A Upper */}
              {appState.systemSettings.sensors.upperTankA && (
                <IndividualTankCard
                  tankName="Tank A"
                  tankType="upper"
                  level={appState.tankData.tankA.upper}
                  isActive={appState.systemSettings.sensors.upperTankA}
                />
              )}
              
              {/* Tank A Lower */}
              {appState.systemSettings.sensors.lowerTankA && (
                <IndividualTankCard
                  tankName="Tank A"
                  tankType="lower"
                  level={appState.tankData.tankA.lower}
                  isActive={appState.systemSettings.sensors.lowerTankA}
                />
              )}
              
              {/* Tank B Upper */}
              {appState.systemSettings.sensors.upperTankB && (
                <IndividualTankCard
                  tankName="Tank B"
                  tankType="upper"
                  level={appState.tankData.tankB.upper}
                  isActive={appState.systemSettings.sensors.upperTankB}
                />
              )}
              
              {/* Tank B Lower */}
              {appState.systemSettings.sensors.lowerTankB && (
                <IndividualTankCard
                  tankName="Tank B"
                  tankType="lower"
                  level={appState.tankData.tankB.lower}
                  isActive={appState.systemSettings.sensors.lowerTankB}
                />
              )}
            </div>
          
            {/* Show message if no tanks are enabled */}
            {!(appState.systemSettings.sensors.upperTankA || appState.systemSettings.sensors.lowerTankA || 
               appState.systemSettings.sensors.upperTankB || appState.systemSettings.sensors.lowerTankB) && (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <p className="text-sm font-medium mb-2">No Tank Sensors Enabled</p>
                  <p className="text-xs">
                    Enable tank sensors in Settings to monitor tank levels
                  </p>
                </div>
              </div>
            )}
          </MaterialCard>

        {/* Debug Panel - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Debug Info</h3>
            <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
              <div><strong>Sensor States:</strong> {JSON.stringify(appState.systemSettings.sensors)}</div>
              <div><strong>Tank Data:</strong> {JSON.stringify(appState.tankData)}</div>
              <div><strong>Connected:</strong> {appState.isConnected ? 'Yes' : 'No'}</div>
              <div><strong>System Mode:</strong> {appState.systemStatus.mode}</div>
            </div>
          </div>
        )}

        {/* Auto Mode Reason Display */}
        {appState.systemStatus.mode === 'Auto Mode' && appState.systemStatus.autoModeReasons && appState.systemStatus.autoModeReasons !== 'NONE' && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Auto Mode Reason: {appState.systemStatus.autoModeReasons}
              </span>
            </div>
          </div>
        )}


        {/* Motor Control */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Motor Control
          </h3>
          
          {/* Motor Configuration Info */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Motor Configuration: {appState.systemStatus.motorConfig}
            </h4>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div>Motor 1: {appState.systemStatus.motor1Enabled ? 'Enabled' : 'Disabled'} - Status: {appState.systemStatus.motor1Status}</div>
              <div>Motor 2: {appState.systemStatus.motor2Enabled ? 'Enabled' : 'Disabled'} - Status: {appState.systemStatus.motor2Status}</div>
            </div>
          </div>

          {/* Manual Mode Motor Control */}
          {appState.systemStatus.mode === 'Manual Mode' && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                Manual Motor Control
              </h4>
              
              {/* Motor 1 Control */}
              {appState.systemStatus.motor1Enabled && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Motor 1 Control
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Status: {appState.systemStatus.motor1Status}
                      </p>
                    </div>
                    <button
                      onClick={() => handleMotorToggle(1)}
                      className={`
                        px-4 py-2 rounded-lg font-medium transition-colors text-sm
                        ${appState.systemStatus.connected 
                          ? (appState.systemStatus.motor1Status === 'ON' 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white')
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                      `}
                      disabled={!appState.systemStatus.connected}
                    >
                      {appState.systemStatus.motor1Status === 'ON' ? 'Turn OFF Motor 1' : 'Turn ON Motor 1'}
                    </button>
                  </div>
                </div>
              )}

              {/* Motor 2 Control */}
              {appState.systemStatus.motor2Enabled && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Motor 2 Control
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Status: {appState.systemStatus.motor2Status}
                      </p>
                    </div>
                    <button
                      onClick={() => handleMotorToggle(2)}
                      className={`
                        px-4 py-2 rounded-lg font-medium transition-colors text-sm
                        ${appState.systemStatus.connected 
                          ? (appState.systemStatus.motor2Status === 'ON' 
                              ? 'bg-red-500 hover:bg-red-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white')
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                      `}
                      disabled={!appState.systemStatus.connected}
                    >
                      {appState.systemStatus.motor2Status === 'ON' ? 'Turn OFF Motor 2' : 'Turn ON Motor 2'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Auto Mode Information */}
          {appState.systemStatus.mode === 'Auto Mode' && (
            <div className="mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Auto Mode Active
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                  Motors are automatically controlled based on tank levels and system settings.
                </p>
                
                {/* Motor 1 Automation Reason */}
                {appState.systemStatus.motor1Enabled && (
                  <div className="mb-2">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      <strong>Motor 1:</strong> {appState.systemStatus.motor1Status} - {appState.systemStatus.autoModeReasonMotor1}
                    </p>
                  </div>
                )}
                
                {/* Motor 2 Automation Reason */}
                {appState.systemStatus.motor2Enabled && (
                  <div className="mb-2">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      <strong>Motor 2:</strong> {appState.systemStatus.motor2Status} - {appState.systemStatus.autoModeReasonMotor2}
                    </p>
                  </div>
                )}
                
                {/* Legacy Motor Status */}
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  <strong>Overall Status:</strong> {appState.systemStatus.motorStatus}
                </p>
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System Mode */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    System Mode
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Current operation mode
                  </p>
                </div>
                <div className={`
                  px-3 py-1 rounded-md text-sm font-medium
                  ${appState.systemStatus.mode === 'Auto Mode' 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }
                `}>
                  {appState.systemStatus.mode}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {appState.systemStatus.mode === 'Auto Mode' 
                  ? 'Automated control based on tank levels' 
                  : 'Manual control required'
                }
              </div>
            </div>

            {/* Motor Status */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Motor Status
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Current motor state
                  </p>
                </div>
                <div className={`
                  px-3 py-1 rounded-md text-sm font-medium
                  ${appState.systemStatus.motorStatus === 'ON' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                  }
                `}>
                  {appState.systemStatus.motorStatus}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {appState.systemStatus.connected ? 'Connected to ESP32' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>



        {/* Error Display */}
        {appState.error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                Error: {appState.error}
              </span>
            </div>
          </div>
        )}

        {/* Refresh Indicator */}
        {isRefreshing && (
          <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Syncing data...</span>
          </div>
        )}

        {/* Reconnection Status Indicator */}
        {reconnectionStatus && (
          <div className="fixed bottom-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">{reconnectionStatus}</span>
          </div>
        )}
        </div>
      </main>

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
              if (isConnected) {
                handleDisconnect();
              } else {
                handleConnect();
              }
            }}
            icon={isConnected ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
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
