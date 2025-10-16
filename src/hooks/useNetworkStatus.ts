import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    let listener: { remove: () => void } | undefined;

    const setupListener = async () => {
      const checkStatus = async () => {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
        setConnectionType(status.connectionType);
      };

      checkStatus();

      listener = await Network.addListener('networkStatusChange', (status: any) => {
        console.log('Network status changed:', status);
        setIsOnline(status.connected);
        setConnectionType(status.connectionType);
      });
    };

    setupListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, []);

  return { isOnline, connectionType };
};
