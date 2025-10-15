import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';
// Safe area is handled by CSS env() variables
import { App } from '@capacitor/app';

/**
 * Android-specific features hook
 * 
 * Provides access to native Android features including:
 * - Haptic feedback
 * - Status bar management
 * - Keyboard handling
 * - Safe area management
 * - App lifecycle events
 */
export const useAndroidFeatures = () => {
  const [isNative, setIsNative] = useState(false);
  const [safeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const checkNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
    setIsNative(checkNative);

    if (checkNative) {
      // Safe area is handled by CSS env() variables
      console.log('Safe area handled by CSS');

      // Listen for keyboard events
      Keyboard.addListener('keyboardWillShow', (info: { keyboardHeight: number }) => {
        setKeyboardHeight(info.keyboardHeight);
        setIsKeyboardVisible(true);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      });

      // Listen for app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          // App became active
          console.log('App became active');
        } else {
          // App became inactive
          console.log('App became inactive');
        }
      });

      // Listen for back button
      App.addListener('backButton', () => {
        // Handle back button press
        console.log('Back button pressed');
        // You can implement custom back button behavior here
      });
    }

    return () => {
      if (checkNative) {
        Keyboard.removeAllListeners();
        App.removeAllListeners();
      }
    };
  }, []);

  const hapticFeedback = async (style: ImpactStyle = ImpactStyle.Light) => {
    if (isNative) {
      try {
        await Haptics.impact({ style });
      } catch (error) {
        console.log('Haptic feedback not available:', error);
      }
    }
  };

  const hapticNotification = async (type: NotificationType) => {
    if (isNative) {
      try {
        await Haptics.notification({ type });
      } catch (error) {
        console.log('Haptic notification not available:', error);
      }
    }
  };

  const setStatusBarStyle = async (style: Style, color?: string) => {
    if (isNative) {
      try {
        await StatusBar.setStyle({ style });
        if (color) {
          await StatusBar.setBackgroundColor({ color });
        }
      } catch (error) {
        console.log('Status bar styling not available:', error);
      }
    }
  };

  const setKeyboardResize = async (mode: KeyboardResize) => {
    if (isNative) {
      try {
        await Keyboard.setResizeMode({ mode });
      } catch (error) {
        console.log('Keyboard resize not available:', error);
      }
    }
  };

  const setKeyboardStyle = async (style: KeyboardStyle) => {
    if (isNative) {
      try {
        await Keyboard.setStyle({ style });
      } catch (error) {
        console.log('Keyboard style not available:', error);
      }
    }
  };

  const hideKeyboard = async () => {
    if (isNative) {
      try {
        await Keyboard.hide();
      } catch (error) {
        console.log('Keyboard hide not available:', error);
      }
    }
  };

  const showKeyboard = async () => {
    if (isNative) {
      try {
        await Keyboard.show();
      } catch (error) {
        console.log('Keyboard show not available:', error);
      }
    }
  };

  return {
    isNative,
    safeAreaInsets,
    keyboardHeight,
    isKeyboardVisible,
    hapticFeedback,
    hapticNotification,
    setStatusBarStyle,
    setKeyboardResize,
    setKeyboardStyle,
    hideKeyboard,
    showKeyboard
  };
};
