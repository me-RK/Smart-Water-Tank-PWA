import React, { useRef, useState } from 'react';
import { useIntersectionObserver } from '../hooks/usePerformanceOptimizations';

/**
 * Lazy Loading Wrapper Component
 * 
 * Features:
 * - Intersection Observer-based lazy loading
 * - Skeleton loading state
 * - Error boundary
 * - Performance optimized
 */
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  minHeight?: string;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  errorFallback,
  rootMargin = '50px',
  threshold = 0.1,
  className = '',
  minHeight = '200px'
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const { hasIntersected } = useIntersectionObserver(elementRef, {
    rootMargin,
    threshold
  });

  const defaultFallback = (
    <div 
      className="android-skeleton rounded-lg animate-pulse"
      style={{ minHeight }}
    >
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
      </div>
    </div>
  );

  const defaultErrorFallback = (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="text-red-700 dark:text-red-300 text-sm">
        Failed to load content
      </div>
    </div>
  );

  if (hasError) {
    return (
      <div className={className}>
        {errorFallback || defaultErrorFallback}
      </div>
    );
  }

  return (
    <div ref={elementRef} className={className}>
      {hasIntersected ? (
        <ErrorBoundary onError={() => setHasError(true)}>
          {children}
        </ErrorBoundary>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
};

// Simple Error Boundary for lazy loaded content
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: () => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyWrapper Error:', error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle error display
    }

    return this.props.children;
  }
}
