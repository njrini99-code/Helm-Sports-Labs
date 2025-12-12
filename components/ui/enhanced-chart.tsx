'use client';

import * as React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ChartTooltipProps {
  label: string;
  value: string | number;
  payload?: Array<{ name: string; value: number; color: string }>;
  children: React.ReactNode;
}

export function ChartTooltip({ label, value, payload, children }: ChartTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="backdrop-blur-xl bg-background/95 border shadow-lg">
          <div className="space-y-2">
            <p className="font-semibold">{label}</p>
            {payload && payload.length > 0 ? (
              <div className="space-y-1">
                {payload.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{backgroundColor: item.color }}></div>
                    <span className="text-sm">
                      {item.name}: {item.value}
                    </span>
                  </div>
)}
              </div>
            ) : (
              <p className="text-sm">{value}</p>
)}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ChartLegendProps {
  items: Array<{ name: string; color: string }>;
  onToggle?: (name: string) => void;
  hiddenItems?: Set<string>;
  className?: string;
}

export function ChartLegend({
  items,
  onToggle,
  hiddenItems,
  className,
}: ChartLegendProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {items.map((item) => {
        const isHidden = hiddenItems?.has(item.name);
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onToggle?.(item.name)}
            className={cn(
              'flex items-center gap-2 text-sm transition-opacity',
              isHidden && 'opacity-50',
              onToggle && 'hover:opacity-80 cursor-pointer'
            )}
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{backgroundColor: item.color }}></div>
            <span>{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}

interface TrendIndicatorProps {
  value: number;
  previousValue?: number;
  showArrow?: boolean;
  className?: string;
}

export function TrendIndicator({
  value,
  previousValue,
  showArrow = true,
  className,
}: TrendIndicatorProps) {
  if (previousValue === undefined) return null;

  const change = value - previousValue;
  const percentChange = previousValue !== 0 ? (change / previousValue) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-sm font-medium',
        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
        className
      )}
    >
      {showArrow && (
        <span>{isPositive ? '↑' : '↓'}</span>
)}
      <span>{Math.abs(percentChange).toFixed(1)}%</span>
    </div>
  );
}
