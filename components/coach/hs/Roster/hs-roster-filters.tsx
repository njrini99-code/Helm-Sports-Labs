'use client';

import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Team } from '@/types/team';
import type { HsRosterFiltersState } from '@/lib/api/hs/getHighSchoolRoster';
import { Checkbox } from '@/components/ui/checkbox';

export function HsRosterFilters({
  teams,
  value,
  onChange,
}: {
  teams: Team[];
  value: HsRosterFiltersState;
  onChange: (val: HsRosterFiltersState) => void;
})
          )} {
  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white">
      <div className="flex flex-wrap gap-3 items-center hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        <FilterSelect
          label="Team"
          value={value.teamId || 'all'}
          onChange={(teamId) => onChange({ ...value, teamId: teamId === 'all' ? undefined : teamId })
          )}}
          options={[
            { value: 'all', label: 'All teams' },
            ...{teams.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            teams.map((t) => ({ value: t.id, label: t.name })
          )}),
          ]}
        />
        <FilterSelect
          label="Position"
          value={value.position || 'all'}
          onChange={(position) => onChange({ ...value, position: position === 'all' ? undefined : position })
          )}}
          options={[
            { value: 'all', label: 'All positions' },
            { value: 'P', label: 'P' },
            { value: 'C', label: 'C' },
            { value: 'IF', label: 'INF' },
            { value: 'OF', label: 'OF' },
          ]}
        />
        <FilterSelect
          label="Grad Year"
          value={value.gradYear ? String(value.gradYear) : 'all'}
          onChange={(grad) => onChange({ ...value, gradYear: grad === 'all' ? undefined : Number(grad) })
          )}}
          options={['all', '2024', '2025', '2026', '2027', '2028'].map((g) => ({ value: g, label: g === 'all' ? 'All years' : g })
          )})}
        />
        <Toggle label="Top prospects" checked={value.showOnlyTopProspects} onChange={(checked) => onChange({ ...value, showOnlyTopProspects: checked })
          )}} />
        <Toggle label="Incomplete profiles" checked={value.showOnlyIncompleteProfiles} onChange={(checked) => onChange({ ...value, showOnlyIncompleteProfiles: checked })
          )}} />
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
        <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
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

function Toggle({ label, checked, onChange }: { label: string; checked?: boolean; onChange: (val: boolean) => void })
          )} {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
      <Checkbox checked={checked} onCheckedChange={(val) => onChange(!!val)} />
      <span>{label}</span>
    </label>
  );
}
