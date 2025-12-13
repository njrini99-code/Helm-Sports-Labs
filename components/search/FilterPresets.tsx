'use client';

import { Save, Bookmark, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { type FilterState } from './AdvancedFilters';
import { toast } from 'sonner';

interface FilterPreset {
  id: string;
  name: string;
  filters: FilterState;
}

interface FilterPresetsProps {
  currentFilters: FilterState;
  onLoadPreset: (filters: FilterState) => void;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'd1-only',
    name: 'D1 Programs',
    filters: {
      divisions: ['D1'],
      conferences: [],
      states: [],
      regions: [],
      hasLogo: null,
      hasWebsite: null,
      minCommitCount: null,
      maxCommitCount: null,
    },
  },
  {
    id: 'd2-d3',
    name: 'D2 & D3',
    filters: {
      divisions: ['D2', 'D3'],
      conferences: [],
      states: [],
      regions: [],
      hasLogo: null,
      hasWebsite: null,
      minCommitCount: null,
      maxCommitCount: null,
    },
  },
  {
    id: 'west-coast',
    name: 'West Coast',
    filters: {
      divisions: [],
      conferences: [],
      states: ['CA', 'OR', 'WA', 'NV', 'AZ'],
      regions: ['West'],
      hasLogo: null,
      hasWebsite: null,
      minCommitCount: null,
      maxCommitCount: null,
    },
  },
  {
    id: 'southeast',
    name: 'Southeast',
    filters: {
      divisions: [],
      conferences: [],
      states: [],
      regions: ['Southeast'],
      hasLogo: null,
      hasWebsite: null,
      minCommitCount: null,
      maxCommitCount: null,
    },
  },
];

export function FilterPresets({ currentFilters, onLoadPreset }: FilterPresetsProps) {
  const [loading, setLoading] = useState(true);
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('filter-presets');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return DEFAULT_PRESETS;
        }
      }
    }
    return DEFAULT_PRESETS;
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');

  const saveCurrentPreset = () => {
    if (!presetName.trim()) {
      toast.error('Please enter a name for this preset');
      return;
    }

    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name: presetName.trim(),
      filters: currentFilters,
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('filter-presets', JSON.stringify(updated));
    }

    setPresetName('');
    setIsDialogOpen(false);
    toast.success(`Saved preset "${newPreset.name}"`);
  };

  const deletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('filter-presets', JSON.stringify(updated));
    }
    
    toast.success('Preset deleted');
  };

  const loadPreset = (preset: FilterPreset) => {
    onLoadPreset(preset.filters);
    toast.success(`Loaded preset "${preset.name}"`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">Quick Presets</span>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <Save className="w-3 h-3 mr-1" />
              Save Current
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Filter Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Preset name (e.g., 'My Dream Schools')"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveCurrentPreset();
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveCurrentPreset}>
                  Save Preset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            presets.map(preset => (
          <Badge
            key={preset.id}
            variant="secondary"
            className="cursor-pointer hover:bg-slate-200 group relative pr-6"
            onClick={() => loadPreset(preset)}
          >
            <Bookmark className="w-3 h-3 mr-1" />
            {preset.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deletePreset(preset.id);
              }}
              className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-slate-500 hover:text-slate-700" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

