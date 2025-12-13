'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GRAD_YEARS, US_STATES } from '@/lib/types';

export interface DiscoverFiltersState {
  positions: string[];
  gradYears: number[];
  states: string[];
  bats: string | null;
  throws: string | null;
  minHeight: number | null;
  maxHeight: number | null;
  minWeight: number | null;
  maxWeight: number | null;
  minPitchVelo: number | null;
  minExitVelo: number | null;
  maxSixtyTime: number | null;
  hasVideo: boolean;
  verifiedOnly: boolean;
  recentActivity: boolean;
}

interface DiscoverFiltersProps {
  value: DiscoverFiltersState;
  onChange: (next: DiscoverFiltersState) => void;
}

const POSITIONS = ['P', 'C', '1B', '2B', 'SS', '3B', 'OF', 'RHP', 'LHP'];

export function DiscoverFilters({ value, onChange }: DiscoverFiltersProps) {
  const toggleArray = (field: keyof DiscoverFiltersState, item: string | number) => {
    if (field === 'positions' || field === 'states') {
      const current = value[field] as string[];
      const hasItem = current.includes(item as string);
      const next = hasItem ? current.filter((i) => i !== item) : [...current, item as string];
      onChange({ ...value, [field]: next });
    } else if (field === 'gradYears') {
      const current = value[field] as number[];
      const hasItem = current.includes(item as number);
      const next = hasItem ? current.filter((i) => i !== item) : [...current, item as number];
      onChange({ ...value, [field]: next });
    }
  };

  const clearFilters = () => {
    onChange({
      positions: [],
      gradYears: [],
      states: [],
      bats: null,
      throws: null,
      minHeight: null,
      maxHeight: null,
      minWeight: null,
      maxWeight: null,
      minPitchVelo: null,
      minExitVelo: null,
      maxSixtyTime: null,
      hasVideo: false,
      verifiedOnly: false,
      recentActivity: false,
    });
  };

  const activeCount = useMemo(() => {
    return [
      value.positions.length,
      value.gradYears.length,
      value.states.length,
      value.bats ? 1 : 0,
      value.throws ? 1 : 0,
      value.minHeight || value.maxHeight ? 1 : 0,
      value.minWeight || value.maxWeight ? 1 : 0,
      value.minPitchVelo ? 1 : 0,
      value.minExitVelo ? 1 : 0,
      value.maxSixtyTime ? 1 : 0,
      value.hasVideo ? 1 : 0,
      value.verifiedOnly ? 1 : 0,
      value.recentActivity ? 1 : 0,
    ].reduce((a, b) => a + (b ? 1 : 0), 0);
  }, [value]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base text-foreground">Filters</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs" onClick={clearFilters}>
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Position</p>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            POSITIONS.map((pos) => {
              const active = value.positions.includes(pos);
              return (
                <Badge
                  key={pos}
                  onClick={() => toggleArray('positions', pos)}
                  className={[
                    'cursor-pointer select-none px-3 py-1 rounded-full border transition-colors',
                    active
                      ? 'bg-primary/20 text-primary border-primary/40'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted',
                  ].join(' ')}
                >
                  {pos}
                </Badge>
              );
            })
          })
          </div>
        </div>
      <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Grad Year</p>
          <div className="flex flex-wrap gap-2">
            {GRAD_YEARS.map((year) => {
              const active = value.gradYears.includes(year);
              return (
                <Badge
                  key={year}
                  onClick={() => toggleArray('gradYears', year)}
                  className={[
                    'cursor-pointer select-none px-3 py-1 rounded-full border transition-colors',
                    active
                      ? 'bg-primary/20 text-primary border-primary/40'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted',
                  ].join(' ')}
                >
                  {year}
                </Badge>
              );
            })
          })
          </div>
        </div>
      <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">State</p>
          <div className="grid grid-cols-6 gap-2 text-xs">
            {US_STATES.map((state) => {
              const active = value.states.includes(state);
              return (
                <button
                  key={state}
                  onClick={() => toggleArray('states', state)}
                  className={[
                    'px-2 py-1 rounded-md border transition-colors',
                    active
                      ? 'bg-primary/15 text-primary border-primary/40'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted',
                  ].join(' ')}
                >
                  {state}
                </button>
              );
            })
          })
          </div>
        </div>
      <div className="grid md:grid-cols-3 gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Bats</p>
            <div className="flex gap-2">
              {['R', 'L', 'S'].map((hand) => (
                <Button
                  key={hand}
                  size="sm"
                  variant={value.bats === hand ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => onChange({ ...value, bats: value.bats === hand ? null : hand })}
                >
                  {hand}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Throws</p>
            <div className="flex gap-2">
              {['R', 'L'].map((hand) => (
                <Button
                  key={hand}
                  size="sm"
                  variant={value.throws === hand ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => onChange({ ...value, throws: value.throws === hand ? null : hand })}
                >
                  {hand}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="text-xs text-muted-foreground">Active filters</div>
            <div className="text-sm text-foreground font-semibold">{activeCount}</div>
          </div>
        </div>
      <div className="grid md:grid-cols-3 gap-3">
          <NumberRange
            label="Height (in)"
            minValue={value.minHeight}
            maxValue={value.maxHeight}
            onChange={(min, max) => onChange({ ...value, minHeight: min, maxHeight: max })}
          />
          <NumberRange
            label="Weight (lbs)"
            minValue={value.minWeight}
            maxValue={value.maxWeight}
            onChange={(min, max) => onChange({ ...value, minWeight: min, maxWeight: max })}
          />
          <NumberRange
            label="60 Time (s)"
            minValue={null}
            maxValue={value.maxSixtyTime}
            placeholderMax="≤"
            onChange={(_, max) => onChange({ ...value, maxSixtyTime: max })}
          />
        </div>
      <div className="grid md:grid-cols-3 gap-3">
          <NumberInput
            label="FB Velo min"
            value={value.minPitchVelo}
            suffix="mph"
            onChange={(val) => onChange({ ...value, minPitchVelo: val })}
          />
          <NumberInput
            label="Exit Velo min"
            value={value.minExitVelo}
            suffix="mph"
            onChange={(val) => onChange({ ...value, minExitVelo: val })}
          />
          <div className="flex flex-col gap-2">
            <TogglePill
              label="Has video"
              active={value.hasVideo}
              onClick={() => onChange({ ...value, hasVideo: !value.hasVideo })}
            />
            <TogglePill
              label="Verified metrics"
              active={value.verifiedOnly}
              onClick={() => onChange({ ...value, verifiedOnly: !value.verifiedOnly })}
            />
            <TogglePill
              label="Recent activity"
              active={value.recentActivity}
              onClick={() => onChange({ ...value, recentActivity: !value.recentActivity })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NumberRange({
  label,
  minValue,
  maxValue,
  onChange,
  placeholderMax,
}: {
  label: string;
  minValue: number | null;
  maxValue: number | null;
  onChange: (min: number | null, max: number | null) => void;
  placeholderMax?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Min"
          value={minValue ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null, maxValue)}
          className="bg-muted/50 border-border"
        />
        <span className="text-muted-foreground text-xs">–</span>
        <Input
          type="number"
          placeholder={placeholderMax || 'Max'}
          value={maxValue ?? ''}
          onChange={(e) => onChange(minValue, e.target.value ? Number(e.target.value) : null)}
          className="bg-muted/50 border-border"
        />
      </div>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number | null;
  onChange: (val: number | null) => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="relative">
        <Input
          type="number"
          value={value ?? ''}
          placeholder="Value"
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          className="bg-muted/50 border-border pr-12"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
)}
      </div>
    </div>
  );
}

function TogglePill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors',
        active
          ? 'bg-primary/15 text-primary border-primary/40'
          : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
