'use client';

import { Card } from '@/components/ui/card';
import type { HsScheduleEvent } from '@/lib/api/hs/getHighSchoolSchedule';

export function HsScheduleList({ events, loading }: { events: HsScheduleEvent[]; loading?: boolean }) {
  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-300">Schedule</p>
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
      </div>
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-slate-400">No events in this range.</p>
        ) : (
          events.map((ev) => (
            <div key={ev.eventId} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{ev.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(ev.startTime).toLocaleString()} • {ev.location || 'TBD'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {ev.type.toUpperCase()} • {ev.teams.map((t) => t.name).join(', ')}
                  </p>
                </div>
                {ev.opponentName && (
                  <span className="text-xs rounded-full bg-white/10 px-2 py-1 border border-white/15">
                    vs {ev.opponentName}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
