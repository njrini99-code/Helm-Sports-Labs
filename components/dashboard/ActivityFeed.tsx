'use client';

import { motion } from 'framer-motion';
import { Clock, Eye, Heart, MessageSquare, UserPlus, Trophy, Star, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export type ActivityType =
  | 'player_view'
  | 'profile_view'
  | 'college_follow'
  | 'offer_made'
  | 'message_sent'
  | 'message_received'
  | 'player_added'
  | 'achievement'
  | 'custom';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  created_at: string;
  actor?: {
    name?: string;
    avatar?: string | null;
  };
  metadata?: Record<string, any>;
}

export interface ActivityFeedProps {
  /** Activity items to display */
  items: ActivityItem[];

  /** Show loading state */
  loading?: boolean;

  /** Title for the feed */
  title?: string;

  /** Subtitle for the feed */
  subtitle?: string;

  /** Maximum items to display */
  maxItems?: number;

  /** Empty state message */
  emptyMessage?: string;

  /** Empty state icon */
  emptyIcon?: React.ReactNode;

  /** Dark theme */
  isDark?: boolean;

  /** Click handler for items */
  onItemClick?: (item: ActivityItem) => void;

  /** Additional className */
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Activity Icon Mapping
// ═══════════════════════════════════════════════════════════════════════════

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  player_view: Eye,
  profile_view: Eye,
  college_follow: UserPlus,
  offer_made: Star,
  message_sent: Mail,
  message_received: MessageSquare,
  player_added: UserPlus,
  achievement: Trophy,
  custom: Clock,
};

const ACTIVITY_COLORS: Record<ActivityType, { bg: string; text: string; border: string }> = {
  player_view: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  profile_view: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  college_follow: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
  offer_made: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  message_sent: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  message_received: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  player_added: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
  },
  achievement: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  custom: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export default function ActivityFeed({
  items,
  loading = false,
  title = 'Recent Activity',
  subtitle,
  maxItems = 10,
  emptyMessage = 'No recent activity',
  emptyIcon = '📭',
  isDark = true,
  onItemClick,
  className,
}: ActivityFeedProps) {
  const displayItems = items.slice(0, maxItems);

  if (loading) {
    return (
      <Card className={cn(
        'overflow-hidden',
        isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50 shadow-sm',
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', isDark ? 'bg-slate-500/10' : 'bg-slate-100')}>
              <Clock className={cn('w-4 h-4 animate-spin', isDark ? 'text-slate-400' : 'text-slate-600')} />
            </div>
            <div>
              <CardTitle className={cn('text-base', isDark ? 'text-white' : 'text-slate-800')}>
                {title}
              </CardTitle>
              {subtitle && (
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {subtitle}
                </p>
              )}
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
                <div className={cn('h-4 rounded mb-2', isDark ? 'bg-slate-600' : 'bg-slate-200')} />
                <div className={cn('h-3 rounded w-2/3', isDark ? 'bg-slate-600' : 'bg-slate-200')} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayItems.length === 0) {
    return (
      <Card className={cn(
        'overflow-hidden',
        isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/90 border-slate-200/50 shadow-sm',
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', isDark ? 'bg-slate-500/10' : 'bg-slate-100')}>
              <Clock className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-600')} />
            </div>
            <div>
              <CardTitle className={cn('text-base', isDark ? 'text-white' : 'text-slate-800')}>
                {title}
              </CardTitle>
              {subtitle && (
                <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">{emptyIcon}</div>
            <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
              {emptyMessage}
            </p>
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
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-lg', isDark ? 'bg-slate-500/10' : 'bg-slate-100')}>
            <Clock className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-600')} />
          </div>
          <div>
            <CardTitle className={cn('text-base', isDark ? 'text-white' : 'text-slate-800')}>
              {title}
            </CardTitle>
            {subtitle && (
              <p className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayItems.map((item, index) => (
            <ActivityFeedItem
              key={item.id}
              item={item}
              index={index}
              isDark={isDark}
              onClick={onItemClick}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Activity Feed Item Component
// ═══════════════════════════════════════════════════════════════════════════

interface ActivityFeedItemProps {
  item: ActivityItem;
  index: number;
  isDark: boolean;
  onClick?: (item: ActivityItem) => void;
}

function ActivityFeedItem({ item, index, isDark, onClick }: ActivityFeedItemProps) {
  const Icon = ACTIVITY_ICONS[item.type] || Clock;
  const colors = ACTIVITY_COLORS[item.type] || ACTIVITY_COLORS.custom;

  const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors',
        isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50',
        onClick && 'cursor-pointer'
      )}
      onClick={() => onClick?.(item)}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 p-2 rounded-lg border',
        colors.bg,
        colors.border
      )}>
        <Icon className={cn('w-4 h-4', colors.text)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title with Actor */}
        <div className="flex items-center gap-2 mb-1">
          {item.actor?.avatar && (
            <Avatar className="h-5 w-5">
              <AvatarImage src={item.actor.avatar} />
              <AvatarFallback className="text-[8px]">
                {item.actor.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          )}
          <p className={cn(
            'text-sm font-medium truncate',
            isDark ? 'text-white' : 'text-slate-800'
          )}>
            {item.title}
          </p>
        </div>

        {/* Description */}
        {item.description && (
          <p className={cn(
            'text-xs mb-1 line-clamp-2',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}>
            {item.description}
          </p>
        )}

        {/* Time */}
        <p className={cn(
          'text-[10px]',
          isDark ? 'text-slate-500' : 'text-slate-400'
        )}>
          {timeAgo}
        </p>
      </div>

      {/* Badge (if metadata present) */}
      {item.metadata?.badge && (
        <Badge variant="outline" className="text-[10px] flex-shrink-0">
          {item.metadata.badge}
        </Badge>
      )}
    </motion.div>
  );
}
