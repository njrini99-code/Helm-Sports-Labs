'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RecruitingTimelineItem } from '@/lib/api/player/getPlayerRecruitingSnapshot';

export function PlayerRecruitingTimeline({
  events,
  loading,
}: {
  events: RecruitingTimelineItem[];
  loading?: boolean;
}) {
  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex items-center justify-between mb-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <p className="text-sm text-slate-300">Timeline</p>
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
      </div>
      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-sm text-slate-400">No recruiting activity yet.</p>
        ) : (
          events.map((item) => (
            <div key={item.id} className="relative pl-6">
              <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]"></span>
              <div className="flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                <div>
                  <p className="text-xs text-slate-400">{item.date}</p>
                  <p className="text-sm font-semibold">{item.school}</p>
                  {item.notes && <p className="text-xs text-slate-400">{item.notes}</p>}
                </div>
                <Badge className="capitalize bg-white/10 border-white/20 text-white">{item.status}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
