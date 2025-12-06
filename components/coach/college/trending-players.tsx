'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2 } from 'lucide-react';
import { getTrendingRecruitsForCollegeCoach, type TrendingPlayer } from '@/lib/queries/recruits';
import { PlayerListItem } from '@/components/shared/player-list-item';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function TrendingPlayers() {
  const [players, setPlayers] = useState<TrendingPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadTrendingPlayers();
  }, []);

  const loadTrendingPlayers = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .eq('coach_type', 'college')
      .single();

    if (!coach) {
      setLoading(false);
      return;
    }

    const trending = await getTrendingRecruitsForCollegeCoach();
    setPlayers(trending);
    setLoading(false);
  };

  const handleAddToWatchlist = async (playerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .eq('coach_type', 'college')
      .single();

    if (!coach) return;

    const { addPlayerToWatchlist } = await import('@/lib/queries/recruits');
    const success = await addPlayerToWatchlist(coach.id, playerId, 'watchlist');
    
    if (success) {
      toast.success('Added to watchlist');
    } else {
      toast.error('Failed to add to watchlist');
    }
  };

  const handleViewProfile = (playerId: string) => {
    router.push(`/coach/player/${playerId}`);
  };

  if (loading) {
    return (
      <Card className="transition-colors bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (players.length === 0) {
    return (
      <Card className="transition-colors bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No trending players at this time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-colors bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <TrendingUp className="w-5 h-5 text-primary" />
          Trending Players
        </CardTitle>
        <p className="text-sm mt-1 text-muted-foreground">
          Players with high engagement and recent activity
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {players.map((player) => (
            <PlayerListItem
              key={player.id}
              player={{
                id: player.id,
                full_name: player.full_name,
                grad_year: player.grad_year,
                primary_position: player.primary_position || '',
                secondary_position: player.secondary_position,
                high_school_state: player.high_school_state || undefined,
                avatar_url: player.avatar_url,
                pitch_velo: player.pitch_velo,
                exit_velo: player.exit_velo,
                sixty_time: player.sixty_time,
              }}
              onClick={() => handleViewProfile(player.id)}
              showMetrics={true}
              actionButtons={
                <>
                  <Badge variant="outline" className="text-xs bg-orange-500/15 text-orange-500 border-orange-500/30">
                    Trending
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => handleAddToWatchlist(player.id, e)}
                    className="hover:scale-105 transition-transform"
                  >
                    Add to Watchlist
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleViewProfile(player.id)}
                    className="hover:scale-105 transition-transform bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    View Profile
                  </Button>
                </>
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
