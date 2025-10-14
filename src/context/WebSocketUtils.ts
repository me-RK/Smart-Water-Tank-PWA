import type { AppState } from '../types';
import { DEFAULT_MOTOR_CONFIGURATION } from '../constants/motorConfigurations';

export const initialAppState: AppState = {
  systemStatus: {
    connected: false,
    lastUpdated: new Date().toISOString(),
    runtime: 0,
    
    // v3.0 Motor states
    motor1Status: 'OFF',
    motor2Status: 'OFF',
    motor1Enabled: true,
    motor2Enabled: false,
    
    // Legacy motor status (for backward compatibility)
    motorStatus: 'OFF',
    
    mode: 'Manual Mode',
    
    // v3.0 Automation reasons
    autoModeReasonMotor1: 'NONE',
    autoModeReasonMotor2: 'NONE',
    
    // Legacy auto mode reasons (for backward compatibility)
    autoModeReasons: 'NONE',
    
    // Motor configuration
    motorConfig: DEFAULT_MOTOR_CONFIGURATION
  },
  systemSettings: {
    mode: 'Manual Mode',
    
    // v3.0 Motor configuration
    motorSettings: {
      configuration: DEFAULT_MOTOR_CONFIGURATION,
      motor1Enabled: true,
      motor2Enabled: false,
      dualMotorSyncMode: 'SIMULTANEOUS',
      motorAlternateInterval: 3600000, // 1 hour in milliseconds
      motor1Timer: {
        enabled: false,
        duration: 30 // 30 minutes default
      },
      motor2Timer: {
        enabled: false,
        duration: 30 // 30 minutes default
      }
    },
    
    // v3.0 Tank-specific automation settings
    tankAAutomation: {
      minAutoValue: 50,
      maxAutoValue: 90,
      lowerThreshold: 30,
      lowerOverflow: 95,
      automationEnabled: true
    },
    tankBAutomation: {
      minAutoValue: 50,
      maxAutoValue: 90,
      lowerThreshold: 30,
      lowerOverflow: 95,
      automationEnabled: false
    },
    
    // v3.1 Topology settings
    topologySettings: {
      systemTopology: 1,
      topologyLabel: 'Dual UG | Dual OH | Dual Motor',
      autoMode: false,
      preventSimultaneous: true,
      syncBoreTransfer: true,
      levelIncreaseMin: 20,
      levelIncreaseWindow: 20,
      motorTimeout: 300,
      faultCooldown: 600,
      maxRetryAttempts: 3,
      logEnabled: true
    },
    
    // Legacy auto mode settings (for backward compatibility)
    autoMode: {
      minWaterLevel: 50,
      maxWaterLevel: 90,
      specialFunctions: {
        upperTankOverFlowLock: true,
        lowerTankOverFlowLock: true,
        syncBothTank: true,
        buzzerAlert: true
      }
    },
    manualMode: {
      motorControl: false
    },
    sensors: {
      lowerTankA: false,
      lowerTankB: false,
      upperTankA: false,
      upperTankB: false
    },
    tankDimensions: {
      upperTankA: { height: 75, waterFullHeight: 5, waterEmptyHeight: 70 },    // Distance when full/empty
      upperTankB: { height: 75, waterFullHeight: 5, waterEmptyHeight: 70 },    // Distance when full/empty
      lowerTankA: { height: 75, waterFullHeight: 5, waterEmptyHeight: 70 },    // Distance when full/empty
      lowerTankB: { height: 75, waterFullHeight: 5, waterEmptyHeight: 70 }     // Distance when full/empty
    },
    sensorCalibration: {
      upperTankA: 0,    // Offset for upper sensor A (cm)
      lowerTankA: 0,    // Offset for lower sensor A (cm)
      upperTankB: 0,    // Offset for upper sensor B (cm)
      lowerTankB: 0     // Offset for lower sensor B (cm)
    },
    sensorLimits: {
      minReading: 20,   // Minimum valid sensor reading (mm)
      maxReading: 4000  // Maximum valid sensor reading (mm)
    }
  },
  tankData: {
    tankA: { upper: 0, lower: 0 },
    tankB: { upper: 0, lower: 0 }
  },
  isConnected: false,
  error: null
};
