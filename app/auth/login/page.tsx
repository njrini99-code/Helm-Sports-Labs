'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, User, GraduationCap, School, Trophy, Building2 } from 'lucide-react';

const DEV_ACCOUNTS = [
  {
    id: 'player',
    label: 'Player Dashboard',
    description: 'View as a baseball player',
    icon: User,
    path: '/player',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'college',
    label: 'College Coach',
    description: 'View as a college coach',
    icon: GraduationCap,
    path: '/coach/college',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'high-school',
    label: 'High School Coach',
    description: 'View as a high school coach',
    icon: School,
    path: '/coach/high-school',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  {
    id: 'showcase',
    label: 'Showcase Coach',
    description: 'View as a showcase/travel team coach',
    icon: Trophy,
    path: '/coach/showcase',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    id: 'juco',
    label: 'JUCO Coach',
    description: 'View as a junior college coach',
    icon: Building2,
    path: '/coach/juco',
    color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleDevLogin = (account: typeof DEV_ACCOUNTS[0]) => {
    setLoading(account.id);
    // Store the selected role in localStorage for the app to use
    localStorage.setItem('dev_role', account.id);
    localStorage.setItem('dev_mode', 'true');
    
    // Small delay for UX
    setTimeout(() => {
      router.push(account.path);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </Link>

        <div className="bg-slate-900/90 rounded-2xl p-8 border border-white/5 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-white inline-block mb-2">
              Scout<span className="text-blue-500">Pulse</span>
            </Link>
            <p className="text-slate-400">Development Mode</p>
            <div className="mt-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg inline-block">
              <p className="text-xs text-amber-400">⚡ Auth bypassed for development</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-4">Select a dashboard to view:</p>
            
            {DEV_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              const isLoading = loading === account.id;
              
              return (
                <button
                  key={account.id}
                  onClick={() => handleDevLogin(account)}
                  disabled={loading !== null}
                  className={`w-full p-4 rounded-xl border ${account.color} hover:scale-[1.02] transition-all duration-200 flex items-center gap-4 text-left disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${account.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{account.label}</p>
                    <p className="text-sm text-slate-400">{account.description}</p>
                  </div>
                  {isLoading && (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-xs text-slate-500 text-center">
              This is a development-only login. Email authentication is disabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
