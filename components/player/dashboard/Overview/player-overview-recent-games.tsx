'use client';

import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type GameRow = {
  id: string;
  date: string;
  opponent: string;
  event: string;
  points: number;
  fgPct: number;
  threePct: number;
  ftPct: number;
};

export function PlayerOverviewRecentGames({ playerId }: { playerId: string }) {
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, [playerId]);

  // Loads real game data from game_stats and schedule_events tables
  const loadGames = async () => {
    try {
      const supabase = createClient();
      
      // Try to get games from schedule events or game stats
      // First, try game_stats table
      const { data: gameStats, error: gameStatsError } = await supabase
        .from('game_stats')
        .select('*, events:event_id (event_name, event_date, opponent_name, event_type)')
        .eq('player_id', playerId)
        .order('game_date', { ascending: false })
        .limit(5);

      if (!gameStatsError && gameStats && gameStats.length > 0) {
        const mappedGames: GameRow[] = gameStats.map((stat: any) => {
          const event = stat.events || {};
          return {
            id: stat.id,
            date: stat.game_date || event.event_date || new Date().toISOString().split('T')[0],
            opponent: event.opponent_name || 'Opponent',
            event: event.event_type || 'Game',
            points: parseFloat(stat.points || '0'),
            fgPct: parseFloat(stat.field_goal_percentage || stat.fg_percentage || '0'),
            threePct: parseFloat(stat.three_point_percentage || stat.three_pct || '0'),
            ftPct: parseFloat(stat.free_throw_percentage || stat.ft_percentage || '0'),
          };
        });
        setGames(mappedGames);
        setLoading(false);
        return;
      }

      // Fallback: Try schedule_events or camp_events
      const { data: events, error: eventsError } = await supabase
        .from('schedule_events')
        .select('id, event_date, opponent_name, event_name, event_type')
        .eq('player_id', playerId)
        .order('event_date', { ascending: false })
        .limit(5);

      if (!eventsError && events && events.length > 0) {
        const mappedGames: GameRow[] = events.map((event: any) => ({
          id: event.id,
          date: event.event_date || new Date().toISOString().split('T')[0],
          opponent: event.opponent_name || 'Opponent',
          event: event.event_type || event.event_name || 'Game',
          points: 0,
          fgPct: 0,
          threePct: 0,
          ftPct: 0,
        }));
        setGames(mappedGames);
        setLoading(false);
        return;
      }

      // If no games found, set empty array
      setGames([]);
    } catch (error) {
      console.error('Error loading games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-slate-300">Recent games</p>
          <p className="text-xs text-slate-500">Player {playerId.slice(0, 6)}…</p>
        </div>
        <button className="text-xs text-emerald-300 hover:text-emerald-200">View in Performance</button>
      </div>
      <div className="divide-y divide-white/5">
        {games.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-white/60 mb-4">No items yet</p>
            <p className="text-white/40 text-sm">Check back later</p>
          </div>
        ) : (
          games.map((g) => (
            <div key={g.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{g.opponent}</p>
                <p className="text-[12px] text-slate-400">{formatDate(g.date)} • {g.event}</p>
              </div>
              <div className="flex items-center gap-4 text-right">
                <Stat label="PTS" value={g.points} />
                <Stat label="FG%" value={g.fgPct} />
                <Stat label="3P%" value={g.threePct} />
                <Stat label="FT%" value={g.ftPct} />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
