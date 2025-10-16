export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: { 
    extend: {
      colors: {
        // WhatsApp-inspired color palette
        'wa': {
          'teal': {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#128c7e', // Primary WhatsApp teal
            600: '#0f766e',
            700: '#0d9488',
            800: '#115e59',
            900: '#134e4a',
          },
          'light': {
            'bg': '#f0f2f5', // WhatsApp light background
            'panel': '#ffffff', // White panels
            'panel-2': '#f7f8fa', // Slightly gray panels
            'border': '#e9edef', // Light borders
            'text': '#111b21', // Dark text
            'text-muted': '#667781', // Muted text
            'accent': '#00a884', // Accent green
          },
          'dark': {
            'bg': '#111b21', // WhatsApp dark background
            'panel': '#202c33', // Dark panels
            'panel-2': '#2a3942', // Slightly lighter panels
            'border': '#3b4a54', // Dark borders
            'text': '#e9edef', // Light text
            'text-muted': '#8696a0', // Muted text
            'accent': '#00a884', // Accent green (same in dark)
          }
        },
        // Legacy colors for backward compatibility
        primary: '#128c7e',
        'primary-dark': '#0f766e',
        secondary: '#667781',
        success: '#00a884',
        warning: '#ffa726',
        error: '#f44336',
        background: '#f0f2f5',
        surface: '#ffffff',
        text: '#111b21',
        'text-muted': '#667781',
        border: '#e9edef',
      },
      screens: {
        // Android-specific breakpoints
        'xs': '320px',    // Small phones
        'sm': '360px',    // Standard phones
        'md': '768px',    // Tablets
        'lg': '1024px',   // Large tablets
        'xl': '1280px',   // Desktop
        '2xl': '1536px',  // Large desktop
        
        // Height-based breakpoints for landscape
        'h-sm': { 'raw': '(max-height: 640px)' },
        'h-md': { 'raw': '(min-height: 641px) and (max-height: 1024px)' },
        'h-lg': { 'raw': '(min-height: 1025px)' },
        
        // Orientation-based breakpoints
        'portrait': { 'raw': '(orientation: portrait)' },
        'landscape': { 'raw': '(orientation: landscape)' },
      },
      spacing: {
        // Android Material Design spacing
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        
        // Touch target sizes (minimum 48dp)
        'touch': '48px',
        'touch-sm': '40px',
        'touch-lg': '56px',
      },
      fontSize: {
        // Fluid typography using clamp()
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem)',
      },
      animation: {
        // WhatsApp-style animations
        'wa-slide-up': 'wa-slide-up 0.2s ease-out',
        'wa-slide-down': 'wa-slide-down 0.2s ease-out',
        'wa-fade-in': 'wa-fade-in 0.15s ease-out',
        'wa-scale-in': 'wa-scale-in 0.15s ease-out',
        'wa-bounce': 'wa-bounce 0.3s ease-out',
        'wa-typing': 'wa-typing 1.4s ease-in-out infinite',
        'wa-pulse': 'wa-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Legacy Material Design animations
        'material-enter': 'material-enter 0.2s cubic-bezier(0.0, 0.0, 0.2, 1)',
        'material-exit': 'material-exit 0.15s cubic-bezier(0.4, 0.0, 1, 1)',
        'ripple': 'ripple 0.6s linear',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
      },
      keyframes: {
        // WhatsApp-style keyframes
        'wa-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'wa-slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'wa-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'wa-scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'wa-bounce': {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
          '70%': { transform: 'translate3d(0, -4px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
        'wa-typing': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-10px)' },
        },
        'wa-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        // Legacy Material Design keyframes
        'material-enter': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'material-exit': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.8)' },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        // WhatsApp-style shadows
        'wa-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'wa': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'wa-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'wa-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'wa-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'wa-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        // Legacy Material Design elevation shadows
        'elevation-1': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevation-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevation-3': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elevation-4': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'elevation-5': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'wa': '8px',
        'wa-lg': '12px',
        'wa-xl': '16px',
        'wa-2xl': '20px',
      },
      fontSize: {
        // WhatsApp-style typography
        'wa-xs': '0.75rem',    // 12px
        'wa-sm': '0.875rem',   // 14px
        'wa-base': '1rem',     // 16px
        'wa-lg': '1.125rem',   // 18px
        'wa-xl': '1.25rem',    // 20px
        'wa-2xl': '1.5rem',    // 24px
        'wa-3xl': '1.875rem',  // 30px
        // Legacy fluid typography
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem)',
      },
    } 
  },
  plugins: [],
}