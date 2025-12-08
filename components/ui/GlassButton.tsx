'use client';

import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { glassButton } from '@/lib/glassmorphism';
// Removed Loader2 - using shimmer skeleton instead

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
  /** Icon to display before text */
  icon?: ReactNode;
  /** Icon to display after text */
  iconRight?: ReactNode;
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

/**
 * GlassButton - A reusable button component with glassmorphism styling
 * 
 * @example
 * ```tsx
 * <GlassButton variant="primary" onClick={handleClick}>
 *   Save Changes
 * </GlassButton>
 * 
 * <GlassButton variant="secondary" icon={<Plus />}>
 *   Add Item
 * </GlassButton>
 * ```
 */
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconRight,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    // Get base variant classes and remove size classes (we'll use our own)
    const baseClasses = glassButton[variant]
      .replace(/px-\d+/g, '')
      .replace(/py-\d+/g, '')
      .trim();

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseClasses,
          sizeClasses[size],
          'inline-flex items-center justify-center gap-2 font-medium',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="h-4 w-4 bg-white/20 rounded animate-pulse" />
        ) : icon ? (
          icon
        ) : null}
        {children}
        {iconRight && !loading && iconRight}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

export default GlassButton;

