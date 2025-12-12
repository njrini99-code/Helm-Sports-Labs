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
        <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
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
    <div className="flex min-h-[400px] items-center justify-center hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
      <LoadingState size="lg" text={text} />
    </motion.div>
  );
}

// Card skeleton for loading states
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border bg-card p-6 space-y-4', className)}>
      <div className="flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-2xl" />
      </motion.div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-40" />
    </motion.div>
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
          })
        </div>
      </motion.div>
      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 flex-1" />
              })
            </motion.div>
          </motion.div>
)}
      </motion.div>
    </motion.div>
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
        <div key={i} className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-20 rounded-2xl" />
        </div>
)}
    </div>
  );
}

// Messages skeleton for loading state
export function MessagesSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1720] via-[#0f172a] to-[#f4f7fb]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)]">
          {/* Conversations List Skeleton */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="rounded-2xl border bg-white/95 backdrop-blur-sm overflow-hidden h-full">
              {/* Header */}
              <div className="px-4 py-4 border-b">
                <Skeleton className="h-7 w-32 mb-3" />
                <Skeleton className="h-10 w-full rounded-2xl" />
              </motion.div>
              {/* Conversations */}
              <div className="divide-y">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="px-4 py-4">
                    <div className="flex items-start gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                      <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </div>
)}
              </div>
            </div>
          </div>
      {/* Messages Thread Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl border bg-white/95 backdrop-blur-sm overflow-hidden h-full flex flex-col">
              {/* Thread Header */}
              <div className="px-5 py-4 border-b flex items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-9 w-9 rounded-2xl" />
              </div>
      {/* Messages Area */}
              <div className="flex-1 p-5 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="space-y-2 max-w-md">
                      <Skeleton className={`h-16 rounded-2xl ${i % 2 === 0 ? 'rounded-tl-sm' : 'rounded-tr-sm'}`} style={{ width: `${200 + Math.random() * 100}}px` }} />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
)}
              </div>
      {/* Input Area */}
              <div className="px-5 py-4 border-t">
                <div className="flex items-center gap-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                  <Skeleton className="h-10 flex-1 rounded-2xl" />
                  <Skeleton className="h-10 w-10 rounded-2xl" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Player Discover skeleton for loading state
export function PlayerDiscoverSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Dark Hero Zone Skeleton */}
      <div className="bg-gradient-to-b from-[#0b1720] via-[#0f172a] to-[#f4f7fb]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-8 space-y-6">
          {/* Hero Header Skeleton */}
          <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
              <div className="space-y-3">
                <div className="flex items-center gap-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                  <Skeleton className="h-9 w-9 rounded-xl bg-white/10" />
                  <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
                </div>
                <Skeleton className="h-8 w-64 bg-white/10" />
                <Skeleton className="h-4 w-80 bg-white/10" />
              </div>
              <Skeleton className="h-20 w-28 rounded-xl bg-white/10" />
            </div>
          </div>
      {/* Search Bar Skeleton */}
          <Skeleton className="h-14 w-full rounded-2xl bg-white/10" />

          {/* Filter Chips Row Skeleton */}
          <div className="flex flex-wrap items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
            <Skeleton className="h-10 w-28 rounded-xl bg-white/10" />
            <Skeleton className="h-10 w-32 rounded-xl bg-white/10" />
            <Skeleton className="h-10 w-28 rounded-xl bg-white/10" />
            <Skeleton className="h-10 w-36 rounded-xl bg-white/10" />
          </div>
        </motion.div>
      </motion.div>
      {/* Light Content Zone Skeleton */}
      <div className="bg-[#f4f7fb] min-h-[50vh]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl border p-5 space-y-4">
                <div className="flex items-start justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-2xl" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full rounded-2xl" />
              </motion.div>
)}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Watchlist skeleton for loading state
export function WatchlistSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-5 space-y-4">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-72" />
          </motion.div>
          <div className="flex items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      {/* Controls Row Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <Skeleton className="h-9 w-full lg:w-64" />
          <div className="flex items-center gap-1.5 flex-wrap hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            })
          </div>
          <div className="flex items-center gap-2 lg:ml-auto hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
            <Skeleton className="h-9 w-32 rounded-2xl" />
            <Skeleton className="h-9 w-32 rounded-2xl" />
          </div>
        </div>
      {/* Table Skeleton */}
        <div className="rounded-2xl border bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="border-b bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          {/* Table Rows */}
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-4 py-3">
                <div className="flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                  <Skeleton className="h-4 w-4" />
                  <div className="flex items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full ml-auto" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-2xl" />
                </div>
              </div>
)}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Coach Dashboard skeleton for loading state
export function CoachDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Hero Banner Skeleton */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A3B2E] via-[#062A20] to-[#041A14]">
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
            {/* Avatar Skeleton */}
            <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-2xl" />

            {/* Program Info Skeleton */}
            <div className="flex-1 min-w-0 w-full md:w-auto">
              <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 md:p-5 border border-white/10 space-y-3">
                <Skeleton className="h-8 w-48 bg-white/10" />
                <Skeleton className="h-4 w-32 bg-white/10" />
                <Skeleton className="h-3 w-40 bg-white/10" />
                <Skeleton className="h-3 w-56 bg-white/10" />
                <div className="pt-2">
                  <Skeleton className="h-1.5 w-full max-w-xs bg-white/10" />
                </div>
              </div>
            </div>
      {/* Action Buttons Skeleton */}
            <div className="flex gap-2 w-full md:w-auto">
              <Skeleton className="h-10 w-32 rounded-2xl" />
              <Skeleton className="h-10 w-32 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
      {/* Metric Cards Skeleton */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-5 relative z-10">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-border/50 shadow-lg p-4 md:p-5 space-y-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
)}
        </div>
      </section>
      {/* Main Content Grid Skeleton */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-5">
          {/* Left Column - Activity Feed Skeleton */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
              <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-8 w-32 rounded-2xl" />
              </div>
              <div className="divide-y divide-border/30">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="px-5 py-4 flex items-start gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                    <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-full max-w-md" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-2xl" />
                  </div>
)}
              </div>
            </div>
      {/* Camps Skeleton */}
            <div className="rounded-2xl border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-7 w-20 rounded-2xl" />
              </div>
              <div className="flex gap-3 overflow-x-hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex-shrink-0 w-64">
                    <Skeleton className="h-32 w-full rounded-xl" />
                  </div>
)}
              </div>
              <Skeleton className="h-9 w-full rounded-2xl mt-4" />
            </div>
          </div>
      {/* Right Column - Pipeline Skeleton */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
              <div className="space-y-2 mb-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-2xl" />
                  </div>
)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

