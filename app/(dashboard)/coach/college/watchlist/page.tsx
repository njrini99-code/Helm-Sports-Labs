'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Users,
  Eye,
  Trash2,
  MessageSquare,
  MapPin,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  Video,
  ArrowUpRight,
  Filter,
  ChevronRight,
  UserPlus,
  CheckSquare,
  Square,
  Download,
  X,
  Loader2,
} from 'lucide-react';
import { WatchlistSkeleton } from '@/components/ui/loading-state';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { isDevMode, DEV_ENTITY_IDS } from '@/lib/dev-mode';

interface Recruit {
  id: string;
  player_id: string;
  name: string;
  grad_year: string | null;
  primary_position: string | null;
  high_school_name: string | null;
  high_school_state: string | null;
  stage: string;
  priority: string;
  notes: string | null;
  player?: {
    first_name: string | null;
    last_name: string | null;
    grad_year: number | null;
    primary_position: string | null;
    height_feet: number | null;
    height_inches: number | null;
    weight_lbs: number | null;
    high_school_state: string | null;
  };
}

const CATEGORIES = [
  { id: 'all', label: 'All Players' },
  { id: 'pitchers', label: 'Pitchers' },
  { id: 'infielders', label: 'Infielders' },
  { id: 'outfielders', label: 'Outfielders' },
  { id: 'catchers', label: 'Catchers' },
];

const STAGES = [
  { id: 'Watchlist', label: 'Watchlist', color: 'blue', bgLight: 'bg-blue-50', borderLight: 'border-blue-200', hoverBorder: 'hover:border-blue-300', headerBg: 'bg-blue-500', textColor: 'text-blue-700' },
  { id: 'Evaluating', label: 'Evaluating', color: 'amber', bgLight: 'bg-amber-50', borderLight: 'border-amber-200', hoverBorder: 'hover:border-amber-300', headerBg: 'bg-amber-500', textColor: 'text-amber-700' },
  { id: 'High Priority', label: 'High Priority', color: 'orange', bgLight: 'bg-orange-50', borderLight: 'border-orange-200', hoverBorder: 'hover:border-orange-300', headerBg: 'bg-orange-500', textColor: 'text-orange-700' },
  { id: 'Offered', label: 'Offered', color: 'purple', bgLight: 'bg-purple-50', borderLight: 'border-purple-200', hoverBorder: 'hover:border-purple-300', headerBg: 'bg-purple-500', textColor: 'text-purple-700' },
  { id: 'Committed', label: 'Committed', color: 'emerald', bgLight: 'bg-emerald-50', borderLight: 'border-emerald-200', hoverBorder: 'hover:border-emerald-300', headerBg: 'bg-emerald-500', textColor: 'text-emerald-700' },
];

export default function CollegeCoachWatchlistPage() {
  const router = useRouter();
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    loadRecruits();
  }, []);

  const loadRecruits = async () => {
    const supabase = createClient();
    
    let coachId: string | null = null;
    
    if (isDevMode()) {
      coachId = DEV_ENTITY_IDS.coach;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: coachData } = await supabase
        .from('coaches')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!coachData) {
        setLoading(false);
        return;
      }
      coachId = coachData.id;
    }

    const { data: recruitsData } = await supabase
      .from('recruits')
      .select(`
        *,
        players:player_id (
          first_name,
          last_name,
          grad_year,
          primary_position,
          height_feet,
          height_inches,
          weight_lbs,
          high_school_state
        )
      `)
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (recruitsData) {
      const formatted: Recruit[] = recruitsData.map(r => ({
        ...r,
        player: r.players as Recruit['player'],
        name: r.name || `${(r.players as any)?.first_name || ''} ${(r.players as any)?.last_name || ''}`.trim(),
      }));
      setRecruits(formatted);
    }

    setLoading(false);
  };

  const getRecruitsByCategory = (category: string) => {
    const positionMap: Record<string, string[]> = {
      pitchers: ['Pitcher', 'P', 'RHP', 'LHP'],
      infielders: ['First Base', 'Second Base', 'Third Base', 'Shortstop', '1B', '2B', '3B', 'SS'],
      outfielders: ['Left Field', 'Center Field', 'Right Field', 'LF', 'CF', 'RF', 'OF'],
      catchers: ['Catcher', 'C'],
    };

    if (category === 'all') return recruits;
    
    const positions = positionMap[category] || [];
    
    return recruits.filter(r => {
      const playerPos = r.player?.primary_position || r.primary_position;
      return positions.some(p => playerPos?.toLowerCase().includes(p.toLowerCase()));
    });
  };

  // Stats calculations
  const stats = useMemo(() => {
    const pitchers = getRecruitsByCategory('pitchers').length;
    const infielders = getRecruitsByCategory('infielders').length;
    const outfielders = getRecruitsByCategory('outfielders').length;
    const catchers = getRecruitsByCategory('catchers').length;
    return { total: recruits.length, pitchers, infielders, outfielders, catchers };
  }, [recruits]);

  const filteredRecruits = useMemo(() => {
    return getRecruitsByCategory(selectedCategory).filter(r => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(query) ||
        r.player?.first_name?.toLowerCase().includes(query) ||
        r.player?.last_name?.toLowerCase().includes(query) ||
        r.high_school_name?.toLowerCase().includes(query)
      );
    });
  }, [recruits, selectedCategory, searchQuery]);

  const handleViewPlayer = (playerId: string) => {
    router.push(`/coach/college/player/${playerId}`);
  };

  const handleMessagePlayer = (playerId: string, playerName: string) => {
    toast.success(`Opening message to ${playerName}...`);
    router.push(`/coach/college/messages?player=${playerId}`);
  };

  const handleRemoveFromWatchlist = async (recruitId: string, playerName: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('recruits')
      .delete()
      .eq('id', recruitId);

    if (error) {
      toast.error('Failed to remove from watchlist');
    } else {
      toast.success(`${playerName} removed from watchlist`);
      setRecruits(recruits.filter(r => r.id !== recruitId));
    }
  };

  const handleUpdateStage = async (recruitId: string, newStage: string, playerName: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('recruits')
      .update({ stage: newStage })
      .eq('id', recruitId);

    if (error) {
      toast.error('Failed to update stage');
    } else {
      const stageName = STAGES.find(s => s.id === newStage)?.label;
      toast.success(`${playerName} moved to ${stageName}`);
      setRecruits(recruits.map(r => r.id === recruitId ? { ...r, stage: newStage } : r));
    }
  };

  // Bulk selection handlers
  const toggleSelectRecruit = (recruitId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recruitId)) {
        newSet.delete(recruitId);
      } else {
        newSet.add(recruitId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRecruits.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRecruits.map(r => r.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Bulk actions
  const handleBulkMoveStage = async (newStage: string) => {
    if (selectedIds.size === 0) return;
    
    setBulkActionLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('recruits')
      .update({ stage: newStage })
      .in('id', Array.from(selectedIds));

    if (error) {
      toast.error('Failed to move selected recruits');
    } else {
      const stageName = STAGES.find(s => s.id === newStage)?.label;
      toast.success(`${selectedIds.size} recruits moved to ${stageName}`);
      setRecruits(recruits.map(r => 
        selectedIds.has(r.id) ? { ...r, stage: newStage } : r
      ));
      clearSelection();
    }
    setBulkActionLoading(false);
  };

  const handleBulkRemove = async () => {
    if (selectedIds.size === 0) return;
    
    const confirmRemove = confirm(`Remove ${selectedIds.size} recruits from your watchlist?`);
    if (!confirmRemove) return;

    setBulkActionLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from('recruits')
      .delete()
      .in('id', Array.from(selectedIds));

    if (error) {
      toast.error('Failed to remove selected recruits');
    } else {
      toast.success(`${selectedIds.size} recruits removed from watchlist`);
      setRecruits(recruits.filter(r => !selectedIds.has(r.id)));
      clearSelection();
    }
    setBulkActionLoading(false);
  };

  const handleBulkExport = () => {
    if (selectedIds.size === 0) return;
    
    const selectedRecruits = recruits.filter(r => selectedIds.has(r.id));
    const csvContent = [
      ['Name', 'Position', 'Grad Year', 'State', 'Stage'].join(','),
      ...selectedRecruits.map(r => [
        r.name,
        r.player?.primary_position || r.primary_position || '',
        r.player?.grad_year || r.grad_year || '',
        r.player?.high_school_state || r.high_school_state || '',
        r.stage
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watchlist-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedIds.size} recruits to CSV`);
  };

  if (loading) {
    return <WatchlistSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-5 space-y-4">
        
        {/* ═══════════════════════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Watchlist</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Your personal recruiting board for this class.
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Statuses sync with your Recruiting Planner board.
            </p>
          </div>
          
          {/* Stats Strip */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-medium text-slate-700">{stats.total} total</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{stats.pitchers} Pitchers</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{stats.infielders} Infielders</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{stats.outfielders} Outfielders</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{stats.catchers} Catchers</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            CONTROLS ROW
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search recruits..."
              className="pl-9 h-9 bg-white border-slate-200 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Position Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((category) => {
              const count = getRecruitsByCategory(category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {category.label}
                  {count > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                      selectedCategory === category.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 lg:ml-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-xs text-slate-600 hover:text-slate-800"
              onClick={toggleSelectAll}
            >
              {selectedIds.size === filteredRecruits.length && filteredRecruits.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
              ) : (
                <Square className="w-3.5 h-3.5 mr-1.5" />
              )}
              Select All
            </Button>
            <Link href="/coach/college/recruiting-planner">
              <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-slate-600 hover:text-slate-800">
                View Planner
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
            <Link href="/coach/college/discover">
              <Button size="sm" className="h-8 px-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                <UserPlus className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                Find Players
              </Button>
            </Link>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            BULK ACTIONS TOOLBAR
        ═══════════════════════════════════════════════════════════════════ */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                {selectedIds.size} selected
              </span>
            </div>
            <div className="h-4 w-px bg-emerald-200" />
            <div className="flex items-center gap-2 flex-1">
              <Select onValueChange={handleBulkMoveStage} disabled={bulkActionLoading}>
                <SelectTrigger className="h-8 w-40 text-xs bg-white border-emerald-200">
                  <SelectValue placeholder="Move to..." />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                onClick={handleBulkExport}
                disabled={bulkActionLoading}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
                onClick={handleBulkRemove}
                disabled={bulkActionLoading}
              >
                {bulkActionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                )}
                Remove
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
              onClick={clearSelection}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            KANBAN BOARD
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {STAGES.map((stage) => {
            const stageRecruits = filteredRecruits.filter(r => r.stage === stage.id);
            return (
              <RecruitBoardColumn
                key={stage.id}
                stage={stage}
                recruits={stageRecruits}
                onViewPlayer={handleViewPlayer}
                onMessagePlayer={handleMessagePlayer}
                onRemove={handleRemoveFromWatchlist}
                onUpdateStage={handleUpdateStage}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelectRecruit}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Column Component
// ═══════════════════════════════════════════════════════════════════════════

interface RecruitBoardColumnProps {
  stage: typeof STAGES[0];
  recruits: Recruit[];
  onViewPlayer: (playerId: string) => void;
  onMessagePlayer: (playerId: string, playerName: string) => void;
  onRemove: (recruitId: string, playerName: string) => void;
  onUpdateStage: (recruitId: string, newStage: string, playerName: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (recruitId: string) => void;
}

function RecruitBoardColumn({ 
  stage, 
  recruits, 
  onViewPlayer, 
  onMessagePlayer, 
  onRemove,
  onUpdateStage,
  selectedIds,
  onToggleSelect,
}: RecruitBoardColumnProps) {
  return (
    <div className="flex-shrink-0 w-[280px]">
      {/* Column Header */}
      <div className={`rounded-t-2xl ${stage.bgLight} border ${stage.borderLight} border-b-0 px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stage.headerBg}`} />
            <h3 className={`text-sm font-semibold ${stage.textColor}`}>{stage.label}</h3>
          </div>
          <Badge className={`${stage.bgLight} ${stage.textColor} border ${stage.borderLight} text-[10px] font-semibold px-2 py-0.5`}>
            {recruits.length}
          </Badge>
        </div>
      </div>

      {/* Column Content */}
      <div className={`min-h-[480px] max-h-[600px] overflow-y-auto rounded-b-2xl border ${stage.borderLight} border-t-0 bg-white p-3 space-y-2`}>
        {recruits.length === 0 ? (
          <RecruitBoardEmptyState stage={stage} />
        ) : (
          recruits.map((recruit) => (
            <RecruitBoardCard
              key={recruit.id}
              recruit={recruit}
              stage={stage}
              onView={() => onViewPlayer(recruit.player_id)}
              onMessage={() => onMessagePlayer(recruit.player_id, recruit.name)}
              onRemove={() => onRemove(recruit.id, recruit.name)}
              onUpdateStage={(newStage) => onUpdateStage(recruit.id, newStage, recruit.name)}
              isSelected={selectedIds.has(recruit.id)}
              onToggleSelect={() => onToggleSelect(recruit.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Empty State Component
// ═══════════════════════════════════════════════════════════════════════════

function RecruitBoardEmptyState({ stage }: { stage: typeof STAGES[0] }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className={`w-10 h-10 rounded-xl ${stage.bgLight} flex items-center justify-center mb-3`}>
        <Users className={`w-5 h-5 ${stage.textColor} opacity-60`} strokeWidth={1.5} />
      </div>
      <p className="text-xs font-medium text-slate-600 mb-1">
        No recruits in {stage.label} yet
      </p>
      <p className="text-[10px] text-slate-400 max-w-[180px] mb-3">
        Drag players here from Discover or move them between columns.
      </p>
      <Link href="/coach/college/discover">
        <Button variant="outline" size="sm" className="h-7 text-[10px] px-2.5 border-slate-200 text-slate-600 hover:bg-slate-50">
          Browse recruits
        </Button>
      </Link>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Card Component
// ═══════════════════════════════════════════════════════════════════════════

interface RecruitBoardCardProps {
  recruit: Recruit;
  stage: typeof STAGES[0];
  onView: () => void;
  onMessage: () => void;
  onRemove: () => void;
  onUpdateStage: (newStage: string) => void;
  isSelected: boolean;
  onToggleSelect: () => void;
}

function RecruitBoardCard({ recruit, stage, onView, onMessage, onRemove, onUpdateStage, isSelected, onToggleSelect }: RecruitBoardCardProps) {
  const initials = `${recruit.player?.first_name?.[0] || ''}${recruit.player?.last_name?.[0] || ''}`.toUpperCase() || 'NA';
  const position = recruit.player?.primary_position || recruit.primary_position || '';
  const gradYear = recruit.player?.grad_year || recruit.grad_year;
  const height = recruit.player?.height_feet && recruit.player?.height_inches 
    ? `${recruit.player.height_feet}'${recruit.player.height_inches}"` 
    : null;
  const weight = recruit.player?.weight_lbs ? `${recruit.player.weight_lbs} lbs` : null;
  const state = recruit.player?.high_school_state || recruit.high_school_state || '';

  return (
    <div 
      className={`rounded-xl border bg-white p-3 transition-all cursor-pointer hover:shadow-md group ${
        isSelected 
          ? 'border-emerald-400 bg-emerald-50/50 ring-1 ring-emerald-400' 
          : `border-slate-200 ${stage.hoverBorder}`
      }`}
      onClick={onView}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isSelected 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-slate-300 hover:border-emerald-400'
          }`}
        >
          {isSelected && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Avatar */}
        <Avatar className="h-9 w-9 rounded-lg shadow-sm flex-shrink-0">
          <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-700 text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-slate-800 truncate">{recruit.name}</p>
            {position && (
              <span className="text-[10px] text-slate-500 font-medium">— {position}</span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {[gradYear, height, weight, state].filter(Boolean).join(' · ')}
          </p>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onView} className="text-xs">
              <Eye className="w-3.5 h-3.5 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMessage} className="text-xs">
              <MessageSquare className="w-3.5 h-3.5 mr-2" />
              Send Message
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" asChild>
              <Link href={`/coach/college/recruiting-planner?player=${recruit.player_id}`}>
                <ArrowUpRight className="w-3.5 h-3.5 mr-2" />
                View in Planner
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRemove} className="text-xs text-red-600 focus:text-red-600">
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags - only show if recruit has special attributes */}
      <div className="flex items-center gap-1 mt-2 flex-wrap">
        {/* Stage selector (compact) */}
        <Select
          value={recruit.stage}
          onValueChange={(value) => {
            onUpdateStage(value);
          }}
        >
          <SelectTrigger 
            className="h-5 text-[10px] px-2 border-0 bg-slate-100 hover:bg-slate-200 w-auto gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map(s => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${s.headerBg}`} />
                  {s.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
