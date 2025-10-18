import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/useWebSocket';
import { useToast } from '../components/useToast';
import { BottomNavigation } from '../components/BottomNavigation';
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Droplets,
  Monitor,
  Zap
} from 'lucide-react';
import { 
  getMotorConfigurationDetails
} from '../constants/motorConfigurations';
import type { MotorConfigurationType } from '../constants/motorConfigurations';
import type { TopologyConfig } from '../types';

/**
 * Hardware Settings Page - Full-Page Configuration View
 * 
 * Features:
 * - Full-page layout with fixed navigation bars
 * - Tank configuration for all four tanks (Upper A, Lower A, Upper B, Lower B)
 * - System mode and topology configuration
 * - Motor settings with safe stop time
 * - Proper input validation and spacing
 * - WhatsApp-style UI design
 * - Real-time settings updates
 */
export const HardwareSettings: React.FC = () => {
  const navigate = useNavigate();
  const { appState, sendMessage, isConnected, deviceIP } = useWebSocket();
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

  const handleParameterChange = (tankKey: string, parameter: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      sensors: {
        ...prev.sensors,
        [tankKey]: {
          ...prev.sensors[tankKey as keyof typeof prev.sensors],
          [parameter]: value
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

  const configDetails = getMotorConfigurationDetails(config.topology as MotorConfigurationType);

  return (
    <div className="min-h-screen bg-wa-light-bg dark:bg-wa-dark-bg">
      {/* Sticky Top Navigation */}
      <header className="wa-header sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/devices')}
            className="wa-header-button"
            title="Back to Devices"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="wa-avatar">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="wa-header-title">Hardware Settings</h1>
            <p className="text-sm opacity-90">
              {deviceIP || 'Not Connected'} • {configDetails.description}
            </p>
          </div>
        </div>

        <div className="wa-header-actions">
          {/* Save Status Indicator */}
          {saveStatus === 'success' && (
            <div className="flex items-center gap-1 text-green-500">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Saved</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center gap-1 text-red-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Error</span>
            </div>
          )}
        </div>
      </header>

      {/* Scrollable Content Area */}
      <main className="container-responsive fluid-padding page-content">
        {/* System Configuration */}
        <div className="fluid-margin">
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg shadow-wa">
            <div className="px-4 py-3 border-b border-wa-light-border dark:border-wa-dark-border">
              <h3 className="text-responsive-lg font-semibold text-wa-light-text dark:text-wa-dark-text flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                System Configuration
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {/* System Mode */}
              <div>
                <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                  System Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSystemModeChange('auto')}
                    className={`flex-1 px-4 py-2 rounded-wa font-medium transition-colors ${
                      config.systemMode === 'auto'
                        ? 'bg-wa-teal-500 text-white'
                        : 'bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border text-wa-light-text dark:text-wa-dark-text'
                    }`}
                  >
                    Auto Mode
                  </button>
                  <button
                    onClick={() => handleSystemModeChange('manual')}
                    className={`flex-1 px-4 py-2 rounded-wa font-medium transition-colors ${
                      config.systemMode === 'manual'
                        ? 'bg-wa-teal-500 text-white'
                        : 'bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border text-wa-light-text dark:text-wa-dark-text'
                    }`}
                  >
                    Manual Mode
                  </button>
                </div>
              </div>

              {/* Topology Selection */}
              <div>
                <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                  System Topology
                </label>
                <select
                  value={config.topology}
                  onChange={(e) => handleTopologyChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                >
                  <option value="1">Dual UG | Dual OH | Dual Motor</option>
                  <option value="2">Single UG | Single OH | Single Motor</option>
                  <option value="3">Borewell | Single OH | Single Motor</option>
                  <option value="4">Borewell | UG | OH | Single Motor</option>
                  <option value="5">Single UG | Dual OH | Dual Motor</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tank Configuration */}
        <div className="fluid-margin">
          <h2 className="text-responsive-lg font-semibold text-wa-light-text dark:text-wa-dark-text fluid-margin">
            Tank Configuration
          </h2>
          
          {/* Upper Tank A */}
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg shadow-wa mb-4">
            <div className="px-4 py-3 border-b border-wa-light-border dark:border-wa-dark-border">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-wa-light-text dark:text-wa-dark-text flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Upper Tank A
                </h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.sensors.upperTankA.enabled}
                    onChange={(e) => handleSensorChange('upperTankA', e.target.checked)}
                    className="w-4 h-4 text-wa-teal-500 bg-wa-light-bg dark:bg-wa-dark-bg border-wa-light-border dark:border-wa-dark-border rounded focus:ring-wa-teal-500"
                  />
                  <span className="text-sm text-wa-light-text dark:text-wa-dark-text">Enabled</span>
                </label>
              </div>
            </div>
            
            {config.sensors.upperTankA.enabled && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                      Tank Height (TH)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={config.sensors.upperTankA.tankHeight}
                      onChange={(e) => handleParameterChange('upperTankA', 'tankHeight', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                      placeholder="75"
                    />
                    <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">cm</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                      Water Full Height (TWFH)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.sensors.upperTankA.tankWaterFullHeight}
                      onChange={(e) => handleParameterChange('upperTankA', 'tankWaterFullHeight', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                      placeholder="5"
                    />
                    <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">cm</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                      Water Empty Height (TWEH)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.sensors.upperTankA.tankWaterEmptyHeight}
                      onChange={(e) => handleParameterChange('upperTankA', 'tankWaterEmptyHeight', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                      placeholder="70"
                    />
                    <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">cm</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lower Tank A */}
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg shadow-wa mb-4">
            <div className="px-4 py-3 border-b border-wa-light-border dark:border-wa-dark-border">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-wa-light-text dark:text-wa-dark-text flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Lower Tank A
                </h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.sensors.lowerTankA.enabled}
                    onChange={(e) => handleSensorChange('lowerTankA', e.target.checked)}
                    className="w-4 h-4 text-wa-teal-500 bg-wa-light-bg dark:bg-wa-dark-bg border-wa-light-border dark:border-wa-dark-border rounded focus:ring-wa-teal-500"
                  />
                  <span className="text-sm text-wa-light-text dark:text-wa-dark-text">Enabled</span>
                </label>
              </div>
            </div>
            
            {config.sensors.lowerTankA.enabled && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                      Tank Height (TH)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={config.sensors.lowerTankA.tankHeight}
                      onChange={(e) => handleParameterChange('lowerTankA', 'tankHeight', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                      placeholder="75"
                    />
                    <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">cm</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                      Water Full Height (TWFH)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.sensors.lowerTankA.tankWaterFullHeight}
                      onChange={(e) => handleParameterChange('lowerTankA', 'tankWaterFullHeight', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                      placeholder="5"
                    />
                    <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">cm</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                      Water Empty Height (TWEH)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.sensors.lowerTankA.tankWaterEmptyHeight}
                      onChange={(e) => handleParameterChange('lowerTankA', 'tankWaterEmptyHeight', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                      placeholder="70"
                    />
                    <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">cm</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upper Tank B */}
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg shadow-wa mb-4">
            <div className="px-4 py-3 border-b border-wa-light-border dark:border-wa-dark-border">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-wa-light-text dark:text-wa-dark-text flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Upper Tank B
                </h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.sensors.upperTankB.enabled}
                    onChange={(e) => handleSensorChange('upperTankB', e.target.checked)}
                    className="w-4 h-4 text-wa-teal-500 bg-wa-light-bg dark:bg-wa-dark-bg border-wa-light-border dark:border-wa-dark-border rounded focus:ring-wa-teal-500"
                  />
                  <span className="text-sm text-wa-light-text dark:text-wa-dark-text">Enabled</span>
                </label>
              </div>
            </div>
            
            {config.sensors.upperTankB.enabled && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                      Tank Height (TH)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={config.sensors.upperTankB.tankHeight}
                      onChange={(e) => handleParameterChange('upperTankB', 'tankHeight', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                      placeholder="75"
                    />
                    <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">cm</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                      Water Full Height (TWFH)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.sensors.upperTankB.tankWaterFullHeight}
                      onChange={(e) => handleParameterChange('upperTankB', 'tankWaterFullHeight', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                      placeholder="5"
                    />
                    <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">cm</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                      Water Empty Height (TWEH)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.sensors.upperTankB.tankWaterEmptyHeight}
                      onChange={(e) => handleParameterChange('upperTankB', 'tankWaterEmptyHeight', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                      placeholder="70"
                    />
                    <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">cm</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lower Tank B */}
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg shadow-wa mb-4">
            <div className="px-4 py-3 border-b border-wa-light-border dark:border-wa-dark-border">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-wa-light-text dark:text-wa-dark-text flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Lower Tank B
                </h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.sensors.lowerTankB.enabled}
                    onChange={(e) => handleSensorChange('lowerTankB', e.target.checked)}
                    className="w-4 h-4 text-wa-teal-500 bg-wa-light-bg dark:bg-wa-dark-bg border-wa-light-border dark:border-wa-dark-border rounded focus:ring-wa-teal-500"
                  />
                  <span className="text-sm text-wa-light-text dark:text-wa-dark-text">Enabled</span>
                </label>
              </div>
            </div>
            
            {config.sensors.lowerTankB.enabled && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                      Tank Height (TH)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={config.sensors.lowerTankB.tankHeight}
                      onChange={(e) => handleParameterChange('lowerTankB', 'tankHeight', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                      placeholder="75"
                    />
                    <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">cm</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                      Water Full Height (TWFH)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.sensors.lowerTankB.tankWaterFullHeight}
                      onChange={(e) => handleParameterChange('lowerTankB', 'tankWaterFullHeight', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                      placeholder="5"
                    />
                    <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">cm</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                      Water Empty Height (TWEH)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.sensors.lowerTankB.tankWaterEmptyHeight}
                      onChange={(e) => handleParameterChange('lowerTankB', 'tankWaterEmptyHeight', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                      placeholder="70"
                    />
                    <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">cm</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Motor Configuration */}
        <div className="fluid-margin">
          <h2 className="text-responsive-lg font-semibold text-wa-light-text dark:text-wa-dark-text fluid-margin">
            Motor Configuration
          </h2>
          
          {/* Motor 1 */}
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg shadow-wa mb-4">
            <div className="px-4 py-3 border-b border-wa-light-border dark:border-wa-dark-border">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-wa-light-text dark:text-wa-dark-text flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Motor 1
                </h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.motors.m1.enabled}
                    onChange={(e) => handleMotorChange('m1', e.target.checked)}
                    className="w-4 h-4 text-wa-teal-500 bg-wa-light-bg dark:bg-wa-dark-bg border-wa-light-border dark:border-wa-dark-border rounded focus:ring-wa-teal-500"
                  />
                  <span className="text-sm text-wa-light-text dark:text-wa-dark-text">Enabled</span>
                </label>
              </div>
            </div>
            
            {config.motors.m1.enabled && (
              <div className="p-4">
                <div>
                  <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                    Safe Stop Time (Manual Mode)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={config.motors.m1.safeStopTime}
                    onChange={(e) => handleSafeStopTimeChange('m1', parseInt(e.target.value) || 15)}
                    className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                    placeholder="15"
                  />
                  <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">seconds</p>
                </div>
              </div>
            )}
          </div>

          {/* Motor 2 */}
          <div className="bg-wa-light-panel dark:bg-wa-dark-panel rounded-wa-lg shadow-wa mb-4">
            <div className="px-4 py-3 border-b border-wa-light-border dark:border-wa-dark-border">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-wa-light-text dark:text-wa-dark-text flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Motor 2
                </h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.motors.m2.enabled}
                    onChange={(e) => handleMotorChange('m2', e.target.checked)}
                    className="w-4 h-4 text-wa-teal-500 bg-wa-light-bg dark:bg-wa-dark-bg border-wa-light-border dark:border-wa-dark-border rounded focus:ring-wa-teal-500"
                  />
                  <span className="text-sm text-wa-light-text dark:text-wa-dark-text">Enabled</span>
                </label>
              </div>
            </div>
            
            {config.motors.m2.enabled && (
              <div className="p-4">
                <div>
                  <label className="block text-sm font-medium text-wa-light-text dark:text-wa-dark-text mb-2">
                    Safe Stop Time (Manual Mode)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={config.motors.m2.safeStopTime}
                    onChange={(e) => handleSafeStopTimeChange('m2', parseInt(e.target.value) || 15)}
                    className="w-full px-3 py-2 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border rounded-wa text-wa-light-text dark:text-wa-dark-text focus:outline-none focus:ring-2 focus:ring-wa-teal-500"
                    placeholder="15"
                  />
                  <p className="text-xs text-wa-light-text-muted dark:text-wa-dark-text-muted mt-1">seconds</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fluid-margin">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 bg-wa-light-bg dark:bg-wa-dark-bg border border-wa-light-border dark:border-wa-dark-border text-wa-light-text dark:text-wa-dark-text rounded-wa font-medium hover:bg-wa-light-panel dark:hover:bg-wa-dark-panel transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
            
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || !isConnected}
              className="flex-1 px-4 py-3 bg-wa-teal-500 hover:bg-wa-teal-600 disabled:bg-gray-400 text-white rounded-wa font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default HardwareSettings;
