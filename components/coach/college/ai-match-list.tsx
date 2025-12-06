'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Loader2, Settings } from 'lucide-react';
import { getRecommendedRecruitsForProgram, type RecruitMatch } from '@/lib/queries/recruits';
import { PlayerListItem } from '@/components/shared/player-list-item';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProgramNeedsForm } from './program-needs-form';
import { addPlayerToWatchlist } from '@/lib/queries/watchlist';

export function AIMatchList() {
  const [matches, setMatches] = useState<RecruitMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [coachId, setCoachId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: coach, error: coachError } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .eq('coach_type', 'college')
      .single();

    if (!coach || coachError) {
      setLoading(false);
      return;
    }

    setCoachId(coach.id);

    try {
      const recommendations = await getRecommendedRecruitsForProgram(coach.id);
      setMatches(recommendations);
    } catch (e) {
      console.error('Failed to load recommendations', e);
      toast.error('Unable to load recommendations right now');
    }
    setLoading(false);
  };

  const handleAddToWatchlist = async (playerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!coachId) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await addPlayerToWatchlist(coachId, playerId, 'watchlist');
      toast.success('Added to watchlist');
    } catch (err) {
      console.error('Failed to add to watchlist', err);
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
            <Sparkles className="w-5 h-5 text-primary" />
            Recommended for Your Needs
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

  if (matches.length === 0) {
    return (
      <Card className="transition-colors bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-primary" />
            Recommended for Your Needs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4 text-muted-foreground">
            No recommendations yet. Set your program needs to get personalized matches.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Set Program Needs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Program Recruiting Needs</DialogTitle>
                <DialogDescription>
                  Configure your recruiting priorities to get personalized player recommendations.
                </DialogDescription>
              </DialogHeader>
              <ProgramNeedsForm onSuccess={loadRecommendations} />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-colors bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="w-5 h-5 text-primary" />
              Recommended for Your Needs
            </CardTitle>
            <p className="text-sm mt-1 text-muted-foreground">
              Based on your recruiting priorities
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Edit Needs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Program Recruiting Needs</DialogTitle>
                <DialogDescription>
                  Configure your recruiting priorities to get personalized player recommendations.
                </DialogDescription>
              </DialogHeader>
              <ProgramNeedsForm onSuccess={loadRecommendations} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className="p-3 rounded-xl border transition-all duration-200 bg-muted/30 border-border hover:border-primary/30"
            >
              <div className="flex items-start gap-3">
                <PlayerListItem
                  player={match}
                  onClick={() => handleViewProfile(match.id)}
                  showMetrics={true}
                  className="flex-1 border-0 bg-transparent hover:bg-transparent p-0"
                />
                <div className="flex flex-col items-end gap-2 min-w-[200px]">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Match Score</span>
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                        {match.match_score}/100
                      </Badge>
                    </div>
                    <Progress value={match.match_score} className="h-2" />
                  </div>
                  {match.match_reasons.length > 0 && (
                    <div className="text-xs mt-1 text-muted-foreground">
                      <p className="font-medium mb-1">Why match:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {match.match_reasons.slice(0, 3).map((reason, i) => (
                          <li key={i}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleAddToWatchlist(match.id, e)}
                      className="hover:scale-105 transition-transform"
                    >
                      Add to Watchlist
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleViewProfile(match.id)}
                      className="hover:scale-105 transition-transform bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      View Player
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
