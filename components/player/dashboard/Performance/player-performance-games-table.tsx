'use client';

import { Card } from '@/components/ui/card';
import type { PlayerStatLine } from '@/types/stats';

export function PlayerPerformanceGamesTable({
  games,
  loading,
}: {
  games: PlayerStatLine[];
  loading?: boolean;
}) {
  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-300">Games</p>
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[12px] uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">Event</th>
              <th className="py-2 pr-3">PTS</th>
              <th className="py-2 pr-3">REB</th>
              <th className="py-2 pr-3">AST</th>
              <th className="py-2 pr-3">FG</th>
              <th className="py-2 pr-3">3P</th>
              <th className="py-2 pr-3">FT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {games.length === 0 ? (
              <tr>
                <td className="py-4 text-slate-400 text-sm" colSpan={8}>
                  No games in this range.
                </td>
              </tr>
            ) : (
              games.map((g) => (
                <tr key={g.id} className="hover:bg-white/5 transition">
                  <td className="py-2 pr-3 text-slate-200">{g.created_at || '—'}</td>
                  <td className="py-2 pr-3 text-slate-300">{g.event_id || 'Event'}</td>
                  <td className="py-2 pr-3">{g.points ?? '—'}</td>
                  <td className="py-2 pr-3">{g.rebounds ?? '—'}</td>
                  <td className="py-2 pr-3">{g.assists ?? '—'}</td>
                  <td className="py-2 pr-3">
                    {fmt(g.fg_made)}/{fmt(g.fg_attempts)}
                  </td>
                  <td className="py-2 pr-3">
                    {fmt(g.three_made)}/{fmt(g.three_attempts)}
                  </td>
                  <td className="py-2 pr-3">
                    {fmt(g.ft_made)}/{fmt(g.ft_attempts)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function fmt(val?: number | null) {
  return typeof val === 'number' ? val : '—';
}
