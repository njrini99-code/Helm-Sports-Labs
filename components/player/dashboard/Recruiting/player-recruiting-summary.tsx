'use client';

import { Card } from '@/components/ui/card';
import type { PlayerRecruitingSnapshot } from '@/lib/api/player/getPlayerRecruitingSnapshot';

export function PlayerRecruitingSummary({
  summary,
  loading,
}: {
  summary: PlayerRecruitingSnapshot['summary'] | null | undefined;
  loading?: boolean;
}) {
  const tiles = [
    { label: 'Schools', value: summary?.totalSchools ?? 0 },
    { label: 'Offers', value: summary?.offers ?? 0 },
    { label: 'Visits', value: summary?.visits ?? 0 },
    { label: 'Latest', value: summary?.latestUpdate || '—' },
  ];

  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-300">Recruiting snapshot</p>
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{tile.label}</p>
            <p className="text-lg font-semibold">{tile.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
