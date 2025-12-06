'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RecruitPipelineEntry } from '@/lib/queries/recruits';
import { useRouter } from 'next/navigation';

type StatusFilter = RecruitPipelineEntry['status'] | 'all';
type GradFilter = number | 'all';

export interface RecruitingDiamondProps {
  playersByPosition: Record<string, RecruitPipelineEntry[]>;
  statusFilter: StatusFilter;
  gradYearFilter?: GradFilter;
  onPlayerClick: (playerId: string) => void;
  onStatusFilterChange?: (status: StatusFilter) => void;
  isDarkMode?: boolean;
}

// Position configurations for realistic baseball diamond placement
const POSITIONS = [
  { code: 'CF', label: 'CF', left: '50%', top: '5%' },
  { code: 'LF', label: 'LF', left: '15%', top: '12%' },
  { code: 'RF', label: 'RF', left: '85%', top: '12%' },
  { code: '2B', label: '2B', left: '60%', top: '26%' },
  { code: 'SS', label: 'SS', left: '40%', top: '30%' },
  { code: '3B', label: '3B', left: '22%', top: '48%' },
  { code: '1B', label: '1B', left: '78%', top: '48%' },
  { code: 'P', label: 'P', left: '50%', top: '46%' },
  { code: 'C', label: 'C', left: '50%', top: '76%' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'watchlist', label: 'Watchlist' },
  { value: 'high_priority', label: 'High Priority' },
  { value: 'offer_extended', label: 'Offer Extended' },
  { value: 'committed', label: 'Committed' },
  { value: 'uninterested', label: 'Uninterested' },
];

const STATUS_LABELS: Record<string, string> = {
  watchlist: 'Watch',
  high_priority: 'Priority',
  offer_extended: 'Offer',
  committed: 'Commit',
  uninterested: 'Pass',
};

export function RecruitingDiamond({
  playersByPosition,
  statusFilter,
  gradYearFilter = 'all',
  onPlayerClick,
  onStatusFilterChange,
  isDarkMode = false,
}: RecruitingDiamondProps) {
  const router = useRouter();

  // Filter players by status and grad year
  const filteredByPosition = useMemo(() => {
    const result: typeof playersByPosition = {};
    Object.entries(playersByPosition).forEach(([pos, entries]) => {
      const filtered = entries.filter((entry) => {
        const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
        const matchesGrad = gradYearFilter === 'all' || entry.player.grad_year === gradYearFilter;
        return matchesStatus && matchesGrad;
      });
      result[pos.toUpperCase()] = filtered;
    });
    return result;
  }, [playersByPosition, statusFilter, gradYearFilter]);

  const handlePlayerClick = (id: string) => {
    onPlayerClick(id);
    router.push(`/coach/player/${id}`);
  };

  // Theme classes
  const cardBg = isDarkMode 
    ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700/50' 
    : 'bg-white/90 border-emerald-100 shadow-xl shadow-emerald-500/10';
  
  const diamondBg = isDarkMode
    ? 'bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900'
    : 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/50';

  const selectClass = isDarkMode
    ? 'bg-slate-700 border-slate-600 text-white'
    : 'bg-white border-emerald-200 text-slate-700';

  return (
    <Card className={`rounded-2xl border h-full flex flex-col backdrop-blur-sm ${cardBg}`}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Recruiting Diamond
          </CardTitle>
          {onStatusFilterChange && (
            <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}>
              <SelectTrigger className={`h-8 w-36 text-xs ${selectClass}`}>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col">
        {/* Diamond container - larger */}
        <div className={`relative w-full aspect-square rounded-2xl overflow-visible p-6 ${diamondBg}`}>
          {/* Subtle background gradient */}
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-[radial-gradient(circle_at_50%_55%,rgba(16,185,129,0.08),transparent_50%)]' : 'bg-[radial-gradient(circle_at_50%_55%,rgba(16,185,129,0.15),transparent_60%)]'}`} />
          
          {/* Outfield arc */}
          <div className={`absolute left-1/2 top-[30%] w-[85%] h-[45%] -translate-x-1/2 border-t rounded-t-full ${isDarkMode ? 'border-white/[0.08]' : 'border-emerald-200/60'}`} />
          
          {/* Infield diamond shape */}
          <div className={`absolute left-1/2 top-[52%] w-[40%] aspect-square -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-lg ${isDarkMode ? 'border border-white/[0.1]' : 'border-2 border-emerald-300/50'}`} />
          
          {/* Base paths */}
          <div className={`absolute left-1/2 top-[52%] w-[30%] aspect-square -translate-x-1/2 -translate-y-1/2 rotate-45 border border-dashed rounded ${isDarkMode ? 'border-white/[0.06]' : 'border-emerald-200/40'}`} />

          {/* Position columns */}
          {POSITIONS.map((pos) => (
            <PositionColumn
              key={pos.code}
              position={pos}
              players={filteredByPosition[pos.code] || []}
              onPlayerClick={handlePlayerClick}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Position column component with hover expansion
function PositionColumn({
  position,
  players,
  onPlayerClick,
  isDarkMode,
}: {
  position: { code: string; label: string; left: string; top: string };
  players: RecruitPipelineEntry[];
  onPlayerClick: (id: string) => void;
  isDarkMode: boolean;
}) {
  const displayPlayers = players.slice(0, 3);
  const extraCount = players.length - 3;

  const labelBg = isDarkMode 
    ? 'bg-slate-700/80 border-slate-600/50 text-white' 
    : 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30';

  const emptyBg = isDarkMode
    ? 'border-slate-600/50 text-slate-500'
    : 'border-emerald-200 text-slate-400 bg-white/50';

  const moreBg = isDarkMode
    ? 'bg-slate-700/50 text-slate-300 border-slate-600/50'
    : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  const panelBg = isDarkMode
    ? 'bg-slate-800/98 border-slate-700/80'
    : 'bg-white/98 border-emerald-100 shadow-xl shadow-emerald-500/10';

  return (
    <div
      className="group absolute flex flex-col items-center"
      style={{
        left: position.left,
        top: position.top,
        transform: 'translate(-50%, 0)',
      }}
    >
      {/* Position label badge */}
      <div className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border group-hover:scale-110 transition-all duration-200 ${labelBg}`}>
        {position.label}
      </div>

      {/* Compact player cards stack */}
      <div className="relative flex flex-col items-center gap-1 transition-all duration-200 group-hover:scale-105 group-hover:z-30">
        {players.length === 0 ? (
          <div className={`flex h-10 w-28 items-center justify-center rounded-xl border border-dashed text-[10px] ${emptyBg}`}>
            No players
          </div>
        ) : (
          <>
            {displayPlayers.map((entry) => (
              <CompactPlayerCard
                key={entry.id}
                entry={entry}
                onClick={() => onPlayerClick(entry.player.id)}
                isDarkMode={isDarkMode}
              />
            ))}
            {extraCount > 0 && (
              <div className={`rounded-full px-2.5 py-0.5 text-[10px] border ${moreBg}`}>
                +{extraCount} more
              </div>
            )}
          </>
        )}
      </div>

      {/* Hover-expanded panel */}
      {players.length > 0 && (
        <div
          className={`
            pointer-events-none absolute left-1/2 top-full mt-2 w-60 -translate-x-1/2 translate-y-2
            rounded-2xl border p-3 backdrop-blur-sm
            opacity-0 transition-all duration-200 z-50
            group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
            ${panelBg}
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{position.label} Position</span>
            <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{players.length} player{players.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="max-h-56 space-y-1.5 overflow-y-auto no-scrollbar">
            {players.map((entry) => (
              <ExpandedPlayerCard
                key={entry.id}
                entry={entry}
                onClick={() => onPlayerClick(entry.player.id)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact player card for the stack
function CompactPlayerCard({
  entry,
  onClick,
  isDarkMode,
}: {
  entry: RecruitPipelineEntry;
  onClick: () => void;
  isDarkMode: boolean;
}) {
  const { player, status } = entry;
  
  const initials = player.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const nameParts = player.full_name.split(' ');
  const shortenedName = nameParts.length > 1
    ? `${nameParts[0][0]}. ${nameParts[nameParts.length - 1]}`
    : player.full_name;

  const STATUS_COLORS_DARK: Record<string, string> = {
    watchlist: 'text-blue-400',
    high_priority: 'text-amber-400',
    offer_extended: 'text-purple-400',
    committed: 'text-emerald-400',
    uninterested: 'text-slate-500',
  };

  const STATUS_COLORS_LIGHT: Record<string, string> = {
    watchlist: 'text-blue-600',
    high_priority: 'text-amber-600',
    offer_extended: 'text-purple-600',
    committed: 'text-emerald-600',
    uninterested: 'text-slate-500',
  };

  const statusColors = isDarkMode ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT;

  const cardBg = isDarkMode
    ? 'bg-slate-700/90 border-slate-600/50 hover:bg-slate-600 hover:border-emerald-500/50'
    : 'bg-white border-emerald-100 shadow-sm hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md';

  const avatarBg = isDarkMode
    ? 'bg-emerald-500/20 text-emerald-300'
    : 'bg-emerald-500 text-white';

  return (
    <button
      onClick={onClick}
      className={`flex w-32 items-center gap-1.5 rounded-xl px-2 py-1.5 text-left border transition-all duration-200 ${cardBg}`}
    >
      <Avatar className="h-6 w-6 ring-1 ring-white/10 flex-shrink-0">
        <AvatarImage src={player.avatar_url ?? undefined} alt={player.full_name} />
        <AvatarFallback className={`text-[9px] font-medium ${avatarBg}`}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0 flex-1">
        <span className={`truncate text-[11px] font-medium leading-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          {shortenedName}
        </span>
        <span className={`text-[9px] leading-tight ${statusColors[status] || 'text-slate-400'}`}>
          '{String(player.grad_year).slice(-2)} • {STATUS_LABELS[status] || status}
        </span>
      </div>
    </button>
  );
}

// Expanded player card for hover panel
function ExpandedPlayerCard({
  entry,
  onClick,
  isDarkMode,
}: {
  entry: RecruitPipelineEntry;
  onClick: () => void;
  isDarkMode: boolean;
}) {
  const { player, status } = entry;
  
  const initials = player.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const STATUS_COLORS_DARK: Record<string, string> = {
    watchlist: 'text-blue-400',
    high_priority: 'text-amber-400',
    offer_extended: 'text-purple-400',
    committed: 'text-emerald-400',
    uninterested: 'text-slate-500',
  };

  const STATUS_COLORS_LIGHT: Record<string, string> = {
    watchlist: 'text-blue-600',
    high_priority: 'text-amber-600',
    offer_extended: 'text-purple-600',
    committed: 'text-emerald-600',
    uninterested: 'text-slate-500',
  };

  const STATUS_BG_DARK: Record<string, string> = {
    watchlist: 'bg-blue-500/10',
    high_priority: 'bg-amber-500/10',
    offer_extended: 'bg-purple-500/10',
    committed: 'bg-emerald-500/10',
    uninterested: 'bg-slate-500/10',
  };

  const STATUS_BG_LIGHT: Record<string, string> = {
    watchlist: 'bg-blue-50',
    high_priority: 'bg-amber-50',
    offer_extended: 'bg-purple-50',
    committed: 'bg-emerald-50',
    uninterested: 'bg-slate-50',
  };

  const statusColors = isDarkMode ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT;
  const statusBg = isDarkMode ? STATUS_BG_DARK : STATUS_BG_LIGHT;

  const cardBg = isDarkMode
    ? 'border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-700/50'
    : 'border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50';

  const avatarBg = isDarkMode
    ? 'bg-emerald-500/20 text-emerald-300'
    : 'bg-emerald-500 text-white';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left border transition-all duration-200 ${statusBg[status] || 'bg-white/5'} ${cardBg}`}
    >
      <Avatar className="h-8 w-8 ring-1 ring-white/10 flex-shrink-0">
        <AvatarImage src={player.avatar_url ?? undefined} alt={player.full_name} />
        <AvatarFallback className={`text-[10px] font-medium ${avatarBg}`}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0 flex-1">
        <span className={`truncate text-xs font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          {player.full_name}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {player.grad_year} • {player.high_school_state || 'N/A'}
          </span>
          <span className={`text-[10px] font-medium ${statusColors[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>
      </div>
    </button>
  );
}
