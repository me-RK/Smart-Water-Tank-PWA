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
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';
import { 
  getMotorConfigurationDetails
} from '../constants/motorConfigurations';
import type { MotorConfigurationType } from '../constants/motorConfigurations';
import type { TopologyConfig } from '../types';

interface TopologyHardwareSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  deviceIP: string;
}

// Tank dimension calculation utilities (removed - now using direct height parameters)

// Standard tank sizes for quick selection (for future use)
// const STANDARD_TANK_SIZES = [
//   { label: '1000L (1m³)', height: 100, diameter: 113, unit: 'cm' as const },
//   { label: '2000L (2m³)', height: 100, diameter: 160, unit: 'cm' as const },
//   { label: '3000L (3m³)', height: 100, diameter: 196, unit: 'cm' as const },
//   { label: '5000L (5m³)', height: 100, diameter: 252, unit: 'cm' as const },
//   { label: 'Custom', height: 0, diameter: 0, unit: 'cm' as const }
// ];

/**
 * Topology-Based Hardware Settings Component
 * 
 * Features:
 * - Dynamic topology selection with 6 predefined configurations
 * - System mode toggle (Auto/Manual)
 * - Dynamic sensor configuration based on topology
 * - Dynamic motor configuration with safe stop time for manual mode
 * - Tank dimension configuration with capacity calculation
 * - WhatsApp-style UI design
 * - Real-time settings updates
 */
export const TopologyHardwareSettings: React.FC<TopologyHardwareSettingsProps> = ({
  isOpen,
  onClose,
  deviceIP
}) => {
  const { appState, sendMessage, isConnected } = useWebSocket();
  const toast = useToast();
  
  // Local state for topology configuration
  const [config, setConfig] = useState<TopologyConfig>({
    topology: 3, // Default to Single Underground | Single Overhead | Single Motor
    systemMode: 'auto',
    sensors: {
      upperTankA: { enabled: true, tankHeight: 75, tankWaterFullHeight: 5, tankWaterEmptyHeight: 70 },
      lowerTankA: { enabled: true, tankHeight: 75, tankWaterFullHeight: 5, tankWaterEmptyHeight: 70 },
      upperTankB: { enabled: false, tankHeight: 75, tankWaterFullHeight: 5, tankWaterEmptyHeight: 70 },
      lowerTankB: { enabled: false, tankHeight: 75, tankWaterFullHeight: 5, tankWaterEmptyHeight: 70 }
    },
    motors: {
      m1: { enabled: true, safeStopTime: 15 },
      m2: { enabled: false, safeStopTime: 15 }
    }
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['topology', 'sensors', 'motors']));

  // Update local config when app state changes
  useEffect(() => {
    if (appState.systemSettings) {
      const currentTopology = appState.systemSettings.topologySettings.systemTopology;
      const currentMode = appState.systemSettings.mode === 'Auto Mode' ? 'auto' : 'manual';
      
      setConfig(prev => ({
        ...prev,
        topology: currentTopology,
        systemMode: currentMode,
        sensors: {
          upperTankA: {
            enabled: appState.systemSettings.sensors.upperTankA,
            tankHeight: appState.systemSettings.tankDimensions.upperTankA.height || 75,
            tankWaterFullHeight: appState.systemSettings.tankDimensions.upperTankA.waterFullHeight || 5,
            tankWaterEmptyHeight: appState.systemSettings.tankDimensions.upperTankA.waterEmptyHeight || 70
          },
          lowerTankA: {
            enabled: appState.systemSettings.sensors.lowerTankA,
            tankHeight: appState.systemSettings.tankDimensions.lowerTankA.height || 75,
            tankWaterFullHeight: appState.systemSettings.tankDimensions.lowerTankA.waterFullHeight || 5,
            tankWaterEmptyHeight: appState.systemSettings.tankDimensions.lowerTankA.waterEmptyHeight || 70
          },
          upperTankB: {
            enabled: appState.systemSettings.sensors.upperTankB,
            tankHeight: appState.systemSettings.tankDimensions.upperTankB.height || 75,
            tankWaterFullHeight: appState.systemSettings.tankDimensions.upperTankB.waterFullHeight || 5,
            tankWaterEmptyHeight: appState.systemSettings.tankDimensions.upperTankB.waterEmptyHeight || 70
          },
          lowerTankB: {
            enabled: appState.systemSettings.sensors.lowerTankB,
            tankHeight: appState.systemSettings.tankDimensions.lowerTankB.height || 75,
            tankWaterFullHeight: appState.systemSettings.tankDimensions.lowerTankB.waterFullHeight || 5,
            tankWaterEmptyHeight: appState.systemSettings.tankDimensions.lowerTankB.waterEmptyHeight || 70
          }
        },
        motors: {
          m1: {
            enabled: appState.systemSettings.motorSettings.motor1Enabled,
            safeStopTime: 15 // Default safe stop time
          },
          m2: {
            enabled: appState.systemSettings.motorSettings.motor2Enabled,
            safeStopTime: 15 // Default safe stop time
          }
        }
      }));
      setHasChanges(false);
    }
  }, [appState.systemSettings]);

  // Auto-configure settings when topology changes
  useEffect(() => {
    const configDetails = getMotorConfigurationDetails(config.topology as MotorConfigurationType);
    const uiBehavior = configDetails.uiBehavior;
    
    setConfig(prev => ({
      ...prev,
      sensors: {
        upperTankA: {
          ...prev.sensors.upperTankA,
          enabled: uiBehavior.showUpperTankA ? uiBehavior.defaultUpperTankA : false
        },
        lowerTankA: {
          ...prev.sensors.lowerTankA,
          enabled: uiBehavior.showLowerTankA ? uiBehavior.defaultLowerTankA : false
        },
        upperTankB: {
          ...prev.sensors.upperTankB,
          enabled: uiBehavior.showUpperTankB ? uiBehavior.defaultUpperTankB : false
        },
        lowerTankB: {
          ...prev.sensors.lowerTankB,
          enabled: uiBehavior.showLowerTankB ? uiBehavior.defaultLowerTankB : false
        }
      },
      motors: {
        m1: {
          ...prev.motors.m1,
          enabled: uiBehavior.showMotor1 ? uiBehavior.defaultMotor1 : false
        },
        m2: {
          ...prev.motors.m2,
          enabled: uiBehavior.showMotor2 ? uiBehavior.defaultMotor2 : false
        }
      }
    }));
    setHasChanges(true);
  }, [config.topology]);

  const handleSystemModeChange = (newMode: 'auto' | 'manual') => {
    setConfig(prev => ({
      ...prev,
      systemMode: newMode
    }));
    setHasChanges(true);
  };

  const handleTopologyChange = (newTopology: number) => {
    setConfig(prev => ({
      ...prev,
      topology: newTopology
    }));
    setHasChanges(true);
  };

  const handleSensorChange = (sensorKey: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      sensors: {
        ...prev.sensors,
        [sensorKey]: {
          ...prev.sensors[sensorKey as keyof typeof prev.sensors],
          enabled
        }
      }
    }));
    setHasChanges(true);
  };

  const handleMotorChange = (motorKey: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      motors: {
        ...prev.motors,
        [motorKey]: {
          ...prev.motors[motorKey as keyof typeof prev.motors],
          enabled
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSafeStopTimeChange = (motorKey: string, time: number) => {
    setConfig(prev => ({
      ...prev,
      motors: {
        ...prev.motors,
        [motorKey]: {
          ...prev.motors[motorKey as keyof typeof prev.motors],
          safeStopTime: time
        }
      }
    }));
    setHasChanges(true);
  };

  const handleParameterChange = (sensorKey: string, parameter: string, value: number) => {
    setConfig(prev => {
      const sensor = prev.sensors[sensorKey as keyof typeof prev.sensors];
      if (!sensor) return prev;

      return {
        ...prev,
        sensors: {
          ...prev.sensors,
          [sensorKey]: {
            ...sensor,
            [parameter]: value
          }
        }
      };
    });
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
      // Send the new topology configuration
      await sendMessage({
        type: 'settingData',
        config: config
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
    setConfig({
      topology: 3,
      systemMode: 'auto',
      sensors: {
        upperTankA: { enabled: true, tankHeight: 75, tankWaterFullHeight: 5, tankWaterEmptyHeight: 70 },
        lowerTankA: { enabled: true, tankHeight: 75, tankWaterFullHeight: 5, tankWaterEmptyHeight: 70 },
        upperTankB: { enabled: false, tankHeight: 75, tankWaterFullHeight: 5, tankWaterEmptyHeight: 70 },
        lowerTankB: { enabled: false, tankHeight: 75, tankWaterFullHeight: 5, tankWaterEmptyHeight: 70 }
      },
      motors: {
        m1: { enabled: true, safeStopTime: 15 },
        m2: { enabled: false, safeStopTime: 15 }
      }
    });
    setHasChanges(false);
    toast.showToast({
      type: 'info',
      message: 'Hardware settings reset to defaults',
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const configDetails = getMotorConfigurationDetails(config.topology as MotorConfigurationType);
  const uiBehavior = configDetails.uiBehavior;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg shadow-wa-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto page-scrollable">
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
            {/* 1. System Mode */}
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
                    {config.systemMode === 'auto' 
                      ? 'Automatically control motors based on water levels'
                      : 'Manual control of motors and system operations'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-wa-sm font-medium px-2 py-1 rounded-full ${
                    config.systemMode === 'auto' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  }`}>
                    {config.systemMode === 'auto' ? 'Auto' : 'Manual'}
                  </span>
                  <ToggleSwitch
                    checked={config.systemMode === 'auto'}
                    onChange={(checked) => handleSystemModeChange(checked ? 'auto' : 'manual')}
                    label=""
                    color={config.systemMode === 'auto' ? 'green' : 'purple'}
                  />
                </div>
              </div>
            </div>

            {/* 2. Hardware Configuration (Topology Selection) */}
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
                    Select your tank and motor topology
                  </p>
                </div>
                <select
                  value={config.topology}
                  onChange={(e) => handleTopologyChange(parseInt(e.target.value))}
                  className="text-wa-sm bg-wa-light-panel-2 dark:bg-wa-dark-panel-2 border border-wa-light-border dark:border-wa-dark-border rounded-wa px-2 py-1 min-w-[200px]"
                >
                  <option value={1}>Dual Overhead Tanks | Dual Underground Tanks | Dual Motors</option>
                  <option value={2}>Single Underground Tank | Dual Overhead Tanks | Dual Motors</option>
                  <option value={3}>Single Underground Tank | Single Overhead Tank | Single Motor</option>
                  <option value={4}>Single Underground Tank | Single Overhead Tank | Dual Motors (Bore + Transfer)</option>
                  <option value={5}>Single Overhead Tank | Borewell Motor</option>
                  <option value={6}>Manual Configuration (custom setup)</option>
                </select>
              </div>
            </div>

            {/* 3. Sensor Configuration (Dynamic Section) */}
            <div className="bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa">
              <div 
                className="wa-chat-item cursor-pointer"
                onClick={() => toggleSection('sensors')}
              >
                <div className="wa-avatar">
                  <Monitor className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text">
                    Sensor Configuration
                  </h4>
                  <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    Configure water level sensors and tank dimensions
                  </p>
                </div>
                {expandedSections.has('sensors') ? (
                  <ChevronUp className="w-4 h-4 text-wa-light-text-muted dark:text-wa-dark-text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-wa-light-text-muted dark:text-wa-dark-text-muted" />
                )}
              </div>

              {expandedSections.has('sensors') && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Upper Tank A Sensor */}
                  {uiBehavior.showUpperTankA && (
                    <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-green-500" />
                          <h5 className="text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text">
                            Upper Tank A Sensor
                          </h5>
                        </div>
                        <ToggleSwitch
                          checked={config.sensors.upperTankA?.enabled || false}
                          onChange={(checked) => handleSensorChange('upperTankA', checked)}
                          label=""
                          color="green"
                          disabled={!uiBehavior.enableUpperTankA}
                        />
                      </div>
                      
                      {config.sensors.upperTankA?.enabled && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-wa-light-text dark:text-wa-dark-text mb-1">
                                Tank Height (TH)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="1000"
                                value={config.sensors.upperTankA?.tankHeight || 0}
                                onChange={(e) => handleParameterChange('upperTankA', 'tankHeight', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                                placeholder="75"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-wa-light-text dark:text-wa-dark-text mb-1">
                                Water Full Height (TWFH)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={config.sensors.upperTankA?.tankWaterFullHeight || 0}
                                onChange={(e) => handleParameterChange('upperTankA', 'tankWaterFullHeight', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                                placeholder="5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-wa-light-text dark:text-wa-dark-text mb-1">
                                Water Empty Height (TWEH)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={config.sensors.upperTankA?.tankWaterEmptyHeight || 0}
                                onChange={(e) => handleParameterChange('upperTankA', 'tankWaterEmptyHeight', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                                placeholder="70"
                              />
                            </div>
                          </div>
                          <div className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted">
                            All measurements in centimeters (cm)
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lower Tank A Sensor */}
                  {uiBehavior.showLowerTankA && (
                    <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <h5 className="text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text">
                            Lower Tank A Sensor
                          </h5>
                        </div>
                        <ToggleSwitch
                          checked={config.sensors.lowerTankA?.enabled || false}
                          onChange={(checked) => handleSensorChange('lowerTankA', checked)}
                          label=""
                          color="blue"
                          disabled={!uiBehavior.enableLowerTankA}
                        />
                      </div>
                      
                      {config.sensors.lowerTankA?.enabled && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-wa-light-text dark:text-wa-dark-text mb-1">
                                Tank Height (TH)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="1000"
                                value={config.sensors.lowerTankA?.tankHeight || 0}
                                onChange={(e) => handleParameterChange('lowerTankA', 'tankHeight', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                                placeholder="75"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-wa-light-text dark:text-wa-dark-text mb-1">
                                Water Full Height (TWFH)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={config.sensors.lowerTankA?.tankWaterFullHeight || 0}
                                onChange={(e) => handleParameterChange('lowerTankA', 'tankWaterFullHeight', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                                placeholder="5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-wa-light-text dark:text-wa-dark-text mb-1">
                                Water Empty Height (TWEH)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={config.sensors.lowerTankA?.tankWaterEmptyHeight || 0}
                                onChange={(e) => handleParameterChange('lowerTankA', 'tankWaterEmptyHeight', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                                placeholder="70"
                              />
                            </div>
                          </div>
                          <div className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted">
                            All measurements in centimeters (cm)
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upper Tank B Sensor */}
                  {uiBehavior.showUpperTankB && (
                    <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-green-500" />
                          <h5 className="text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text">
                            Upper Tank B Sensor
                          </h5>
                        </div>
                        <ToggleSwitch
                          checked={config.sensors.upperTankB?.enabled || false}
                          onChange={(checked) => handleSensorChange('upperTankB', checked)}
                          label=""
                          color="green"
                          disabled={!uiBehavior.enableUpperTankB}
                        />
                      </div>
                      
                      {config.sensors.upperTankB?.enabled && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-wa-light-text dark:text-wa-dark-text mb-1">
                                Tank Height (TH)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="1000"
                                value={config.sensors.upperTankB?.tankHeight || 0}
                                onChange={(e) => handleParameterChange('upperTankB', 'tankHeight', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                                placeholder="75"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-wa-light-text dark:text-wa-dark-text mb-1">
                                Water Full Height (TWFH)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={config.sensors.upperTankB?.tankWaterFullHeight || 0}
                                onChange={(e) => handleParameterChange('upperTankB', 'tankWaterFullHeight', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                                placeholder="5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-wa-light-text dark:text-wa-dark-text mb-1">
                                Water Empty Height (TWEH)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={config.sensors.upperTankB?.tankWaterEmptyHeight || 0}
                                onChange={(e) => handleParameterChange('upperTankB', 'tankWaterEmptyHeight', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                                placeholder="70"
                              />
                            </div>
                          </div>
                          <div className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted">
                            All measurements in centimeters (cm)
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lower Tank B Sensor */}
                  {uiBehavior.showLowerTankB && (
                    <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <h5 className="text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text">
                            Lower Tank B Sensor
                          </h5>
                        </div>
                        <ToggleSwitch
                          checked={config.sensors.lowerTankB?.enabled || false}
                          onChange={(checked) => handleSensorChange('lowerTankB', checked)}
                          label=""
                          color="blue"
                          disabled={!uiBehavior.enableLowerTankB}
                        />
                      </div>
                      
                      {config.sensors.lowerTankB?.enabled && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-wa-light-text dark:text-wa-dark-text mb-1">
                                Tank Height (TH)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="1000"
                                value={config.sensors.lowerTankB?.tankHeight || 0}
                                onChange={(e) => handleParameterChange('lowerTankB', 'tankHeight', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                                placeholder="75"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-wa-light-text dark:text-wa-dark-text mb-1">
                                Water Full Height (TWFH)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={config.sensors.lowerTankB?.tankWaterFullHeight || 0}
                                onChange={(e) => handleParameterChange('lowerTankB', 'tankWaterFullHeight', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                                placeholder="5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-wa-light-text dark:text-wa-dark-text mb-1">
                                Water Empty Height (TWEH)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={config.sensors.lowerTankB?.tankWaterEmptyHeight || 0}
                                onChange={(e) => handleParameterChange('lowerTankB', 'tankWaterEmptyHeight', parseInt(e.target.value) || 0)}
                                className="w-full px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                                placeholder="70"
                              />
                            </div>
                          </div>
                          <div className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted">
                            All measurements in centimeters (cm)
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Motor Configuration (Dynamic Section) */}
            <div className="bg-wa-light-bg dark:bg-wa-dark-bg rounded-wa">
              <div 
                className="wa-chat-item cursor-pointer"
                onClick={() => toggleSection('motors')}
              >
                <div className="wa-avatar">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-wa-base font-semibold text-wa-light-text dark:text-wa-dark-text">
                    Motor Configuration
                  </h4>
                  <p className="text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
                    Configure motor settings and safe stop times
                  </p>
                </div>
                {expandedSections.has('motors') ? (
                  <ChevronUp className="w-4 h-4 text-wa-light-text-muted dark:text-wa-dark-text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-wa-light-text-muted dark:text-wa-dark-text-muted" />
                )}
              </div>

              {expandedSections.has('motors') && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Motor 1 */}
                  {uiBehavior.showMotor1 && (
                    <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <h5 className="text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text">
                            {config.topology === 4 ? 'Bore Motor' : 'Motor 1'}
                          </h5>
                        </div>
                        <ToggleSwitch
                          checked={config.motors.m1?.enabled || false}
                          onChange={(checked) => handleMotorChange('m1', checked)}
                          label=""
                          color="blue"
                          disabled={!uiBehavior.enableMotor1}
                        />
                      </div>
                      
                      {config.motors.m1?.enabled && config.systemMode === 'manual' && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-orange-500" />
                          <label className="text-xs font-medium text-wa-light-text dark:text-wa-dark-text">
                            Safe Stop Time:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={config.motors.m1?.safeStopTime || 15}
                            onChange={(e) => handleSafeStopTimeChange('m1', parseInt(e.target.value) || 15)}
                            className="w-16 px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                          />
                          <span className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted">
                            minutes
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Motor 2 */}
                  {uiBehavior.showMotor2 && (
                    <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-green-500" />
                          <h5 className="text-wa-sm font-medium text-wa-light-text dark:text-wa-dark-text">
                            {config.topology === 4 ? 'Transfer Motor' : 'Motor 2'}
                          </h5>
                        </div>
                        <ToggleSwitch
                          checked={config.motors.m2?.enabled || false}
                          onChange={(checked) => handleMotorChange('m2', checked)}
                          label=""
                          color="green"
                          disabled={!uiBehavior.enableMotor2}
                        />
                      </div>
                      
                      {config.motors.m2?.enabled && config.systemMode === 'manual' && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-orange-500" />
                          <label className="text-xs font-medium text-wa-light-text dark:text-wa-dark-text">
                            Safe Stop Time:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={config.motors.m2?.safeStopTime || 15}
                            onChange={(e) => handleSafeStopTimeChange('m2', parseInt(e.target.value) || 15)}
                            className="w-16 px-2 py-1 text-xs bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded"
                          />
                          <span className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted">
                            minutes
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-wa-light-border dark:border-wa-dark-border">
            <div className="flex items-center justify-between text-wa-sm text-wa-light-text-muted dark:text-wa-dark-text-muted">
              <span>
                Topology {config.topology} • {config.systemMode === 'auto' ? 'Auto' : 'Manual'} Mode
              </span>
              <span>Hardware Settings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
