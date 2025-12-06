'use client';

import { Card } from '@/components/ui/card';
import type { RecruitingSchool } from '@/lib/api/player/getPlayerRecruitingSnapshot';

export function PlayerRecruitingSchoolsTable({
  schools,
  loading,
}: {
  schools: RecruitingSchool[];
  loading?: boolean;
}) {
  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-300">Schools</p>
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
      </div>
      <div className="space-y-3">
        {schools.length === 0 ? (
          <p className="text-sm text-slate-400">No schools yet.</p>
        ) : (
          schools.map((school) => (
            <div key={school.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{school.name}</p>
                <p className="text-xs text-slate-400">
                  {school.conference || '—'} • Updated {school.lastUpdated}
                </p>
                {school.notes && <p className="text-xs text-slate-300">{school.notes}</p>}
              </div>
              <span className="text-xs capitalize px-2 py-1 rounded bg-white/10 border border-white/15">{school.status}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
