import { Capacitor } from '@capacitor/core';

interface DebugInfoProps {
  wsStatus: string;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ wsStatus }) => {
  return (
    <div className="debug-info bg-gray-100 p-4 m-4 rounded-lg text-sm">
      <h3 className="font-bold mb-2">Debug Information</h3>
      <p><strong>Platform:</strong> {Capacitor.getPlatform()}</p>
      <p><strong>Native:</strong> {Capacitor.isNativePlatform() ? 'Yes' : 'No'}</p>
      <p><strong>WebSocket:</strong> {wsStatus}</p>
      <p><strong>User Agent:</strong> {navigator.userAgent}</p>
      <p><strong>Location:</strong> {window.location.href}</p>
    </div>
  );
};
