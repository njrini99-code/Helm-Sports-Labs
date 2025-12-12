'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface DashboardStatCardProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;

  /** Stat value (number or string) */
  value: number | string;

  /** Label for the stat */
  label: string;

  /** Optional sublabel */
  sublabel?: string;

  /** Trend indicator */
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string | number;
  };

  /** Color theme */
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'cyan' | 'red';

  /** Highlight this card */
  highlight?: boolean;

  /** Animation delay (for stagger effects) */
  delay?: number;

  /** Click handler */
  onClick?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// Color Configurations
// ═══════════════════════════════════════════════════════════════════════════

const COLOR_CLASSES = {
  emerald: {
    bg: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-400/30',
    icon: 'text-emerald-300',
    glow: 'shadow-emerald-500/20',
    hover: 'hover:border-emerald-400/50 hover:shadow-emerald-500/30',
  },
  blue: {
    bg: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-400/30',
    icon: 'text-blue-300',
    glow: 'shadow-blue-500/20',
    hover: 'hover:border-blue-400/50 hover:shadow-blue-500/30',
  },
  purple: {
    bg: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-400/30',
    icon: 'text-purple-300',
    glow: 'shadow-purple-500/20',
    hover: 'hover:border-purple-400/50 hover:shadow-purple-500/30',
  },
  amber: {
    bg: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-400/30',
    icon: 'text-amber-300',
    glow: 'shadow-amber-500/20',
    hover: 'hover:border-amber-400/50 hover:shadow-amber-500/30',
  },
  cyan: {
    bg: 'from-cyan-500/20 to-cyan-600/10',
    border: 'border-cyan-400/30',
    icon: 'text-cyan-300',
    glow: 'shadow-cyan-500/20',
    hover: 'hover:border-cyan-400/50 hover:shadow-cyan-500/30',
  },
  red: {
    bg: 'from-red-500/20 to-red-600/10',
    border: 'border-red-400/30',
    icon: 'text-red-300',
    glow: 'shadow-red-500/20',
    hover: 'hover:border-red-400/50 hover:shadow-red-500/30',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function DashboardStatCard({
  icon: Icon,
  value,
  label,
  sublabel,
  trend,
  color = 'emerald',
  highlight = false,
  delay = 0,
  onClick,
}: DashboardStatCardProps) {
  const colors = COLOR_CLASSES[color];
  const isClickable = !!onClick;

  return (
    <motion.div
      className={cn(
        // Base styles
        'relative p-6 rounded-2xl backdrop-blur-lg',
        'bg-gradient-to-br',
        colors.bg,
        'border',
        colors.border,
        'shadow-lg',
        colors.glow,

        // Hover effects
        'transition-all duration-300',
        colors.hover,
        isClickable && 'cursor-pointer hover:scale-105',

        // Highlight
        highlight && 'ring-2 ring-amber-400/40',

        // Group for child hover effects
        'group'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      whileHover={isClickable ? { scale: 1.03, y: -4 } : {}}
    >
      {/* Animated gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br',
          colors.bg,
          'opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl'
        )}
      />

      {/* Trend badge */}
      {trend && (
        <motion.span
          className={cn(
            'absolute top-3 right-3 flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full',
            'backdrop-blur-lg border',
            trend.direction === 'up'
              ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40 shadow-[0_2px_10px_rgba(16,185,129,0.3)]'
              : trend.direction === 'down'
              ? 'bg-red-500/25 text-red-200 border-red-400/40 shadow-[0_2px_10px_rgba(239,68,68,0.3)]'
              : 'bg-slate-500/25 text-slate-200 border-slate-400/40'
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          {trend.direction === 'up' && <TrendingUp className="w-3 h-3" strokeWidth={2} />}
          {trend.direction === 'down' && <TrendingDown className="w-3 h-3" strokeWidth={2} />}
          {typeof trend.value === 'number' ? `${trend.direction === 'up' ? '+' : ''}${trend.value}%` : trend.value}
        </motion.span>
      )}

      {/* Content */}
      <div className="relative z-10 flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'p-2 rounded-lg backdrop-blur-lg',
            'bg-white/[0.1] border',
            colors.border,
            colors.icon
          )}
        >
          <Icon className="w-4 h-4" strokeWidth={2} />
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-0">
          <motion.p
            className="text-2xl font-bold text-white mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay + 0.1 }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.p>

          <p className="text-xs text-white/90 font-semibold mb-0.5">{label}</p>

          {sublabel && (
            <p className="text-[10px] text-white/60">{sublabel}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Convenience Wrapper for Multiple Stats
// ═══════════════════════════════════════════════════════════════════════════

interface DashboardStatsGridProps {
  stats: DashboardStatCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function DashboardStatsGrid({
  stats,
  columns = 4,
  className
}: DashboardStatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4 md:gap-5', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <DashboardStatCard key={index} {...stat} delay={index * 0.1} />
      ))}
    </div>
  );
}
