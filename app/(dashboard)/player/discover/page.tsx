'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Search,
  MapPin,
  GraduationCap,
  Heart,
  Filter,
  ChevronRight,
  Trophy,
  Users,
  Globe,
  X,
  SlidersHorizontal,
  Building2,
  Star,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { PlayerDiscoverSkeleton } from '@/components/ui/loading-state';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
import { getColleges, type College } from '@/lib/api/player/recruitingInterests';
import { logError } from '@/lib/utils/errorLogger';
import { isDevMode, DEV_ENTITY_IDS } from '@/lib/dev-mode';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { SkipLink } from '@/components/ui/skip-link';
import { EnhancedSearch } from '@/components/ui/enhanced-search';
import { 
  glassCard, 
  glassCardHover, 
  glassInput, 
  glassStatCard,
  glassDarkZone,
  glassTransitionZone,
  glassLightZone,
  glassSegmentedControl,
  glassSegmentedPillActive,
  glassSegmentedPillInactive,
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
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import Image from 'next/image';
import { AdvancedFilters, type FilterState } from '@/components/search/AdvancedFilters';
import { FilterPresets } from '@/components/search/FilterPresets';
import { BulkActionsToolbar } from '@/components/bulk/BulkActionsToolbar';
import { SelectableItem } from '@/components/bulk/SelectableItem';

const DIVISIONS = ['All', 'D1', 'D2', 'D3', 'NAIA', 'JUCO'];
const REGIONS = ['All', 'Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'];

const STATE_TO_REGION: Record<string, string> = {
  // Northeast
  CT: 'Northeast', DE: 'Northeast', MA: 'Northeast', MD: 'Northeast', ME: 'Northeast',
  NH: 'Northeast', NJ: 'Northeast', NY: 'Northeast', PA: 'Northeast', RI: 'Northeast',
  VT: 'Northeast', DC: 'Northeast',
  // Southeast
  AL: 'Southeast', AR: 'Southeast', FL: 'Southeast', GA: 'Southeast', KY: 'Southeast',
  LA: 'Southeast', MS: 'Southeast', NC: 'Southeast', SC: 'Southeast', TN: 'Southeast',
  VA: 'Southeast', WV: 'Southeast',
  // Midwest
  IA: 'Midwest', IL: 'Midwest', IN: 'Midwest', KS: 'Midwest', MI: 'Midwest',
  MN: 'Midwest', MO: 'Midwest', NE: 'Midwest', ND: 'Midwest', OH: 'Midwest',
  SD: 'Midwest', WI: 'Midwest',
  // Southwest
  AZ: 'Southwest', NM: 'Southwest', OK: 'Southwest', TX: 'Southwest',
  // West
  AK: 'West', CA: 'West', CO: 'West', HI: 'West', ID: 'West', MT: 'West',
  NV: 'West', OR: 'West', UT: 'West', WA: 'West', WY: 'West',
};

export default function PlayerDiscoverPage() {
  const router = useRouter();
  const { toast: showToast } = useToast();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [interestedSchools, setInterestedSchools] = useState<Set<string>>(new Set());
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'division' | 'state' | 'conference'>('name');
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    divisions: [],
    conferences: [],
    states: [],
    regions: [],
    hasLogo: null,
    hasWebsite: null,
    minCommitCount: null,
    maxCommitCount: null,
  });
  const [availableConferences, setAvailableConferences] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [selectedCollegeIds, setSelectedCollegeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    
    let currentPlayerId: string | null = null;
    
    if (isDevMode()) {
      currentPlayerId = DEV_ENTITY_IDS.player;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: player } = await supabase
        .from('players')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!player) {
        router.push('/onboarding/player');
        return;
      }
      currentPlayerId = player.id;
    }

    setPlayerId(currentPlayerId);

    const collegeData = await getColleges();
    setColleges(collegeData);

    // Extract unique conferences and states for filters
    const conferences = Array.from(new Set(collegeData.map(c => c.conference).filter(Boolean))) as string[];
    const states = Array.from(new Set(collegeData.map(c => c.state).filter(Boolean))) as string[];
    setAvailableConferences(conferences.sort());
    setAvailableStates(states.sort());

    const { data: interests } = await supabase
      .from('recruiting_interests')
      .select('college_id')
      .eq('player_id', currentPlayerId);

    if (interests) {
      setInterestedSchools(new Set(interests.map(i => i.college_id).filter(Boolean)));
    }

    setLoading(false);
  };

  const filteredColleges = useMemo(() => {
    const filtered = colleges.filter(college => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesName = college.name.toLowerCase().includes(searchLower);
        const matchesCity = college.city?.toLowerCase().includes(searchLower);
        const matchesState = college.state?.toLowerCase().includes(searchLower);
        const matchesConference = college.conference?.toLowerCase().includes(searchLower);
        const matchesNickname = college.nickname?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesCity && !matchesState && !matchesConference && !matchesNickname) {
          return false;
        }
      }

      // Legacy division filter (for backward compatibility)
      if (divisionFilter !== 'All' && college.division !== divisionFilter) {
        return false;
      }

      // Legacy region filter
      if (regionFilter !== 'All' && college.state) {
        const region = STATE_TO_REGION[college.state];
        if (region !== regionFilter) {
          return false;
        }
      }

      // Advanced filters - Divisions
      if (advancedFilters.divisions.length > 0 && !advancedFilters.divisions.includes(college.division || '')) {
        return false;
      }

      // Advanced filters - Conferences
      if (advancedFilters.conferences.length > 0 && college.conference && !advancedFilters.conferences.includes(college.conference)) {
        return false;
      }

      // Advanced filters - States
      if (advancedFilters.states.length > 0 && college.state && !advancedFilters.states.includes(college.state)) {
        return false;
      }

      // Advanced filters - Regions
      if (advancedFilters.regions.length > 0 && college.state) {
        const region = STATE_TO_REGION[college.state];
        if (!region || !advancedFilters.regions.includes(region)) {
          return false;
        }
      }

      // Advanced filters - Has Logo
      if (advancedFilters.hasLogo === true && !college.logo_url) {
        return false;
      }
      if (advancedFilters.hasLogo === false && college.logo_url) {
        return false;
      }

      // Advanced filters - Has Website
      const hasWebsite = (college as any).website_url;
      if (advancedFilters.hasWebsite === true && !hasWebsite) {
        return false;
      }
      if (advancedFilters.hasWebsite === false && hasWebsite) {
        return false;
      }

      // Note: Commit count filter would require a separate query to colleges with join
      // For now, we'll skip it in the client-side filter

      return true;
    });

    // Sort the filtered colleges
    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'division') {
        const divOrder = { 'D1': 1, 'D2': 2, 'D3': 3, 'NAIA': 4, 'JUCO': 5 };
        const aOrder = divOrder[a.division as keyof typeof divOrder] || 99;
        const bOrder = divOrder[b.division as keyof typeof divOrder] || 99;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'state') {
        if (a.state === b.state) return a.name.localeCompare(b.name);
        return (a.state || '').localeCompare(b.state || '');
      } else if (sortBy === 'conference') {
        if (a.conference === b.conference) return a.name.localeCompare(b.name);
        return (a.conference || '').localeCompare(b.conference || '');
      }
      return 0;
    });
  }, [colleges, search, divisionFilter, regionFilter, sortBy, advancedFilters]);

  const handleAddInterest = async (college: College) => {
    if (!playerId) return;

    const supabase = createClient();
    
    const { error } = await supabase
      .from('recruiting_interests')
      .insert({
        player_id: playerId,
        college_id: college.id,
        school_name: college.name,
        conference: college.conference,
        division: college.division,
        status: 'interested',
        interest_level: 'medium',
      });

    if (error) {
      showToast({
        variant: 'error',
        title: 'Failed to add school',
        description: error.message,
      });
      logError(error, { component: 'PlayerDiscover', action: 'addInterest' });
      return;
    }

    setInterestedSchools(prev => new Set([...Array.from(prev), college.id]));
    showToast({
      variant: 'success',
      title: 'School added!',
      description: `${college.name} has been added to your interests.`,
    });
  };

  const handleRemoveInterest = async (collegeId: string) => {
    if (!playerId) return;

    const supabase = createClient();
    
    const { error } = await supabase
      .from('recruiting_interests')
      .delete()
      .eq('player_id', playerId)
      .eq('college_id', collegeId);

    if (error) {
      toast.error('Failed to remove school');
      return;
    }

    setInterestedSchools(prev => {
      const next = new Set(prev);
      next.delete(collegeId);
      return next;
    });
    showToast({
      variant: 'default',
      title: 'Removed',
      description: 'School removed from your interests.',
    });
  };

  const clearFilters = () => {
    setSearch('');
    setDivisionFilter('All');
    setRegionFilter('All');
    setAdvancedFilters({
      divisions: [],
      conferences: [],
      states: [],
      regions: [],
      hasLogo: null,
      hasWebsite: null,
      minCommitCount: null,
      maxCommitCount: null,
    });
  };

  const handleViewProgram = (college: College) => {
    router.push(`/college/${college.id}`);
  };

  const handleBulkAddToInterests = async (collegeIds: string[]) => {
    if (!playerId) {
      toast.error('Please log in to add schools to your interests');
      return;
    }

    const supabase = createClient();
    const collegesToAdd = colleges.filter(c => collegeIds.includes(c.id));
    
    const inserts = collegesToAdd.map(college => ({
      player_id: playerId,
      college_id: college.id,
      school_name: college.name,
      conference: college.conference,
      division: college.division,
      status: 'interested',
      interest_level: 'medium',
    }));

    const { error } = await supabase
      .from('recruiting_interests')
      .upsert(inserts, {
        onConflict: 'player_id,college_id',
        ignoreDuplicates: false,
      });

    if (error) {
      toast.error('Failed to add some schools');
      logError(error, { component: 'PlayerDiscover', action: 'bulkAddInterest' });
      return;
    }

    // Update interested schools set
    setInterestedSchools(prev => {
      const next = new Set(prev);
      collegeIds.forEach(id => next.add(id));
      return next;
    });

    showToast({
      variant: 'success',
      title: 'Schools added!',
      description: `Added ${collegeIds.length} school${collegeIds.length === 1 ? '' : 's'} to your interests.`,
    });
  };

  const handleBulkRemoveFromInterests = async (collegeIds: string[]) => {
    if (!playerId) return;

    const supabase = createClient();
    
    const { error } = await supabase
      .from('recruiting_interests')
      .delete()
      .eq('player_id', playerId)
      .in('college_id', collegeIds);

    if (error) {
      showToast({
        variant: 'error',
        title: 'Failed to remove some schools',
        description: error.message,
      });
      return;
    }

    // Update interested schools set
    setInterestedSchools(prev => {
      const next = new Set(prev);
      collegeIds.forEach(id => next.delete(id));
      return next;
    });

    showToast({
      variant: 'default',
      title: 'Schools removed',
      description: `Removed ${collegeIds.length} school${collegeIds.length === 1 ? '' : 's'} from your interests.`,
    });
  };

  const handleBulkExport = async (selectedColleges: College[]) => {
    // Create CSV content
    const headers = ['Name', 'Division', 'Conference', 'City', 'State', 'Website'];
    const rows = selectedColleges.map(college => [
      college.name,
      college.division || '',
      college.conference || '',
      college.city || '',
      college.state || '',
      (college as any).website_url || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')}
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `colleges-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast({
      variant: 'success',
      title: 'Export successful',
      description: `Exported ${selectedColleges.length} colleges to CSV.`,
    });
  };

  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedCollegeIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const hasActiveFilters = search || 
    divisionFilter !== 'All' || 
    regionFilter !== 'All' ||
    advancedFilters.divisions.length > 0 ||
    advancedFilters.conferences.length > 0 ||
    advancedFilters.states.length > 0 ||
    advancedFilters.regions.length > 0 ||
    advancedFilters.hasLogo !== null ||
    advancedFilters.hasWebsite !== null ||
    advancedFilters.minCommitCount !== null ||
    advancedFilters.maxCommitCount !== null;

  if (loading) {
    return <PlayerDiscoverSkeleton />;
  }

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
            { label: 'Dashboard', href: '/player' },
            { label: 'Discover', href: '/player/discover' },
          ]}
        />
      </div>
      {/* ═══════════════════════════════════════════════════════════════════
          ULTIMATE GLASSMORPHISM DISCOVER HERO ZONE
      ═══════════════════════════════════════════════════════════════════ */}
      <div id="discover-content" className={cn(glassDarkZoneEnhanced, "pb-12 relative overflow-hidden")}>
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '0s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s' }}></div>
{/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
<div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 space-y-6 relative z-10">
          
          {/* Premium Glass Hero Header */}
          <motion.section 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{duration: 0.6, ease: 'easeOut' }}
          >
            <div className={cn(glassHeroEnhanced, "p-6 md:p-8 relative overflow-hidden")}>
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-emerald-500/5 opacity-50 animate-pulse"></div>
<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "p-2.5 rounded-xl backdrop-blur-lg",
                      "bg-gradient-to-br from-purple-500/20 to-purple-600/10",
                      "border border-purple-400/30 shadow-lg shadow-purple-500/20"
                    )}>
                      <GraduationCap className="w-5 h-5 text-purple-300" strokeWidth={2} />
                    </div>
                    <Badge className={cn(
                      "backdrop-blur-lg bg-purple-500/25 text-purple-200 border border-purple-400/40",
                      "shadow-[0_2px_10px_rgba(168,85,247,0.3)]"
                    )}>
                      <Sparkles className="w-3 h-3 mr-1.5" strokeWidth={2} />
                      Discover
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                    Find Your Program
                  </h1>
                  <p className="text-sm text-white/70">Explore college baseball programs that match your goals</p>
                </div>
      <motion.div 
                  className={cn(
                    "px-5 py-3 rounded-xl backdrop-blur-lg",
                    "bg-white/[0.08] border border-white/[0.15]",
                    "shadow-lg shadow-purple-500/10"
                  )}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{duration: 0.5, delay: 0.2 }}
                >
                  <p className="text-3xl font-bold text-white mb-1">
                    <AnimatedNumber value={interestedSchools.size} duration={800} />
                  </p>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide font-medium">In Your List</p>
                </motion.div>
              </div>
            </div>
          </motion.section>
      {/* Enhanced Search Bar */}
          <EnhancedSearch
            placeholder="Search schools, cities, states, or conferences..."
            value={search}
            onChange={setSearch}
            onSearch={setSearch}
            suggestions={filteredColleges.slice(0, 5).map(c => ({
              id: c.id,
              label: c.name,
              category: `${c.division} • ${c.state || 'N/A'}`,
            }})
            className="w-full"
          />

          {/* Filter Chips Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border transition-all',
                'backdrop-blur-lg',
                showFilters 
                  ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-200 shadow-lg shadow-emerald-500/20' 
                  : 'bg-white/[0.08] border-white/[0.15] text-white/70 hover:bg-white/[0.12] hover:border-white/20'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" strokeWidth={2} />
              <span className="font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
)}
            </button>
      {/* Premium Division Pills */}
            <div className={cn(
              "flex gap-1.5 p-1.5 rounded-full backdrop-blur-xl",
              "bg-white/[0.08] border border-white/[0.15]"
            )}>
              {DIVISIONS.map((div) => (
                <motion.button
                  key={div}
                  onClick={() => setDivisionFilter(div)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-medium transition-all',
                    divisionFilter === div 
                      ? 'bg-white text-emerald-700 shadow-lg shadow-emerald-500/20' 
                      : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {div}
                </motion.button>
)}
            </div>
      {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-white/60 hover:text-white/90 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.08]"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
                Clear all
              </button>
)}
          </div>
      {/* Premium Glass Filters Panel */}
          {showFilters && (
            <motion.div 
              className={cn(glassPanelEnhanced, 'p-6 space-y-5')}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={ opacity: 0, height: 0 }}
              transition={{duration: 0.3 }}
            >
              {/* Region Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs font-semibold text-white/80 mb-3 block uppercase tracking-wide">Region</label>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map((region) => (
                      <motion.button
                        key={region}
                        onClick={() => setRegionFilter(region)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-xs font-medium transition-all backdrop-blur-lg',
                          regionFilter === region
                            ? 'bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 shadow-lg shadow-emerald-500/20'
                            : 'bg-white/[0.08] border border-white/[0.15] text-white/70 hover:bg-white/[0.12] hover:border-white/20'
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {region}
                      </motion.button>
)}
                  </div>
                </div>
              </div>
      {/* Filter Presets */}
              <div className="pt-5 border-t border-white/[0.1]">
                <FilterPresets
                  currentFilters={advancedFilters}
                  onLoadPreset={setAdvancedFilters}
                />
              </div>
      {/* Advanced Filters */}
              <div className="pt-5 border-t border-white/[0.1]">
                <AdvancedFilters
                  filters={advancedFilters}
                  onFiltersChange={setAdvancedFilters}
                  availableConferences={availableConferences}
                  availableStates={availableStates}
                  className="bg-transparent" />
              </div>
      {hasActiveFilters && (
                <motion.div 
                  className="mt-5 pt-4 border-t border-white/[0.1]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{duration: 0.3 }}
                >
                  <p className="text-xs text-white/60 font-medium">
                    Showing: {divisionFilter !== 'All' ? divisionFilter : 'All divisions'} 
                    {regionFilter !== 'All' ? ` • ${regionFilter}` : ''}
                    {advancedFilters.divisions.length > 0 && ` • ${advancedFilters.divisions.length} division(s)`}
                    {advancedFilters.conferences.length > 0 && ` • ${advancedFilters.conferences.length} conference(s)`}
                    {advancedFilters.states.length > 0 && ` • ${advancedFilters.states.length} state(s)`}
                    {search ? ` • "${search}"` : ''}
                  </p>
                </motion.div>
)}
            </motion.div>
)}
          {/* Premium Glass Stats Row */}
          <motion.div 
            className="grid grid-cols-3 gap-4"
            variants={staggerContainer as any}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem as any}>
              <GlassStatTile 
                icon={<Building2 className="w-4 h-4" strokeWidth={2} />}
                value={colleges.length}
                label="Programs"
              />
            </motion.div>
            <motion.div variants={staggerItem as any}>
              <GlassStatTile 
                icon={<Filter className="w-4 h-4" strokeWidth={2} />}
                value={filteredColleges.length}
                label="Matching"
                accent
              />
            </motion.div>
            <motion.div variants={staggerItem as any}>
              <GlassStatTile 
                icon={<Heart className="w-4 h-4" strokeWidth={2} />}
                value={interestedSchools.size}
                label="Interested"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
      {/* ═══════════════════════════════════════════════════════════════════
          ULTIMATE GLASSMORPHISM LIGHT CONTENT ZONE
      ═══════════════════════════════════════════════════════════════════ */}
      <div className={cn(glassTransitionZone, "py-12 relative overflow-hidden")}>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent opacity-50"></div>
<div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          
          {/* Premium Results Header */}
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{duration: 0.5, delay: 0.2 }}
          >
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Programs</h2>
              <p className="text-sm text-slate-600 font-medium">{filteredColleges.length} results</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'division' | 'state' | 'conference')}
                className={cn(
                  "text-xs px-4 py-2 rounded-xl border backdrop-blur-lg",
                  "bg-white/[0.8] border-slate-200/50 text-slate-700",
                  "hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                  "transition-all duration-300 shadow-sm hover:shadow-md"
                )}
              >
                <option value="name">Name</option>
                <option value="division">Division</option>
                <option value="conference">Conference</option>
                <option value="state">State</option>
              </select>
            </div>
          </motion.div>
      {/* Bulk Actions Toolbar */}
          <BulkActionsToolbar
            items={filteredColleges}
            selectedIds={selectedCollegeIds}
            onSelectionChange={setSelectedCollegeIds}
            onBulkAdd={handleBulkAddToInterests}
            onBulkRemove={handleBulkRemoveFromInterests}
            onBulkExport={handleBulkExport}
            itemName="colleges"
            className="mb-4"
          />

          {/* Premium Glass College Grid */}
          {filteredColleges.length > 0 ? (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
              variants={staggerContainer as any}
              initial="hidden"
              animate="visible"
            >
              {filteredColleges.map((college, index) => (
                <motion.div
                  key={college.id}
                  variants={staggerItem as any}
                  custom={index}
                >
                  <SelectableItem
                    id={college.id}
                    isSelected={selectedCollegeIds.has(college.id)}
                    onSelect={handleSelectionChange}
                  >
                    <CollegeCard
                      college={college}
                      isInterested={interestedSchools.has(college.id)}
                      onAddInterest={() => handleAddInterest(college)}
                      onRemoveInterest={() => handleRemoveInterest(college.id)}
                      onViewProgram={() => handleViewProgram(college)}
                    />
                  </SelectableItem>
                </motion.div>
)}
            </motion.div>
          ) : (
            <motion.div 
              className={cn(
                glassPanelEnhanced,
                "p-12 text-center"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{duration: 0.5 }}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border border-purple-400/30 flex items-center justify-center mb-4 backdrop-blur-lg">
                <GraduationCap className="w-8 h-8 text-purple-300" strokeWidth={2} />
              </div>
              <p className="text-slate-800 font-semibold text-lg">No programs match your filters</p>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className={cn(
                  glassButtonEnhanced.primary,
                  "mt-6 px-6 py-2.5 text-sm font-semibold"
                )}
              >
                Clear Filters
              </button>
            </motion.div>
)}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════════════════════════════════════════

function GlassStatTile({ 
  icon, 
  value, 
  label,
  accent,
}: { 
  icon: React.ReactNode;
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <motion.div 
      className={cn(
        glassStatCardEnhanced,
        'text-center p-4',
        accent 
          ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-400/30 shadow-lg shadow-emerald-500/20' 
          : 'bg-gradient-to-br from-white/[0.08] to-white/[0.05] border-white/[0.15]'
      )}
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{duration: 0.3 }}
    >
      <div className={cn(
        'w-9 h-9 mx-auto rounded-xl flex items-center justify-center mb-3 backdrop-blur-lg',
        accent 
          ? 'bg-emerald-500/25 border border-emerald-400/30 text-emerald-300' 
          : 'bg-white/[0.1] border border-white/[0.15] text-white/70'
      )}>
        {icon}
      </div>
      <p className={cn('text-2xl font-bold mb-1', accent ? 'text-emerald-300' : 'text-white')}>
        <AnimatedNumber value={value} duration={1000} />
      </p>
      <p className="text-[10px] text-white/60 uppercase tracking-wide font-medium">{label}</p>
    </motion.div>
  );
}

function CollegeCard({
  college,
  isInterested,
  onAddInterest,
  onRemoveInterest,
  onViewProgram,
}: {
  college: College;
  isInterested: boolean;
  onAddInterest: () => void;
  onRemoveInterest: () => void;
  onViewProgram: () => void;
}) {
  const getDivisionColor = (division: string | null) => {
    switch (division) {
      case 'D1': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'D2': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'D3': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'NAIA': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'JUCO': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <motion.div 
      className={cn(
        glassCardInteractiveEnhanced,
        "p-5 group cursor-pointer"
      )}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 backdrop-blur-lg shadow-lg shadow-emerald-500/10 group-hover:shadow-emerald-500/20 transition-shadow">
          {college.logo_url ? (
            <Image src={college.logo_url} alt={college.name} width={36} height={36} className="object-contain" />
          ) : (
            <GraduationCap className="w-5 h-5 text-emerald-300" strokeWidth={2} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
            {college.name}
          </h3>
          {college.nickname && (
            <p className="text-sm text-slate-500">{college.nickname}</p>
)}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {college.division && (
              <Badge variant="outline" className={cn('text-[10px] font-medium', getDivisionColor(college.division})>
                {college.division}
              </Badge>
)}
            {college.city && college.state && (
              <span className="text-xs flex items-center gap-1 text-slate-500">
                <MapPin className="w-3 h-3" />
                {college.city}, {college.state}
              </span>
)}
          </div>
          {college.conference && (
            <p className="text-xs text-slate-400 mt-1.5 truncate">{college.conference}</p>
)}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={onViewProgram}
          className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors"
        >
          View Program <ArrowUpRight className="w-3 h-3" />
        </button>
        <button
          onClick={isInterested ? onRemoveInterest : onAddInterest}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            isInterested 
              ? 'bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100' 
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
          )}
        >
          <Heart className={cn('w-3.5 h-3.5', isInterested && 'fill-current')} />
          {isInterested ? 'Interested' : 'Add'}
        </button>
      </div>
    </motion.div>
  );
}
