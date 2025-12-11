'use client';

import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type PerformanceFilters } from '@/lib/api/player/getPlayerStatsSeries';

export function PlayerPerformanceFilters({
  value,
  onChange,
}: {
  value: PerformanceFilters;
  onChange: (val: PerformanceFilters) => void;
})
          )} {
  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex flex-wrap gap-3 items-center hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <FilterSelect
          label="Source"
          value={value.source}
          onChange={(source) => onChange({ ...value, source: source as 'high_school' | 'showcase' | 'all' })
          )}}
          options={[
            { value: 'all', label: 'All' },
            { value: 'high_school', label: 'High School' },
            { value: 'showcase', label: 'Showcase' },
          ]}
        />
        <FilterSelect
          label="Date"
          value={value.dateRange.preset || '30d'}
          onChange={(preset) => onChange({ ...value, dateRange: { ...value.dateRange, preset: preset as '7d' | '30d' | 'season' } })
          )}}
          options={[
            { value: '7d', label: 'Last 7d' },
            { value: '30d', label: 'Last 30d' },
            { value: 'season', label: 'Season' },
          ]}
        />
        <FilterSelect
          label="Level"
          value={value.level || 'all'}
          onChange={(level) => onChange({ ...value, level: level === 'all' ? undefined : level })
          )}}
          options={[
            { value: 'all', label: 'All levels' },
            { value: 'Varsity', label: 'Varsity' },
            { value: 'JV', label: 'JV' },
            { value: '17U', label: '17U' },
          ]}
        />
        <FilterSelect
          label="Game Type"
          value={value.gameType || 'all'}
          onChange={(gameType) => onChange({ ...value, gameType: gameType === 'all' ? undefined : gameType })
          )}}
          options={[
            { value: 'all', label: 'All types' },
            { value: 'game', label: 'Game' },
            { value: 'showcase', label: 'Showcase' },
            { value: 'playoffs', label: 'Playoffs' },
          ]}
        />
      </div>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
})
          )} {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {{options.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
