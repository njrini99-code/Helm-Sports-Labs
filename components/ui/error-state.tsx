'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'default' | 'network' | 'server' | 'notFound';
  className?: string;
}

const variants = {
  default: {
    icon: AlertCircle,
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
  network: {
    icon: WifiOff,
    title: 'Connection error',
    message: 'Unable to connect. Please check your internet connection.',
  },
  server: {
    icon: ServerCrash,
    title: 'Server error',
    message: 'Our servers are having trouble. Please try again later.',
  },
  notFound: {
    icon: AlertCircle,
    title: 'Not found',
    message: 'The requested resource could not be found.',
  },
};

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Try again',
  variant = 'default',
  className,
}: ErrorStateProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center gap-4',
        className
      )}
      role="alert"
    >
      <div className="rounded-full bg-destructive/10 p-3">
        <Icon className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          {title || config.title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {message || config.message}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
)}
    </div>
  );
}

// Inline error message for forms
interface InlineErrorProps {
  message?: string;
  className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
  if (!message) return null;

  return (
    <p className={cn('text-xs text-destructive flex items-center gap-1 mt-1', className)}>
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  );
}

