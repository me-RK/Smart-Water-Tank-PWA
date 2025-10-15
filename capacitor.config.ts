import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartwatertank.app',
  appName: 'Smart Water Tank',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true, // Allow HTTP connections for local ESP32
    allowNavigation: [
      '192.168.*.*',
      '10.*.*.*',
      '172.16.*.*',
      'localhost',
    ],
  },
  android: {
    allowMixedContent: true, // Critical for HTTP WebSocket connections
    backgroundColor: '#ffffff',
    webContentsDebuggingEnabled: true, // Remove in production
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
