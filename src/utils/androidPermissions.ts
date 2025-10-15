import { Capacitor } from '@capacitor/core';

export class AndroidPermissions {
  static async requestAllPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return true;
    }

    try {
      // Check if we're on Android
      const isAndroid = Capacitor.getPlatform() === 'android';
      
      if (isAndroid) {
        console.log('Requesting Android permissions...');
        
        // Request location permissions (needed for WiFi scanning)
        const hasLocationPermission = await this.requestLocationPermission();
        
        if (!hasLocationPermission) {
          console.warn('Location permission denied - WiFi scanning may not work');
        }
        
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  static async requestLocationPermission(): Promise<boolean> {
    try {
      // Use Capacitor's Geolocation plugin if available
      const { Geolocation } = await import('@capacitor/geolocation');
      
      const permission = await Geolocation.checkPermissions();
      
      if (permission.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        return request.location === 'granted';
      }
      
      return true;
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  static async checkNetworkPermissions(): Promise<boolean> {
    // Network permissions are automatically granted on Android
    // This is just for checking/logging
    console.log('Network permissions are system-level on Android');
    return true;
  }
}
