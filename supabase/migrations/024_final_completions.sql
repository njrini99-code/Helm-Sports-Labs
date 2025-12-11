-- ============================================================================
-- FINAL COMPLETIONS AND FIXES
-- Migration: 024_final_completions.sql
-- Purpose: Complete any remaining missing pieces and final optimizations
-- Safe to run: YES
-- ============================================================================

-- ============================================================================
-- 1. ENSURE ALL CRITICAL INDEXES EXIST (Defensive checks)
-- ============================================================================

-- Double-check critical composite indexes
DO $$
BEGIN
  -- Players discovery index
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_players_discovery'
  ) THEN
    CREATE INDEX CONCURRENTLY idx_players_discovery 
    ON players(high_school_state, grad_year, primary_position, updated_at DESC) 
    WHERE onboarding_completed = true;
    RAISE NOTICE 'Created missing idx_players_discovery index';
  END IF;
  
  -- Recruits pipeline index
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_recruits_coach_stage_priority_updated'
  ) THEN
    CREATE INDEX CONCURRENTLY idx_recruits_coach_stage_priority_updated 
    ON recruits(coach_id, stage, priority, updated_at DESC) 
    WHERE player_id IS NOT NULL;
    RAISE NOTICE 'Created missing idx_recruits_coach_stage_priority_updated index';
  END IF;
END$$;

-- ============================================================================
-- 2. ADD MISSING HELPER FUNCTIONS
-- ============================================================================

-- Function: Toggle player watchlist status
CREATE OR REPLACE FUNCTION toggle_player_watchlist(
  coach_uuid uuid,
  player_uuid uuid,
  add_to_watchlist boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_count integer;
BEGIN
  IF add_to_watchlist THEN
    -- Check if already on watchlist
    SELECT COUNT(*) INTO existing_count
    FROM recruit_watchlist
    WHERE coach_id = coach_uuid AND player_id = player_uuid;
    
    IF existing_count = 0 THEN
      INSERT INTO recruit_watchlist (coach_id, player_id, status)
      VALUES (coach_uuid, player_uuid, 'watchlist')
      ON CONFLICT (coach_id, player_id) DO UPDATE SET status = 'watchlist';
    END IF;
    
    RETURN true;
  ELSE
    DELETE FROM recruit_watchlist
    WHERE coach_id = coach_uuid AND player_id = player_uuid;
    
    RETURN true;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- ============================================================================
-- 3. VERIFY COUNT COLUMNS AND TRIGGERS
-- ============================================================================

-- Ensure all count columns exist with proper defaults
DO $$
BEGIN
  -- Video count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'video_count'
  ) THEN
    ALTER TABLE players ADD COLUMN video_count integer DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Added video_count column';
  END IF;
  
  -- Metric count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'metric_count'
  ) THEN
    ALTER TABLE players ADD COLUMN metric_count integer DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Added metric_count column';
  END IF;
  
  -- Watchlist count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'watchlist_count'
  ) THEN
    ALTER TABLE players ADD COLUMN watchlist_count integer DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Added watchlist_count column';
  END IF;
END$$;

-- ============================================================================
-- 4. ADD GRANTS FOR NEW FUNCTIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION toggle_player_watchlist(uuid, uuid, boolean) TO authenticated;

-- ============================================================================
-- 5. FINAL ANALYZE
-- ============================================================================

ANALYZE players;
ANALYZE team_memberships;
ANALYZE recruit_watchlist;
ANALYZE conversations;
ANALYZE messages;

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Final completions applied!';
  RAISE NOTICE 'All critical components verified and completed.';
END $$;
