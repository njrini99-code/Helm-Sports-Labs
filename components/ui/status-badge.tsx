'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';
import { CheckCircle2, Clock, XCircle, AlertCircle, Star, Sparkles, Trophy } from 'lucide-react';

type StatusType =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pending'
  | 'active'
  | 'inactive'
  | 'featured'
  | 'verified'
  | 'premium';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { bg: string; text: string; icon: React.ElementType }
> = {
  success: {
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    icon: AlertCircle,
  },
  error: {
    bg: 'bg-red-500/10 border-red-500/30',
    text: 'text-red-600 dark:text-red-400',
    icon: XCircle,
  },
  info: {
    bg: 'bg-blue-500/10 border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    icon: AlertCircle,
  },
  pending: {
    bg: 'bg-slate-500/10 border-slate-500/30',
    text: 'text-slate-600 dark:text-slate-400',
    icon: Clock,
  },
  active: {
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  inactive: {
    bg: 'bg-slate-500/10 border-slate-500/30',
    text: 'text-slate-600 dark:text-slate-400',
    icon: XCircle,
  },
  featured: {
    bg: 'bg-purple-500/10 border-purple-500/30',
    text: 'text-purple-600 dark:text-purple-400',
    icon: Star,
  },
  verified: {
    bg: 'bg-blue-500/10 border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    icon: CheckCircle2,
  },
  premium: {
    bg: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    icon: Sparkles,
  },
};

// Map common status strings to status types
const statusAliases: Record<string, StatusType> = {
  // Recruiting statuses
  interested: 'info',
  contacted: 'pending',
  questionnaire: 'pending',
  unofficial_visit: 'warning',
  official_visit: 'featured',
  offer: 'success',
  verbal: 'success',
  signed: 'success',
  committed: 'success',
  declined: 'error',
  // Pipeline statuses
  watchlist: 'pending',
  high_priority: 'featured',
  offer_extended: 'success',
  uninterested: 'inactive',
  // General statuses
  active: 'active',
  inactive: 'inactive',
  new: 'info',
  draft: 'pending',
  published: 'success',
  archived: 'inactive',
};

export function StatusBadge({
  status,
  label,
  showIcon = true,
  size = 'sm',
  className,
}: StatusBadgeProps) {
  // Normalize status to a known type
  const normalizedStatus = status.toLowerCase().replace(/[^a-z_]/g, '');
  const statusType: StatusType =
    (statusConfig[normalizedStatus as StatusType] ? normalizedStatus : statusAliases[normalizedStatus]) as StatusType ||
    'info';

  const config = statusConfig[statusType];
  const Icon = config.icon;

  const displayLabel = label || status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.bg,
        config.text,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {showIcon && <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      {displayLabel}
    </span>
  );
}

// Recruiting-specific status badge
interface RecruitingStatusBadgeProps {
  status: string;
  className?: string;
}

export function RecruitingStatusBadge({ status, className }: RecruitingStatusBadgeProps) {
  return <StatusBadge status={status} showIcon size="sm" className={className} />;
}

