'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Player } from '@/types/player';
import type { Profile } from '@/types/profile';
import { updatePlayerProfile } from '@/lib/api/player/updatePlayerProfile';
import { toast } from 'sonner';

export function PlayerProfileForm({ player, profile }: { player: Player; profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [city, setCity] = useState(player.city || '');
  const [state, setState] = useState(player.state || '');
  const [gradYear, setGradYear] = useState(player.grad_year?.toString() || '');
  const [primaryPos, setPrimaryPos] = useState(player.primary_position || '');
  const [secondaryPos, setSecondaryPos] = useState(player.secondary_position || '');
  const [highlightUrl, setHighlightUrl] = useState(player.highlight_url || '');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    const { error } = await updatePlayerProfile(player.id, profile.id, {
      profile: { full_name: fullName },
      player: {
        city,
        state,
        grad_year: gradYear ? Number(gradYear) : null,
        primary_position: primaryPos,
        secondary_position: secondaryPos,
        highlight_url: highlightUrl,
      },
    });
    setSaving(false);
    if (error) {
      toast.error('Could not save profile');
    } else {
      toast.success('Profile updated');
    }
  };

  return (
    <Card className="bg-slate-900/70 border-white/5 p-4 text-white space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300">Profile</p>
          <p className="text-xs text-slate-500">Keep your identity and basics current.</p>
        </div>
        <Button onClick={onSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-400 text-black">
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Full name" value={fullName} onChange={setFullName} />
        <Field label="Grad year" value={gradYear} onChange={setGradYear} />
        <Field label="City" value={city} onChange={setCity} />
        <Field label="State" value={state} onChange={setState} />
        <Field label="Primary position" value={primaryPos} onChange={setPrimaryPos} />
        <Field label="Secondary position" value={secondaryPos} onChange={setSecondaryPos} />
        <Field label="Highlight URL" value={highlightUrl} onChange={setHighlightUrl} className="md:col-span-2" />
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">{label}</p>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
      />
    </div>
  );
}
