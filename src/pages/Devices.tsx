import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/useWebSocket';
import { BottomNavigation } from '../components/BottomNavigation';
import { useToast } from '../components/useToast';
import { 
  ArrowLeft, 
  Wifi, 
  WifiOff, 
  Loader2, 
  Settings,
  Smartphone,
  Monitor,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { discoverEsp32Devices, testConnection } from '../utils/connectionTest';

/**
 * Devices Page - WhatsApp-Style Device Management
 * 
 * Features:
 * - Device connection management
 * - Connection status display
 * - Device discovery and selection
 * - WhatsApp-inspired UI design
 * - Haptic feedback for interactions
 */

export const Devices: React.FC = () => {
  const navigate = useNavigate();
  const { 
    deviceIP, 
    isConnected, 
    isReconnecting, 
    connect, 
    disconnect, 
    lastError
  } = useWebSocket();
  const toast = useToast();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<string[]>([]);
  const [manualIP, setManualIP] = useState('');
  const [showDeviceList, setShowDeviceList] = useState(false);

  /**
   * Handle device connection
   */
  const handleConnect = async () => {
    if (!deviceIP) {
      // Navigate to device discovery or show modal
      toast.showToast({
        type: 'warning',
        message: 'No device IP configured. Please select a device first.',
      });
      return;
    }

    setIsConnecting(true);
    try {
      connect(deviceIP);
      toast.showToast({
        type: 'success',
        message: 'Connected to device successfully',
      });
    } catch {
      toast.showToast({
        type: 'error',
        message: 'Failed to connect to device',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Handle device disconnection
   */
  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.showToast({
        type: 'info',
        message: 'Disconnected from device',
      });
    } catch {
      toast.showToast({
        type: 'error',
        message: 'Failed to disconnect from device',
      });
    }
  };

  /**
   * Scan for ESP32 devices on the network
   */
  const handleScanForDevices = async () => {
    setIsScanning(true);
    setDiscoveredDevices([]);
    setShowDeviceList(false);
    
    try {
      toast.showToast({
        type: 'info',
        message: 'Scanning for ESP32 devices...',
      });
      
      const devices = await discoverEsp32Devices();
      setDiscoveredDevices(devices);
      
      if (devices.length > 0) {
        setShowDeviceList(true);
        toast.showToast({
          type: 'success',
          message: `Found ${devices.length} ESP32 device(s)`,
        });
      } else {
        toast.showToast({
          type: 'warning',
          message: 'No ESP32 devices found on network',
        });
      }
    } catch {
      toast.showToast({
        type: 'error',
        message: 'Failed to scan for devices',
      });
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Connect to a specific device
   */
  const handleConnectToDevice = async (deviceIP: string) => {
    setIsConnecting(true);
    try {
      connect(deviceIP);
      toast.showToast({
        type: 'success',
        message: `Connecting to ${deviceIP}`,
      });
      setShowDeviceList(false);
    } catch {
      toast.showToast({
        type: 'error',
        message: 'Failed to connect to device',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Test connection to a specific IP
   */
  const handleTestConnection = async (ip: string) => {
    try {
      const result = await testConnection(ip, 81);
      if (result.success) {
        toast.showToast({
          type: 'success',
          message: `Connection test successful for ${ip}`,
        });
        return true;
      } else {
        toast.showToast({
          type: 'error',
          message: `Connection test failed for ${ip}`,
        });
        return false;
      }
    } catch {
      toast.showToast({
        type: 'error',
        message: `Connection test failed for ${ip}`,
      });
      return false;
    }
  };

  /**
   * Get connection status color
   */
  const getConnectionStatusColor = () => {
    if (isConnected) return 'text-green-500';
    if (isReconnecting) return 'text-yellow-500';
    return 'text-red-500';
  };

  /**
   * Get connection status text
   */
  const getConnectionStatusText = () => {
    if (isConnected) return 'Connected';
    if (isReconnecting) return 'Reconnecting...';
    return 'Disconnected';
  };

  /**
   * Get connection status icon
   */
  const getConnectionStatusIcon = () => {
    if (isConnected) return <CheckCircle className="w-5 h-5" />;
    if (isReconnecting) return <Loader2 className="w-5 h-5 animate-spin" />;
    return <XCircle className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-wa-light-bg dark:bg-wa-dark-bg">
      {/* WhatsApp-Style Header */}
      <header className="wa-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="wa-header-button"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="wa-avatar">
            <Wifi className="w-6 h-6" />
          </div>
          <div>
            <h1 className="wa-header-title">Devices</h1>
            <p className="text-sm opacity-90">
              {isConnected ? 'Connected' : 'Disconnected'} • Manage connections
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

      {/* Main Content */}
      <main className="px-4 py-4 pb-20">
        {/* Connection Status Card */}
        <div className="mb-6">
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg p-4 shadow-wa">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-wa-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                Connection Status
              </h2>
              <div className={`flex items-center gap-2 ${getConnectionStatusColor()}`}>
                {getConnectionStatusIcon()}
                <span className="text-sm font-medium">
                  {getConnectionStatusText()}
                </span>
              </div>
            </div>

            {deviceIP && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-wa-sm text-wa-light-text dark:text-wa-dark-text opacity-75">
                  <Smartphone className="w-4 h-4" />
                  <span>Device IP: {deviceIP}</span>
                </div>
              </div>
            )}

            {lastError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-wa">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Connection Error</span>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {lastError}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || isReconnecting}
                  className="flex-1 bg-wa-teal-500 hover:bg-wa-teal-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-wa font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4" />
                      Connect
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-wa font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <WifiOff className="w-4 h-4" />
                  Disconnect
                </button>
              )}

              <button
                onClick={handleScanForDevices}
                disabled={isScanning}
                className="px-4 py-2 border border-wa-light-border dark:border-wa-dark-border text-wa-light-text dark:text-wa-dark-text rounded-wa font-medium hover:bg-wa-light-panel dark:hover:bg-wa-dark-panel transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Scan for Devices
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Discovered Devices */}
        {showDeviceList && discoveredDevices.length > 0 && (
          <div className="mb-6">
            <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg p-4 shadow-wa">
              <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text mb-3">
                Discovered ESP32 Devices
              </h3>
              <div className="space-y-2">
                {discoveredDevices.map((deviceIP) => (
                  <div
                    key={deviceIP}
                    className="flex items-center justify-between p-3 bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa border border-wa-light-border dark:border-wa-dark-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-wa-teal-500 rounded-full flex items-center justify-center">
                        <Wifi className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text">
                          ESP32 Water Tank Controller
                        </div>
                        <div className="text-xs text-wa-light-text dark:text-wa-dark-text opacity-75">
                          {deviceIP}:81
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTestConnection(deviceIP)}
                        className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-wa transition-colors"
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleConnectToDevice(deviceIP)}
                        disabled={isConnecting}
                        className="px-3 py-1 text-xs bg-wa-teal-500 hover:bg-wa-teal-600 text-white rounded-wa transition-colors disabled:opacity-50"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manual IP Input */}
        <div className="mb-6">
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg p-4 shadow-wa">
            <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text mb-3">
              Manual Connection
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                  ESP32 IP Address
                </label>
                <input
                  type="text"
                  value={manualIP}
                  onChange={(e) => setManualIP(e.target.value)}
                  placeholder="192.168.1.100"
                  className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTestConnection(manualIP)}
                  disabled={!manualIP.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-wa font-medium transition-colors"
                >
                  Test Connection
                </button>
                <button
                  onClick={() => handleConnectToDevice(manualIP)}
                  disabled={!manualIP.trim() || isConnecting}
                  className="flex-1 px-4 py-2 bg-wa-teal-500 hover:bg-wa-teal-600 disabled:bg-gray-400 text-white rounded-wa font-medium transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Device Information */}
        {isConnected && (
          <div className="mb-6">
            <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg p-4 shadow-wa">
              <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text mb-3">
                Device Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-wa-sm text-wa-light-text dark:text-wa-dark-text">
                  <Monitor className="w-4 h-4" />
                  <span>Type: ESP32 Water Tank Controller</span>
                </div>
                <div className="flex items-center gap-2 text-wa-sm text-wa-light-text dark:text-wa-dark-text">
                  <Zap className="w-4 h-4" />
                  <span>Status: Active</span>
                </div>
                <div className="flex items-center gap-2 text-wa-sm text-wa-light-text dark:text-wa-dark-text">
                  <Wifi className="w-4 h-4" />
                  <span>Signal: Strong</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-wa-light-panel dark:bg-wa-dark-panel p-4 rounded-wa-lg shadow-wa hover:shadow-wa-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wa-teal-500 rounded-full flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text">
                    View Dashboard
                  </div>
                  <div className="text-xs text-wa-light-text dark:text-wa-dark-text opacity-75">
                    Monitor tanks
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="bg-wa-light-panel dark:bg-wa-dark-panel p-4 rounded-wa-lg shadow-wa hover:shadow-wa-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wa-teal-500 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text">
                    Settings
                  </div>
                  <div className="text-xs text-wa-light-text dark:text-wa-dark-text opacity-75">
                    Configure system
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Platform Info */}
        {Capacitor.isNativePlatform() && (
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg p-4 shadow-wa">
            <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text mb-3">
              Platform Information
            </h3>
            <div className="space-y-2 text-wa-sm text-wa-light-text dark:text-wa-dark-text opacity-75">
              <div>Platform: {Capacitor.getPlatform()}</div>
              <div>Native: {Capacitor.isNativePlatform() ? 'Yes' : 'No'}</div>
              <div>App Version: 2.0.0</div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Devices;
