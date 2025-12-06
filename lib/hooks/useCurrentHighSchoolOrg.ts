import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { HighSchoolOrganization } from '@/types/organization';

interface OrgState {
  org: HighSchoolOrganization | null;
  isLoading: boolean;
  error: string | null;
}

export function useCurrentHighSchoolOrg(coachProfileId?: string | null): OrgState {
  const [org, setOrg] = useState<HighSchoolOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coachProfileId) return;
    const supabase = createClient();
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: orgError } = await supabase
          .from('organization_memberships')
          .select(
            `
              id,
              organization:organizations (
                id,
                name,
                type,
                location_city,
                location_state,
                logo_url,
                banner_url,
                website_url,
                description,
                conference,
                division,
                created_at,
                updated_at
              )
            `
          )
          .eq('profile_id', coachProfileId)
          .limit(1)
          .maybeSingle();
        if (orgError) throw orgError;
        const organization = (data as any)?.organization;
        if (organization && organization.type === 'high_school') {
          setOrg(organization as HighSchoolOrganization);
        } else {
          setOrg(null);
        }
      } catch (err: any) {
        setError(err?.message || 'Unable to load high school org');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [coachProfileId]);

  return { org, isLoading, error };
}
