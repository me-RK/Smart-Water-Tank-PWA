import React, { useState, useEffect, useCallback } from 'react';
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
  Monitor,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { discoverEsp32Devices, getNetworkInfo, getLocalIP } from '../utils/connectionTest';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface NetworkDetails {
  // Device Info
  userAgent: string;
  platform: string;
  language: string;
  online: boolean;
  connectionType: string;
  
  // Current App Info
  currentUrl: string;
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  
  // Network Configuration
  localIP: string | null;
  network: string | null;
  gateway: string | null;
  subnet: string | null;
  scanRange: string | null;
  
  // Connection Details
  effectiveType: string;
  downlink: string | number;
  rtt: string | number;
  saveData: boolean;
  
  // Capacitor Info
  capacitorPlatform: string;
  isNative: boolean;
  appVersion: string;
}

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
    connect,
    disconnect,
    appState
  } = useWebSocket();
  const toast = useToast();
  const { connectionType } = useNetworkStatus();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastConnectedDevice, setLastConnectedDevice] = useState<string | null>(null);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [networkDetails, setNetworkDetails] = useState<NetworkDetails | null>(null);
  const [isLoadingNetworkInfo, setIsLoadingNetworkInfo] = useState(false);
  const [showManualConnection, setShowManualConnection] = useState(false);
  const [manualIP, setManualIP] = useState('');

  /**
   * Connect to a specific device
   */
  const handleConnectToDevice = useCallback(async (deviceIP: string) => {
    setIsConnecting(true);
    try {
      // Store as last connected device
      localStorage.setItem('lastConnectedDevice', deviceIP);
      setLastConnectedDevice(deviceIP);
      
      // Call the WebSocket connect function
      connect(deviceIP);
      
      toast.showToast({
        type: 'success',
        message: `Connecting to ${deviceIP}`,
      });
      
      // Don't reset isConnecting here - let the WebSocket connection state handle it
      // The connection state will be updated by the WebSocket context
    } catch (error) {
      console.error('Connection failed:', error);
      setIsConnecting(false);
      toast.showToast({
        type: 'error',
        message: 'Failed to connect to device',
      });
    }
  }, [connect, toast]);

  // Load last connected device from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('lastConnectedDevice');
    if (stored) {
      setLastConnectedDevice(stored);
      setManualIP(stored);
    }
  }, []);

  // Auto-connect to last device on startup if not connected
  useEffect(() => {
    if (!isConnected && lastConnectedDevice && !isConnecting && !deviceIP) {
      console.log('Auto-connecting to last device:', lastConnectedDevice);
      handleConnectToDevice(lastConnectedDevice);
    }
  }, [lastConnectedDevice, isConnected, isConnecting, deviceIP, handleConnectToDevice]);

  // Stop scanning when connected
  useEffect(() => {
    if (isConnected) {
      setIsScanning(false);
    }
  }, [isConnected]);

  // Monitor WebSocket connection state to reset local isConnecting state
  useEffect(() => {
    if (isConnected || appState.error) {
      setIsConnecting(false);
    }
  }, [isConnected, appState.error]);


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
   * Handle manual connection
   */
  const handleManualConnect = async () => {
    if (!manualIP.trim()) {
      toast.showToast({
        type: 'error',
        message: 'Please enter a valid IP address',
      });
      return;
    }

    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(manualIP.trim())) {
      toast.showToast({
        type: 'error',
        message: 'Please enter a valid IP address format',
      });
      return;
    }

    try {
      await handleConnectToDevice(manualIP.trim());
      setShowManualConnection(false);
    } catch (error) {
      console.error('Manual connection failed:', error);
      toast.showToast({
        type: 'error',
        message: 'Failed to connect to device',
      });
    }
  };

  /**
   * Gather comprehensive network information
   */
  const gatherNetworkInfo = async () => {
    setIsLoadingNetworkInfo(true);
    try {
      // Get network configuration
      const networkConfig = await getNetworkInfo();
      const localIP = await getLocalIP();
      
      // Get browser/device information
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      const language = navigator.language;
      const online = navigator.onLine;
      
      // Get connection info if available
      const connection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } }).connection || 
                        (navigator as Navigator & { mozConnection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } }).mozConnection || 
                        (navigator as Navigator & { webkitConnection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } }).webkitConnection;
      
      // Current URL details
      const currentUrl = window.location.href;
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port || (protocol === 'https:' ? '443' : '80');
      const pathname = window.location.pathname;

      const details = {
        // Device Info
        userAgent,
        platform,
        language,
        online,
        connectionType,
        
        // Current App Info
        currentUrl,
        protocol,
        hostname,
        port,
        pathname,
        
        // Network Configuration
        localIP,
        network: networkConfig.network,
        gateway: networkConfig.gateway,
        subnet: networkConfig.subnet,
        scanRange: networkConfig.scanRange,
        
        // Connection Details
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 'unknown',
        rtt: connection?.rtt || 'unknown',
        saveData: connection?.saveData || false,
        
        // Capacitor Info
        capacitorPlatform: Capacitor.getPlatform(),
        isNative: Capacitor.isNativePlatform(),
        appVersion: '2.0.0'
      };

      setNetworkDetails(details);
    } catch (error) {
      console.error('Error gathering network info:', error);
      toast.showToast({
        type: 'error',
        message: 'Failed to gather network information',
      });
    } finally {
      setIsLoadingNetworkInfo(false);
    }
  };

  /**
   * Scan for ESP32 devices on the network
   */
  const handleScanForDevices = async () => {
    setIsScanning(true);
    
    try {
      toast.showToast({
        type: 'info',
        message: 'Scanning for ESP32 devices...',
      });
      
      const devices = await discoverEsp32Devices();
      
      if (devices.length > 0) {
        // Auto-connect to the first found device
        const firstDevice = devices[0];
        toast.showToast({
          type: 'success',
          message: `Found ${devices.length} ESP32 device(s). Connecting to ${firstDevice}...`,
        });
        handleConnectToDevice(firstDevice);
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
              {isConnected ? 'Connected' : 'Disconnected'} • by EmptyIdea
            </p>
          </div>
        </div>

      </header>

      {/* Main Content */}
      <main className="container-responsive fluid-padding page-content">
        {/* Connected Devices */}
        {isConnected && deviceIP ? (
          <div className="fluid-margin">
            <h2 className="text-responsive-lg font-semibold text-wa-light-text dark:text-wa-dark-text fluid-margin">
              Connected Devices
            </h2>
            <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg p-4 shadow-wa">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text">
                      ESP32 Water Tank Controller
                    </h3>
                    <p className="text-wa-sm text-wa-light-text dark:text-wa-dark-text opacity-75">
                      {deviceIP}:81
                    </p>
                  </div>
                </div>
                <div className="header-buttons">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium hidden xs:inline">Connected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate('/hardware-settings')}
                      className="touch-responsive-sm px-2 sm:px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-wa text-sm font-medium transition-colors"
                      title="Hardware Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="touch-responsive-sm px-2 sm:px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-wa text-sm font-medium transition-colors"
                    >
                      <span className="hidden sm:inline">Disconnect</span>
                      <span className="sm:hidden">DC</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h2 className="text-wa-lg font-semibold text-wa-light-text dark:text-wa-dark-text mb-4">
              Connected Devices
            </h2>
            <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg p-6 shadow-wa text-center">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text mb-2">
                No Device Connected Yet
              </h3>
              <p className="text-wa-sm text-wa-light-text dark:text-wa-dark-text opacity-75 mb-4">
                {lastConnectedDevice 
                  ? `Last connected to: ${lastConnectedDevice}`
                  : 'Use the scan button below to find and connect to your ESP32 device'
                }
              </p>
              {lastConnectedDevice && (
                <button
                  onClick={() => handleConnectToDevice(lastConnectedDevice)}
                  disabled={isConnecting}
                  className="bg-wa-teal-500 hover:bg-wa-teal-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-wa font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4" />
                      Reconnect to {lastConnectedDevice}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}


        {/* Quick Actions */}
        <div className="fluid-margin">
          <h3 className="text-responsive-base font-semibold text-wa-light-text dark:text-wa-dark-text fluid-margin-sm">
            Quick Actions
          </h3>
          <div className="button-grid">
            <button
              onClick={handleScanForDevices}
              disabled={isScanning || isConnected}
              className="bg-wa-light-panel dark:bg-wa-dark-panel p-4 rounded-wa-lg shadow-wa hover:shadow-wa-md transition-shadow disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wa-teal-500 rounded-full flex items-center justify-center">
                  {isScanning ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="text-left">
                  <div className="text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text">
                    {isScanning ? 'Scanning...' : 'Scan Network'}
                  </div>
                  <div className="text-xs text-wa-light-text dark:text-wa-dark-text opacity-75">
                    Find ESP32 devices
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowManualConnection(true)}
              disabled={isConnected}
              className="bg-wa-light-panel dark:bg-wa-dark-panel p-4 rounded-wa-lg shadow-wa hover:shadow-wa-md transition-shadow disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wa-teal-500 rounded-full flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text">
                    Manual Connect
                  </div>
                  <div className="text-xs text-wa-light-text dark:text-wa-dark-text opacity-75">
                    Enter IP address
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={async () => {
                setShowNetworkInfo(true);
                await gatherNetworkInfo();
              }}
              className="bg-wa-light-panel dark:bg-wa-dark-panel p-4 rounded-wa-lg shadow-wa hover:shadow-wa-md transition-shadow col-span-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-wa-teal-500 rounded-full flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text">
                    Network Info
                  </div>
                  <div className="text-xs text-wa-light-text dark:text-wa-dark-text opacity-75">
                    View network details
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Network Information Overlay */}
      {showNetworkInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg p-6 shadow-wa-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-wa-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                Network Information
              </h3>
              <button
                onClick={() => setShowNetworkInfo(false)}
                className="wa-header-button"
                aria-label="Close"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            {isLoadingNetworkInfo ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-wa-teal-500" />
                <span className="ml-2 text-wa-light-text dark:text-wa-dark-text">Gathering network info...</span>
              </div>
            ) : networkDetails ? (
              <div className="space-y-4">
                {/* Device & Platform Info */}
                <div className="p-3 bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa border border-wa-light-border dark:border-wa-dark-border">
                  <h4 className="text-wa-sm font-semibold text-wa-light-text dark:text-wa-dark-text mb-2 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Device & Platform
                  </h4>
                  <div className="space-y-1 text-wa-sm text-wa-light-text dark:text-wa-dark-text opacity-75">
                    <div>Platform: {networkDetails.capacitorPlatform}</div>
                    <div>Native: {networkDetails.isNative ? 'Yes' : 'No'}</div>
                    <div>App Version: {networkDetails.appVersion}</div>
                    <div>Language: {networkDetails.language}</div>
                  </div>
                </div>

                {/* WiFi & Network Connection */}
                <div className="p-3 bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa border border-wa-light-border dark:border-wa-dark-border">
                  <h4 className="text-wa-sm font-semibold text-wa-light-text dark:text-wa-dark-text mb-2 flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    WiFi & Network
                  </h4>
                  <div className="space-y-1 text-wa-sm text-wa-light-text dark:text-wa-dark-text opacity-75">
                    <div>Status: <span className={networkDetails.online ? 'text-green-500' : 'text-red-500'}>{networkDetails.online ? 'Online' : 'Offline'}</span></div>
                    <div>Connection Type: {networkDetails.connectionType}</div>
                    <div>Effective Type: {networkDetails.effectiveType}</div>
                    {networkDetails.downlink !== 'unknown' && <div>Downlink: {networkDetails.downlink} Mbps</div>}
                    {networkDetails.rtt !== 'unknown' && <div>Round Trip Time: {networkDetails.rtt} ms</div>}
                    <div>Data Saver: {networkDetails.saveData ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>

                {/* Local Network Configuration */}
                <div className="p-3 bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa border border-wa-light-border dark:border-wa-dark-border">
                  <h4 className="text-wa-sm font-semibold text-wa-light-text dark:text-wa-dark-text mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Local Network
                  </h4>
                  <div className="space-y-1 text-wa-sm text-wa-light-text dark:text-wa-dark-text opacity-75">
                    {networkDetails.localIP ? (
                      <>
                        <div>Device IP: <span className="text-wa-teal-500 font-mono">{networkDetails.localIP}</span></div>
                        {networkDetails.gateway && <div>Gateway: <span className="font-mono">{networkDetails.gateway}</span></div>}
                        {networkDetails.network && <div>Network: <span className="font-mono">{networkDetails.network}</span></div>}
                        {networkDetails.subnet && <div>Subnet: <span className="font-mono">{networkDetails.subnet}</span></div>}
                        {networkDetails.scanRange && <div>Scan Range: <span className="font-mono">{networkDetails.scanRange}</span></div>}
                      </>
                    ) : (
                      <div className="text-orange-500">Unable to detect local IP</div>
                    )}
                  </div>
                </div>

                {/* App Connection Status */}
                <div className="p-3 bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa border border-wa-light-border dark:border-wa-dark-border">
                  <h4 className="text-wa-sm font-semibold text-wa-light-text dark:text-wa-dark-text mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    ESP32 Connection
                  </h4>
                  <div className="space-y-1 text-wa-sm text-wa-light-text dark:text-wa-dark-text opacity-75">
                    <div>Status: <span className={isConnected ? 'text-green-500' : 'text-red-500'}>{isConnected ? 'Connected' : 'Disconnected'}</span></div>
                    {deviceIP && <div>Device IP: <span className="text-wa-teal-500 font-mono">{deviceIP}</span></div>}
                    {lastConnectedDevice && <div>Last Connected: <span className="font-mono">{lastConnectedDevice}</span></div>}
                    <div>WebSocket Port: 81</div>
                    <div>Protocol: HTTP (ESP32 compatible)</div>
                  </div>
                </div>

                {/* Current App Details */}
                <div className="p-3 bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa border border-wa-light-border dark:border-wa-dark-border">
                  <h4 className="text-wa-sm font-semibold text-wa-light-text dark:text-wa-dark-text mb-2 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    App Details
                  </h4>
                  <div className="space-y-1 text-wa-sm text-wa-light-text dark:text-wa-dark-text opacity-75">
                    <div>URL: <span className="font-mono text-xs break-all">{networkDetails.currentUrl}</span></div>
                    <div>Protocol: {networkDetails.protocol}</div>
                    <div>Hostname: {networkDetails.hostname}</div>
                    <div>Port: {networkDetails.port}</div>
                    <div>Path: {networkDetails.pathname}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-wa-light-text dark:text-wa-dark-text opacity-75">
                  Failed to load network information
                </div>
              </div>
            )}

            <div className="modal-buttons">
              <button
                onClick={() => setShowNetworkInfo(false)}
                className="bg-wa-teal-500 hover:bg-wa-teal-600 text-white rounded-wa font-medium transition-colors"
              >
                Close
              </button>
              {networkDetails && (
                <button
                  onClick={gatherNetworkInfo}
                  disabled={isLoadingNetworkInfo}
                  className="bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border text-wa-light-text dark:text-wa-dark-text rounded-wa font-medium hover:bg-wa-light-panel dark:hover:bg-wa-dark-panel transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoadingNetworkInfo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Reload</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Connection Overlay */}
      {showManualConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg p-6 shadow-wa-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-wa-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                Manual Connection
              </h3>
              <button
                onClick={() => setShowManualConnection(false)}
                className="wa-header-button"
                aria-label="Close"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
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
                  autoFocus
                />
                <p className="text-xs text-wa-light-text dark:text-wa-dark-text opacity-75 mt-1">
                  Enter the IP address of your ESP32 device
                </p>
              </div>

              {/* Connection Info */}
              <div className="p-3 bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa border border-wa-light-border dark:border-wa-dark-border">
                <h4 className="text-wa-sm font-semibold text-wa-light-text dark:text-wa-dark-text mb-2">
                  Connection Details
                </h4>
                <div className="space-y-1 text-wa-sm text-wa-light-text dark:text-wa-dark-text opacity-75">
                  <div>Protocol: HTTP (ESP32 compatible)</div>
                  <div>Port: 81 (WebSocket)</div>
                  <div>Connection Type: Real-time WebSocket</div>
                </div>
              </div>

              {/* Last Connected Device Info */}
              {lastConnectedDevice && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-wa">
                  <h4 className="text-wa-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                    Last Connected Device
                  </h4>
                  <div className="text-wa-sm text-wa-light-text dark:text-wa-dark-text opacity-75">
                    <div>IP: <span className="font-mono">{lastConnectedDevice}</span></div>
                    <button
                      onClick={() => setManualIP(lastConnectedDevice)}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-xs mt-1"
                    >
                      Use this IP
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-buttons">
              <button
                onClick={() => setShowManualConnection(false)}
                className="bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border text-wa-light-text dark:text-wa-dark-text rounded-wa font-medium hover:bg-wa-light-panel dark:hover:bg-wa-dark-panel transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleManualConnect}
                disabled={!manualIP.trim() || isConnecting}
                className="bg-wa-teal-500 hover:bg-wa-teal-600 disabled:bg-gray-400 text-white rounded-wa font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Connecting...</span>
                    <span className="sm:hidden">Connecting</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span className="hidden sm:inline">Connect</span>
                    <span className="sm:hidden">Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Devices;
