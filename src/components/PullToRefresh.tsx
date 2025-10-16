import React, { useState, useRef, useCallback, type ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * WhatsApp-Style Pull-to-Refresh Component
 * 
 * Features:
 * - WhatsApp-inspired pull-to-refresh animation
 * - Haptic feedback on pull and release
 * - Smooth animations and transitions
 * - Customizable pull threshold
 * - Loading state management
 * - Touch-optimized for mobile devices
 */

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  className = '',
  disabled = false,
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPullingRef = useRef(false);

  /**
   * Handle touch start
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;

    const container = containerRef.current;
    if (!container) return;

    // Only start pull if we're at the top of the scroll
    if (container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  }, [disabled, isRefreshing]);

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback(async (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !isPullingRef.current) return;

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);

    if (distance > 0) {
      e.preventDefault();
      setPullDistance(distance);
      setIsPulling(true);

      // Add haptic feedback when threshold is reached
      if (distance >= threshold && !canRefresh) {
        setCanRefresh(true);
        if (Capacitor.isNativePlatform()) {
          try {
            await Haptics.impact({ style: ImpactStyle.Medium });
      } catch {
        console.log('Haptics not available');
      }
        }
      } else if (distance < threshold && canRefresh) {
        setCanRefresh(false);
      }
    }
  }, [disabled, isRefreshing, threshold, canRefresh]);

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPullingRef.current) return;

    isPullingRef.current = false;
    setIsPulling(false);

    if (canRefresh && pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(0);
      setCanRefresh(false);

      // Add haptic feedback for refresh start
      if (Capacitor.isNativePlatform()) {
        try {
          await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch {
        console.log('Haptics not available');
      }
      }

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    } else {
      // Reset pull distance with animation
      setPullDistance(0);
      setCanRefresh(false);
    }
  }, [disabled, isRefreshing, canRefresh, pullDistance, threshold, onRefresh]);

  /**
   * Calculate pull indicator position and opacity
   */
  const getPullIndicatorStyle = () => {
    const opacity = Math.min(pullDistance / threshold, 1);
    
    return {
      transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)`,
      opacity: opacity,
    };
  };

  /**
   * Calculate refresh icon rotation
   */
  const getRefreshIconStyle = () => {
    const rotation = (pullDistance / threshold) * 360;
    return {
      transform: `rotate(${rotation}deg)`,
    };
  };

  return (
    <div
      ref={containerRef}
      className={`wa-pull-to-refresh ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: isPulling ? `translateY(${Math.min(pullDistance * 0.3, 60)}px)` : 'translateY(0)',
        transition: isPulling ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {/* Pull Indicator */}
      <div
        className={`wa-pull-indicator ${isPulling ? 'pulling' : ''} ${isRefreshing ? 'refreshing' : ''}`}
        style={getPullIndicatorStyle()}
      >
        <div
          className="flex items-center gap-2"
          style={getRefreshIconStyle()}
        >
          <RefreshCw 
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
          />
          <span className="text-sm font-medium">
            {isRefreshing 
              ? 'Refreshing...' 
              : canRefresh 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
