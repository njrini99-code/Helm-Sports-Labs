-- ============================================================================
-- OPTIMIZED QUERY FUNCTIONS MIGRATION
-- Migration: 019_query_functions_optimization.sql
-- Purpose: Create optimized helper functions for common query patterns
-- Safe to run: YES (creates/replaces functions only)
-- ============================================================================

-- ============================================================================
-- PHASE 2 & 3: OPTIMIZED QUERY FUNCTIONS
-- ============================================================================

-- ============================================================================
-- 1. Enhanced Player Search Function
-- ============================================================================

CREATE OR REPLACE FUNCTION search_players(
  search_term text,
  position_filter text DEFAULT NULL,
  state_filter text DEFAULT NULL,
  grad_year_filter integer DEFAULT NULL,
  limit_results integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  full_name text,
  primary_position text,
  secondary_position text,
  grad_year integer,
  high_school_state text,
  pitch_velo numeric,
  exit_velo numeric,
  sixty_time numeric,
  video_count integer,
  metric_count integer,
  watchlist_count integer,
  score real
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.primary_position,
    p.secondary_position,
    p.grad_year,
    p.high_school_state,
    p.pitch_velo,
    p.exit_velo,
    p.sixty_time,
    p.video_count,
    p.metric_count,
    p.watchlist_count,
    CASE 
      WHEN p.full_name ILIKE search_term || '%' THEN 1.0
      WHEN p.full_name ILIKE '%' || search_term || '%' THEN 0.8
      ELSE similarity(p.full_name, search_term)
    END AS score
  FROM players p
  WHERE 
    p.onboarding_completed = true
    AND p.full_name IS NOT NULL
    AND (search_term IS NULL OR search_term = '' OR (
      p.full_name ILIKE '%' || search_term || '%'
      OR p.full_name % search_term  -- trigram similarity
    ))
    AND (position_filter IS NULL OR p.primary_position = position_filter OR p.secondary_position = position_filter)
    AND (state_filter IS NULL OR p.high_school_state = state_filter)
    AND (grad_year_filter IS NULL OR p.grad_year = grad_year_filter)
  ORDER BY 
    CASE WHEN search_term IS NOT NULL AND search_term != '' AND p.full_name ILIKE search_term || '%' THEN 1 ELSE 2 END,
    similarity(p.full_name, COALESCE(search_term, '')) DESC NULLS LAST,
    p.watchlist_count DESC,
    p.updated_at DESC
  LIMIT limit_results;
END;
$$;

-- ============================================================================
-- 2. Get Trending Players
-- ============================================================================

CREATE OR REPLACE FUNCTION get_trending_players(
  days_back integer DEFAULT 7,
  limit_results integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  full_name text,
  primary_position text,
  grad_year integer,
  high_school_state text,
  recent_views integer,
  recent_updates integer,
  watchlist_count integer,
  score numeric
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.primary_position,
    p.grad_year,
    p.high_school_state,
    COALESCE(pe.recent_views_7d, 0)::integer AS recent_views,
    COALESCE(pe.recent_updates_30d, 0)::integer AS recent_updates,
    p.watchlist_count,
    (
      COALESCE(pe.recent_views_7d, 0) * 1.0 +
      COALESCE(pe.recent_updates_30d, 0) * 0.5 +
      p.watchlist_count * 2.0 +
      CASE WHEN p.video_count > 0 THEN 5.0 ELSE 0.0 END
    ) AS score
  FROM players p
  LEFT JOIN player_engagement pe ON pe.player_id = p.id
  WHERE 
    p.onboarding_completed = true
    AND (
      pe.last_activity_at > NOW() - (days_back || ' days')::interval
      OR p.updated_at > NOW() - (days_back || ' days')::interval
    )
  ORDER BY score DESC, p.updated_at DESC
  LIMIT limit_results;
END;
$$;

-- ============================================================================
-- 3. Get Coach Pipeline Summary
-- ============================================================================

CREATE OR REPLACE FUNCTION get_coach_pipeline_summary(coach_uuid uuid)
RETURNS TABLE (
  stage text,
  count bigint,
  avg_priority text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.stage,
    COUNT(*)::bigint AS count,
    MODE() WITHIN GROUP (ORDER BY r.priority) AS avg_priority
  FROM recruits r
  WHERE r.coach_id = coach_uuid
    AND r.player_id IS NOT NULL
  GROUP BY r.stage
  ORDER BY 
    CASE r.stage
      WHEN 'High Priority' THEN 1
      WHEN 'Watchlist' THEN 2
      WHEN 'Contacted' THEN 3
      WHEN 'Evaluating' THEN 4
      WHEN 'Offered' THEN 5
      ELSE 6
    END;
END;
$$;

-- ============================================================================
-- 4. Get Player Recommendations for Coach
-- ============================================================================

CREATE OR REPLACE FUNCTION get_player_recommendations(
  coach_uuid uuid,
  limit_results integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  full_name text,
  primary_position text,
  grad_year integer,
  high_school_state text,
  pitch_velo numeric,
  exit_velo numeric,
  sixty_time numeric,
  match_score numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  needs_record RECORD;
BEGIN
  -- Get coach's program needs
  SELECT * INTO needs_record
  FROM program_needs
  WHERE coach_id = coach_uuid;
  
  -- If no needs specified, return empty
  IF needs_record IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.primary_position,
    p.grad_year,
    p.high_school_state,
    p.pitch_velo,
    p.exit_velo,
    p.sixty_time,
    (
      CASE WHEN needs_record.positions_needed IS NOT NULL AND p.primary_position = ANY(needs_record.positions_needed) THEN 10.0 ELSE 0.0 END +
      CASE WHEN needs_record.grad_years_needed IS NOT NULL AND p.grad_year = ANY(needs_record.grad_years_needed) THEN 10.0 ELSE 0.0 END +
      CASE WHEN needs_record.preferred_states IS NOT NULL AND p.high_school_state = ANY(needs_record.preferred_states) THEN 5.0 ELSE 0.0 END +
      CASE WHEN needs_record.min_pitch_velo IS NOT NULL AND p.pitch_velo >= needs_record.min_pitch_velo THEN 5.0 ELSE 0.0 END +
      CASE WHEN needs_record.min_exit_velo IS NOT NULL AND p.exit_velo >= needs_record.min_exit_velo THEN 5.0 ELSE 0.0 END +
      CASE WHEN needs_record.max_sixty_time IS NOT NULL AND p.sixty_time <= needs_record.max_sixty_time THEN 5.0 ELSE 0.0 END +
      CASE WHEN p.verified_metrics = true THEN 3.0 ELSE 0.0 END +
      CASE WHEN p.video_count > 0 THEN 2.0 ELSE 0.0 END
    ) AS match_score
  FROM players p
  WHERE 
    p.onboarding_completed = true
    AND NOT EXISTS (
      SELECT 1 FROM recruits r
      WHERE r.coach_id = coach_uuid
        AND r.player_id = p.id
    )
    AND (
      needs_record.positions_needed IS NULL OR p.primary_position = ANY(needs_record.positions_needed)
    )
    AND (
      needs_record.grad_years_needed IS NULL OR p.grad_year = ANY(needs_record.grad_years_needed)
    )
    AND (
      needs_record.min_height IS NULL OR (p.height_feet * 12 + COALESCE(p.height_inches, 0)) >= needs_record.min_height
    )
    AND (
      needs_record.max_height IS NULL OR (p.height_feet * 12 + COALESCE(p.height_inches, 0)) <= needs_record.max_height
    )
    AND (
      needs_record.min_pitch_velo IS NULL OR p.pitch_velo >= needs_record.min_pitch_velo
    )
    AND (
      needs_record.min_exit_velo IS NULL OR p.exit_velo >= needs_record.min_exit_velo
    )
    AND (
      needs_record.max_sixty_time IS NULL OR p.sixty_time <= needs_record.max_sixty_time
    )
  ORDER BY match_score DESC, p.watchlist_count DESC, p.updated_at DESC
  LIMIT limit_results;
END;
$$;

-- ============================================================================
-- 5. Get Unread Message Count for User
-- ============================================================================

CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(unread_count), 0)::integer
  FROM conversation_participants
  WHERE user_id = user_uuid
    AND left_at IS NULL;
$$;

-- ============================================================================
-- 6. Get Conversation with Latest Message
-- ============================================================================

CREATE OR REPLACE FUNCTION get_conversations_with_messages(
  user_uuid uuid,
  limit_results integer DEFAULT 50
)
RETURNS TABLE (
  conversation_id uuid,
  conversation_type text,
  title text,
  last_message_text text,
  last_message_at timestamptz,
  last_message_by uuid,
  unread_count integer,
  participant_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS conversation_id,
    c.type AS conversation_type,
    c.title,
    c.last_message_text,
    c.last_message_at,
    c.last_message_by,
    cp.unread_count,
    (
      SELECT COUNT(*)::bigint
      FROM conversation_participants cp2
      WHERE cp2.conversation_id = c.id
        AND cp2.left_at IS NULL
    ) AS participant_count
  FROM conversations c
  INNER JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = user_uuid
  WHERE cp.left_at IS NULL
  ORDER BY c.last_message_at DESC NULLS LAST
  LIMIT limit_results;
END;
$$;

-- ============================================================================
-- 7. Bulk Update Player Engagement (for batch processing)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_player_engagement_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update recent_views_7d from profile views (if you have a profile_views table)
  -- This is a placeholder - adjust based on your actual analytics implementation
  UPDATE player_engagement pe
  SET 
    recent_views_7d = COALESCE((
      SELECT COUNT(*)::integer
      FROM activity_feed af
      WHERE af.related_player_id = pe.player_id
        AND af.activity_type = 'player_view'
        AND af.created_at > NOW() - INTERVAL '7 days'
    ), 0),
    recent_updates_30d = COALESCE((
      SELECT COUNT(*)::integer
      FROM players p
      WHERE p.id = pe.player_id
        AND p.updated_at > NOW() - INTERVAL '30 days'
    ), 0),
    last_activity_at = (
      SELECT MAX(updated_at)
      FROM players
      WHERE id = pe.player_id
    )
  WHERE EXISTS (SELECT 1 FROM players WHERE id = pe.player_id);
END;
$$;

-- ============================================================================
-- 8. Get Team Statistics
-- ============================================================================

CREATE OR REPLACE FUNCTION get_team_statistics(team_uuid uuid)
RETURNS TABLE (
  player_count integer,
  active_player_count integer,
  avg_grad_year numeric,
  positions_covered text[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer AS player_count,
    COUNT(*) FILTER (WHERE tm.status = 'active')::integer AS active_player_count,
    AVG(p.grad_year)::numeric AS avg_grad_year,
    ARRAY_AGG(DISTINCT p.primary_position) FILTER (WHERE p.primary_position IS NOT NULL) AS positions_covered
  FROM team_memberships tm
  JOIN players p ON p.id = tm.player_id
  WHERE tm.team_id = team_uuid;
END;
$$;

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Query functions optimization complete!';
  RAISE NOTICE 'Optimized helper functions created for common query patterns.';
END $$;
