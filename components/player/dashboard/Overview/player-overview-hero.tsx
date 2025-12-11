'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Player } from '@/types/player';
import type { Profile } from '@/types/profile';
import { copyToClipboard } from '@/lib/utils';
import { toast } from 'sonner';

export function PlayerOverviewHero({ player, profile }: { player: Player; profile: Profile }) {
  const gradYear = player.grad_year || '—';
  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'SP';

  const handleShare = () => {
    copyToClipboard(window.location.href);
    toast.success('Profile link copied');
  };

  return (
    <Card className="bg-gradient-to-br from-[#0f172a] via-[#0b1223] to-[#0a0f1e] border-white/10 text-white p-5 md:p-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border border-white/10">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{profile.full_name || 'Player'}</h2>
              <Badge variant="outline" className="border-emerald-400/60 text-emerald-300 bg-emerald-500/10">
                {gradYear}
              </Badge>
            </div>
            <p className="text-sm text-slate-300">
              {player.primary_position || 'Position'} {player.secondary_position ? ` / ${player.secondary_position}` : ''}
            </p>
            <p className="text-xs text-slate-400">
              {player.height_inches ? `${Math.floor(player.height_inches / 12)}'${player.height_inches % 12}" • ` : ''}
              {player.weight_lbs ? `${player.weight_lbs} lbs • ` : ''}
              {player.city || 'City'}, {player.state || 'State'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShare} className="border-white/20 text-white">
            Share Profile
          </Button>
          <Button variant="default" className="bg-emerald-500 hover:bg-emerald-400 text-black" onClick={() => (window.location.href = '/player/dashboard/settings')}>
            Edit Profile
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Profile strength</span>
          <span>82%</span>
        </div>
        <Progress value={82} className="bg-white/10" />
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-slate-200">
        <StatChip label="HS / Team" value={player.high_school_name || 'HS • Varsity'} />
        <StatChip label="Throws" value={player.throws || 'R'} />
        <StatChip label="Bats" value={player.bats || 'R'} />
      </div>
    </Card>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}
