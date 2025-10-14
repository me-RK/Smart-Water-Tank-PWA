// Motor Configuration Constants
// These integer values are shared between the web app and ESP32

export const MOTOR_CONFIGURATIONS = {
  // Configuration 1: Two under tanks, Two Upper tanks, Two Motors
  DUAL_UNDER_DUAL_UPPER_DUAL_MOTOR: 1,
  
  // Configuration 2: One under tank, One upper tank, One motor
  SINGLE_UNDER_SINGLE_UPPER_SINGLE_MOTOR: 2,
  
  // Configuration 3: Borewell, Motor, Upper tank
  BOREWELL_MOTOR_UPPER_TANK: 3,
  
  // Configuration 4: Borewell, Lower tank, Upper tank, Motor
  BOREWELL_LOWER_UPPER_MOTOR: 4,
  
  // Configuration 5: One under tank, Two upper tanks, Two motors
  SINGLE_UNDER_DUAL_UPPER_DUAL_MOTOR: 5
} as const;

// Reverse mapping for display purposes - Updated for System Topology v3.1
export const MOTOR_CONFIGURATION_LABELS = {
  [MOTOR_CONFIGURATIONS.DUAL_UNDER_DUAL_UPPER_DUAL_MOTOR]: 'Dual UG | Dual OH | Dual Motor',
  [MOTOR_CONFIGURATIONS.SINGLE_UNDER_SINGLE_UPPER_SINGLE_MOTOR]: 'Single UG | Single OH | Single Motor',
  [MOTOR_CONFIGURATIONS.BOREWELL_MOTOR_UPPER_TANK]: 'Borewell | Single OH | Single Motor',
  [MOTOR_CONFIGURATIONS.BOREWELL_LOWER_UPPER_MOTOR]: 'Borewell | UG | OH | Single Motor',
  [MOTOR_CONFIGURATIONS.SINGLE_UNDER_DUAL_UPPER_DUAL_MOTOR]: 'Single UG | Dual OH | Dual Motor'
} as const;

// Configuration details for each type
export const MOTOR_CONFIGURATION_DETAILS = {
  [MOTOR_CONFIGURATIONS.DUAL_UNDER_DUAL_UPPER_DUAL_MOTOR]: {
    hasLowerTankA: true,
    hasLowerTankB: true,
    hasUpperTankA: true,
    hasUpperTankB: true,
    hasMotor1: true,
    hasMotor2: true,
    hasBorewell: false,
    description: 'Two separate under tanks feeding two separate upper tanks with dedicated motors',
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
  [MOTOR_CONFIGURATIONS.SINGLE_UNDER_SINGLE_UPPER_SINGLE_MOTOR]: {
    hasLowerTankA: true,
    hasLowerTankB: false,
    hasUpperTankA: true,
    hasUpperTankB: false,
    hasMotor1: true,
    hasMotor2: false,
    hasBorewell: false,
    description: 'Single under tank feeding single upper tank with one motor',
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
  [MOTOR_CONFIGURATIONS.BOREWELL_MOTOR_UPPER_TANK]: {
    hasLowerTankA: false,
    hasLowerTankB: false,
    hasUpperTankA: true,
    hasUpperTankB: false,
    hasMotor1: true,
    hasMotor2: false,
    hasBorewell: true,
    description: 'Direct borewell to upper tank with motor control',
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
  [MOTOR_CONFIGURATIONS.BOREWELL_LOWER_UPPER_MOTOR]: {
    hasLowerTankA: true,
    hasLowerTankB: false,
    hasUpperTankA: true,
    hasUpperTankB: false,
    hasMotor1: true,
    hasMotor2: false,
    hasBorewell: true,
    description: 'Borewell to lower tank, then to upper tank with motor control',
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
  [MOTOR_CONFIGURATIONS.SINGLE_UNDER_DUAL_UPPER_DUAL_MOTOR]: {
    hasLowerTankA: true,
    hasLowerTankB: false,
    hasUpperTankA: true,
    hasUpperTankB: true,
    hasMotor1: true,
    hasMotor2: true,
    hasBorewell: false,
    description: 'Single under tank feeding two upper tanks with two motors',
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
export const DEFAULT_MOTOR_CONFIGURATION = MOTOR_CONFIGURATIONS.SINGLE_UNDER_SINGLE_UPPER_SINGLE_MOTOR;
