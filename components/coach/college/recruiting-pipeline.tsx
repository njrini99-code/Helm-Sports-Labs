'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRecruitingPipelineForCoach, updateRecruitStatus, type RecruitPipelineEntry } from '@/lib/queries/recruits';
import { PlayerListItem } from '@/components/shared/player-list-item';
import { createClient } from '@/lib/supabase/client';
import { Loader2, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUSES: RecruitPipelineEntry['status'][] = [
  'watchlist',
  'high_priority',
  'offer_extended',
  'committed',
  'uninterested',
];

const STATUS_LABELS: Record<RecruitPipelineEntry['status'], string> = {
  watchlist: 'Watchlist',
  high_priority: 'High Priority',
  offer_extended: 'Offer Extended',
  committed: 'Committed',
  uninterested: 'Uninterested',
};

const STATUS_COLORS: Record<RecruitPipelineEntry['status'], string> = {
  watchlist: 'bg-slate-500/10 text-slate-200 border-slate-500/30',
  high_priority: 'bg-orange-500/10 text-orange-200 border-orange-500/30',
  offer_extended: 'bg-blue-500/10 text-blue-200 border-blue-500/30',
  committed: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30',
  uninterested: 'bg-red-500/10 text-red-200 border-red-500/30',
};

interface RecruitingPipelineProps {
  entries?: RecruitPipelineEntry[];
  onStatusChange?: () => void;
  filters?: {
    status: RecruitPipelineEntry['status'] | 'all';
    gradYear: number | 'all';
    position: string | 'all';
  };
}

export function RecruitingPipeline({ entries, onStatusChange, filters }: RecruitingPipelineProps) {
  const [pipeline, setPipeline] = useState<RecruitPipelineEntry[]>([]);
  const [loading, setLoading] = useState(!entries);
  const router = useRouter();

  useEffect(() => {
    if (entries) {
      setPipeline(entries);
      setLoading(false);
      return;
    }
    loadPipeline();
  }, [entries]);

  const loadPipeline = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

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

    const fetched = await getRecruitingPipelineForCoach(coach.id);
    setPipeline(fetched);
    setLoading(false);
  };

  const handleStatusChange = async (entryId: string, newStatus: RecruitPipelineEntry['status']) => {
    const success = await updateRecruitStatus(entryId, newStatus);
    if (success) {
      if (entries) {
        onStatusChange?.();
      } else {
        await loadPipeline();
      }
      onStatusChange?.();
    }
  };

  const handleViewPlayer = (playerId: string) => {
    router.push(`/coach/player/${playerId}`);
  };

  const statusFilter = filters?.status ?? 'all';

  const filteredPipeline = (entries || pipeline).filter((entry) => {
    const matchStatus = statusFilter === 'all' || entry.status === statusFilter;
    const matchGrad = filters?.gradYear === 'all' || filters?.gradYear === undefined
      ? true
      : entry.player.grad_year === filters.gradYear;
    const matchPos = filters?.position === 'all' || filters?.position === undefined
      ? true
      : entry.player.primary_position === filters.position || entry.player.secondary_position === filters.position;
    return matchStatus && matchGrad && matchPos;
  });

  const groupedByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = filteredPipeline.filter(entry => entry.status === status);
    return acc;
  }, {} as Record<RecruitPipelineEntry['status'], RecruitPipelineEntry[]>);

  if (loading) {
    return (
      <Card className="bg-[#111315] border-white/5">
        <CardHeader>
          <CardTitle>Recruiting Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Recruiting Pipeline</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {STATUSES.map(status => {
          const entriesForStatus = groupedByStatus[status] || [];
          return (
            <Card key={status} className="bg-[#111315] border-white/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-white">
                    {STATUS_LABELS[status]}
                  </CardTitle>
                  <Badge variant="outline" className={STATUS_COLORS[status]}>
                    {entriesForStatus.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {entriesForStatus.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No players in this status
                  </p>
                ) : (
                  entriesForStatus.map(entry => (
                    <div
                      key={entry.id}
                      className="p-2 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-blue-500/30 transition-colors"
                    >
                      <PlayerListItem
                        player={entry.player}
                        onClick={() => handleViewPlayer(entry.player.id)}
                        showMetrics={false}
                        className="border-0 bg-transparent hover:bg-transparent p-0"
                        actionButtons={
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {STATUSES.filter(s => s !== entry.status).map(statusOption => (
                                <DropdownMenuItem
                                  key={statusOption}
                                  onClick={() => handleStatusChange(entry.id, statusOption)}
                                >
                                  Move to {STATUS_LABELS[statusOption]}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem onClick={() => handleViewPlayer(entry.player.id)}>
                                View Profile
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        }
                      />
                      {entry.position_role && (
                        <p className="text-xs text-slate-400 mt-1 ml-14">
                          {entry.position_role}
                        </p>
                      )}
                      {entry.notes && (
                        <p className="text-xs text-slate-400 mt-1 ml-14 line-clamp-2">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
