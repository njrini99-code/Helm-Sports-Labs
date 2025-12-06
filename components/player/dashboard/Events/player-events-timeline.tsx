'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerEventTimelineItem } from '@/lib/api/player/getPlayerEventsTimeline';
import { formatDate } from '@/lib/utils';

export function PlayerEventsTimeline({
  items,
  loading,
}: {
  items: PlayerEventTimelineItem[];
  loading?: boolean;
}) {
  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-300">Timeline</p>
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
      </div>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">No events in this range.</p>
        ) : (
          items.map((item) => (
            <div key={item.eventId} className="relative pl-6">
              <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.orgName} • {item.location || '—'}</p>
                  {item.statsSnippet && (
                    <p className="text-xs text-slate-300">
                      {item.statsSnippet.points} pts • {item.statsSnippet.rebounds} reb • {item.statsSnippet.assists} ast
                    </p>
                  )}
                </div>
                <Badge className="bg-white/10 border-white/20 text-white capitalize">{prettyType(item.type)}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function prettyType(t: PlayerEventTimelineItem['type']) {
  if (t === 'high_school_game') return 'HS Game';
  if (t === 'showcase_event') return 'Showcase';
  if (t === 'showcase_game') return 'Showcase Game';
  return t;
}
