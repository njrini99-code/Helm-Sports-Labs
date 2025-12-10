'use client';

import { useState } from 'react';
import { X, SlidersHorizontal, ChevronDown, ChevronUp, Save, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { glassCard } from '@/lib/glassmorphism';

export interface FilterState {
  divisions: string[];
  conferences: string[];
  states: string[];
  regions: string[];
  hasLogo: boolean | null;
  hasWebsite: boolean | null;
  minCommitCount: number | null;
  maxCommitCount: number | null;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableConferences?: string[];
  availableStates?: string[];
  className?: string;
}

const DIVISIONS = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'];
const REGIONS = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'];

export function AdvancedFilters({
  filters,
  onFiltersChange,
  availableConferences = [],
  availableStates = [],
  className,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends 'divisions' | 'conferences' | 'states' | 'regions'>(
    key: K,
    value: string
  ) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated as FilterState[K]);
  };

  const clearFilters = () => {
    onFiltersChange({
      divisions: [],
      conferences: [],
      states: [],
      regions: [],
      hasLogo: null,
      hasWebsite: null,
      minCommitCount: null,
      maxCommitCount: null,
    });
  };

  const activeFilterCount = 
    filters.divisions.length +
    filters.conferences.length +
    filters.states.length +
    filters.regions.length +
    (filters.hasLogo !== null ? 1 : 0) +
    (filters.hasWebsite !== null ? 1 : 0) +
    (filters.minCommitCount !== null ? 1 : 0) +
    (filters.maxCommitCount !== null ? 1 : 0);

  const FilterSection = ({ 
    title, 
    sectionKey,
    children 
  }: { 
    title: string; 
    sectionKey: string;
    children: React.ReactNode;
  }) => {
    const isOpen = expandedSection === sectionKey;
    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setExpandedSection(isOpen ? null : sectionKey)}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="font-medium text-slate-700">{title}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {isOpen && (
          <div className="p-4 bg-white border-t border-slate-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-slate-700">Advanced Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Quick Filter Chips */}
      {!isExpanded && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.divisions.map(div => (
            <Badge
              key={div}
              variant="secondary"
              className="cursor-pointer hover:bg-slate-200"
              onClick={() => toggleArrayFilter('divisions', div)}
            >
              {div} <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          {filters.conferences.map(conf => (
            <Badge
              key={conf}
              variant="secondary"
              className="cursor-pointer hover:bg-slate-200"
              onClick={() => toggleArrayFilter('conferences', conf)}
            >
              {conf} <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          {filters.states.map(state => (
            <Badge
              key={state}
              variant="secondary"
              className="cursor-pointer hover:bg-slate-200"
              onClick={() => toggleArrayFilter('states', state)}
            >
              {state} <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className={cn(glassCard, 'p-4 space-y-4')}>
          {/* Divisions */}
          <FilterSection title="Division" sectionKey="division">
            <div className="flex flex-wrap gap-2">
              {DIVISIONS.map(div => (
                <button
                  key={div}
                  onClick={() => toggleArrayFilter('divisions', div)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    filters.divisions.includes(div)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  )}
                >
                  {div}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Regions */}
          <FilterSection title="Region" sectionKey="region">
            <div className="flex flex-wrap gap-2">
              {REGIONS.map(region => (
                <button
                  key={region}
                  onClick={() => toggleArrayFilter('regions', region)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    filters.regions.includes(region)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  )}
                >
                  {region}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* States */}
          {availableStates.length > 0 && (
            <FilterSection title="State" sectionKey="state">
              <div className="max-h-48 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  {availableStates.map(state => (
                    <button
                      key={state}
                      onClick={() => toggleArrayFilter('states', state)}
                      className={cn(
                        'px-2 py-1.5 rounded text-xs font-medium transition-colors text-left',
                        filters.states.includes(state)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      )}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>
            </FilterSection>
          )}

          {/* Conferences */}
          {availableConferences.length > 0 && (
            <FilterSection title="Conference" sectionKey="conference">
              <div className="max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {availableConferences.map(conf => (
                    <label
                      key={conf}
                      className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded"
                    >
                      <Checkbox
                        checked={filters.conferences.includes(conf)}
                        onCheckedChange={() => toggleArrayFilter('conferences', conf)}
                      />
                      <span className="text-sm text-slate-700">{conf}</span>
                    </label>
                  ))}
                </div>
              </div>
            </FilterSection>
          )}

          {/* Additional Options */}
          <FilterSection title="Additional Options" sectionKey="options">
            <div className="space-y-4">
              {/* Has Logo */}
              <div className="flex items-center justify-between">
                <Label htmlFor="has-logo" className="text-sm">Has Logo</Label>
                <Select
                  value={filters.hasLogo === null ? 'any' : filters.hasLogo ? 'yes' : 'no'}
                  onValueChange={(value) => 
                    updateFilter('hasLogo', value === 'any' ? null : value === 'yes')
                  }
                >
                  <SelectTrigger id="has-logo" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Has Website */}
              <div className="flex items-center justify-between">
                <Label htmlFor="has-website" className="text-sm">Has Website</Label>
                <Select
                  value={filters.hasWebsite === null ? 'any' : filters.hasWebsite ? 'yes' : 'no'}
                  onValueChange={(value) => 
                    updateFilter('hasWebsite', value === 'any' ? null : value === 'yes')
                  }
                >
                  <SelectTrigger id="has-website" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Commit Count Range */}
              <div className="space-y-2">
                <Label className="text-sm">Commit Count Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minCommitCount ?? ''}
                    onChange={(e) => 
                      updateFilter('minCommitCount', e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="w-24"
                  />
                  <span className="text-slate-500">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxCommitCount ?? ''}
                    onChange={(e) => 
                      updateFilter('maxCommitCount', e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          </FilterSection>
        </div>
      )}
    </div>
  );
}

