// Motor Configuration Constants
// These integer values are shared between the web app and ESP32

export const MOTOR_CONFIGURATIONS = {
  // Configuration 1: Dual Overhead Tanks | Dual Underground Tanks | Dual Motors
  DUAL_OVERHEAD_DUAL_UNDERGROUND_DUAL_MOTORS: 1,
  
  // Configuration 2: Single Underground Tank | Dual Overhead Tanks | Dual Motors
  SINGLE_UNDERGROUND_DUAL_OVERHEAD_DUAL_MOTORS: 2,
  
  // Configuration 3: Single Underground Tank | Single Overhead Tank | Single Motor
  SINGLE_UNDERGROUND_SINGLE_OVERHEAD_SINGLE_MOTOR: 3,
  
  // Configuration 4: Single Underground Tank | Single Overhead Tank | Dual Motors (Bore + Transfer)
  SINGLE_UNDERGROUND_SINGLE_OVERHEAD_DUAL_MOTORS_BORE_TRANSFER: 4,
  
  // Configuration 5: Single Overhead Tank | Borewell Motor
  SINGLE_OVERHEAD_BOREWELL_MOTOR: 5,
  
  // Configuration 6: Manual Configuration (custom setup)
  MANUAL_CONFIGURATION: 6
} as const;

// Reverse mapping for display purposes - Updated for System Topology v3.1
export const MOTOR_CONFIGURATION_LABELS = {
  [MOTOR_CONFIGURATIONS.DUAL_OVERHEAD_DUAL_UNDERGROUND_DUAL_MOTORS]: 'Dual Overhead Tanks | Dual Underground Tanks | Dual Motors',
  [MOTOR_CONFIGURATIONS.SINGLE_UNDERGROUND_DUAL_OVERHEAD_DUAL_MOTORS]: 'Single Underground Tank | Dual Overhead Tanks | Dual Motors',
  [MOTOR_CONFIGURATIONS.SINGLE_UNDERGROUND_SINGLE_OVERHEAD_SINGLE_MOTOR]: 'Single Underground Tank | Single Overhead Tank | Single Motor',
  [MOTOR_CONFIGURATIONS.SINGLE_UNDERGROUND_SINGLE_OVERHEAD_DUAL_MOTORS_BORE_TRANSFER]: 'Single Underground Tank | Single Overhead Tank | Dual Motors (Bore + Transfer)',
  [MOTOR_CONFIGURATIONS.SINGLE_OVERHEAD_BOREWELL_MOTOR]: 'Single Overhead Tank | Borewell Motor',
  [MOTOR_CONFIGURATIONS.MANUAL_CONFIGURATION]: 'Manual Configuration (custom setup)'
} as const;

// Configuration details for each type
export const MOTOR_CONFIGURATION_DETAILS = {
  [MOTOR_CONFIGURATIONS.DUAL_OVERHEAD_DUAL_UNDERGROUND_DUAL_MOTORS]: {
    hasLowerTankA: true,
    hasLowerTankB: true,
    hasUpperTankA: true,
    hasUpperTankB: true,
    hasMotor1: true,
    hasMotor2: true,
    hasBorewell: false,
    description: 'Two separate underground tanks feeding two separate overhead tanks with dedicated motors',
    sensorRequirements: {
      lowerTankA: true,  // Optional but recommended
      lowerTankB: true,  // Optional but recommended
      upperTankA: true,  // Required
      upperTankB: true   // Required
    },
    uiBehavior: {
      showLowerTankA: true,
      showLowerTankB: true,
      showUpperTankA: true,
      showUpperTankB: true,
      showMotor1: true,
      showMotor2: true,
      enableLowerTankA: true,
      enableLowerTankB: true,
      enableUpperTankA: false, // Required, so disable toggle
      enableUpperTankB: false, // Required, so disable toggle
      enableMotor1: false, // Default enabled, so disable toggle
      enableMotor2: false, // Default enabled, so disable toggle
      defaultLowerTankA: true,
      defaultLowerTankB: true,
      defaultUpperTankA: true,
      defaultUpperTankB: true,
      defaultMotor1: true,
      defaultMotor2: true
    }
  },
  [MOTOR_CONFIGURATIONS.SINGLE_UNDERGROUND_DUAL_OVERHEAD_DUAL_MOTORS]: {
    hasLowerTankA: true,
    hasLowerTankB: false,
    hasUpperTankA: true,
    hasUpperTankB: true,
    hasMotor1: true,
    hasMotor2: true,
    hasBorewell: false,
    description: 'Single underground tank feeding two overhead tanks with two motors',
    sensorRequirements: {
      lowerTankA: true,  // Optional but recommended
      lowerTankB: false,
      upperTankA: true,  // Required
      upperTankB: true   // Required
    },
    uiBehavior: {
      showLowerTankA: true,
      showLowerTankB: false,
      showUpperTankA: true,
      showUpperTankB: true,
      showMotor1: true,
      showMotor2: true,
      enableLowerTankA: true,
      enableLowerTankB: false,
      enableUpperTankA: false, // Required, so disable toggle
      enableUpperTankB: false, // Required, so disable toggle
      enableMotor1: false, // Default enabled, so disable toggle
      enableMotor2: false, // Default enabled, so disable toggle
      defaultLowerTankA: true,
      defaultLowerTankB: false,
      defaultUpperTankA: true,
      defaultUpperTankB: true,
      defaultMotor1: true,
      defaultMotor2: true
    }
  },
  [MOTOR_CONFIGURATIONS.SINGLE_UNDERGROUND_SINGLE_OVERHEAD_SINGLE_MOTOR]: {
    hasLowerTankA: true,
    hasLowerTankB: false,
    hasUpperTankA: true,
    hasUpperTankB: false,
    hasMotor1: true,
    hasMotor2: false,
    hasBorewell: false,
    description: 'Single underground tank feeding single overhead tank with one motor',
    sensorRequirements: {
      lowerTankA: true,  // Optional but recommended
      lowerTankB: false,
      upperTankA: true,  // Required
      upperTankB: false
    },
    uiBehavior: {
      showLowerTankA: true,
      showLowerTankB: false,
      showUpperTankA: true,
      showUpperTankB: false,
      showMotor1: true,
      showMotor2: false,
      enableLowerTankA: true,
      enableLowerTankB: false,
      enableUpperTankA: false, // Required, so disable toggle
      enableUpperTankB: false,
      enableMotor1: false, // Default enabled, so disable toggle
      enableMotor2: false,
      defaultLowerTankA: true,
      defaultLowerTankB: false,
      defaultUpperTankA: true,
      defaultUpperTankB: false,
      defaultMotor1: true,
      defaultMotor2: false
    }
  },
  [MOTOR_CONFIGURATIONS.SINGLE_UNDERGROUND_SINGLE_OVERHEAD_DUAL_MOTORS_BORE_TRANSFER]: {
    hasLowerTankA: true,
    hasLowerTankB: false,
    hasUpperTankA: true,
    hasUpperTankB: false,
    hasMotor1: true,
    hasMotor2: true,
    hasBorewell: true,
    description: 'Single underground tank feeding single overhead tank with bore and transfer motors',
    sensorRequirements: {
      lowerTankA: true,  // Optional but recommended
      lowerTankB: false,
      upperTankA: true,  // Required
      upperTankB: false
    },
    uiBehavior: {
      showLowerTankA: true,
      showLowerTankB: false,
      showUpperTankA: true,
      showUpperTankB: false,
      showMotor1: true,
      showMotor2: true,
      enableLowerTankA: true,
      enableLowerTankB: false,
      enableUpperTankA: false, // Required, so disable toggle
      enableUpperTankB: false,
      enableMotor1: false, // Default enabled, so disable toggle
      enableMotor2: false, // Default enabled, so disable toggle
      defaultLowerTankA: true,
      defaultLowerTankB: false,
      defaultUpperTankA: true,
      defaultUpperTankB: false,
      defaultMotor1: true,
      defaultMotor2: true
    }
  },
  [MOTOR_CONFIGURATIONS.SINGLE_OVERHEAD_BOREWELL_MOTOR]: {
    hasLowerTankA: false,
    hasLowerTankB: false,
    hasUpperTankA: true,
    hasUpperTankB: false,
    hasMotor1: true,
    hasMotor2: false,
    hasBorewell: true,
    description: 'Direct borewell to overhead tank with motor control',
    sensorRequirements: {
      lowerTankA: false,
      lowerTankB: false,
      upperTankA: true,  // Required
      upperTankB: false
    },
    uiBehavior: {
      showLowerTankA: false,
      showLowerTankB: false,
      showUpperTankA: true,
      showUpperTankB: false,
      showMotor1: true,
      showMotor2: false,
      enableLowerTankA: false,
      enableLowerTankB: false,
      enableUpperTankA: false, // Required, so disable toggle
      enableUpperTankB: false,
      enableMotor1: false, // Default enabled, so disable toggle
      enableMotor2: false,
      defaultLowerTankA: false,
      defaultLowerTankB: false,
      defaultUpperTankA: true,
      defaultUpperTankB: false,
      defaultMotor1: true,
      defaultMotor2: false
    }
  },
  [MOTOR_CONFIGURATIONS.MANUAL_CONFIGURATION]: {
    hasLowerTankA: true,
    hasLowerTankB: true,
    hasUpperTankA: true,
    hasUpperTankB: true,
    hasMotor1: true,
    hasMotor2: true,
    hasBorewell: true,
    description: 'Manual configuration with full control over all sensors and motors',
    sensorRequirements: {
      lowerTankA: true,  // Full control
      lowerTankB: true,  // Full control
      upperTankA: true,  // Full control
      upperTankB: true   // Full control
    },
    uiBehavior: {
      showLowerTankA: true,
      showLowerTankB: true,
      showUpperTankA: true,
      showUpperTankB: true,
      showMotor1: true,
      showMotor2: true,
      enableLowerTankA: true, // Full control
      enableLowerTankB: true, // Full control
      enableUpperTankA: true, // Full control
      enableUpperTankB: true, // Full control
      enableMotor1: true, // Full control
      enableMotor2: true, // Full control
      defaultLowerTankA: false,
      defaultLowerTankB: false,
      defaultUpperTankA: false,
      defaultUpperTankB: false,
      defaultMotor1: false,
      defaultMotor2: false
    }
  }
} as const;

// Type definitions
export type MotorConfigurationType = typeof MOTOR_CONFIGURATIONS[keyof typeof MOTOR_CONFIGURATIONS];
export type MotorConfigurationLabel = typeof MOTOR_CONFIGURATION_LABELS[keyof typeof MOTOR_CONFIGURATION_LABELS];

// Helper functions
export const getMotorConfigurationLabel = (config: MotorConfigurationType): string => {
  return MOTOR_CONFIGURATION_LABELS[config] || 'Unknown Configuration';
};

export const getMotorConfigurationDetails = (config: MotorConfigurationType) => {
  return MOTOR_CONFIGURATION_DETAILS[config];
};

export const isValidMotorConfiguration = (config: number): config is MotorConfigurationType => {
  return Object.values(MOTOR_CONFIGURATIONS).includes(config as MotorConfigurationType);
};

// Default configuration
export const DEFAULT_MOTOR_CONFIGURATION = MOTOR_CONFIGURATIONS.SINGLE_UNDERGROUND_SINGLE_OVERHEAD_SINGLE_MOTOR;
