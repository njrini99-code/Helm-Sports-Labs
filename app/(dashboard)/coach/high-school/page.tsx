'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  MessageSquare,
  Trophy,
  Edit,
  Plus,
  ChevronRight,
  Loader2,
  MapPin,
  Clock,
  Star,
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import Link from 'next/link';
import type { Coach } from '@/lib/types';
import { getTeamForOwner, getTeamRoster, getTeamSchedule, type Team, type TeamMember, type ScheduleEvent } from '@/lib/queries/team';
import { isDevMode, DEV_ENTITY_IDS } from '@/lib/dev-mode';

export default function HSCoachDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [roster, setRoster] = useState<TeamMember[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    
    let coachData = null;
    
    if (isDevMode()) {
      const { data } = await supabase
        .from('coaches')
        .select('*')
        .eq('id', DEV_ENTITY_IDS.coach)
        .single();
      coachData = data;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', user.id)
        .single();
      coachData = data;
      
      if (!coachData) {
        router.push('/onboarding/coach');
        return;
      }
    }

    if (!coachData) {
      setLoading(false);
      return;
    }

    setCoach(coachData);

    // Load team data
    const teamData = await getTeamForOwner(coachData.id);
    if (teamData) {
      setTeam(teamData);
      const [rosterData, scheduleData] = await Promise.all([
        getTeamRoster(teamData.id),
        getTeamSchedule(teamData.id),
      ]);
      setRoster(rosterData);
      setSchedule(scheduleData);
    }

    setLoading(false);
  };

  // Theme classes
  const theme = {
    bg: isDark ? 'bg-[#0B0D0F]' : 'bg-slate-50',
    cardBg: isDark ? 'bg-[#111315] border-white/5' : 'bg-white border-emerald-100 shadow-sm',
    text: isDark ? 'text-white' : 'text-slate-800',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    accent: isDark ? 'text-emerald-400' : 'text-emerald-600',
    badge: isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <Loader2 className={`w-8 h-8 animate-spin ${theme.accent}`} />
      </div>
    );
  }

  const upcomingEvents = schedule
    .filter(e => new Date(e.start_time) >= new Date())
    .slice(0, 5);

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors`}>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${theme.text}`}>
              Welcome, {coach?.full_name?.split(' ')[0] || 'Coach'}
            </h1>
            <p className={theme.textMuted}>
              {coach?.school_name || 'Your High School Program'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/coach/high-school/team">
              <Button variant="outline" className={theme.cardBg}>
                <Users className="w-4 h-4 mr-2" />
                Manage Team
              </Button>
            </Link>
            <Link href="/coach/high-school/messages">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className={theme.cardBg}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                <Users className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme.text}`}>{roster.length}</p>
                <p className={`text-xs ${theme.textMuted}`}>Roster Size</p>
              </div>
            </CardContent>
          </Card>
          <Card className={theme.cardBg}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                <Calendar className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme.text}`}>{upcomingEvents.length}</p>
                <p className={`text-xs ${theme.textMuted}`}>Upcoming Events</p>
              </div>
            </CardContent>
          </Card>
          <Card className={theme.cardBg}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                <Trophy className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme.text}`}>
                  {roster.filter(m => m.player.grad_year === 2025).length}
                </p>
                <p className={`text-xs ${theme.textMuted}`}>Seniors</p>
              </div>
            </CardContent>
          </Card>
          <Card className={theme.cardBg}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-500/10' : 'bg-orange-100'}`}>
                <Star className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${theme.text}`}>
                  {roster.filter(m => m.player.grad_year === 2026).length}
                </p>
                <p className={`text-xs ${theme.textMuted}`}>Juniors</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Roster Preview */}
          <Card className={theme.cardBg}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={`flex items-center gap-2 ${theme.text}`}>
                <Users className={`w-5 h-5 ${theme.accent}`} />
                Team Roster
              </CardTitle>
              <Link href="/coach/high-school/team">
                <Button variant="ghost" size="sm" className={theme.textMuted}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {roster.length === 0 ? (
                <div className="text-center py-8">
                  <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  <p className={theme.textMuted}>No players on roster yet</p>
                  <Link href="/coach/high-school/team">
                    <Button variant="outline" size="sm" className="mt-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Players
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {roster.slice(0, 6).map((member) => (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.player.avatar_url || undefined} />
                          <AvatarFallback className={`${isDark ? 'bg-slate-700 text-white' : 'bg-emerald-100 text-emerald-700'} text-sm`}>
                            {member.player.full_name?.slice(0, 2).toUpperCase() || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className={`font-medium ${theme.text}`}>{member.player.full_name || 'Player'}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{member.player.primary_position}</Badge>
                            <span className={`text-xs ${theme.textMuted}`}>{member.player.grad_year}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Preview */}
          <Card className={theme.cardBg}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className={`flex items-center gap-2 ${theme.text}`}>
                <Calendar className={`w-5 h-5 ${theme.accent}`} />
                Upcoming Schedule
              </CardTitle>
              <Link href="/coach/high-school/team?tab=schedule">
                <Button variant="ghost" size="sm" className={theme.textMuted}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  <p className={theme.textMuted}>No upcoming events</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${theme.text}`}>
                            {event.event_name || event.opponent_name || 'Event'}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs flex items-center gap-1 ${theme.textMuted}`}>
                              <Clock className="w-3 h-3" />
                              {new Date(event.start_time).toLocaleDateString()}
                            </span>
                            {event.location_name && (
                              <span className={`text-xs flex items-center gap-1 ${theme.textMuted}`}>
                                <MapPin className="w-3 h-3" />
                                {event.location_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {event.event_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className={theme.cardBg}>
          <CardHeader>
            <CardTitle className={`${theme.text}`}>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/coach/high-school/team">
                <Button variant="outline" className={`w-full justify-start ${theme.cardBg}`}>
                  <Users className="w-4 h-4 mr-2" />
                  Roster
                </Button>
              </Link>
              <Link href="/coach/high-school/team?tab=schedule">
                <Button variant="outline" className={`w-full justify-start ${theme.cardBg}`}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </Link>
              <Link href="/coach/high-school/messages">
                <Button variant="outline" className={`w-full justify-start ${theme.cardBg}`}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>
              <Link href="/coach/program">
                <Button variant="outline" className={`w-full justify-start ${theme.cardBg}`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

