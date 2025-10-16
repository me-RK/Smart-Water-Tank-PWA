import React from 'react';

interface SimpleConnectionGuardProps {
  children: React.ReactNode;
}

/**
 * Simplified Connection Guard for Android App
 * 
 * This guard no longer shows automatic device discovery screens.
 * Instead, it relies on the Devices tab for connection management.
 * It only provides basic connection status and error handling.
 */
export const SimpleConnectionGuard: React.FC<SimpleConnectionGuardProps> = ({ children }) => {
  // Always render children - no automatic blocking screens
  // Connection management is handled through the Devices tab
  return (
    <>
      {children}
    </>
  );
};

export default SimpleConnectionGuard;
