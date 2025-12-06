'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  // In dev mode, redirect to login which has the role selector
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
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

          <div className="space-y-4 text-center">
            <p className="text-slate-400">
              Email authentication is disabled for development.
            </p>
            <p className="text-slate-500 text-sm">
              Use the login page to select a dashboard to view.
            </p>
            <Link 
              href="/auth/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
            >
              Go to Dashboard Selector
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
