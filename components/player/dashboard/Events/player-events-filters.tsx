'use client';

import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type EventFilter } from '@/lib/api/player/getPlayerEventsTimeline';

export function PlayerEventsFilters({
  value,
  onChange,
}: {
  value: EventFilter;
  onChange: (val: EventFilter) => void;
}) {
  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Type</p>
          <Select value={value.type} onValueChange={(type) => onChange({ ...value, type: type as EventFilter['type'] })}>
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high_school">High School</SelectItem>
              <SelectItem value="showcase">Showcase</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Date range</p>
          <Select
            value={value.range?.preset || '90d'}
            onValueChange={(preset) => onChange({ ...value, range: { ...value.range, preset: preset as '30d' | '90d' | '365d' } })}
          >
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30d</SelectItem>
              <SelectItem value="90d">Last 90d</SelectItem>
              <SelectItem value="365d">Season</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
