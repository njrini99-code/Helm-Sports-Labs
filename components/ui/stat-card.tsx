'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';
import { Skeleton } from './skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
}

const variantStyles = {
  default: {
    icon: 'bg-muted text-muted-foreground',
    trend: 'text-muted-foreground',
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
    trend: 'text-primary',
  },
  success: {
    icon: 'bg-emerald-500/10 text-emerald-500',
    trend: 'text-emerald-500',
  },
  warning: {
    icon: 'bg-amber-500/10 text-amber-500',
    trend: 'text-amber-500',
  },
  danger: {
    icon: 'bg-destructive/10 text-destructive',
    trend: 'text-destructive',
  },
};

const sizeStyles = {
  sm: {
    padding: 'p-4',
    icon: 'h-8 w-8 p-1.5',
    title: 'text-xs',
    value: 'text-xl',
    description: 'text-xs',
  },
  md: {
    padding: 'p-5',
    icon: 'h-10 w-10 p-2',
    title: 'text-sm',
    value: 'text-2xl',
    description: 'text-xs',
  },
  lg: {
    padding: 'p-6',
    icon: 'h-12 w-12 p-2.5',
    title: 'text-sm',
    value: 'text-3xl',
    description: 'text-sm',
  },
};

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'default',
  size = 'md',
  className,
  loading = false,
}: StatCardProps) {
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];

  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className={cn(sizes.padding, 'space-y-3')}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className={cn('rounded-lg', sizes.icon)} />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden hover:shadow-xl transition-shadow', className)}>
      <CardContent className={cn(sizes.padding, 'space-y-2')}>
        <div className="flex items-center justify-between">
          <p className={cn('font-medium text-muted-foreground', sizes.title)}>
            {title}
          </p>
          {icon && (
            <div className={cn('rounded-lg', sizes.icon, styles.icon)}>
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <p className={cn('font-bold text-foreground', sizes.value)}>{value}</p>
          {trend && (
            <span className={cn('flex items-center gap-0.5 text-xs font-medium', 
              trend.value > 0 ? 'text-emerald-500' : trend.value < 0 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {trend.value > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend.value < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        {description && (
          <p className={cn('text-muted-foreground', sizes.description)}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Grid wrapper for stat cards
interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatCardGrid({ children, columns = 4, className }: StatCardGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}

