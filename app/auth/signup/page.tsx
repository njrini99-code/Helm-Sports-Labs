'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkipLink } from '@/components/ui/skip-link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { EmptyState } from '@/components/ui/empty-state';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  // In dev mode, redirect to login which has the role selector
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4">
      <SkipLink href="#signup-content">Skip to signup content</SkipLink>
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div id="signup-content" className="w-full max-w-md">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg px-2 py-1"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
          Back to home
        </Link>
      <div className="bg-slate-900/90 dark:bg-slate-900/90 rounded-2xl p-8 border border-white/5 dark:border-white/5 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <Link 
              href="/" 
              className="text-3xl font-bold text-white dark:text-white inline-block mb-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded-lg px-2"
              aria-label="ScoutPulse Home"
            >
              Scout<span className="text-emerald-500 dark:text-emerald-400">Pulse</span>
            </Link>
            <p className="text-slate-400 dark:text-slate-400">Development Mode</p>
            <div className="mt-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl inline-block">
              <p className="text-xs text-amber-400 dark:text-amber-400">⚡ Auth bypassed for development</p>
            </div>
          </div>
      <EmptyState
            icon={<UserPlus className="h-12 w-12" />}
            title="Development Mode"
            description="Email authentication is disabled for development. Use the login page to select a dashboard to view."
            actionLabel="Go to Dashboard Selector"
            onAction={() => router.push('/auth/login')}
            variant="card"
          />
        </div>
      </div>
    </div>
  );
}
