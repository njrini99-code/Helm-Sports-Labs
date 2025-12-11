'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// Animated Counter Hook
// ═══════════════════════════════════════════════════════════════════════════
function useCountUp(end: number, duration = 1500) {
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (typeof end !== 'number') return;
    
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      countRef.current = Math.floor(easeOut * end);
      setCount(countRef.current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════
export interface StatCardProps {
  /** Lucide icon component */
  icon: React.ElementType;
  /** The main value to display */
  value: number | string;
  /** Label below the value */
  label: string;
  /** Optional trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Optional trend value (e.g., "+12%") */
  trendValue?: string;
  /** Background color for icon container */
  iconBg?: string;
  /** Icon color */
  iconColor?: string;
  /** Whether dark mode is enabled */
  isDark?: boolean;
  /** Optional click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
  /** Whether to animate the number */
  animate?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════
export function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  trend, 
  trendValue,
  iconBg = 'bg-emerald-100',
  iconColor = 'text-emerald-600',
  isDark = false,
  onClick,
  className,
  animate = true,
}: StatCardProps) {
  const isNumericValue = typeof value === 'number';
  const animatedValue = isNumericValue && animate ? useCountUp(value) : value;
  
  return (
    <Card 
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
        isDark 
          ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80' 
          : 'bg-white/90 border-slate-100/50 shadow-sm hover:shadow-emerald-500/10',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn('p-2.5 rounded-xl', iconBg)}>
            <Icon className={cn('w-5 h-5', iconColor)} strokeWidth={1.75} />
          </div>
          {trend && trendValue && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-[10px] px-1.5 py-0.5 border',
                trend === 'up' && 'bg-emerald-50 text-emerald-600 border-emerald-200',
                trend === 'down' && 'bg-red-50 text-red-600 border-red-200',
                trend === 'neutral' && 'bg-slate-50 text-slate-600 border-slate-200'
              )}
            >
              {trend === 'up' && <TrendingUp className="w-3 h-3 mr-0.5" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 mr-0.5" />}
              {trendValue}
            </Badge>
          )}
        </div>
        <p className={cn(
          'text-3xl font-bold mt-3',
          isDark ? 'text-white' : 'text-slate-800'
        )}>
          {animatedValue}
        </p>
        <p className={cn(
          'text-xs mt-1 uppercase tracking-wide font-medium',
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}>
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Preset Variants
// ═══════════════════════════════════════════════════════════════════════════
export function ViewsStatCard(props: Omit<StatCardProps, 'icon' | 'iconBg' | 'iconColor'> & { icon?: React.ElementType }) {
  const { icon, ...rest } = props;
  return (
    <StatCard 
      icon={icon || require('lucide-react').Eye}
      iconBg={props.isDark ? 'bg-sky-500/10' : 'bg-sky-100'}
      iconColor={props.isDark ? 'text-sky-400' : 'text-sky-600'}
      {...rest}
    />
  );
}

export function FollowersStatCard(props: Omit<StatCardProps, 'icon' | 'iconBg' | 'iconColor'> & { icon?: React.ElementType }) {
  const { icon, ...rest } = props;
  return (
    <StatCard 
      icon={icon || require('lucide-react').UserPlus}
      iconBg={props.isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}
      iconColor={props.isDark ? 'text-emerald-400' : 'text-emerald-600'}
      {...rest}
    />
  );
}

export function MentionsStatCard(props: Omit<StatCardProps, 'icon' | 'iconBg' | 'iconColor'> & { icon?: React.ElementType }) {
  const { icon, ...rest } = props;
  return (
    <StatCard 
      icon={icon || require('lucide-react').Heart}
      iconBg={props.isDark ? 'bg-pink-500/10' : 'bg-pink-100'}
      iconColor={props.isDark ? 'text-pink-400' : 'text-pink-600'}
      {...rest}
    />
  );
}

export default StatCard;


