import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smartwatertank.app',
  appName: 'Smart Water Tank',
  webDir: 'dist',
  
  // ========== WHATSAPP-STYLE SERVER SETTINGS ==========
  server: {
    androidScheme: 'http',  // Use HTTP for ESP32 compatibility
    hostname: 'app.smartwatertank.local',
    
    // ALLOW HTTP traffic for local development
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
    
    // WhatsApp-style background color
    backgroundColor: '#128c7e',
    
    // Additional HTTP support settings
    webSecurity: false,  // Disable web security for local development
    
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
      backgroundColor: '#128c7e', // WhatsApp teal
      showSpinner: false,
      androidSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true,
    },
    
    StatusBar: {
      style: 'LIGHT', // Light content on dark background
      backgroundColor: '#128c7e', // WhatsApp teal
      overlaysWebView: false,
    },
    
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    
    SafeArea: {
      enabled: true,
    },
    
    Haptics: {
      enabled: true,
    },
    
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#128c7e', // WhatsApp teal
    },
    
    // Network plugin configuration
    Network: {
      // Empty, but enables the plugin
    },
  },
};

export default config;
