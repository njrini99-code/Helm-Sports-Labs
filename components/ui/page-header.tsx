'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = 'Back',
  badge,
  actions,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {backHref && (
        <Link href={backHref}>
          <Button variant="ghost" size="sm" className="gap-1 -ml-2 mb-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
)}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground sm:text-base max-w-2xl">
              {description}
            </p>
)}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {actions}
          </div>
)}
      </div>
      {children}
    </div>
  );
}

interface PageSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function PageSection({
  title,
  description,
  actions,
  className,
  children,
}: PageSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
)}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
)}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
)}
      {children}
    </section>
  );
}

