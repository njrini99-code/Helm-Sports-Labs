'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingState({
  variant = 'spinner',
  size = 'md',
  text,
  className,
}: LoadingStateProps) {
  const sizes = {
    sm: { spinner: 'h-4 w-4', text: 'text-xs' },
    md: { spinner: 'h-6 w-6', text: 'text-sm' },
    lg: { spinner: 'h-8 w-8', text: 'text-base' },
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-1', className)}>
        <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizes[size].spinner)} />
      {text && (
        <p className={cn('text-muted-foreground', sizes[size].text)}>{text}</p>
      )}
    </div>
  );
}

// Full page loading state
interface PageLoadingProps {
  text?: string;
}

export function PageLoading({ text = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingState size="lg" text={text} />
    </div>
  );
}

// Card skeleton for loading states
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border bg-card p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}

// Table skeleton for loading states
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn('rounded-2xl border bg-card overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// List skeleton for loading states
interface ListSkeletonProps {
  items?: number;
  className?: string;
}

export function ListSkeleton({ items = 5, className }: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border bg-card p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

