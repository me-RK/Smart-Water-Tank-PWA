import { useEffect } from 'react';
import { App } from '@capacitor/app';

export const useAppLifecycle = (
  onPause?: () => void,
  onResume?: () => void
) => {
  useEffect(() => {
    let pauseListener: any;

    const setupListener = async () => {
      pauseListener = await App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive && onPause) {
          console.log('App paused');
          onPause();
        } else if (isActive && onResume) {
          console.log('App resumed');
          onResume();
        }
      });
    };

    setupListener();

    return () => {
      if (pauseListener) {
        pauseListener.remove();
      }
    };
  }, [onPause, onResume]);
};
