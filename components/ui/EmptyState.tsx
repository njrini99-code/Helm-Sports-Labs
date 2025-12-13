'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Search, 
  FileText,
  Video,
  Trophy,
  Star,
  Bell,
  Folder,
  LucideIcon,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════
export interface EmptyStateProps {
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Lucide icon component */
  icon?: LucideIcon;
  /** Icon preset for common use cases */
  iconPreset?: 'players' | 'events' | 'messages' | 'search' | 'files' | 'videos' | 'achievements' | 'favorites' | 'notifications' | 'folder';
  /** Primary action button text */
  actionText?: string;
  /** Primary action click handler */
  onAction?: () => void;
  /** Secondary action button text */
  secondaryText?: string;
  /** Secondary action click handler */
  onSecondary?: () => void;
  /** Link for primary action (alternative to onAction) */
  actionHref?: string;
  /** Whether dark mode is enabled */
  isDark?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Icon Presets
// ═══════════════════════════════════════════════════════════════════════════
const ICON_PRESETS: Record<NonNullable<EmptyStateProps['iconPreset']>, LucideIcon> = {
  players: Users,
  events: Calendar,
  messages: MessageSquare,
  search: Search,
  files: FileText,
  videos: Video,
  achievements: Trophy,
  favorites: Star,
  notifications: Bell,
  folder: Folder,
};

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════
export function EmptyState({
  title,
  description,
  icon,
  iconPreset,
  actionText,
  onAction,
  secondaryText,
  onSecondary,
  actionHref,
  isDark = false,
  size = 'md',
  className,
}: EmptyStateProps) {
  const Icon = icon || (iconPreset ? ICON_PRESETS[iconPreset] : Folder);

  const sizeClasses = {
    sm: {
      container: 'py-6',
      icon: 'w-10 h-10',
      title: 'text-sm',
      description: 'text-xs',
      button: 'h-8 text-xs',
    },
    md: {
      container: 'py-10',
      icon: 'w-14 h-14',
      title: 'text-base',
      description: 'text-sm',
      button: 'h-9 text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'w-20 h-20',
      title: 'text-lg',
      description: 'text-base',
      button: 'h-10 text-base',
    },
  };

  const ActionWrapper = actionHref ? 'a' : 'div';
  const actionProps = actionHref ? { href: actionHref } : {};

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizeClasses[size].container,
      className
    )}>
      {/* Icon with gradient background */}
      <div className={cn(
        'relative mb-4',
        isDark ? 'text-slate-600' : 'text-slate-300'
      )}>
        {/* Soft glow behind icon */}
        <div className={cn(
          'absolute inset-0 rounded-full blur-xl opacity-30',
          isDark ? 'bg-slate-500' : 'bg-emerald-300'
        )}></div>
        <Icon className={cn('relative', sizeClasses[size].icon)} strokeWidth={1} />
      </div>
      {/* Title */}
      <h3 className={cn(
        'font-semibold mb-1',
        sizeClasses[size].title,
        isDark ? 'text-white' : 'text-slate-800'
      )}>
        {title}
      </h3>
      {/* Description */}
      {description && (
        <p className={cn(
          'max-w-xs mb-4',
          sizeClasses[size].description,
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}>
          {description}
        </p>
)}
      {/* Actions */}
      {(actionText || secondaryText) && (
        <div className="flex items-center gap-2 mt-2">
          {actionText && (
            <ActionWrapper {...actionProps}>
              <Button 
                onClick={onAction}
                className={cn(
                  sizeClasses[size].button,
                  'bg-emerald-600 hover:bg-emerald-500 text-white'
                )}
              >
                {actionText}
              </Button>
            </ActionWrapper>
)}
          {secondaryText && (
            <Button 
              variant="outline"
              onClick={onSecondary}
              className={cn(
                sizeClasses[size].button,
                isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : ''
              )}
            >
              {secondaryText}
            </Button>
)}
        </div>
)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Preset Empty States
// ═══════════════════════════════════════════════════════════════════════════
export function NoPlayersEmptyState(props: Omit<EmptyStateProps, 'iconPreset' | 'title'>) {
  return (
    <EmptyState
      iconPreset="players"
      title="No players yet"
      description="Add players to your roster to get started."
      actionText="Add Players"
      {...props}
    />
  );
}

export function NoEventsEmptyState(props: Omit<EmptyStateProps, 'iconPreset' | 'title'>) {
  return (
    <EmptyState
      iconPreset="events"
      title="No upcoming events"
      description="Schedule games, practices, or camps."
      actionText="Add Event"
      {...props}
    />
  );
}

export function NoMessagesEmptyState(props: Omit<EmptyStateProps, 'iconPreset' | 'title'>) {
  return (
    <EmptyState
      iconPreset="messages"
      title="No messages yet"
      description="Start a conversation with recruits or coaches."
      actionText="New Message"
      {...props}
    />
  );
}

export function NoSearchResultsEmptyState(props: Omit<EmptyStateProps, 'iconPreset' | 'title'>) {
  return (
    <EmptyState
      iconPreset="search"
      title="No results found"
      description="Try adjusting your search or filters."
      secondaryText="Clear Filters"
      {...props}
    />
  );
}

export function NoVideosEmptyState(props: Omit<EmptyStateProps, 'iconPreset' | 'title'>) {
  return (
    <EmptyState
      iconPreset="videos"
      title="No videos yet"
      description="Upload highlight videos to showcase your skills."
      actionText="Upload Video"
      {...props}
    />
  );
}

export function NoAchievementsEmptyState(props: Omit<EmptyStateProps, 'iconPreset' | 'title'>) {
  return (
    <EmptyState
      iconPreset="achievements"
      title="No achievements yet"
      description="Add your awards, honors, and accomplishments."
      actionText="Add Achievement"
      {...props}
    />
  );
}

export function NoFavoritesEmptyState(props: Omit<EmptyStateProps, 'iconPreset' | 'title'>) {
  return (
    <EmptyState
      iconPreset="favorites"
      title="No favorites yet"
      description="Save schools or players to your favorites list."
      actionText="Browse"
      {...props}
    />
  );
}

export function NoNotificationsEmptyState(props: Omit<EmptyStateProps, 'iconPreset' | 'title'>) {
  return (
    <EmptyState
      iconPreset="notifications"
      title="No notifications"
      description="You're all caught up!"
      {...props}
    />
  );
}

export default EmptyState;


