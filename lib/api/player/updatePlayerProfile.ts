import { createClient } from '@/lib/supabase/client';
import type { Player } from '@/types/player';
import type { Profile } from '@/types/profile';

export interface UpdateProfilePayload {
  profile?: Partial<Profile>;
  player?: Partial<Player>;
}

export async function updatePlayerProfile(
  playerId: string, 
  userId: string, 
  payload: UpdateProfilePayload
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  // Update profile if provided
  if (payload.profile && Object.keys(payload.profile).length > 0) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update(payload.profile)
      .eq('id', userId);

    if (profileError) {
      return { error: new Error(profileError.message) };
    }
  }

  // Update player if provided
  if (payload.player && Object.keys(payload.player).length > 0) {
    // Ensure full_name is updated if first/last name changes
    const playerUpdate = { ...payload.player };
    if (playerUpdate.first_name || playerUpdate.last_name) {
      // full_name will be auto-updated by the database trigger
    }

    const { error: playerError } = await supabase
      .from('players')
      .update(playerUpdate)
      .eq('id', playerId);

    if (playerError) {
      return { error: new Error(playerError.message) };
    }
  }

  return { error: null };
}
