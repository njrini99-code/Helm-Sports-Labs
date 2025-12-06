/**
 * Player Analytics Queries
 *
 * Functions to fetch and analyze player engagement data for the analytics dashboard.
 */

import { createClient } from '@/lib/supabase/client';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface EngagementSummary {
  total_views: number;
  unique_coaches: number;
  total_video_views: number;
  total_watchlist_adds: number;
  avg_view_duration_seconds: number | null;
  recent_coaches: RecentCoach[];
}

export interface RecentCoach {
  coach_id: string;
  full_name: string | null;
  program_name: string | null;
  last_viewed: string;
}

export interface ViewTrend {
  view_date: string;
  view_count: number;
  unique_coaches: number;
}

export interface EngagementEvent {
  id: string;
  player_id: string;
  coach_id: string | null;
  engagement_type: string;
  engagement_date: string;
  view_duration_seconds: number | null;
  coach?: {
    full_name: string | null;
    program_name: string | null;
    school_name: string | null;
    division_level: string | null;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Analytics Query Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get engagement summary for a player
 */
export async function getPlayerEngagementSummary(
  playerId: string,
  days: number = 30
): Promise<EngagementSummary | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .rpc('get_player_engagement_summary', {
      p_player_id: playerId,
      p_days: days,
    })
    .single();

  if (error || !data) {
    console.error('Error fetching engagement summary:', error);
    return null;
  }

  const result = data as any;
  return {
    total_views: result.total_views || 0,
    unique_coaches: result.unique_coaches || 0,
    total_video_views: result.total_video_views || 0,
    total_watchlist_adds: result.total_watchlist_adds || 0,
    avg_view_duration_seconds: result.avg_view_duration_seconds || null,
    recent_coaches: result.recent_coaches || [],
  };
}

/**
 * Get daily view trend for charting
 */
export async function getPlayerViewTrend(
  playerId: string,
  days: number = 30
): Promise<ViewTrend[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .rpc('get_player_view_trend', {
      p_player_id: playerId,
      p_days: days,
    });

  if (error) {
    console.error('Error fetching view trend:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    view_date: row.view_date,
    view_count: row.view_count || 0,
    unique_coaches: row.unique_coaches || 0,
  }));
}

/**
 * Get recent engagement events with coach details
 */
export async function getRecentEngagementEvents(
  playerId: string,
  limit: number = 20
): Promise<EngagementEvent[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('player_engagement_events')
    .select(
      `
      id,
      player_id,
      coach_id,
      engagement_type,
      engagement_date,
      view_duration_seconds,
      coaches:coach_id (
        full_name,
        program_name,
        school_name,
        division_level
      )
    `
    )
    .eq('player_id', playerId)
    .order('engagement_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching engagement events:', error);
    return [];
  }

  return (data || []).map((event: any) => ({
    id: event.id,
    player_id: event.player_id,
    coach_id: event.coach_id,
    engagement_type: event.engagement_type,
    engagement_date: event.engagement_date,
    view_duration_seconds: event.view_duration_seconds,
    coach: event.coaches,
  }));
}

/**
 * Get profile views grouped by coach (who's viewing the most)
 */
export async function getTopViewingCoaches(
  playerId: string,
  days: number = 30,
  limit: number = 10
): Promise<Array<{
  coach_id: string;
  full_name: string | null;
  program_name: string | null;
  division_level: string | null;
  view_count: number;
  last_viewed: string;
}>> {
  const supabase = createClient();

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('player_engagement_events')
    .select(
      `
      coach_id,
      engagement_date,
      coaches:coach_id (
        full_name,
        program_name,
        division_level
      )
    `
    )
    .eq('player_id', playerId)
    .eq('engagement_type', 'profile_view')
    .not('coach_id', 'is', null)
    .gte('engagement_date', since.toISOString())
    .order('engagement_date', { ascending: false });

  if (error) {
    console.error('Error fetching top viewing coaches:', error);
    return [];
  }

  // Group by coach and count views
  const coachMap = new Map<string, any>();

  for (const event of data || []) {
    if (!event.coach_id || !event.coaches) continue;

    // Supabase returns joined data, coaches might be an object or null
    const coachData = event.coaches as any;

    if (coachMap.has(event.coach_id)) {
      const existing = coachMap.get(event.coach_id);
      existing.view_count += 1;
      if (new Date(event.engagement_date) > new Date(existing.last_viewed)) {
        existing.last_viewed = event.engagement_date;
      }
    } else {
      coachMap.set(event.coach_id, {
        coach_id: event.coach_id,
        full_name: coachData?.full_name || null,
        program_name: coachData?.program_name || null,
        division_level: coachData?.division_level || null,
        view_count: 1,
        last_viewed: event.engagement_date,
      });
    }
  }

  // Convert to array and sort by view count
  const coaches = Array.from(coachMap.values());
  coaches.sort((a, b) => b.view_count - a.view_count);

  return coaches.slice(0, limit);
}

/**
 * Get engagement stats comparison (current period vs previous period)
 */
export async function getEngagementComparison(
  playerId: string,
  days: number = 7
): Promise<{
  current: EngagementSummary | null;
  previous: EngagementSummary | null;
  change: {
    views: number;
    coaches: number;
    watchlist_adds: number;
  };
}> {
  const current = await getPlayerEngagementSummary(playerId, days);
  const previous = await getPlayerEngagementSummary(playerId, days * 2);

  // Calculate previous period (subtract current from total)
  const previousPeriod = previous
    ? {
        total_views: Math.max(0, previous.total_views - (current?.total_views || 0)),
        unique_coaches: Math.max(0, previous.unique_coaches - (current?.unique_coaches || 0)),
        total_video_views: Math.max(0, previous.total_video_views - (current?.total_video_views || 0)),
        total_watchlist_adds: Math.max(0, previous.total_watchlist_adds - (current?.total_watchlist_adds || 0)),
        avg_view_duration_seconds: previous.avg_view_duration_seconds,
        recent_coaches: [],
      }
    : null;

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    current: current,
    previous: previousPeriod,
    change: {
      views: current && previousPeriod
        ? calculateChange(current.total_views, previousPeriod.total_views)
        : 0,
      coaches: current && previousPeriod
        ? calculateChange(current.unique_coaches, previousPeriod.unique_coaches)
        : 0,
      watchlist_adds: current && previousPeriod
        ? calculateChange(current.total_watchlist_adds, previousPeriod.total_watchlist_adds)
        : 0,
    },
  };
}

/**
 * Track a new engagement event (helper function for convenience)
 */
export async function trackEngagement(
  playerId: string,
  engagementType: 'profile_view' | 'video_view' | 'stats_view' | 'watchlist_add' | 'watchlist_remove' | 'message_sent',
  coachId?: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('player_engagement_events')
    .insert({
      player_id: playerId,
      coach_id: coachId || null,
      engagement_type: engagementType,
      engagement_date: new Date().toISOString(),
      metadata: metadata || null,
    });

  if (error) {
    console.error('Error tracking engagement:', error);
    return false;
  }

  return true;
}
