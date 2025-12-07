'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Eye, 
  UserPlus, 
  Star, 
  Heart, 
  Calendar, 
  MessageSquare,
  ChevronRight,
  Bookmark,
  LucideIcon,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════
export type ActivityType = 'follow' | 'view' | 'top5' | 'camp' | 'message' | 'watchlist' | 'interest';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar?: string | null;
    position?: string;
    gradYear?: number;
    state?: string;
  };
  action: string;
  time: string;
  entityId?: string;
}

export interface ActivityCardProps {
  activity: ActivityItem;
  /** Whether dark mode is enabled */
  isDark?: boolean;
  /** Click handler for view action */
  onView?: (entityId: string) => void;
  /** Click handler for watchlist action */
  onWatchlist?: (entityId: string) => void;
  /** Whether the item is in the watchlist */
  isInWatchlist?: boolean;
  /** Show action buttons */
  showActions?: boolean;
  /** Additional className */
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Activity Type Config
// ═══════════════════════════════════════════════════════════════════════════
const ACTIVITY_CONFIG: Record<ActivityType, { icon: LucideIcon; color: string; bgColor: string }> = {
  follow: { 
    icon: UserPlus, 
    color: 'text-emerald-500', 
    bgColor: 'bg-emerald-500/10' 
  },
  view: { 
    icon: Eye, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10' 
  },
  top5: { 
    icon: Star, 
    color: 'text-amber-500', 
    bgColor: 'bg-amber-500/10' 
  },
  camp: { 
    icon: Calendar, 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-500/10' 
  },
  message: { 
    icon: MessageSquare, 
    color: 'text-pink-500', 
    bgColor: 'bg-pink-500/10' 
  },
  watchlist: { 
    icon: Bookmark, 
    color: 'text-cyan-500', 
    bgColor: 'bg-cyan-500/10' 
  },
  interest: { 
    icon: Heart, 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10' 
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════
export function ActivityCard({
  activity,
  isDark = false,
  onView,
  onWatchlist,
  isInWatchlist = false,
  showActions = true,
  className,
}: ActivityCardProps) {
  const config = ACTIVITY_CONFIG[activity.type] || ACTIVITY_CONFIG.view;
  const Icon = config.icon;

  const initials = activity.user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div 
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer',
        isDark 
          ? 'hover:bg-slate-700/30' 
          : 'hover:bg-slate-50',
        className
      )}
    >
      {/* Avatar with type indicator */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10 ring-2 ring-white/10">
          <AvatarImage src={activity.user.avatar ?? undefined} />
          <AvatarFallback className={cn(
            'text-sm font-medium',
            isDark ? 'bg-slate-700 text-white' : 'bg-emerald-100 text-emerald-700'
          )}>
            {initials}
          </AvatarFallback>
        </Avatar>
        {/* Type badge */}
        <div className={cn(
          'absolute -bottom-1 -right-1 p-1 rounded-full',
          config.bgColor
        )}>
          <Icon className={cn('w-3 h-3', config.color)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm',
          isDark ? 'text-white' : 'text-slate-800'
        )}>
          <span className="font-medium">{activity.user.name}</span>
          <span className={cn(
            'ml-1',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}>
            {activity.action}
          </span>
        </p>
        
        {/* Meta info */}
        <div className="flex items-center gap-2 mt-0.5">
          {activity.user.position && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-[10px] px-1.5 py-0',
                isDark ? 'border-slate-600' : ''
              )}
            >
              {activity.user.position}
            </Badge>
          )}
          {activity.user.gradYear && (
            <span className={cn(
              'text-[10px]',
              isDark ? 'text-slate-500' : 'text-slate-400'
            )}>
              Class of {activity.user.gradYear}
            </span>
          )}
          {activity.user.state && (
            <span className={cn(
              'text-[10px]',
              isDark ? 'text-slate-500' : 'text-slate-400'
            )}>
              {activity.user.state}
            </span>
          )}
          <span className={cn(
            'text-[10px]',
            isDark ? 'text-slate-600' : 'text-slate-400'
          )}>
            {activity.time}
          </span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {onView && activity.entityId && (
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                'h-7 px-2 text-xs gap-1',
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onView(activity.entityId!);
              }}
            >
              View
              <ChevronRight className="w-3 h-3" />
            </Button>
          )}
          {onWatchlist && activity.entityId && (
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                'h-7 w-7 p-0',
                isInWatchlist 
                  ? 'text-amber-500 hover:text-amber-600' 
                  : isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-800'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onWatchlist(activity.entityId!);
              }}
            >
              <Bookmark className={cn('w-4 h-4', isInWatchlist && 'fill-current')} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Activity List Component
// ═══════════════════════════════════════════════════════════════════════════
export interface ActivityListProps {
  activities: ActivityItem[];
  isDark?: boolean;
  onView?: (entityId: string) => void;
  onWatchlist?: (entityId: string) => void;
  watchlistIds?: Set<string>;
  showActions?: boolean;
  emptyMessage?: string;
  maxItems?: number;
  className?: string;
}

export function ActivityList({
  activities,
  isDark = false,
  onView,
  onWatchlist,
  watchlistIds = new Set(),
  showActions = true,
  emptyMessage = 'No recent activity',
  maxItems,
  className,
}: ActivityListProps) {
  const displayedActivities = maxItems ? activities.slice(0, maxItems) : activities;

  if (activities.length === 0) {
    return (
      <div className={cn(
        'text-center py-8',
        isDark ? 'text-slate-500' : 'text-slate-400'
      )}>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {displayedActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          isDark={isDark}
          onView={onView}
          onWatchlist={onWatchlist}
          isInWatchlist={activity.entityId ? watchlistIds.has(activity.entityId) : false}
          showActions={showActions}
        />
      ))}
    </div>
  );
}

export default ActivityCard;


