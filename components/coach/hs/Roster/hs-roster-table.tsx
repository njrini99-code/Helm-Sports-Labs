'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { HsRosterPlayer } from '@/lib/api/hs/getHighSchoolRoster';
import type { Team } from '@/types/team';

export function HsRosterTable({
  players,
  loading,
  teams,
  selected,
  onToggleSelect,
}: {
  players: HsRosterPlayer[];
  loading?: boolean;
  teams: Team[];
  selected: Set<string>;
  onToggleSelect: (playerId: string) => void;
}) {
  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-300">Roster</p>
        {loading && <p className="text-xs text-slate-500">Loading…</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[12px] uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-3"></th>
              <th className="py-2 pr-3">Player</th>
              <th className="py-2 pr-3">Teams</th>
              <th className="py-2 pr-3">Grad</th>
              <th className="py-2 pr-3">Pos</th>
              <th className="py-2 pr-3">GPA</th>
              <th className="py-2 pr-3">Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {players.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-slate-400 text-sm">
                  {loading ? 'Loading roster…' : 'No players found.'}
                </td>
              </tr>
            ) : (
              players.map((p) => (
                <tr key={p.playerId} className="hover:bg-white/5 transition">
                  <td className="py-2 pr-3 align-top">
                    <input
                      type="checkbox"
                      checked={selected.has(p.playerId)}
                      onChange={() => onToggleSelect(p.playerId)}
                      className="accent-emerald-500"
                    />
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarFallback>{p.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{p.fullName}</p>
                        <p className="text-xs text-slate-400">{p.profileId.slice(0, 6)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {p.teams.map((t) => (
                        <Badge key={t.teamId} className="bg-white/10 border-white/20 text-white">
                          {t.name}
                        </Badge>
)}
                    </div>
                  </td>
                  <td className="py-2 pr-3 align-top">{p.gradYear || '—'}</td>
                  <td className="py-2 pr-3 align-top">{p.positions.join(', ')}</td>
                  <td className="py-2 pr-3 align-top">{p.gpa ?? '—'}</td>
                  <td className="py-2 pr-3 align-top">
                    <Badge
                      variant="outline"
                      className={p.isProfileComplete ? 'border-emerald-500/40 text-emerald-300' : 'border-amber-500/40 text-amber-300'}
                    >
                      {p.isProfileComplete ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </td>
                </tr>
              )})
          </tbody>
        </table>
      </div>
    </Card>
  );
}
