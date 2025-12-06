import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/profile';

interface CoachState {
  coachProfile: Profile | null;
  isLoading: boolean;
  error: string | null;
}

export function useCurrentCoach(): CoachState {
  const [coachProfile, setCoachProfile] = useState<Profile | null>(null);
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
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .eq('role', 'hs_coach')
          .maybeSingle();
        if (profileError) throw profileError;
        setCoachProfile(data as Profile);
      } catch (err: any) {
        setError(err?.message || 'Unable to load coach');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return { coachProfile, isLoading, error };
}
