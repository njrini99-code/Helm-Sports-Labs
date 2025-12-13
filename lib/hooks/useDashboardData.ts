import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { isDevMode, DEV_ENTITY_IDS } from '@/lib/dev-mode';
import { toast } from 'sonner';
import type { Coach } from '@/lib/types';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface DashboardState<T = any> {
  /** Main data object */
  data: T | null;

  /** Loading state */
  loading: boolean;

  /** Error state */
  error: Error | null;

  /** Refetch function */
  refetch: () => Promise<void>;
}

export interface DashboardDataOptions {
  /** Redirect path if not authenticated */
  authRedirect?: string;

  /** Redirect path if no profile */
  onboardingRedirect?: string;

  /** Show error toasts */
  showErrors?: boolean;

  /** Auto-fetch on mount */
  autoFetch?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Hook
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generic hook for loading dashboard data with auth check
 * @param fetcher - Async function to fetch data
 * @param options - Configuration options
 */
export function useDashboardData<T = any>(
  fetcher: (supabase: ReturnType<typeof createClient>, userId: string) => Promise<T>,
  options: DashboardDataOptions = {}
): DashboardState<T> {
  const {
    authRedirect = '/auth/login',
    onboardingRedirect,
    showErrors = true,
    autoFetch = true,
  } = options;

  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check dev mode first
      if (isDevMode()) {
        const devData = await fetcher(supabase, DEV_ENTITY_IDS.coach);
        setData(devData);
        setLoading(false);
        return;
      }

      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push(authRedirect);
        return;
      }

      // Fetch data
      const result = await fetcher(supabase, user.id);

      // Check if onboarding redirect is needed (for null results)
      if (!result && onboardingRedirect) {
        router.push(onboardingRedirect);
        return;
      }

      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load dashboard data');
      setError(error);
      if (showErrors) {
        toast.error(error.message);
      }
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetcher, authRedirect, onboardingRedirect, showErrors, router]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Specialized Hook: Coach Dashboard Data
// ═══════════════════════════════════════════════════════════════════════════

export function useCoachDashboard() {
  return useDashboardData<Coach>(
    async (supabase, userId) => {
      if (isDevMode()) {
        const { data } = await supabase
          .from('coaches')
          .select('*')
          .eq('id', DEV_ENTITY_IDS.coach)
          .single();
        return data;
      }

      const { data } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', userId)
        .single();

      return data;
    },
    {
      authRedirect: '/auth/login',
      onboardingRedirect: '/onboarding/coach',
      showErrors: true,
    }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Specialized Hook: Profile Completion
// ═══════════════════════════════════════════════════════════════════════════

export function useProfileCompletion(coach: Coach | null): number {
  if (!coach) return 0;

  let score = 0;
  const weights = {
    full_name: 15,
    school_name: 20,
    organization_name: 20,
    school_city: 10,
    organization_city: 10,
    school_state: 10,
    organization_state: 10,
    about: 15,
    logo_url: 15,
    athletic_conference: 15,
  };

  Object.entries(weights).forEach(([field, weight]) => {
    if ((coach as any)[field]) {
      score += weight;
    }
  });

  return Math.min(100, score);
}

// ═══════════════════════════════════════════════════════════════════════════
// Specialized Hook: Retry with Exponential Backoff
// ═══════════════════════════════════════════════════════════════════════════

export function useRetryableQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
) {
  const [attempt, setAttempt] = useState(0);

  const fetchWithRetry = useCallback(async (): Promise<T> => {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        setAttempt(i);
        return await queryFn();
      } catch (error) {
        if (i === maxRetries) throw error;

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }, [queryFn, maxRetries, baseDelay]);

  return { fetchWithRetry, attempt };
}

// ═══════════════════════════════════════════════════════════════════════════
// Utility: Combine Multiple Dashboard Queries
// ═══════════════════════════════════════════════════════════════════════════

export function useCombinedDashboardData<T extends Record<string, any>>(
  queries: Record<keyof T, () => Promise<any>>
) {
  const [data, setData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, Error>>({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const results: Partial<T> = {};
    const errorMap: Record<string, Error> = {};

    await Promise.allSettled(
      Object.entries(queries).map(async ([key, queryFn]) => {
        try {
          results[key as keyof T] = await queryFn();
        } catch (error) {
          errorMap[key] = error instanceof Error ? error : new Error(`Failed to fetch ${key}`);
        }
      })
    );

    setData(results);
    setErrors(errorMap);
    setLoading(false);
  }, [queries]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, errors, refetch: fetchAll };
}
