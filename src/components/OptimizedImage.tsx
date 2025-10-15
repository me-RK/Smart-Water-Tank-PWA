import React, { useState, useRef } from 'react';
import { useLazyImage, useIntersectionObserver } from '../hooks/usePerformanceOptimizations';

/**
 * Optimized Image Component
 * 
 * Features:
 * - Lazy loading with intersection observer
 * - Placeholder and error states
 * - Responsive images
 * - WebP support with fallback
 * - Blur-to-sharp loading effect
 */
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  fallback?: string;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  fallback,
  priority = false,
  sizes = '100vw',
  onLoad,
  onError
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  
  const { hasIntersected } = useIntersectionObserver(elementRef, {
    rootMargin: priority ? '0px' : '50px',
    threshold: 0.1
  });

  const { imageSrc: lazySrc, isLoaded: lazyLoaded, isError: lazyError } = useLazyImage(
    hasIntersected || priority ? src : '',
    placeholder
  );

  React.useEffect(() => {
    if (lazyLoaded && lazySrc) {
      setImageSrc(lazySrc);
      setIsLoaded(true);
      onLoad?.();
    }
  }, [lazyLoaded, lazySrc, onLoad]);

  React.useEffect(() => {
    if (lazyError) {
      setHasError(true);
      if (fallback) {
        setImageSrc(fallback);
      }
      onError?.();
    }
  }, [lazyError, fallback, onError]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    if (fallback) {
      setImageSrc(fallback);
    }
    onError?.();
  };

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder/Blur */}
      {!isLoaded && placeholder && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
        />
      )}

      {/* Main Image */}
      {hasIntersected || priority ? (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={`
            w-full h-full object-cover transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        // Skeleton placeholder
        <div
          className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{ minHeight: height || 200 }}
        />
      )}

      {/* Error State */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
};
