import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useContext, useState } from 'react';
import { WebSocketProvider, WebSocketContext } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConnectionGuard } from './components/ConnectionGuard';
import { DataLoader } from './components/DataLoader';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationProvider } from './components/NotificationSystem';
import { PWANotificationSystem } from './components/PWANotificationSystem';
import DeviceDiscovery from './components/DeviceDiscovery';
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

  if (!wsContext?.isConnected && showDiscovery) {
    return <DeviceDiscovery onConnect={() => setShowDiscovery(false)} />;
  }

  return (
    <div className="App">
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

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <WebSocketProvider>
            <Router basename={basename}>
              <AppContent />
            </Router>
          </WebSocketProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;