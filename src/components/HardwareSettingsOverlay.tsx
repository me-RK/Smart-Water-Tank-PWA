import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/useWebSocket';
import { useToast } from './useToast';
import { ToggleSwitch } from './ToggleSwitch';
import { 
  XCircle, 
  Settings as SettingsIcon, 
  Monitor, 
  Zap, 
  Droplets,
  Shield,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  getMotorConfigurationDetails
} from '../constants/motorConfigurations';
import type { MotorConfigurationType } from '../constants/motorConfigurations';

interface HardwareSettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  deviceIP: string;
}

/**
 * Hardware Settings Overlay Component
 * 
 * Features:
 * - Device-specific hardware configuration
 * - Motor and sensor settings
 * - Topology configuration
 * - WhatsApp-style UI design
 * - Real-time settings updates
 */
export const HardwareSettingsOverlay: React.FC<HardwareSettingsOverlayProps> = ({
  isOpen,
  onClose,
  deviceIP
}) => {
  const { appState, sendMessage, isConnected } = useWebSocket();
  const toast = useToast();
  
  const [settings, setSettings] = useState(appState.systemSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Update local settings when app state changes
  useEffect(() => {
    setSettings(appState.systemSettings);
    setHasChanges(false);
  }, [appState.systemSettings]);

  // Auto-configure settings when topology changes
  useEffect(() => {
    const configDetails = getMotorConfigurationDetails(settings.topologySettings.systemTopology as MotorConfigurationType);
    const uiBehavior = configDetails.uiBehavior;
    
    setSettings(prev => ({
      ...prev,
      sensors: {
        lowerTankA: uiBehavior.showLowerTankA ? uiBehavior.defaultLowerTankA : false,
        lowerTankB: uiBehavior.showLowerTankB ? uiBehavior.defaultLowerTankB : false,
        upperTankA: uiBehavior.showUpperTankA ? uiBehavior.defaultUpperTankA : false,
        upperTankB: uiBehavior.showUpperTankB ? uiBehavior.defaultUpperTankB : false
      },
      motorSettings: {
        ...prev.motorSettings,
        motor1Enabled: uiBehavior.showMotor1 ? uiBehavior.defaultMotor1 : false,
        motor2Enabled: uiBehavior.showMotor2 ? uiBehavior.defaultMotor2 : false
      }
    }));
  }, [settings.topologySettings.systemTopology]);

  const handleModeChange = (newMode: 'Auto Mode' | 'Manual Mode') => {
    setSettings(prev => ({
      ...prev,
      mode: newMode
    }));
    setHasChanges(true);
  };

  const handleSensorChange = (sensor: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      sensors: {
        ...prev.sensors,
        [sensor]: checked
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!isConnected) {
      toast.showToast({
        type: 'error',
        message: 'Not connected to device',
      });
      return;
    }
    
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      await sendMessage({
        type: 'updateSettings',
        settings: settings
      });
      
      setHasChanges(false);
      setSaveStatus('success');
      
      toast.showToast({
        type: 'success',
        message: 'Hardware settings saved successfully',
      });
      
      // Close overlay after successful save
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to save hardware settings:', error);
      setSaveStatus('error');
      toast.showToast({
        type: 'error',
        message: 'Failed to save hardware settings',
      });
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(appState.systemSettings);
    setHasChanges(false);
    toast.showToast({
      type: 'info',
      message: 'Hardware settings reset to defaults',
    });
  };

  const configDetails = getMotorConfigurationDetails(settings.topologySettings.systemTopology as MotorConfigurationType);
  const uiBehavior = configDetails.uiBehavior;
  const hasActiveSensors = settings.sensors.lowerTankA || settings.sensors.lowerTankB || settings.sensors.upperTankA || settings.sensors.upperTankB;
  const activeMotorCount = [settings.motorSettings.motor1Enabled, settings.motorSettings.motor2Enabled].filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg shadow-wa-xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto page-scrollable">
        <div className="page-content">
        {/* Header */}
        <div className="flex items-center justify-between fluid-padding border-b border-wa-light-border dark:border-wa-dark-border">
          <div className="flex items-center gap-3">
            <div className="wa-avatar">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-responsive-lg font-semibold text-wa-light-text dark:text-wa-dark-text">
                Hardware Settings
              </h3>
              <p className="text-responsive-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                {deviceIP} • {configDetails.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="wa-header-button"
              title="Reset Changes"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || !isConnected || isSaving}
              className="wa-header-button"
              title="Save Settings"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="wa-header-button"
              aria-label="Close"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-wa-sm text-red-700 dark:text-red-300 font-medium">
                Not connected to device. Settings cannot be saved.
              </span>
            </div>
          </div>
        )}

        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-wa-sm text-green-700 dark:text-green-300 font-medium">
                Hardware settings saved successfully!
              </span>
            </div>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-wa-sm text-red-700 dark:text-red-300 font-medium">
                Failed to save hardware settings. Please check your connection.
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="fluid-padding fluid-gap-sm">
          {/* System Mode */}
          <div className="bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa">
            <div className="wa-chat-item">
              <div className="wa-avatar">
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text">
                  System Mode
                </h4>
                <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  {settings.mode === 'Auto Mode' 
                    ? 'Automatically control motors based on water levels'
                    : 'Manual control of motors and system operations'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-wa-sm font-medium px-2 py-1 rounded-full ${
                  settings.mode === 'Auto Mode' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                }`}>
                  {settings.mode}
                </span>
                <ToggleSwitch
                  checked={settings.mode === 'Auto Mode'}
                  onChange={(checked) => handleModeChange(checked ? 'Auto Mode' : 'Manual Mode')}
                  label=""
                  color={settings.mode === 'Auto Mode' ? 'green' : 'purple'}
                />
              </div>
            </div>
          </div>

          {/* Hardware Topology */}
          <div className="bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa">
            <div className="wa-chat-item">
              <div className="wa-avatar">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text">
                  Hardware Configuration
                </h4>
                <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  Topology {settings.topologySettings.systemTopology}
                </p>
              </div>
              <select
                value={settings.topologySettings.systemTopology}
                onChange={(e) => {
                  const newTopology = parseInt(e.target.value);
                  const topologyLabels = {
                    1: 'Dual UG | Dual OH | Dual Motor',
                    2: 'Single UG | Single OH | Single Motor',
                    3: 'Borewell | Single OH | Single Motor',
                    4: 'Borewell | UG | OH | Single Motor',
                    5: 'Single UG | Dual OH | Dual Motor'
                  };
                  
                  setSettings(prev => ({
                    ...prev,
                    motorSettings: {
                      ...prev.motorSettings,
                      configuration: newTopology as MotorConfigurationType
                    },
                    topologySettings: {
                      ...prev.topologySettings,
                      systemTopology: newTopology,
                      topologyLabel: topologyLabels[newTopology as keyof typeof topologyLabels] || 'Unknown'
                    }
                  }));
                  setHasChanges(true);
                }}
                className="text-wa-sm bg-wa-light-panel-2 dark:bg-wa-dark-panel-2 border border-wa-light-border dark:border-wa-dark-border rounded-wa px-2 py-1"
              >
                <option value="1">Dual UG | Dual OH | Dual Motor</option>
                <option value="2">Single UG | Single OH | Single Motor</option>
                <option value="3">Borewell | Single OH | Single Motor</option>
                <option value="4">Borewell | UG | OH | Single Motor</option>
                <option value="5">Single UG | Dual OH | Dual Motor</option>
              </select>
            </div>
          </div>

          {/* Sensor Configuration */}
          <div className="bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa">
            <div className="px-4 py-3 border-b border-wa-light-border dark:border-wa-dark-border">
              <h4 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Sensor Configuration
              </h4>
            </div>
            
            {uiBehavior.showLowerTankA && (
              <div className="wa-chat-item">
                <div className="wa-avatar">
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                    Lower Tank A
                  </h5>
                  <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    Monitor water level in lower tank A
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.sensors.lowerTankA}
                  onChange={(checked) => handleSensorChange('lowerTankA', checked)}
                  label=""
                  color="blue"
                  disabled={!uiBehavior.enableLowerTankA}
                />
              </div>
            )}

            {uiBehavior.showLowerTankB && (
              <div className="wa-chat-item">
                <div className="wa-avatar">
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                    Lower Tank B
                  </h5>
                  <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    Monitor water level in lower tank B
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.sensors.lowerTankB}
                  onChange={(checked) => handleSensorChange('lowerTankB', checked)}
                  label=""
                  color="blue"
                  disabled={!uiBehavior.enableLowerTankB}
                />
              </div>
            )}

            {uiBehavior.showUpperTankA && (
              <div className="wa-chat-item">
                <div className="wa-avatar">
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                    Upper Tank A
                  </h5>
                  <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    Monitor water level in upper tank A
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.sensors.upperTankA}
                  onChange={(checked) => handleSensorChange('upperTankA', checked)}
                  label=""
                  color="green"
                  disabled={!uiBehavior.enableUpperTankA}
                />
              </div>
            )}

            {uiBehavior.showUpperTankB && (
              <div className="wa-chat-item">
                <div className="wa-avatar">
                  <Droplets className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                    Upper Tank B
                  </h5>
                  <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    Monitor water level in upper tank B
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.sensors.upperTankB}
                  onChange={(checked) => handleSensorChange('upperTankB', checked)}
                  label=""
                  color="green"
                  disabled={!uiBehavior.enableUpperTankB}
                />
              </div>
            )}
          </div>

          {/* Motor Configuration */}
          <div className="bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa">
            <div className="px-4 py-3 border-b border-wa-light-border dark:border-wa-dark-border">
              <h4 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Motor Configuration
              </h4>
            </div>
            
            {uiBehavior.showMotor1 && (
              <div className="wa-chat-item">
                <div className="wa-avatar">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                    Motor 1
                  </h5>
                  <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    Enable/disable Motor 1 operation
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.motorSettings.motor1Enabled}
                  onChange={(checked) => {
                    setSettings(prev => ({
                      ...prev,
                      motorSettings: {
                        ...prev.motorSettings,
                        motor1Enabled: checked
                      }
                    }));
                    setHasChanges(true);
                  }}
                  label=""
                  color="blue"
                  disabled={!uiBehavior.enableMotor1}
                />
              </div>
            )}

            {uiBehavior.showMotor2 && (
              <div className="wa-chat-item">
                <div className="wa-avatar">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                    Motor 2
                  </h5>
                  <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    Enable/disable Motor 2 operation
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.motorSettings.motor2Enabled}
                  onChange={(checked) => {
                    setSettings(prev => ({
                      ...prev,
                      motorSettings: {
                        ...prev.motorSettings,
                        motor2Enabled: checked
                      }
                    }));
                    setHasChanges(true);
                  }}
                  label=""
                  color="green"
                  disabled={!uiBehavior.enableMotor2}
                />
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa">
            <div className="px-4 py-3 border-b border-wa-light-border dark:border-wa-dark-border">
              <h4 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Advanced Settings
              </h4>
            </div>
            
            <div className="wa-chat-item">
              <div className="wa-avatar">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                  Prevent Simultaneous Motors
                </h5>
                <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  Prevent multiple motors from running at the same time
                </p>
              </div>
              <ToggleSwitch
                checked={settings.topologySettings.preventSimultaneous}
                onChange={(checked) => {
                  setSettings(prev => ({
                    ...prev,
                    topologySettings: {
                      ...prev.topologySettings,
                      preventSimultaneous: checked
                    }
                  }));
                  setHasChanges(true);
                }}
                label=""
                color="red"
              />
            </div>

            <div className="wa-chat-item">
              <div className="wa-avatar">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-wa-base font-medium text-wa-light-text dark:text-wa-dark-text">
                  Enable Logging
                </h5>
                <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                  Log system events and operations
                </p>
              </div>
              <ToggleSwitch
                checked={settings.topologySettings.logEnabled}
                onChange={(checked) => {
                  setSettings(prev => ({
                    ...prev,
                    topologySettings: {
                      ...prev.topologySettings,
                      logEnabled: checked
                    }
                  }));
                  setHasChanges(true);
                }}
                label=""
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-wa-light-border dark:border-wa-dark-border">
          <div className="flex items-center justify-between text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
            <span>{activeMotorCount} motor{activeMotorCount !== 1 ? 's' : ''} • {hasActiveSensors ? 'Sensors active' : 'No sensors'}</span>
            <span>Hardware Settings</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
