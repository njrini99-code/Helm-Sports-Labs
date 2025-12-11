'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Player {
  id: string;
  full_name: string;
  avatar_url?: string;
  primary_position: string;
  grad_year: number;
  height?: string;
  weight?: number;
  pitch_velo?: number;
  exit_velo?: number;
  sixty_time?: number;
  gpa?: number;
  city?: string;
  state?: string;
  high_school_name?: string;
}

interface PlayerComparisonProps {
  playerIds: string[];
  onRemove?: (playerId: string) => void;
  maxPlayers?: number;
  className?: string;
}

export function PlayerComparison({
  playerIds,
  onRemove,
  maxPlayers = 5,
  className,
}: PlayerComparisonProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (playerIds.length === 0) {
      setPlayers([]);
      setLoading(false);
      return;
    }

    loadPlayers();
  }, [playerIds]);

  const loadPlayers = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .in('id', playerIds);

      if (error) {
        console.error('Error loading players:', error);
        setPlayers([]);
        return;
      }

      setPlayers(data || []);
    } catch (error) {
      console.error('Error in loadPlayers:', error);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const getComparisonValue = (player: Player, key: keyof Player): string | number | null => {
    const value = player[key];
    if (value === null || value === undefined) return null;
    return value;
  };

  const getBestValue = (key: keyof Player, higherIsBetter: boolean = true): number | null => {
    const values = players
      .map(p => {
        const val = getComparisonValue(p, key);
        return typeof val === 'number' ? val : null;
      })
      .filter((v): v is number => v !== null);

    if (values.length === 0) return null;
    return higherIsBetter ? Math.max(...values) : Math.min(...values);
  };

  const getComparisonIndicator = (
    value: number | null,
    bestValue: number | null,
    higherIsBetter: boolean = true
  ) => {
    if (value === null || bestValue === null) return null;
    if (value === bestValue) {
      return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    }
    if (higherIsBetter) {
      return value < bestValue ? (
        <TrendingDown className="w-4 h-4 text-red-500" />
      ) : null;
    } else {
      return value > bestValue ? (
        <TrendingDown className="w-4 h-4 text-red-500" />
      ) : null;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (players.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center text-slate-500">
          <p>No players selected for comparison</p>
          <p className="text-sm mt-2">Select players to compare their stats side-by-side</p>
        </CardContent>
      </Card>
    );
  }

  const comparisonFields: Array<{
    key: keyof Player;
    label: string;
    format?: (v: any) => string;
    higherIsBetter?: boolean;
  }> = [
    { key: 'full_name', label: 'Name' },
    { key: 'primary_position', label: 'Position' },
    { key: 'grad_year', label: 'Grad Year' },
    { key: 'height', label: 'Height' },
    { key: 'weight', label: 'Weight', format: (v) => v ? `${v} lbs` : '—' },
    { key: 'pitch_velo', label: 'Pitch Velo', format: (v) => v ? `${v} mph` : '—', higherIsBetter: true },
    { key: 'exit_velo', label: 'Exit Velo', format: (v) => v ? `${v} mph` : '—', higherIsBetter: true },
    { key: 'sixty_time', label: '60 Yard', format: (v) => v ? `${v}s` : '—', higherIsBetter: false },
    { key: 'gpa', label: 'GPA', format: (v) => v ? v.toFixed(2) : '—', higherIsBetter: true },
    { key: 'state', label: 'State' },
    { key: 'high_school_name', label: 'High School' },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Player Comparison</CardTitle>
          <Badge variant="secondary">{players.length} players</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-900 z-10">
                  Metric
                </th>
                {players.map((player) => (
                  <th key={player.id} className="text-center p-3 min-w-[150px]">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={player.avatar_url} />
                        <AvatarFallback>
                          {player.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-xs font-medium">{player.full_name}</div>
                      {onRemove && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onRemove(player.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map((field) => {
                const bestValue = field.higherIsBetter !== undefined
                  ? getBestValue(field.key, field.higherIsBetter)
                  : null;

                return (
                  <tr
                    key={field.key}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-900 z-10">
                      {field.label}
                    </td>
                    {players.map((player) => {
                      const value = getComparisonValue(player, field.key);
                      const formatted = value !== null
                        ? (field.format ? field.format(value) : String(value))
                        : '—';
                      const isBest = field.higherIsBetter !== undefined &&
                        typeof value === 'number' &&
                        value === bestValue;

                      return (
                        <td
                          key={player.id}
                          className={cn(
                            'p-3 text-center text-sm',
                            isBest && 'bg-emerald-50 dark:bg-emerald-900/20 font-semibold'
                          )}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {formatted}
                            {field.higherIsBetter !== undefined &&
                              typeof value === 'number' &&
                              getComparisonIndicator(value, bestValue, field.higherIsBetter)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
