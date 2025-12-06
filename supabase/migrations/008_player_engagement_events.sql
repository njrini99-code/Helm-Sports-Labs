-- ============================================================================
-- PLAYER ENGAGEMENT EVENTS MIGRATION
-- ============================================================================
-- This migration creates a table to track individual player engagement events
-- for analytics purposes. This allows us to show players:
-- - Who viewed their profile (coach names/programs)
-- - When views occurred (trending over time)
-- - View duration and engagement depth
-- ============================================================================

-- ============================================================================
-- CREATE player_engagement_events TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  coach_id uuid REFERENCES coaches(id) ON DELETE SET NULL,
  engagement_type text NOT NULL CHECK (engagement_type IN ('profile_view', 'video_view', 'stats_view', 'watchlist_add', 'watchlist_remove', 'message_sent')),
  engagement_date timestamptz NOT NULL DEFAULT now(),
  view_duration_seconds integer, -- How long they spent viewing
  metadata jsonb, -- Additional context (e.g., which video, which stat section)
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index for player queries (most common: "show me MY analytics")
CREATE INDEX IF NOT EXISTS idx_engagement_events_player_date
  ON player_engagement_events(player_id, engagement_date DESC);

-- Index for coach queries (less common: "what have I viewed recently?")
CREATE INDEX IF NOT EXISTS idx_engagement_events_coach_date
  ON player_engagement_events(coach_id, engagement_date DESC)
  WHERE coach_id IS NOT NULL;

-- Index for engagement type queries
CREATE INDEX IF NOT EXISTS idx_engagement_events_type
  ON player_engagement_events(player_id, engagement_type, engagement_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE player_engagement_events ENABLE ROW LEVEL SECURITY;

-- Players can read their own engagement events
DROP POLICY IF EXISTS "Players can read own engagement" ON player_engagement_events;
CREATE POLICY "Players can read own engagement" ON player_engagement_events
  FOR SELECT
  TO authenticated
  USING (
    player_id IN (
      SELECT id FROM players WHERE user_id = auth.uid()
    )
  );

-- Coaches can read events where they are the coach
DROP POLICY IF EXISTS "Coaches can read own events" ON player_engagement_events;
CREATE POLICY "Coaches can read own events" ON player_engagement_events
  FOR SELECT
  TO authenticated
  USING (
    coach_id IN (
      SELECT id FROM coaches WHERE user_id = auth.uid()
    )
  );

-- Anyone can insert engagement events (public profiles can be viewed)
DROP POLICY IF EXISTS "Anyone can insert engagement" ON player_engagement_events;
CREATE POLICY "Anyone can insert engagement" ON player_engagement_events
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- ============================================================================
-- HELPER FUNCTION: Get engagement summary for a player
-- ============================================================================

CREATE OR REPLACE FUNCTION get_player_engagement_summary(p_player_id uuid, p_days integer DEFAULT 30)
RETURNS TABLE (
  total_views bigint,
  unique_coaches bigint,
  total_video_views bigint,
  total_watchlist_adds bigint,
  avg_view_duration_seconds numeric,
  recent_coaches jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE engagement_type = 'profile_view')::bigint as total_views,
    COUNT(DISTINCT coach_id) FILTER (WHERE engagement_type = 'profile_view' AND coach_id IS NOT NULL)::bigint as unique_coaches,
    COUNT(*) FILTER (WHERE engagement_type = 'video_view')::bigint as total_video_views,
    COUNT(*) FILTER (WHERE engagement_type = 'watchlist_add')::bigint as total_watchlist_adds,
    AVG(view_duration_seconds) FILTER (WHERE view_duration_seconds IS NOT NULL) as avg_view_duration_seconds,
    (
      SELECT jsonb_agg(DISTINCT jsonb_build_object(
        'coach_id', c.id,
        'full_name', c.full_name,
        'program_name', c.program_name,
        'last_viewed', MAX(e.engagement_date)
      ))
      FROM player_engagement_events e
      LEFT JOIN coaches c ON c.id = e.coach_id
      WHERE e.player_id = p_player_id
        AND e.coach_id IS NOT NULL
        AND e.engagement_type = 'profile_view'
        AND e.engagement_date >= now() - (p_days || ' days')::interval
      GROUP BY c.id, c.full_name, c.program_name
      LIMIT 10
    ) as recent_coaches
  FROM player_engagement_events
  WHERE player_id = p_player_id
    AND engagement_date >= now() - (p_days || ' days')::interval;
END;
$$;

-- ============================================================================
-- HELPER FUNCTION: Get daily view counts (for trending chart)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_player_view_trend(p_player_id uuid, p_days integer DEFAULT 30)
RETURNS TABLE (
  view_date date,
  view_count bigint,
  unique_coaches bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(engagement_date) as view_date,
    COUNT(*)::bigint as view_count,
    COUNT(DISTINCT coach_id)::bigint as unique_coaches
  FROM player_engagement_events
  WHERE player_id = p_player_id
    AND engagement_type = 'profile_view'
    AND engagement_date >= now() - (p_days || ' days')::interval
  GROUP BY DATE(engagement_date)
  ORDER BY view_date DESC;
END;
$$;

-- ============================================================================
-- UPDATE TRIGGER: Keep player_engagement table in sync
-- ============================================================================
-- The old player_engagement table stores aggregated counts.
-- We'll keep it for backwards compatibility and update it via trigger.

CREATE OR REPLACE FUNCTION sync_player_engagement_aggregates()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert the aggregate record
  INSERT INTO player_engagement (
    player_id,
    profile_views_count,
    watchlist_adds_count,
    last_viewed_at,
    last_activity_at,
    updated_at
  )
  SELECT
    NEW.player_id,
    COUNT(*) FILTER (WHERE engagement_type = 'profile_view')::integer,
    COUNT(*) FILTER (WHERE engagement_type = 'watchlist_add')::integer,
    MAX(engagement_date) FILTER (WHERE engagement_type = 'profile_view'),
    MAX(engagement_date),
    now()
  FROM player_engagement_events
  WHERE player_id = NEW.player_id
  ON CONFLICT (player_id)
  DO UPDATE SET
    profile_views_count = (
      SELECT COUNT(*)::integer
      FROM player_engagement_events
      WHERE player_id = NEW.player_id
        AND engagement_type = 'profile_view'
    ),
    watchlist_adds_count = (
      SELECT COUNT(*)::integer
      FROM player_engagement_events
      WHERE player_id = NEW.player_id
        AND engagement_type = 'watchlist_add'
    ),
    last_viewed_at = (
      SELECT MAX(engagement_date)
      FROM player_engagement_events
      WHERE player_id = NEW.player_id
        AND engagement_type = 'profile_view'
    ),
    last_activity_at = (
      SELECT MAX(engagement_date)
      FROM player_engagement_events
      WHERE player_id = NEW.player_id
    ),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_engagement_aggregates ON player_engagement_events;
CREATE TRIGGER trigger_sync_engagement_aggregates
  AFTER INSERT ON player_engagement_events
  FOR EACH ROW
  EXECUTE FUNCTION sync_player_engagement_aggregates();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE player_engagement_events IS 'Individual engagement events for analytics and tracking';
COMMENT ON COLUMN player_engagement_events.engagement_type IS 'Type of engagement: profile_view, video_view, watchlist_add, etc.';
COMMENT ON COLUMN player_engagement_events.view_duration_seconds IS 'How long the coach spent viewing (optional tracking)';
COMMENT ON COLUMN player_engagement_events.metadata IS 'Additional context as JSON (e.g., which video was viewed)';
COMMENT ON FUNCTION get_player_engagement_summary IS 'Get aggregated engagement metrics for a player over a time period';
COMMENT ON FUNCTION get_player_view_trend IS 'Get daily view counts for trending charts';
