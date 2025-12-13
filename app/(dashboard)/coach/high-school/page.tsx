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
  Loader2,
  MapPin,
  Clock,
  Star,
  GraduationCap,
  Eye,
  TrendingUp,
  TrendingDown,
  Building2,
  ExternalLink,
  CheckCircle2,
  UserPlus,
  Mail,
  BarChart3,
  Target,
  Activity,
  Zap,
  FileText,
  Settings,
  Bell,
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
import {
  glassCardPremium,
  glassCardInteractive as glassCardInteractiveEnhanced,
  glassStatCard as glassStatCardEnhanced,
  glassPanel as glassPanelEnhanced,
  glassHero as glassHeroEnhanced,
  glassButton as glassButtonEnhanced,
  glassDarkZone as glassDarkZoneEnhanced,
  glassListItem as glassListItemEnhanced,
} from '@/lib/glassmorphism-enhanced';
import { motion } from 'framer-motion';
import { pageTransition, staggerContainer, staggerItem } from '@/lib/animations';
import { useTheme } from '@/lib/theme-context';
import Link from 'next/link';
import type { Coach } from '@/lib/types';
import { getTeamForOwner, getTeamRoster, getTeamSchedule, type Team, type TeamMember, type ScheduleEvent } from '@/lib/queries/team';
import { isDevMode, DEV_ENTITY_IDS } from '@/lib/dev-mode';
import { toast } from 'sonner';
import { GlassProgressBar, SkillRatingBar } from '@/components/ui/GlassProgressBar';

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
        : 'bg-white/90 border-emerald-100/50 shadow-sm hover:shadow-emerald-500/10'
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
// Types for College Interest and Activity
// ═══════════════════════════════════════════════════════════════════════════
interface CollegeInterest {
  id: string;
  player_id: string;
  college_id: string;
  interest_level: 'watching' | 'high_priority' | 'offered' | 'committed';
  status: 'active' | 'inactive' | 'committed_elsewhere';
  last_activity_date: string;
  college: {
    id: string;
    name: string;
    logo_url: string | null;
    division: string | null;
    state: string | null;
  };
  player: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    position: string | null;
    grad_year: number | null;
  };
}

interface ActivityFeedItem {
  id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
  related_player_id: string | null;
  related_college_id: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════
export default function HSCoachDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [roster, setRoster] = useState<TeamMember[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [collegeInterest, setCollegeInterest] = useState<CollegeInterest[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('all');

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

      // Fetch real college interest data
      const playerIds = rosterData.map(m => m.player.id);
      if (playerIds.length > 0) {
        const { data: interestData } = await supabase
          .from('college_interest')
          .select(`
            *,
            college:colleges(id, name, logo_url, division, state),
            player:players(id, first_name, last_name, primary_position, grad_year)
          `)
          .in('player_id', playerIds)
          .eq('status', 'active')
          .order('last_activity_date', { ascending: false })
          .limit(10);

        if (interestData) {
          setCollegeInterest(interestData as CollegeInterest[]);
        }

        // Fetch recent activity feed
        const { data: activityData } = await supabase
          .from('activity_feed')
          .select('*')
          .eq('team_id', teamData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (activityData) {
          setRecentActivity(activityData as ActivityFeedItem[]);
        }
      }
    }

    setLoading(false);
  };

  // Computed values
  const upcomingEvents = useMemo(() => 
    schedule
      .filter(e => new Date(e.start_time) >= new Date()}
      .slice(0, 5),
    [schedule]
  );

  const seniors = useMemo(() => roster.filter(m => m.player.grad_year === 2025), [roster]);
  const juniors = useMemo(() => roster.filter(m => m.player.grad_year === 2026), [roster]);

  const profileCompletion = useMemo(() => {
    if (!coach) return 30;
    let score = 0;
    if (coach.full_name) score += 20;
    if (coach.school_name) score += 20;
    if (coach.school_city) score += 15;
    if (coach.school_state) score += 15;
    if (coach.about) score += 15;
    if (coach.logo_url) score += 15;
    return Math.min(100, score) || 30;
  }, [coach]);

  // Program branding
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coachData = coach as any;
  const programColor = coachData?.primary_color || '#F59E0B'; // Amber for HS
  const schoolName = coach?.school_name || 'Your High School';
  const schoolInitials = schoolName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const location = [coach?.school_city, coach?.school_state].filter(Boolean).join(', ');

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="w-8 h-8 bg-amber-500/20 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={{duration: 0.3, ease: 'easeOut' }}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          ULTIMATE GLASSMORPHISM HERO ZONE
      ═══════════════════════════════════════════════════════════════════ */}
      <div className={cn(glassDarkZoneEnhanced, "pb-12 relative overflow-hidden")}>
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '0s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/15 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s' }}></div>
{/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
<div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 space-y-8 relative z-10">
          
      {/* ═══════════════════════════════════════════════════════════════════
          PREMIUM GLASSMORPHISM HERO BANNER
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.section 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{duration: 0.6, ease: 'easeOut' }}
      >
        {/* Premium Glass Hero Card */}
        <div className={cn(glassHeroEnhanced, "p-6 md:p-8 relative overflow-hidden")}>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 opacity-50 animate-pulse"></div>
<div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Premium Logo Badge with Enhanced Glow */}
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{duration: 0.5 }}
            >
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              <Avatar className="relative h-20 w-20 md:h-24 md:w-24 ring-2 ring-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-2xl">
                <AvatarImage src={coach?.logo_url ?? undefined} className="rounded-2xl object-cover" />
                <AvatarFallback 
                  className="rounded-2xl text-2xl md:text-3xl font-bold text-white bg-gradient-to-br from-amber-500 to-orange-600"
                >
                  {schoolInitials}
                </AvatarFallback>
              </Avatar>
              {/* Glow effect */}
              <div className="absolute -inset-3 rounded-2xl bg-amber-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </motion.div>
      {/* Premium School Info */}
            <div className="flex-1 min-w-0">
              <motion.h1 
                className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{duration: 0.5, delay: 0.1 }}
              >
                {schoolName}
              </motion.h1>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold",
                  "backdrop-blur-lg bg-white/10 text-white border border-white/20"
                )}>
                  <Building2 className="w-3.5 h-3.5 inline mr-1.5" />
                  High School
                </span>
                {location && (
                  <span className="flex items-center gap-1.5 text-sm text-white/70">
                    <MapPin className="w-4 h-4" />
                    {location}
                  </span>
)}
                <span className="flex items-center gap-1.5 text-sm text-white/70">
                  <Users className="w-4 h-4" />
                  {roster.length} Players
                </span>
              </div>
      {coach?.full_name && (
                <p className="text-sm text-white/60 mb-4">
                  <span className="font-medium text-white/80">{coach.full_name}</span>
                  {' — Head Coach'}
                </p>
)}
              {/* Premium Profile Completion */}
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-white/70 uppercase tracking-wide font-medium">Profile</span>
                    <span className="font-bold text-amber-300">{profileCompletion}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 shadow-lg shadow-amber-500/30"
                      initial={{ width: 0 }
                      animate={{ width: `${profileCompletion}%` }}
                      transition={{duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
                {profileCompletion < 100 && (
                  <Link href="/coach/high-school/program">
                    <span className="text-xs text-amber-300/80 hover:text-amber-300 transition-colors flex items-center gap-1.5 group">
                      Complete profile
                      <ChevronRight className="w-3 h-3" strokeWidth={2} />
                    </span>
                  </Link>
)}
              </div>
            </div>
      {/* Premium Action Buttons */}
            <motion.div 
              className="flex gap-3 w-full md:w-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{duration: 0.5, delay: 0.2 }}
            >
              <Link href="/coach/high-school/program" className="flex-1 md:flex-none">
                <button className={cn(glassButtonEnhanced.secondary, "w-full md:w-auto flex items-center gap-2")}>
                  <Edit className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Edit Profile</span>
                </button>
              </Link>
              <button
                className={cn(glassButtonEnhanced.ghost, "flex items-center gap-2")}
                onClick={() => router.push(`/profile/${team?.id}`)}
              >
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                <span>View Public</span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>
      {/* B. ULTIMATE GLASSMORPHISM STAT CARDS ROW */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 -mt-5 relative z-10"
            variants={staggerContainer as any}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem as any}>
              <PremiumGlassStatCard
                icon={<Users className="w-4 h-4" strokeWidth={2} />}
                value={roster.length}
                label="Roster Size"
                color="blue"
              />
            </motion.div>
            <motion.div variants={staggerItem as any}>
              <PremiumGlassStatCard
                icon={<GraduationCap className="w-4 h-4" strokeWidth={2} />}
                value={seniors.length}
                label="Seniors (2025)"
                color="purple"
              />
            </motion.div>
            <motion.div variants={staggerItem as any}>
              <PremiumGlassStatCard
                icon={<Star className="w-4 h-4" strokeWidth={2} />}
                value={juniors.length}
                label="Juniors (2026)"
                color="amber"
              />
            </motion.div>
            <motion.div variants={staggerItem as any}>
              <PremiumGlassStatCard
                icon={<Eye className="w-4 h-4" strokeWidth={2} />}
                value={collegeInterest.length}
                label="College Interest"
                trend={collegeInterest.length > 0 ? 12 : undefined}
                color="emerald"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Roster & Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Roster */}
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
                      Team Roster
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {roster.length} players
                    </p>
                  </div>
                </div>
                <Link href="/coach/high-school/team">
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
                    <Link href="/coach/high-school/team">
                      <Button variant="outline" size="sm" className="mt-3 gap-2">
                        <Plus className="w-4 h-4" />
                        Add Players
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {roster.slice(0, 6).map((member) => (
                      <div
                        key={member.id}
                        className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
                          isDark 
                            ? 'bg-slate-700/30 hover:bg-slate-700/50' 
                            : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                        onClick={() => router.push(`/coach/player/${member.player.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-white/10">
                            <AvatarImage src={member.player.avatar_url || undefined} />
                            <AvatarFallback className={`text-sm font-medium ${isDark ? 'bg-slate-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                              {member.player.full_name?.slice(0, 2).toUpperCase() || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {member.player.full_name || 'Player'}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-[10px] px-1.5 ${isDark ? 'border-slate-600' : ''}`}>
                                {member.player.primary_position}
                              </Badge>
                              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Class of {member.player.grad_year}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
)}
                  </div>
)}
              </CardContent>
            </Card>
      {/* Upcoming Schedule */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white/90 border-slate-200/50 shadow-sm'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                    <Calendar className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Upcoming Schedule
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {upcomingEvents.length} events
                    </p>
                  </div>
                </div>
                <Link href="/coach/high-school/team?tab=schedule">
                  <Button variant="ghost" size="sm" className={`gap-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
        <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No upcoming events</p>
                    <Button variant="outline" size="sm" className="mt-3 gap-2">
                      <Plus className="w-4 h-4" />
                      Add Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {event.event_name || event.opponent_name || 'Event'}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Clock className="w-3 h-3" />
                                {new Date(event.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                              {event.location_name && (
                                <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  <MapPin className="w-3 h-3" />
                                  {event.location_name}
                                </span>
)}
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`capitalize text-[10px] ${
                              event.event_type === 'game' 
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                                : 'bg-blue-500/10 text-blue-600 border-blue-200'
                            }`}
                          >
                            {event.event_type}
                          </Badge>
                        </div>
                      </div>
)}
                  </div>
)}
              </CardContent>
            </Card>
          </div>
      {/* Right Column - College Interest & Activity */}
          <div className="space-y-6">
            {/* College Interest in Your Players */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white/90 border-slate-200/50 shadow-sm'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                      <GraduationCap className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                      <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        College Interest
                      </CardTitle>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Players getting noticed
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
        <CardContent>
                <div className="space-y-3">
                  {collegeInterest && collegeInterest.length > 0 ? (
                    collegeInterest.map((interest) => (
                      <div 
                        key={interest.id}
                        className={`p-3 rounded-xl transition-colors cursor-pointer ${
                          isDark 
                            ? 'bg-slate-700/30 hover:bg-slate-700/50' 
                            : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                        onClick={() => router.push(`/coach/player/${interest.player.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {interest.player.first_name} {interest.player.last_name}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {interest.player.position || 'N/A'} • Class of {interest.player.grad_year || 'N/A'}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              interest.interest_level === 'offered' ? 'default' :
                              interest.interest_level === 'high_priority' ? 'secondary' : 'outline'
                            }
                            className="text-[10px]"
                          >
                            {interest.interest_level === 'offered' ? 'Offered' :
                             interest.interest_level === 'high_priority' ? 'High Priority' : 'Watching'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={interest.college.logo_url || undefined} />
                            <AvatarFallback className="text-[8px]">
                              {interest.college.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {interest.college.name}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              {interest.college.division && <span>{interest.college.division}</span>}
                              {interest.college.state && (
                                <>
                                  {interest.college.division && <span>•</span>}
                                  <span>{interest.college.state}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
)}
                  ) : (
                    <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No college interest yet. Keep updating player profiles!
                    </p>
)}
                </div>
              </CardContent>
            </Card>
      {/* Recent Activity */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white/90 border-slate-200/50 shadow-sm'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/10' : 'bg-amber-100'}`}>
                      <Clock className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Recent Activity
                      </CardTitle>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        College coach interactions
                      </p>
                    </div>
                  </div>
                  <Select value={activityFilter} onValueChange={setActivityFilter}>
                    <SelectTrigger className={`w-24 h-7 text-xs ${isDark ? 'bg-slate-700 border-slate-600' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
        <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="interest">Interest</SelectItem>
                      <SelectItem value="messages">Messages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
        <CardContent>
                <div className="space-y-2">
                  {recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((activity) => {
                      const timeAgo = new Date(activity.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      });
                      
                      return (
                        <div 
                          key={activity.id}
                          className={`flex items-start gap-3 p-2 rounded-lg ${
                            isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                            activity.activity_type === 'college_follow' 
                              ? 'bg-blue-500' 
                              : activity.activity_type === 'offer_made'
                              ? 'bg-emerald-500'
                              : activity.activity_type === 'player_view'
                              ? 'bg-purple-500'
                              : 'bg-amber-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {activity.title}
                            </p>
                            {activity.description && (
                              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {activity.description}
                              </p>
)}
                            <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {timeAgo}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className={`text-sm text-center py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No recent activity to display.
                    </p>
)}
                </div>
              </CardContent>
            </Card>
      {/* Team Performance Metrics */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white/90 border-slate-200/50 shadow-sm'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                    <BarChart3 className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Team Performance
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Current season stats
                    </p>
                  </div>
                </div>
              </CardHeader>
        <CardContent className="space-y-4">
                <SkillRatingBar 
                  name="Batting Average" 
                  rating={72} 
                  previousRating={68}
                  variant={isDark ? 'glass' : 'default'}
                  size="sm"
                />
                <SkillRatingBar 
                  name="On-Base %" 
                  rating={65} 
                  previousRating={62}
                  variant={isDark ? 'glass' : 'default'}
                  size="sm"
                />
                <SkillRatingBar 
                  name="Pitching ERA" 
                  rating={78} 
                  previousRating={75}
                  variant={isDark ? 'glass' : 'default'}
                  size="sm"
                />
                <SkillRatingBar 
                  name="Fielding %" 
                  rating={85} 
                  previousRating={82}
                  variant={isDark ? 'glass' : 'default'}
                  size="sm"
                />
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
                  <Link href="/coach/high-school/team">
                    <Button variant="outline" className={`w-full justify-start h-auto py-3 ${isDark ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : ''}`}>
                      <UserPlus className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-xs">Add Player</span>
                    </Button>
                  </Link>
                  <Link href="/coach/high-school/messages">
                    <Button variant="outline" className={`w-full justify-start h-auto py-3 ${isDark ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : ''}`}>
                      <MessageSquare className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-xs">Messages</span>
                    </Button>
                  </Link>
                  <Link href="/coach/high-school/team?tab=schedule">
                    <Button variant="outline" className={`w-full justify-start h-auto py-3 ${isDark ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : ''}`}>
                      <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                      <span className="text-xs">Schedule</span>
                    </Button>
                  </Link>
                  <Link href="/coach/high-school/program">
                    <Button variant="outline" className={`w-full justify-start h-auto py-3 ${isDark ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : ''}`}>
                      <Edit className="w-4 h-4 mr-2 text-emerald-500" />
                      <span className="text-xs">Edit Profile</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
      {/* Navigation Tools */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700/50' 
                : 'bg-gradient-to-br from-amber-50 to-white border-amber-100/50 shadow-sm'
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Management Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/coach/high-school/roster" className="block">
                  <div className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] ${
                    isDark 
                      ? 'bg-slate-700/40 hover:bg-slate-700/60' 
                      : 'bg-white hover:shadow-md'
                  }`}>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <Users className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Roster Management</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage players & college interest</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                </Link>
        <Link href="/coach/high-school/messages" className="block">
                  <div className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] ${
                    isDark 
                      ? 'bg-slate-700/40 hover:bg-slate-700/60' 
                      : 'bg-white hover:shadow-md'
                  }`}>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                      <MessageSquare className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Communication Hub</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Messages & announcements</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                </Link>
        <Link href="/coach/high-school/team?tab=stats" className="block">
                  <div className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] ${
                    isDark 
                      ? 'bg-slate-700/40 hover:bg-slate-700/60' 
                      : 'bg-white hover:shadow-md'
                  }`}>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                      <BarChart3 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Stats & Analytics</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Player performance data</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                </Link>
        <Link href="/coach/high-school/program" className="block">
                  <div className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] ${
                    isDark 
                      ? 'bg-slate-700/40 hover:bg-slate-700/60' 
                      : 'bg-white hover:shadow-md'
                  }`}>
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                      <Settings className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>Program Settings</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>School profile & branding</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Premium Glass Stat Card Component
// ═══════════════════════════════════════════════════════════════════════════
function PremiumGlassStatCard({ 
  icon, 
  value, 
  label, 
  sublabel,
  trend,
  highlight,
  color = 'emerald',
}: { 
  icon: React.ReactNode;
  value: number;
  label: string;
  sublabel?: string;
  trend?: number;
  highlight?: boolean;
  color?: 'emerald' | 'blue' | 'purple' | 'amber';
}) {
  const colorClasses = {
    emerald: {
      bg: 'from-emerald-500/20 to-emerald-600/10',
      border: 'border-emerald-400/30',
      icon: 'text-emerald-300',
      glow: 'shadow-emerald-500/20',
      hover: 'hover:border-emerald-400/50 hover:shadow-emerald-500/30',
    },
    blue: {
      bg: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-400/30',
      icon: 'text-blue-300',
      glow: 'shadow-blue-500/20',
      hover: 'hover:border-blue-400/50 hover:shadow-blue-500/30',
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-600/10',
      border: 'border-purple-400/30',
      icon: 'text-purple-300',
      glow: 'shadow-purple-500/20',
      hover: 'hover:border-purple-400/50 hover:shadow-purple-500/30',
    },
    amber: {
      bg: 'from-amber-500/20 to-amber-600/10',
      border: 'border-amber-400/30',
      icon: 'text-amber-300',
      glow: 'shadow-amber-500/20',
      hover: 'hover:border-amber-400/50 hover:shadow-amber-500/30',
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div 
      className={cn(
        glassStatCardEnhanced,
        `bg-gradient-to-br ${colors.bg}`,
        `border ${colors.border}`,
        `shadow-lg ${colors.glow}`,
        colors.hover,
        highlight && 'ring-2 ring-amber-400/40'
      )}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{duration: 0.3 }}
    >
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`}></div>
{/* Trend badge */}
      {trend !== undefined && (
        <motion.span 
          className={cn(
            "absolute top-3 right-3 flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full",
            "backdrop-blur-lg bg-emerald-500/25 text-emerald-200 border border-emerald-400/40",
            "shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{delay: 0.2 }}
        >
          <TrendingUp className="w-3 h-3" strokeWidth={2} />
          +{trend}%
        </motion.span>
)}
      <div className="relative z-10 flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg backdrop-blur-lg",
          `bg-white/[0.1] border ${colors.border}`,
          colors.icon
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <motion.p 
            className="text-2xl font-bold text-white mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{duration: 0.5 }}
          >
            {value.toLocaleString()}
          </motion.p>
          <p className="text-xs text-white/90 font-semibold mb-0.5">{label}</p>
          {sublabel && (
            <p className="text-[10px] text-white/60">{sublabel}</p>
)}
        </div>
      </div>
    </motion.div>
  );
}
