'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface AnimatedNumberProps {
  /** Target value to animate to */
  value: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Number of decimal places to show */
  decimals?: number;
  /** Prefix to display before the number (e.g., "$") */
  prefix?: string;
  /** Suffix to display after the number (e.g., "%") */
  suffix?: string;
  /** Format number with thousand separators */
  formatThousands?: boolean;
  /** CSS class name */
  className?: string;
  /** Easing function type */
  easing?: 'linear' | 'easeOut' | 'easeInOut';
  /** Trigger animation on viewport entry */
  animateOnView?: boolean;
}

// Easing functions
const easingFunctions = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};

/**
 * AnimatedNumber - A number that counts up when rendered
 * 
 * @example
 * ```tsx
 * <AnimatedNumber value={1234} duration={2000} />
 * <AnimatedNumber value={99.5} suffix="%" decimals={1} />
 * <AnimatedNumber value={50000} prefix="$" formatThousands />
 * ```
 */
export function AnimatedNumber({
  value,
  duration = 1500,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  formatThousands = false,
  className,
  easing = 'easeOut',
  animateOnView = true,
}: AnimatedNumberProps) {
  const [loading, setLoading] = useState(true);
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<number | null>(null);

  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    if (formatThousands) {
      const parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    return fixed;
  };

  const startAnimation = () => {
    if (hasAnimated) return;
    setHasAnimated(true);

    const startTime = performance.now() + delay;
    const easingFn = easingFunctions[easing];

    const animate = (currentTime: number) => {
      if (currentTime < startTime) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);
      
      setDisplayValue(easedProgress * value);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!animateOnView) {
      // Start animation immediately if not waiting for viewport
      const timeoutId = setTimeout(startAnimation, delay);
      return () => {
        clearTimeout(timeoutId);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }

    // Use Intersection Observer for viewport detection
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            startAnimation();
          });
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, delay, animateOnView, hasAnimated]);

  // Reset animation if value changes
  useEffect(() => {
    setHasAnimated(false);
    setDisplayValue(0);
  }, [value]);

  return (
    <span ref={elementRef} className={cn('tabular-nums', className)}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}

export default AnimatedNumber;

