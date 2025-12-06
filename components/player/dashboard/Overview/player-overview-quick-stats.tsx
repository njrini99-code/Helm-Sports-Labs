'use client';

import { Card } from '@/components/ui/card';

type Stat = { label: string; value: string; helper?: string };

export function PlayerOverviewQuickStats({ playerId }: { playerId: string }) {
  // TODO: wire to real data. Using mock values for now.
  const stats: Stat[] = [
    { label: 'PPG', value: '20.7', helper: 'Last 5' },
    { label: 'RPG', value: '6.1' },
    { label: 'APG', value: '4.3' },
    { label: 'FG%', value: '52%' },
    { label: '3P%', value: '41%' },
    { label: 'FT%', value: '78%' },
  ];

  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-300">Quick stats</p>
        <span className="text-xs text-slate-500">Player ID: {playerId.slice(0, 6)}…</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="text-lg font-semibold">{stat.value}</p>
            {stat.helper && <p className="text-[11px] text-slate-500">{stat.helper}</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}
