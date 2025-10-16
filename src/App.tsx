import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useContext, useState, useEffect } from 'react';
import { WebSocketProvider, WebSocketContext } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConnectionGuard } from './components/ConnectionGuard';
import { DataLoader } from './components/DataLoader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationProvider } from './components/NotificationSystem';
import { PWANotificationSystem } from './components/PWANotificationSystem';
import { ToastProvider } from './components/ToastProvider';
import DeviceDiscovery from './components/DeviceDiscovery';
import { ESP32Connection } from './components/ESP32Connection';
import { AndroidPermissions } from './utils/androidPermissions';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard, KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';
import { useAppLifecycle } from './hooks/useAppLifecycle';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import './App.css';

/**
 * Smart Water Tank PWA - Main Application Component
 * 
 * This is the root component that sets up the application structure with:
 * - React Router for navigation
 * - WebSocket context for ESP32 communication
 * - Theme context for dark/light mode
 * - Error boundaries for graceful error handling
 * - Lazy loading for optimal performance
 * - PWA support and notifications
 * 
 * Architecture:
 * - Provider pattern for global state management
 * - Lazy loading for code splitting
 * - Suspense boundaries for loading states
 * - Connection guards for device connectivity
 */

// Lazy load pages for better performance and code splitting
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));

/**
 * App Content Component
 * 
 * Handles device discovery and connection status display
 * @returns JSX.Element - The app content with device discovery or main app
 */
const AppContent: React.FC = () => {
  const wsContext = useContext(WebSocketContext);
  const [showDiscovery, setShowDiscovery] = useState(!wsContext?.deviceIP);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showESP32Connection, setShowESP32Connection] = useState(false);
  const { isOnline } = useNetworkStatus();

  // Initialize Android permissions
  useEffect(() => {
    const initializePermissions = async () => {
      if (Capacitor.getPlatform() === 'android') {
        const granted = await AndroidPermissions.requestAllPermissions();
        setPermissionsGranted(granted);
        console.log('Android permissions granted:', granted);
      } else {
        setPermissionsGranted(true);
      }
    };

    initializePermissions();
  }, []);

  // Show ESP32 connection component for Android
  if (Capacitor.getPlatform() === 'android' && showESP32Connection) {
    return <ESP32Connection />;
  }

  if (!wsContext?.isConnected && showDiscovery) {
    return <DeviceDiscovery onConnect={() => setShowDiscovery(false)} />;
  }

  return (
    <div className="App">
      {/* Debug Info for Android */}
      {Capacitor.getPlatform() === 'android' && (
        <div className="bg-gray-100 text-gray-800 text-center py-1 px-4 text-xs">
          <span>Platform: {Capacitor.getPlatform()} | Native: {Capacitor.isNativePlatform() ? 'Yes' : 'No'} | Permissions: {permissionsGranted ? 'Granted' : 'Pending'}</span>
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-red-500 text-white text-center py-2 px-4">
          <span className="text-sm font-medium">No internet connection</span>
        </div>
      )}

      {/* Connection Status Header */}
      {wsContext?.deviceIP && (
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Smart Water Tank Manager
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  wsContext.isConnected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {wsContext.isConnected ? '✓ Connected' : '✗ Disconnected'}
                </span>
                {wsContext.isReconnecting && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Reconnecting...
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowDiscovery(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Change Device
              </button>
              {Capacitor.getPlatform() === 'android' && (
                <button
                  onClick={() => setShowESP32Connection(true)}
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  ESP32 Manager
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Error Banner */}
      {wsContext?.lastError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {wsContext.lastError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main App Content */}
      <ConnectionGuard>
        <DataLoader>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </DataLoader>
      </ConnectionGuard>
      <PWANotificationSystem />
    </div>
  );
};

/**
 * Main App Component
 * 
 * Renders the application with all necessary providers and routing
 * @returns JSX.Element - The complete application structure
 */
function App() {
  // Determine basename based on environment
  // For GitHub Pages: "/smart-tank-pwa"
  // For local development and other hosting: "/"
  const basename = import.meta.env.PROD && import.meta.env.VITE_GITHUB_PAGES === 'true' 
    ? '/smart-tank-pwa' 
    : '/';

  // Initialize Capacitor features
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Hide splash screen after app loads
      SplashScreen.hide();

      // Configure status bar with WhatsApp-style colors
      StatusBar.setStyle({ style: Style.Light });
      StatusBar.setBackgroundColor({ color: '#128c7e' });

      // Configure keyboard
      Keyboard.setResizeMode({ mode: KeyboardResize.Body });
      Keyboard.setStyle({ style: KeyboardStyle.Dark });

      // Safe area is handled by CSS env() variables
      console.log('Safe area handled by CSS');
    }
  }, []);

  // App lifecycle management
  useAppLifecycle(
    () => {
      // On app pause - reduce WebSocket heartbeat
      console.log('App entering background');
    },
    () => {
      // On app resume - restore normal operation
      console.log('App entering foreground');
    }
  );

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <NotificationProvider>
            <WebSocketProvider>
              <Router basename={basename}>
                <AppContent />
              </Router>
            </WebSocketProvider>
          </NotificationProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;