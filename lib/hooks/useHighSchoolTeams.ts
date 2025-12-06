import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Team } from '@/types/team';

interface TeamsState {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
}

export function useHighSchoolTeams(orgId?: string | null): TeamsState {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .eq('org_id', orgId);
        if (teamsError) throw teamsError;
        setTeams((data || []) as Team[]);
      } catch (err: any) {
        setError(err?.message || 'Unable to load teams');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [orgId]);

  return { teams, isLoading, error };
}
