'use client';

import { forwardRef, ReactNode, HTMLAttributes, useState } from 'react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type GlassCardSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type GlassCardVariant = 'default' | 'subtle' | 'solid' | 'gradient' | 'glow';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Size variant affecting padding */
  size?: GlassCardSize;
  /** Visual variant */
  variant?: GlassCardVariant;
  /** Disable hover animations */
  disableHover?: boolean;
  /** Custom hover scale (default: 1.02) */
  hoverScale?: number;
  /** Custom hover Y translation in px (default: -4) */
  hoverY?: number;
  /** Enable click animation */
  clickable?: boolean;
  /** Apply glassmorphism effect (default: true) */
  glass?: boolean;
  /** Custom border radius */
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' | 'none';
  /** Header content */
  header?: ReactNode;
  /** Footer content */
  footer?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Glow color for 'glow' variant */
  glowColor?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const SIZE_STYLES: Record<GlassCardSize, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  full: 'p-0',
};

const VARIANT_STYLES: Record<GlassCardVariant, string> = {
  default: 'bg-white/10 border-white/15',
  subtle: 'bg-white/5 border-white/10',
  solid: 'bg-slate-800/80 border-slate-700/50',
  gradient: 'bg-gradient-to-br from-white/15 to-white/5 border-white/20',
  glow: 'bg-white/10 border-white/20',
};

const ROUNDED_STYLES: Record<string, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
  none: 'rounded-none',
};

// ═══════════════════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-4 bg-white/10 rounded w-1/2" />
      <div className="h-20 bg-white/10 rounded" />
      <div className="h-4 bg-white/10 rounded w-2/3" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GLASS CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      size = 'md',
      variant = 'default',
      disableHover = false,
      hoverScale = 1.02,
      hoverY = -4,
      clickable = false,
      glass = true,
      rounded = 'xl',
      header,
      footer,
      loading = false,
      glowColor,
      style,
      onMouseDown,
      onMouseUp,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);

    // Build dynamic hover styles
    const hoverStyles = !disableHover
      ? {
          '--hover-scale': hoverScale,
          '--hover-y': `${hoverY}px`,
        } as React.CSSProperties
      : {};

    // Build glow style for 'glow' variant
    const glowStyles = variant === 'glow' && glowColor
      ? {
          boxShadow: `0 0 40px ${glowColor}20, 0 0 80px ${glowColor}10`,
        }
      : {};

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      if (clickable) setIsPressed(true);
      onMouseDown?.(e);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
      if (clickable) setIsPressed(false);
      onMouseUp?.(e);
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'relative overflow-hidden border shadow-xl',
          // Glassmorphism
          glass && 'backdrop-blur-xl',
          // Size
          SIZE_STYLES[size],
          // Variant
          VARIANT_STYLES[variant],
          // Rounded
          ROUNDED_STYLES[rounded],
          // Interactive
          clickable && 'cursor-pointer select-none',
          // Hover animations (CSS-based)
          !disableHover && [
            'transition-all duration-300 ease-out',
            'hover:scale-[var(--hover-scale,1.02)]',
            'hover:translate-y-[var(--hover-y,-4px)]',
            'hover:shadow-2xl hover:shadow-black/25',
          ],
          // Click animation
          clickable && isPressed && 'scale-[0.98]',
          // Custom
          className
        )}
        style={{
          ...style,
          ...hoverStyles,
          ...glowStyles,
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsPressed(false)}
        {...props}
      >
        {/* Glow Effect Overlay for 'glow' variant */}
        {variant === 'glow' && (
          <div
            className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
            style={{
              background: glowColor
                ? `radial-gradient(ellipse at center, ${glowColor}40 0%, transparent 70%)`
                : 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
            }}
          />
        )}

        {/* Header */}
        {header && (
          <div className={cn(
            'border-b border-white/10 pb-4 mb-4',
            size === 'sm' && 'pb-3 mb-3',
            size === 'lg' && 'pb-6 mb-6',
            size === 'xl' && 'pb-6 mb-6'
          )}>
            {header}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">
          {loading ? <LoadingSkeleton /> : children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={cn(
            'border-t border-white/10 pt-4 mt-4',
            size === 'sm' && 'pt-3 mt-3',
            size === 'lg' && 'pt-6 mt-6',
            size === 'xl' && 'pt-6 mt-6'
          )}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// ═══════════════════════════════════════════════════════════════════════════
// GLASS CARD HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassCardHeaderProps {
  children?: ReactNode;
  className?: string;
  /** Title text */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Icon element */
  icon?: ReactNode;
  /** Action element (button, dropdown, etc.) */
  action?: ReactNode;
}

export function GlassCardHeader({
  children,
  className,
  title,
  subtitle,
  icon,
  action,
}: GlassCardHeaderProps) {
  // If using title/subtitle/icon/action props
  if (title || subtitle || icon || action) {
    return (
      <div className={cn('flex items-center justify-between gap-4', className)}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-white/10 shrink-0">
              {icon}
            </div>
          )}
          <div>
            {title && (
              <h3 className="font-semibold text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }

  // Custom children
  return <div className={className}>{children}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// GLASS CARD CONTENT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassCardContentProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardContent({ children, className }: GlassCardContentProps) {
  return <div className={cn('text-slate-300', className)}>{children}</div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// GLASS CARD FOOTER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardFooter({ children, className }: GlassCardFooterProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GLASS CARD GROUP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassCardGroupProps {
  children: ReactNode;
  className?: string;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Gap between cards */
  gap?: 'sm' | 'md' | 'lg';
}

const GAP_STYLES = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function GlassCardGroup({
  children,
  className,
  direction = 'vertical',
  gap = 'md',
}: GlassCardGroupProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
        GAP_STYLES[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESET CARDS
// ═══════════════════════════════════════════════════════════════════════════

/** Stat card with number and label */
export interface GlassStatCardProps extends Omit<GlassCardProps, 'children'> {
  value: string | number;
  label: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  valueColor?: string;
}

export function GlassStatCard({
  value,
  label,
  icon,
  trend,
  valueColor,
  className,
  ...props
}: GlassStatCardProps) {
  return (
    <GlassCard className={cn('min-w-[140px]', className)} {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p
            className={cn('text-2xl font-bold', valueColor || 'text-white')}
          >
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'text-xs mt-1 flex items-center gap-1',
                trend.direction === 'up' && 'text-emerald-400',
                trend.direction === 'down' && 'text-red-400',
                trend.direction === 'neutral' && 'text-slate-400'
              )}
            >
              {trend.direction === 'up' && '↑'}
              {trend.direction === 'down' && '↓'}
              {trend.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-white/10">
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

/** Feature card with icon, title, and description */
export interface GlassFeatureCardProps extends Omit<GlassCardProps, 'children'> {
  title: string;
  description: string;
  icon: ReactNode;
  iconColor?: string;
}

export function GlassFeatureCard({
  title,
  description,
  icon,
  iconColor,
  className,
  ...props
}: GlassFeatureCardProps) {
  return (
    <GlassCard
      className={cn('text-center', className)}
      clickable
      {...props}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4',
          iconColor || 'bg-emerald-500/20 text-emerald-400'
        )}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </GlassCard>
  );
}

/** Interactive card that acts as a link/button */
export interface GlassActionCardProps extends Omit<GlassCardProps, 'children'> {
  title: string;
  description?: string;
  icon: ReactNode;
  iconBg?: string;
  chevron?: boolean;
}

export function GlassActionCard({
  title,
  description,
  icon,
  iconBg,
  chevron = true,
  className,
  ...props
}: GlassActionCardProps) {
  return (
    <GlassCard
      className={cn('', className)}
      clickable
      {...props}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
            iconBg || 'bg-white/10'
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{title}</h4>
          {description && (
            <p className="text-sm text-slate-400 truncate">{description}</p>
          )}
        </div>
        {chevron && (
          <svg
            className="w-5 h-5 text-slate-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </div>
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default GlassCard;
