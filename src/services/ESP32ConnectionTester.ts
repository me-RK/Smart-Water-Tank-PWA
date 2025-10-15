export class ESP32ConnectionTester {
  static async testConnection(ip: string, port: number = 81): Promise<boolean> {
    return new Promise((resolve) => {
      const wsUrl = `ws://${ip}:${port}`;
      console.log(`Testing connection to: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      const timeout = setTimeout(() => {
        ws.close();
        console.log(`Connection test timeout: ${ip}`);
        resolve(false);
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        console.log(`Connection successful: ${ip}`);
        ws.close();
        resolve(true);
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        console.log(`Connection failed: ${ip}`);
        resolve(false);
      };
    });
  }

  static async scanNetwork(baseIP: string = '192.168.1'): Promise<string[]> {
    console.log(`Scanning network: ${baseIP}.x`);
    const foundDevices: string[] = [];
    const promises: Promise<void>[] = [];

    // Scan IP range
    for (let i = 1; i <= 254; i++) {
      const ip = `${baseIP}.${i}`;
      
      const promise = this.testConnection(ip).then((success) => {
        if (success) {
          foundDevices.push(ip);
          console.log(`Found ESP32 at: ${ip}`);
        }
      });
      
      promises.push(promise);
      
      // Test in batches of 20
      if (i % 20 === 0) {
        await Promise.all(promises.splice(0, promises.length));
      }
    }

    // Wait for remaining tests
    await Promise.all(promises);
    
    console.log(`Scan complete. Found ${foundDevices.length} devices`);
    return foundDevices;
  }

  static async quickScan(): Promise<string[]> {
    // Test common ESP32 IPs first
    const commonIPs = [
      '192.168.1.100',
      '192.168.1.101',
      '192.168.4.1',
      '192.168.0.100',
      '10.0.0.100',
    ];

    console.log('Quick scanning common IPs...');
    const foundDevices: string[] = [];

    for (const ip of commonIPs) {
      const success = await this.testConnection(ip);
      if (success) {
        foundDevices.push(ip);
      }
    }

    return foundDevices;
  }
}
