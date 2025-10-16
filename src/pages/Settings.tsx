import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/useWebSocket';
import { usePageData } from '../hooks/usePageData';
import { useTheme } from '../context/ThemeContext';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { BottomNavigation } from '../components/BottomNavigation';
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Info, 
  Droplets,
  Wifi,
  Bell,
  Moon,
  Sun,
  Smartphone
} from 'lucide-react';

/**
 * WhatsApp-Style Settings Page Component
 * 
 * Features:
 * - WhatsApp-inspired settings list design
 * - Profile-like header section
 * - Grouped settings with icons
 * - Native-feeling switches and toggles
 * - Smooth animations and transitions
 * - Haptic feedback for interactions
 */

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useWebSocket();
  const { theme, toggleTheme } = useTheme();
  usePageData();
  




  return (
    <div className="min-h-screen bg-wa-light-bg dark:bg-wa-dark-bg">
      {/* WhatsApp-Style Header */}
      <header className="wa-header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="wa-header-button"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="wa-avatar large">
            <SettingsIcon className="w-6 h-6" />
          </div>
          
          <div>
            <h1 className="wa-header-title">Settings</h1>
            <p className="text-sm opacity-90">
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </div>

      </header>


      {/* Main Content */}
      <main className="pb-20">
        {/* Profile Section */}
        <div className="bg-wa-light-panel dark:bg-wa-dark-panel border-b border-wa-light-border dark:border-wa-dark-border">
          <div className="px-4 py-6">
            <div className="flex items-center gap-4">
              <div className="wa-avatar large">
                <Droplets className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-wa-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                  Smart Water Tank
                </h2>
                <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  by EmptyIdea • App Settings & Configuration
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-wa-xs text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    {isConnected ? 'Connected to ESP32' : 'Not connected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-1">
          {/* Hardware Settings Notice */}
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel">
            <div className="wa-chat-item">
              <div className="wa-avatar">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text">
                  Hardware Settings
                </h3>
                <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  Configure motors, sensors, and system topology
                </p>
              </div>
              <div className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                Go to Devices →
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel">
            <div className="px-4 py-3 border-b border-wa-light-border dark:border-wa-dark-border">
              <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                App Settings
              </h3>
            </div>
            
            <div className="wa-chat-item">
              <div className="wa-avatar">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                  Dark Mode
                </h4>
                <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  Switch between light and dark themes
                </p>
              </div>
              <ToggleSwitch
                checked={theme === 'dark'}
                onChange={toggleTheme}
                label=""
                color="purple"
              />
            </div>

            <div className="wa-chat-item">
              <div className="wa-avatar">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                  Notifications
                </h4>
                <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  Enable push notifications
                </p>
              </div>
              <ToggleSwitch
                checked={true}
                onChange={() => {}}
                label=""
                color="blue"
              />
            </div>

            <div className="wa-chat-item">
              <div className="wa-avatar">
                <Wifi className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                  Auto-Connect
                </h4>
                <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  Automatically connect to saved devices
                </p>
              </div>
              <ToggleSwitch
                checked={true}
                onChange={() => {}}
                label=""
                color="green"
              />
            </div>
          </div>


          {/* About Section */}
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel">
            <div className="px-4 py-3 border-b border-wa-light-border dark:border-wa-dark-border">
              <h3 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text flex items-center gap-2">
                <Info className="w-4 h-4" />
                About
              </h3>
            </div>
            
            <div className="wa-chat-item">
              <div className="wa-avatar">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                  App Version
                </h4>
                <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  Smart Water Tank v2.0 by EmptyIdea
                </p>
              </div>
              <span className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                v2.0.0
              </span>
            </div>

            <div className="wa-chat-item">
              <div className="wa-avatar">
                <Wifi className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                  Device Status
                </h4>
                <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  {isConnected ? 'Connected to ESP32' : 'Not connected'}
                </p>
              </div>
              <div className={`wa-status-dot ${isConnected ? 'online' : 'offline'}`} />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};