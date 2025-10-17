// Type definitions for the Smart Water Tank web app
import type { MotorConfigurationType } from '../constants/motorConfigurations';

export interface TankLevel {
  upper: number;
  lower: number;
}

export interface TankDimensions {
  height: number;
  waterFullHeight: number;    // Distance from sensor when tank is full (cm)
  waterEmptyHeight: number;   // Distance from sensor when tank is empty (cm)
}

export interface SensorCalibration {
  upperTankA: number;         // Offset for upper sensor A (cm)
  lowerTankA: number;         // Offset for lower sensor A (cm)
  upperTankB: number;         // Offset for upper sensor B (cm)
  lowerTankB: number;         // Offset for lower sensor B (cm)
}

export interface SensorLimits {
  minReading: number;         // Minimum valid sensor reading (mm)
  maxReading: number;         // Maximum valid sensor reading (mm)
}

export interface TankData {
  tankA: TankLevel;
  tankB: TankLevel;
}

export type MotorConfiguration = MotorConfigurationType;

export type DualMotorSyncMode = 'SIMULTANEOUS' | 'ALTERNATE' | 'PRIMARY_BACKUP';

export interface MotorSettings {
  configuration: MotorConfiguration;
  motor1Enabled: boolean;
  motor2Enabled: boolean;
  dualMotorSyncMode: DualMotorSyncMode;
  motorAlternateInterval: number;
  motor1Timer: {
    enabled: boolean;
    duration: number; // in minutes
  };
  motor2Timer: {
    enabled: boolean;
    duration: number; // in minutes
  };
}

export interface TankAutomationSettings {
  minAutoValue: number;
  maxAutoValue: number;
  lowerThreshold: number;
  lowerOverflow: number;
  automationEnabled: boolean;
}

export interface TopologySettings {
  systemTopology: number; // 1-6
  topologyLabel: string;
  autoMode: boolean;
  preventSimultaneous: boolean;
  syncBoreTransfer: boolean;
  levelIncreaseMin: number; // mm
  levelIncreaseWindow: number; // seconds
  motorTimeout: number; // seconds
  faultCooldown: number; // seconds
  maxRetryAttempts: number;
  logEnabled: boolean;
}

// New topology-based configuration structure
export interface TopologyConfig {
  topology: number; // 1-6
  systemMode: 'auto' | 'manual';
  sensors: {
    upperTankA: {
      enabled: boolean;
      tankHeight: number; // TH - Total height of the tank
      tankWaterFullHeight: number; // TWFH - Sensor distance reading when tank is full
      tankWaterEmptyHeight: number; // TWEH - Sensor distance reading when tank is empty
    };
    lowerTankA: {
      enabled: boolean;
      tankHeight: number; // TH - Total height of the tank
      tankWaterFullHeight: number; // TWFH - Sensor distance reading when tank is full
      tankWaterEmptyHeight: number; // TWEH - Sensor distance reading when tank is empty
    };
    upperTankB: {
      enabled: boolean;
      tankHeight: number; // TH - Total height of the tank
      tankWaterFullHeight: number; // TWFH - Sensor distance reading when tank is full
      tankWaterEmptyHeight: number; // TWEH - Sensor distance reading when tank is empty
    };
    lowerTankB: {
      enabled: boolean;
      tankHeight: number; // TH - Total height of the tank
      tankWaterFullHeight: number; // TWFH - Sensor distance reading when tank is full
      tankWaterEmptyHeight: number; // TWEH - Sensor distance reading when tank is empty
    };
  };
  motors: {
    m1: {
      enabled: boolean;
      safeStopTime: number; // minutes, only for manual mode
    };
    m2: {
      enabled: boolean;
      safeStopTime: number; // minutes, only for manual mode
    };
  };
}

export interface SystemSettings {
  mode: 'Auto Mode' | 'Manual Mode';
  motorSettings: MotorSettings;
  tankAAutomation: TankAutomationSettings;
  tankBAutomation: TankAutomationSettings;
  topologySettings: TopologySettings;
  autoMode: {
    minWaterLevel: number;
    maxWaterLevel: number;
    specialFunctions: {
      upperTankOverFlowLock: boolean;
      lowerTankOverFlowLock: boolean;
      syncBothTank: boolean;
      buzzerAlert: boolean;
    };
  };
  manualMode: {
    motorControl: boolean;
  };
  sensors: {
    lowerTankA: boolean;
    lowerTankB: boolean;
    upperTankA: boolean;
    upperTankB: boolean;
  };
  tankDimensions: {
    upperTankA: TankDimensions;
    upperTankB: TankDimensions;
    lowerTankA: TankDimensions;
    lowerTankB: TankDimensions;
  };
  sensorCalibration: SensorCalibration;
  sensorLimits: SensorLimits;
  macAddress?: number[];
}

export interface SystemStatus {
  connected: boolean;
  lastUpdated: string;
  runtime: number;
  motor1Status: 'ON' | 'OFF';
  motor2Status: 'ON' | 'OFF';
  motor1Enabled: boolean;
  motor2Enabled: boolean;
  motorStatus: 'ON' | 'OFF'; // Legacy compatibility
  mode: 'Auto Mode' | 'Manual Mode';
  autoModeReasonMotor1: string;
  autoModeReasonMotor2: string;
  autoModeReasons: string; // Legacy compatibility
  motorConfig: MotorConfiguration;
}

// Enhanced WebSocket message types for v3.0 firmware protocol
export interface WebSocketMessage {
  // Message types for v3.0 (including legacy support)
  type?: 'homeData' | 'settingData' | 'sensorData' | 'allData' | 'wifiConfig' | 'motorState' | 'configUpdate' | 'wifiConfigUpdate' | 'systemReset' | 'motor1On' | 'motor1Off' | 'motor2On' | 'motor2Off' | 'getHomeData' | 'getSettingData' | 'getSensorData' | 'getAllData' | 'getWiFiConfig' | 'updateSettings' | 'wifiConfig' | 'motorControl' | 'settingsData';
  
  // v3.0 Home Data Response Fields
  lastUpdate?: string;
  systemMode?: string;
  motor1State?: 'ON' | 'OFF';
  motor2State?: 'ON' | 'OFF';
  motor1Enabled?: boolean;
  motor2Enabled?: boolean;
  upperTankA?: number;
  lowerTankA?: number;
  upperTankB?: number;
  lowerTankB?: number;
  lowerSensorAEnabled?: boolean;
  lowerSensorBEnabled?: boolean;
  upperSensorAEnabled?: boolean;
  upperSensorBEnabled?: boolean;
  autoReasonMotor1?: string;
  autoReasonMotor2?: string;
  motorConfig?: MotorConfiguration;
  
  // v3.0 Settings Data Response Fields
  dualMotorSyncMode?: DualMotorSyncMode;
  minAutoValueA?: number;
  maxAutoValueA?: number;
  lowerThresholdA?: number;
  lowerOverflowA?: number;
  minAutoValueB?: number;
  maxAutoValueB?: number;
  lowerThresholdB?: number;
  lowerOverflowB?: number;
  upperTankHeightA?: number;
  upperWaterFullHeightA?: number;
  upperWaterEmptyHeightA?: number;
  lowerTankHeightA?: number;
  lowerWaterFullHeightA?: number;
  lowerWaterEmptyHeightA?: number;
  upperTankHeightB?: number;
  upperWaterFullHeightB?: number;
  upperWaterEmptyHeightB?: number;
  lowerTankHeightB?: number;
  lowerWaterFullHeightB?: number;
  lowerWaterEmptyHeightB?: number;
  upperSensorOffsetA?: number;
  lowerSensorOffsetA?: number;
  upperSensorOffsetB?: number;
  lowerSensorOffsetB?: number;
  minSensorReading?: number;
  maxSensorReading?: number;
  upperTankOverFlowLock?: boolean;
  lowerTankOverFlowLock?: boolean;
  syncBothTank?: boolean;
  buzzerAlert?: boolean;
  tankAAutomationEnabled?: boolean;
  tankBAutomationEnabled?: boolean;
  macAddress?: number[];
  
  // v3.1 Topology Manager Fields
  systemTopology?: number;
  topologyLabel?: string;
  autoMode?: boolean;
  preventSimultaneous?: boolean;
  syncBoreTransfer?: boolean;
  levelIncreaseMin?: number;
  levelIncreaseWindow?: number;
  motorTimeout?: number;
  faultCooldown?: number;
  maxRetryAttempts?: number;
  logEnabled?: boolean;
  
  // v3.1 Tank Level Data from Topology Manager
  tankA_OH_percent?: number;
  tankA_UG_percent?: number;
  tankB_OH_percent?: number;
  tankB_UG_percent?: number;
  
  // v3.1 Motor States from Topology Manager
  motor1StateTopology?: 'ON' | 'OFF';
  motor2StateTopology?: 'ON' | 'OFF';
  boreMotorState?: 'ON' | 'OFF';
  transferMotorState?: 'ON' | 'OFF';
  
  // v3.0 Sensor Data Response Fields
  sensorUpperA?: number;
  sensorUpperB?: number;
  sensorLowerA?: number;
  sensorLowerB?: number;
  upperTankAPercent?: number;
  upperTankBPercent?: number;
  lowerTankAPercent?: number;
  lowerTankBPercent?: number;
  wifiRSSI?: number;
  
  // v3.0 WiFi Configuration Fields
  wifiMode?: 'AP' | 'STA';
  ssid?: string;
  password?: string;
  staticIP?: string;
  gateway?: string;
  subnet?: string;
  primaryDNS?: string;
  currentIP?: string;
  
  // v3.0 Motor State Update Fields
  motor?: 1 | 2;
  state?: 'ON' | 'OFF';
  
  // v3.0 Configuration Update Fields (for sending to ESP32)
  upperSensorAEnable?: boolean;
  upperSensorBEnable?: boolean;
  lowerSensorAEnable?: boolean;
  lowerSensorBEnable?: boolean;
  
  
  // v3.0 WiFi Configuration Update Fields (for sending to ESP32)
  MODE?: 'AP' | 'STA';
  SSID?: string;
  PASS?: string;
  SIP0?: number;
  SIP1?: number;
  SIP2?: number;
  SIP3?: number;
  SG0?: number;
  SG1?: number;
  SG2?: number;
  SG3?: number;
  SS0?: number;
  SS1?: number;
  SS2?: number;
  SS3?: number;
  SPD0?: number;
  SPD1?: number;
  SPD2?: number;
  SPD3?: number;
  
  // Response status fields
  status?: string;
  message?: string;
  
  // Settings payload for updateSettings command
  settings?: SystemSettings;
  
  // New topology-based configuration payload
  config?: TopologyConfig;
  
  // Legacy fields for backward compatibility with old firmware
  RTV?: string; // Runtime value
  SM?: string; // System mode
  MSV?: boolean | string; // Motor state value
  UTWLA?: number; // Upper tank water level A
  LTWLA?: number; // Lower tank water level A
  UTWLB?: number; // Upper tank water level B
  LTWLB?: number; // Lower tank water level B
  LAE?: boolean; // Lower sensor A enable
  LBE?: boolean; // Lower sensor B enable
  UAE?: boolean; // Upper sensor A enable
  UBE?: boolean; // Upper sensor B enable
  AMR?: string; // Auto mode reason
  UTHA?: number; // Upper tank height A
  UTWFHA?: number; // Upper tank water full height A
  UTWEHA?: number; // Upper tank water empty height A
  LTHA?: number; // Lower tank height A
  LTWFHA?: number; // Lower tank water full height A
  LTWEHA?: number; // Lower tank water empty height A
  UTHB?: number; // Upper tank height B
  UTWFHB?: number; // Upper tank water full height B
  UTWEHB?: number; // Upper tank water empty height B
  LTHB?: number; // Lower tank height B
  LTWFHB?: number; // Lower tank water full height B
  LTWEHB?: number; // Lower tank water empty height B
  MIAV?: number; // Min auto value
  MAAV?: number; // Max auto value
  UTOFL?: boolean; // Upper tank overflow lock
  LTOFL?: boolean; // Lower tank overflow lock
  SBT?: boolean; // Sync both tank
  BA?: boolean; // Buzzer alert
  BMAC?: number[]; // Board MAC address
  
  // Legacy fields for backward compatibility
  data?: SystemStatus | SystemSettings | TankData | string;
  timestamp?: string;
  motorOn?: boolean;
}

export interface AppState {
  systemStatus: SystemStatus;
  systemSettings: SystemSettings;
  tankData: TankData;
  isConnected: boolean;
  error: string | null;
}