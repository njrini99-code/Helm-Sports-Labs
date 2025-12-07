'use client';

import { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Calendar,
  Ruler,
  Weight,
  Star,
  Eye,
  Plus,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PlayerData {
  id: string;
  name: string;
  avatarUrl?: string | null;
  gradYear?: number;
  state?: string;
  city?: string;
  primaryPosition: string;
  secondaryPosition?: string;
  height?: string;
  weight?: number;
  bats?: 'L' | 'R' | 'S';
  throws?: 'L' | 'R';
  gpa?: number;
  metrics?: string[];
  verified?: boolean;
  trending?: boolean;
  topSchool?: string;
  rating?: number;
  committed?: boolean;
  committedTo?: string;
}

export type PlayerCardSize = 'sm' | 'md' | 'lg';
export type PlayerCardVariant = 'default' | 'compact' | 'detailed' | 'minimal';

export interface PlayerCardProps {
  player: PlayerData;
  /** Card size variant */
  size?: PlayerCardSize;
  /** Card style variant */
  variant?: PlayerCardVariant;
  /** Loading state */
  loading?: boolean;
  /** Animation index for stagger effect */
  index?: number;
  /** Disable hover animations */
  disableHover?: boolean;
  /** Disable entry animation */
  disableAnimation?: boolean;
  /** Custom stagger delay in ms */
  staggerDelay?: number;
  /** Show action buttons */
  showActions?: boolean;
  /** Add to watchlist callback */
  onAddToWatchlist?: (id: string) => void;
  /** View player callback */
  onView?: (id: string) => void;
  /** Custom action element */
  customAction?: ReactNode;
  /** Additional class names */
  className?: string;
  /** Already on watchlist */
  isOnWatchlist?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const SIZE_STYLES: Record<PlayerCardSize, {
  padding: string;
  avatar: string;
  title: string;
  badge: string;
}> = {
  sm: {
    padding: 'p-3',
    avatar: 'h-10 w-10',
    title: 'text-sm',
    badge: 'text-[10px] px-1.5 py-0',
  },
  md: {
    padding: 'p-4',
    avatar: 'h-12 w-12',
    title: 'text-base',
    badge: 'text-xs px-2 py-0.5',
  },
  lg: {
    padding: 'p-5',
    avatar: 'h-14 w-14',
    title: 'text-lg',
    badge: 'text-sm px-2.5 py-1',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SKELETON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function PlayerCardSkeleton({ size = 'md' }: { size?: PlayerCardSize }) {
  const styles = SIZE_STYLES[size];

  return (
    <GlassCard className={cn(styles.padding, 'animate-pulse')} disableHover>
      <div className="flex items-start gap-3">
        {/* Avatar skeleton */}
        <div className={cn(styles.avatar, 'rounded-xl bg-white/10')} />

        {/* Content skeleton */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-white/10 rounded w-24" />
            <div className="h-4 bg-white/10 rounded w-12" />
          </div>
          <div className="flex gap-2">
            <div className="h-3 bg-white/10 rounded w-16" />
            <div className="h-3 bg-white/10 rounded w-20" />
          </div>
          <div className="flex gap-1.5 pt-1">
            <div className="h-5 bg-white/10 rounded w-14" />
            <div className="h-5 bg-white/10 rounded w-16" />
            <div className="h-5 bg-white/10 rounded w-12" />
          </div>
        </div>

        {/* Action skeleton */}
        <div className="flex flex-col gap-1.5">
          <div className="h-7 bg-white/10 rounded w-20" />
          <div className="h-7 bg-white/10 rounded w-20" />
        </div>
      </div>
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED STAT ITEM
// ═══════════════════════════════════════════════════════════════════════════

function AnimatedStatBadge({
  children,
  index,
  staggerDelay = 50,
  disableAnimation = false,
}: {
  children: ReactNode;
  index: number;
  staggerDelay?: number;
  disableAnimation?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(disableAnimation);

  useEffect(() => {
    if (disableAnimation) return;
    const timer = setTimeout(() => setIsVisible(true), index * staggerDelay);
    return () => clearTimeout(timer);
  }, [index, staggerDelay, disableAnimation]);

  return (
    <div
      className={cn(
        'transition-all duration-300',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2'
      )}
      style={{
        transitionDelay: disableAnimation ? '0ms' : `${index * staggerDelay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAYER CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function PlayerCard({
  player,
  size = 'md',
  variant = 'default',
  loading = false,
  index = 0,
  disableHover = false,
  disableAnimation = false,
  staggerDelay = 50,
  showActions = true,
  onAddToWatchlist,
  onView,
  customAction,
  className,
  isOnWatchlist = false,
}: PlayerCardProps) {
  const [isVisible, setIsVisible] = useState(disableAnimation);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);

  const styles = SIZE_STYLES[size];

  // Entry animation
  useEffect(() => {
    if (disableAnimation) return;
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index, disableAnimation]);

  // Show skeleton when loading
  if (loading) {
    return <PlayerCardSkeleton size={size} />;
  }

  // Generate initials from name
  const initials = player.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Format location
  const location = [player.city, player.state].filter(Boolean).join(', ');

  // Collect stats/metrics for display
  const allMetrics: string[] = [];
  if (player.height) allMetrics.push(player.height);
  if (player.weight) allMetrics.push(`${player.weight} lbs`);
  if (player.bats && player.throws) allMetrics.push(`B/T: ${player.bats}/${player.throws}`);
  if (player.gpa) allMetrics.push(`GPA: ${player.gpa.toFixed(2)}`);
  if (player.metrics) allMetrics.push(...player.metrics);

  return (
    <div
      className={cn(
        'transition-all duration-500',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-5',
        className
      )}
      style={{
        transitionDelay: disableAnimation ? '0ms' : `${index * 100}ms`,
      }}
    >
      <GlassCard
        size="full"
        className={styles.padding}
        disableHover={disableHover}
        hoverScale={1.02}
        hoverY={-4}
      >
        <div className="flex items-start gap-3">
          {/* Avatar with hover scale */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
          >
            <Avatar
              className={cn(
                styles.avatar,
                'rounded-xl transition-transform duration-300 ease-out',
                isAvatarHovered && 'scale-110'
              )}
            >
              {player.avatarUrl ? (
                <AvatarImage
                  src={player.avatarUrl}
                  alt={player.name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback
                className={cn(
                  'rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20',
                  'text-emerald-400 font-medium',
                  size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
                )}
              >
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Rating badge */}
            {player.rating && (
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-slate-900">
                {player.rating}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name & badges row */}
            <div className="flex flex-wrap items-center gap-1.5">
              <p className={cn('font-semibold text-white truncate', styles.title)}>
                {player.name}
              </p>
              {player.gradYear && (
                <Badge
                  variant="outline"
                  className={cn(styles.badge, 'bg-white/5 border-white/20 text-slate-300')}
                >
                  {player.gradYear}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={cn(styles.badge, 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400')}
              >
                {player.primaryPosition}
              </Badge>
              {player.secondaryPosition && variant !== 'minimal' && (
                <Badge
                  variant="outline"
                  className={cn(styles.badge, 'bg-white/5 border-white/20 text-slate-400')}
                >
                  {player.secondaryPosition}
                </Badge>
              )}
            </div>

            {/* Status badges */}
            {(player.verified || player.trending || player.committed) && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {player.verified && (
                  <AnimatedStatBadge index={0} staggerDelay={staggerDelay} disableAnimation={disableAnimation}>
                    <Badge className={cn(styles.badge, 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 gap-0.5')}>
                      <Sparkles className="w-2.5 h-2.5" /> Verified
                    </Badge>
                  </AnimatedStatBadge>
                )}
                {player.trending && (
                  <AnimatedStatBadge index={1} staggerDelay={staggerDelay} disableAnimation={disableAnimation}>
                    <Badge className={cn(styles.badge, 'bg-blue-500/20 text-blue-400 border-blue-500/40 gap-0.5')}>
                      <TrendingUp className="w-2.5 h-2.5" /> Trending
                    </Badge>
                  </AnimatedStatBadge>
                )}
                {player.committed && player.committedTo && (
                  <AnimatedStatBadge index={2} staggerDelay={staggerDelay} disableAnimation={disableAnimation}>
                    <Badge className={cn(styles.badge, 'bg-purple-500/20 text-purple-400 border-purple-500/40 gap-0.5')}>
                      <CheckCircle2 className="w-2.5 h-2.5" /> {player.committedTo}
                    </Badge>
                  </AnimatedStatBadge>
                )}
              </div>
            )}

            {/* Location */}
            {location && variant !== 'minimal' && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {location}
              </p>
            )}

            {/* Metrics with stagger animation */}
            {allMetrics.length > 0 && variant !== 'minimal' && variant !== 'compact' && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {allMetrics.slice(0, 4).map((metric, idx) => (
                  <AnimatedStatBadge
                    key={idx}
                    index={idx + 3}
                    staggerDelay={staggerDelay}
                    disableAnimation={disableAnimation}
                  >
                    <Badge
                      variant="outline"
                      className={cn(styles.badge, 'bg-slate-800/50 border-slate-700/50 text-slate-300')}
                    >
                      {metric}
                    </Badge>
                  </AnimatedStatBadge>
                ))}
                {allMetrics.length > 4 && (
                  <AnimatedStatBadge index={7} staggerDelay={staggerDelay} disableAnimation={disableAnimation}>
                    <Badge
                      variant="outline"
                      className={cn(styles.badge, 'bg-slate-800/50 border-slate-700/50 text-slate-500')}
                    >
                      +{allMetrics.length - 4} more
                    </Badge>
                  </AnimatedStatBadge>
                )}
              </div>
            )}

            {/* Top school interest */}
            {player.topSchool && variant === 'detailed' && (
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                Top: {player.topSchool}
              </p>
            )}
          </div>

          {/* Actions */}
          {showActions && (customAction || onAddToWatchlist || onView) && (
            <div className="flex flex-col gap-1.5 shrink-0">
              {customAction}
              {!customAction && onAddToWatchlist && (
                <Button
                  size="sm"
                  className={cn(
                    'text-[10px] h-7 px-2 gap-1',
                    isOnWatchlist
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  )}
                  onClick={() => onAddToWatchlist(player.id)}
                >
                  {isOnWatchlist ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" /> Watchlist
                    </>
                  )}
                </Button>
              )}
              {!customAction && onView && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] h-7 px-2 bg-white/5 border-white/20 text-white hover:bg-white/10 gap-1"
                  onClick={() => onView(player.id)}
                >
                  <Eye className="w-3 h-3" /> View
                </Button>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAYER CARD LIST WITH STAGGER
// ═══════════════════════════════════════════════════════════════════════════

export interface PlayerCardListProps {
  players: PlayerData[];
  loading?: boolean;
  loadingCount?: number;
  size?: PlayerCardSize;
  variant?: PlayerCardVariant;
  showActions?: boolean;
  onAddToWatchlist?: (id: string) => void;
  onView?: (id: string) => void;
  watchlistIds?: string[];
  className?: string;
  emptyMessage?: string;
  gap?: 'sm' | 'md' | 'lg';
}

const GAP_STYLES = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

export function PlayerCardList({
  players,
  loading = false,
  loadingCount = 3,
  size = 'md',
  variant = 'default',
  showActions = true,
  onAddToWatchlist,
  onView,
  watchlistIds = [],
  className,
  emptyMessage = 'No players found',
  gap = 'md',
}: PlayerCardListProps) {
  if (loading) {
    return (
      <div className={cn('flex flex-col', GAP_STYLES[gap], className)}>
        {Array.from({ length: loadingCount }).map((_, i) => (
          <PlayerCardSkeleton key={i} size={size} />
        ))}
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', GAP_STYLES[gap], className)}>
      {players.map((player, index) => (
        <PlayerCard
          key={player.id}
          player={player}
          index={index}
          size={size}
          variant={variant}
          showActions={showActions}
          onAddToWatchlist={onAddToWatchlist}
          onView={onView}
          isOnWatchlist={watchlistIds.includes(player.id)}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { PlayerCardSkeleton };
export default PlayerCard;
