'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PlayerListItemData {
  id: string;
  full_name: string;
  grad_year: number;
  primary_position: string;
  secondary_position?: string | null;
  high_school_state?: string;
  avatar_url?: string | null;
  pitch_velo?: number | null;
  exit_velo?: number | null;
  sixty_time?: number | null;
}

interface PlayerListItemProps {
  player: PlayerListItemData;
  onClick?: () => void;
  href?: string;
  showMetrics?: boolean;
  showSecondaryPosition?: boolean;
  actionButtons?: React.ReactNode;
  className?: string;
}

export function PlayerListItem({
  player,
  onClick,
  href,
  showMetrics = true,
  showSecondaryPosition = true,
  actionButtons,
  className,
}: PlayerListItemProps) {
  const initials = player.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleClick = () => {
    if (href) {
      window.location.href = href;
    } else if (onClick) {
      onClick();
    }
  };

  const formatMetric = (value: number | null | undefined, unit: string) => {
    if (!value || value === 0) return null;
    return `${value}${unit}`;
  };

  const metrics = [
    formatMetric(player.pitch_velo, 'mph'),
    formatMetric(player.exit_velo, 'mph'),
    formatMetric(player.sixty_time, 's'),
  ].filter(Boolean);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl bg-[#111315] border border-white/5 hover:border-blue-500/30 transition-all duration-200 hover:scale-[1.01] cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      <Avatar className="h-12 w-12 border-2 border-blue-500/30 hover:scale-110 transition-transform">
        <AvatarImage src={player.avatar_url || undefined} alt={player.full_name} />
        <AvatarFallback className="bg-blue-500/10 text-blue-300 font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-white truncate">{player.full_name}</p>
          <Badge variant="outline" className="text-xs">
            {player.grad_year}
          </Badge>
          {player.high_school_state && (
            <span className="text-xs text-slate-400">{player.high_school_state}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {player.primary_position}
          </Badge>
          {showSecondaryPosition && player.secondary_position && (
            <Badge variant="outline" className="text-xs">
              {player.secondary_position}
            </Badge>
          )}
          {showMetrics && metrics.length > 0 && (
            <div className="flex gap-2 text-xs text-slate-400">
              {metrics.map((metric, i) => (
                <span key={i}>{metric}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {actionButtons && (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {actionButtons}
        </div>
      )}
    </div>
  );
}
