import { Badge } from "@/components/ui/badge";
import { Trophy, Star } from "lucide-react";

interface D1BadgeProps {
  level: 'elite' | 'd1' | 'none';
  size?: 'sm' | 'md';
}

export function D1Badge({ level, size = 'md' }: D1BadgeProps) {
  if (level === 'none') return null;

  const isElite = level === 'elite';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <Badge
      className={`${textSize} font-semibold border ${
        isElite
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-lg shadow-amber-500/20'
          : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
      }`}
    >
      {isElite ? (
        <Star className={`${iconSize} mr-1 fill-current`} />
      ) : (
        <Trophy className={`${iconSize} mr-1`} />
      )}
      {isElite ? 'Elite' : 'D1 Range'}
    </Badge>
  );
}
