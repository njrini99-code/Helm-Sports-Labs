'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Users, MapPin, MessageSquare, ChevronRight, School, GraduationCap,
  Building2, Star, StarOff, Mail, Phone, ClipboardList, ExternalLink,
  Trophy, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  ScoutCardShell, 
  ScoutCardSection, 
  ScoutCardActions,
  ScoutCardInfoRow,
} from './scout-card-shell';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type TeamType = 'high_school' | 'showcase' | 'juco';

export interface TeamScoutCardData {
  id: string;
  name: string;
  logoUrl?: string;
  type: TeamType;
  city?: string;
  state?: string;
  classification?: string; // e.g., "4A", "5A" for HS, "17U" for showcase
  // Roster stats
  totalPlayers?: number;
  gradYearBreakdown?: { year: number; count: number }[];
  playersOnWatchlist?: number;
  // Recent commits
  recentCommits?: {
    id: string;
    playerName: string;
    position: string;
    schoolName: string;
    schoolLogoUrl?: string;
  }[];
  // Staff
  staff?: {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
  }[];
  // Top recruits
  topRecruits?: {
    id: string;
    name: string;
    position: string;
    gradYear: number;
    avatarUrl?: string;
  }[];
  // Relationship
  isFavorite?: boolean;
  notes?: { id: string; content: string; authorInitials: string; createdAt: string }[];
}

interface TeamScoutCardProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamScoutCardData | null;
  onToggleFavorite?: (teamId: string, isFavorite: boolean) => void;
  onAddNote?: (teamId: string, note: string) => void;
  onPlayerClick?: (playerId: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export function TeamScoutCard({
  isOpen,
  onClose,
  team,
  onToggleFavorite,
  onAddNote,
  onPlayerClick,
}: TeamScoutCardProps) {
  const router = useRouter();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  if (!team) return null;

  const initials = team.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const location = team.city && team.state ? `${team.city}, ${team.state}` : team.state;

  const typeLabels: Record<TeamType, string> = {
    high_school: 'High School',
    showcase: 'Showcase',
    juco: 'JUCO',
  };

  const typeColors: Record<TeamType, string> = {
    high_school: 'bg-blue-100 text-blue-700',
    showcase: 'bg-purple-100 text-purple-700',
    juco: 'bg-amber-100 text-amber-700',
  };

  // Handlers
  const handleViewTeamPage = () => {
    // Route to college coach's view of the team
    router.push(`/coach/college/teams/${team.id}`);
    onClose();
  };

  const handleViewRoster = () => {
    router.push(`/coach/college/discover?team=${team.id}`);
    onClose();
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(team.id, !team.isFavorite);
      toast.success(team.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    }
  };

  const handleMessageStaff = () => {
    if (team.staff && team.staff.length > 0) {
      const primaryStaff = team.staff.find(s => s.email);
      if (primaryStaff?.email) {
        window.location.href = `mailto:${primaryStaff.email}`;
      } else {
        toast.info('No email available for staff');
      }
    }
  };

  const handleAddNote = () => {
    if (noteText.trim() && onAddNote) {
      onAddNote(team.id, noteText);
      setNoteText('');
      setShowNoteInput(false);
      toast.success('Note added');
    }
  };

  // Header Content
  const headerContent = (
    <div className="flex items-start gap-3">
      {/* Logo/Avatar */}
      <Avatar className="h-14 w-14 rounded-xl flex-shrink-0">
        <AvatarImage src={team.logoUrl} className="rounded-xl object-contain p-1" />
        <AvatarFallback className={`rounded-xl text-lg font-bold ${
          team.type === 'high_school' ? 'bg-blue-500 text-white' :
          team.type === 'juco' ? 'bg-amber-500 text-white' : 'bg-purple-500 text-white'
        }`}>
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
          {team.name}
        </h2>
        
        {/* Type + Location */}
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="secondary" className={`text-[10px] ${typeColors[team.type]}`}>
            {typeLabels[team.type]}
          </Badge>
          {team.classification && (
            <span className="text-xs text-slate-500">{team.classification}</span>
          )}
        </div>

        {/* Location */}
        {location && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
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
      onOpenInNewTab={() => {
        // Route to college coach's view of the team
        window.open(`/coach/college/teams/${team.id}`, '_blank');
      }}
      onCopyLink={() => {
        // Route to college coach's view of the team
        navigator.clipboard.writeText(`${window.location.origin}/coach/college/teams/${team.id}`);
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
          onClick={handleViewTeamPage}
        >
          {team.type === 'high_school' ? <School className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
          View Team Page
        </Button>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="gap-1.5"
          onClick={handleToggleFavorite}
        >
          {team.isFavorite ? (
            <>
              <StarOff className="w-3.5 h-3.5 text-amber-500" />
              Unfavorite
            </>
          ) : (
            <>
              <Star className="w-3.5 h-3.5" />
              Favorite
            </>
          )}
        </Button>

        <Button size="sm" variant="ghost" className="gap-1.5" onClick={handleViewRoster}>
          <Users className="w-3.5 h-3.5" />
          View Roster
        </Button>

        {team.staff && team.staff.length > 0 && (
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={handleMessageStaff}>
            <MessageSquare className="w-3.5 h-3.5" />
            Message Staff
          </Button>
        )}
      </ScoutCardActions>

      {/* Content area */}
      <div className="py-3">
        {/* ═══════════════════════════════════════════════════════════════════
            ROSTER SNAPSHOT
        ═══════════════════════════════════════════════════════════════════ */}
        <ScoutCardSection title="Roster Snapshot">
          {/* Top Recruits Row */}
          {team.topRecruits && team.topRecruits.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] uppercase text-slate-400 tracking-wide mb-2">Top Recruits</p>
              <div className="flex -space-x-2">
                {team.topRecruits.slice(0, 5).map((player) => (
                  <button
                    key={player.id}
                    onClick={() => onPlayerClick?.(player.id)}
                    className="relative group"
                    title={`${player.name} - ${player.position} '${player.gradYear.toString().slice(-2)}`}
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-800 hover:ring-emerald-500 transition-all">
                      <AvatarImage src={player.avatarUrl} />
                      <AvatarFallback className="bg-emerald-500 text-white text-xs font-medium">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ))}
                {team.topRecruits.length > 5 && (
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-800 flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-500">+{team.topRecruits.length - 5}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{team.totalPlayers || 0}</p>
              <p className="text-xs text-slate-500">Total Players</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{team.playersOnWatchlist || 0}</p>
              <p className="text-xs text-slate-500">On Your Watchlist</p>
            </div>
          </div>

          {/* Grad Year Breakdown */}
          {team.gradYearBreakdown && team.gradYearBreakdown.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-[10px] uppercase text-slate-400 tracking-wide mb-2">By Class</p>
              <div className="flex flex-wrap gap-1.5">
                {team.gradYearBreakdown.map(({ year, count }) => (
                  <Badge key={year} variant="outline" className="text-xs">
                    '{year.toString().slice(-2)}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </ScoutCardSection>

        {/* ═══════════════════════════════════════════════════════════════════
            RECENT COMMITS
        ═══════════════════════════════════════════════════════════════════ */}
        {team.recentCommits && team.recentCommits.length > 0 && (
          <ScoutCardSection title="Recent Commits">
            <div className="space-y-2">
              {team.recentCommits.slice(0, 3).map((commit) => (
                <div 
                  key={commit.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => onPlayerClick?.(commit.id)}
                >
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                      {commit.playerName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {commit.position} → {commit.schoolName}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </ScoutCardSection>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STAFF SNAPSHOT
        ═══════════════════════════════════════════════════════════════════ */}
        {team.staff && team.staff.length > 0 && (
          <ScoutCardSection 
            title="Staff" 
            action={
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                <UserPlus className="w-3 h-3" />
                Add Contact
              </Button>
            }
          >
            <div className="space-y-2">
              {team.staff.slice(0, 3).map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {member.email && (
                      <a 
                        href={`mailto:${member.email}`} 
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="w-4 h-4 text-emerald-500" />
                      </a>
                    )}
                    {member.phone && (
                      <a 
                        href={`tel:${member.phone}`} 
                        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-4 h-4 text-emerald-500" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScoutCardSection>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            NOTES
        ═══════════════════════════════════════════════════════════════════ */}
        <ScoutCardSection title="Notes">
          {/* Existing Notes */}
          {team.notes && team.notes.length > 0 ? (
            <div className="space-y-2 mb-3">
              {team.notes.slice(0, 2).map(note => (
                <div 
                  key={note.id} 
                  className="text-sm p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                >
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2">{note.content}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {note.authorInitials} • {note.createdAt}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 mb-3">No notes yet</p>
          )}

          {/* Add Note */}
          {showNoteInput ? (
            <div>
              <Textarea
                placeholder="Add a note about this team..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="mb-2 text-sm"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowNoteInput(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddNote} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-full gap-1.5"
              onClick={() => setShowNoteInput(true)}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Add Note
            </Button>
          )}
        </ScoutCardSection>

        {/* ═══════════════════════════════════════════════════════════════════
            LINKED CONTEXT
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="px-4 pb-4 space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-between h-11"
            onClick={handleViewTeamPage}
          >
            <span className="flex items-center gap-2">
              {team.type === 'high_school' ? <School className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
              Open Full Team Page
            </span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between h-10 text-slate-600"
            onClick={handleViewRoster}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              View All {team.totalPlayers || ''} Players
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
      </div>
    </ScoutCardShell>
  );
}

