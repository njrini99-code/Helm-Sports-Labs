'use client';

import { useCurrentPlayer } from '@/lib/hooks/useCurrentPlayer';
import { PlayerEventsFilters } from '@/components/player/dashboard/Events/player-events-filters';
import { PlayerEventsTimeline } from '@/components/player/dashboard/Events/player-events-timeline';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getPlayerEventsTimeline, type EventFilter, type PlayerEventTimelineItem } from '@/lib/api/player/getPlayerEventsTimeline';

export default function PlayerEventsPage() {
  const { player, isLoading: loadingPlayer, error } = useCurrentPlayer();
  const [filters, setFilters] = useState<EventFilter>({ type: 'all', range: { from: null, to: null } });
  const [items, setItems] = useState<PlayerEventTimelineItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!player) return;
    setLoading(true);
    getPlayerEventsTimeline(player.id, filters).then(setItems).finally(() => setLoading(false));
  }, [player, filters]);

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
      <PlayerEventsFilters value={filters} onChange={setFilters} />
      <PlayerEventsTimeline items={items} loading={loading} />
    </div>
  );
}
