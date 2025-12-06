'use client';

import { useEffect, useState } from 'react';
import { useCurrentPlayer } from '@/lib/hooks/useCurrentPlayer';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getPlayerPrograms, type PlayerProgramsResponse } from '@/lib/api/player/getPlayerPrograms';
import { PlayerHighSchoolProgramCard } from '@/components/player/dashboard/Programs/player-high-school-program-card';
import { PlayerShowcaseProgramsList } from '@/components/player/dashboard/Programs/player-showcase-programs-list';

export default function PlayerProgramsPage() {
  const { player, isLoading: loadingPlayer, error } = useCurrentPlayer();
  const [data, setData] = useState<PlayerProgramsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!player) return;
    setLoading(true);
    getPlayerPrograms(player.id).then(setData).finally(() => setLoading(false));
  }, [player]);

  if (loadingPlayer) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error || !player) {
    return (
      <Card className="bg-slate-900/70 border-white/5 p-6 text-white">
        <p className="text-sm text-slate-300">We could not load your profile yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PlayerHighSchoolProgramCard program={data?.highSchoolProgram || null} />
      <PlayerShowcaseProgramsList programs={data?.showcaseOrgs || []} loading={loading} />
    </div>
  );
}
