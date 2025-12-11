'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, MoreVertical, Eye, Plus } from 'lucide-react';
import { PlayerListItem } from '@/components/shared/player-list-item';
import type { TeamMember } from '@/lib/queries/team';
import type { TeamPageMode } from './team-page-shell';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { addPlayerToWatchlist } from '@/lib/queries/watchlist';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface TeamRosterProps {
  teamId: string;
  members: TeamMember[];
  mode: TeamPageMode;
  onUpdate?: () => void;
}

export function TeamRoster({ teamId, members, mode, onUpdate }: TeamRosterProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [gradYearFilter, setGradYearFilter] = useState<string>('all');
  const [coachId, setCoachId] = useState<string | null>(null);
  const isOwner = mode === 'owner';
  const isViewer = mode === 'viewer';

  useEffect(() => {
    if (isViewer) {
      loadCoachId();
    }
  }, [isViewer]);

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

  const filteredMembers = members.filter((member) => {
    const name = member.player.full_name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.player.primary_position?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPosition = positionFilter === 'all' || 
      member.player.primary_position === positionFilter;
    
    const matchesGradYear = gradYearFilter === 'all' ||
      member.player.grad_year?.toString() === gradYearFilter;

    return matchesSearch && matchesPosition && matchesGradYear;
  });

  const positions = Array.from(
    new Set(members.map(m => m.player.primary_position).filter(Boolean))
  ).sort();

  const gradYears = Array.from(
    new Set(members.map(m => m.player.grad_year).filter(Boolean))
  ).sort();

  return (
    <Card className="bg-[#111315] border-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Roster</CardTitle>
          {isOwner && (
            <Button variant="outline" size="sm" className="bg-[#0B0D0F] border-white/10">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Player
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, position, grad year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0B0D0F] border-white/10 text-white"
            />
          </div>
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-[#0B0D0F] border-white/10">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent className="bg-[#111315] border-white/10">
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map((pos) => (
                <SelectItem key={pos} value={pos || ''}>
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={gradYearFilter} onValueChange={setGradYearFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-[#0B0D0F] border-white/10">
              <SelectValue placeholder="Grad Year" />
            </SelectTrigger>
            <SelectContent className="bg-[#111315] border-white/10">
              <SelectItem value="all">All Years</SelectItem>
              {gradYears.map((year) => (
                <SelectItem key={year} value={year?.toString() || ''}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Roster List */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            {searchQuery || positionFilter !== 'all' || gradYearFilter !== 'all'
              ? 'No players match your filters'
              : 'No players on roster yet'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#0B0D0F] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex-1">
                  <PlayerListItem
                    player={{
                      id: member.player.id,
                      full_name: member.player.full_name || 'Unknown',
                      grad_year: member.player.grad_year ?? 0,
                      primary_position: member.player.primary_position || '',
                      avatar_url: member.player.avatar_url,
                    }}
                    onClick={() => router.push(`/coach/player/${member.player.id}`)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {member.jersey_number && (
                    <Badge variant="outline" className="bg-[#111315] border-white/10">
                      #{member.jersey_number}
                    </Badge>
                  )}
                  {isViewer && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/coach/player/${member.player.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddToWatchlist(member.player.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#111315] border-white/10">
                        <DropdownMenuItem
                          onClick={() => router.push(`/coach/player/${member.player.id}`)}
                        >
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Jersey/Role</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400">Remove from Team</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
