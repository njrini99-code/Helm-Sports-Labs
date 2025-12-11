-- ============================================================================
-- FINAL OPTIMIZATIONS AND FIXES
-- Migration: 021_final_optimizations.sql
-- Purpose: Complete any missing optimizations and fixes
-- Safe to run: YES
-- ============================================================================

-- ============================================================================
-- MISSING INDEXES FROM ANALYSIS
-- ============================================================================

-- Players: Index on user_id (if missing)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_user_id 
ON players(user_id) 
WHERE user_id IS NOT NULL;

-- Coaches: Index on user_id (if missing)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_coaches_user_id 
ON coaches(user_id) 
WHERE user_id IS NOT NULL;

-- Profiles: Index on id (user_id) if profiles table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id 
    ON profiles(id) 
    WHERE id IS NOT NULL;
  END IF;
END$$;

-- Colleges: Index on id if colleges table exists and is referenced
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'colleges') THEN
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_colleges_id 
    ON colleges(id) 
    WHERE id IS NOT NULL;
  END IF;
END$$;

-- ============================================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================================================

-- Players: Index for onboarding status (very common filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_onboarding_status 
ON players(onboarding_completed, created_at DESC) 
WHERE onboarding_completed = true;

-- Players: Index for grad year filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_grad_year_active 
ON players(grad_year, updated_at DESC) 
WHERE onboarding_completed = true AND grad_year IS NOT NULL;

-- Team memberships: Index for status filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_memberships_status 
ON team_memberships(status, joined_at DESC) 
WHERE status = 'active';

-- Recruits: Index for player lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recruits_player_id 
ON recruits(player_id) 
WHERE player_id IS NOT NULL;

-- Recruits: Index for stage filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recruits_stage 
ON recruits(stage, updated_at DESC) 
WHERE player_id IS NOT NULL;

-- ============================================================================
-- FUNCTION IMPROVEMENTS
-- ============================================================================

-- Replace simple search_players in 016 with enhanced version from 019
-- (The enhanced version is already in 019, this ensures it's the active one)
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
-- TRIGGER OPTIMIZATION
-- ============================================================================

-- Ensure triggers handle NULL values properly
-- Update video count trigger to handle edge cases
CREATE OR REPLACE FUNCTION update_player_video_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.player_id IS NOT NULL THEN
    UPDATE players 
    SET video_count = video_count + 1 
    WHERE id = NEW.player_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.player_id IS NOT NULL THEN
    UPDATE players 
    SET video_count = GREATEST(0, video_count - 1) 
    WHERE id = OLD.player_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update metric count trigger
CREATE OR REPLACE FUNCTION update_player_metric_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.player_id IS NOT NULL THEN
    UPDATE players 
    SET metric_count = metric_count + 1 
    WHERE id = NEW.player_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.player_id IS NOT NULL THEN
    UPDATE players 
    SET metric_count = GREATEST(0, metric_count - 1) 
    WHERE id = OLD.player_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update watchlist count trigger
CREATE OR REPLACE FUNCTION update_player_watchlist_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.player_id IS NOT NULL THEN
    UPDATE players 
    SET watchlist_count = watchlist_count + 1 
    WHERE id = NEW.player_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.player_id IS NOT NULL THEN
    UPDATE players 
    SET watchlist_count = GREATEST(0, watchlist_count - 1) 
    WHERE id = OLD.player_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update achievement count trigger
CREATE OR REPLACE FUNCTION update_player_achievement_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.player_id IS NOT NULL THEN
    UPDATE players 
    SET achievement_count = achievement_count + 1 
    WHERE id = NEW.player_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.player_id IS NOT NULL THEN
    UPDATE players 
    SET achievement_count = GREATEST(0, achievement_count - 1) 
    WHERE id = OLD.player_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================================
-- ADDITIONAL HELPER FUNCTIONS
-- ============================================================================

-- Function: Get player summary with all counts (optimized)
CREATE OR REPLACE FUNCTION get_player_summary(player_uuid uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  primary_position text,
  grad_year integer,
  high_school_state text,
  video_count integer,
  metric_count integer,
  watchlist_count integer,
  achievement_count integer,
  team_count integer,
  has_verified_metrics boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.primary_position,
    p.grad_year,
    p.high_school_state,
    p.video_count,
    p.metric_count,
    p.watchlist_count,
    p.achievement_count,
    p.team_count,
    COALESCE(p.verified_metrics, false) AS has_verified_metrics
  FROM players p
  WHERE p.id = player_uuid;
$$;

-- Function: Validate and fix count inconsistencies (for maintenance)
CREATE OR REPLACE FUNCTION fix_player_count_inconsistencies()
RETURNS TABLE (
  player_id uuid,
  column_name text,
  current_value integer,
  correct_value integer,
  fixed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec RECORD;
BEGIN
  -- Fix video_count
  FOR rec IN 
    SELECT p.id, p.video_count, COUNT(pv.id)::integer AS actual_count
    FROM players p
    LEFT JOIN player_videos pv ON pv.player_id = p.id
    GROUP BY p.id, p.video_count
    HAVING p.video_count != COUNT(pv.id)::integer
  LOOP
    UPDATE players SET video_count = rec.actual_count WHERE id = rec.id;
    RETURN QUERY SELECT rec.id, 'video_count'::text, rec.video_count, rec.actual_count, true;
  END LOOP;
  
  -- Fix metric_count
  FOR rec IN 
    SELECT p.id, p.metric_count, COUNT(pm.id)::integer AS actual_count
    FROM players p
    LEFT JOIN player_metrics pm ON pm.player_id = p.id
    GROUP BY p.id, p.metric_count
    HAVING p.metric_count != COUNT(pm.id)::integer
  LOOP
    UPDATE players SET metric_count = rec.actual_count WHERE id = rec.id;
    RETURN QUERY SELECT rec.id, 'metric_count'::text, rec.metric_count, rec.actual_count, true;
  END LOOP;
  
  -- Fix watchlist_count
  FOR rec IN 
    SELECT p.id, p.watchlist_count, COUNT(rw.id)::integer AS actual_count
    FROM players p
    LEFT JOIN recruit_watchlist rw ON rw.player_id = p.id
    GROUP BY p.id, p.watchlist_count
    HAVING p.watchlist_count != COUNT(rw.id)::integer
  LOOP
    UPDATE players SET watchlist_count = rec.actual_count WHERE id = rec.id;
    RETURN QUERY SELECT rec.id, 'watchlist_count'::text, rec.watchlist_count, rec.actual_count, true;
  END LOOP;
  
  -- Fix achievement_count
  FOR rec IN 
    SELECT p.id, p.achievement_count, COUNT(pa.id)::integer AS actual_count
    FROM players p
    LEFT JOIN player_achievements pa ON pa.player_id = p.id
    GROUP BY p.id, p.achievement_count
    HAVING p.achievement_count != COUNT(pa.id)::integer
  LOOP
    UPDATE players SET achievement_count = rec.actual_count WHERE id = rec.id;
    RETURN QUERY SELECT rec.id, 'achievement_count'::text, rec.achievement_count, rec.actual_count, true;
  END LOOP;
  
  -- Fix team_count
  FOR rec IN 
    SELECT p.id, p.team_count, COUNT(tm.id) FILTER (WHERE tm.status = 'active')::integer AS actual_count
    FROM players p
    LEFT JOIN team_memberships tm ON tm.player_id = p.id
    GROUP BY p.id, p.team_count
    HAVING p.team_count != COUNT(tm.id) FILTER (WHERE tm.status = 'active')::integer
  LOOP
    UPDATE players SET team_count = rec.actual_count WHERE id = rec.id;
    RETURN QUERY SELECT rec.id, 'team_count'::text, rec.team_count, rec.actual_count, true;
  END LOOP;
END;
$$;

-- ============================================================================
-- ANALYZE UPDATED TABLES
-- ============================================================================

ANALYZE players;
ANALYZE coaches;
ANALYZE team_memberships;
ANALYZE recruits;

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Final optimizations complete!';
  RAISE NOTICE 'All missing indexes and functions have been added.';
  RAISE NOTICE 'Trigger functions improved with NULL handling.';
  RAISE NOTICE 'Helper functions added for maintenance and validation.';
END $$;
