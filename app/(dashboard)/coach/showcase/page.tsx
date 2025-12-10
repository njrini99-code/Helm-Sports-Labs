'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Calendar,
  MessageSquare,
  Trophy,
  Edit,
  Plus,
  ChevronRight,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Eye,
  ExternalLink,
  Zap,
  Medal,
  Building2,
} from 'lucide-react';
import {
  glassCard,
  glassCardInteractive,
  glassHero,
  glassStatCard,
  glassPanel,
  glassButton,
  glassDarkZone,
  glassLightZone,
} from '@/lib/glassmorphism';
import { useTheme } from '@/lib/theme-context';
import Link from 'next/link';
import type { Coach } from '@/lib/types';
import { getTeamForOwner, getTeamRoster, getTeamSchedule, type Team, type TeamMember, type ScheduleEvent } from '@/lib/queries/team';
import { isDevMode, DEV_ENTITY_IDS } from '@/lib/dev-mode';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════════════════════
// Animated Counter Hook
// ═══════════════════════════════════════════════════════════════════════════
function useCountUp(end: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      countRef.current = Math.floor(easeOut * end);
      setCount(countRef.current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}

// ═══════════════════════════════════════════════════════════════════════════
// Stat Card Component
// ═══════════════════════════════════════════════════════════════════════════
function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  trend, 
  trendValue,
  iconBg,
  iconColor,
  isDark 
}: { 
  icon: React.ElementType;
  value: number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  iconBg: string;
  iconColor: string;
  isDark: boolean;
}) {
  const animatedValue = useCountUp(value);
  
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
      isDark 
        ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80' 
        : 'bg-white/90 border-violet-100/50 shadow-sm hover:shadow-violet-500/10'
    }`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.75} />
          </div>
          {trend && trendValue && (
            <Badge 
              variant="outline" 
              className={`text-[10px] px-1.5 py-0.5 border ${
                trend === 'up' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                  : trend === 'down'
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-0.5" /> : 
               trend === 'down' ? <TrendingDown className="w-3 h-3 mr-0.5" /> : null}
              {trendValue}
            </Badge>
          )}
        </div>
        <p className={`text-3xl font-bold mt-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {animatedValue}
        </p>
        <p className={`text-xs mt-1 uppercase tracking-wide font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Types for Showcase Data
// ═══════════════════════════════════════════════════════════════════════════
interface CollegeConnection {
  college: {
    id: string;
    name: string;
    logo_url: string | null;
    division: string | null;
  };
  count: number;
}

interface ShowcaseEvent {
  id: string;
  event_name: string;
  event_type: string;
  start_date: string;
  end_date: string | null;
  location: string;
  city: string | null;
  state: string | null;
  status: string;
  registered_count: number;
}

interface TopPerformer {
  id: string;
  overall_rating: number;
  exit_velocity: number | null;
  sixty_yard_dash: number | null;
  fastball_velocity: number | null;
  pop_time: number | null;
  player: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    position: string | null;
    grad_year: number | null;
    avatar_url: string | null;
  };
  event: {
    event_name: string;
    start_date: string;
  } | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════
export default function ShowcaseCoachDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [roster, setRoster] = useState<TeamMember[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [collegeConnections, setCollegeConnections] = useState<CollegeConnection[]>([]);
  const [upcomingShowcases, setUpcomingShowcases] = useState<ShowcaseEvent[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
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
    }

    if (!coachData) {
      router.push('/onboarding/coach');
      return;
    }

    setCoach(coachData);

    const teamData = await getTeamForOwner(coachData.id);
    if (teamData) {
      setTeam(teamData);
      const [rosterData, scheduleData] = await Promise.all([
        getTeamRoster(teamData.id),
        getTeamSchedule(teamData.id),
      ]);
      setRoster(rosterData);
      setSchedule(scheduleData);

        // Fetch college connections (coaches who have watched our players)
        const playerIds = rosterData.map(m => m.player.id);
        if (playerIds.length > 0) {
          const { data: connectionsData } = await supabase
            .from('college_interest')
            .select(`
              college_id,
              college:colleges!inner(id, name, logo_url, division)
            `)
            .in('player_id', playerIds)
            .eq('status', 'active');

        if (connectionsData) {
          // Group by college and count
          const grouped = connectionsData.reduce((acc, item) => {
            // Handle Supabase's foreign key relationship - it can be an array or object
            const collegeData = Array.isArray(item.college) ? item.college[0] : item.college;
            if (!collegeData) return acc;
            
            const college = {
              id: collegeData.id,
              name: collegeData.name,
              logo_url: collegeData.logo_url,
              division: collegeData.division,
            };
            const collegeId = college.id;
            if (!acc[collegeId]) {
              acc[collegeId] = { college, count: 0 };
            }
            acc[collegeId].count++;
            return acc;
          }, {} as Record<string, CollegeConnection>);
          
          setCollegeConnections(Object.values(grouped).slice(0, 5));
        }

        // Fetch upcoming showcases
        const { data: showcasesData } = await supabase
          .from('showcase_events')
          .select('*')
          .eq('showcase_team_id', teamData.id)
          .in('status', ['upcoming', 'registration_open'])
          .order('start_date', { ascending: true })
          .limit(3);

        if (showcasesData) {
          setUpcomingShowcases(showcasesData as ShowcaseEvent[]);
        }

        // Fetch top performers from recent events
        const { data: completedEvents } = await supabase
          .from('showcase_events')
          .select('id')
          .eq('showcase_team_id', teamData.id)
          .eq('status', 'completed')
          .limit(10);

        if (completedEvents && completedEvents.length > 0) {
          const eventIds = completedEvents.map(e => e.id);
          const { data: performersData } = await supabase
            .from('player_performance_metrics')
            .select(`
              *,
              player:players(id, first_name, last_name, primary_position, grad_year, avatar_url),
              event:showcase_events(event_name, start_date)
            `)
            .in('event_id', eventIds)
            .order('overall_rating', { ascending: false })
            .limit(5);

          if (performersData) {
            setTopPerformers(performersData as TopPerformer[]);
          }
        }
      }
    }

    setLoading(false);
  };

  // Computed values
  const upcomingEvents = useMemo(() => 
    schedule
      .filter(e => new Date(e.start_time) >= new Date())
      .slice(0, 5),
    [schedule]
  );

  const gradYearCounts = useMemo(() => 
    roster.reduce((acc, m) => {
      const year = m.player.grad_year || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<string | number, number>),
    [roster]
  );

  const profileCompletion = useMemo(() => {
    if (!coach) return 30;
    let score = 0;
    if (coach.full_name) score += 15;
    if (coach.organization_name) score += 20;
    if (coach.organization_city) score += 10;
    if (coach.organization_state) score += 10;
    if (coach.about) score += 15;
    if (coach.logo_url) score += 15;
    if (coach.age_groups?.length) score += 15;
    return Math.min(100, score) || 30;
  }, [coach]);

  // Program branding - violet/purple for showcase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coachData = coach as any;
  const programColor = coachData?.primary_color || '#8B5CF6'; // Violet for showcase
  const orgName = coach?.organization_name || 'Your Showcase Team';
  const orgInitials = orgName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const location = [coach?.organization_city, coach?.organization_state].filter(Boolean).join(', ');

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="w-8 h-8 bg-violet-500/20 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-slate-900' : 'bg-gradient-to-b from-slate-50 via-slate-50 to-violet-50/20'}`}>
      {/* ═══════════════════════════════════════════════════════════════════
          HERO BANNER
      ═══════════════════════════════════════════════════════════════════ */}
      <section 
        className="relative overflow-hidden"
        style={{
          background: isDark 
            ? `linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)`
            : `linear-gradient(160deg, #4c1d95 0%, #6d28d9 40%, #7c3aed 100%)`,
        }}
      >
        {/* Subtle radial glows */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 25% 30%, ${programColor}18, ${programColor}08 40%, transparent 70%),
              radial-gradient(ellipse 60% 40% at 75% 60%, ${programColor}10, transparent 50%)
            `,
          }}
        />
        
        {/* Noise texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        {/* Ambient orbs */}
        <div 
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-[0.2] pointer-events-none"
          style={{ background: programColor }}
        />
        <div 
          className="absolute -bottom-32 -left-20 w-64 h-64 rounded-full blur-[80px] opacity-[0.15] pointer-events-none"
          style={{ background: '#ec4899' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Organization Logo */}
            <div className="relative group">
              <div 
                className="absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"
                style={{ background: programColor }}
              />
              <Avatar className="relative h-20 w-20 md:h-24 md:w-24 ring-4 ring-white/20 shadow-2xl rounded-2xl">
                <AvatarImage src={coach?.logo_url ?? undefined} className="rounded-2xl object-cover" />
                <AvatarFallback 
                  className="rounded-2xl text-2xl md:text-3xl font-bold text-white"
                  style={{ background: programColor }}
                >
                  {orgInitials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Organization Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl lg:text-4xl font-bold text-white truncate">
                  {orgName}
                </h1>
                <Badge className="bg-white/10 text-white/90 border-white/20 backdrop-blur-sm">
                  <Trophy className="w-3 h-3 mr-1" />
                  Showcase Team
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/70 text-sm mb-2">
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" style={{ color: programColor }} />
                    {location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {roster.length} Players
                </span>
                {coach && coach.age_groups && coach.age_groups.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    {coach.age_groups.join(', ')}
                  </span>
                )}
              </div>

              {coach?.full_name && (
                <div className="text-white/60 text-sm mb-2">
                  <span className="font-medium text-white/80">{coach.full_name}</span>
                  {' — Director'}
                </div>
              )}

              {/* Profile Completion */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 max-w-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/60">Profile</span>
                    <span className="text-white/80 font-medium">{profileCompletion}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${profileCompletion}%`, 
                        background: `linear-gradient(90deg, ${programColor}, #ec4899)` 
                      }}
                    />
                  </div>
                </div>
                {profileCompletion < 100 && (
                  <Link href="/coach/showcase/program">
                    <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 h-7 text-xs">
                      Complete profile <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Link href="/coach/showcase/program">
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
                onClick={() => router.push(`/profile/${team?.id}`)}
              >
                <ExternalLink className="w-4 h-4" />
                View Public
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Users} 
            value={roster.length} 
            label="Total Players"
            iconBg={isDark ? 'bg-blue-500/10' : 'bg-blue-100'}
            iconColor={isDark ? 'text-blue-400' : 'text-blue-600'}
            isDark={isDark}
          />
          <StatCard 
            icon={Calendar} 
            value={upcomingShowcases.length} 
            label="Upcoming Events"
            trend="up"
            trendValue="Active"
            iconBg={isDark ? 'bg-violet-500/10' : 'bg-violet-100'}
            iconColor={isDark ? 'text-violet-400' : 'text-violet-600'}
            isDark={isDark}
          />
          <StatCard 
            icon={GraduationCap} 
            value={collegeConnections.reduce((sum, c) => sum + c.count, 0)} 
            label="College Connections"
            trend="up"
            trendValue="Active"
            iconBg={isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}
            iconColor={isDark ? 'text-emerald-400' : 'text-emerald-600'}
            isDark={isDark}
          />
          <StatCard 
            icon={Eye} 
            value={127} 
            label="Profile Views"
            trend="up"
            trendValue="+24%"
            iconBg={isDark ? 'bg-pink-500/10' : 'bg-pink-100'}
            iconColor={isDark ? 'text-pink-400' : 'text-pink-600'}
            isDark={isDark}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Showcases */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white/90 border-slate-200/50 shadow-sm'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-violet-500/10' : 'bg-violet-100'}`}>
                    <Trophy className={`w-4 h-4 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Upcoming Showcases & Tournaments
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Events your team is attending
                    </p>
                  </div>
                </div>
                <Link href="/coach/showcase/schedule">
                  <Button variant="ghost" size="sm" className={`gap-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingShowcases && upcomingShowcases.length > 0 ? (
                    upcomingShowcases.map((event) => {
                      const startDate = new Date(event.start_date);
                      const endDate = event.end_date ? new Date(event.end_date) : null;
                      const dateStr = endDate 
                        ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      const locationStr = [event.city, event.state].filter(Boolean).join(', ') || event.location;
                      
                      return (
                        <div 
                          key={event.id}
                          className={`p-4 rounded-xl transition-colors cursor-pointer ${
                            isDark 
                              ? 'bg-slate-700/30 hover:bg-slate-700/50' 
                              : 'bg-violet-50/50 hover:bg-violet-100/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {event.event_name}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  <Calendar className="w-3 h-3" />
                                  {dateStr}
                                </span>
                                <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  <MapPin className="w-3 h-3" />
                                  {locationStr}
                                </span>
                              </div>
                            </div>
                            <Badge className={`${isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                              <Users className="w-3 h-3 mr-1" />
                              {event.registered_count} players
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No upcoming showcases. Create one to get started!
                    </p>
                  )}
                </div>
                <Link href="/coach/showcase/schedule">
                  <Button variant="outline" className="w-full mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Event
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Players by Grad Year */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white/90 border-slate-200/50 shadow-sm'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                    <Users className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Roster by Grad Year
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {roster.length} total players
                    </p>
                  </div>
                </div>
                <Link href="/coach/showcase/team">
                  <Button variant="ghost" size="sm" className={`gap-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {roster.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No players on roster yet</p>
                    <Link href="/coach/showcase/team">
                      <Button variant="outline" size="sm" className="mt-3 gap-2">
                        <Plus className="w-4 h-4" />
                        Add Players
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(gradYearCounts)
                      .sort((a, b) => Number(a[0]) - Number(b[0]))
                      .map(([year, count]) => (
                        <div
                          key={year}
                          className={`p-4 rounded-xl text-center ${
                            isDark ? 'bg-slate-700/30' : 'bg-slate-50'
                          }`}
                        >
                          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {count}
                          </p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Class of {year}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Top Performers */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white/90 border-slate-200/50 shadow-sm'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/10' : 'bg-amber-100'}`}>
                    <Medal className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Top Performers
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Players getting noticed
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPerformers && topPerformers.length > 0 ? (
                    topPerformers.map((performer, index) => {
                      const playerName = `${performer.player.first_name || ''} ${performer.player.last_name || ''}`.trim() || 'Player';
                      const statValue = performer.fastball_velocity 
                        ? `${performer.fastball_velocity} mph`
                        : performer.exit_velocity
                        ? `${performer.exit_velocity} mph`
                        : performer.sixty_yard_dash
                        ? `${performer.sixty_yard_dash}s`
                        : performer.pop_time
                        ? `${performer.pop_time}s`
                        : `${performer.overall_rating}/10`;
                      const statLabel = performer.fastball_velocity 
                        ? 'FB Velo'
                        : performer.exit_velocity
                        ? 'Exit Velo'
                        : performer.sixty_yard_dash
                        ? '60 Time'
                        : performer.pop_time
                        ? 'Pop Time'
                        : 'Rating';
                      
                      return (
                        <div 
                          key={performer.id}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                            isDark 
                              ? 'bg-slate-700/30 hover:bg-slate-700/50' 
                              : 'bg-slate-50 hover:bg-slate-100'
                          }`}
                          onClick={() => router.push(`/coach/player/${performer.player.id}`)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={performer.player.avatar_url || undefined} />
                            <AvatarFallback className={`text-xs ${
                              index === 0 ? 'bg-amber-500 text-white' :
                              index === 1 ? 'bg-slate-400 text-white' :
                              'bg-amber-700 text-white'
                            }`}>
                              {index + 1}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {playerName}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {performer.player.position || 'N/A'} • Class of {performer.player.grad_year || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                              {statValue}
                            </p>
                            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {statLabel}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No performance data yet. Record metrics at your next showcase!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* College Connections */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white/90 border-slate-200/50 shadow-sm'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                    <GraduationCap className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      College Connections
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Schools showing interest
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {collegeConnections && collegeConnections.length > 0 ? (
                    collegeConnections.map((connection) => (
                      <div 
                        key={connection.college.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                          isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
                        }`}
                        onClick={() => router.push(`/college/${connection.college.id}`)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={connection.college.logo_url || undefined} />
                            <AvatarFallback className={`text-xs ${isDark ? 'bg-slate-700 text-white' : 'bg-violet-100 text-violet-700'}`}>
                              {connection.college.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {connection.college.name}
                            </p>
                            {connection.college.division && (
                              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {connection.college.division}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200`}
                        >
                          {connection.count} {connection.count === 1 ? 'player' : 'players'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No college connections yet. Keep promoting your players!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white/90 border-slate-200/50 shadow-sm'
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/coach/showcase/team">
                    <Button variant="outline" className={`w-full justify-start h-auto py-3 ${isDark ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : ''}`}>
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-xs">Roster</span>
                    </Button>
                  </Link>
                  <Link href="/coach/showcase/messages">
                    <Button variant="outline" className={`w-full justify-start h-auto py-3 ${isDark ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : ''}`}>
                      <MessageSquare className="w-4 h-4 mr-2 text-violet-500" />
                      <span className="text-xs">Messages</span>
                    </Button>
                  </Link>
                  <Link href="/coach/showcase/schedule">
                    <Button variant="outline" className={`w-full justify-start h-auto py-3 ${isDark ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : ''}`}>
                      <Calendar className="w-4 h-4 mr-2 text-pink-500" />
                      <span className="text-xs">Schedule</span>
                    </Button>
                  </Link>
                  <Link href="/coach/showcase/program">
                    <Button variant="outline" className={`w-full justify-start h-auto py-3 ${isDark ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : ''}`}>
                      <Edit className="w-4 h-4 mr-2 text-emerald-500" />
                      <span className="text-xs">Edit Profile</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
