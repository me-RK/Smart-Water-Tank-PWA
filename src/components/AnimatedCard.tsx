import React, { useState, useEffect, useRef } from 'react';

/**
 * Enhanced AnimatedCard component with improved animations and performance
 * Features:
 * - Intersection Observer for better performance
 * - Staggered animations
 * - Smooth hover effects
 * - Reduced motion support
 */
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  duration?: number;
  stagger?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hover = true,
  delay = 0,
  direction = 'up',
  duration = 500,
  stagger = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use Intersection Observer for better performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, delay);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getTransformClasses = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up': return 'translate-y-4 opacity-0';
        case 'down': return '-translate-y-4 opacity-0';
        case 'left': return 'translate-x-4 opacity-0';
        case 'right': return '-translate-x-4 opacity-0';
        case 'fade': return 'opacity-0';
        case 'scale': return 'opacity-0 scale-98';
        default: return 'translate-y-4 opacity-0';
      }
    }
    return 'translate-y-0 translate-x-0 opacity-100 scale-100';
  };

  const getHoverClasses = () => {
    if (hover && isHovered) {
      return 'transform -translate-y-1 shadow-xl';
    }
    return 'transform translate-y-0';
  };

  const animationDuration = `duration-${duration}`;

  return (
    <div
      ref={cardRef}
      className={`
        transition-all ${animationDuration} ease-out
        ${getTransformClasses()}
        ${getHoverClasses()}
        ${stagger ? 'animate-stagger' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transitionDelay: stagger ? `${delay}ms` : '0ms'
      }}
    >
      {children}
    </div>
  );
};

/**
 * Enhanced FadeIn component with intersection observer
 */
export const FadeIn: React.FC<{ 
  children: React.ReactNode; 
  delay?: number;
  duration?: number;
}> = ({ children, delay = 0, duration = 600 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, delay);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={elementRef}
      className={`
        transition-all duration-${duration} ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      {children}
    </div>
  );
};

/**
 * Enhanced SlideIn component with intersection observer and better animations
 */
export const SlideIn: React.FC<{ 
  children: React.ReactNode; 
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
}> = ({ children, direction = 'left', delay = 0, duration = 500 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, delay);
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getTransformClasses = () => {
    if (!isVisible) {
      switch (direction) {
        case 'left': return 'translate-x-6 opacity-0';
        case 'right': return '-translate-x-6 opacity-0';
        case 'up': return 'translate-y-6 opacity-0';
        case 'down': return '-translate-y-6 opacity-0';
        default: return 'translate-x-6 opacity-0';
      }
    }
    return 'translate-x-0 translate-y-0 opacity-100 scale-100';
  };

  return (
    <div
      ref={elementRef}
      className={`
        transition-all duration-${duration} ease-out
        ${getTransformClasses()}
      `}
    >
      {children}
    </div>
  );
};

/**
 * New Pulse animation component for loading states
 */
export const Pulse: React.FC<{ 
  children: React.ReactNode; 
  duration?: number;
}> = ({ children, duration = 1000 }) => {
  return (
    <div
      className={`
        animate-pulse
      `}
      style={{
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

/**
 * New Bounce animation component for interactive elements
 */
export const Bounce: React.FC<{ 
  children: React.ReactNode; 
  trigger?: boolean;
}> = ({ children, trigger = false }) => {
  return (
    <div
      className={`
        transition-transform duration-300 ease-out
        ${trigger ? 'animate-bounce' : ''}
      `}
    >
      {children}
    </div>
  );
};
