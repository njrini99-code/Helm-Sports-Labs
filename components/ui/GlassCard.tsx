'use client';

import { forwardRef, ReactNode } from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type GlassCardSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type GlassCardVariant = 'default' | 'subtle' | 'solid' | 'gradient' | 'glow';

export interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  /** Size variant affecting padding */
  size?: GlassCardSize;
  /** Visual variant */
  variant?: GlassCardVariant;
  /** Disable hover animations */
  disableHover?: boolean;
  /** Custom hover scale (default: 1.02) */
  hoverScale?: number;
  /** Custom hover Y translation (default: -4) */
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
  /** As child - renders as a slot */
  asChild?: boolean;
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
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const createHoverVariants = (
  scale: number,
  y: number,
  disabled: boolean
): Variants => ({
  initial: {
    scale: 1,
    y: 0,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  },
  hover: disabled
    ? {}
    : {
        scale,
        y,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15)',
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 25,
        },
      },
  tap: disabled
    ? {}
    : {
        scale: 0.98,
        transition: {
          type: 'spring',
          stiffness: 500,
          damping: 30,
        },
      },
});

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
      ...props
    },
    ref
  ) => {
    const hoverVariants = createHoverVariants(hoverScale, hoverY, disableHover);

    // Build glow style for 'glow' variant
    const glowStyle = variant === 'glow' && glowColor
      ? {
          ...style,
          boxShadow: `0 0 40px ${glowColor}20, 0 0 80px ${glowColor}10`,
        }
      : style;

    return (
      <motion.div
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
          clickable && 'cursor-pointer',
          // Custom
          className
        )}
        style={glowStyle}
        variants={hoverVariants}
        initial="initial"
        whileHover="hover"
        whileTap={clickable ? 'tap' : undefined}
        {...props}
      >
        {/* Glow Effect Overlay for 'glow' variant */}
        {variant === 'glow' && (
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
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
            'border-b border-white/10 -mx-4 px-4 pb-4 mb-4',
            size === 'sm' && '-mx-3 px-3 pb-3 mb-3',
            size === 'lg' && '-mx-6 px-6 pb-6 mb-6',
            size === 'xl' && '-mx-8 px-8 pb-6 mb-6',
            size === 'full' && 'mx-0 px-4 pb-4 mb-0'
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
            'border-t border-white/10 -mx-4 px-4 pt-4 mt-4',
            size === 'sm' && '-mx-3 px-3 pt-3 mt-3',
            size === 'lg' && '-mx-6 px-6 pt-6 mt-6',
            size === 'xl' && '-mx-8 px-8 pt-6 mt-6',
            size === 'full' && 'mx-0 px-4 pt-4 mt-0'
          )}>
            {footer}
          </div>
        )}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// ═══════════════════════════════════════════════════════════════════════════
// GLASS CARD HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassCardHeaderProps {
  children: ReactNode;
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

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default GlassCard;
