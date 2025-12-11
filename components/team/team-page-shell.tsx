'use client';

import { useState } from 'react';
import { TeamTabs } from './team-tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Edit, Users, Calendar, ShieldCheck } from 'lucide-react';
import type { Team, TeamCommitment, TeamMedia as TeamMediaType, TeamMember, ScheduleEvent, VerifiedStat } from '@/lib/queries/team';
import { TeamOverview } from './team-overview';
import { TeamRoster } from './team-roster';
import { TeamSchedule } from './team-schedule';
import { TeamMedia } from './team-media';
import { TeamReports } from './team-reports';

export type TeamPageMode = 'owner' | 'viewer' | 'player';

interface TeamPageShellProps {
  team: Team | null;
  coachName?: string | null;
  mode: TeamPageMode;
  roster: TeamMember[];
  schedule: ScheduleEvent[];
  media: TeamMediaType[];
  commitments: TeamCommitment[];
  verifiedStats: VerifiedStat[];
}

export function TeamPageShell({
  team,
  coachName,
  mode,
  roster,
  schedule,
  media,
  commitments,
  verifiedStats,
}: TeamPageShellProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0B0D0F] flex items-center justify-center hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <p className="text-slate-400">Team not found</p>
      </div>
    );
  }

  const teamTypeLabels: Record<string, string> = {
    high_school: 'High School',
    showcase: 'Showcase',
    juco: 'JUCO',
  };

  return (
    <div className="min-h-screen bg-[#0B0D0F]">
      {/* Banner */}
      <div className="relative h-56 md:h-72 bg-gradient-to-br from-blue-900/25 via-purple-900/20 to-emerald-900/25 overflow-hidden">
        {team.banner_url ? (
          <img
            src={team.banner_url}
            alt={`${team.name} banner`}
            className="w-full h-full object-cover opacity-70"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,0.25),transparent),radial-gradient(circle_at_80%_60%,rgba(16,185,129,0.18),transparent)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-[#0B0D0F]/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 -mt-24 md:-mt-28 mb-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
          {/* Logo */}
          <div className="relative">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-[#0B0D0F] shadow-2xl shadow-blue-500/20">
              <AvatarImage src={team.logo_url || undefined} alt={team.name} />
              <AvatarFallback className="bg-[#111315] text-2xl font-bold text-white">
                {team.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Team Info */}
          <div className="flex-1 mt-2 md:mt-6 space-y-2">
            <div className="flex flex-wrap items-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{team.name}</h1>
              <Badge variant="outline" className="bg-[#111315] border-white/10">
                {teamTypeLabels[team.team_type] || team.team_type}
              </Badge>
              <Badge className="bg-blue-500/15 text-blue-100 border-blue-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Team Hub
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-slate-400 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
              {team.school_name && <span>{team.school_name}</span>}
              {team.city && team.state && <span>{team.city}, {team.state}</span>}
              {coachName && <span>Coach: {coachName}</span>}
            </div>
            <p className="text-slate-300 text-sm max-w-3xl">
              {team.program_values || 'Compete hard. Develop daily. Support teammates.'}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            {mode === 'owner' ? (
              <>
                <Button variant="success" size="sm" className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Team
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="w-4 h-4" />
                  Manage Roster
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Add Event
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="gap-2">
                <ShieldCheck className="w-4 h-4" />
                View Roster
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <TeamTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'overview' && <TeamOverview team={team} mode={mode} />}
          {activeTab === 'roster' && <TeamRoster teamId={team.id} members={roster} mode={mode} />}
          {activeTab === 'schedule' && <TeamSchedule teamId={team.id} events={schedule} mode={mode} />}
          {activeTab === 'media' && <TeamMedia teamId={team.id} media={media} mode={mode} />}
          {activeTab === 'reports' && (
            <TeamReports teamId={team.id} commitments={commitments} verifiedStats={verifiedStats} mode={mode} />
          )}
        </div>
      </div>
    </div>
  );
}
