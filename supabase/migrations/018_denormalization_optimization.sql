-- ============================================================================
-- DENORMALIZATION AND COUNT OPTIMIZATION MIGRATION
-- Migration: 018_denormalization_optimization.sql
-- Purpose: Add denormalized count columns and triggers to eliminate N+1 queries
-- Safe to run: YES (adds columns with defaults, safe to rollback)
-- ============================================================================

-- ============================================================================
-- PHASE 3: DENORMALIZATION (Count Columns)
-- ============================================================================

-- ============================================================================
-- 1. Add Count Columns to Players Table
-- ============================================================================

-- Video count (number of videos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'video_count'
  ) THEN
    ALTER TABLE players ADD COLUMN video_count integer DEFAULT 0 NOT NULL;
  END IF;
END$$;

-- Metric count (number of metrics)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'metric_count'
  ) THEN
    ALTER TABLE players ADD COLUMN metric_count integer DEFAULT 0 NOT NULL;
  END IF;
END$$;

-- Watchlist count (number of coaches watching)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'watchlist_count'
  ) THEN
    ALTER TABLE players ADD COLUMN watchlist_count integer DEFAULT 0 NOT NULL;
  END IF;
END$$;

-- Achievement count
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'achievement_count'
  ) THEN
    ALTER TABLE players ADD COLUMN achievement_count integer DEFAULT 0 NOT NULL;
  END IF;
END$$;

-- Team count (number of teams player is on)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'team_count'
  ) THEN
    ALTER TABLE players ADD COLUMN team_count integer DEFAULT 0 NOT NULL;
  END IF;
END$$;

-- ============================================================================
-- 2. Initialize Count Columns with Current Data
-- ============================================================================

-- Initialize video_count
UPDATE players p
SET video_count = COALESCE((
  SELECT COUNT(*)::integer
  FROM player_videos pv
  WHERE pv.player_id = p.id
), 0)
WHERE video_count = 0;

-- Initialize metric_count
UPDATE players p
SET metric_count = COALESCE((
  SELECT COUNT(*)::integer
  FROM player_metrics pm
  WHERE pm.player_id = p.id
), 0)
WHERE metric_count = 0;

-- Initialize watchlist_count
UPDATE players p
SET watchlist_count = COALESCE((
  SELECT COUNT(*)::integer
  FROM recruit_watchlist rw
  WHERE rw.player_id = p.id
), 0)
WHERE watchlist_count = 0;

-- Initialize achievement_count
UPDATE players p
SET achievement_count = COALESCE((
  SELECT COUNT(*)::integer
  FROM player_achievements pa
  WHERE pa.player_id = p.id
), 0)
WHERE achievement_count = 0;

-- Initialize team_count
UPDATE players p
SET team_count = COALESCE((
  SELECT COUNT(*)::integer
  FROM team_memberships tm
  WHERE tm.player_id = p.id AND tm.status = 'active'
), 0)
WHERE team_count = 0;

-- ============================================================================
-- 3. Create Triggers to Maintain Counts
-- ============================================================================

-- Function: Update player video count
CREATE OR REPLACE FUNCTION update_player_video_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE players 
    SET video_count = video_count + 1 
    WHERE id = NEW.player_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE players 
    SET video_count = GREATEST(0, video_count - 1) 
    WHERE id = OLD.player_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function: Update player metric count
CREATE OR REPLACE FUNCTION update_player_metric_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE players 
    SET metric_count = metric_count + 1 
    WHERE id = NEW.player_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE players 
    SET metric_count = GREATEST(0, metric_count - 1) 
    WHERE id = OLD.player_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function: Update player watchlist count
CREATE OR REPLACE FUNCTION update_player_watchlist_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE players 
    SET watchlist_count = watchlist_count + 1 
    WHERE id = NEW.player_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE players 
    SET watchlist_count = GREATEST(0, watchlist_count - 1) 
    WHERE id = OLD.player_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function: Update player achievement count
CREATE OR REPLACE FUNCTION update_player_achievement_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE players 
    SET achievement_count = achievement_count + 1 
    WHERE id = NEW.player_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE players 
    SET achievement_count = GREATEST(0, achievement_count - 1) 
    WHERE id = OLD.player_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function: Update player team count
CREATE OR REPLACE FUNCTION update_player_team_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE players 
    SET team_count = team_count + 1 
    WHERE id = NEW.player_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE players SET team_count = team_count + 1 WHERE id = NEW.player_id;
    ELSIF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE players SET team_count = GREATEST(0, team_count - 1) WHERE id = NEW.player_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE players 
    SET team_count = GREATEST(0, team_count - 1) 
    WHERE id = OLD.player_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================================
-- 4. Attach Triggers
-- ============================================================================

-- Video count trigger
DROP TRIGGER IF EXISTS trigger_update_video_count ON player_videos;
CREATE TRIGGER trigger_update_video_count
  AFTER INSERT OR DELETE ON player_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_player_video_count();

-- Metric count trigger
DROP TRIGGER IF EXISTS trigger_update_metric_count ON player_metrics;
CREATE TRIGGER trigger_update_metric_count
  AFTER INSERT OR DELETE ON player_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_player_metric_count();

-- Watchlist count trigger
DROP TRIGGER IF EXISTS trigger_update_watchlist_count ON recruit_watchlist;
CREATE TRIGGER trigger_update_watchlist_count
  AFTER INSERT OR DELETE ON recruit_watchlist
  FOR EACH ROW
  EXECUTE FUNCTION update_player_watchlist_count();

-- Achievement count trigger
DROP TRIGGER IF EXISTS trigger_update_achievement_count ON player_achievements;
CREATE TRIGGER trigger_update_achievement_count
  AFTER INSERT OR DELETE ON player_achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_player_achievement_count();

-- Team count trigger
DROP TRIGGER IF EXISTS trigger_update_team_count ON team_memberships;
CREATE TRIGGER trigger_update_team_count
  AFTER INSERT OR UPDATE OR DELETE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_player_team_count();

-- ============================================================================
-- 5. Add Indexes for Count-Based Queries
-- ============================================================================

-- Index for sorting by video count (popular players)
CREATE INDEX IF NOT EXISTS idx_players_video_count 
ON players(video_count DESC, updated_at DESC) 
WHERE onboarding_completed = true AND video_count > 0;

-- Index for sorting by watchlist count (trending players)
CREATE INDEX IF NOT EXISTS idx_players_watchlist_count 
ON players(watchlist_count DESC, updated_at DESC) 
WHERE onboarding_completed = true AND watchlist_count > 0;

-- Index for filtering players with metrics
CREATE INDEX IF NOT EXISTS idx_players_has_metrics 
ON players(metric_count DESC, verified_metrics) 
WHERE onboarding_completed = true AND metric_count > 0;

-- ============================================================================
-- 6. Add Count Columns to Teams Table
-- ============================================================================

-- Player count for teams
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'player_count'
  ) THEN
    ALTER TABLE teams ADD COLUMN player_count integer DEFAULT 0 NOT NULL;
  END IF;
END$$;

-- Initialize team player count
UPDATE teams t
SET player_count = COALESCE((
  SELECT COUNT(*)::integer
  FROM team_memberships tm
  WHERE tm.team_id = t.id AND tm.status = 'active'
), 0)
WHERE player_count = 0;

-- Function: Update team player count
CREATE OR REPLACE FUNCTION update_team_player_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE teams 
    SET player_count = player_count + 1 
    WHERE id = NEW.team_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'active' AND NEW.status = 'active' AND OLD.team_id = NEW.team_id THEN
      UPDATE teams SET player_count = player_count + 1 WHERE id = NEW.team_id;
    ELSIF OLD.status = 'active' AND NEW.status != 'active' AND OLD.team_id = NEW.team_id THEN
      UPDATE teams SET player_count = GREATEST(0, player_count - 1) WHERE id = NEW.team_id;
    ELSIF OLD.team_id != NEW.team_id THEN
      -- Team changed
      UPDATE teams SET player_count = GREATEST(0, player_count - 1) WHERE id = OLD.team_id;
      UPDATE teams SET player_count = player_count + 1 WHERE id = NEW.team_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE teams 
    SET player_count = GREATEST(0, player_count - 1) 
    WHERE id = OLD.team_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach team player count trigger (updates existing trigger)
DROP TRIGGER IF EXISTS trigger_update_team_player_count ON team_memberships;
CREATE TRIGGER trigger_update_team_player_count
  AFTER INSERT OR UPDATE OR DELETE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_team_player_count();

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Denormalization optimization complete!';
  RAISE NOTICE 'Count columns added and initialized.';
  RAISE NOTICE 'Triggers created to maintain counts automatically.';
END $$;
