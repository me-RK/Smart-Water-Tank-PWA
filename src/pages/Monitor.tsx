import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/useWebSocket';
import { usePageData } from '../hooks/usePageData';
import { MaterialCard } from '../components/MaterialCard';
import { MaterialButton } from '../components/MaterialButton';
import { BottomNavigation } from '../components/BottomNavigation';
import { PullToRefresh } from '../components/PullToRefresh';
import { useToast } from '../components/useToast';
import { 
  Droplets, 
  Zap, 
  Activity, 
  Settings, 
  RefreshCw,
  Gauge,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

/**
 * Monitor and Control Page Component
 * 
 * Features:
 * - Dedicated tank level monitoring with visual representations
 * - Motor control interface with start/stop buttons
 * - Real-time status indicators
 * - Historical data visualization (placeholder for future implementation)
 * - WebSocket real-time updates synchronized with settings interval
 * - Mobile-responsive design
 */

export const Monitor: React.FC = () => {
  const navigate = useNavigate();
  const { 
    appState, 
    sendMessage, 
    isConnected, 
    connectionStatus, 
    manualSync 
  } = useWebSocket();
  const { startDashboardSync, stopDashboardSync } = usePageData();
  const toast = useToast();


  // Debug logging for tank data and sensor states
  useEffect(() => {
    console.log('Monitor - Tank Data:', appState.tankData);
    console.log('Monitor - Sensor States:', appState.systemSettings.sensors);
    console.log('Monitor - System Status:', appState.systemStatus);
  }, [appState.tankData, appState.systemSettings.sensors, appState.systemStatus]);

  /**
   * Handles manual data synchronization with ESP32
   */
  const handleSyncData = useCallback(async () => {
    if (!isConnected) {
      return;
    }
    
    // Send unified data request
    sendMessage({
      type: 'getAllData'
    });
  }, [isConnected, sendMessage]);

  /**
   * Handles enhanced manual sync with heartbeat system
   */
  const handleManualSync = useCallback(async () => {
    try {
      const success = await manualSync();
      if (success) {
        toast.showToast({
          type: 'success',
          message: 'Data synced successfully',
        });
      } else {
        toast.showToast({
          type: 'error',
          message: 'Sync failed - check connection',
        });
      }
    } catch {
      toast.showToast({
        type: 'error',
        message: 'Sync failed - check connection',
      });
    }
  }, [manualSync, toast]);

  /**
   * Handle pull-to-refresh
   */
  const handlePullToRefresh = useCallback(async () => {
    await handleSyncData();
  }, [handleSyncData]);

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
   * Get tank level color based on percentage
   */
  const getTankLevelColor = (level: number) => {
    if (level >= 80) return 'text-green-500';
    if (level >= 50) return 'text-yellow-500';
    if (level >= 20) return 'text-orange-500';
    return 'text-red-500';
  };

  /**
   * Get tank level background color for progress bars
   */
  const getTankLevelBgColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 50) return 'bg-yellow-500';
    if (level >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  /**
   * Get tank status icon
   */
  const getTankStatusIcon = (level: number) => {
    if (level >= 80) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (level >= 50) return <Gauge className="w-5 h-5 text-yellow-500" />;
    if (level >= 20) return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  /**
   * Get motor status color
   */
  const getMotorStatusColor = (status: 'ON' | 'OFF') => {
    return status === 'ON' ? 'text-green-500' : 'text-gray-500';
  };

  /**
   * Get motor status icon
   */
  const getMotorStatusIcon = (status: 'ON' | 'OFF') => {
    return status === 'ON' ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-gray-500" />;
  };

  // Effect to manage auto-sync based on connection status
  useEffect(() => {
    if (!isConnected) {
      stopDashboardSync();
    } else {
      startDashboardSync();
    }

    return () => {
      stopDashboardSync();
    };
  }, [isConnected, startDashboardSync, stopDashboardSync]);

  // Listen for sync interval changes from Settings page
  useEffect(() => {
    const handleSyncIntervalChange = (event: CustomEvent) => {
      const newInterval = event.detail.interval;
      localStorage.setItem('dashboardSyncInterval', newInterval.toString());
      
      // Restart auto-sync with new interval
      if (isConnected) {
        startDashboardSync();
      }
    };

    window.addEventListener('syncIntervalChanged', handleSyncIntervalChange as EventListener);
    
    return () => {
      window.removeEventListener('syncIntervalChanged', handleSyncIntervalChange as EventListener);
    };
  }, [isConnected, startDashboardSync]);

  return (
    <div className="min-h-screen bg-wa-light-bg dark:bg-wa-dark-bg">
      {/* WhatsApp-Style Header */}
      <header className="wa-header">
        <div className="flex items-center gap-3">
          <div className="wa-avatar">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="wa-header-title">Monitor and Control</h1>
            <p className="text-sm opacity-90">
              {isConnected ? 'Live Monitoring' : 'Disconnected'} • Real-time Control
            </p>
          </div>
        </div>

        <div className="wa-header-actions">
          {/* Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={!isConnected || connectionStatus.isChecking}
            className="wa-header-button"
            title="Sync Data"
          >
            <RefreshCw className={`w-5 h-5 ${connectionStatus.isChecking ? 'animate-spin' : ''}`} />
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
      <PullToRefresh onRefresh={handlePullToRefresh} className="page-scrollable">
        <main className="container-responsive fluid-padding page-content">
          
          {/* Tank Level Monitoring Section */}
          <div className="fluid-margin">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-responsive-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                Tank Levels
              </h2>
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  Real-time
                </span>
              </div>
            </div>
            
            {/* Tank Level Cards */}
            <div className="space-y-4">
              {/* Tank A Upper */}
              {appState.systemSettings.sensors.upperTankA && (
                <MaterialCard elevation={2} className="animate-wa-slide-up">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">AU</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                            Tank A - Upper
                          </h3>
                          <p className="text-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                            Primary Storage
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getTankStatusIcon(appState.tankData.tankA.upper)}
                        <p className={`text-2xl font-bold ${getTankLevelColor(appState.tankData.tankA.upper)}`}>
                          {appState.tankData.tankA.upper}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Visual Tank Representation */}
                    <div className="relative">
                      <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-out ${getTankLevelBgColor(appState.tankData.tankA.upper)}`}
                          style={{ width: `${appState.tankData.tankA.upper}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </MaterialCard>
              )}

              {/* Tank A Lower */}
              {appState.systemSettings.sensors.lowerTankA && (
                <MaterialCard elevation={2} className="animate-wa-slide-up">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">AL</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                            Tank A - Lower
                          </h3>
                          <p className="text-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                            Secondary Storage
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getTankStatusIcon(appState.tankData.tankA.lower)}
                        <p className={`text-2xl font-bold ${getTankLevelColor(appState.tankData.tankA.lower)}`}>
                          {appState.tankData.tankA.lower}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Visual Tank Representation */}
                    <div className="relative">
                      <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-out ${getTankLevelBgColor(appState.tankData.tankA.lower)}`}
                          style={{ width: `${appState.tankData.tankA.lower}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </MaterialCard>
              )}

              {/* Tank B Upper */}
              {appState.systemSettings.sensors.upperTankB && (
                <MaterialCard elevation={2} className="animate-wa-slide-up">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 font-bold text-lg">BU</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                            Tank B - Upper
                          </h3>
                          <p className="text-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                            Primary Storage
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getTankStatusIcon(appState.tankData.tankB.upper)}
                        <p className={`text-2xl font-bold ${getTankLevelColor(appState.tankData.tankB.upper)}`}>
                          {appState.tankData.tankB.upper}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Visual Tank Representation */}
                    <div className="relative">
                      <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-out ${getTankLevelBgColor(appState.tankData.tankB.upper)}`}
                          style={{ width: `${appState.tankData.tankB.upper}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </MaterialCard>
              )}

              {/* Tank B Lower */}
              {appState.systemSettings.sensors.lowerTankB && (
                <MaterialCard elevation={2} className="animate-wa-slide-up">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 font-bold text-lg">BL</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                            Tank B - Lower
                          </h3>
                          <p className="text-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                            Secondary Storage
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getTankStatusIcon(appState.tankData.tankB.lower)}
                        <p className={`text-2xl font-bold ${getTankLevelColor(appState.tankData.tankB.lower)}`}>
                          {appState.tankData.tankB.lower}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Visual Tank Representation */}
                    <div className="relative">
                      <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-out ${getTankLevelBgColor(appState.tankData.tankB.lower)}`}
                          style={{ width: `${appState.tankData.tankB.lower}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </MaterialCard>
              )}

              {/* Show message if no tanks are enabled */}
              {!(appState.systemSettings.sensors.upperTankA || appState.systemSettings.sensors.lowerTankA || 
                 appState.systemSettings.sensors.upperTankB || appState.systemSettings.sensors.lowerTankB) && (
                <MaterialCard elevation={2}>
                  <div className="p-8 text-center">
                    <Droplets className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-wa-light-text dark:text-wa-dark-text mb-2">
                      No Tank Sensors Enabled
                    </h3>
                    <p className="text-wa-light-text-muted dark:text-wa-dark-text-muted mb-4">
                      Enable tank sensors in Settings to monitor tank levels
                    </p>
                    <MaterialButton
                      variant="outlined"
                      onClick={() => navigate('/settings')}
                      icon={<Settings className="w-4 h-4" />}
                    >
                      Go to Settings
                    </MaterialButton>
                  </div>
                </MaterialCard>
              )}
            </div>
          </div>

          {/* Motor Control Section */}
          <div className="fluid-margin">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-responsive-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                Motor Control
              </h2>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  {appState.systemStatus.mode}
                </span>
              </div>
            </div>

            {/* Motor Control Cards */}
            <div className="space-y-4">
              {/* Motor 1 Control */}
              {appState.systemStatus.motor1Enabled && (
                <MaterialCard elevation={2} className="animate-wa-slide-up">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                            Motor 1
                          </h3>
                          <p className="text-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                            Primary Motor
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getMotorStatusIcon(appState.systemStatus.motor1Status)}
                        <p className={`text-lg font-semibold ${getMotorStatusColor(appState.systemStatus.motor1Status)}`}>
                          {appState.systemStatus.motor1Status}
                        </p>
                      </div>
                    </div>

                    {/* Motor Control Buttons */}
                    {appState.systemStatus.mode === 'Manual Mode' && (
                      <div className="flex gap-3">
                        <MaterialButton
                          variant={appState.systemStatus.motor1Status === 'ON' ? 'secondary' : 'primary'}
                          fullWidth
                          onClick={() => handleMotorToggle(1)}
                          disabled={!isConnected}
                          icon={appState.systemStatus.motor1Status === 'ON' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        >
                          {appState.systemStatus.motor1Status === 'ON' ? 'Stop Motor' : 'Start Motor'}
                        </MaterialButton>
                      </div>
                    )}

                    {/* Auto Mode Information */}
                    {appState.systemStatus.mode === 'Auto Mode' && appState.systemStatus.autoModeReasonMotor1 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Auto Reason:</strong> {appState.systemStatus.autoModeReasonMotor1}
                        </p>
                      </div>
                    )}
                  </div>
                </MaterialCard>
              )}

              {/* Motor 2 Control */}
              {appState.systemStatus.motor2Enabled && (
                <MaterialCard elevation={2} className="animate-wa-slide-up">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                            Motor 2
                          </h3>
                          <p className="text-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                            Secondary Motor
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getMotorStatusIcon(appState.systemStatus.motor2Status)}
                        <p className={`text-lg font-semibold ${getMotorStatusColor(appState.systemStatus.motor2Status)}`}>
                          {appState.systemStatus.motor2Status}
                        </p>
                      </div>
                    </div>

                    {/* Motor Control Buttons */}
                    {appState.systemStatus.mode === 'Manual Mode' && (
                      <div className="flex gap-3">
                        <MaterialButton
                          variant={appState.systemStatus.motor2Status === 'ON' ? 'secondary' : 'primary'}
                          fullWidth
                          onClick={() => handleMotorToggle(2)}
                          disabled={!isConnected}
                          icon={appState.systemStatus.motor2Status === 'ON' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        >
                          {appState.systemStatus.motor2Status === 'ON' ? 'Stop Motor' : 'Start Motor'}
                        </MaterialButton>
                      </div>
                    )}

                    {/* Auto Mode Information */}
                    {appState.systemStatus.mode === 'Auto Mode' && appState.systemStatus.autoModeReasonMotor2 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Auto Reason:</strong> {appState.systemStatus.autoModeReasonMotor2}
                        </p>
                      </div>
                    )}
                  </div>
                </MaterialCard>
              )}

              {/* Show message if no motors are enabled */}
              {!appState.systemStatus.motor1Enabled && !appState.systemStatus.motor2Enabled && (
                <MaterialCard elevation={2}>
                  <div className="p-8 text-center">
                    <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-wa-light-text dark:text-wa-dark-text mb-2">
                      No Motors Enabled
                    </h3>
                    <p className="text-wa-light-text-muted dark:text-wa-dark-text-muted mb-4">
                      Enable motors in Settings to control them
                    </p>
                    <MaterialButton
                      variant="outlined"
                      onClick={() => navigate('/settings')}
                      icon={<Settings className="w-4 h-4" />}
                    >
                      Go to Settings
                    </MaterialButton>
                  </div>
                </MaterialCard>
              )}
            </div>
          </div>

          {/* Historical Data Section - Placeholder for Future Implementation */}
          <div className="fluid-margin">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-responsive-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                Historical Data
              </h2>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  Coming Soon
                </span>
              </div>
            </div>

            <MaterialCard elevation={2}>
              <div className="p-8 text-center">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-wa-light-text dark:text-wa-dark-text mb-2">
                  Historical Data & Analytics
                </h3>
                <p className="text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  Charts and historical data visualization will be available in a future update
                </p>
              </div>
            </MaterialCard>
          </div>
        </main>
      </PullToRefresh>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
