'use client';

import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

type GameRow = {
  id: string;
  date: string;
  opponent: string;
  event: string;
  points: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
};

export function PlayerOverviewRecentGames({ playerId }: { playerId: string }) {
  // TODO: replace with real query
  const games: GameRow[] = [
    { id: 'g1', date: '2024-01-10', opponent: 'Central HS', event: 'Regular Season', points: 20, fgPct: 57, threePct: 50, ftPct: 50 },
    { id: 'g2', date: '2024-01-15', opponent: 'North Ridge', event: 'Regular Season', points: 18, fgPct: 54, threePct: 40, ftPct: 66 },
    { id: 'g3', date: '2024-01-22', opponent: 'Showcase Game 2', event: 'Showcase', points: 24, fgPct: 56, threePct: 50, ftPct: 75 },
  ];

  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-slate-300">Recent games</p>
          <p className="text-xs text-slate-500">Player {playerId.slice(0, 6)}…</p>
        </div>
        <button className="text-xs text-emerald-300 hover:text-emerald-200">View in Performance</button>
      </div>
      <div className="divide-y divide-white/5">
        {games.map((g) => (
          <div key={g.id} className="py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{g.opponent}</p>
              <p className="text-[12px] text-slate-400">{formatDate(g.date)} • {g.event}</p>
            </div>
            <div className="flex items-center gap-4 text-right">
              <Stat label="PTS" value={g.points} />
              <Stat label="FG%" value={g.fgPct} />
              <Stat label="3P%" value={g.threePct} />
              <Stat label="FT%" value={g.ftPct} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
