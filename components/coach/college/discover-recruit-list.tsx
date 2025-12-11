'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Sparkles, TrendingUp, User } from 'lucide-react';

export interface RecruitCard {
  id: string;
  name: string;
  gradYear: number;
  state: string;
  primaryPosition: string;
  secondaryPosition?: string;
  height: string;
  weight: number;
  metrics: string[];
  verified?: boolean;
  trending?: boolean;
  topSchool?: string;
  avatarUrl?: string | null;
}

interface DiscoverRecruitListProps {
  recruits: RecruitCard[];
  onAddToWatchlist?: (id: string) => void;
}

export function DiscoverRecruitList({ recruits, onAddToWatchlist }: DiscoverRecruitListProps) {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(12);
  const visibleRecruits = recruits.slice(0, visible);

  return (
    <div className="space-y-3">
      {{visibleRecruits.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            visibleRecruits.map((recruit) => (
        <Card key={recruit.id} className="bg-[#111315] border-white/5 hover:border-emerald-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 rounded-xl">
                {recruit.avatarUrl ? (
                  <AvatarImage src={recruit.avatarUrl} alt={recruit.name} />
                ) : (
                  <AvatarFallback className="bg-emerald-500/10 text-emerald-200">
                    {recruit.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">{recruit.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {recruit.gradYear}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{recruit.primaryPosition}</Badge>
                  {recruit.secondaryPosition && (
                    <Badge variant="outline" className="text-xs">{recruit.secondaryPosition}</Badge>
                  )}
                  {recruit.verified && (
                    <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/40 text-xs gap-1">
                      <Sparkles className="w-3 h-3" /> Verified
                    </Badge>
                  )}
                  {recruit.trending && (
                    <Badge className="bg-blue-500/20 text-blue-100 border-blue-500/40 text-xs gap-1">
                      <TrendingUp className="w-3 h-3" /> Trending
                    </Badge>
                  )}
                  {recruit.topSchool && (
                    <Badge className="bg-purple-500/20 text-purple-100 border-purple-500/40 text-xs">
                      Interested in {recruit.topSchool}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-2">
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" /> {recruit.height} • {recruit.weight} lbs
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {recruit.state}
                  </span>
                  {recruit.metrics.slice(0, 3).map((metric, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {metric}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {recruit.metrics.slice(0, 3).map((metric, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-white/5">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onAddToWatchlist?.(recruit.id)}
                  className="whitespace-nowrap"
                >
                  Add to Watchlist
                </Button>
                <Button size="sm" variant="outline" className="whitespace-nowrap">
                  View Player
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {visible < recruits.length && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => setVisible((v) => v + 8)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
