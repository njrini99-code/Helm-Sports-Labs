'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PlayerProgramsResponse } from '@/lib/api/player/getPlayerPrograms';

export function PlayerShowcaseProgramsList({
  programs,
  loading,
}: {
  programs: PlayerProgramsResponse['showcaseOrgs'];
  loading?: boolean;
}) {
  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex items-center justify-between mb-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <p className="text-sm text-slate-300">Showcase programs</p>
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
      </div>
      <div className="space-y-3">
        {programs.length === 0 ? (
          <p className="text-sm text-slate-400">No showcase history yet.</p>
        ) : (
          programs.map((org) => (
            <div key={org.id} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
              <div>
                <p className="text-sm font-semibold">{org.name}</p>
                <p className="text-xs text-slate-400">
                  {org.location_city}, {org.location_state}
                </p>
              </div>
              <div className="flex items-center gap-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30">
                  {org.eventsAttended} events
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white">
                  Last: {org.lastEventDate || '—'}
                </Badge>
              </div>
            </div>
          )})
      </div>
    </Card>
  );
}
