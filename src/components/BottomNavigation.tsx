import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Activity, Settings, Wifi } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * WhatsApp-Style Bottom Navigation Component
 * 
 * Features:
 * - WhatsApp-inspired design with teal accent color
 * - Haptic feedback on navigation
 * - Active state indicators
 * - Safe area support for notched devices
 * - Smooth animations and transitions
 * - Touch-optimized for mobile devices
 */

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: Home,
    path: '/dashboard',
  },
  {
    id: 'monitor',
    label: 'Monitor',
    icon: Activity,
    path: '/monitor',
  },
  {
    id: 'devices',
    label: 'Devices',
    icon: Wifi,
    path: '/devices',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];

interface BottomNavigationProps {
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handle navigation with haptic feedback
   */
  const handleNavigation = async (path: string) => {
    // Add haptic feedback for native feel
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {
        console.log('Haptics not available');
      }
    }

    // Navigate to the selected route
    navigate(path);
  };

  /**
   * Check if a navigation item is currently active
   */
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <nav className={`wa-bottom-nav ${className}`}>
      {navigationItems.map((item) => {
        const IconComponent = item.icon;
        const active = isActive(item.path);

        return (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={`wa-bottom-nav-item ${active ? 'active' : ''}`}
            aria-label={`Navigate to ${item.label}`}
            aria-current={active ? 'page' : undefined}
          >
            <div className="relative">
              <IconComponent className="wa-bottom-nav-icon" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="wa-bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
