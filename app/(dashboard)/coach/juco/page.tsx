'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
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
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Search,
  ArrowRightLeft,
  Eye,
  ExternalLink,
  Building2,
  Target,
  Sparkles,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Star,
  School,
  FileText,
  CalendarDays,
  Timer,
  Zap,
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
  cn,
} from '@/lib/glassmorphism-enhanced';
import { motion } from 'framer-motion';
import { pageTransition, staggerContainer, staggerItem } from '@/lib/animations';
import { useTheme } from '@/lib/theme-context';
import Link from 'next/link';
import type { Coach } from '@/lib/types';
import { getTeamForOwner, getTeamRoster, getTeamSchedule, type Team, type TeamMember, type ScheduleEvent } from '@/lib/queries/team';
import { isDevMode, DEV_ENTITY_IDS } from '@/lib/dev-mode';
import { toast } from 'sonner';
import { GlassProgressBar, CircularProgress } from '@/components/ui/GlassProgressBar';

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
  value: number | string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  iconBg: string;
  iconColor: string;
  isDark: boolean;
}) {
  const animatedValue = typeof value === 'number' ? useCountUp(value) : value;
  
  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
      isDark 
        ? 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800/80' 
        : 'bg-white/90 border-cyan-100/50 shadow-sm hover:shadow-cyan-500/10'
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
// Main Component
// ═══════════════════════════════════════════════════════════════════════════
export default function JUCOCoachDashboard() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [roster, setRoster] = useState<TeamMember[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [collegeInterest, setCollegeInterest] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [transferConnections, setTransferConnections] = useState<any[]>([]);
  const [portalInterest, setPortalInterest] = useState<any[]>([]);
  const [priorityNeeds, setPriorityNeeds] = useState<any[]>([]);
  const [academicProgress, setAcademicProgress] = useState<any[]>([]);
  const [collegeMatches, setCollegeMatches] = useState<any[]>([]);
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
          setCollegeInterest(interestData);
        }

        // Fetch recent activity feed
        const { data: activityData } = await supabase
          .from('activity_feed')
          .select('*')
          .eq('team_id', teamData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (activityData) {
          setRecentActivity(activityData);
        }

        // Fetch transfer connections (colleges that have shown interest in our players)
        const { data: connectionsData } = await supabase
          .from('college_interest')
          .select(`
            college:colleges(id, name, division),
            player:players(id)
          `)
          .in('player_id', playerIds)
          .eq('status', 'active')
          .in('interest_level', ['high_priority', 'offered', 'committed']);

        if (connectionsData) {
          // Group by college
          const grouped = connectionsData.reduce((acc: any, item: any) => {
            const collegeId = item.college?.id;
            if (collegeId) {
              if (!acc[collegeId]) {
                acc[collegeId] = {
                  id: collegeId,
                  collegeName: item.college.name,
                  division: item.college.division || 'D1',
                  playersTransferred: 0,
                  status: 'active'
                };
              }
              acc[collegeId].playersTransferred++;
            }
            return acc;
          }, {});
          setTransferConnections(Object.values(grouped).slice(0, 5));
        }

        // Fetch portal interest (players from other schools interested in transferring)
        // This would come from a transfer portal table, but for now use college_interest with specific metadata
        const { data: portalData } = await supabase
          .from('college_interest')
          .select(`
            *,
            player:players(id, first_name, last_name, primary_position),
            college:colleges(id, name, division)
          `)
          .in('player_id', playerIds)
          .eq('status', 'active')
          .limit(5);

        if (portalData) {
          setPortalInterest(portalData.map((item: any) => ({
            id: item.id,
            playerName: `${item.player?.first_name || ''} ${item.player?.last_name || ''}`.trim(),
            position: item.player?.primary_position || 'N/A',
            school: item.college?.name || 'Unknown',
            division: item.college?.division || 'D1',
            status: item.interest_level === 'high_priority' ? 'interested' : 
                   item.interest_level === 'offered' ? 'contacted' : 'evaluating'
          })));
        }

        // Calculate priority needs from roster positions
        const positionCounts = rosterData.reduce((acc: any, member: any) => {
          const pos = member.player?.primary_position || 'Unknown';
          acc[pos] = (acc[pos] || 0) + 1;
        }, {});
        
        // Determine needs (simplified - in real app would use recruiting requirements)
        const needs = Object.entries(positionCounts)
          .filter(([_, count]: [string, any]) => count < 3) // Need more than 3 players per position
          .map(([position, count]: [string, any]) => ({
            id: position,
            position,
            priority: count < 1 ? 'high' : count < 2 ? 'medium' : 'low',
            count: Math.max(0, 3 - count)
          }))
          .slice(0, 4);
        setPriorityNeeds(needs);

        // Fetch academic progress (would need academic records table, using player data for now)
        const academicData = rosterData.slice(0, 4).map((member: any) => ({
          id: member.player.id,
          playerName: `${member.player.first_name || ''} ${member.player.last_name || ''}`.trim(),
          gpa: member.player.gpa || null,
          creditsCompleted: null, // Would come from academic records
          creditsRequired: 60,
          eligibilityStatus: member.player.gpa && member.player.gpa >= 2.0 ? 'eligible' : 'at_risk',
          graduationDate: member.player.grad_year ? `May ${member.player.grad_year}` : null
        }));
        setAcademicProgress(academicData);

        // Fetch college matches (colleges interested in multiple players)
        const { data: matchesData } = await supabase
          .from('college_interest')
          .select(`
            *,
            player:players(id, first_name, last_name, primary_position),
            college:colleges(id, name, division)
          `)
          .in('player_id', playerIds)
          .eq('status', 'active')
          .order('last_activity_date', { ascending: false });

        if (matchesData) {
          // Group by player
          const playerMatches = matchesData.reduce((acc: any, item: any) => {
            const playerId = item.player_id;
            if (!acc[playerId]) {
              acc[playerId] = {
                id: playerId,
                playerName: `${item.player?.first_name || ''} ${item.player?.last_name || ''}`.trim(),
                position: item.player?.primary_position || 'N/A',
                matches: []
              };
            }
            if (item.college) {
              acc[playerId].matches.push({
                collegeName: item.college.name,
                division: item.college.division || 'D1',
                matchScore: item.interest_level === 'committed' ? 95 :
                           item.interest_level === 'offered' ? 88 :
                           item.interest_level === 'high_priority' ? 82 : 70,
                interestLevel: item.interest_level
              });
            }
            return acc;
          }, {});
          setCollegeMatches(Object.values(playerMatches).slice(0, 3));
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

  const profileCompletion = useMemo(() => {
    if (!coach) return 30;
    let score = 0;
    if (coach.full_name) score += 15;
    if (coach.school_name || coach.organization_name) score += 20;
    if (coach.school_city || coach.organization_city) score += 10;
    if (coach.school_state || coach.organization_state) score += 10;
    if (coach.about) score += 15;
    if (coach.logo_url) score += 15;
    if (coach.athletic_conference) score += 15;
    return Math.min(100, score) || 30;
  }, [coach]);

  // Program branding - cyan/teal for JUCO
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coachData = coach as any;
  const programColor = coachData?.primary_color || '#06B6D4'; // Cyan for JUCO
  const programName = coach?.school_name || coach?.organization_name || 'Your JUCO Program';
  const programInitials = programName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const location = [coach?.school_city || coach?.organization_city, coach?.school_state || coach?.organization_state].filter(Boolean).join(', ');
  const conference = coach?.athletic_conference || 'Set Conference';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="w-8 h-8 bg-cyan-500/20 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          ULTIMATE GLASSMORPHISM HERO ZONE
      ═══════════════════════════════════════════════════════════════════ */}
      <div className={cn(glassDarkZoneEnhanced, "pb-12 relative overflow-hidden")}>
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 space-y-8 relative z-10">
          
      {/* ═══════════════════════════════════════════════════════════════════
          PREMIUM GLASSMORPHISM HERO BANNER
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.section 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Premium Glass Hero Card */}
        <div className={cn(glassHeroEnhanced, "p-6 md:p-8 relative overflow-hidden")}>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-50 animate-pulse" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Premium Logo Badge with Enhanced Glow */}
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <Avatar className="relative h-20 w-20 md:h-24 md:w-24 ring-2 ring-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-2xl">
                <AvatarImage src={coach?.logo_url ?? undefined} className="rounded-2xl object-cover" />
                <AvatarFallback 
                  className="rounded-2xl text-2xl md:text-3xl font-bold text-white bg-gradient-to-br from-cyan-500 to-blue-600"
                >
                  {programInitials}
                </AvatarFallback>
              </Avatar>
              {/* Glow effect */}
              <div className="absolute -inset-3 rounded-2xl bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>

            {/* Premium Program Info */}
            <div className="flex-1 min-w-0">
              <motion.h1 
                className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {programName}
              </motion.h1>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold",
                  "backdrop-blur-lg bg-white/10 text-white border border-white/20"
                )}>
                  <Building2 className="w-3.5 h-3.5 inline mr-1.5" />
                  JUCO
                </span>
                <span className="flex items-center gap-1.5 text-sm text-white/70">
                  <Trophy className="w-4 h-4" />
                  {conference}
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
                    <span className="font-bold text-cyan-300">{profileCompletion}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div 
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 shadow-lg shadow-cyan-500/30"
                      initial={{ width: 0 }}
                      animate={{ width: `${profileCompletion}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
                {profileCompletion < 100 && (
                  <Link href="/coach/juco/program">
                    <span className="text-xs text-cyan-300/80 hover:text-cyan-300 transition-colors flex items-center gap-1.5 group">
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
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button
                className={cn(glassButtonEnhanced.primary, "flex items-center gap-2")}
                onClick={() => router.push('/coach/juco/discover')}
              >
                <Search className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Find Recruits</span>
              </button>
              <Link href="/coach/juco/program" className="flex-1 md:flex-none">
                <button className={cn(glassButtonEnhanced.secondary, "w-full md:w-auto flex items-center gap-2")}>
                  <Edit className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Edit Profile</span>
                </button>
              </Link>
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
                icon={<ArrowRightLeft className="w-4 h-4" strokeWidth={2} />}
                value={transferConnections.reduce((sum: number, c: any) => sum + (c.playersTransferred || 0), 0)}
                label="D1/D2 Transfers"
                trend={transferConnections.length > 0 ? transferConnections.length : undefined}
                color="blue"
              />
            </motion.div>
            <motion.div variants={staggerItem as any}>
              <PremiumGlassStatCard
                icon={<Eye className="w-4 h-4" strokeWidth={2} />}
                value={portalInterest.length}
                label="Portal Targets"
                color="emerald"
              />
            </motion.div>
            <motion.div variants={staggerItem as any}>
              <PremiumGlassStatCard
                icon={<Calendar className="w-4 h-4" strokeWidth={2} />}
                value={upcomingEvents.length}
                label="Upcoming Games"
                color="amber"
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
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transfer Portal Search */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white/90 border-slate-200/50 shadow-sm'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-100'}`}>
                    <ArrowRightLeft className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Transfer Portal Targets
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Players you&apos;re tracking from the portal
                    </p>
                  </div>
                </div>
                <Link href="/coach/juco/transfer-portal">
                  <Button variant="ghost" size="sm" className={`gap-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                    Manage Portal <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {portalInterest.length === 0 ? (
                    <p className={`text-sm text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No transfer portal targets yet. Start tracking players from the portal!
                    </p>
                  ) : (
                    portalInterest.map((player: any) => (
                    <div 
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
                        isDark 
                          ? 'bg-slate-700/30 hover:bg-slate-700/50' 
                          : 'bg-cyan-50/50 hover:bg-cyan-100/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-white/10">
                          <AvatarFallback className={`text-sm font-medium ${isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-500 text-white'}`}>
                            {player.playerName.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {player.playerName}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{player.position}</Badge>
                            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {player.school} ({player.division})
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`capitalize ${
                        player.status === 'interested' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : player.status === 'evaluating'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {player.status}
                      </Badge>
                    </div>
                    ))
                  )}
                </div>
                <Link href="/coach/juco/transfer-portal">
                  <Button variant="outline" className="w-full mt-4 gap-2">
                    <Search className="w-4 h-4" />
                    Manage Transfer Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Current Roster */}
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
                      Current Roster
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {roster.length} players
                    </p>
                  </div>
                </div>
                <Link href="/coach/juco/team">
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
                    <Link href="/coach/juco/team">
                      <Button variant="outline" size="sm" className="mt-3 gap-2">
                        <Plus className="w-4 h-4" />
                        Add Players
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {roster.slice(0, 5).map((member) => (
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
                            <AvatarFallback className={`text-sm font-medium ${isDark ? 'bg-slate-600 text-white' : 'bg-cyan-100 text-cyan-700'}`}>
                              {member.player.full_name?.slice(0, 2).toUpperCase() || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {member.player.full_name || 'Player'}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-[10px] ${isDark ? 'border-slate-600' : ''}`}>
                                {member.player.primary_position}
                              </Badge>
                              {member.player.high_school_state && (
                                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {member.player.high_school_state}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* College Interest */}
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
                      College Interest
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Players getting noticed
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {collegeInterest && collegeInterest.length > 0 ? (
                    collegeInterest.map((interest) => {
                      const college = Array.isArray(interest.college) ? interest.college[0] : interest.college;
                      const player = Array.isArray(interest.player) ? interest.player[0] : interest.player;
                      if (!college || !player) return null;
                      
                      return (
                        <div 
                          key={interest.id}
                          className={`p-3 rounded-xl transition-colors cursor-pointer ${
                            isDark 
                              ? 'bg-slate-700/30 hover:bg-slate-700/50' 
                              : 'bg-slate-50 hover:bg-slate-100'
                          }`}
                          onClick={() => router.push(`/coach/player/${player.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {player.first_name} {player.last_name}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {player.primary_position || 'N/A'} • Class of {player.grad_year || 'N/A'}
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
                              <AvatarImage src={college.logo_url || undefined} />
                              <AvatarFallback className="text-[8px]">
                                {college.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {college.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                {college.division && <span>{college.division}</span>}
                                {college.state && (
                                  <>
                                    {college.division && <span>•</span>}
                                    <span>{college.state}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No college interest yet
                    </p>
                  )}
                </div>
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
      transition={{ duration: 0.3 }}
    >
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl`} />
      
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
          transition={{ delay: 0.2 }}
        >
          <TrendingUp className="w-3 h-3" strokeWidth={2} />
          +{trend}
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
            transition={{ duration: 0.5 }}
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
                          }`} />
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

            {/* Priority Needs */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-slate-800/60 border-slate-700/50' 
                : 'bg-white/90 border-slate-200/50 shadow-sm'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/10' : 'bg-amber-100'}`}>
                    <Target className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Priority Needs
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Positions to fill
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {priorityNeeds.length === 0 ? (
                    <p className={`text-sm text-center py-4 col-span-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      All positions filled
                    </p>
                  ) : (
                    priorityNeeds.map((need: any) => (
                    <div 
                      key={need.id}
                      className={`p-3 rounded-xl text-center ${
                        need.priority === 'high'
                          ? isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
                          : need.priority === 'medium'
                          ? isDark ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-amber-50 border border-amber-200'
                          : isDark ? 'bg-slate-700/30' : 'bg-slate-50'
                      }`}
                    >
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {need.position}
                      </p>
                      <p className={`text-xs ${
                        need.priority === 'high' 
                          ? 'text-red-500' 
                          : need.priority === 'medium'
                          ? 'text-amber-600'
                          : isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Need {need.count}
                      </p>
                    </div>
                    ))
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
                  <Link href="/coach/juco/team">
                    <Button variant="outline" className={`w-full justify-start h-auto py-3 ${isDark ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : ''}`}>
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-xs">Roster</span>
                    </Button>
                  </Link>
                  <Link href="/coach/juco/messages">
                    <Button variant="outline" className={`w-full justify-start h-auto py-3 ${isDark ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : ''}`}>
                      <MessageSquare className="w-4 h-4 mr-2 text-cyan-500" />
                      <span className="text-xs">Messages</span>
                    </Button>
                  </Link>
                  <Link href="/coach/juco/team?tab=schedule">
                    <Button variant="outline" className={`w-full justify-start h-auto py-3 ${isDark ? 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50' : ''}`}>
                      <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                      <span className="text-xs">Schedule</span>
                    </Button>
                  </Link>
                  <Link href="/coach/juco/program">
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

        {/* ═══════════════════════════════════════════════════════════════════
            TRANSFER TIMELINE & ACADEMIC TRACKING
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Transfer Deadline Timeline */}
          <Card className={`overflow-hidden ${
            isDark 
              ? 'bg-slate-800/60 border-slate-700/50' 
              : 'bg-white/90 border-slate-200/50 shadow-sm'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                    <CalendarDays className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Transfer Timeline
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Key deadlines & windows
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                
                <div className="space-y-4">
                  {(() => {
                    // Generate transfer deadlines dynamically based on current year
                    const currentYear = new Date().getFullYear();
                    const deadlines = [
                      { id: 'td1', title: 'Fall Transfer Window Opens', date: `${currentYear}-08-01`, status: 'passed', description: 'Players can enter transfer portal' },
                      { id: 'td2', title: 'Fall Academic Deadline', date: `${currentYear}-10-15`, status: 'passed', description: 'Credits must be submitted' },
                      { id: 'td3', title: 'NLI Early Signing Period', date: `${currentYear}-11-13`, status: 'upcoming', description: 'Early signing period begins' },
                      { id: 'td4', title: 'Winter Transfer Window', date: `${currentYear}-12-15`, status: 'upcoming', description: 'Winter portal window opens' },
                      { id: 'td5', title: 'Spring Signing Period', date: `${currentYear + 1}-04-15`, status: 'future', description: 'Regular signing period' },
                      { id: 'td6', title: 'Spring Semester Deadline', date: `${currentYear + 1}-05-01`, status: 'future', description: 'Final transcript deadline' },
                    ].map(d => {
                      const deadlineDate = new Date(d.date);
                      const daysUntil = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return { ...d, daysUntil };
                    });
                    
                    return deadlines.map((deadline: any, index: number) => (
                    <div key={deadline.id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                        deadline.status === 'passed' 
                          ? 'bg-slate-400 border-slate-400' 
                          : deadline.status === 'upcoming'
                          ? 'bg-cyan-500 border-cyan-500 animate-pulse'
                          : isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300'
                      }`} />
                      
                      <div className={`p-3 rounded-xl ${
                        deadline.status === 'upcoming'
                          ? isDark ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-cyan-50 border border-cyan-200'
                          : deadline.status === 'passed'
                          ? isDark ? 'bg-slate-700/20' : 'bg-slate-50'
                          : isDark ? 'bg-slate-700/30' : 'bg-slate-50'
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`font-medium text-sm ${
                              deadline.status === 'passed'
                                ? isDark ? 'text-slate-500' : 'text-slate-400'
                                : isDark ? 'text-white' : 'text-slate-800'
                            }`}>
                              {deadline.title}
                            </p>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {deadline.description}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-medium ${
                              deadline.status === 'upcoming' 
                                ? 'text-cyan-500' 
                                : deadline.status === 'passed'
                                ? isDark ? 'text-slate-500' : 'text-slate-400'
                                : isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {new Date(deadline.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            {deadline.status === 'upcoming' && deadline.daysUntil > 0 && (
                              <Badge className="mt-1 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]">
                                <Timer className="w-3 h-3 mr-1" />
                                {deadline.daysUntil}d
                              </Badge>
                            )}
                            {deadline.status === 'passed' && (
                              <Badge variant="outline" className="mt-1 text-[10px] opacity-50">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Done
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    ));
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Progress Tracking */}
          <Card className={`overflow-hidden ${
            isDark 
              ? 'bg-slate-800/60 border-slate-700/50' 
              : 'bg-white/90 border-slate-200/50 shadow-sm'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                    <BookOpen className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Academic Progress
                    </CardTitle>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Player eligibility & credits
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className={`gap-1 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}>
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {academicProgress.length === 0 ? (
                  <p className={`text-sm text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No academic records available
                  </p>
                ) : (
                  academicProgress.map((player: any) => {
                    const progressPercent = player.creditsCompleted ? Math.round((player.creditsCompleted / player.creditsRequired) * 100) : 0;
                    return (
                    <div 
                      key={player.id}
                      className={`p-3 rounded-xl ${
                        player.eligibilityStatus === 'at_risk'
                          ? isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
                          : isDark ? 'bg-slate-700/30' : 'bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {player.playerName}
                          </p>
                          {player.eligibilityStatus === 'at_risk' && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              At Risk
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              GPA: {player.gpa.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            {player.creditsCompleted !== null ? `Credits: ${player.creditsCompleted}/${player.creditsRequired}` : 'Credits: N/A'}
                          </span>
                          {player.graduationDate && (
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                              {player.graduationDate}
                            </span>
                          )}
                        </div>
                        {player.creditsCompleted !== null && (
                          <GlassProgressBar 
                            value={progressPercent} 
                            variant={isDark ? 'glass' : 'default'}
                            size="sm"
                            ratingLevel={progressPercent >= 80 ? 'excellent' : progressPercent >= 50 ? 'good' : 'developing'}
                          />
                        )}
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            4-YEAR COLLEGE MATCHING
        ═══════════════════════════════════════════════════════════════════ */}
        <Card className={`overflow-hidden ${
          isDark 
            ? 'bg-slate-800/60 border-slate-700/50' 
            : 'bg-white/90 border-slate-200/50 shadow-sm'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                  <School className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <div>
                  <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    4-Year College Matching
                  </CardTitle>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    AI-powered suggestions based on player profiles & academics
                  </p>
                </div>
              </div>
              <Badge className={`${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                <Sparkles className="w-3 h-3 mr-1" />
                New Matches
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {collegeMatches.length === 0 ? (
                <div className="col-span-3 text-center py-8">
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No college matches yet. Keep updating player profiles and engaging with colleges!
                  </p>
                </div>
              ) : (
                collegeMatches.map((player: any) => (
                <div 
                  key={player.id}
                  className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`text-xs font-medium ${isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-100 text-cyan-700'}`}>
                        {player.playerName.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {player.playerName}
                      </p>
                      <Badge variant="outline" className="text-[10px]">{player.position}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {player.matches.map((match: any, idx: number) => (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          isDark ? 'bg-slate-700/50' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                            match.matchScore >= 90
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : match.matchScore >= 80
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {match.matchScore}
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {match.collegeName}
                            </p>
                            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {match.division}
                            </p>
                          </div>
                        </div>
                        <Badge className={`text-[10px] ${
                          match.interestLevel === 'high'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : match.interestLevel === 'medium'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {match.interestLevel === 'high' && <Star className="w-3 h-3 mr-1" />}
                          {match.interestLevel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="ghost" size="sm" className={`w-full mt-3 text-xs ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}>
                    View all matches <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                ))
              )}
            </div>
            
            <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20' : 'bg-gradient-to-r from-cyan-50 to-emerald-50 border border-cyan-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'}`}>
                    <Zap className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Get More Matches
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Complete player profiles for better 4-year college recommendations
                    </p>
                  </div>
                </div>
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2">
                  <FileText className="w-4 h-4" />
                  Update Profiles
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
