'use client';

import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Stat = { label: string; value: string; helper?: string };

export function PlayerOverviewQuickStats({ playerId }: { playerId: string }) {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [playerId]);

  // Loads real data from player_metrics table
  const loadStats = async () => {
    try {
      const supabase = createClient();
      const { data: metrics, error } = await supabase
        .from('player_metrics')
        .select('metric_label, metric_value, updated_at')
        .eq('player_id', playerId)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading stats:', error);
        setStats([]);
        setLoading(false);
        return;
      }

      if (!metrics || metrics.length === 0) {
        setStats([]);
        setLoading(false);
        return;
      }

      // Map metrics to stats format
      // Look for common stat types
      const statMap: Record<string, Stat> = {};
      
      metrics.forEach(metric => {
        const label = metric.metric_label.toLowerCase();
        const value = metric.metric_value;

        // Map common stat labels
        if (label.includes('points') || label.includes('ppg')) {
          statMap['PPG'] = { label: 'PPG', value: value };
        } else if (label.includes('rebound') || label.includes('rpg')) {
          statMap['RPG'] = { label: 'RPG', value: value };
        } else if (label.includes('assist') || label.includes('apg')) {
          statMap['APG'] = { label: 'APG', value: value };
        } else if (label.includes('field goal') || label.includes('fg%')) {
          statMap['FG%'] = { label: 'FG%', value: value.includes('%') ? value : `${value}%` };
        } else if (label.includes('three') || label.includes('3p%') || label.includes('3pt')) {
          statMap['3P%'] = { label: '3P%', value: value.includes('%') ? value : `${value}%` };
        } else if (label.includes('free throw') || label.includes('ft%')) {
          statMap['FT%'] = { label: 'FT%', value: value.includes('%') ? value : `${value}%` };
        });

      // Convert to array and add helper text for most recent
      const statsArray = Object.values(statMap);
      if (statsArray.length > 0 && metrics[0]) {
        const lastUpdate = new Date(metrics[0].updated_at);
        const daysAgo = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo <= 7) {
          statsArray[0].helper = 'Recent';
        }
      }

      setStats(statsArray);
    } catch (error) {
      console.error('Error in loadStats:', error);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex items-center justify-between mb-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <p className="text-sm text-slate-300">Quick stats</p>
        <span className="text-xs text-slate-500">Player ID: {playerId.slice(0, 6)}…</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="text-lg font-semibold">{stat.value}</p>
            {stat.helper && <p className="text-[11px] text-slate-500">{stat.helper}</p>}
          </div>
)}
      </div>
    </Card>
  );
}
