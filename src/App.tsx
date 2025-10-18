import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useContext, useEffect } from 'react';
import { WebSocketProvider, WebSocketContext } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { SimpleConnectionGuard } from './components/SimpleConnectionGuard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationProvider } from './components/NotificationSystem';
import { PWANotificationSystem } from './components/PWANotificationSystem';
import { ToastProvider } from './components/ToastProvider';
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
const Monitor = lazy(() => import('./pages/Monitor').then(module => ({ default: module.Monitor })));
const Devices = lazy(() => import('./pages/Devices').then(module => ({ default: module.Devices })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const HardwareSettings = lazy(() => import('./pages/HardwareSettings').then(module => ({ default: module.HardwareSettings })));

/**
 * App Content Component
 * 
 * Handles device discovery and connection status display
 * @returns JSX.Element - The app content with device discovery or main app
 */
const AppContent: React.FC = () => {
  const wsContext = useContext(WebSocketContext);
  const { isOnline } = useNetworkStatus();

  // Initialize Android permissions
  useEffect(() => {
    const initializePermissions = async () => {
      if (Capacitor.getPlatform() === 'android') {
        const granted = await AndroidPermissions.requestAllPermissions();
        console.log('Android permissions granted:', granted);
      }
    };

    initializePermissions();
  }, []);

  return (
    <div className="App">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-red-500 text-white text-center py-2 px-4">
          <span className="text-sm font-medium">No internet connection</span>
        </div>
      )}

      {/* Device Disconnected Banner */}
      {wsContext && !wsContext.isConnected && (
        <div className="bg-orange-500 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-medium">Device Disconnected</span>
            <button
              onClick={() => window.location.href = '/devices'}
              className="text-sm underline hover:no-underline"
            >
              Connect Now
            </button>
          </div>
        </div>
      )}


      {/* Main App Content */}
      <SimpleConnectionGuard>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/monitor" element={<Monitor />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/hardware-settings" element={<HardwareSettings />} />
          </Routes>
        </Suspense>
      </SimpleConnectionGuard>
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