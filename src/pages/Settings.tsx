import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/useWebSocket';
import { usePageData } from '../hooks/usePageData';
import { useTheme } from '../context/ThemeContext';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { SensorCheckbox } from '../components/SensorCheckbox';
import { ThemeToggle } from '../components/ThemeToggle';
import { PWAInstallButton } from '../components/PWAInstallButton';
// Animation imports removed - using only icon animations now
import { ArrowLeft, Save, RotateCcw, AlertCircle, CheckCircle, Settings as SettingsIcon, Monitor, Info, Zap, Shield, Gauge, ChevronDown, ChevronRight } from 'lucide-react';
import { 
  getMotorConfigurationDetails
} from '../constants/motorConfigurations';
import type { MotorConfigurationType } from '../constants/motorConfigurations';

/**
 * Enhanced Settings Page Component
 * 
 * Features:
 * - Comprehensive system configuration management
 * - Real-time settings synchronization with ESP32
 * - Dynamic UI based on system topology
 * - Enhanced animations and user feedback
 * - Improved accessibility and user experience
 */

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { appState, sendMessage, isConnected } = useWebSocket();
  useTheme();
  usePageData();
  const [settings, setSettings] = useState(appState.systemSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'overview' | 'hardware' | 'automation' | 'advanced'>('overview');
  const [openDimensionDropdowns, setOpenDimensionDropdowns] = useState<{[key: string]: boolean}>({});
  const [openTimerDropdowns, setOpenTimerDropdowns] = useState<{[key: string]: boolean}>({});

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

  const handleTankDimensionChange = (tank: string, field: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      tankDimensions: {
        ...prev.tankDimensions,
        [tank]: {
          ...prev.tankDimensions[tank as keyof typeof prev.tankDimensions],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const toggleDimensionDropdown = (sensor: string) => {
    setOpenDimensionDropdowns(prev => ({
      ...prev,
      [sensor]: !prev[sensor]
    }));
  };

  const toggleTimerDropdown = (motor: string) => {
    setOpenTimerDropdowns(prev => ({
      ...prev,
      [motor]: !prev[motor]
    }));
  };

  const handleMotorTimerChange = (motor: string, field: string, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      motorSettings: {
        ...prev.motorSettings,
        [motor]: {
          ...(prev.motorSettings[motor as keyof typeof prev.motorSettings] as Record<string, unknown>),
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!isConnected) return;
    
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      await sendMessage({
        type: 'updateSettings',
        settings: settings
      });
      
      setHasChanges(false);
      setSaveStatus('success');
      
      // Redirect to dashboard after successful save
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); // Wait 2 seconds to show success message
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(appState.systemSettings);
    setHasChanges(false);
  };

  const configDetails = getMotorConfigurationDetails(settings.topologySettings.systemTopology as MotorConfigurationType);
  const uiBehavior = configDetails.uiBehavior;
  const hasActiveSensors = settings.sensors.lowerTankA || settings.sensors.lowerTankB || settings.sensors.upperTankA || settings.sensors.upperTankB;
  const activeMotorCount = [settings.motorSettings.motor1Enabled, settings.motorSettings.motor2Enabled].filter(Boolean).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Monitor },
    { id: 'hardware', label: 'Hardware', icon: SettingsIcon },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'advanced', label: 'Advanced', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 transition-all duration-300 hover:scale-110 hover:rotate-12" />
              </button>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Smart Settings
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <PWAInstallButton />
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reset Changes"
              >
                <RotateCcw className="w-5 h-5 transition-all duration-300 hover:scale-110 hover:rotate-12" />
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || !isConnected || isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 transition-all duration-300 hover:scale-110 hover:rotate-12" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                Not connected to server. Settings cannot be saved.
              </span>
            </div>
          </div>
        )}

        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                Settings saved successfully!
              </span>
            </div>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                Failed to save settings. Please check your connection.
              </span>
            </div>
          </div>
        )}

        {/* Smart Configuration Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 flex items-center space-x-3">
              <Gauge className="w-6 h-6" />
              <span>Smart Configuration</span>
            </h2>
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                settings.mode === 'Auto Mode' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
              }`}>
                {settings.mode}
              </div>
              <div className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Topology {settings.topologySettings.systemTopology}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* System Mode */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>System Mode</span>
              </h3>
              <div className="space-y-2">
                <ToggleSwitch
                  checked={settings.mode === 'Auto Mode'}
                  onChange={(checked) => handleModeChange(checked ? 'Auto Mode' : 'Manual Mode')}
                  label={settings.mode === 'Auto Mode' ? 'Auto Mode' : 'Manual Mode'}
                  color={settings.mode === 'Auto Mode' ? 'blue' : 'purple'}
                />
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {settings.mode === 'Auto Mode' 
                    ? 'System automatically controls motors based on water levels'
                    : 'Manual control of motors and system operations'
                  }
                </p>
              </div>
            </div>

            {/* Hardware Topology */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center space-x-2">
                <SettingsIcon className="w-4 h-4" />
                <span>Hardware</span>
              </h3>
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
                }}
                className="w-full px-3 py-2 text-sm border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1">Dual UG | Dual OH | Dual Motor</option>
                <option value="2">Single UG | Single OH | Single Motor</option>
                <option value="3">Borewell | Single OH | Single Motor</option>
                <option value="4">Borewell | UG | OH | Single Motor</option>
                <option value="5">Single UG | Dual OH | Dual Motor</option>
              </select>
            </div>

            {/* Quick Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center space-x-2">
                <Monitor className="w-4 h-4" />
                <span>Status</span>
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600 dark:text-blue-400">Sensors:</span>
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    {[settings.sensors.lowerTankA, settings.sensors.lowerTankB, settings.sensors.upperTankA, settings.sensors.upperTankB].filter(Boolean).length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600 dark:text-blue-400">Motors:</span>
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    {activeMotorCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600 dark:text-blue-400">Auto Mode:</span>
                  <span className={`font-medium ${settings.topologySettings.autoMode ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {settings.topologySettings.autoMode ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center space-x-2">
                <Info className="w-4 h-4" />
                <span>Quick Info</span>
              </h3>
              <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <p>• {configDetails.description}</p>
                <p>• {activeMotorCount} motor{activeMotorCount !== 1 ? 's' : ''} active</p>
                <p>• {hasActiveSensors ? 'Sensors configured' : 'No sensors active'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'hardware' | 'automation' | 'advanced')}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Configuration Overview</h3>
                
                {/* Configuration Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">Hardware Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-700 dark:text-blue-300">{configDetails.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Tanks:</span>
                          <ul className="mt-1 space-y-1">
                            {configDetails.hasLowerTankA && <li>• Lower Tank A</li>}
                            {configDetails.hasLowerTankB && <li>• Lower Tank B</li>}
                            {configDetails.hasUpperTankA && <li>• Upper Tank A</li>}
                            {configDetails.hasUpperTankB && <li>• Upper Tank B</li>}
                            {configDetails.hasBorewell && <li>• Borewell</li>}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium text-blue-800 dark:text-blue-200">Motors:</span>
                          <ul className="mt-1 space-y-1">
                            {configDetails.hasMotor1 && <li>• Motor 1</li>}
                            {configDetails.hasMotor2 && <li>• Motor 2</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">Current Status</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-green-700 dark:text-green-300">System Mode:</span>
                        <span className="font-medium text-green-800 dark:text-green-200">{settings.mode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-700 dark:text-green-300">Active Sensors:</span>
                        <span className="font-medium text-green-800 dark:text-green-200">
                          {[settings.sensors.lowerTankA, settings.sensors.lowerTankB, settings.sensors.upperTankA, settings.sensors.upperTankB].filter(Boolean).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-700 dark:text-green-300">Active Motors:</span>
                        <span className="font-medium text-green-800 dark:text-green-200">{activeMotorCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-700 dark:text-green-300">Auto Mode:</span>
                        <span className={`font-medium ${settings.topologySettings.autoMode ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {settings.topologySettings.autoMode ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hardware' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Hardware Configuration</h3>
                
                {/* Sensor Configuration */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Sensor Activation</h4>
                  <div className="space-y-4">
                    {uiBehavior.showLowerTankA && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <SensorCheckbox
                            checked={settings.sensors.lowerTankA}
                            onChange={(checked) => handleSensorChange('lowerTankA', checked)}
                            label="Lower Tank A"
                            description={uiBehavior.enableLowerTankA 
                              ? "Monitor water level in lower tank A" 
                              : "Lower Tank A sensor is required for this topology"
                            }
                            color="blue"
                            disabled={!uiBehavior.enableLowerTankA}
                          />
                          {settings.sensors.lowerTankA && (
                            <button
                              onClick={() => toggleDimensionDropdown('lowerTankA')}
                              className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              <span>Dimensions</span>
                              {openDimensionDropdowns.lowerTankA ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        {settings.sensors.lowerTankA && openDimensionDropdowns.lowerTankA && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">Lower Tank A Dimensions</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                  Height (cm)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={settings.tankDimensions.lowerTankA.height}
                                  onChange={(e) => handleTankDimensionChange('lowerTankA', 'height', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                  Water Full Height (cm)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={settings.tankDimensions.lowerTankA.waterFullHeight}
                                  onChange={(e) => handleTankDimensionChange('lowerTankA', 'waterFullHeight', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                  Water Empty Height (cm)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={settings.tankDimensions.lowerTankA.waterEmptyHeight}
                                  onChange={(e) => handleTankDimensionChange('lowerTankA', 'waterEmptyHeight', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {uiBehavior.showLowerTankB && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <SensorCheckbox
                            checked={settings.sensors.lowerTankB}
                            onChange={(checked) => handleSensorChange('lowerTankB', checked)}
                            label="Lower Tank B"
                            description={uiBehavior.enableLowerTankB 
                              ? "Monitor water level in lower tank B" 
                              : "Lower Tank B sensor is required for this topology"
                            }
                            color="blue"
                            disabled={!uiBehavior.enableLowerTankB}
                          />
                          {settings.sensors.lowerTankB && (
                            <button
                              onClick={() => toggleDimensionDropdown('lowerTankB')}
                              className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              <span>Dimensions</span>
                              {openDimensionDropdowns.lowerTankB ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        {settings.sensors.lowerTankB && openDimensionDropdowns.lowerTankB && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">Lower Tank B Dimensions</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                  Height (cm)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={settings.tankDimensions.lowerTankB.height}
                                  onChange={(e) => handleTankDimensionChange('lowerTankB', 'height', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                  Water Full Height (cm)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={settings.tankDimensions.lowerTankB.waterFullHeight}
                                  onChange={(e) => handleTankDimensionChange('lowerTankB', 'waterFullHeight', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                  Water Empty Height (cm)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={settings.tankDimensions.lowerTankB.waterEmptyHeight}
                                  onChange={(e) => handleTankDimensionChange('lowerTankB', 'waterEmptyHeight', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {uiBehavior.showUpperTankA && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <SensorCheckbox
                            checked={settings.sensors.upperTankA}
                            onChange={(checked) => handleSensorChange('upperTankA', checked)}
                            label="Upper Tank A"
                            description={uiBehavior.enableUpperTankA 
                              ? "Monitor water level in upper tank A" 
                              : "Upper Tank A sensor is required for this topology"
                            }
                            color="green"
                            disabled={!uiBehavior.enableUpperTankA}
                          />
                          {settings.sensors.upperTankA && (
                            <button
                              onClick={() => toggleDimensionDropdown('upperTankA')}
                              className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                            >
                              <span>Dimensions</span>
                              {openDimensionDropdowns.upperTankA ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        {settings.sensors.upperTankA && openDimensionDropdowns.upperTankA && (
                          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">Upper Tank A Dimensions</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                                  Height (cm)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={settings.tankDimensions.upperTankA.height}
                                  onChange={(e) => handleTankDimensionChange('upperTankA', 'height', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-green-300 dark:border-green-600 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                                  Water Full Height (cm)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={settings.tankDimensions.upperTankA.waterFullHeight}
                                  onChange={(e) => handleTankDimensionChange('upperTankA', 'waterFullHeight', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-green-300 dark:border-green-600 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                                  Water Empty Height (cm)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={settings.tankDimensions.upperTankA.waterEmptyHeight}
                                  onChange={(e) => handleTankDimensionChange('upperTankA', 'waterEmptyHeight', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-green-300 dark:border-green-600 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {uiBehavior.showUpperTankB && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <SensorCheckbox
                            checked={settings.sensors.upperTankB}
                            onChange={(checked) => handleSensorChange('upperTankB', checked)}
                            label="Upper Tank B"
                            description={uiBehavior.enableUpperTankB 
                              ? "Monitor water level in upper tank B" 
                              : "Upper Tank B sensor is required for this topology"
                            }
                            color="green"
                            disabled={!uiBehavior.enableUpperTankB}
                          />
                          {settings.sensors.upperTankB && (
                            <button
                              onClick={() => toggleDimensionDropdown('upperTankB')}
                              className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                            >
                              <span>Dimensions</span>
                              {openDimensionDropdowns.upperTankB ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        {settings.sensors.upperTankB && openDimensionDropdowns.upperTankB && (
                          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">Upper Tank B Dimensions</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                                  Height (cm)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={settings.tankDimensions.upperTankB.height}
                                  onChange={(e) => handleTankDimensionChange('upperTankB', 'height', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-green-300 dark:border-green-600 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                                  Water Full Height (cm)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={settings.tankDimensions.upperTankB.waterFullHeight}
                                  onChange={(e) => handleTankDimensionChange('upperTankB', 'waterFullHeight', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-green-300 dark:border-green-600 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                                  Water Empty Height (cm)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={settings.tankDimensions.upperTankB.waterEmptyHeight}
                                  onChange={(e) => handleTankDimensionChange('upperTankB', 'waterEmptyHeight', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1 text-xs border border-green-300 dark:border-green-600 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Motor Configuration */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Motor Configuration</h4>
                  <div className="space-y-4">
                    {uiBehavior.showMotor1 && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
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
                              }}
                              label="Motor 1"
                              color="blue"
                              disabled={!uiBehavior.enableMotor1}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {uiBehavior.enableMotor1 
                                ? "Enable/disable Motor 1 operation" 
                                : "Motor 1 is required for this topology"
                              }
                            </p>
                          </div>
                          {settings.motorSettings.motor1Enabled && (
                            <button
                              onClick={() => toggleTimerDropdown('motor1Timer')}
                              className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              <span>Safety Timer</span>
                              {openTimerDropdowns.motor1Timer ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        {settings.motorSettings.motor1Enabled && openTimerDropdowns.motor1Timer && (
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">Motor 1 Safety Timer</h5>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-700 dark:text-blue-300">Enable Auto Turn-off Timer</span>
                                <ToggleSwitch
                                  checked={settings.motorSettings.motor1Timer.enabled}
                                  onChange={(checked) => handleMotorTimerChange('motor1Timer', 'enabled', checked)}
                                  label=""
                                  color="blue"
                                />
                              </div>
                              {settings.motorSettings.motor1Timer.enabled && (
                                <div>
                                  <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                    Timer Duration (minutes)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="480"
                                    value={settings.motorSettings.motor1Timer.duration}
                                    onChange={(e) => handleMotorTimerChange('motor1Timer', 'duration', parseInt(e.target.value) || 30)}
                                    className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    Motor will automatically turn off after {settings.motorSettings.motor1Timer.duration} minutes for safety
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {uiBehavior.showMotor2 && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
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
                              }}
                              label="Motor 2"
                              color="green"
                              disabled={!uiBehavior.enableMotor2}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {uiBehavior.enableMotor2 
                                ? "Enable/disable Motor 2 operation" 
                                : "Motor 2 is required for this topology"
                              }
                            </p>
                          </div>
                          {settings.motorSettings.motor2Enabled && (
                            <button
                              onClick={() => toggleTimerDropdown('motor2Timer')}
                              className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                            >
                              <span>Safety Timer</span>
                              {openTimerDropdowns.motor2Timer ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        {settings.motorSettings.motor2Enabled && openTimerDropdowns.motor2Timer && (
                          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">Motor 2 Safety Timer</h5>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-green-700 dark:text-green-300">Enable Auto Turn-off Timer</span>
                                <ToggleSwitch
                                  checked={settings.motorSettings.motor2Timer.enabled}
                                  onChange={(checked) => handleMotorTimerChange('motor2Timer', 'enabled', checked)}
                                  label=""
                                  color="green"
                                />
                              </div>
                              {settings.motorSettings.motor2Timer.enabled && (
                                <div>
                                  <label className="block text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                                    Timer Duration (minutes)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="480"
                                    value={settings.motorSettings.motor2Timer.duration}
                                    onChange={(e) => handleMotorTimerChange('motor2Timer', 'duration', parseInt(e.target.value) || 30)}
                                    className="w-full px-2 py-1 text-xs border border-green-300 dark:border-green-600 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    Motor will automatically turn off after {settings.motorSettings.motor2Timer.duration} minutes for safety
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'automation' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Automation Settings</h3>
                
                {settings.mode === 'Auto Mode' ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Auto Mode Active</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        The system is configured for automatic operation. Motors will be controlled based on water levels and configured thresholds.
                      </p>
                    </div>
                    
                    {/* Tank-specific automation settings would go here */}
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>• Tank-specific automation settings will be available based on your sensor configuration</p>
                      <p>• Water level thresholds can be configured for each active sensor</p>
                      <p>• Motor coordination settings are managed automatically based on topology</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">Manual Mode Active</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      The system is in manual mode. All motor operations must be controlled manually from the dashboard.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Advanced Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Motor Control Settings */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Motor Control</h4>
                    <div className="space-y-3">
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
                        }}
                        label="Prevent Simultaneous Motors"
                        color="red"
                      />
                      {settings.topologySettings.systemTopology === 4 && (
                        <ToggleSwitch
                          checked={settings.topologySettings.syncBoreTransfer}
                          onChange={(checked) => {
                            setSettings(prev => ({
                              ...prev,
                              topologySettings: {
                                ...prev.topologySettings,
                                syncBoreTransfer: checked
                              }
                            }));
                          }}
                          label="Sync Bore-Transfer Motors"
                          color="green"
                        />
                      )}
                    </div>
                  </div>

                  {/* System Settings */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">System Settings</h4>
                    <div className="space-y-3">
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
                        }}
                        label="Enable Logging"
                        color="purple"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Parameters */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Advanced Parameters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Level Increase Min (mm)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={settings.topologySettings.levelIncreaseMin}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            topologySettings: {
                              ...prev.topologySettings,
                              levelIncreaseMin: parseInt(e.target.value) || 20
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Motor Timeout (s)
                      </label>
                      <input
                        type="number"
                        min="60"
                        max="600"
                        value={settings.topologySettings.motorTimeout}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            topologySettings: {
                              ...prev.topologySettings,
                              motorTimeout: parseInt(e.target.value) || 300
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Fault Cooldown (s)
                      </label>
                      <input
                        type="number"
                        min="60"
                        max="1800"
                        value={settings.topologySettings.faultCooldown}
                        onChange={(e) => {
                          setSettings(prev => ({
                            ...prev,
                            topologySettings: {
                              ...prev.topologySettings,
                              faultCooldown: parseInt(e.target.value) || 600
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};
