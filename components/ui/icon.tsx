/**
 * Modern Minimal Icon System
 * 
 * Provides consistent, minimal icon styling across the app.
 * Optimized for modern, clean aesthetics with lighter stroke weights.
 */

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface IconProps {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  strokeWidth?: number;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const defaultStrokeWidths = {
  xs: 1.5,
  sm: 1.5,
  md: 2,
  lg: 2,
  xl: 2.5,
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, size = 'md', className, strokeWidth, ...props }, ref) => {
    const stroke = strokeWidth ?? defaultStrokeWidths[size];
    
    return (
      <IconComponent 
        ref={ref}
        className={cn(sizeClasses[size], className)}
        strokeWidth={stroke}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';
