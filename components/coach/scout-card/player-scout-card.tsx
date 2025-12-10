'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import {
  User, MapPin, GraduationCap, Calendar, MessageSquare, Plus,
  Bookmark, BookmarkCheck, ChevronRight, ChevronDown, Eye, Clock,
  ArrowRightLeft, ClipboardList, School, Target, Gauge, Timer,
  Zap, Activity, Star, TrendingUp, ExternalLink, Building2, Bus,
  Award, Shirt
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  ScoutCardShell, 
  ScoutCardSection, 
  ScoutCardActions,
  ScoutCardMetricTile,
  ScoutCardInfoRow,
  ScoutCardStatusPill,
} from './scout-card-shell';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface PlayerScoutCardData {
  id: string;
  fullName: string;
  avatarUrl?: string;
  gradYear: number;
  age?: number;
  primaryPosition: string;
  secondaryPosition?: string;
  height?: string;
  weight?: number;
  bats?: 'L' | 'R' | 'S';
  throws?: 'L' | 'R';
  // School info
  highSchool?: string;
  highSchoolId?: string;
  city?: string;
  state?: string;
  // Team info
  showcaseTeam?: string;
  showcaseTeamId?: string;
  travelTeam?: string;
  // Recruiting status
  pipelineStatus?: 'watchlist' | 'high_priority' | 'offer_extended' | 'committed' | 'uninterested' | null;
  internalLabels?: string[]; // e.g., "Top 5", "High Upside", "Late Bloomer"
  interestedSchools?: { id: string; name: string; logoUrl?: string }[];
  // Metrics (pitcher)
  fbVelo?: number;
  slVelo?: number;
  changeVelo?: number;
  spinRate?: number;
  // Metrics (position player)
  sixtyYard?: number;
  infVelo?: number;
  ofVelo?: number;
  popTime?: number;
  exitVelo?: number;
  metricsUpdatedAt?: string;
  // Activity tracking
  profileViews?: number;
  lastViewedAt?: string;
  lastNoteDate?: string;
  lastNoteAuthor?: string;
  addedToWatchlistAt?: string;
  // Notes
  notes?: { id: string; content: string; authorInitials: string; authorName?: string; createdAt: string }[];
}

interface PlayerScoutCardProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerScoutCardData | null;
  onStatusChange?: (playerId: string, status: PlayerScoutCardData['pipelineStatus']) => void;
  onAddNote?: (playerId: string, note: string) => void;
  onToggleWatchlist?: (playerId: string, isOnWatchlist: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// Status Configuration
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_OPTIONS = [
  { value: 'watchlist', label: 'Watchlist', color: 'text-blue-600' },
  { value: 'high_priority', label: 'High Priority', color: 'text-amber-600' },
  { value: 'offer_extended', label: 'Offer Extended', color: 'text-purple-600' },
  { value: 'committed', label: 'Committed', color: 'text-emerald-600' },
  { value: 'uninterested', label: 'Not Interested', color: 'text-slate-500' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export function PlayerScoutCard({
  isOpen,
  onClose,
  player,
  onStatusChange,
  onAddNote,
  onToggleWatchlist,
}: PlayerScoutCardProps) {
  const router = useRouter();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  if (!player) return null;

  const initials = player.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isPitcher = ['P', 'RHP', 'LHP', 'SP', 'RP'].includes(player.primaryPosition);
  const isOnWatchlist = !!player.pipelineStatus;
  const location = player.city && player.state ? `${player.city}, ${player.state}` : player.state;

  // Handlers
  const handleViewProfile = () => {
    router.push(`/coach/player/${player.id}`);
    onClose();
  };

  const handleMessage = () => {
    router.push(`/coach/college/messages?player=${player.id}`);
    onClose();
  };

  const handleOpenInPlanner = () => {
    router.push(`/coach/college/recruiting-planner?highlight=${player.id}&position=${player.primaryPosition}`);
    onClose();
  };

  const handleViewHighSchool = () => {
    if (player.highSchoolId) {
      // Route to college coach's view of the team
      router.push(`/coach/college/teams/${player.highSchoolId}`);
      onClose();
    }
  };

  const handleViewShowcaseTeam = () => {
    if (player.showcaseTeamId) {
      // Route to college coach's view of the team
      router.push(`/coach/college/teams/${player.showcaseTeamId}`);
      onClose();
    }
  };

  const handleToggleWatchlist = () => {
    if (onToggleWatchlist) {
      onToggleWatchlist(player.id, !isOnWatchlist);
      toast.success(isOnWatchlist ? 'Removed from watchlist' : 'Added to watchlist');
    }
  };

  const handleStatusChange = (status: PlayerScoutCardData['pipelineStatus']) => {
    if (onStatusChange) {
      onStatusChange(player.id, status);
      toast.success(`Status updated to ${status?.replace(/_/g, ' ')}`);
    }
  };

  const handleAddNote = () => {
    if (noteText.trim() && onAddNote) {
      onAddNote(player.id, noteText);
      setNoteText('');
      setShowNoteInput(false);
      toast.success('Note added');
    }
  };

  // Header Content
  const headerContent = (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <Avatar className="h-14 w-14 ring-2 ring-emerald-500/20 flex-shrink-0">
        <AvatarImage src={player.avatarUrl} />
        <AvatarFallback className="bg-emerald-500 text-white font-bold text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {player.fullName}
          </h2>
          {player.pipelineStatus && (
            <ScoutCardStatusPill status={player.pipelineStatus} />
          )}
        </div>
        
        {/* Meta line 1: Position • Grad Year • Height • Weight */}
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
          {player.primaryPosition}
          {player.secondaryPosition && `/${player.secondaryPosition}`}
          {' • '}{player.gradYear}
          {player.height && ` • ${player.height}`}
          {player.weight && ` • ${player.weight} lbs`}
        </p>

        {/* Meta line 2: High School – City, State */}
        {player.highSchool && (
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-0.5">
            {player.highSchool}
            {location && ` – ${location}`}
          </p>
        )}

        {/* Meta line 3: Showcase/Travel Team */}
        {(player.showcaseTeam || player.travelTeam) && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
            <Bus className="w-3 h-3" />
            {player.showcaseTeam || player.travelTeam}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <ScoutCardShell
      isOpen={isOpen}
      onClose={onClose}
      headerContent={headerContent}
      onOpenInNewTab={() => window.open(`/coach/player/${player.id}`, '_blank')}
      onCopyLink={() => {
        navigator.clipboard.writeText(`${window.location.origin}/coach/player/${player.id}`);
        toast.success('Link copied');
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          ACTIONS ROW
      ═══════════════════════════════════════════════════════════════════ */}
      <ScoutCardActions>
        <Button 
          size="sm" 
          className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white"
          onClick={handleViewProfile}
        >
          <User className="w-3.5 h-3.5" />
          View Full Profile
        </Button>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="gap-1.5"
          onClick={handleToggleWatchlist}
        >
          {isOnWatchlist ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
              On Watchlist
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5" />
              Add to Watchlist
            </>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Move Status
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {STATUS_OPTIONS.map(opt => (
              <DropdownMenuItem 
                key={opt.value} 
                onClick={() => handleStatusChange(opt.value)}
                className={player.pipelineStatus === opt.value ? 'bg-slate-100 dark:bg-slate-800' : ''}
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  opt.value === 'watchlist' ? 'bg-blue-500' :
                  opt.value === 'high_priority' ? 'bg-amber-500' :
                  opt.value === 'offer_extended' ? 'bg-purple-500' :
                  opt.value === 'committed' ? 'bg-emerald-500' : 'bg-slate-400'
                }`} />
                {opt.label}
              </DropdownMenuItem>
            ))}
            {player.pipelineStatus && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusChange(null)} className="text-red-600">
                  Remove from Pipeline
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" variant="ghost" className="gap-1.5" onClick={handleMessage}>
          <MessageSquare className="w-3.5 h-3.5" />
          Message
        </Button>
      </ScoutCardActions>

      {/* Content area with padding */}
      <div className="py-3">
        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1: PLAYER SNAPSHOT
        ═══════════════════════════════════════════════════════════════════ */}
        <ScoutCardSection title="Player Snapshot">
          <div className="grid grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <Shirt className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{player.primaryPosition}</p>
                  {player.secondaryPosition && (
                    <p className="text-xs text-slate-500">Also plays {player.secondaryPosition}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 tracking-wide">Throws</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{player.throws || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 tracking-wide">Bats</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{player.bats || '—'}</p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-2">
              <ScoutCardInfoRow 
                label="Class" 
                value={player.gradYear}
                icon={<GraduationCap className="w-3.5 h-3.5" />}
              />
              {player.age && (
                <ScoutCardInfoRow 
                  label="Age" 
                  value={`${player.age} years`}
                  icon={<Calendar className="w-3.5 h-3.5" />}
                />
              )}
              {player.highSchool && (
                <ScoutCardInfoRow 
                  label="High School" 
                  value={
                    player.highSchoolId ? (
                      <button 
                        onClick={handleViewHighSchool} 
                        className="text-emerald-600 hover:underline truncate"
                      >
                        {player.highSchool}
                      </button>
                    ) : player.highSchool
                  }
                  icon={<School className="w-3.5 h-3.5" />}
                />
              )}
              {(player.showcaseTeam || player.travelTeam) && (
                <ScoutCardInfoRow 
                  label="Travel/Showcase" 
                  value={
                    player.showcaseTeamId ? (
                      <button 
                        onClick={handleViewShowcaseTeam} 
                        className="text-emerald-600 hover:underline truncate"
                      >
                        {player.showcaseTeam || player.travelTeam}
                      </button>
                    ) : (player.showcaseTeam || player.travelTeam)
                  }
                  icon={<Bus className="w-3.5 h-3.5" />}
                />
              )}
            </div>
          </div>
        </ScoutCardSection>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2: PERFORMANCE METRICS
        ═══════════════════════════════════════════════════════════════════ */}
        <ScoutCardSection 
          title="Performance Metrics"
          action={
            player.metricsUpdatedAt && (
              <span className="text-[10px] text-slate-400">
                Updated {player.metricsUpdatedAt}
              </span>
            )
          }
        >
          <div className="grid grid-cols-3 gap-2">
            {isPitcher ? (
              <>
                {player.fbVelo && (
                  <ScoutCardMetricTile 
                    value={player.fbVelo} 
                    label="FB Velo" 
                    unit="mph"
                    badge={player.fbVelo >= 90 ? 'D1 Range' : undefined}
                    icon={<Gauge className="w-4 h-4" />}
                  />
                )}
                {player.slVelo && (
                  <ScoutCardMetricTile 
                    value={player.slVelo} 
                    label="Slider" 
                    unit="mph"
                    icon={<Zap className="w-4 h-4" />}
                  />
                )}
                {player.changeVelo && (
                  <ScoutCardMetricTile 
                    value={player.changeVelo} 
                    label="Changeup" 
                    unit="mph"
                    icon={<Activity className="w-4 h-4" />}
                  />
                )}
                {player.spinRate && (
                  <ScoutCardMetricTile 
                    value={player.spinRate} 
                    label="Spin Rate" 
                    unit="rpm"
                  />
                )}
              </>
            ) : (
              <>
                {player.sixtyYard && (
                  <ScoutCardMetricTile 
                    value={player.sixtyYard} 
                    label="60-Yard" 
                    unit="sec"
                    badge={player.sixtyYard <= 6.8 ? 'Elite' : undefined}
                    icon={<Timer className="w-4 h-4" />}
                  />
                )}
                {player.exitVelo && (
                  <ScoutCardMetricTile 
                    value={player.exitVelo} 
                    label="Exit Velo" 
                    unit="mph"
                    badge={player.exitVelo >= 95 ? 'D1 Range' : undefined}
                    icon={<Zap className="w-4 h-4" />}
                  />
                )}
                {player.popTime && (
                  <ScoutCardMetricTile 
                    value={player.popTime} 
                    label="Pop Time" 
                    unit="sec"
                    badge={player.popTime <= 1.95 ? 'Elite' : undefined}
                    icon={<Timer className="w-4 h-4" />}
                  />
                )}
                {player.infVelo && (
                  <ScoutCardMetricTile 
                    value={player.infVelo} 
                    label="IF Velo" 
                    unit="mph"
                    icon={<Gauge className="w-4 h-4" />}
                  />
                )}
                {player.ofVelo && (
                  <ScoutCardMetricTile 
                    value={player.ofVelo} 
                    label="OF Velo" 
                    unit="mph"
                    icon={<Gauge className="w-4 h-4" />}
                  />
                )}
              </>
            )}
          </div>
          
          {/* No metrics placeholder */}
          {!isPitcher && !player.sixtyYard && !player.exitVelo && !player.popTime && (
            <p className="text-sm text-slate-400 text-center py-4">No metrics recorded yet</p>
          )}
          {isPitcher && !player.fbVelo && !player.slVelo && (
            <p className="text-sm text-slate-400 text-center py-4">No metrics recorded yet</p>
          )}
        </ScoutCardSection>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3: RECRUITING SNAPSHOT
        ═══════════════════════════════════════════════════════════════════ */}
        <ScoutCardSection title="Recruiting Snapshot">
          {/* Current Status */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-600 dark:text-slate-400">Current Status</span>
            {player.pipelineStatus ? (
              <ScoutCardStatusPill status={player.pipelineStatus} />
            ) : (
              <span className="text-sm text-slate-400">Not in pipeline</span>
            )}
          </div>

          {/* Internal Labels */}
          {player.internalLabels && player.internalLabels.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase text-slate-400 tracking-wide mb-1.5">Labels</p>
              <div className="flex flex-wrap gap-1">
                {player.internalLabels.map((label, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Region */}
          {player.state && (
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {location || player.state}
              </span>
            </div>
          )}

          {/* Interested Schools */}
          {player.interestedSchools && player.interestedSchools.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase text-slate-400 tracking-wide mb-1.5">Schools Interested In</p>
              <div className="flex items-center gap-1">
                {player.interestedSchools.slice(0, 3).map(school => (
                  <div 
                    key={school.id}
                    className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-medium text-slate-600 dark:text-slate-300"
                    title={school.name}
                  >
                    {school.name.slice(0, 2).toUpperCase()}
                  </div>
                ))}
                {player.interestedSchools.length > 3 && (
                  <span className="text-xs text-slate-500 ml-1">
                    +{player.interestedSchools.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <Button 
              size="sm" 
              variant="ghost" 
              className="gap-1.5 h-8 text-xs"
              onClick={() => setShowNoteInput(true)}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Add Note
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="gap-1.5 h-8 text-xs"
              onClick={handleOpenInPlanner}
            >
              <Target className="w-3.5 h-3.5" />
              View in Planner
            </Button>
          </div>

          {/* Note Input */}
          {showNoteInput && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <Textarea
                placeholder="Add a private note about this recruit..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="mb-2 text-sm"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowNoteInput(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddNote} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Save Note
                </Button>
              </div>
            </div>
          )}
        </ScoutCardSection>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4: YOUR ACTIVITY
        ═══════════════════════════════════════════════════════════════════ */}
        <ScoutCardSection title="Your Activity">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">
                Viewed by staff
              </span>
              <span className="ml-auto font-medium text-slate-800 dark:text-white">
                {player.profileViews || 0} times
              </span>
            </div>
            
            {player.lastViewedAt && (
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  Last opened
                </span>
                <span className="ml-auto font-medium text-slate-800 dark:text-white">
                  {player.lastViewedAt}
                </span>
              </div>
            )}

            {player.lastNoteDate && (
              <div className="flex items-center gap-3 text-sm">
                <ClipboardList className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  Last note by {player.lastNoteAuthor || 'Staff'}
                </span>
                <span className="ml-auto font-medium text-slate-800 dark:text-white">
                  {player.lastNoteDate}
                </span>
              </div>
            )}

            {player.addedToWatchlistAt && (
              <div className="flex items-center gap-3 text-sm">
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  Added to pipeline
                </span>
                <span className="ml-auto font-medium text-slate-800 dark:text-white">
                  {player.addedToWatchlistAt}
                </span>
              </div>
            )}
          </div>

          {/* Recent Notes */}
          {player.notes && player.notes.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-[10px] uppercase text-slate-400 tracking-wide mb-2">Recent Notes</p>
              <div className="space-y-2">
                {player.notes.slice(0, 2).map(note => (
                  <div 
                    key={note.id} 
                    className="text-sm p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                  >
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{note.content}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      {note.authorName || note.authorInitials} • {note.createdAt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScoutCardSection>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5: LINKED CONTEXT
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="px-4 pb-4 space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-between h-11"
            onClick={handleViewProfile}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Open Full Profile
            </span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </Button>

          {player.highSchool && player.highSchoolId && (
            <Button 
              variant="ghost" 
              className="w-full justify-between h-10 text-slate-600"
              onClick={handleViewHighSchool}
            >
              <span className="flex items-center gap-2">
                <School className="w-4 h-4" />
                View {player.highSchool}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Button>
          )}

          {(player.showcaseTeam || player.travelTeam) && player.showcaseTeamId && (
            <Button 
              variant="ghost" 
              className="w-full justify-between h-10 text-slate-600"
              onClick={handleViewShowcaseTeam}
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                View {player.showcaseTeam || player.travelTeam}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Button>
          )}
        </div>
      </div>
    </ScoutCardShell>
  );
}
