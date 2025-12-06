'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Organization } from '@/types/organization';

export function PlayerHighSchoolProgramCard({ program }: { program: (Organization & { teamLevel?: string }) | null }) {
  if (!program) {
    return (
      <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
        <p className="text-sm text-slate-300">No high school program on file yet.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide">High School</p>
          <h3 className="text-lg font-semibold">{program.name}</h3>
          <p className="text-sm text-slate-400">
            {program.location_city}, {program.location_state}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/20 text-white">View Program</Button>
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-black">HS Stats</Button>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
        Team: {program.teamLevel || 'Varsity'} • Jersey: TBD
      </div>
    </Card>
  );
}
