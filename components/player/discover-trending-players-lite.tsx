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
        <CardTitle className="text-lg flex items-center gap-2 text-white hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Trending Players (Inspiration)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {{players.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            players.map((player) => (
          <div key={player.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
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
)}
      </CardContent>
    </Card>
  );
}
