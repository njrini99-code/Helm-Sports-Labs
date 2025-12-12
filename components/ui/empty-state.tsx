'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Plus, Search, Users, Calendar, MessageSquare, School, Trophy, Video, BarChart3 } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'card' | 'compact';
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const variants = {
    default: 'px-6 py-12',
    card: 'px-6 py-10',
    compact: 'px-4 py-8',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed backdrop-blur-2xl bg-white/5 border-white/15 text-center shadow-lg',
        variants[variant],
        className
      )}
      role="status"
      aria-live="polite"
    >
      {icon && (
        <div className="mb-4 rounded-full backdrop-blur-xl bg-white/10 border border-white/15 p-4 text-white/70 shadow-lg">
          {icon}
        </div>
)}
      <div className="space-y-2 max-w-sm">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
)}
      </div>
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
      {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction} className="gap-2">
              <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
)}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
)}
        </div>
)}
    </div>
  );
}

// Pre-configured empty states for common scenarios
interface PresetEmptyStateProps {
  onAction?: () => void;
  className?: string;
}

export function NoPlayersEmptyState({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8" />}
      title="No players yet"
      description="Start building your roster by adding players to your team."
      actionLabel="Add player"
      onAction={onAction}
      className={className}
    />
  );
}

export function NoEventsEmptyState({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={<Calendar className="h-8 w-8" />}
      title="No events scheduled"
      description="Create games, practices, and tournaments for your team."
      actionLabel="Create event"
      onAction={onAction}
      className={className}
    />
  );
}

export function NoMessagesEmptyState({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-8 w-8" />}
      title="No conversations yet"
      description="Start connecting with players and programs."
      actionLabel="Start conversation"
      onAction={onAction}
      className={className}
    />
  );
}

export function NoSchoolsEmptyState({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={<School className="h-8 w-8" />}
      title="No schools added"
      description="Track your recruiting interests by adding colleges you're interested in."
      actionLabel="Add school"
      onAction={onAction}
      className={className}
    />
  );
}

export function NoSearchResultsEmptyState({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8" />}
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for."
      actionLabel={onAction ? "Clear filters" : undefined}
      onAction={onAction}
      className={className}
    />
  );
}

export function NoAchievementsEmptyState({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={<Trophy className="h-8 w-8" />}
      title="No achievements yet"
      description="Add your awards, honors, and accomplishments to stand out to recruiters."
      actionLabel="Add achievement"
      onAction={onAction}
      className={className}
    />
  );
}

export function NoVideosEmptyState({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={<Video className="h-8 w-8" />}
      title="No videos yet"
      description="Upload game footage and highlights to showcase your skills."
      actionLabel="Add video"
      onAction={onAction}
      className={className}
    />
  );
}

export function NoStatsEmptyState({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      icon={<BarChart3 className="h-8 w-8" />}
      title="No stats recorded"
      description="Track your performance by logging game and practice stats."
      actionLabel="Add stats"
      onAction={onAction}
      className={className}
    />
  );
}
