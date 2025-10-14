import React, { useState, useContext } from 'react';
import { WebSocketContext } from '../context/WebSocketContext';

interface DeviceDiscoveryProps {
  onConnect: () => void;
}

const DeviceDiscovery: React.FC<DeviceDiscoveryProps> = ({ onConnect }) => {
  const { setDeviceIP } = useContext(WebSocketContext)!;
  const [manualIP, setManualIP] = useState('');
  const [scanning, setScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<string[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);

  const scanNetwork = async () => {
    setScanning(true);
    setDiscoveredDevices([]);
    setScanError(null);
    
    try {
      // Scan common subnet ranges
      const commonSubnets = ['192.168.1', '192.168.0', '10.0.0', '172.16.0'];
      const allFoundDevices: string[] = [];

      for (const subnet of commonSubnets) {
        // Scan common IP range for this subnet
        const promises = [];
        for (let i = 1; i <= 254; i++) {
          const testIP = `${subnet}.${i}`;
          promises.push(
            Promise.race([
              fetch(`http://${testIP}:81`, { 
                method: 'HEAD',
                mode: 'no-cors'
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 500)
              )
            ])
              .then(() => ({ ip: testIP, found: true }))
              .catch(() => ({ ip: testIP, found: false }))
          );
        }

        const results = await Promise.race([
          Promise.all(promises),
          new Promise(resolve => setTimeout(() => resolve([]), 2000))
        ]);

        const found = (results as Array<{ ip: string; found: boolean }>)
          .filter(r => r?.found)
          .map(r => r.ip);
        
        allFoundDevices.push(...found);
      }
      
      setDiscoveredDevices(allFoundDevices);
    } catch (err) {
      console.error('Network scan failed:', err);
      setScanError('Network scan failed. Please try manual entry.');
    } finally {
      setScanning(false);
    }
  };

  const handleConnect = (ip: string) => {
    setDeviceIP(ip);
    onConnect();
  };

  const handleManualConnect = () => {
    if (manualIP.trim()) {
      handleConnect(manualIP.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connect to Water Tank Device
          </h2>
          <p className="text-gray-600">
            Find and connect to your Smart Water Tank device on the local network
          </p>
        </div>

        <div className="space-y-6">
          {/* Manual Entry Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Manual Entry</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., 192.168.1.100"
                value={manualIP}
                onChange={e => setManualIP(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={e => e.key === 'Enter' && handleManualConnect()}
              />
              <button
                onClick={handleManualConnect}
                disabled={!manualIP.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Connect
              </button>
            </div>
          </div>

          {/* Auto Scan Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Auto Scan</h3>
            <button
              onClick={scanNetwork}
              disabled={scanning}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {scanning ? 'Scanning Network...' : 'Scan Network'}
            </button>

            {scanError && (
              <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {scanError}
              </div>
            )}

            {discoveredDevices.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Found Devices ({discoveredDevices.length})
                </h4>
                <div className="space-y-2">
                  {discoveredDevices.map(ip => (
                    <div key={ip} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-mono text-gray-900">{ip}</span>
                      </div>
                      <button
                        onClick={() => handleConnect(ip)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scanning && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 mt-2">Scanning local network...</p>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Make sure your device and phone are on the same WiFi network</li>
              <li>• Check that the ESP32 device is powered on and connected</li>
              <li>• Try the manual entry if auto-scan doesn't find your device</li>
              <li>• Common IP ranges: 192.168.1.x, 192.168.0.x, 10.0.0.x</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDiscovery;
