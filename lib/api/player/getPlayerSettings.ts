import { createClient } from '@/lib/supabase/client';
import type { PlayerSettings, DEFAULT_PLAYER_SETTINGS } from '@/types/player';

export type { PlayerSettings };

const DEFAULT_SETTINGS: Omit<PlayerSettings, 'id' | 'player_id'> = {
  is_discoverable: true,
  show_gpa: false,
  show_test_scores: false,
  show_contact_info: false,
  notify_on_eval: true,
  notify_on_interest: true,
  notify_on_message: true,
  notify_on_watchlist_add: true,
};

export async function getPlayerSettings(playerId: string): Promise<PlayerSettings> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('player_settings')
    .select('*')
    .eq('player_id', playerId)
    .maybeSingle();

  // If no settings exist, return defaults
  if (error || !data) {
    return {
      id: '',
      player_id: playerId,
      ...DEFAULT_SETTINGS,
    };
  }

  return {
    id: data.id,
    player_id: playerId,
    is_discoverable: data.is_discoverable ?? DEFAULT_SETTINGS.is_discoverable,
    show_gpa: data.show_gpa ?? DEFAULT_SETTINGS.show_gpa,
    show_test_scores: data.show_test_scores ?? DEFAULT_SETTINGS.show_test_scores,
    show_contact_info: data.show_contact_info ?? DEFAULT_SETTINGS.show_contact_info,
    notify_on_eval: data.notify_on_eval ?? DEFAULT_SETTINGS.notify_on_eval,
    notify_on_interest: data.notify_on_interest ?? DEFAULT_SETTINGS.notify_on_interest,
    notify_on_message: data.notify_on_message ?? DEFAULT_SETTINGS.notify_on_message,
    notify_on_watchlist_add: data.notify_on_watchlist_add ?? DEFAULT_SETTINGS.notify_on_watchlist_add,
  };
}
