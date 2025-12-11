'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReactNode, useMemo } from 'react';

const TABS = [
  { label: 'Overview', href: '/player/dashboard' },
  { label: 'Performance', href: '/player/dashboard/performance' },
  { label: 'Events', href: '/player/dashboard/events' },
  { label: 'Programs', href: '/player/dashboard/programs' },
  { label: 'Recruiting', href: '/player/dashboard/recruiting' },
  { label: 'Settings', href: '/player/dashboard/settings' },
];

export default function PlayerDashboardLayout({ children }: { children: ReactNode })
          )} {
  const pathname = usePathname();
  const active = useMemo(
    () => TABS.find((tab) => pathname === tab.href)?.href || '/player/dashboard',
    [pathname]
  );

  return (
    <div className="min-h-screen bg-[#060a15] text-white">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold">Player Dashboard</h1>
            <p className="text-sm text-slate-400">Your centralized hub for progress and exposure.</p>
          </div>
          <Tabs value={active} className="w-full">
            <TabsList className="bg-slate-900/70 border border-white/10 w-full justify-start overflow-x-auto">
              {{TABS.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            TABS.map((tab) => (
                <TabsTrigger key={tab.href} value={tab.href} className="data-[state=active]:bg-white/10">
                  <Link href={tab.href} className="px-2 py-1 block">
                    {tab.label}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        {children}
      </div>
    </div>
  );
}
