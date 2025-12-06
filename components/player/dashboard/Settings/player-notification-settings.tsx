'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { PlayerSettings } from '@/lib/api/player/getPlayerSettings';
import { updatePlayerSettings } from '@/lib/api/player/updatePlayerSettings';
import { toast } from 'sonner';

export function PlayerNotificationSettings({ settings }: { settings: PlayerSettings | null }) {
  const [state, setState] = useState<PlayerSettings | null>(settings);

  const toggle = (key: keyof PlayerSettings) => {
    if (!state) return;
    setState({ ...state, [key]: !state[key] });
  };

  const onSave = async () => {
    if (!state) return;
    const { error } = await updatePlayerSettings(state);
    if (error) toast.error('Could not save notifications');
    else toast.success('Notifications updated');
  };

  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300">Notifications</p>
          <p className="text-xs text-slate-500">Stay in sync with recruiting signals.</p>
        </div>
        <button className="text-xs text-emerald-300 hover:text-emerald-200" onClick={onSave}>
          Save
        </button>
      </div>
      <ToggleRow
        label="When I receive a new evaluation"
        checked={state?.notify_on_eval ?? true}
        onChange={() => toggle('notify_on_eval')}
      />
      <ToggleRow
        label="When a school adds or updates interest"
        checked={state?.notify_on_interest ?? true}
        onChange={() => toggle('notify_on_interest')}
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
