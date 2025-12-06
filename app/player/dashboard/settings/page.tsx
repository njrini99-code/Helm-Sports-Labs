'use client';

import { useEffect, useState } from 'react';
import { useCurrentPlayer } from '@/lib/hooks/useCurrentPlayer';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PlayerProfileForm } from '@/components/player/dashboard/Settings/player-profile-form';
import { PlayerVisibilitySettings } from '@/components/player/dashboard/Settings/player-visibility-settings';
import { PlayerNotificationSettings } from '@/components/player/dashboard/Settings/player-notification-settings';
import { getPlayerSettings } from '@/lib/api/player/getPlayerSettings';
import type { PlayerSettings } from '@/lib/api/player/getPlayerSettings';

export default function PlayerSettingsPage() {
  const { player, profile, isLoading: loadingPlayer, error } = useCurrentPlayer();
  const [settings, setSettings] = useState<PlayerSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!player) return;
    setLoading(true);
    getPlayerSettings(player.id).then(setSettings).finally(() => setLoading(false));
  }, [player]);

  if (loadingPlayer) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error || !player || !profile) {
    return (
      <Card className="bg-slate-900/70 border-white/5 p-6 text-white">
        <p className="text-sm text-slate-300">We could not load your profile yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PlayerProfileForm player={player} profile={profile} />
      <div className="grid gap-6 md:grid-cols-2">
        <PlayerVisibilitySettings settings={settings} />
        <PlayerNotificationSettings settings={settings} />
      </div>
    </div>
  );
}
