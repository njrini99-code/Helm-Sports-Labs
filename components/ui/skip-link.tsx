'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'focus:z-50 focus:px-4 focus:py-2',
        'focus:bg-emerald-500 focus:text-white focus:rounded-lg',
        'focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
        'transition-all duration-200',
        className
      )}
    >
      {children}
    </Link>
  );
}
