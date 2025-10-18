# Connection Heartbeat Implementation

## Overview

This document describes the implementation of a robust connection detection system for the Smart Water Tank PWA. The system uses periodic sync attempts as a heartbeat mechanism to accurately detect when the ESP32 device goes offline or comes back online.

## Problem Solved

**Previous Issue**: The app failed to detect when the device went offline, even after turning off the device for 15+ minutes. The app still showed "connected" status, creating a poor user experience.

**Solution**: Implemented a comprehensive heartbeat system that:
- Performs periodic sync attempts every 30-60 seconds
- Uses sync success/failure as connection health indicators
- Provides real-time connection status updates
- Implements exponential backoff for failed connections
- Handles app background/foreground transitions appropriately

## Implementation Details

### 1. Core Heartbeat Hook (`useConnectionHeartbeat.ts`)

**Location**: `src/hooks/useConnectionHeartbeat.ts`

**Features**:
- Configurable sync intervals (default: 30 seconds)
- Request timeout handling (default: 15 seconds)
- Exponential backoff for failed attempts
- Connection quality assessment (excellent/good/poor/offline)
- App background/foreground handling
- Manual sync capability

**Key Functions**:
```typescript
interface ConnectionStatus {
  isConnected: boolean;
  isChecking: boolean;
  lastSuccessfulSync: Date | null;
  lastSyncAttempt: Date | null;
  consecutiveFailures: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  syncInterval: number;
}
```

### 2. Enhanced Connection Status UI (`ConnectionStatusIndicator.tsx`)

**Location**: `src/components/ConnectionStatusIndicator.tsx`

**Features**:
- Real-time connection status display
- Visual quality indicators with color coding
- Manual sync button
- Last sync time display
- Connection quality progress bar
- Failure count and troubleshooting info

**Visual Indicators**:
- 🟢 **Connected** (Green): Excellent connection quality
- 🔵 **Connected** (Blue): Good connection quality  
- 🟡 **Poor Connection** (Yellow): Poor connection quality
- 🔴 **Offline** (Red): No connection or multiple failures

### 3. Comprehensive Status Page (`ConnectionStatusPage.tsx`)

**Location**: `src/components/ConnectionStatusPage.tsx`

**Features**:
- Detailed connection diagnostics
- Sync history tracking
- Device information display
- Troubleshooting tips
- Manual sync controls
- Connection quality metrics

### 4. WebSocket Context Integration

**Updated Files**:
- `src/context/WebSocketContext.tsx`
- `src/context/WebSocketContextDefinition.tsx`
- `src/context/useWebSocket.ts`

**New Properties Added**:
```typescript
interface WebSocketContextType {
  // ... existing properties
  connectionStatus: ConnectionStatus;
  manualSync: () => Promise<boolean>;
  startHeartbeat: () => void;
  stopHeartbeat: () => void;
}
```

### 5. Enhanced Status Card (`StatusCard.tsx`)

**Location**: `src/components/StatusCard.tsx`

**New Features**:
- Optional enhanced connection status display
- Manual sync button integration
- Real-time connection quality indicators

## Configuration Options

### Heartbeat Configuration

```typescript
interface HeartbeatConfig {
  syncInterval: number;           // Default: 30000ms (30s)
  timeoutDuration: number;        // Default: 15000ms (15s)
  maxConsecutiveFailures: number; // Default: 3
  exponentialBackoffBase: number; // Default: 2000ms
  maxBackoffDelay: number;        // Default: 30000ms
  backgroundSyncInterval: number; // Default: 60000ms (1m)
}
```

### Connection Quality Thresholds

- **Excellent**: Response time < 2 seconds, 0 failures
- **Good**: Response time < 5 seconds, 0-1 failures
- **Poor**: Response time > 5 seconds, 1-2 failures
- **Offline**: 3+ consecutive failures

## Usage Examples

### Basic Integration

```typescript
import { useWebSocket } from '../context/useWebSocket';

const MyComponent = () => {
  const { 
    connectionStatus, 
    manualSync, 
    isConnected 
  } = useWebSocket();

  const handleManualSync = async () => {
    const success = await manualSync();
    if (success) {
      console.log('Sync successful');
    } else {
      console.log('Sync failed');
    }
  };

  return (
    <div>
      <p>Status: {connectionStatus.connectionQuality}</p>
      <p>Last Sync: {connectionStatus.lastSuccessfulSync?.toLocaleString()}</p>
      <button onClick={handleManualSync}>Sync Now</button>
    </div>
  );
};
```

### Enhanced Status Card

```typescript
<StatusCard
  connected={appState.systemStatus.connected}
  lastUpdated={appState.systemStatus.lastUpdated}
  // ... other props
  onManualSync={handleManualSync}
  isManualSyncLoading={connectionStatus.isChecking}
  showEnhancedConnection={true}
/>
```

### Connection Status Page

```typescript
import { ConnectionStatusPage } from '../components/ConnectionStatusPage';

// Use as a full page or component
<ConnectionStatusPage />
```

## Mobile-Specific Features

### App Background/Foreground Handling

- **Background**: Sync interval increases to 60 seconds to save battery
- **Foreground**: Normal 30-second sync interval resumes
- **Visibility API**: Uses document visibility change events for web
- **Capacitor Integration**: Ready for native app state handling

### Battery Optimization

- Configurable sync intervals
- Exponential backoff prevents excessive retry attempts
- Background mode reduces sync frequency
- Smart timeout handling prevents hanging requests

## Error Handling

### Timeout Management

- 15-second timeout for sync requests
- Automatic failure detection
- Exponential backoff for retry attempts
- Maximum backoff delay of 30 seconds

### Failure Recovery

- Automatic retry with exponential backoff
- Manual sync capability for immediate retry
- Clear error messages and troubleshooting tips
- Connection quality degradation indicators

## Performance Considerations

### Memory Management

- Automatic cleanup of intervals and timeouts
- Limited sync history (last 10 entries)
- Efficient state updates
- Proper component unmounting

### Network Efficiency

- Single unified data request (`getAllData`)
- Configurable sync intervals
- Background mode optimization
- Smart retry logic

## Testing Recommendations

### Manual Testing

1. **Connection Loss Simulation**:
   - Turn off ESP32 device
   - Verify app shows "Offline" within 1-2 sync intervals
   - Check failure count increases

2. **Connection Recovery**:
   - Turn ESP32 device back on
   - Verify app shows "Connected" within 1-2 sync intervals
   - Check failure count resets

3. **Manual Sync**:
   - Test manual sync button functionality
   - Verify sync history updates
   - Check response time tracking

4. **Background/Foreground**:
   - Test app backgrounding (mobile)
   - Verify sync interval changes
   - Check battery optimization

### Automated Testing

```typescript
// Example test cases
describe('Connection Heartbeat', () => {
  it('should detect offline status after 3 failures', async () => {
    // Mock failed sync attempts
    // Verify connection quality becomes 'offline'
  });

  it('should recover connection status on successful sync', async () => {
    // Mock successful sync after failures
    // Verify connection quality improves
  });

  it('should implement exponential backoff', async () => {
    // Mock consecutive failures
    // Verify backoff delays increase
  });
});
```

## Future Enhancements

### Potential Improvements

1. **Network Quality Detection**:
   - WiFi signal strength monitoring
   - Network speed assessment
   - Connection stability metrics

2. **Predictive Analytics**:
   - Connection pattern analysis
   - Failure prediction
   - Optimal sync interval calculation

3. **Advanced Diagnostics**:
   - Network latency measurement
   - Packet loss detection
   - Connection stability scoring

4. **User Preferences**:
   - Customizable sync intervals
   - Connection quality thresholds
   - Notification preferences

## Troubleshooting

### Common Issues

1. **App Shows Connected But No Data**:
   - Check sync history for failures
   - Verify ESP32 device is responding
   - Try manual sync

2. **Frequent Connection Drops**:
   - Check network stability
   - Verify ESP32 power supply
   - Review sync interval settings

3. **Slow Connection Recovery**:
   - Check exponential backoff settings
   - Verify timeout configuration
   - Review failure threshold

### Debug Information

Enable debug logging by adding to console:
```typescript
console.log('Connection Status:', connectionStatus);
console.log('Sync History:', syncHistory);
console.log('WebSocket State:', ws.readyState);
```

## Conclusion

The connection heartbeat implementation provides a robust, user-friendly solution for detecting device connectivity issues. The system accurately reflects real-time connection status within 1-2 sync intervals (1-2 minutes maximum) and provides comprehensive diagnostics and troubleshooting capabilities.

Key benefits:
- ✅ Accurate offline detection within 1-2 minutes
- ✅ Real-time connection quality indicators
- ✅ Manual sync capability
- ✅ Mobile-optimized with battery saving
- ✅ Comprehensive error handling
- ✅ User-friendly troubleshooting
- ✅ Extensible and configurable design
