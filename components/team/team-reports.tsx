'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Download, Plus, CheckCircle2 } from 'lucide-react';
import type { TeamCommitment, VerifiedStat } from '@/lib/queries/team';
import type { TeamPageMode } from './team-page-shell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { addPlayerToWatchlist } from '@/lib/queries/watchlist';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface TeamReportsProps {
  teamId: string;
  commitments: TeamCommitment[];
  verifiedStats: VerifiedStat[];
  mode: TeamPageMode;
  onUpdate?: () => void;
}

export function TeamReports({ teamId, commitments, verifiedStats, mode }: TeamReportsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});
  const isOwner = mode === 'owner';
  const isViewer = mode === 'viewer';

  useEffect(() => {
    if (isViewer) {
      loadCoachId();
    }
    loadPlayerNames();
  }, [isViewer, verifiedStats]);

  const loadCoachId = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .eq('coach_type', 'college')
      .single();

    if (coach) {
      setCoachId(coach.id);
    }
  };

  const loadPlayerNames = async () => {
    if (verifiedStats.length === 0) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const playerIds = [...new Set(verifiedStats.map(stat => stat.player_id))];
    
    const { data: players, error } = await supabase
      .from('players')
      .select('id, full_name, first_name, last_name')
      .in('id', playerIds);

    if (error) {
      console.error('Error fetching player names:', error);
      setLoading(false);
      return;
    }

    const names: Record<string, string> = {};
    players?.forEach(player => {
      names[player.id] = player.full_name || 
        `${player.first_name || ''} ${player.last_name || ''}`.trim() || 
        'Player';
    });

    setPlayerNames(names);
    setLoading(false);
  };

  const handleAddToWatchlist = async (playerId: string) => {
    if (!coachId) return;

    try {
      await addPlayerToWatchlist(coachId, playerId, 'watchlist');
      toast.success('Added to watchlist');
    } catch (err) {
      console.error('Failed to add to watchlist', err);
      toast.error('Failed to add to watchlist');
    }
  };

  // Group commitments by year
  const commitmentsByYear = commitments.reduce((acc, commit) => {
    const year = commit.commitment_year || new Date().getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(commit);
    return acc;
  }, {} as Record<number, TeamCommitment[]>);

  // Group verified stats by player
  const statsByPlayer = verifiedStats.reduce((acc, stat) => {
    if (!acc[stat.player_id]) acc[stat.player_id] = [];
    acc[stat.player_id].push(stat);
    return acc;
  }, {} as Record<string, VerifiedStat[]>);

  return (
    <div className="space-y-6">
      {/* Commitments Summary */}
      <Card className="bg-[#111315] border-white/5">
        <CardHeader>
          <div className="flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
            <CardTitle className="text-white flex items-center gap-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
              <Trophy className="w-5 h-5 text-yellow-400" />
              College Commitments & Placement
            </CardTitle>
            {isOwner && (
              <Button variant="outline" size="sm" className="bg-[#0B0D0F] border-white/10">
                <Plus className="w-4 h-4 mr-2" />
                Add Commitment
              </Button>
)}
          </div>
        </CardHeader>
        <CardContent>
          {commitments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No commitments recorded yet
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(commitmentsByYear).map(([year, commits]) => {
                  const d1Count = commits.filter((c) => c.division === 'D1').length;
                  const d2Count = commits.filter((c) => c.division === 'D2').length;
                  const jucoCount = commits.filter((c) => c.division === 'JUCO').length;

                  return (
                    <div
                      key={year}
                      className="p-4 rounded-2xl bg-[#0B0D0F] border border-white/5"
                    >
                      <div className="text-sm text-slate-400 mb-2">{year}</div>
                      <div className="text-2xl font-bold text-white mb-1">{commits.length}</div>
                      <div className="text-xs text-slate-500">
                        {d1Count > 0 && `${d1Count} D1`}
                        {d1Count > 0 && d2Count > 0 && ', '}
                        {d2Count > 0 && `${d2Count} D2`}
                        {jucoCount > 0 && (d1Count > 0 || d2Count > 0) && ', '}
                        {jucoCount > 0 && `${jucoCount} JUCO`}
                      </div>
                    </div>
                  );
                })}
              </div>
      {/* Commitments List */}
              <div className="space-y-2">
                {commitments.map((commit, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#0B0D0F] border border-white/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="text-white font-medium">{commit.player_name}</div>
                        <div className="text-sm text-slate-400">
                          {commit.college_name}
                          {commit.division && ` (${commit.division})`}
                          {commit.commitment_year && ` • ${commit.commitment_year}`}
                        </div>
                      </div>
                    </div>
                    {isViewer && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/coach/player/${commit.player_id}`)}
                      >
                        View Profile
                      </Button>
)}
                  </div>
)}
              </div>
            </div>
)}
        </CardContent>
      </Card>
      {/* Verified Stats */}
      <Card className="bg-[#111315] border-white/5">
        <CardHeader>
          <div className="flex items-center justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
            <CardTitle className="text-white flex items-center gap-2 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Verified Player Stats
            </CardTitle>
            {isOwner && (
              <Button variant="outline" size="sm" className="bg-[#0B0D0F] border-white/10">
                <Plus className="w-4 h-4 mr-2" />
                Add Verified Stat
              </Button>
)}
          </div>
        </CardHeader>
        <CardContent>
          {verifiedStats.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No verified stats yet
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(statsByPlayer).map(([playerId, stats]) => {
                const firstStat = stats[0];
                const playerName = playerNames[playerId] || 'Player';

                return (
                  <div
                    key={playerId}
                    className="p-4 rounded-2xl bg-[#0B0D0F] border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                      <div className="flex items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-[#111315] text-white">
                            {playerName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-medium">{playerName}</div>
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-200 border-emerald-500/30 text-xs">
                            Verified by {firstStat.source || 'Team'}
                          </Badge>
                        </div>
                      </div>
                      {isViewer && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/coach/player/${playerId}`)}
                          >
                            View Profile
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddToWatchlist(playerId)}
                          >
                            Add to Watchlist
                          </Button>
                        </div>
)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {stats.map((stat) => (
                        <div key={stat.id} className="text-sm">
                          <div className="text-slate-400 mb-1">{stat.stat_type}</div>
                          <div className="text-white font-semibold">{stat.value}</div>
                          {stat.event_name && (
                            <div className="text-xs text-slate-500 mt-1">{stat.event_name}</div>
)}
                        </div>
)}
                    </div>
                  </div>
                );
              })}
            </div>
)}
        </CardContent>
      </Card>
      {/* Export Options */}
      {isOwner && (
        <Card className="bg-[#111315] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Export Reports</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" className="bg-[#0B0D0F] border-white/10">
              <Download className="w-4 h-4 mr-2" />
              Export Roster (PDF)
            </Button>
            <Button variant="outline" className="bg-[#0B0D0F] border-white/10">
              <Download className="w-4 h-4 mr-2" />
              Export Verified Metrics (CSV)
            </Button>
          </CardContent>
        </Card>
)}
    </div>
  );
}
