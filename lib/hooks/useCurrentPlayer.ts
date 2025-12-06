import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/profile';
import type { Player } from '@/types/player';

interface CurrentPlayerState {
  profile: Profile | null;
  player: Player | null;
  isLoading: boolean;
  error: string | null;
}

export function useCurrentPlayer(): CurrentPlayerState {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Get profile
        const { data: profileRow, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (!profileRow) {
          setIsLoading(false);
          return;
        }
        setProfile(profileRow as Profile);

        // Get player using user_id (primary) or profile_id (fallback)
        const { data: playerRow, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (playerError) throw playerError;
        
        // Fallback to profile_id if no user_id match
        if (!playerRow) {
          const { data: playerByProfile, error: profilePlayerError } = await supabase
            .from('players')
            .select('*')
            .eq('profile_id', profileRow.id)
            .maybeSingle();
          if (profilePlayerError) throw profilePlayerError;
          setPlayer(playerByProfile as Player);
        } else {
          setPlayer(playerRow as Player);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load player';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  return { profile, player, isLoading, error };
}
