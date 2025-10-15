# Android App - ESP32 Local Network Connection Fix

## 🎯 Overview

This document provides a complete solution for fixing Android app connectivity issues with ESP32 devices on local networks. The implementation addresses all critical Android networking restrictions and provides a robust WebSocket connection system.

## ✅ What's Been Implemented

### 1. Android Manifest Configuration
- **File**: `android/app/src/main/AndroidManifest.xml`
- **Critical Permissions**: Internet, WiFi state, location, notifications
- **Cleartext Traffic**: Enabled for local network communication
- **Network Security**: References custom network security config

### 2. Network Security Configuration
- **File**: `android/app/src/main/res/xml/network_security_config.xml`
- **Allows HTTP/HTTPS**: For all private IP ranges (192.168.x.x, 10.x.x.x, 172.16.x.x)
- **Trust Anchors**: System and user certificates
- **Debug Overrides**: For development testing

### 3. Capacitor Configuration
- **File**: `capacitor.config.ts`
- **Mixed Content**: Enabled for HTTP + HTTPS
- **Navigation**: Allows all local IP ranges
- **File Access**: Universal access from file URLs
- **Debugging**: Web contents debugging enabled

### 4. Gradle Build Configuration
- **Files**: `android/build.gradle`, `android/app/build.gradle`
- **OkHttp**: Added for better WebSocket support
- **Kotlin**: Updated to version 1.9.0
- **Packaging**: Excludes conflicting META-INF files
- **Debug**: ProGuard disabled for debugging

### 5. Android Permissions Manager
- **File**: `src/utils/androidPermissions.ts`
- **Location Permissions**: Handles WiFi scanning requirements
- **Geolocation Plugin**: Integrated for permission management
- **Platform Detection**: Android-specific permission handling

### 6. WebSocket Manager
- **File**: `src/services/AndroidWebSocketManager.ts`
- **Connection Management**: Robust connection handling with reconnection
- **Event System**: Comprehensive event handling
- **Error Handling**: Graceful error management
- **Timeout Protection**: Connection timeout handling

### 7. ESP32 Connection Tester
- **File**: `src/services/ESP32ConnectionTester.ts`
- **Network Scanning**: Quick scan and full network scan
- **Connection Testing**: Individual device testing
- **Batch Processing**: Efficient IP range scanning

### 8. ESP32 Connection Component
- **File**: `src/components/ESP32Connection.tsx`
- **Complete UI**: Full connection management interface
- **Real-time Logs**: Debug information display
- **Device Discovery**: Automatic ESP32 detection
- **Command Testing**: Motor control and status commands

### 9. ProGuard Rules
- **File**: `android/app/proguard-rules.pro`
- **WebSocket Protection**: Preserves WebSocket classes
- **OkHttp Protection**: Keeps OkHttp networking
- **Capacitor Protection**: Preserves Capacitor plugins

## 🚀 How to Use

### Step 1: Build and Deploy
```bash
# Clean and rebuild
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Step 2: In Android Studio
1. **File → Invalidate Caches / Restart**
2. **Build → Clean Project**
3. **Build → Rebuild Project**
4. **Run → Run 'app'**

### Step 3: Build from Command Line (Alternative)
```bash
# Navigate to android directory
cd android

# Clean project
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# APK will be created at: app/build/outputs/apk/debug/app-debug.apk
```

### Step 3: On Android Device
1. **Grant Location Permission** when prompted
2. **Open the app** - you'll see debug info at the top
3. **Click "ESP32 Manager"** button in the header
4. **Enter ESP32 IP** or use scan functions
5. **Test connection** before connecting
6. **Connect** to ESP32

## 🔧 ESP32 Server Requirements

Your ESP32 code should include these features:

```cpp
#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

WebSocketsServer webSocket = WebSocketsServer(81);

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_CONNECTED: {
            IPAddress ip = webSocket.remoteIP(num);
            Serial.printf("[%u] Connected from %d.%d.%d.%d\n", 
                         num, ip[0], ip[1], ip[2], ip[3]);
            sendStatus(num);
            break;
        }
        
        case WStype_TEXT: {
            StaticJsonDocument<200> doc;
            DeserializationError error = deserializeJson(doc, payload);
            
            if (!error) {
                const char* type = doc["type"];
                
                if (strcmp(type, "handshake") == 0) {
                    sendHandshakeResponse(num);
                }
                else if (strcmp(type, "getStatus") == 0) {
                    sendStatus(num);
                }
                else if (strcmp(type, "motorControl") == 0) {
                    handleMotorControl(num, doc);
                }
            }
            break;
        }
    }
}

void sendStatus(uint8_t clientNum) {
    StaticJsonDocument<200> doc;
    doc["type"] = "status";
    doc["tankA"] = getTankALevel();
    doc["tankB"] = getTankBLevel();
    doc["motorStatus"] = getMotorStatus();
    doc["timestamp"] = millis();
    
    String output;
    serializeJson(doc, output);
    webSocket.sendTXT(clientNum, output);
}

void setup() {
    Serial.begin(115200);
    
    // Connect to WiFi
    WiFi.begin("YOUR_SSID", "YOUR_PASSWORD");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    
    Serial.println("\nWiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    
    // Start WebSocket server
    webSocket.begin();
    webSocket.onEvent(webSocketEvent);
    
    Serial.println("WebSocket server started on port 81");
}

void loop() {
    webSocket.loop();
    
    // Send periodic updates (every 2 seconds)
    static unsigned long lastUpdate = 0;
    if (millis() - lastUpdate > 2000) {
        lastUpdate = millis();
        sendStatusToAll();
    }
}
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. "Cleartext HTTP traffic not permitted"
**Solution**: Verify all these are set:
- ✅ `android:usesCleartextTraffic="true"` in manifest
- ✅ `network_security_config.xml` exists and is referenced
- ✅ `cleartextTrafficPermitted="true"` in domain config
- ✅ Rebuild after changes

#### 2. "WebSocket connection failed"
**Solution**: 
- Ensure Android device and ESP32 on same WiFi
- Ping ESP32 IP from another device
- Check ESP32 is running and WebSocket server is active
- Try different port (e.g., 80 instead of 81)

#### 3. "Location permission required"
**Solution**: The app will automatically request location permission. If it doesn't work:
```bash
# Reinstall Geolocation plugin
npm install @capacitor/geolocation
npx cap sync android
```

#### 4. "Connection timeout"
**Solution**:
- Check ESP32 IP address is correct
- Verify ESP32 WebSocket server is running
- Test from browser: `http://ESP32_IP:81`
- Check firewall settings

#### 5. "Could not find method useProguard()" or "VANILLA_ICE_CREAM" build errors
**Solution**:
- The `useProguard()` method has been removed from newer Android Gradle Plugin versions
- Update `compileSdkVersion` to 35 in `android/variables.gradle`
- Add `android.suppressUnsupportedCompileSdk=35` to `android/gradle.properties`
- Use Java 17 toolchain configuration

### Debug Information

#### Chrome Inspect Console
1. Connect Android device via USB
2. Enable USB Debugging on device
3. In Chrome browser, go to: `chrome://inspect`
4. Click "inspect" on your app
5. Check Console tab for WebSocket errors

#### Android LogCat
In Android Studio → Logcat tab, use these filters:
```
tag:WebSocket
tag:Capacitor
tag:Chromium
package:com.smartwatertank.app
```

#### Test Raw WebSocket Connection
Add this test button to your app:
```typescript
const testWebSocket = () => {
  const testIP = '192.168.1.100'; // Replace with your ESP32 IP
  const ws = new WebSocket(`ws://${testIP}:81`);
  
  ws.onopen = () => {
    console.log('✅ TEST: WebSocket connected!');
    alert('SUCCESS: Connected to ESP32!');
    ws.send(JSON.stringify({ type: 'ping' }));
  };
  
  ws.onerror = (error) => {
    console.error('❌ TEST: WebSocket error:', error);
    alert('ERROR: Could not connect to ESP32');
  };
  
  ws.onmessage = (event) => {
    console.log('📩 TEST: Received:', event.data);
  };
};
```

## ✅ Success Criteria

Your app is working correctly when:

- ✅ App launches without crashes
- ✅ Location permission is requested and granted
- ✅ Platform shows "android" and Native shows "Yes"
- ✅ Test button successfully connects to ESP32
- ✅ WebSocket connection establishes
- ✅ Real-time data updates from ESP32
- ✅ Can send commands to ESP32
- ✅ Debug logs show connection lifecycle
- ✅ No "cleartext" or "mixed content" errors in LogCat

## 📱 Testing Checklist

Before asking for help, verify:

- [ ] Android device and ESP32 on same WiFi network
- [ ] ESP32 WebSocket server is running on port 81
- [ ] Can ping ESP32 from another device
- [ ] `network_security_config.xml` exists in `android/app/src/main/res/xml/`
- [ ] `AndroidManifest.xml` has `usesCleartextTraffic="true"`
- [ ] `AndroidManifest.xml` references network security config
- [ ] `capacitor.config.ts` has `cleartext: true` and `allowMixedContent: true`
- [ ] Location permission granted on Android device
- [ ] Built with `npm run build` before syncing
- [ ] Synced with `npx cap sync android` after build
- [ ] Cleaned and rebuilt in Android Studio
- [ ] Checked Chrome inspect console for errors (`chrome://inspect`)

## 🎉 Features Included

### ESP32 Connection Manager
- **IP Address Input**: Manual IP entry with validation
- **Quick Scan**: Tests common ESP32 IPs
- **Full Network Scan**: Scans entire subnet
- **Connection Testing**: Tests connection before connecting
- **Real-time Status**: Shows connection state
- **Debug Logs**: Comprehensive logging system
- **Command Testing**: Motor control and status commands
- **Device Discovery**: Automatic ESP32 detection

### Android Optimizations
- **Permission Management**: Automatic location permission handling
- **Network Security**: Comprehensive cleartext traffic configuration
- **WebSocket Support**: Robust connection management
- **Error Handling**: Graceful error management
- **Reconnection**: Automatic reconnection with exponential backoff
- **Debugging**: Extensive debug information

## 📞 Support

If you're still having issues:

1. **Check Chrome Inspect Console**: `chrome://inspect`
2. **Check Android LogCat**: Filter by package name
3. **Test ESP32 Separately**: Try connecting from browser
4. **Export Logs**: `adb logcat > app_logs.txt`

The implementation is now complete and should resolve all Android ESP32 connectivity issues!
