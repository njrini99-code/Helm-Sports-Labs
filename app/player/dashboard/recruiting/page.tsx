'use client';

import { useEffect, useState } from 'react';
import { useCurrentPlayer } from '@/lib/hooks/useCurrentPlayer';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getPlayerRecruitingSnapshot, type PlayerRecruitingSnapshot } from '@/lib/api/player/getPlayerRecruitingSnapshot';
import { PlayerRecruitingSummary } from '@/components/player/dashboard/Recruiting/player-recruiting-summary';
import { PlayerRecruitingTimeline } from '@/components/player/dashboard/Recruiting/player-recruiting-timeline';
import { PlayerRecruitingSchoolsTable } from '@/components/player/dashboard/Recruiting/player-recruiting-schools-table';
import { EmptyState } from '@/components/ui/empty-state';

export default function PlayerRecruitingPage() {
  const { player, isLoading: loadingPlayer, error } = useCurrentPlayer();
  const [data, setData] = useState<PlayerRecruitingSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!player) return;
    setLoading(true);
    getPlayerRecruitingSnapshot(player.id).then(setData).finally(() => setLoading(false));
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
      <PlayerRecruitingSummary summary={data?.summary} loading={loading} />
      {!loading && !data?.schools?.length && (
        <EmptyState
          title="No schools added yet"
          description="Start tracking recruiting progress by adding colleges you're interested in."
        />
      )}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <PlayerRecruitingTimeline events={data?.timeline || []} loading={loading} />
        <PlayerRecruitingSchoolsTable schools={data?.schools || []} loading={loading} />
      </div>
    </div>
  );
}
