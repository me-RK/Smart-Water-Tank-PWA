import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartwatertank.app',
  appName: 'Smart Water Tank',
  webDir: 'dist',
  
  // ========== CRITICAL SERVER SETTINGS ==========
  server: {
    androidScheme: 'https',
    hostname: 'app.smartwatertank.local',
    
    // ALLOW HTTP traffic (critical!)
    cleartext: true,
    
    // Allow navigation to local IPs
    allowNavigation: [
      '*',  // Allow all during development
      '192.168.*.*',
      '192.168.0.*',
      '192.168.1.*',
      '192.168.2.*',
      '192.168.3.*',
      '192.168.4.*',
      '10.*.*.*',
      '172.16.*.*',
      '172.17.*.*',
      '172.18.*.*',
      'localhost',
      '127.0.0.1',
    ],
    
    // CORS configuration
    iosScheme: 'ionic',
    
    // Error page
    errorPath: 'index.html',
  },
  
  // ========== ANDROID SPECIFIC SETTINGS ==========
  android: {
    // CRITICAL: Allow mixed content (HTTP + HTTPS)
    allowMixedContent: true,
    
    // Allow file access
    allowFileAccess: true,
    
    // Allow universal access from files
    allowUniversalAccessFromFileURLs: true,
    
    // Allow file access from file URLs
    allowFileAccessFromFileURLs: true,
    
    // Enable debugging
    webContentsDebuggingEnabled: true,
    
    // Background color
    backgroundColor: '#ffffff',
    
    // Build configuration
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK',
    },
  },
  
  // ========== PLUGIN CONFIGURATIONS ==========
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
    },
    
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#3b82f6',
    },
    
    // Network plugin configuration
    Network: {
      // Empty, but enables the plugin
    },
  },
};

export default config;
