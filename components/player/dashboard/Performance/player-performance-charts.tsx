'use client';

import { Card } from '@/components/ui/card';
import type { PlayerGameSeriesPoint } from '@/lib/api/player/getPlayerStatsSeries';

export function PlayerPerformanceCharts({
  series,
  loading,
}: {
  series: PlayerGameSeriesPoint[];
  loading?: boolean;
}) {
  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white h-full">
      <div className="flex items-center justify-between mb-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <p className="text-sm text-slate-300">Trend</p>
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
      </div>
      <div className="space-y-3">
        {series.length === 0 ? (
          <p className="text-sm text-slate-400">No games yet for this range.</p>
        ) : (
          series.map((point) => (
            <div key={point.date} className="rounded-2xl bg-white/5 border border-white/10 px-3 py-2">
              <div className="flex items-center justify-between text-xs text-slate-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                <span>{point.date}</span>
                <span>{point.points} pts</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                <Bar label="FG%" value={point.fgPct ?? 0} />
                <Bar label="3P%" value={point.threePct ?? 0} />
                <Bar label="FT%" value={point.ftPct ?? 0} />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <span>{label}</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 mt-1">
        <div
          className="h-1.5 rounded-full bg-emerald-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
