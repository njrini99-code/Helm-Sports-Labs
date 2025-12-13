'use client';

import { motion } from 'framer-motion';
import { Users, ChevronRight, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface RosterPlayer {
  id: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  primary_position?: string | null;
  grad_year?: number | null;
  jersey_number?: number | null;
  high_school_state?: string | null;
  metadata?: Record<string, any>;
}

export interface RosterListProps {
  /** Array of players to display */
  players: RosterPlayer[];

  /** Show loading state */
  loading?: boolean;

  /** Title for the roster */
  title?: string;

  /** Show search bar */
  searchable?: boolean;

  /** Max players to display initially */
  maxPlayers?: number;

  /** "View All" link path */
  viewAllLink?: string;

  /** "Add Player" link path */
  addPlayerLink?: string;

  /** Dark theme */
  isDark?: boolean;

  /** Click handler for player row */
  onPlayerClick?: (player: RosterPlayer) => void;

  /** Show jersey numbers */
  showJersey?: boolean;

  /** Show grad year */
  showGradYear?: boolean;

  /** Show state */
  showState?: boolean;

  /** Additional className */
  className?: string;

  /** Empty state message */
  emptyMessage?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function RosterList({
  players,
  loading = false,
  title = 'Team Roster',
  searchable = false,
  maxPlayers = 6,
  viewAllLink,
  addPlayerLink,
  isDark = true,
  onPlayerClick,
  showJersey = false,
  showGradYear = true,
  showState = false,
  className,
  emptyMessage = 'No players on roster yet',
}: RosterListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and limit players
  const displayPlayers = useMemo(() => {
    let filtered = players;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = players.filter(player => {
        const fullName = player.full_name || `${player.first_name || ''} ${player.last_name || ''}`.trim();
        return fullName.toLowerCase().includes(query) ||
               player.primary_position?.toLowerCase().includes(query) ||
               player.jersey_number?.toString().includes(query);
      });
    }

    // Limit to maxPlayers
    return filtered.slice(0, maxPlayers);
  }, [players, searchQuery, maxPlayers]);

  const totalPlayers = players.length;
  const filteredCount = searchQuery ? displayPlayers.length : totalPlayers;

  if (loading) {
    return (
      <Card className={cn(
        'overflow-hidden',
        isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50 shadow-sm',
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('p-2 rounded-lg', isDark ? 'bg-blue-500/10' : 'bg-blue-100')}>
                <Users className={cn('w-4 h-4', isDark ? 'text-blue-400' : 'text-blue-600')} />
              </div>
              <div>
                <CardTitle className={cn('text-base', isDark ? 'text-white' : 'text-slate-800')}>
                  {title}
                </CardTitle>
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Loading...
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn(
                'p-3 rounded-xl animate-pulse',
                isDark ? 'bg-slate-700/30' : 'bg-slate-100'
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn('h-10 w-10 rounded-full', isDark ? 'bg-slate-600' : 'bg-slate-200')} />
                  <div className="flex-1">
                    <div className={cn('h-4 rounded mb-2', isDark ? 'bg-slate-600' : 'bg-slate-200')} />
                    <div className={cn('h-3 rounded w-1/2', isDark ? 'bg-slate-600' : 'bg-slate-200')} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'overflow-hidden',
      isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50 shadow-sm',
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-lg', isDark ? 'bg-blue-500/10' : 'bg-blue-100')}>
            <Users className={cn('w-4 h-4', isDark ? 'text-blue-400' : 'text-blue-600')} />
          </div>
          <div>
            <CardTitle className={cn('text-base', isDark ? 'text-white' : 'text-slate-800')}>
              {title}
            </CardTitle>
            <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
              {filteredCount} {filteredCount === 1 ? 'player' : 'players'}
            </p>
          </div>
        </div>
        {viewAllLink && (
          <Link href={viewAllLink}>
            <Button variant="ghost" size="sm" className={cn(
              'gap-1',
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
            )}>
              View All <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </CardHeader>

      <CardContent>
        {/* Search Bar */}
        {searchable && players.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <Search className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )} />
              <Input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'pl-9',
                  isDark
                    ? 'bg-slate-700/30 border-slate-600 text-white placeholder:text-slate-400'
                    : 'bg-white border-slate-200'
                )}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {displayPlayers.length === 0 && !searchQuery && (
          <div className="text-center py-8">
            <Users className={cn(
              'w-12 h-12 mx-auto mb-3',
              isDark ? 'text-slate-600' : 'text-slate-400'
            )} />
            <p className={cn('text-sm mb-3', isDark ? 'text-slate-400' : 'text-slate-500')}>
              {emptyMessage}
            </p>
            {addPlayerLink && (
              <Link href={addPlayerLink}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Players
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* No Search Results */}
        {displayPlayers.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <Search className={cn(
              'w-12 h-12 mx-auto mb-3',
              isDark ? 'text-slate-600' : 'text-slate-400'
            )} />
            <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
              No players found for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Player List */}
        {displayPlayers.length > 0 && (
          <div className="space-y-2">
            {displayPlayers.map((player, index) => (
              <RosterPlayerRow
                key={player.id}
                player={player}
                index={index}
                isDark={isDark}
                showJersey={showJersey}
                showGradYear={showGradYear}
                showState={showState}
                onClick={onPlayerClick}
              />
            ))}
          </div>
        )}

        {/* Show More Indicator */}
        {!searchQuery && players.length > maxPlayers && viewAllLink && (
          <div className="mt-4 text-center">
            <Link href={viewAllLink}>
              <Button variant="ghost" size="sm" className={cn(
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
              )}>
                View all {players.length} players
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Roster Player Row Component
// ═══════════════════════════════════════════════════════════════════════════

interface RosterPlayerRowProps {
  player: RosterPlayer;
  index: number;
  isDark: boolean;
  showJersey: boolean;
  showGradYear: boolean;
  showState: boolean;
  onClick?: (player: RosterPlayer) => void;
}

function RosterPlayerRow({
  player,
  index,
  isDark,
  showJersey,
  showGradYear,
  showState,
  onClick,
}: RosterPlayerRowProps) {
  const fullName = player.full_name || `${player.first_name || ''} ${player.last_name || ''}`.trim() || 'Player';
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'P';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        'flex items-center justify-between p-3 rounded-xl transition-colors',
        isDark ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-slate-50 hover:bg-slate-100',
        onClick && 'cursor-pointer'
      )}
      onClick={() => onClick?.(player)}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Jersey Number */}
        {showJersey && player.jersey_number && (
          <div className={cn(
            'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
            isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
          )}>
            #{player.jersey_number}
          </div>
        )}

        {/* Avatar */}
        <Avatar className="h-10 w-10 ring-2 ring-white/10 flex-shrink-0">
          <AvatarImage src={player.avatar_url || undefined} />
          <AvatarFallback className={cn(
            'text-sm font-medium',
            isDark ? 'bg-slate-600 text-white' : 'bg-blue-100 text-blue-700'
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium truncate', isDark ? 'text-white' : 'text-slate-800')}>
            {fullName}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {player.primary_position && (
              <Badge variant="outline" className={cn(
                'text-[10px] px-1.5',
                isDark ? 'border-slate-600' : ''
              )}>
                {player.primary_position}
              </Badge>
            )}
            {showGradYear && player.grad_year && (
              <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Class of {player.grad_year}
              </span>
            )}
            {showState && player.high_school_state && (
              <span className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {player.high_school_state}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chevron */}
      {onClick && (
        <ChevronRight className={cn(
          'w-4 h-4 flex-shrink-0',
          isDark ? 'text-slate-500' : 'text-slate-400'
        )} />
      )}
    </motion.div>
  );
}
