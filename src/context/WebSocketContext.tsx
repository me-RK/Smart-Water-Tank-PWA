import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { WebSocketMessage, AppState } from '../types';
import { initialAppState } from './WebSocketUtils';
import { WebSocketContext } from './WebSocketContextDefinition';
import type { WebSocketContextType } from './WebSocketContextDefinition';
import { Capacitor } from '@capacitor/core';
import { MOTOR_CONFIGURATION_LABELS } from '../constants/motorConfigurations';
import type { MotorConfigurationType } from '../constants/motorConfigurations';

// Re-export the context for easier imports
export { WebSocketContext };

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [reconnectInterval, setReconnectInterval] = useState<NodeJS.Timeout | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [deviceIP, setDeviceIP] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tankHost') || null;
    }
    return null;
  });
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const initialReconnectDelay = 1000; // 1 second

  // Local Network Access - iOS requirement
  const requestLocalNetworkAccess = useCallback(async () => {
    try {
      // iOS 14.5+ requires explicit permission
      if ('permissions' in navigator && 'query' in navigator.permissions) {
        const permission = await (navigator.permissions as { query: (options: { name: string }) => Promise<{ state: string }> }).query({
          name: 'local-network-access'
        });
        console.log('Local network permission:', permission.state);
      }
    } catch (err) {
      console.warn('Local network permission not available:', err);
    }
  }, []);

  // Parse incoming WebSocket messages - Enhanced for v3.0 firmware protocol
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      
      setAppState((prevState: AppState) => {
        const newState = { ...prevState };
        
        // Handle v3.0 message types
        switch (message.type) {
          case 'homeData': {
            // v3.0 Home data response
            newState.systemStatus = {
              ...prevState.systemStatus,
              connected: true,
              runtime: parseFloat(message.lastUpdate || '0'),
              mode: (message.systemMode as 'Auto Mode' | 'Manual Mode') || prevState.systemStatus.mode,
              motor1Status: message.motor1State || 'OFF',
              motor2Status: message.motor2State || 'OFF',
              motor1Enabled: message.motor1Enabled !== undefined ? message.motor1Enabled : prevState.systemStatus.motor1Enabled,
              motor2Enabled: message.motor2Enabled !== undefined ? message.motor2Enabled : prevState.systemStatus.motor2Enabled,
              motorStatus: message.motor1State === 'ON' || message.motor2State === 'ON' ? 'ON' : 'OFF', // Legacy compatibility
              autoModeReasonMotor1: message.autoReasonMotor1 || 'NONE',
              autoModeReasonMotor2: message.autoReasonMotor2 || 'NONE',
              autoModeReasons: message.autoReasonMotor1 || 'NONE', // Legacy compatibility
              motorConfig: message.motorConfig || 'SINGLE_TANK_SINGLE_MOTOR',
              lastUpdated: new Date().toISOString()
            };
            
            // Update tank data
            newState.tankData = {
              ...prevState.tankData,
              tankA: {
                upper: message.upperTankA !== undefined ? message.upperTankA : prevState.tankData.tankA.upper,
                lower: message.lowerTankA !== undefined ? message.lowerTankA : prevState.tankData.tankA.lower
              },
              tankB: {
                upper: message.upperTankB !== undefined ? message.upperTankB : prevState.tankData.tankB.upper,
                lower: message.lowerTankB !== undefined ? message.lowerTankB : prevState.tankData.tankB.lower
              }
            };
            
            // Update sensor enable states and topology settings
            newState.systemSettings = {
              ...prevState.systemSettings,
              sensors: {
                lowerTankA: message.lowerSensorAEnabled !== undefined ? message.lowerSensorAEnabled : prevState.systemSettings.sensors.lowerTankA,
                lowerTankB: message.lowerSensorBEnabled !== undefined ? message.lowerSensorBEnabled : prevState.systemSettings.sensors.lowerTankB,
                upperTankA: message.upperSensorAEnabled !== undefined ? message.upperSensorAEnabled : prevState.systemSettings.sensors.upperTankA,
                upperTankB: message.upperSensorBEnabled !== undefined ? message.upperSensorBEnabled : prevState.systemSettings.sensors.upperTankB
              },
              // v3.1 Topology settings from homeData
              topologySettings: {
                ...prevState.systemSettings.topologySettings,
                systemTopology: message.systemTopology !== undefined ? message.systemTopology : prevState.systemSettings.topologySettings.systemTopology,
                topologyLabel: message.topologyLabel || prevState.systemSettings.topologySettings.topologyLabel,
                autoMode: message.autoMode !== undefined ? message.autoMode : prevState.systemSettings.topologySettings.autoMode,
                preventSimultaneous: message.preventSimultaneous !== undefined ? message.preventSimultaneous : prevState.systemSettings.topologySettings.preventSimultaneous,
                syncBoreTransfer: message.syncBoreTransfer !== undefined ? message.syncBoreTransfer : prevState.systemSettings.topologySettings.syncBoreTransfer
              }
            };
            
            newState.isConnected = true;
            newState.error = null;
            break;
          }
            
          case 'settingData': {
            // v3.0 Settings data response
            const mode = message.systemMode || 'Manual Mode';
            
            // Handle new topology-based configuration
            if (message.config) {
              const topologyConfig = message.config;
              newState.systemSettings = {
                ...prevState.systemSettings,
                mode: topologyConfig.systemMode === 'auto' ? 'Auto Mode' : 'Manual Mode',
                topologySettings: {
                  ...prevState.systemSettings.topologySettings,
                  systemTopology: topologyConfig.topology,
                  topologyLabel: MOTOR_CONFIGURATION_LABELS[topologyConfig.topology as MotorConfigurationType] || 'Unknown',
                  autoMode: topologyConfig.systemMode === 'auto'
                },
                sensors: {
                  lowerTankA: topologyConfig.sensors.lowerTankA.enabled,
                  lowerTankB: topologyConfig.sensors.lowerTankB.enabled,
                  upperTankA: topologyConfig.sensors.upperTankA.enabled,
                  upperTankB: topologyConfig.sensors.upperTankB.enabled
                },
                motorSettings: {
                  ...prevState.systemSettings.motorSettings,
                  motor1Enabled: topologyConfig.motors.m1.enabled,
                  motor2Enabled: topologyConfig.motors.m2.enabled
                }
              };
              newState.isConnected = true;
              newState.error = null;
              break;
            }
            
            newState.systemSettings = {
              ...prevState.systemSettings,
              mode: mode as 'Auto Mode' | 'Manual Mode',
              motorSettings: {
                configuration: message.motorConfig || 'SINGLE_TANK_SINGLE_MOTOR',
                motor1Enabled: message.motor1Enabled !== undefined ? message.motor1Enabled : prevState.systemSettings.motorSettings.motor1Enabled,
                motor2Enabled: message.motor2Enabled !== undefined ? message.motor2Enabled : prevState.systemSettings.motorSettings.motor2Enabled,
                dualMotorSyncMode: message.dualMotorSyncMode || 'SIMULTANEOUS',
                motorAlternateInterval: 3600000, // Default 1 hour
                motor1Timer: {
                  enabled: message.motor1TimerEnabled !== undefined ? message.motor1TimerEnabled : prevState.systemSettings.motorSettings.motor1Timer.enabled,
                  duration: message.motor1TimerDuration !== undefined ? message.motor1TimerDuration : prevState.systemSettings.motorSettings.motor1Timer.duration
                },
                motor2Timer: {
                  enabled: message.motor2TimerEnabled !== undefined ? message.motor2TimerEnabled : prevState.systemSettings.motorSettings.motor2Timer.enabled,
                  duration: message.motor2TimerDuration !== undefined ? message.motor2TimerDuration : prevState.systemSettings.motorSettings.motor2Timer.duration
                }
              },
              tankAAutomation: {
                minAutoValue: message.minAutoValueA || 50,
                maxAutoValue: message.maxAutoValueA || 90,
                lowerThreshold: message.lowerThresholdA || 30,
                lowerOverflow: message.lowerOverflowA || 95,
                automationEnabled: message.tankAAutomationEnabled !== undefined ? message.tankAAutomationEnabled : prevState.systemSettings.tankAAutomation.automationEnabled
              },
              tankBAutomation: {
                minAutoValue: message.minAutoValueB || 50,
                maxAutoValue: message.maxAutoValueB || 90,
                lowerThreshold: message.lowerThresholdB || 30,
                lowerOverflow: message.lowerOverflowB || 95,
                automationEnabled: message.tankBAutomationEnabled !== undefined ? message.tankBAutomationEnabled : prevState.systemSettings.tankBAutomation.automationEnabled
              },
              // Legacy auto mode settings (for backward compatibility)
              autoMode: {
                minWaterLevel: message.minAutoValueA || 50,
                maxWaterLevel: message.maxAutoValueA || 90,
                specialFunctions: {
                  upperTankOverFlowLock: message.upperTankOverFlowLock !== undefined ? message.upperTankOverFlowLock : prevState.systemSettings.autoMode.specialFunctions.upperTankOverFlowLock,
                  lowerTankOverFlowLock: message.lowerTankOverFlowLock !== undefined ? message.lowerTankOverFlowLock : prevState.systemSettings.autoMode.specialFunctions.lowerTankOverFlowLock,
                  syncBothTank: message.syncBothTank !== undefined ? message.syncBothTank : prevState.systemSettings.autoMode.specialFunctions.syncBothTank,
                  buzzerAlert: message.buzzerAlert !== undefined ? message.buzzerAlert : prevState.systemSettings.autoMode.specialFunctions.buzzerAlert
                }
              },
              sensors: {
                lowerTankA: message.lowerSensorAEnabled !== undefined ? message.lowerSensorAEnabled : prevState.systemSettings.sensors.lowerTankA,
                lowerTankB: message.lowerSensorBEnabled !== undefined ? message.lowerSensorBEnabled : prevState.systemSettings.sensors.lowerTankB,
                upperTankA: message.upperSensorAEnabled !== undefined ? message.upperSensorAEnabled : prevState.systemSettings.sensors.upperTankA,
                upperTankB: message.upperSensorBEnabled !== undefined ? message.upperSensorBEnabled : prevState.systemSettings.sensors.upperTankB
              },
              tankDimensions: {
                upperTankA: {
                  height: message.upperTankHeightA || 75,
                  waterFullHeight: message.upperWaterFullHeightA || 5,    // Distance when full
                  waterEmptyHeight: message.upperWaterEmptyHeightA || 70  // Distance when empty
                },
                upperTankB: {
                  height: message.upperTankHeightB || 75,
                  waterFullHeight: message.upperWaterFullHeightB || 5,    // Distance when full
                  waterEmptyHeight: message.upperWaterEmptyHeightB || 70  // Distance when empty
                },
                lowerTankA: {
                  height: message.lowerTankHeightA || 75,
                  waterFullHeight: message.lowerWaterFullHeightA || 5,    // Distance when full
                  waterEmptyHeight: message.lowerWaterEmptyHeightA || 70  // Distance when empty
                },
                lowerTankB: {
                  height: message.lowerTankHeightB || 75,
                  waterFullHeight: message.lowerWaterFullHeightB || 5,    // Distance when full
                  waterEmptyHeight: message.lowerWaterEmptyHeightB || 70  // Distance when empty
                }
              },
              sensorCalibration: {
                upperTankA: message.upperSensorOffsetA || 0,
                lowerTankA: message.lowerSensorOffsetA || 0,
                upperTankB: message.upperSensorOffsetB || 0,
                lowerTankB: message.lowerSensorOffsetB || 0
              },
              sensorLimits: {
                minReading: message.minSensorReading || 20,
                maxReading: message.maxSensorReading || 4000
              },
              macAddress: message.macAddress || prevState.systemSettings.macAddress,
              // v3.1 Topology settings
              topologySettings: {
                systemTopology: message.systemTopology !== undefined ? message.systemTopology : prevState.systemSettings.topologySettings.systemTopology,
                topologyLabel: message.topologyLabel || prevState.systemSettings.topologySettings.topologyLabel,
                autoMode: message.autoMode !== undefined ? message.autoMode : prevState.systemSettings.topologySettings.autoMode,
                preventSimultaneous: message.preventSimultaneous !== undefined ? message.preventSimultaneous : prevState.systemSettings.topologySettings.preventSimultaneous,
                syncBoreTransfer: message.syncBoreTransfer !== undefined ? message.syncBoreTransfer : prevState.systemSettings.topologySettings.syncBoreTransfer,
                levelIncreaseMin: message.levelIncreaseMin !== undefined ? message.levelIncreaseMin : prevState.systemSettings.topologySettings.levelIncreaseMin,
                levelIncreaseWindow: message.levelIncreaseWindow !== undefined ? message.levelIncreaseWindow : prevState.systemSettings.topologySettings.levelIncreaseWindow,
                motorTimeout: message.motorTimeout !== undefined ? message.motorTimeout : prevState.systemSettings.topologySettings.motorTimeout,
                faultCooldown: message.faultCooldown !== undefined ? message.faultCooldown : prevState.systemSettings.topologySettings.faultCooldown,
                maxRetryAttempts: message.maxRetryAttempts !== undefined ? message.maxRetryAttempts : prevState.systemSettings.topologySettings.maxRetryAttempts,
                logEnabled: message.logEnabled !== undefined ? message.logEnabled : prevState.systemSettings.topologySettings.logEnabled
              }
            };
            
            // Update system status mode to match settings
            newState.systemStatus = {
              ...prevState.systemStatus,
              mode: mode as 'Auto Mode' | 'Manual Mode',
              connected: true,
              motorConfig: message.motorConfig || 'SINGLE_TANK_SINGLE_MOTOR',
              motor1Enabled: message.motor1Enabled !== undefined ? message.motor1Enabled : prevState.systemStatus.motor1Enabled,
              motor2Enabled: message.motor2Enabled !== undefined ? message.motor2Enabled : prevState.systemStatus.motor2Enabled
            };
            
            newState.isConnected = true;
            newState.error = null;
            break;
          }
            
          case 'motorState': {
            // v3.0 Motor state update
            if (message.motor === 1) {
              newState.systemStatus = {
                ...prevState.systemStatus,
                motor1Status: message.state || 'OFF',
                motorStatus: message.state === 'ON' ? 'ON' : (newState.systemStatus.motor2Status === 'ON' ? 'ON' : 'OFF'), // Legacy compatibility
                lastUpdated: new Date().toISOString()
              };
            } else if (message.motor === 2) {
              newState.systemStatus = {
                ...prevState.systemStatus,
                motor2Status: message.state || 'OFF',
                motorStatus: message.state === 'ON' ? 'ON' : (newState.systemStatus.motor1Status === 'ON' ? 'ON' : 'OFF'), // Legacy compatibility
                lastUpdated: new Date().toISOString()
              };
            }
            newState.isConnected = true;
            break;
          }
            
          case 'sensorData': {
            // v3.0 Sensor data response
            newState.tankData = {
              ...prevState.tankData,
              tankA: {
                upper: message.upperTankAPercent !== undefined ? message.upperTankAPercent : prevState.tankData.tankA.upper,
                lower: message.lowerTankAPercent !== undefined ? message.lowerTankAPercent : prevState.tankData.tankA.lower
              },
              tankB: {
                upper: message.upperTankBPercent !== undefined ? message.upperTankBPercent : prevState.tankData.tankB.upper,
                lower: message.lowerTankBPercent !== undefined ? message.lowerTankBPercent : prevState.tankData.tankB.lower
              }
            };
            newState.isConnected = true;
            newState.error = null;
            break;
          }
            
          case 'allData': {
            // v3.0 Unified data response - combines home, settings, and sensor data
            console.log('WebSocket - Received allData:', message);
            const mode = message.systemMode || 'Manual Mode';
            
            // Update system status
            newState.systemStatus = {
              ...prevState.systemStatus,
              connected: true,
              runtime: parseFloat(message.lastUpdate || '0'),
              mode: mode as 'Auto Mode' | 'Manual Mode',
              motor1Status: message.motor1State || 'OFF',
              motor2Status: message.motor2State || 'OFF',
              motor1Enabled: message.motor1Enabled !== undefined ? message.motor1Enabled : prevState.systemStatus.motor1Enabled,
              motor2Enabled: message.motor2Enabled !== undefined ? message.motor2Enabled : prevState.systemStatus.motor2Enabled,
              motorStatus: message.motor1State === 'ON' || message.motor2State === 'ON' ? 'ON' : 'OFF',
              autoModeReasonMotor1: message.autoReasonMotor1 || 'NONE',
              autoModeReasonMotor2: message.autoReasonMotor2 || 'NONE',
              autoModeReasons: message.autoReasonMotor1 || 'NONE',
              motorConfig: message.motorConfig || 'SINGLE_TANK_SINGLE_MOTOR',
              lastUpdated: new Date().toISOString()
            };
            
            // Update tank data
            newState.tankData = {
              ...prevState.tankData,
              tankA: {
                upper: message.upperTankA !== undefined ? message.upperTankA : (message.upperTankAPercent !== undefined ? message.upperTankAPercent : prevState.tankData.tankA.upper),
                lower: message.lowerTankA !== undefined ? message.lowerTankA : (message.lowerTankAPercent !== undefined ? message.lowerTankAPercent : prevState.tankData.tankA.lower)
              },
              tankB: {
                upper: message.upperTankB !== undefined ? message.upperTankB : (message.upperTankBPercent !== undefined ? message.upperTankBPercent : prevState.tankData.tankB.upper),
                lower: message.lowerTankB !== undefined ? message.lowerTankB : (message.lowerTankBPercent !== undefined ? message.lowerTankBPercent : prevState.tankData.tankB.lower)
              }
            };
            
            // Update system settings
            newState.systemSettings = {
              ...prevState.systemSettings,
              mode: mode as 'Auto Mode' | 'Manual Mode',
              motorSettings: {
                configuration: message.motorConfig || 'SINGLE_TANK_SINGLE_MOTOR',
                motor1Enabled: message.motor1Enabled !== undefined ? message.motor1Enabled : prevState.systemSettings.motorSettings.motor1Enabled,
                motor2Enabled: message.motor2Enabled !== undefined ? message.motor2Enabled : prevState.systemSettings.motorSettings.motor2Enabled,
                dualMotorSyncMode: message.dualMotorSyncMode || 'SIMULTANEOUS',
                motorAlternateInterval: 3600000,
                motor1Timer: {
                  enabled: message.motor1TimerEnabled !== undefined ? message.motor1TimerEnabled : prevState.systemSettings.motorSettings.motor1Timer.enabled,
                  duration: message.motor1TimerDuration !== undefined ? message.motor1TimerDuration : prevState.systemSettings.motorSettings.motor1Timer.duration
                },
                motor2Timer: {
                  enabled: message.motor2TimerEnabled !== undefined ? message.motor2TimerEnabled : prevState.systemSettings.motorSettings.motor2Timer.enabled,
                  duration: message.motor2TimerDuration !== undefined ? message.motor2TimerDuration : prevState.systemSettings.motorSettings.motor2Timer.duration
                }
              },
              tankAAutomation: {
                minAutoValue: message.minAutoValueA || 50,
                maxAutoValue: message.maxAutoValueA || 90,
                lowerThreshold: message.lowerThresholdA || 30,
                lowerOverflow: message.lowerOverflowA || 95,
                automationEnabled: message.tankAAutomationEnabled !== undefined ? message.tankAAutomationEnabled : prevState.systemSettings.tankAAutomation.automationEnabled
              },
              tankBAutomation: {
                minAutoValue: message.minAutoValueB || 50,
                maxAutoValue: message.maxAutoValueB || 90,
                lowerThreshold: message.lowerThresholdB || 30,
                lowerOverflow: message.lowerOverflowB || 95,
                automationEnabled: message.tankBAutomationEnabled !== undefined ? message.tankBAutomationEnabled : prevState.systemSettings.tankBAutomation.automationEnabled
              },
              autoMode: {
                minWaterLevel: message.minAutoValueA || 50,
                maxWaterLevel: message.maxAutoValueA || 90,
                specialFunctions: {
                  upperTankOverFlowLock: message.upperTankOverFlowLock !== undefined ? message.upperTankOverFlowLock : prevState.systemSettings.autoMode.specialFunctions.upperTankOverFlowLock,
                  lowerTankOverFlowLock: message.lowerTankOverFlowLock !== undefined ? message.lowerTankOverFlowLock : prevState.systemSettings.autoMode.specialFunctions.lowerTankOverFlowLock,
                  syncBothTank: message.syncBothTank !== undefined ? message.syncBothTank : prevState.systemSettings.autoMode.specialFunctions.syncBothTank,
                  buzzerAlert: message.buzzerAlert !== undefined ? message.buzzerAlert : prevState.systemSettings.autoMode.specialFunctions.buzzerAlert
                }
              },
              sensors: {
                lowerTankA: message.lowerSensorAEnabled !== undefined ? message.lowerSensorAEnabled : prevState.systemSettings.sensors.lowerTankA,
                lowerTankB: message.lowerSensorBEnabled !== undefined ? message.lowerSensorBEnabled : prevState.systemSettings.sensors.lowerTankB,
                upperTankA: message.upperSensorAEnabled !== undefined ? message.upperSensorAEnabled : prevState.systemSettings.sensors.upperTankA,
                upperTankB: message.upperSensorBEnabled !== undefined ? message.upperSensorBEnabled : prevState.systemSettings.sensors.upperTankB
              },
              tankDimensions: {
                upperTankA: {
                  height: message.upperTankHeightA || 75,
                  waterFullHeight: message.upperWaterFullHeightA || 5,
                  waterEmptyHeight: message.upperWaterEmptyHeightA || 70
                },
                upperTankB: {
                  height: message.upperTankHeightB || 75,
                  waterFullHeight: message.upperWaterFullHeightB || 5,
                  waterEmptyHeight: message.upperWaterEmptyHeightB || 70
                },
                lowerTankA: {
                  height: message.lowerTankHeightA || 75,
                  waterFullHeight: message.lowerWaterFullHeightA || 5,
                  waterEmptyHeight: message.lowerWaterEmptyHeightA || 70
                },
                lowerTankB: {
                  height: message.lowerTankHeightB || 75,
                  waterFullHeight: message.lowerWaterFullHeightB || 5,
                  waterEmptyHeight: message.lowerWaterEmptyHeightB || 70
                }
              },
              sensorCalibration: {
                upperTankA: message.upperSensorOffsetA || 0,
                lowerTankA: message.lowerSensorOffsetA || 0,
                upperTankB: message.upperSensorOffsetB || 0,
                lowerTankB: message.lowerSensorOffsetB || 0
              },
              sensorLimits: {
                minReading: message.minSensorReading || 20,
                maxReading: message.maxSensorReading || 4000
              },
              macAddress: message.macAddress || prevState.systemSettings.macAddress,
              // v3.1 Topology settings
              topologySettings: {
                systemTopology: message.systemTopology !== undefined ? message.systemTopology : prevState.systemSettings.topologySettings.systemTopology,
                topologyLabel: message.topologyLabel || prevState.systemSettings.topologySettings.topologyLabel,
                autoMode: message.autoMode !== undefined ? message.autoMode : prevState.systemSettings.topologySettings.autoMode,
                preventSimultaneous: message.preventSimultaneous !== undefined ? message.preventSimultaneous : prevState.systemSettings.topologySettings.preventSimultaneous,
                syncBoreTransfer: message.syncBoreTransfer !== undefined ? message.syncBoreTransfer : prevState.systemSettings.topologySettings.syncBoreTransfer,
                levelIncreaseMin: message.levelIncreaseMin !== undefined ? message.levelIncreaseMin : prevState.systemSettings.topologySettings.levelIncreaseMin,
                levelIncreaseWindow: message.levelIncreaseWindow !== undefined ? message.levelIncreaseWindow : prevState.systemSettings.topologySettings.levelIncreaseWindow,
                motorTimeout: message.motorTimeout !== undefined ? message.motorTimeout : prevState.systemSettings.topologySettings.motorTimeout,
                faultCooldown: message.faultCooldown !== undefined ? message.faultCooldown : prevState.systemSettings.topologySettings.faultCooldown,
                maxRetryAttempts: message.maxRetryAttempts !== undefined ? message.maxRetryAttempts : prevState.systemSettings.topologySettings.maxRetryAttempts,
                logEnabled: message.logEnabled !== undefined ? message.logEnabled : prevState.systemSettings.topologySettings.logEnabled
              }
            };
            
            newState.isConnected = true;
            newState.error = null;
            
            // Debug logging for sensor states
            console.log('WebSocket - Updated sensor states:', newState.systemSettings.sensors);
            console.log('WebSocket - Updated tank data:', newState.tankData);
            console.log('WebSocket - Updated topology settings:', newState.systemSettings.topologySettings);
            break;
          }
            
          case 'configUpdate':
          case 'wifiConfigUpdate': {
            // Configuration update acknowledgment
            newState.isConnected = true;
            newState.error = null;
            break;
          }
            
          case 'systemReset': {
            // System reset acknowledgment
            newState.isConnected = false;
            break;
          }
            
          default: {
            // Handle legacy message types for backward compatibility
        if (message.MSV !== undefined && message.RTV === undefined && message.SM === undefined) {
              // Legacy motor status acknowledgment
          newState.systemStatus = {
            ...prevState.systemStatus,
            motorStatus: message.MSV === 'ON' || message.MSV === true ? 'ON' : 'OFF',
            lastUpdated: new Date().toISOString()
          };
          newState.isConnected = true;
            } else if (message.RTV !== undefined || message.SM !== undefined || message.MSV !== undefined) {
              // Legacy home data response
          newState.systemStatus = {
            ...prevState.systemStatus,
            connected: true,
            runtime: parseFloat(message.RTV || '0'),
            mode: message.SM || prevState.systemStatus.mode,
            motorStatus: message.MSV === 'ON' || message.MSV === true ? 'ON' : 'OFF',
            autoModeReasons: message.AMR || 'NONE',
            lastUpdated: new Date().toISOString()
          };
          
          // Update tank data only if provided
          if (message.UTWLA !== undefined || message.LTWLA !== undefined) {
            newState.tankData = {
              ...prevState.tankData,
              tankA: {
                upper: message.UTWLA || prevState.tankData.tankA.upper,
                lower: message.LTWLA || prevState.tankData.tankA.lower
              },
              tankB: {
                upper: message.UTWLB || prevState.tankData.tankB.upper,
                lower: message.LTWLB || prevState.tankData.tankB.lower
              }
            };
          }
          
              newState.isConnected = true;
              newState.error = null;
            }
          }
        }
        
        return newState;
      });
    } catch {
      setAppState((prev: AppState) => ({ ...prev, error: 'Failed to parse ESP32 message' }));
    }
  }, []);


  // Connect to WebSocket with enhanced auto-reconnect
  const connect = useCallback((ip: string) => {
    if (!ip) {
      setLastError('No device IP provided');
      return;
    }

    // Don't create multiple connections
    if (ws?.readyState === WebSocket.CONNECTING || 
        ws?.readyState === WebSocket.OPEN) {
      console.log('Connection already exists');
      return;
    }

    try {
      // Log platform information for debugging
      const platform = Capacitor.getPlatform();
      const isNative = Capacitor.isNativePlatform();
      console.log(`WebSocket - Platform: ${platform}, Native: ${isNative}`);

      // Use ws:// for HTTP (development) or http (local network)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${ip}:81`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      setIsReconnecting(true);

      const newWs = new WebSocket(wsUrl);

      newWs.onopen = () => {
        console.log('WebSocket connected successfully to:', wsUrl);
        setAppState((prev: AppState) => ({ 
          ...prev, 
          isConnected: true, 
          error: null,
          systemStatus: { ...prev.systemStatus, connected: true }
        }));
        setIsReconnecting(false);
        reconnectAttemptsRef.current = 0;
        setLastError(null);

        // Request all data on connection
        newWs.send('getAllData');
        
        // Store successful IP
        if (typeof window !== 'undefined') {
          localStorage.setItem('tankHost', ip);
        }
        setDeviceIP(ip);
      };

      newWs.onmessage = handleMessage;

      newWs.onerror = (event) => {
        const errorMsg = `WebSocket error: ${event.type}`;
        console.error('WebSocket connection error:', errorMsg, 'URL:', wsUrl);
        setLastError(errorMsg);
        setIsReconnecting(false);
        setAppState((prev: AppState) => ({ 
          ...prev, 
          error: errorMsg,
          isConnected: false
        }));
      };

      newWs.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setAppState((prev: AppState) => ({ 
          ...prev, 
          isConnected: false,
          systemStatus: { ...prev.systemStatus, connected: false }
        }));
        setWs(null);
        
        // Only auto-reconnect if it wasn't a manual disconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts && event.code !== 1000) {
          const delay = initialReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          reconnectAttemptsRef.current++;
          
          console.log(`Auto-reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect(ip);
          }, delay);
        } else {
          setIsReconnecting(false);
          if (event.code !== 1000) {
            setLastError('Max reconnection attempts reached');
          }
        }
      };

      setWs(newWs);
    } catch (err) {
      const errorMsg = `Connection error: ${err}`;
      console.error('Failed to create WebSocket connection:', errorMsg, 'IP:', ip);
      setLastError(errorMsg);
      setIsReconnecting(false);
      setAppState((prev: AppState) => ({ 
        ...prev, 
        error: errorMsg,
        isConnected: false
      }));
    }
  }, [handleMessage, ws?.readyState]);

  // Handle device IP change
  const handleSetDeviceIP = useCallback((ip: string) => {
    setDeviceIP(ip);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tankHost', ip);
    }
    
    // Close existing connection if any
    if (ws) {
      ws.close();
    }
    
    // Connect to new device
    connect(ip);
  }, [connect, ws]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      setReconnectInterval(null);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (ws) {
      ws.close();
      setWs(null);
    }
    setAppState((prev: AppState) => ({ 
      ...prev, 
      isConnected: false,
      systemStatus: { ...prev.systemStatus, connected: false }
    }));
  }, [ws, reconnectInterval]);

  // Send message through WebSocket - Enhanced for v3.0 firmware protocol
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        // Handle different message types using v3.0 protocol
        switch (message.type as string) {
          case 'motor1On':
            ws.send('motor1On');
            break;
          case 'motor1Off':
            ws.send('motor1Off');
            break;
          case 'motor2On':
            ws.send('motor2On');
            break;
          case 'motor2Off':
            ws.send('motor2Off');
            break;
          case 'motorControl':
            // Legacy motor control - default to motor 1
            if (message.motorOn) {
              ws.send('motor1On');
            } else {
              ws.send('motor1Off');
            }
            break;
          case 'settingData':
            // Send new topology-based configuration
            if (message.config) {
              ws.send(JSON.stringify({
                type: 'settingData',
                config: message.config
              }));
            }
            break;
          case 'updateSettings':
            // Send v3.0 settings update as JSON
            if (message.settings) {
              const settingsMessage = {
                systemMode: message.settings.mode,
                motorConfig: message.settings.motorSettings.configuration,
                motor1Enabled: message.settings.motorSettings.motor1Enabled,
                motor2Enabled: message.settings.motorSettings.motor2Enabled,
                dualMotorSyncMode: message.settings.motorSettings.dualMotorSyncMode,
                minAutoValueA: message.settings.tankAAutomation.minAutoValue,
                maxAutoValueA: message.settings.tankAAutomation.maxAutoValue,
                lowerThresholdA: message.settings.tankAAutomation.lowerThreshold,
                lowerOverflowA: message.settings.tankAAutomation.lowerOverflow,
                minAutoValueB: message.settings.tankBAutomation.minAutoValue,
                maxAutoValueB: message.settings.tankBAutomation.maxAutoValue,
                lowerThresholdB: message.settings.tankBAutomation.lowerThreshold,
                lowerOverflowB: message.settings.tankBAutomation.lowerOverflow,
                upperTankHeightA: message.settings.tankDimensions.upperTankA.height,
                upperWaterFullHeightA: message.settings.tankDimensions.upperTankA.waterFullHeight,
                upperWaterEmptyHeightA: message.settings.tankDimensions.upperTankA.waterEmptyHeight,
                lowerTankHeightA: message.settings.tankDimensions.lowerTankA.height,
                lowerWaterFullHeightA: message.settings.tankDimensions.lowerTankA.waterFullHeight,
                lowerWaterEmptyHeightA: message.settings.tankDimensions.lowerTankA.waterEmptyHeight,
                upperTankHeightB: message.settings.tankDimensions.upperTankB.height,
                upperWaterFullHeightB: message.settings.tankDimensions.upperTankB.waterFullHeight,
                upperWaterEmptyHeightB: message.settings.tankDimensions.upperTankB.waterEmptyHeight,
                lowerTankHeightB: message.settings.tankDimensions.lowerTankB.height,
                lowerWaterFullHeightB: message.settings.tankDimensions.lowerTankB.waterFullHeight,
                lowerWaterEmptyHeightB: message.settings.tankDimensions.lowerTankB.waterEmptyHeight,
                lowerSensorAEnable: message.settings.sensors.lowerTankA,
                lowerSensorBEnable: message.settings.sensors.lowerTankB,
                upperSensorAEnable: message.settings.sensors.upperTankA,
                upperSensorBEnable: message.settings.sensors.upperTankB,
                upperTankOverFlowLock: message.settings.autoMode.specialFunctions.upperTankOverFlowLock,
                lowerTankOverFlowLock: message.settings.autoMode.specialFunctions.lowerTankOverFlowLock,
                syncBothTank: message.settings.autoMode.specialFunctions.syncBothTank,
                buzzerAlert: message.settings.autoMode.specialFunctions.buzzerAlert,
                tankAAutomationEnabled: message.settings.tankAAutomation.automationEnabled,
                tankBAutomationEnabled: message.settings.tankBAutomation.automationEnabled
              };
              ws.send(JSON.stringify(settingsMessage));
            }
            break;
          case 'wifiConfig':
            // Send v3.0 WiFi configuration
            if (message.MODE && message.SSID && message.PASS) {
              const wifiMessage = {
                MODE: message.MODE,
                SSID: message.SSID,
                PASS: message.PASS,
                SIP0: message.SIP0,
                SIP1: message.SIP1,
                SIP2: message.SIP2,
                SIP3: message.SIP3,
                SG0: message.SG0,
                SG1: message.SG1,
                SG2: message.SG2,
                SG3: message.SG3,
                SS0: message.SS0,
                SS1: message.SS1,
                SS2: message.SS2,
                SS3: message.SS3,
                SPD0: message.SPD0,
                SPD1: message.SPD1,
                SPD2: message.SPD2,
                SPD3: message.SPD3
              };
              ws.send(JSON.stringify(wifiMessage));
            }
            break;
          case 'systemReset':
            ws.send('systemReset');
            break;
          case 'getHomeData':
            ws.send('getHomeData');
            break;
          case 'getSettingData':
            ws.send('getSettingData');
            break;
          case 'getSensorData':
            ws.send('getSensorData');
            break;
          case 'getAllData':
            // Unified request for all data - more efficient than multiple separate requests
            ws.send('getAllData');
            break;
          case 'getWiFiConfig':
            ws.send('getWiFiConfig');
            break;
          case 'homeData':
            // Request home data
            ws.send('getHomeData');
            break;
          case 'settingsData':
            // Request settings data
            ws.send('getSettingData');
            break;
          default:
            // Default: request both home and settings data
            ws.send('getHomeData');
            ws.send('getSettingData');
        }
        
      } catch {
        setAppState((prev: AppState) => ({ 
          ...prev, 
          error: 'Failed to send message to server'
        }));
      }
    } else {
      setAppState((prev: AppState) => ({ 
        ...prev, 
        error: 'Not connected to server'
      }));
    }
  }, [ws]);


  // Request local network access on mount
  useEffect(() => {
    requestLocalNetworkAccess();
  }, [requestLocalNetworkAccess]);

  // Auto-connect to stored device
  useEffect(() => {
    if (deviceIP && !appState.isConnected && !isReconnecting) {
      connect(deviceIP);
    }
  }, [deviceIP, appState.isConnected, isReconnecting, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (reconnectInterval) {
        clearTimeout(reconnectInterval);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [ws, reconnectInterval]);


  // Memoize the context value to prevent unnecessary re-renders
  const value: WebSocketContextType = useMemo(() => ({
    appState,
    sendMessage,
    connect,
    disconnect,
    isConnected: appState.isConnected,
    error: appState.error,
    isReconnecting,
    lastError,
    deviceIP,
    setDeviceIP: handleSetDeviceIP
  }), [appState, sendMessage, connect, disconnect, isReconnecting, lastError, deviceIP, handleSetDeviceIP]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};