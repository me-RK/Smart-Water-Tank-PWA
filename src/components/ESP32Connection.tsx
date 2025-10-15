import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { AndroidWebSocketManager } from '../services/AndroidWebSocketManager';
import { ESP32ConnectionTester } from '../services/ESP32ConnectionTester';

interface ESP32Data {
  tankA: number;
  tankB: number;
  motorStatus: boolean;
  timestamp: number;
}

export const ESP32Connection: React.FC = () => {
  const [ipAddress, setIpAddress] = useState('192.168.1.100');
  const [wsManager, setWsManager] = useState<AndroidWebSocketManager | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [esp32Data, setEsp32Data] = useState<ESP32Data | null>(null);
  const [scanning, setScanning] = useState(false);
  const [foundDevices, setFoundDevices] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`].slice(-10));
    console.log(message);
  };

  useEffect(() => {
    addLog(`Platform: ${Capacitor.getPlatform()}`);
    addLog(`Native: ${Capacitor.isNativePlatform()}`);
    
    // Load saved IP
    const savedIP = localStorage.getItem('esp32_ip');
    if (savedIP) {
      setIpAddress(savedIP);
      addLog(`Loaded saved IP: ${savedIP}`);
    }

    return () => {
      wsManager?.close();
    };
  }, []);

  const handleConnect = async () => {
    try {
      setConnectionStatus('connecting');
      addLog(`Connecting to ${ipAddress}:81...`);

      // Save IP
      localStorage.setItem('esp32_ip', ipAddress);

      const manager = new AndroidWebSocketManager({
        url: ipAddress,
        port: 81,
        reconnect: true,
        maxReconnectAttempts: 5,
      });

      manager.on('open', () => {
        addLog('✅ Connected successfully!');
        setConnectionStatus('connected');
        
        // Send initial handshake
        manager.send({ type: 'handshake', version: '3.0' });
      });

      manager.on('close', (event: any) => {
        addLog(`Disconnected: ${event.reason || 'Unknown reason'}`);
        setConnectionStatus('disconnected');
      });

      manager.on('error', (error: any) => {
        addLog(`❌ Error: ${error}`);
      });

      manager.on('message', (data: any) => {
        addLog(`📩 Received: ${JSON.stringify(data)}`);
        
        // Handle your ESP32 data format
        if (data.type === 'status') {
          setEsp32Data({
            tankA: data.tankA || 0,
            tankB: data.tankB || 0,
            motorStatus: data.motorStatus || false,
            timestamp: Date.now(),
          });
        }
      });

      await manager.connect();
      setWsManager(manager);

    } catch (error: any) {
      addLog(`❌ Connection failed: ${error.message}`);
      setConnectionStatus('disconnected');
      alert(`Connection failed: ${error.message}\n\nMake sure:\n1. ESP32 is powered on\n2. Both devices on same WiFi\n3. IP address is correct`);
    }
  };

  const handleDisconnect = () => {
    addLog('Disconnecting...');
    wsManager?.close();
    setWsManager(null);
    setConnectionStatus('disconnected');
  };

  const handleSendCommand = (command: any) => {
    if (wsManager?.isConnected()) {
      const success = wsManager.send(command);
      if (success) {
        addLog(`📤 Sent: ${JSON.stringify(command)}`);
      } else {
        addLog('❌ Failed to send command');
      }
    } else {
      alert('Not connected to ESP32');
    }
  };

  const handleQuickScan = async () => {
    setScanning(true);
    addLog('🔍 Quick scanning common IPs...');
    
    try {
      const devices = await ESP32ConnectionTester.quickScan();
      setFoundDevices(devices);
      
      if (devices.length > 0) {
        addLog(`✅ Found ${devices.length} device(s)`);
        setIpAddress(devices[0]);
      } else {
        addLog('❌ No devices found');
        alert('No ESP32 devices found.\n\nTry:\n1. Manual IP entry\n2. Full network scan\n3. Check ESP32 is on');
      }
    } catch (error: any) {
      addLog(`❌ Scan error: ${error.message}`);
    } finally {
      setScanning(false);
    }
  };

  const handleFullScan = async () => {
    setScanning(true);
    
    // Get base IP from current IP or default
    const baseIP = ipAddress.split('.').slice(0, 3).join('.');
    addLog(`🔍 Scanning ${baseIP}.x (this may take a minute)...`);
    
    try {
      const devices = await ESP32ConnectionTester.scanNetwork(baseIP);
      setFoundDevices(devices);
      
      if (devices.length > 0) {
        addLog(`✅ Found ${devices.length} device(s)`);
        setIpAddress(devices[0]);
      } else {
        addLog('❌ No devices found in network scan');
      }
    } catch (error: any) {
      addLog(`❌ Scan error: ${error.message}`);
    } finally {
      setScanning(false);
    }
  };

  const handleTestConnection = async () => {
    addLog(`Testing connection to ${ipAddress}:81...`);
    
    const success = await ESP32ConnectionTester.testConnection(ipAddress, 81);
    
    if (success) {
      addLog('✅ Connection test successful!');
      alert('Connection test successful!\n\nESP32 is reachable. You can now connect.');
    } else {
      addLog('❌ Connection test failed');
      alert('Connection test failed.\n\nCheck:\n1. IP address is correct\n2. ESP32 is powered on\n3. Both on same WiFi network');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>ESP32 Connection Manager</h2>
      
      {/* Platform Info */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '5px', 
        marginBottom: '15px',
        fontSize: '12px'
      }}>
        <div><strong>Platform:</strong> {Capacitor.getPlatform()}</div>
        <div><strong>Native:</strong> {Capacitor.isNativePlatform() ? 'Yes' : 'No'}</div>
        <div><strong>Status:</strong> <span style={{ 
          color: connectionStatus === 'connected' ? 'green' : 
                 connectionStatus === 'connecting' ? 'orange' : 'red',
          fontWeight: 'bold'
        }}>{connectionStatus.toUpperCase()}</span></div>
      </div>

      {/* Connection Controls */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ESP32 IP Address:
        </label>
        <input
          type="text"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          placeholder="192.168.1.100"
          disabled={connectionStatus === 'connected'}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
        {connectionStatus === 'disconnected' && (
          <>
            <button 
              onClick={handleConnect}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Connect
            </button>
            <button 
              onClick={handleTestConnection}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Test
            </button>
          </>
        )}
        
        {connectionStatus === 'connected' && (
          <button 
            onClick={handleDisconnect}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Scan Buttons */}
      {connectionStatus === 'disconnected' && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={handleQuickScan}
            disabled={scanning}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: scanning ? '#ccc' : '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: scanning ? 'not-allowed' : 'pointer',
            }}
          >
            {scanning ? 'Scanning...' : 'Quick Scan'}
          </button>
          <button 
            onClick={handleFullScan}
            disabled={scanning}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: scanning ? '#ccc' : '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: scanning ? 'not-allowed' : 'pointer',
            }}
          >
            {scanning ? 'Scanning...' : 'Full Scan'}
          </button>
        </div>
      )}

      {/* Found Devices */}
      {foundDevices.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>
            Found Devices:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {foundDevices.map((device) => (
              <button
                key={device}
                onClick={() => setIpAddress(device)}
                style={{
                  padding: '8px',
                  backgroundColor: device === ipAddress ? '#4CAF50' : '#f0f0f0',
                  color: device === ipAddress ? 'white' : 'black',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {device}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ESP32 Data Display */}
      {connectionStatus === 'connected' && esp32Data && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          marginBottom: '15px',
        }}>
          <h3 style={{ marginTop: 0 }}>ESP32 Data</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <strong>Tank A:</strong> {esp32Data.tankA}%
            </div>
            <div>
              <strong>Tank B:</strong> {esp32Data.tankB}%
            </div>
            <div>
              <strong>Motor:</strong> {esp32Data.motorStatus ? 'ON' : 'OFF'}
            </div>
            <div>
              <strong>Updated:</strong> {new Date(esp32Data.timestamp).toLocaleTimeString()}
            </div>
          </div>
          
          {/* Test Commands */}
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ marginBottom: '10px' }}>Test Commands:</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleSendCommand({ type: 'getStatus' })}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Get Status
              </button>
              <button
                onClick={() => handleSendCommand({ type: 'motorControl', action: 'on' })}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Motor ON
              </button>
              <button
                onClick={() => handleSendCommand({ type: 'motorControl', action: 'off' })}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Motor OFF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Logs */}
      <div style={{
        padding: '10px',
        backgroundColor: '#1e1e1e',
        color: '#00ff00',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxHeight: '200px',
        overflowY: 'auto',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#fff' }}>
          Debug Logs:
        </div>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
};
