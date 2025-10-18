import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/useWebSocket';
import { usePageData } from '../hooks/usePageData';
import { StatusCard } from '../components/StatusCard';
import { StatusConsole } from '../components/StatusConsole';
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
    console.log('Dashboard - Tank Data:', appState.tankData);
    console.log('Dashboard - Sensor States:', appState.systemSettings.sensors);
    console.log('Dashboard - System Status:', appState.systemStatus);
  }, [appState.tankData, appState.systemSettings.sensors, appState.systemStatus]);

  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    isOpen: boolean;
    message: string;
    variant: 'success' | 'error' | 'info' | 'warning';
  }>({ isOpen: false, message: '', variant: 'info' });
  
  // Auto-sync functionality - interval is now managed in Settings

  /**
   * Handles manual data synchronization with ESP32
   */
  const handleSyncData = useCallback(async () => {
    if (!isConnected) {
      return;
    }
    
    // Send unified data request - no toast notifications
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

  // Sync interval is now managed in Settings page


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
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h1 className="wa-header-title">System Overview</h1>
            <p className="text-sm opacity-90">
              {isConnected ? 'Connected' : 'Disconnected'} • Status & Monitoring
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
      <PullToRefresh onRefresh={handlePullToRefresh} className="page-scrollable">
        <main className="container-responsive fluid-padding page-content">
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
              onManualSync={handleManualSync}
              isManualSyncLoading={connectionStatus.isChecking}
              showEnhancedConnection={true}
            />
          </MaterialCard>
          </div>

          {/* Status Console Section */}
          <div className="fluid-margin">
            <StatusConsole />
          </div>

          {/* Quick Actions Section */}
          <div className="fluid-margin">
            <div className="fluid-margin">
              <h2 className="text-responsive-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                Quick Actions
              </h2>
            </div>
          
            {/* Quick Action Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Monitor Page Button */}
              <MaterialCard elevation={2} className="animate-wa-slide-up cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/monitor')}>
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-wa-light-text dark:text-wa-dark-text mb-1">
                    Monitor & Control
                  </h3>
                  <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    Tank levels & Motor control
                  </p>
                </div>
              </MaterialCard>

              {/* Devices Page Button */}
              <MaterialCard elevation={2} className="animate-wa-slide-up cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/devices')}>
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-wa-light-text dark:text-wa-dark-text mb-1">
                    Devices
                  </h3>
                  <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    Connection management
                  </p>
                </div>
              </MaterialCard>

              {/* Settings Page Button */}
              <MaterialCard elevation={2} className="animate-wa-slide-up cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/settings')}>
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-wa-light-text dark:text-wa-dark-text mb-1">
                    Settings
                  </h3>
                  <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    System configuration
                  </p>
                </div>
              </MaterialCard>

              {/* Hardware Settings Button */}
              <MaterialCard elevation={2} className="animate-wa-slide-up cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/hardware-settings')}>
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-wa-light-text dark:text-wa-dark-text mb-1">
                    Hardware
                  </h3>
                  <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    Advanced settings
                  </p>
                </div>
              </MaterialCard>
            </div>
          </div>

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