// Test utilities for topology configuration
import { 
  getMotorConfigurationDetails, 
  MOTOR_CONFIGURATION_LABELS 
} from '../constants/motorConfigurations';

/**
 * Test all topology configurations to ensure they work correctly
 */
export const testTopologyConfigurations = () => {
  console.log('Testing Topology Configurations...');
  
  const results = [];
  
  for (let i = 1; i <= 6; i++) {
    const config = getMotorConfigurationDetails(i as any);
    const label = MOTOR_CONFIGURATION_LABELS[i as keyof typeof MOTOR_CONFIGURATION_LABELS];
    
    const result = {
      topology: i,
      label,
      description: config.description,
      hasLowerTankA: config.hasLowerTankA,
      hasLowerTankB: config.hasLowerTankB,
      hasUpperTankA: config.hasUpperTankA,
      hasUpperTankB: config.hasUpperTankB,
      hasMotor1: config.hasMotor1,
      hasMotor2: config.hasMotor2,
      hasBorewell: config.hasBorewell,
      uiBehavior: config.uiBehavior
    };
    
    results.push(result);
    console.log(`Topology ${i}: ${label}`, result);
  }
  
  return results;
};

/**
 * Test tank capacity calculation
 */
export const testTankCapacityCalculation = () => {
  console.log('Testing Tank Capacity Calculation...');
  
  const testCases = [
    { height: 100, diameter: 150, unit: 'cm' as const, expected: 1767 },
    { height: 100, diameter: 200, unit: 'cm' as const, expected: 3142 },
    { height: 50, diameter: 100, unit: 'cm' as const, expected: 393 },
    { height: 100, width: 100, length: 100, unit: 'cm' as const, expected: 1000 },
    { height: 100, width: 200, length: 200, unit: 'cm' as const, expected: 4000 }
  ];
  
  const calculateCapacity = (
    height: number,
    diameter?: number,
    width?: number,
    length?: number,
    unit: 'cm' | 'inches' | 'meters' = 'cm'
  ): number => {
    // Convert to cm for calculation
    let h = height;
    let d = diameter || 0;
    let w = width || 0;
    let l = length || 0;

    if (unit === 'inches') {
      h *= 2.54;
      d *= 2.54;
      w *= 2.54;
      l *= 2.54;
    } else if (unit === 'meters') {
      h *= 100;
      d *= 100;
      w *= 100;
      l *= 100;
    }

    // Calculate volume in cubic cm, then convert to liters
    let volume = 0;
    if (d > 0) {
      // Circular tank: π * r² * h
      volume = Math.PI * Math.pow(d / 2, 2) * h;
    } else if (w > 0 && l > 0) {
      // Rectangular tank: w * l * h
      volume = w * l * h;
    }

    return Math.round(volume / 1000); // Convert cm³ to liters
  };
  
  testCases.forEach((testCase, index) => {
    const result = calculateCapacity(
      testCase.height,
      testCase.diameter,
      testCase.width,
      testCase.length,
      testCase.unit
    );
    
    const passed = result === testCase.expected;
    console.log(`Test ${index + 1}: ${passed ? 'PASS' : 'FAIL'} - Expected: ${testCase.expected}L, Got: ${result}L`);
  });
};

/**
 * Test topology behavior based on requirements
 */
export const testTopologyBehavior = () => {
  console.log('Testing Topology Behavior...');
  
  const requirements = [
    {
      topology: 1,
      name: 'Dual Overhead Tanks | Dual Underground Tanks | Dual Motors',
      expectedSensors: { lower: true, upperA: true, upperB: true },
      expectedMotors: { m1: true, m2: true }
    },
    {
      topology: 2,
      name: 'Single Underground Tank | Dual Overhead Tanks | Dual Motors',
      expectedSensors: { lower: true, upperA: true, upperB: true },
      expectedMotors: { m1: true, m2: true }
    },
    {
      topology: 3,
      name: 'Single Underground Tank | Single Overhead Tank | Single Motor',
      expectedSensors: { lower: true, upperA: true, upperB: false },
      expectedMotors: { m1: true, m2: false }
    },
    {
      topology: 4,
      name: 'Single Underground Tank | Single Overhead Tank | Dual Motors (Bore + Transfer)',
      expectedSensors: { lower: true, upperA: true, upperB: false },
      expectedMotors: { m1: true, m2: true }
    },
    {
      topology: 5,
      name: 'Single Overhead Tank | Borewell Motor',
      expectedSensors: { lower: false, upperA: true, upperB: false },
      expectedMotors: { m1: true, m2: false }
    },
    {
      topology: 6,
      name: 'Manual Configuration (custom setup)',
      expectedSensors: { lower: true, upperA: true, upperB: true },
      expectedMotors: { m1: true, m2: true }
    }
  ];
  
  requirements.forEach(req => {
    const config = getMotorConfigurationDetails(req.topology as any);
    const uiBehavior = config.uiBehavior;
    
    const sensorResults = {
      lower: uiBehavior.showLowerTankA,
      upperA: uiBehavior.showUpperTankA,
      upperB: uiBehavior.showUpperTankB
    };
    
    const motorResults = {
      m1: uiBehavior.showMotor1,
      m2: uiBehavior.showMotor2
    };
    
    const sensorsMatch = JSON.stringify(sensorResults) === JSON.stringify(req.expectedSensors);
    const motorsMatch = JSON.stringify(motorResults) === JSON.stringify(req.expectedMotors);
    
    console.log(`Topology ${req.topology}: ${sensorsMatch && motorsMatch ? 'PASS' : 'FAIL'}`);
    console.log(`  Expected Sensors:`, req.expectedSensors);
    console.log(`  Actual Sensors:`, sensorResults);
    console.log(`  Expected Motors:`, req.expectedMotors);
    console.log(`  Actual Motors:`, motorResults);
  });
};

// Run all tests
export const runAllTopologyTests = () => {
  console.log('=== Running All Topology Tests ===');
  testTopologyConfigurations();
  console.log('\n');
  testTankCapacityCalculation();
  console.log('\n');
  testTopologyBehavior();
  console.log('\n=== Tests Complete ===');
};
