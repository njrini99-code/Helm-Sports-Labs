'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { getProgramNeedsForCoach, updateProgramNeedsForCoach, type ProgramNeeds } from '@/lib/queries/recruits';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const POSITIONS = ['Pitcher', 'Catcher', 'First Base', 'Second Base', 'Shortstop', 'Third Base', 'Left Field', 'Center Field', 'Right Field'];
const GRAD_YEARS = [2025, 2026, 2027, 2028, 2029];
const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

interface ProgramNeedsFormProps {
  onSuccess?: () => void;
}

export function ProgramNeedsForm({ onSuccess }: ProgramNeedsFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [needs, setNeeds] = useState<Partial<ProgramNeeds>>({
    grad_years_needed: [],
    positions_needed: [],
    preferred_states: [],
    min_pitch_velo: null,
    min_exit_velo: null,
    max_sixty_time: null,
  });

  useEffect(() => {
    loadNeeds();
  }, []);

  const loadNeeds = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .eq('coach_type', 'college')
      .single();

    if (!coach) {
      setLoading(false);
      return;
    }

    const programNeeds = await getProgramNeedsForCoach(coach.id);
    if (programNeeds) {
      setNeeds(programNeeds);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.id)
      .eq('coach_type', 'college')
      .single();

    if (!coach) {
      setSaving(false);
      return;
    }

    const success = await updateProgramNeedsForCoach(coach.id, needs);
    
    if (success) {
      toast.success('Program needs updated successfully');
      onSuccess?.();
    } else {
      toast.error('Failed to update program needs');
    }

    setSaving(false);
  };

  const toggleArrayItem = (array: any[], item: any) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">Grad Years Needed</Label>
        <div className="flex flex-wrap gap-2">
          {GRAD_YEARS.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white/60 mb-4">No items yet</p>
              <p className="text-white/40 text-sm">Check back later</p>
            </div>
          ) : (
            GRAD_YEARS.map(year => (
            <div key={year} className="flex items-center space-x-2">
              <Checkbox
                id={`grad-${year}`}
                checked={needs.grad_years_needed?.includes(year) || false}
                onCheckedChange={() => {
                  setNeeds({
                    ...needs,
                    grad_years_needed: toggleArrayItem(needs.grad_years_needed || [], year),
                  });
                }}
              />
              <Label htmlFor={`grad-${year}`} className="text-sm font-normal cursor-pointer">
                {year}
              </Label>
            </div>
            ))
          }
        </div>
      </div>
      <div>
        <Label className="text-base font-semibold mb-3 block">Positions Needed</Label>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map(position => (
            <div key={position} className="flex items-center space-x-2">
              <Checkbox
                id={`pos-${position}`}
                checked={needs.positions_needed?.includes(position) || false}
                onCheckedChange={() => {
                  setNeeds({
                    ...needs,
                    positions_needed: toggleArrayItem(needs.positions_needed || [], position),
                  });
                }}
              />
              <Label htmlFor={`pos-${position}`} className="text-sm font-normal cursor-pointer">
                {position}
              </Label>
            </div>
)}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="min-pitch-velo">Min Pitch Velocity (mph)</Label>
          <Input
            id="min-pitch-velo"
            type="number"
            value={needs.min_pitch_velo || ''}
            onChange={(e) => setNeeds({ ...needs, min_pitch_velo: e.target.value ? parseFloat(e.target.value) : null })
          })
            placeholder="85"
          />
        </div>
        <div>
          <Label htmlFor="min-exit-velo">Min Exit Velocity (mph)</Label>
          <Input
            id="min-exit-velo"
            type="number"
            value={needs.min_exit_velo || ''}
            onChange={(e) => setNeeds({ ...needs, min_exit_velo: e.target.value ? parseFloat(e.target.value) : null })
          })
            placeholder="90"
          />
        </div>
        <div>
          <Label htmlFor="max-sixty-time">Max 60-Yard Time (sec)</Label>
          <Input
            id="max-sixty-time"
            type="number"
            step="0.1"
            value={needs.max_sixty_time || ''}
            onChange={(e) => setNeeds({ ...needs, max_sixty_time: e.target.value ? parseFloat(e.target.value) : null })
          })
            placeholder="7.0"
          />
        </div>
      </div>
      <div>
        <Label className="text-base font-semibold mb-3 block">Preferred States (Optional)</Label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {STATES.map(state => (
            <div key={state} className="flex items-center space-x-2">
              <Checkbox
                id={`state-${state}`}
                checked={needs.preferred_states?.includes(state) || false}
                onCheckedChange={() => {
                  setNeeds({
                    ...needs,
                    preferred_states: toggleArrayItem(needs.preferred_states || [], state),
                  });
                }}
              />
              <Label htmlFor={`state-${state}`} className="text-sm font-normal cursor-pointer">
                {state}
              </Label>
            </div>
)}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={saving} className="hover:scale-105 transition-transform">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Needs'
          )}
        </Button>
      </div>
    </form>
  );
}
