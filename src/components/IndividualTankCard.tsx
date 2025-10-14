import React, { memo, useState, useEffect } from 'react';
import { Droplets, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Enhanced IndividualTankCard component with improved animations and visual feedback
 * Features:
 * - Animated water level progress bar
 * - Status indicators with icons
 * - Smooth transitions and hover effects
 * - Better accessibility
 */
interface IndividualTankCardProps {
  tankName: string;
  tankType: 'upper' | 'lower';
  level: number;
  isActive: boolean;
  className?: string;
}

export const IndividualTankCard: React.FC<IndividualTankCardProps> = memo(({
  tankName,
  tankType,
  level,
  isActive,
  className = ''
}) => {
  const [animatedLevel, setAnimatedLevel] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Animate level changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedLevel(level);
    }, 100);
    return () => clearTimeout(timer);
  }, [level]);

  const getLevelColor = (level: number) => {
    if (level >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
    if (level >= 50) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (level >= 20) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
  };

  const getLevelBarColor = (level: number) => {
    if (level >= 80) return 'bg-gradient-to-r from-green-400 to-green-600';
    if (level >= 50) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (level >= 20) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gradient-to-r from-red-400 to-red-600';
  };

  const getTankTypeColor = (type: 'upper' | 'lower') => {
    return type === 'upper' ? 'text-blue-500' : 'text-purple-500';
  };

  const getTankTypeLabel = (type: 'upper' | 'lower') => {
    return type === 'upper' ? 'Upper Tank' : 'Lower Tank';
  };

  const getStatusIcon = (level: number) => {
    if (level >= 80) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (level <= 20) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    return <Droplets className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = (level: number) => {
    if (level >= 80) return 'Optimal';
    if (level >= 50) return 'Good';
    if (level >= 20) return 'Low';
    return 'Critical';
  };

  const getStatusColor = (level: number) => {
    if (level >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (level >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (level >= 20) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  // Don't render if sensor is not active
  if (!isActive) {
    return null;
  }

  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700
        p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        ${isHovered ? 'ring-1 ring-blue-500/30' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Droplets className={`w-5 h-5 ${getTankTypeColor(tankType)} transition-all duration-300 hover:scale-110 hover:rotate-12`} />
            {isHovered && (
              <div className="absolute -inset-1 bg-blue-500/20 rounded-full animate-ping" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {tankName} - {getTankTypeLabel(tankType)}
          </h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(level)} flex items-center space-x-1`}>
          <div className="transition-all duration-300 hover:scale-110 hover:rotate-12">
            {getStatusIcon(level)}
          </div>
          <span>{getStatusText(level)}</span>
        </div>
      </div>

      {/* Tank Level with Enhanced Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Water Level
          </span>
          <span className={`
            text-sm font-bold px-3 py-1 rounded-full transition-all duration-300
            ${getLevelColor(level)}
          `}>
            {level}%
          </span>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full" />
          
          {/* Animated progress bar */}
          <div
            className={`
              h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden
              ${getLevelBarColor(level)}
            `}
            style={{ width: `${Math.min(100, Math.max(0, animatedLevel))}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </div>
          
          {/* Level markers */}
          <div className="absolute inset-0 flex justify-between items-center px-1">
            {[0, 25, 50, 75, 100].map((marker) => (
              <div
                key={marker}
                className="w-0.5 h-2 bg-white/50 rounded-full"
                style={{ marginLeft: marker === 0 ? '0' : marker === 100 ? '0' : '-1px' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Level Indicator */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1 transition-colors duration-300">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${level <= 20 ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-red-300'}`}></div>
          <span className={level <= 20 ? 'font-medium' : ''}>Low</span>
        </div>
        <div className="flex items-center space-x-1 transition-colors duration-300">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${level > 20 && level <= 50 ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-yellow-300'}`}></div>
          <span className={level > 20 && level <= 50 ? 'font-medium' : ''}>Medium</span>
        </div>
        <div className="flex items-center space-x-1 transition-colors duration-300">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${level > 50 ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-green-300'}`}></div>
          <span className={level > 50 ? 'font-medium' : ''}>High</span>
        </div>
      </div>
    </div>
  );
});
