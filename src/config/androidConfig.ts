/**
 * Android-specific configuration
 * 
 * Contains all Android-specific settings, constants, and configurations
 */

export const ANDROID_CONFIG = {
  // Material Design colors
  colors: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    surface: '#ffffff',
    background: '#f8fafc',
    onSurface: '#1e293b',
    onBackground: '#1e293b'
  },

  // Dark theme colors
  darkColors: {
    primary: '#60a5fa',
    primaryDark: '#3b82f6',
    secondary: '#94a3b8',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    surface: '#1e293b',
    background: '#0f172a',
    onSurface: '#f1f5f9',
    onBackground: '#f1f5f9'
  },

  // Typography scale (Material Design)
  typography: {
    displayLarge: {
      fontSize: '3.5rem',
      lineHeight: '4rem',
      fontWeight: 400
    },
    displayMedium: {
      fontSize: '2.8rem',
      lineHeight: '3.2rem',
      fontWeight: 400
    },
    displaySmall: {
      fontSize: '2.2rem',
      lineHeight: '2.8rem',
      fontWeight: 400
    },
    headlineLarge: {
      fontSize: '2rem',
      lineHeight: '2.5rem',
      fontWeight: 400
    },
    headlineMedium: {
      fontSize: '1.8rem',
      lineHeight: '2.2rem',
      fontWeight: 400
    },
    headlineSmall: {
      fontSize: '1.5rem',
      lineHeight: '2rem',
      fontWeight: 400
    },
    titleLarge: {
      fontSize: '1.4rem',
      lineHeight: '1.8rem',
      fontWeight: 500
    },
    titleMedium: {
      fontSize: '1.1rem',
      lineHeight: '1.5rem',
      fontWeight: 500
    },
    titleSmall: {
      fontSize: '1rem',
      lineHeight: '1.4rem',
      fontWeight: 500
    },
    bodyLarge: {
      fontSize: '1rem',
      lineHeight: '1.5rem',
      fontWeight: 400
    },
    bodyMedium: {
      fontSize: '0.9rem',
      lineHeight: '1.3rem',
      fontWeight: 400
    },
    bodySmall: {
      fontSize: '0.8rem',
      lineHeight: '1.2rem',
      fontWeight: 400
    },
    labelLarge: {
      fontSize: '0.9rem',
      lineHeight: '1.3rem',
      fontWeight: 500
    },
    labelMedium: {
      fontSize: '0.8rem',
      lineHeight: '1.2rem',
      fontWeight: 500
    },
    labelSmall: {
      fontSize: '0.7rem',
      lineHeight: '1.1rem',
      fontWeight: 500
    }
  },

  // Spacing scale (8dp grid)
  spacing: {
    xs: '4px',    // 0.5 * 8
    sm: '8px',    // 1 * 8
    md: '16px',   // 2 * 8
    lg: '24px',   // 3 * 8
    xl: '32px',   // 4 * 8
    '2xl': '48px', // 6 * 8
    '3xl': '64px', // 8 * 8
    '4xl': '96px'  // 12 * 8
  },

  // Border radius
  borderRadius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px'
  },

  // Elevation shadows (Material Design)
  elevation: {
    0: 'none',
    1: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
    2: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
    3: '0px 1px 3px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
    4: '0px 2px 3px 0px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)',
    5: '0px 4px 4px 0px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)'
  },

  // Animation durations
  animation: {
    short1: '50ms',
    short2: '100ms',
    short3: '150ms',
    short4: '200ms',
    medium1: '250ms',
    medium2: '300ms',
    medium3: '350ms',
    medium4: '400ms',
    long1: '450ms',
    long2: '500ms',
    long3: '550ms',
    long4: '600ms',
    extraLong1: '700ms',
    extraLong2: '800ms',
    extraLong3: '900ms',
    extraLong4: '1000ms'
  },

  // Animation easing curves
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  },

  // Touch target sizes (minimum 48dp)
  touchTargets: {
    minimum: '48px',
    comfortable: '56px',
    large: '64px'
  },

  // Breakpoints for responsive design
  breakpoints: {
    xs: '320px',   // Small phones
    sm: '360px',   // Standard phones
    md: '768px',   // Tablets
    lg: '1024px',  // Large tablets
    xl: '1280px',  // Desktop
    '2xl': '1536px' // Large desktop
  },

  // Safe area insets (default values, will be updated by SafeArea plugin)
  safeArea: {
    top: '24px',
    bottom: '24px',
    left: '16px',
    right: '16px'
  },

  // Status bar configuration
  statusBar: {
    height: '24px',
    style: 'dark',
    backgroundColor: '#3b82f6'
  },

  // Navigation bar configuration
  navigationBar: {
    height: '48px',
    backgroundColor: '#ffffff'
  },

  // Keyboard configuration
  keyboard: {
    resizeMode: 'body',
    style: 'dark'
  },

  // Haptic feedback configuration
  haptics: {
    light: 'light',
    medium: 'medium',
    heavy: 'heavy',
    selection: 'selection',
    notification: 'notification'
  },

  // Performance settings
  performance: {
    lazyLoadThreshold: '50px',
    imageOptimization: true,
    preloadCriticalResources: true,
    enableServiceWorker: true,
    cacheStrategy: 'stale-while-revalidate'
  },

  // Accessibility settings
  accessibility: {
    minimumTouchTarget: '48px',
    highContrastMode: false,
    reducedMotion: false,
    screenReader: false
  }
} as const;

export type AndroidConfig = typeof ANDROID_CONFIG;
