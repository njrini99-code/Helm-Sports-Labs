'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  X,
  User,
  Building,
  GraduationCap,
  Star,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Users,
  Bookmark,
  Video,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { pageTransition, staggerContainer, staggerItem } from '@/lib/animations';
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
import { DiscoverMap } from '@/components/coach/college/discover-map';
import { type DiscoverFiltersState } from '@/components/coach/college/discover-filters';
import { 
  type EntityType, 
  type PlayerSummary, 
  type TeamSummary, 
  type JucoSummary 
} from '@/components/coach/college/discover-state-panel';
import { PlayerScoutCard, type PlayerScoutCardData } from '@/components/coach/scout-card';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
import { 
  getRecruitsByState, 
  getStateRecruitCounts,
  addPlayerToWatchlist,
  removePlayerFromWatchlist,
  type RecruitFilters 
} from '@/lib/queries/recruits';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SkipLink } from '@/components/ui/skip-link';
import { EnhancedSearch } from '@/components/ui/enhanced-search';
import { 
  getTeamsByState, 
  getJucosByState,
  type TeamByStateSummary,
  type JucoByStateSummary
} from '@/lib/queries/team';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { isDevMode, DEV_ENTITY_IDS } from '@/lib/dev-mode';
import { useRouter } from 'next/navigation';
import { GRAD_YEARS } from '@/lib/types';

// State code to name mapping
const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};

const POSITIONS = ['P', 'C', '1B', '2B', 'SS', '3B', 'OF', 'RHP', 'LHP'];

export default function CollegeCoachDiscoverPage() {
  const router = useRouter();
  const { toast: showToast } = useToast();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [activeEntityType, setActiveEntityType] = useState<EntityType>('players');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(true); // Default expanded
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [coachId, setCoachId] = useState<string | null>(null);
  
  const [stateStats, setStateStats] = useState<Record<string, { total: number; byYear: Record<number, number> }>>({});
  const [players, setPlayers] = useState<PlayerSummary[]>([]);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [jucos, setJucos] = useState<JucoSummary[]>([]);
  
  // Scout Card state
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerScoutCardData | null>(null);
  const [isScoutCardOpen, setIsScoutCardOpen] = useState(false);

  const [filters, setFilters] = useState<DiscoverFiltersState>({
    positions: [],
    gradYears: [],
    states: [],
    bats: null,
    throws: null,
    minHeight: null,
    maxHeight: null,
    minWeight: null,
    maxWeight: null,
    minPitchVelo: null,
    minExitVelo: null,
    maxSixtyTime: null,
    hasVideo: false,
    verifiedOnly: false,
    recentActivity: false,
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const supabase = createClient();
      
      if (isDevMode()) {
        setCoachId(DEV_ENTITY_IDS.coach);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: coach } = await supabase
            .from('coaches')
            .select('id')
            .eq('user_id', user.id)
            .single();
          if (coach) setCoachId(coach.id);
        }
      }

      const counts = await getStateRecruitCounts();
      setStateStats(counts);
      setInitialLoading(false);
    };

    loadInitialData();
  }, []);

  // Load state-specific data
  useEffect(() => {
    if (!selectedState) {
      setPlayers([]);
      setTeams([]);
      setJucos([]);
      return;
    }

    const loadStateData = async () => {
      setLoading(true);
      
      const recruitFilters: RecruitFilters = {
        positions: filters.positions.length > 0 ? filters.positions : undefined,
        gradYears: filters.gradYears.length > 0 ? filters.gradYears : undefined,
        bats: filters.bats,
        throws: filters.throws,
        // Only pass true when explicitly enabled; undefined means "no filter"
        hasVideo: filters.hasVideo === true ? true : undefined,
        verifiedOnly: filters.verifiedOnly === true ? true : undefined,
      };

      const [playersData, teamsData, jucosData] = await Promise.all([
        getRecruitsByState(selectedState, recruitFilters),
        getTeamsByState(selectedState),
        getJucosByState(selectedState),
      ]);

      const mappedPlayers: PlayerSummary[] = playersData.map(p => ({
        id: p.id,
        name: p.name,
        avatarUrl: p.avatarUrl || undefined,
        gradYear: p.gradYear,
        state: p.state,
        primaryPosition: p.primaryPosition,
        secondaryPosition: p.secondaryPosition || undefined,
        height: p.height || undefined,
        weight: p.weight || undefined,
        metrics: p.metrics,
        verified: p.verified,
        trending: p.trending,
        topSchool: p.topSchool || undefined,
      }));

      const mappedTeams: TeamSummary[] = teamsData.map((t: TeamByStateSummary) => ({
        id: t.id,
        name: t.name,
        city: t.city,
        state: t.state,
        type: t.type,
        playersCount: t.playersCount,
        committedCount: t.committedCount,
      }));

      const mappedJucos: JucoSummary[] = jucosData.map((j: JucoByStateSummary) => ({
        id: j.id,
        name: j.name,
        city: j.city,
        state: j.state,
        conference: j.conference,
        playersCount: j.playersCount,
      }));

      setPlayers(mappedPlayers);
      setTeams(mappedTeams);
      setJucos(mappedJucos);
      setLoading(false);
    };

    loadStateData();
  }, [selectedState, filters.positions, filters.gradYears, filters.bats, filters.throws, filters.hasVideo, filters.verifiedOnly]);

  // Filtered results
  const filteredPlayers = useMemo(() => {
    if (!search) return players;
    const searchLower = search.toLowerCase();
    return players.filter(p => p.name.toLowerCase().includes(searchLower));
  }, [players, search]);

  const filteredTeams = useMemo(() => {
    if (!search) return teams;
    const searchLower = search.toLowerCase();
    return teams.filter(t => t.name.toLowerCase().includes(searchLower));
  }, [teams, search]);

  const filteredJucos = useMemo(() => {
    if (!search) return jucos;
    const searchLower = search.toLowerCase();
    return jucos.filter(j => j.name.toLowerCase().includes(searchLower));
  }, [jucos, search]);

  const handleSelectState = useCallback((stateCode: string) => {
    if (!stateCode) {
      setSelectedState(null);
      return;
    }
    setSelectedState(stateCode);
  }, []);

  const handleAddToWatchlist = useCallback(async (playerId: string, playerName: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c351967e-a062-4da3-8c65-86a13eaf3c2b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'initial',
        hypothesisId: 'A',
        location: 'discover/page.tsx:handleAddToWatchlist',
        message: 'handleAddToWatchlist called',
        data: { playerId, playerName, coachId: !!coachId },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion agent log

    if (!coachId) {
      showToast({
        variant: 'error',
        title: 'Authentication required',
        description: 'Please log in as a coach to add players to your watchlist.',
      });
      return;
    }
    const success = await addPlayerToWatchlist(coachId, playerId);
    if (success) {
      showToast({
        variant: 'success',
        title: 'Added to watchlist',
        description: `${playerName} has been added to your watchlist.`,
      });
    } else {
      showToast({
        variant: 'error',
        title: 'Failed to add',
        description: 'Unable to add player to watchlist. Please try again.',
      });
    }
  }, [coachId]);

  // Open player Scout Card
  const handleOpenPlayerCard = (player: PlayerSummary) => {
    // Convert PlayerSummary to PlayerScoutCardData
    const isPitcher = ['P', 'RHP', 'LHP', 'SP', 'RP'].includes(player.primaryPosition);
    const scoutCardData: PlayerScoutCardData = {
      id: player.id,
      fullName: player.name,
      avatarUrl: player.avatarUrl ?? undefined,
      gradYear: player.gradYear,
      primaryPosition: player.primaryPosition,
      secondaryPosition: player.secondaryPosition,
      height: player.height,
      weight: player.weight,
      state: player.state,
      city: player.state, // Using state as placeholder for city
      highSchool: player.topSchool || 'Unknown High School',
      // Sample data for demo
      bats: 'R',
      throws: 'R',
      pipelineStatus: null,
      internalLabels: player.trending ? ['Trending'] : undefined,
      // Add sample metrics for demo
      fbVelo: isPitcher ? 92 : undefined,
      exitVelo: !isPitcher ? 95 : undefined,
      sixtyYard: !isPitcher ? 6.8 : undefined,
      profileViews: Math.floor(Math.random() * 50) + 5,
      lastViewedAt: '2 days ago',
    };
    setSelectedPlayer(scoutCardData);
    setIsScoutCardOpen(true);
  };

  const handleScoutCardStatusChange = async (playerId: string, status: PlayerScoutCardData['pipelineStatus']) => {
    if (!coachId) return;
    
    // If status is null/undefined, remove from pipeline entirely
    if (status === null || status === undefined) {
      const success = await removePlayerFromWatchlist(coachId, playerId);
      if (success) {
        showToast({
          variant: 'default',
          title: 'Removed from pipeline',
          description: 'Player has been removed from your recruiting pipeline.',
        });
      } else {
        showToast({
          variant: 'error',
          title: 'Failed to remove',
          description: 'Unable to remove player from pipeline. Please try again.',
        });
      }
      return;
    }
    
    // Update the status in the database
    const success = await addPlayerToWatchlist(coachId, playerId, status);
    if (success) {
      showToast({
        variant: 'success',
        title: 'Status updated',
        description: 'Player status has been updated successfully.',
      });
    } else {
      showToast({
        variant: 'error',
        title: 'Failed to update',
        description: 'Unable to update player status. Please try again.',
      });
    }
  };

  const handleScoutCardAddNote = async (playerId: string, note: string) => {
    if (!coachId) {
      showToast({
        variant: 'error',
        title: 'Authentication required',
        description: 'Coach ID not found. Please log in again.',
      });
      return;
    }

    if (!note.trim()) {
      showToast({
        variant: 'error',
        title: 'Invalid note',
        description: 'Note cannot be empty. Please enter some text.',
      });
      return;
    }

    try {
      const response = await fetch('/api/coach-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: playerId,
          note_content: note.trim(),
          is_private: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save note');
      }

      showToast({
        variant: 'success',
        title: 'Note saved',
        description: 'Your note has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving note:', error);
      showToast({
        variant: 'error',
        title: 'Failed to save note',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
      });
    }
  };

  const handleToggleWatchlist = async (playerId: string, isOnWatchlist: boolean) => {
    if (!coachId) return;
    try {
      if (isOnWatchlist) {
        // Add to watchlist
        const success = await addPlayerToWatchlist(coachId, playerId, 'watchlist');
        if (success) {
          toast.success('Added to watchlist');
        } else {
          toast.error('Failed to add to watchlist');
        }
      } else {
        // Remove from watchlist
        const success = await removePlayerFromWatchlist(coachId, playerId);
        if (success) {
          toast.success('Removed from watchlist');
        } else {
          toast.error('Failed to remove from watchlist');
        }
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      toast.error(isOnWatchlist ? 'Failed to add to watchlist' : 'Failed to remove from watchlist');
    }
  };

  const clearAllFilters = () => {
    setSelectedState(null);
    setFilters({
      positions: [], gradYears: [], states: [],
      bats: null, throws: null,
      minHeight: null, maxHeight: null,
      minWeight: null, maxWeight: null,
      minPitchVelo: null, minExitVelo: null, maxSixtyTime: null,
      hasVideo: false, verifiedOnly: false, recentActivity: false,
    });
    setSearch('');
  };

  const togglePosition = (pos: string) => {
    setFilters(prev => ({
      ...prev,
      positions: prev.positions.includes(pos) 
        ? prev.positions.filter(p => p !== pos) 
        : [...prev.positions, pos]
    }));
  };

  const toggleGradYear = (year: number) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c351967e-a062-4da3-8c65-86a13eaf3c2b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'initial',
        hypothesisId: 'B',
        location: 'discover/page.tsx:toggleGradYear',
        message: 'toggleGradYear called',
        data: { year, prevGradYears: filters.gradYears },
        timestamp: Date.now()
      })
    }).catch(() => {});
    // #endregion agent log

    setFilters(prev => ({
      ...prev,
      gradYears: prev.gradYears.includes(year)
        ? prev.gradYears.filter(y => y !== year)
        : [...prev.gradYears, year]
    }));
  };

  const activeFilterSummary = useMemo(() => {
    const parts: string[] = [];
    if (filters.positions.length > 0) parts.push(filters.positions.join(', '));
    if (filters.gradYears.length > 0) parts.push(filters.gradYears.join('–'));
    if (selectedState) parts.push(STATE_NAMES[selectedState]);
    if (filters.hasVideo) parts.push('Video');
    if (filters.verifiedOnly) parts.push('Verified');
    if (filters.bats) parts.push(`Bats ${filters.bats}`);
    if (filters.throws) parts.push(`Throws ${filters.throws}`);
    return parts.length > 0 ? parts.join(' • ') : null;
  }, [selectedState, filters]);

  const getResultCount = () => {
    switch (activeEntityType) {
      case 'players': return filteredPlayers.length;
      case 'teams': return filteredTeams.length;
      case 'juco': return filteredJucos.length;
    }
  };

  const getResultLabel = () => {
    switch (activeEntityType) {
      case 'players': return filteredPlayers.length === 1 ? 'player' : 'players';
      case 'teams': return filteredTeams.length === 1 ? 'team' : 'teams';
      case 'juco': return filteredJucos.length === 1 ? 'program' : 'programs';
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen">
        <SkipLink href="#discover-content">Skip to discover content</SkipLink>
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/coach/college' },
              { label: 'Discover', href: '/coach/college/discover' },
            ]}
          />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading recruits...</p>
          </div>
        </div>
      </div>
    );
  }


  const totalStatesWithRecruits = Object.keys(stateStats).length;

  return (
    <motion.div 
      className="min-h-screen"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Skip Link */}
      <SkipLink href="#discover-content">Skip to discover content</SkipLink>
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4">
        <Breadcrumbs
          items={[
            { label: 'Dashboard', href: '/coach/college' },
            { label: 'Discover', href: '/coach/college/discover' },
          ]}
        />
      </div>
      {/* ═══════════════════════════════════════════════════════════════════
          ULTIMATE GLASSMORPHISM DISCOVER ZONE
      ═══════════════════════════════════════════════════════════════════ */}
      <div id="discover-content" className={cn(glassDarkZoneEnhanced, "pb-12 relative overflow-hidden")}>
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '0s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s' }}></div>
{/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
<div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 space-y-6 relative z-10">
          
        {/* ═══════════════════════════════════════════════════════════════════
            PREMIUM GLASS HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={ opacity: 0, y: 20 }
          animate={ opacity: 1, y: 0 }
          transition={{duration: 0.6, ease: 'easeOut' }}
        >
          <div className={cn(glassHeroEnhanced, "p-6 relative overflow-hidden")}>
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-50 animate-pulse"></div>
<div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "p-2.5 rounded-xl backdrop-blur-lg",
                    "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10",
                    "border border-emerald-400/30 shadow-lg shadow-emerald-500/20"
                  )}>
                    <Search className="w-5 h-5 text-emerald-300" strokeWidth={2} />
                  </div>
                  <Badge className={cn(
                    "backdrop-blur-lg bg-emerald-500/25 text-emerald-200 border border-emerald-400/40",
                    "shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
                  )}>
                    <Sparkles className="w-3 h-3 mr-1.5" strokeWidth={2} />
                    Discover
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                  Discover Recruits
                </h1>
                <p className="text-sm text-white/70">
                  Use the map and filters to find players, teams, and JUCO programs.
                </p>
              </div>
              <Badge className={cn(
                "shrink-0 px-4 py-2 backdrop-blur-lg",
                "bg-emerald-500/25 text-emerald-200 border border-emerald-400/40",
                "shadow-lg shadow-emerald-500/20"
              )}>
                <MapPin className="w-4 h-4 mr-1.5" strokeWidth={2} />
                {totalStatesWithRecruits} states with recruits
              </Badge>
            </div>
          </div>
        </motion.div>
      {/* ═══════════════════════════════════════════════════════════════════
            PREMIUM GLASS MAP CARD
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={ opacity: 0, y: 20 }
          animate={ opacity: 1, y: 0 }
          transition={{duration: 0.6, delay: 0.1 }}
        >
          <div className={cn(glassPanelEnhanced, "overflow-hidden")}>
            {/* Map Header */}
            <div className="px-6 py-5 border-b border-white/[0.1] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg backdrop-blur-lg",
                  "bg-gradient-to-br from-blue-500/20 to-blue-600/10",
                  "border border-blue-400/30"
                )}>
                  <MapPin className="w-4 h-4 text-blue-300" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-bold text-white">Where the talent lives</h2>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/70">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                  Low activity
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  High activity
                </span>
              </div>
            </div>
      {/* Map */}
            <div className="p-5">
              <DiscoverMap
                selectedState={selectedState}
              onSelect={handleSelectState}
              onClearSelection={() => handleSelectState('')}
              states={Object.entries(stateStats).map(([code, stats]) => ({
                code,
                name: STATE_NAMES[code] || code,
                recruitCount: stats.total,
                byYear: stats.byYear,
              }})
            />
          </div>
      {/* Selected State Badge */}
          {selectedState && (
            <div className="px-5 py-3 bg-emerald-50/50 border-t border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                <span className="text-sm font-medium text-emerald-700">
                  {STATE_NAMES[selectedState]}
                </span>
                <span className="text-xs text-emerald-600/70">
                  {stateStats[selectedState]?.total || 0} recruits
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                onClick={() => setSelectedState(null)}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>
            </div>
)}
        </Card>
        <Card className="rounded-3xl border border-slate-200/80 bg-white/10 backdrop-blur-md border border-white/20 shadow-sm overflow-hidden">
          {/* Filters Header */}
          {/* #region agent log */}
          <script dangerouslySetInnerHTML={{
            __html: `
              fetch('http://127.0.0.1:7242/ingest/c351967e-a062-4da3-8c65-86a13eaf3c2b', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId: 'debug-session',
                  runId: 'initial',
                  hypothesisId: 'D',
                  location: 'discover/page.tsx:filters-header',
                  message: 'Rendering filters header',
                  data: { showFilters, activeFilterSummary: !!activeFilterSummary },
                  timestamp: Date.now()
                })
              }).catch(() => {});
            `
          }} />
          {/* #endregion agent log */}
          <div
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Filter className="w-4 h-4 text-slate-400" strokeWidth={2} />
              <span className="text-sm font-medium text-slate-700">Filters</span>
            </div>
            <div className="flex items-center gap-2">
              {activeFilterSummary && (
                <>
                  {/* #region agent log */}
                  <script dangerouslySetInnerHTML={{
                    __html: `
                      fetch('http://127.0.0.1:7242/ingest/c351967e-a062-4da3-8c65-86a13eaf3c2b', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          sessionId: 'debug-session',
                          runId: 'initial',
                          hypothesisId: 'E',
                          location: 'discover/page.tsx:reset-button',
                          message: 'Rendering reset button',
                          data: { activeFilterSummary },
                          timestamp: Date.now()
                        })
                      }).catch(() => {});
                    `
                  }} />
                  {/* #endregion agent log */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
                    onClick={(e) => { e.stopPropagation(); clearAllFilters(); }}
                  >
                    Reset all
                  </Button>
                </>
              )}
              {showFilters ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>
      {showFilters && (
            <div className="px-5 pb-5 border-t border-slate-100 space-y-4">
              {/* Enhanced Search */}
              <div className="pt-4">
                <EnhancedSearch
                  placeholder="Search by name, position, or school..."
                  value={search}
                  onChange={setSearch}
                  onSearch={setSearch}
                  suggestions={filteredPlayers.slice(0, 5).map(p => ({
                    id: p.id,
                    label: p.name,
                    category: `${p.primaryPosition} • ${p.state}`,
                  }})
                  className="w-full"
                />
              </div>
      {/* Position chips */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Position</p>
                <div className="flex flex-wrap gap-1.5">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => togglePosition(pos)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        filters.positions.includes(pos)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-150'
                      }`}
                    >
                      {pos}
                    </button>
)}
                </div>
              </div>
      {/* Grad Year chips */}
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Grad Year</p>
                <div className="flex flex-wrap gap-1.5">
                  {GRAD_YEARS.map((year) => (
                    <button
                      key={year}
                      onClick={() => toggleGradYear(year)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        filters.gradYears.includes(year)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-150'
                      }`}
                    >
                      {year}
                    </button>
)}
                </div>
              </div>
      {/* Bats/Throws/Options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Bats</p>
                  <div className="flex gap-1">
                    {['R', 'L', 'S'].map((hand) => (
                      <button
                        key={hand}
                        onClick={() => setFilters(prev => ({ ...prev, bats: prev.bats === hand ? null : hand }})
                        className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          filters.bats === hand
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-150'
                        }`}
                      >
                        {hand}
                      </button>
)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Throws</p>
                  <div className="flex gap-1">
                    {['R', 'L'].map((hand) => (
                      <button
                        key={hand}
                        onClick={() => setFilters(prev => ({ ...prev, throws: prev.throws === hand ? null : hand }})
                        className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          filters.throws === hand
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-150'
                        }`}
                      >
                        {hand}
                      </button>
)}
                  </div>
                </div>
                <div className="col-span-2 md:col-span-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Options</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, hasVideo: !prev.hasVideo }})
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.hasVideo
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-150'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" strokeWidth={2} />
                      Has Video
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, verifiedOnly: !prev.verifiedOnly }})
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filters.verifiedOnly
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-150'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                      Verified
                    </button>
                  </div>
                </div>
              </div>
      {/* Active filters summary */}
              {activeFilterSummary && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Showing:</span> {activeFilterSummary}
                  </p>
                </div>
)}
            </div>
)}
        </Card>
      {/* ═══════════════════════════════════════════════════════════════════
            RESULTS SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <Card className="rounded-3xl border border-slate-200/80 bg-white/10 backdrop-blur-md border border-white/20 shadow-sm overflow-hidden">
          {/* Results Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Results</h2>
              {selectedState && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {getResultCount()} {getResultLabel()} in {STATE_NAMES[selectedState]}
                </p>
)}
            </div>
      {/* Entity Type Tabs */}
            <Tabs value={activeEntityType} onValueChange={(v) => setActiveEntityType(v as EntityType)}>
              <TabsList className="h-8 bg-slate-100 border-0 p-0.5">
                <TabsTrigger value="players" className="text-xs gap-1.5 px-3 h-7 data-[state=active]:bg-white/10 backdrop-blur-md border border-white/20 data-[state=active]:shadow-sm">
                  <User className="w-3.5 h-3.5" strokeWidth={2} />
                  Players
                </TabsTrigger>
        <TabsTrigger value="teams" className="text-xs gap-1.5 px-3 h-7 data-[state=active]:bg-white/10 backdrop-blur-md border border-white/20 data-[state=active]:shadow-sm">
                  <Building className="w-3.5 h-3.5" strokeWidth={2} />
                  Teams
                </TabsTrigger>
        <TabsTrigger value="juco" className="text-xs gap-1.5 px-3 h-7 data-[state=active]:bg-white/10 backdrop-blur-md border border-white/20 data-[state=active]:shadow-sm">
                  <GraduationCap className="w-3.5 h-3.5" strokeWidth={2} />
                  JUCO
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
      {/* Results Content */}
          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-5 h-5 bg-emerald-500/20 rounded animate-pulse"></div>
              </div>
            ) : !selectedState ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-slate-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium text-slate-700 mb-1">Select a state</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Click on a state in the map above to see players, teams, and JUCO programs.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeEntityType === 'players' && (
                  filteredPlayers.length === 0 ? (
                    <EmptyResults type="players" stateName={STATE_NAMES[selectedState]} />
                  ) : (
                    filteredPlayers.map((player) => (
                      <PlayerResultCard 
                        key={player.id} 
                        player={player} 
                        onAddToWatchlist={() => handleAddToWatchlist(player.id, player.name)}
                        onView={() => handleOpenPlayerCard(player)}
                      />
                    )}
                  })

                {activeEntityType === 'teams' && (
                  filteredTeams.length === 0 ? (
                    <EmptyResults type="teams" stateName={STATE_NAMES[selectedState]} />
                  ) : (
                    filteredTeams.map((team) => (
                      <TeamResultCard 
                        key={team.id} 
                        team={team}
                        onView={() => router.push(`/coach/college/teams/${team.id}`)}
                      />
                    )}
                  })

                {activeEntityType === 'juco' && (
                  filteredJucos.length === 0 ? (
                    <EmptyResults type="programs" stateName={STATE_NAMES[selectedState]} />
                  ) : (
                    filteredJucos.map((juco) => (
                      <JucoResultCard 
                        key={juco.id} 
                        juco={juco}
                        onView={() => router.push(`/coach/college/teams/${juco.id}`)}
                      />
                    )}
                  })
              </div>
)}
          </div>
        </Card>
      </div>
      {/* Player Scout Card */}
      <PlayerScoutCard
        isOpen={isScoutCardOpen}
        onClose={() => setIsScoutCardOpen(false)}
        player={selectedPlayer}
        onStatusChange={handleScoutCardStatusChange}
        onAddNote={handleScoutCardAddNote}
        onToggleWatchlist={handleToggleWatchlist}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Result Cards
// ═══════════════════════════════════════════════════════════════════════════

function EmptyResults({ type, stateName }: { type: string; stateName: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-sm text-slate-500">No {type} found in {stateName}</p>
    </div>
  );
}

function PlayerResultCard({ 
  player, 
  onAddToWatchlist,
  onView 
}: { 
  player: PlayerSummary;
  onAddToWatchlist: () => void;
  onView: () => void;
}) {
  return (
    <div 
      onClick={onView}
      className="rounded-2xl border border-slate-200/80 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-slate-50/50 hover:border-slate-300/80 hover:shadow-xl p-4 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Avatar className="h-11 w-11 rounded-xl shadow-sm">
          <AvatarImage src={player.avatarUrl ?? undefined} className="rounded-xl" />
          <AvatarFallback className="rounded-xl bg-emerald-100 text-emerald-700 text-sm font-semibold">
            {player.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{player.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {player.primaryPosition} • {player.gradYear}
            {player.height && ` • ${player.height}`}
            {player.weight && ` • ${player.weight} lbs`}
            {player.state && ` • ${player.state}`}
          </p>
      {/* Tags */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {player.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                <Sparkles className="w-3 h-3" strokeWidth={2} /> Verified
              </span>
)}
            {player.trending && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-medium">
                <TrendingUp className="w-3 h-3" strokeWidth={2} /> Trending
              </span>
)}
            {player.topSchool && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium">
                <Star className="w-3 h-3" strokeWidth={2} /> Top 5
              </span>
)}
          </div>
        </div>
      {/* Actions */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-3 text-xs text-slate-600 hover:text-slate-800"
            onClick={onView}
          >
            <User className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
            View profile
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" strokeWidth={2} />
          </Button>
        <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
            onClick={onAddToWatchlist}
          >
            <Bookmark className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
            Watchlist
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function TeamResultCard({ 
  team,
  onView 
}: { 
  team: TeamSummary;
  onView: () => void;
}) {
  const typeLabel = team.type === 'high_school' ? 'High School' : 'Showcase';
  
  return (
    <div 
      onClick={onView}
      className="rounded-2xl border border-slate-200/80 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-slate-50/50 hover:border-slate-300/80 hover:shadow-xl p-4 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shadow-sm">
          <Building className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
        </div>
      <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{team.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {typeLabel}
            {team.city && team.state && ` • ${team.city}, ${team.state}`}
          </p>
      {team.playersCount !== undefined && team.playersCount > 0 && (
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
              <Users className="w-3 h-3" /> {team.playersCount} on ScoutPulse
            </span>
)}
        </div>
      <Button
          size="sm"
          variant="ghost"
          className="h-8 px-3 text-xs text-slate-600 hover:text-slate-800 shrink-0"
          onClick={(e) => { e.stopPropagation(); onView(); }}
        >
          View team
          <ArrowUpRight className="w-3.5 h-3.5 ml-1" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}

function JucoResultCard({ 
  juco,
  onView 
}: { 
  juco: JucoSummary;
  onView: () => void;
}) {
  return (
    <div 
      onClick={onView}
      className="rounded-2xl border border-slate-200/80 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-slate-50/50 hover:border-slate-300/80 hover:shadow-xl p-4 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center shadow-sm">
          <GraduationCap className="w-5 h-5 text-purple-600" strokeWidth={1.5} />
        </div>
      <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-800 text-sm">{juco.name}</p>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-medium">
              JUCO
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {juco.conference && `${juco.conference} • `}
            {juco.city && juco.state && `${juco.city}, ${juco.state}`}
          </p>
      {juco.playersCount !== undefined && juco.playersCount > 0 && (
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
              <Users className="w-3 h-3" /> {juco.playersCount} players
            </span>
)}
        </div>
      <Button
          size="sm"
          variant="ghost"
          className="h-8 px-3 text-xs text-slate-600 hover:text-slate-800 shrink-0"
          onClick={(e) => { e.stopPropagation(); onView(); }}
        >
          View program
          <ArrowUpRight className="w-3.5 h-3.5 ml-1" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}
