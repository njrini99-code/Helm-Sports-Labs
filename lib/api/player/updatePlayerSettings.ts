import { createClient } from '@/lib/supabase/client';
import type { PlayerSettings } from '@/types/player';

export async function updatePlayerSettings(
  settings: Partial<PlayerSettings> & { player_id: string }
): Promise<{ error: Error | null }> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('player_settings')
    .upsert({
      player_id: settings.player_id,
      is_discoverable: settings.is_discoverable,
      show_gpa: settings.show_gpa,
      show_test_scores: settings.show_test_scores,
      show_contact_info: settings.show_contact_info,
      notify_on_eval: settings.notify_on_eval,
      notify_on_interest: settings.notify_on_interest,
      notify_on_message: settings.notify_on_message,
      notify_on_watchlist_add: settings.notify_on_watchlist_add,
    }, {
      onConflict: 'player_id',
    });

  return { error: error ? new Error(error.message) : null };
}
