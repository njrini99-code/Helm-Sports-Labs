'use client';

import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Team } from '@/types/team';

type Filters = { view: 'list' | 'month' | 'week'; teamId?: string; type?: string };

export function HsScheduleFilters({
  teams,
  value,
  onChange,
}: {
  teams: Team[];
  value: Filters;
  onChange: (val: Filters) => void;
}) {
  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex flex-wrap gap-3 items-center">
        <FilterSelect
          label="View"
          value={value.view}
          onChange={(view) => onChange({ ...value, view: view as Filters['view'] })}
          options={[
            { value: 'list', label: 'List' },
            { value: 'month', label: 'Month' },
            { value: 'week', label: 'Week' },
          ]}
        />
        <FilterSelect
          label="Team"
          value={value.teamId || 'all'}
          onChange={(teamId) => onChange({ ...value, teamId: teamId === 'all' ? undefined : teamId })}
          options={[
            { value: 'all', label: 'All teams' },
            ...teams.map((t) => ({ value: t.id, label: t.name })),
          ]}
        />
        <FilterSelect
          label="Type"
          value={value.type || 'all'}
          onChange={(type) => onChange({ ...value, type: type === 'all' ? undefined : type })}
          options={[
            { value: 'all', label: 'All types' },
            { value: 'game', label: 'Games' },
            { value: 'practice', label: 'Practices' },
            { value: 'scrimmage', label: 'Scrimmages' },
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
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
