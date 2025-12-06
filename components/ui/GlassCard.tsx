'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { glassCard, glassCardHover } from '@/lib/glassmorphism';

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Enable hover animation (lift + glow) */
  hover?: boolean;
  /** Additional padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Border radius preset */
  rounded?: 'lg' | 'xl' | '2xl' | '3xl';
  /** Click handler */
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6 md:p-8',
};

const roundedClasses = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
};

/**
 * GlassCard - A reusable card component with glassmorphism styling
 * 
 * @example
 * ```tsx
 * <GlassCard hover padding="md">
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </GlassCard>
 * ```
 */
export function GlassCard({
  children,
  className,
  hover = true,
  padding = 'md',
  rounded = 'xl',
  onClick,
}: GlassCardProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        glassCard,
        hover && glassCardHover,
        paddingClasses[padding],
        roundedClasses[rounded],
        onClick && 'cursor-pointer text-left w-full',
        className
      )}
    >
      {children}
    </Component>
  );
}

export default GlassCard;

