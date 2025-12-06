'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { PlayerSettings } from '@/lib/api/player/getPlayerSettings';
import { updatePlayerSettings } from '@/lib/api/player/updatePlayerSettings';
import { toast } from 'sonner';

export function PlayerVisibilitySettings({ settings }: { settings: PlayerSettings | null }) {
  const [state, setState] = useState<PlayerSettings | null>(settings);

  const toggle = (key: keyof PlayerSettings) => {
    if (!state) return;
    setState({ ...state, [key]: !state[key] });
  };

  const onSave = async () => {
    if (!state) return;
    const { error } = await updatePlayerSettings(state);
    if (error) {
      toast.error('Could not save visibility');
    } else {
      toast.success('Visibility updated');
    }
  };

  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300">Visibility</p>
          <p className="text-xs text-slate-500">Control how you appear to coaches.</p>
        </div>
        <button className="text-xs text-emerald-300 hover:text-emerald-200" onClick={onSave}>
          Save
        </button>
      </div>
      <ToggleRow
        label="Appear in coach searches"
        checked={state?.is_discoverable ?? true}
        onChange={() => toggle('is_discoverable')}
      />
      <ToggleRow
        label="Show GPA on profile"
        checked={state?.show_gpa ?? true}
        onChange={() => toggle('show_gpa')}
      />
    </Card>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 text-sm cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span>{label}</span>
    </label>
  );
}
