-- ============================================================================
-- FIX DATABASE IMPROVEMENTS
-- Migration: 012_fix_database_improvements.sql
-- Addresses all 5 identified improvements
-- ============================================================================

-- ============================================================================
-- IMPROVEMENT 1: Sync profiles.full_name and profiles.avatar_url
-- ============================================================================

-- Function to sync profile from player updates
CREATE OR REPLACE FUNCTION sync_profile_from_player()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    full_name = NEW.full_name,
    avatar_url = NEW.avatar_url,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync when player full_name or avatar_url changes
DROP TRIGGER IF EXISTS sync_profile_on_player_update ON players;
CREATE TRIGGER sync_profile_on_player_update
  AFTER UPDATE OF full_name, avatar_url ON players
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_from_player();

-- Function to sync profile from coach updates
CREATE OR REPLACE FUNCTION sync_profile_from_coach()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    full_name = NEW.full_name,
    avatar_url = COALESCE(NEW.logo_url, profiles.avatar_url),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync when coach full_name or logo_url changes
DROP TRIGGER IF EXISTS sync_profile_on_coach_update ON coaches;
CREATE TRIGGER sync_profile_on_coach_update
  AFTER UPDATE OF full_name, logo_url ON coaches
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_from_coach();

-- Initial sync: Populate profiles from existing players
UPDATE profiles
SET 
  full_name = p.full_name,
  avatar_url = p.avatar_url,
  updated_at = NOW()
FROM players p
WHERE profiles.id = p.user_id
  AND (profiles.full_name IS NULL OR profiles.avatar_url IS NULL);

-- Initial sync: Populate profiles from existing coaches
UPDATE profiles
SET 
  full_name = c.full_name,
  avatar_url = COALESCE(c.logo_url, profiles.avatar_url),
  updated_at = NOW()
FROM coaches c
WHERE profiles.id = c.user_id
  AND profiles.full_name IS NULL;

-- ============================================================================
-- IMPROVEMENT 2: Add constraint for player_stats.team_id
-- ============================================================================

-- Add CHECK constraint: team-based stats (with stat_type) require team_id
ALTER TABLE player_stats
DROP CONSTRAINT IF EXISTS check_team_stats_require_team_id;

ALTER TABLE player_stats
ADD CONSTRAINT check_team_stats_require_team_id
CHECK (
  (stat_type IS NULL) OR -- Legacy stats don't need team_id
  (team_id IS NOT NULL) -- New team stats require team_id
);

-- ============================================================================
-- IMPROVEMENT 3: Add GIN index on team_messages.recipient_ids
-- ============================================================================

-- Create GIN index for array operations on recipient_ids
CREATE INDEX IF NOT EXISTS idx_team_messages_recipient_ids_gin 
ON team_messages USING GIN (recipient_ids);

-- ============================================================================
-- IMPROVEMENT 4: Add validation constraint for player_stats event/game references
-- ============================================================================

-- Add CHECK constraint: ensure valid event/game reference combinations
ALTER TABLE player_stats
DROP CONSTRAINT IF EXISTS check_stats_has_event_or_game;

ALTER TABLE player_stats
ADD CONSTRAINT check_stats_has_event_or_game
CHECK (
  -- Legacy stats: can have event_id, no game_id, no stat_type
  (event_id IS NOT NULL AND game_id IS NULL AND stat_type IS NULL) OR
  -- New team stats: must have game_id when stat_type is set
  (stat_type IS NOT NULL AND game_id IS NOT NULL AND event_id IS NULL) OR
  -- Legacy stats without event: no references, no stat_type
  (event_id IS NULL AND game_id IS NULL AND stat_type IS NULL)
);

-- ============================================================================
-- IMPROVEMENT 5: Add constraint for player_stats.stat_type
-- ============================================================================

-- Add CHECK constraint: team-based stats require stat_type
ALTER TABLE player_stats
DROP CONSTRAINT IF EXISTS check_team_stats_require_type;

ALTER TABLE player_stats
ADD CONSTRAINT check_team_stats_require_type
CHECK (
  (team_id IS NULL) OR -- Legacy stats don't need stat_type
  (stat_type IS NOT NULL) -- Team stats require stat_type
);

-- ============================================================================
-- ADDITIONAL: Ensure stat_type matches when team_id is set
-- ============================================================================

-- This constraint is already covered by improvement 5, but we can add
-- a more specific constraint to ensure stat_type is valid when team_id exists
-- (This is already enforced by the CHECK constraint on stat_type column)

-- ============================================================================
-- VERIFICATION QUERIES (for manual checking)
-- ============================================================================

-- Check if profiles are synced:
-- SELECT p.id, p.full_name, p.avatar_url, pl.full_name as player_full_name, pl.avatar_url as player_avatar
-- FROM profiles p
-- LEFT JOIN players pl ON pl.user_id = p.id
-- WHERE p.role = 'player';

-- Check player_stats constraints:
-- SELECT COUNT(*) as stats_without_team_id 
-- FROM player_stats 
-- WHERE stat_type IS NOT NULL AND team_id IS NULL;

-- Check for invalid event/game combinations:
-- SELECT COUNT(*) as invalid_combinations
-- FROM player_stats
-- WHERE (event_id IS NOT NULL AND game_id IS NOT NULL)
--    OR (stat_type IS NOT NULL AND event_id IS NOT NULL AND game_id IS NULL);

