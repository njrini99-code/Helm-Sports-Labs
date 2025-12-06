'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

export interface TrendingLitePlayer {
  id: string;
  name: string;
  state: string;
  gradYear: number;
  position: string;
}

interface DiscoverTrendingPlayersLiteProps {
  players: TrendingLitePlayer[];
}

export function DiscoverTrendingPlayersLite({ players }: DiscoverTrendingPlayersLiteProps) {
  return (
    <Card className="bg-[#111315] border-white/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Trending Players (Inspiration)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {players.map((player) => (
          <div key={player.id} className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{player.name}</p>
              <p className="text-xs text-slate-400">
                {player.state} • {player.gradYear}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {player.position}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
