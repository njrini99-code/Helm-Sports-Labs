'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Star,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Trophy,
  Target,
  TrendingUp,
  AlertTriangle,
  Bell,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Filter,
  Search,
  Award,
  Users,
  Building2,
  FileText,
  DollarSign,
  Sparkles,
  Zap,
  Timer,
  Flag,
  Check,
  X,
  MoreHorizontal,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { GlassProgressBar, CircularProgress } from '@/components/ui/GlassProgressBar';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type MilestoneStatus = 'completed' | 'in_progress' | 'upcoming' | 'overdue';
type InteractionType = 'email' | 'call' | 'visit' | 'camp' | 'showcase' | 'offer' | 'meeting';
type OfferStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'considering';

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: MilestoneStatus;
  category: 'academic' | 'athletic' | 'recruiting' | 'administrative';
  priority: 'high' | 'medium' | 'low';
}

interface CollegeInteraction {
  id: string;
  collegeId: string;
  collegeName: string;
  collegeLogo?: string;
  division: string;
  type: InteractionType;
  date: string;
  description: string;
  contactName?: string;
  contactRole?: string;
  notes?: string;
  followUpDate?: string;
}

interface Offer {
  id: string;
  collegeId: string;
  collegeName: string;
  collegeLogo?: string;
  division: string;
  location: string;
  conference: string;
  status: OfferStatus;
  scholarshipType: 'full' | 'partial' | 'walk-on' | 'preferred_walk_on';
  scholarshipPercentage?: number;
  offerDate: string;
  deadline?: string;
  daysUntilDeadline?: number;
  coachName?: string;
  coachEmail?: string;
  notes?: string;
  pros?: string[];
  cons?: string[];
}

interface TimelineEvent {
  id: string;
  type: 'milestone' | 'interaction' | 'offer' | 'deadline';
  date: string;
  title: string;
  description: string;
  collegeName?: string;
  status?: string;
  icon: React.ElementType;
  color: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Types for Real Data
// ═══════════════════════════════════════════════════════════════════════════
interface JourneyEvent {
  id: string;
  event_type: string;
  college_id: string | null;
  event_date: string;
  title: string;
  description: string | null;
  location: string | null;
  status: string;
  metadata: any;
  college: {
    id: string;
    name: string;
    logo_url: string | null;
    division: string | null;
    city: string | null;
    state: string | null;
  } | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function MilestoneStatusBadge({ status }: { status: MilestoneStatus }) {
  const configs: Record<MilestoneStatus, { bg: string; text: string; icon: React.ElementType }> = {
    completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle2 },
    in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock },
    upcoming: { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: Circle },
    overdue: { bg: 'bg-red-500/20', text: 'text-red-400', icon: AlertTriangle },
  };
  const config = configs[status];
  const Icon = config.icon;
  return (
    <Badge className={`${config.bg} ${config.text} capitalize text-[10px]`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.replace('_', ' ')}
    </Badge>
  );
}

function InteractionTypeBadge({ type }: { type: InteractionType }) {
  const configs: Record<InteractionType, { bg: string; text: string; icon: React.ElementType }> = {
    email: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Mail },
    call: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: Phone },
    visit: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: MapPin },
    camp: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Trophy },
    showcase: { bg: 'bg-pink-500/20', text: 'text-pink-400', icon: Star },
    offer: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: Award },
    meeting: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', icon: Users },
  };
  const config = configs[type];
  const Icon = config.icon;
  return (
    <Badge className={`${config.bg} ${config.text} capitalize text-[10px]`}>
      <Icon className="w-3 h-3 mr-1" />
      {type}
    </Badge>
  );
}

function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const configs: Record<OfferStatus, { bg: string; text: string }> = {
    pending: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    accepted: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    declined: { bg: 'bg-red-500/20', text: 'text-red-400' },
    expired: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
    considering: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  };
  const config = configs[status];
  return (
    <Badge className={`${config.bg} ${config.text} capitalize text-[10px]`}>
      {status}
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function PlayerJourneyPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'timeline' | 'milestones' | 'interactions' | 'offers' | 'decisions'>('timeline');
  const [filterCollege, setFilterCollege] = useState<string>('');
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);
  const [journeyEvents, setJourneyEvents] = useState<JourneyEvent[]>([]);
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Get player record
    const { data: playerData } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!playerData) {
      router.push('/onboarding/player');
      return;
    }

    setPlayer(playerData);

    // Fetch real player journey events
    const { data: eventsData, error } = await supabase
      .from('player_journey_events')
      .select(`
        *,
        college:colleges(id, name, logo_url, division, city, state)
      `)
      .eq('player_id', playerData.id)
      .order('event_date', { ascending: false });

    if (eventsData) {
      setJourneyEvents(eventsData as JourneyEvent[]);
    }

    setLoading(false);
  };

  // Group events by type for better visualization
  const groupedEvents = useMemo(() => {
    return {
      offers: journeyEvents.filter(e => e.event_type === 'offer'),
      visits: journeyEvents.filter(e => e.event_type === 'campus_visit'),
      evaluations: journeyEvents.filter(e => e.event_type === 'evaluation'),
      communication: journeyEvents.filter(e => ['message', 'call'].includes(e.event_type)),
    };
  }, [journeyEvents]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalColleges = new Set(journeyEvents.map(e => e.college_id).filter(Boolean)).size;
    const totalOffers = groupedEvents.offers.length;
    const upcomingVisits = groupedEvents.visits.filter(v => 
      v.status === 'scheduled' && new Date(v.event_date) > new Date()
    ).length;
    const recentActivity = journeyEvents.filter(e => 
      new Date(e.event_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    return {
      totalColleges,
      totalOffers,
      upcomingVisits,
      recentActivity,
    };
  }, [journeyEvents, groupedEvents]);

  // Generate unified timeline
  const timeline = useMemo((): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    journeyEvents.forEach(event => {
      const collegeName = event.college?.name || 'Unknown College';
      const eventTypeMap: Record<string, { icon: React.ElementType; color: string }> = {
        'offer': { icon: Award, color: 'cyan' },
        'campus_visit': { icon: MapPin, color: 'purple' },
        'evaluation': { icon: Trophy, color: 'blue' },
        'message': { icon: Mail, color: 'blue' },
        'call': { icon: Phone, color: 'blue' },
        'camp_invite': { icon: Trophy, color: 'amber' },
        'profile_view': { icon: Eye, color: 'slate' },
        'commitment': { icon: CheckCircle2, color: 'emerald' },
      };
      
      const typeConfig = eventTypeMap[event.event_type] || { icon: Mail, color: 'blue' };
      
      events.push({
        id: event.id,
        type: 'interaction',
        date: event.event_date,
        title: event.title,
        description: event.description || '',
        collegeName: event.college?.name || '',
        status: event.status === 'completed' ? 'completed' : event.status === 'scheduled' ? 'in_progress' : 'upcoming',
        icon: typeConfig.icon,
        color: typeConfig.color,
      });
    });

    // Sort by date (newest first)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [journeyEvents]);

  // Get unique colleges for filter
  const colleges = useMemo(() => {
    const collegeSet = new Set(journeyEvents.map(e => e.college?.name).filter(Boolean));
    return Array.from(collegeSet) as string[];
  }, [journeyEvents]);

  // Filter interactions by college
  const filteredInteractions = useMemo(() => {
    if (!filterCollege) return journeyEvents;
    return journeyEvents.filter(e => e.college?.name === filterCollege);
  }, [filterCollege, journeyEvents]);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; dot: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-500' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-500' },
      slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', dot: 'bg-slate-500' },
      red: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className={`min-h-screen pb-20 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-b from-slate-50 to-emerald-50/20'}`}>
      {/* Header */}
      <div className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80'} backdrop-blur-md sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                My Recruiting Journey
              </h1>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Track your path to playing college baseball
              </p>
            </div>
            <div className="flex items-center gap-2">
              {stats.upcomingVisits > 0 && (
                <Badge className="bg-blue-500/20 text-blue-400">
                  <Calendar className="w-3 h-3 mr-1" />
                  {stats.upcomingVisits} Upcoming
                </Badge>
)}
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                <Plus className="w-4 h-4 mr-1" />
                Add Activity
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {stats.totalColleges}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Colleges Interested
                  </p>
                </div>
                <GraduationCap className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
            </CardContent>
          </Card>
          <Card className={`${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-100'}`}>
                  <Award className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stats.totalOffers}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Offers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                  <MessageSquare className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{journeyEvents.length}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                  <CheckCircle2 className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {journeyEvents.filter(e => e.status === 'completed').length}/{journeyEvents.length}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Completed Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      {/* Upcoming Visits Reminder */}
        {stats.upcomingVisits > 0 && (
          <Card className={`overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30' 
              : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Upcoming Campus Visits
                </h3>
              </div>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                You have {stats.upcomingVisits} scheduled campus visit{stats.upcomingVisits !== 1 ? 's' : ''} coming up.
              </p>
            </CardContent>
          </Card>
)}
        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl overflow-x-auto ${isDark ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
          {(['timeline', 'milestones', 'interactions', 'offers', 'decisions'] as const).map(tab => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveTab(tab)}
              aria-label={`View ${tab} tab`}
              aria-pressed={activeTab === tab}
              className={`flex-shrink-0 capitalize ${
                activeTab === tab
                  ? isDark 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-white text-slate-800 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'timeline' && <Clock className="w-4 h-4 mr-2" />}
              {tab === 'milestones' && <Target className="w-4 h-4 mr-2" />}
              {tab === 'interactions' && <MessageSquare className="w-4 h-4 mr-2" />}
              {tab === 'offers' && <Award className="w-4 h-4 mr-2" />}
              {tab === 'decisions' && <Flag className="w-4 h-4 mr-2" />}
              {tab}
            </Button>
          ))}
        </div>
      {/* Tab Content */}
        {activeTab === 'timeline' && (
          <Card className={`${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50'}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
<div className="space-y-6">
                  {timeline.slice(0, 10).map((event, index) => {
                    const colors = getColorClasses(event.color);
                    const Icon = event.icon;
                    return (
                      <div key={event.id} className="relative pl-12">
                        {/* Timeline dot */}
                        <div className={`absolute left-2.5 w-3 h-3 rounded-full ${colors.dot} ring-4 ring-opacity-20 ${
                          event.color === 'emerald' ? 'ring-emerald-500' :
                          event.color === 'blue' ? 'ring-blue-500' :
                          event.color === 'purple' ? 'ring-purple-500' :
                          event.color === 'cyan' ? 'ring-cyan-500' :
                          'ring-slate-500'
                        }`}></div>
<div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${colors.bg}`}>
                                <Icon className={`w-4 h-4 ${colors.text}`} />
                              </div>
                              <div>
                                <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                  {event.title}
                                </p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {event.description}
                                </p>
                                {event.collegeName && (
                                  <Badge variant="outline" className="mt-2 text-[10px]">
                                    <GraduationCap className="w-3 h-3 mr-1" />
                                    {event.collegeName}
                                  </Badge>
)}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              {event.status && <MilestoneStatusBadge status={event.status as MilestoneStatus} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
)}
        {activeTab === 'milestones' && (
          <Card className={`${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Recruiting Milestones
                </CardTitle>
        <Button size="sm" variant="outline" className={isDark ? 'border-slate-600' : ''}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Milestone
                </Button>
              </div>
            </CardHeader>
        <CardContent>
              <div className="space-y-4">
                {journeyEvents.length === 0 ? (
                  <p className={`text-sm text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No journey events yet. Start tracking your recruiting journey!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {journeyEvents.slice(0, 10).map(event => (
                      <div
                        key={event.id}
                        className={`flex items-start gap-3 p-4 rounded-xl ${
                          event.status === 'completed'
                            ? isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
                            : event.status === 'scheduled'
                            ? isDark ? 'bg-blue-500/10' : 'bg-blue-50'
                            : isDark ? 'bg-slate-700/30' : 'bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          event.status === 'completed' ? 'bg-emerald-500/20' :
                          event.status === 'scheduled' ? 'bg-blue-500/20' :
                          'bg-slate-500/20'
                        }`}>
                          {event.event_type === 'offer' && <Award className={`w-4 h-4 ${
                            event.status === 'completed' ? 'text-emerald-400' :
                            event.status === 'scheduled' ? 'text-blue-400' :
                            'text-slate-400'
                          }`} />}
                          {event.event_type === 'campus_visit' && <MapPin className={`w-4 h-4 ${
                            event.status === 'completed' ? 'text-emerald-400' :
                            event.status === 'scheduled' ? 'text-blue-400' :
                            'text-slate-400'
                          }`} />}
                          {event.event_type === 'evaluation' && <Trophy className={`w-4 h-4 ${
                            event.status === 'completed' ? 'text-emerald-400' :
                            event.status === 'scheduled' ? 'text-blue-400' :
                            'text-slate-400'
                          }`} />}
                          {!['offer', 'campus_visit', 'evaluation'].includes(event.event_type) && <CheckCircle2 className={`w-4 h-4 ${
                            event.status === 'completed' ? 'text-emerald-400' :
                            event.status === 'scheduled' ? 'text-blue-400' :
                            'text-slate-400'
                          }`} />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {event.title}
                          </p>
                          {event.description && (
                            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {event.description}
                            </p>
)}
                          {event.college && (
                            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {event.college.name}
                            </p>
)}
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {new Date(event.event_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={
                          event.status === 'completed' ? 'default' :
                          event.status === 'scheduled' ? 'secondary' : 'outline'
                        }>
                          {event.status === 'completed' ? 'Completed' :
                           event.status === 'scheduled' ? 'Scheduled' : 'Upcoming'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === 'interactions' && (
          <Card className={`${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50'}`}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  College Interaction History
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select
                    value={filterCollege}
                    onChange={(e) => setFilterCollege(e.target.value)}
                    className={`text-sm px-3 py-1.5 rounded-lg border ${
                      isDark 
                        ? 'bg-slate-700 border-slate-600 text-white' 
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="">All Colleges</option>
                    {colleges.map(college => (
                      <option key={college} value={college}>{college}</option>
                    ))}
                  </select>
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                    <Plus className="w-4 h-4 mr-1" />
                    Log Interaction
                  </Button>
                </div>
              </div>
            </CardHeader>
        <CardContent>
              <div className="space-y-3">
                {filteredInteractions.length === 0 ? (
                  <p className={`text-sm text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No interactions yet. Start connecting with college coaches!
                  </p>
                ) : (
                  filteredInteractions.map(interaction => {
                    const college = interaction.college;
                    const metadata = interaction.metadata || {};
                    const eventTypeMap: Record<string, string> = {
                      'email': 'Email',
                      'call': 'Phone Call',
                      'message': 'Message',
                      'campus_visit': 'Campus Visit',
                      'camp': 'Camp',
                      'evaluation': 'Evaluation',
                      'offer': 'Offer',
                      'showcase': 'Showcase',
                      'meeting': 'Meeting',
                    };
                    
                    return (
                      <div
                        key={interaction.id}
                        className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={college?.logo_url || undefined} />
                              <AvatarFallback className={`text-xs font-medium ${isDark ? 'bg-slate-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                                {college?.name?.slice(0, 2).toUpperCase() || 'CO'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                  {college?.name || interaction.title}
                                </p>
                                {college?.division && (
                                  <Badge variant="outline" className="text-[10px]">{college.division}</Badge>
)}
                                <Badge variant="secondary" className="text-[10px]">
                                  {eventTypeMap[interaction.event_type] || interaction.event_type}
                                </Badge>
                              </div>
                              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {interaction.description || interaction.title}
                              </p>
                              {metadata.contactName && (
                                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                  Contact: {metadata.contactName} {metadata.contactRole && `(${metadata.contactRole})`}
                                </p>
)}
                              {interaction.location && (
                                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {interaction.location}
                                </p>
)}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              {new Date(interaction.event_date).toLocaleDateString()}
                            </p>
                            {metadata.followUpDate && (
                              <Badge className="mt-1 bg-amber-500/20 text-amber-400 text-[10px]">
                                <Bell className="w-3 h-3 mr-1" />
                                Follow up {new Date(metadata.followUpDate).toLocaleDateString()}
                              </Badge>
)}
                          </div>
                        </div>
                      </div>
                    );
                  }))}
              </div>
            </CardContent>
          </Card>
)}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            {groupedEvents.offers.length === 0 ? (
              <Card className={isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50'}>
                <CardContent className="p-8 text-center">
                  <Award className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No offers yet. Keep working hard and updating your profile!
                  </p>
                </CardContent>
              </Card>
            ) : (
              groupedEvents.offers.map(offer => {
                const college = offer.college;
                const metadata = offer.metadata || {};
                const offerDate = new Date(offer.event_date);
                const deadline = metadata.deadline ? new Date(metadata.deadline) : null;
                const daysUntilDeadline = deadline ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                
                return (
                  <Card 
                    key={offer.id}
                    className={`overflow-hidden ${
                      offer.status === 'completed'
                        ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                        : isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50'
                    }`}
                  >
                    <CardContent className="p-0">
                      <div 
                        className={`p-4 cursor-pointer ${isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}
                        onClick={() => setExpandedOffer(expandedOffer === offer.id ? null : offer.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14">
                              <AvatarImage src={college?.logo_url || undefined} />
                              <AvatarFallback className={`text-lg font-bold ${isDark ? 'bg-slate-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                                {college?.name?.slice(0, 2).toUpperCase() || 'CO'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                  {college?.name || offer.title}
                                </h3>
                                {college?.division && (
                                  <Badge variant="outline" className="text-[10px]">{college.division}</Badge>
)}
                                <Badge variant={offer.status === 'completed' ? 'default' : 'secondary'}>
                                  {offer.status === 'completed' ? 'Accepted' : offer.status === 'scheduled' ? 'Considering' : 'Pending'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                {college?.city && college?.state && (
                                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <MapPin className="w-3 h-3 inline mr-1" />
                                    {college.city}, {college.state}
                                  </span>
)}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                {metadata.scholarshipPercentage && (
                                  <Badge className={`${
                                    metadata.scholarshipPercentage === 100
                                      ? 'bg-emerald-500/20 text-emerald-400' 
                                      : 'bg-blue-500/20 text-blue-400'
                                  } text-[10px]`}>
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    {metadata.scholarshipPercentage}% Scholarship
                                  </Badge>
)}
                                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Offered {offerDate.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {deadline && daysUntilDeadline && daysUntilDeadline > 0 && (
                              <Badge className={`${
                                daysUntilDeadline <= 7 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'bg-amber-500/20 text-amber-400'
                              } mb-2`}>
                                <Timer className="w-3 h-3 mr-1" />
                                {daysUntilDeadline}d left
                              </Badge>
)}
                            <ChevronDown className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'} transition-transform ${
                              expandedOffer === offer.id ? 'rotate-180' : ''
                            }`} />
                          </div>
                        </div>
                      </div>
      {/* Expanded Content */}
                      {expandedOffer === offer.id && (
                        <div className={`px-4 pb-4 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                          {/* Description */}
                          {offer.description && (
                            <div className="pt-4">
                              <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {offer.description}
                              </p>
                            </div>
)}
                          {/* Metadata Notes */}
                          {metadata.notes && (
                            <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
                              <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Notes
                              </p>
                              <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{metadata.notes}</p>
                            </div>
)}
                          {/* Actions */}
                          <div className={`flex items-center justify-between mt-4 pt-4 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                            <div className="flex items-center gap-2">
                              {college && (
                                <Button variant="outline" size="sm" className={isDark ? 'border-slate-600' : ''} asChild>
                                  <Link href={`/college/${college.id}`}>
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    View College
                                  </Link>
                                </Button>
)}
                              <Button variant="outline" size="sm" className={isDark ? 'border-slate-600' : ''}>
                                <Edit2 className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                            {offer.status !== 'completed' && (
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="text-red-400 border-red-500/30 hover:bg-red-500/10">
                                  <X className="w-4 h-4 mr-1" />
                                  Decline
                                </Button>
        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                                  <Check className="w-4 h-4 mr-1" />
                                  Accept Offer
                                </Button>
                              </div>
)}
                          </div>
                        </div>
)}
                    </CardContent>
                  </Card>
                );
              }))}
          </div>
            )}
        {activeTab === 'decisions' && (
          <div className="space-y-6">
            {/* Decision Matrix */}
            <Card className={`${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Decision Comparison Tool
                  </CardTitle>
                </div>
              </CardHeader>
        <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <th className={`text-left py-3 px-4 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Factor
                        </th>
                        {groupedEvents.offers.filter(o => o.status !== 'completed').map(offer => (
                          <th key={offer.id} className={`text-center py-3 px-4 text-xs font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {offer.college?.name || offer.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Scholarship', key: 'scholarship' },
                        { label: 'Division', key: 'division' },
                        { label: 'Location', key: 'location' },
                        { label: 'Deadline', key: 'deadline' },
                      ].map(factor => (
                        <tr key={factor.key} className={`border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
                          <td className={`py-3 px-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {factor.label}
                          </td>
                          {groupedEvents.offers.filter(o => o.status !== 'completed').map(offer => {
                            const metadata = offer.metadata || {};
                            const deadline = metadata.deadline ? new Date(metadata.deadline) : null;
                            const daysUntilDeadline = deadline ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                            
                            return (
                              <td key={offer.id} className={`text-center py-3 px-4 text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {factor.key === 'scholarship' && metadata.scholarshipPercentage && (
                                  <Badge className={`${
                                    metadata.scholarshipPercentage >= 75 
                                      ? 'bg-emerald-500/20 text-emerald-400' 
                                      : 'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {metadata.scholarshipPercentage}%
                                  </Badge>
)}
                                {factor.key === 'division' && offer.college?.division}
                                {factor.key === 'location' && offer.college?.city && offer.college?.state && 
                                  `${offer.college.city}, ${offer.college.state}`
                                }
                                {factor.key === 'deadline' && deadline && daysUntilDeadline && daysUntilDeadline > 0 && (
                                  <Badge className={`${
                                    daysUntilDeadline <= 7 
                                      ? 'bg-red-500/20 text-red-400' 
                                      : 'bg-slate-500/20 text-slate-400'
                                  }`}>
                                    {daysUntilDeadline}d
                                  </Badge>
)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
      {/* Decision Checklist */}
            <Card className={`${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50'}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Decision Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { id: 'dc1', label: 'Discussed options with family', completed: true },
                    { id: 'dc2', label: 'Visited all top-choice campuses', completed: true },
                    { id: 'dc3', label: 'Compared financial aid packages', completed: false },
                    { id: 'dc4', label: 'Spoken with current players on the team', completed: false },
                    { id: 'dc5', label: 'Reviewed academic programs', completed: true },
                    { id: 'dc6', label: 'Considered distance from home', completed: true },
                    { id: 'dc7', label: 'Evaluated coaching staff stability', completed: false },
                  ].map(item => (
                    <div 
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        item.completed
                          ? isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
                          : isDark ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`${item.completed ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        item.completed 
                          ? isDark ? 'text-emerald-400' : 'text-emerald-700' 
                          : isDark ? 'text-white' : 'text-slate-800'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
      {/* Next Steps */}
            <Card className={`overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/30' 
                : 'bg-gradient-to-r from-emerald-50 to-cyan-50 border-emerald-200'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                    <Zap className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Ready to Decide?
                    </h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {groupedEvents.offers.filter(o => o.status !== 'completed').length > 0 ? (
                        <>
                          You have {groupedEvents.offers.filter(o => o.status !== 'completed').length} active offer{groupedEvents.offers.filter(o => o.status !== 'completed').length !== 1 ? 's' : ''} to consider.
                          {groupedEvents.offers.filter(o => {
                            const metadata = o.metadata || {};
                            const deadline = metadata.deadline ? new Date(metadata.deadline) : null;
                            return deadline && deadline > new Date();
                          }).length > 0 && (
                            <> Your next deadline is in {Math.min(...groupedEvents.offers
                              .filter(o => {
                                const metadata = o.metadata || {};
                                const deadline = metadata.deadline ? new Date(metadata.deadline) : null;
                                return deadline && deadline > new Date();
                              })
                              .map(o => {
                                const metadata = o.metadata || {};
                                const deadline = metadata.deadline ? new Date(metadata.deadline) : null;
                                return deadline ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : Infinity;
                              })
                              .filter(d => d !== Infinity))} days.</>
                          )}
                        </>
                      ) : (
                        <>No active offers at this time. Keep updating your profile and reaching out to coaches!</>
                      )}
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <Button className="bg-emerald-500 hover:bg-emerald-600">
                        <Check className="w-4 h-4 mr-2" />
                        Make Decision
                      </Button>
        <Button variant="outline" className={isDark ? 'border-slate-600 text-white' : ''}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Family Meeting
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
)}
      </div>
    </div>
  );
}
