-- ============================================================================
-- NOT NULL CONSTRAINTS FOR DATA INTEGRITY
-- Migration: 033_add_not_null_constraints.sql
-- Purpose: Add NOT NULL constraints to required columns
-- Priority: HIGH - Prevents null pointer exceptions and data integrity issues
-- Safe to run: REQUIRES DATA CLEANUP FIRST
-- ============================================================================
--
-- Background:
-- Many columns are currently nullable but should always have values based on
-- business logic. Without NOT NULL constraints:
-- - UI can crash with null pointer exceptions
-- - Business logic becomes complex (checking for nulls everywhere)
-- - Data quality degrades over time
-- - Reporting/analytics return incomplete results
--
-- IMPORTANT: Before adding NOT NULL constraints, we must:
-- 1. Check for existing NULL values
-- 2. Set default values for existing NULL records
-- 3. Add the constraint
--
-- This migration includes data cleanup steps before each constraint.
-- ============================================================================

-- ============================================================================
-- PRE-FLIGHT CHECKS (RUN THESE FIRST)
-- ============================================================================
--
-- Check for NULL values in columns that should be required:
--
-- SELECT
--   COUNT(*) FILTER (WHERE grad_year IS NULL) as null_grad_year,
--   COUNT(*) FILTER (WHERE primary_position IS NULL) as null_position,
--   COUNT(*) FILTER (WHERE user_id IS NULL) as null_user_id
-- FROM players;
--
-- SELECT
--   COUNT(*) FILTER (WHERE coach_type IS NULL) as null_coach_type,
--   COUNT(*) FILTER (WHERE user_id IS NULL) as null_user_id
-- FROM coaches;
--
-- SELECT
--   COUNT(*) FILTER (WHERE name IS NULL) as null_name
-- FROM teams;
--
-- SELECT
--   COUNT(*) FILTER (WHERE body IS NULL) as null_body
-- FROM messages;
--
-- ============================================================================

-- ============================================================================
-- 1. PLAYERS TABLE - CRITICAL FIELDS
-- ============================================================================

-- grad_year: Essential for recruiting (determines eligibility)
-- First, set a default for existing NULL values (use 2099 as "unknown")
UPDATE players
SET grad_year = 2099
WHERE grad_year IS NULL;

-- Now add NOT NULL constraint
DO $$
BEGIN
  ALTER TABLE players
    ALTER COLUMN grad_year SET NOT NULL;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not set grad_year NOT NULL - check for remaining NULLs';
END$$;

-- primary_position: Essential for player profiles and recruiting filters
-- First, set a default for existing NULL values
UPDATE players
SET primary_position = 'Unknown'
WHERE primary_position IS NULL;

-- Now add NOT NULL constraint
DO $$
BEGIN
  ALTER TABLE players
    ALTER COLUMN primary_position SET NOT NULL;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not set primary_position NOT NULL - check for remaining NULLs';
END$$;

-- user_id: Critical - links player to auth user
-- DO NOT set default - these are orphaned records and should be investigated
-- Uncomment below only after manual review of NULL user_id records
--
-- DO $$
-- BEGIN
--   ALTER TABLE players
--     ALTER COLUMN user_id SET NOT NULL;
-- EXCEPTION
--   WHEN others THEN
--     RAISE NOTICE 'Could not set user_id NOT NULL - orphaned records exist';
-- END$$;

-- ============================================================================
-- 2. COACHES TABLE - CRITICAL FIELDS
-- ============================================================================

-- coach_type: CRITICAL - determines entire dashboard/feature access
-- First, set a default for existing NULL values (use 'travel' as default)
UPDATE coaches
SET coach_type = 'travel'
WHERE coach_type IS NULL;

-- Now add NOT NULL constraint
DO $$
BEGIN
  ALTER TABLE coaches
    ALTER COLUMN coach_type SET NOT NULL;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not set coach_type NOT NULL - check for remaining NULLs';
END$$;

-- user_id: Critical - links coach to auth user
-- DO NOT set default - these are orphaned records and should be investigated
-- Uncomment below only after manual review of NULL user_id records
--
-- DO $$
-- BEGIN
--   ALTER TABLE coaches
--     ALTER COLUMN user_id SET NOT NULL;
-- EXCEPTION
--   WHEN others THEN
--     RAISE NOTICE 'Could not set user_id NOT NULL - orphaned records exist';
-- END$$;

-- ============================================================================
-- 3. TEAMS TABLE - ESSENTIAL FIELDS
-- ============================================================================

-- name: Team name is required
UPDATE teams
SET name = 'Unnamed Team'
WHERE name IS NULL OR name = '';

DO $$
BEGIN
  ALTER TABLE teams
    ALTER COLUMN name SET NOT NULL;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not set teams.name NOT NULL - check for remaining NULLs';
END$$;

-- coach_id: Every team must have a coach
-- DO NOT set default - these need manual assignment
-- Uncomment below only after assigning coaches to all teams
--
-- DO $$
-- BEGIN
--   ALTER TABLE teams
--     ALTER COLUMN coach_id SET NOT NULL;
-- EXCEPTION
--   WHEN others THEN
--     RAISE NOTICE 'Could not set coach_id NOT NULL - orphaned teams exist';
-- END$$;

-- ============================================================================
-- 4. MESSAGES TABLE - CONTENT REQUIREMENTS
-- ============================================================================

-- body: Message cannot be empty (unless it has attachments)
-- Only update truly NULL messages, not empty strings (which may be valid)
UPDATE messages
SET body = '[No message content]'
WHERE body IS NULL;

DO $$
BEGIN
  ALTER TABLE messages
    ALTER COLUMN body SET NOT NULL;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not set messages.body NOT NULL - check for remaining NULLs';
END$$;

-- conversation_id: Every message must belong to a conversation
-- DO NOT set default - orphaned messages should be deleted
-- Uncomment below only after cleaning up orphaned messages
--
-- DO $$
-- BEGIN
--   ALTER TABLE messages
--     ALTER COLUMN conversation_id SET NOT NULL;
-- EXCEPTION
--   WHEN others THEN
--     RAISE NOTICE 'Could not set conversation_id NOT NULL - orphaned messages exist';
-- END$$;

-- ============================================================================
-- 5. CAMP_EVENTS TABLE - EVENT DETAILS
-- ============================================================================

-- name: Event name is required
UPDATE camp_events
SET name = 'Unnamed Event'
WHERE name IS NULL OR name = '';

DO $$
BEGIN
  ALTER TABLE camp_events
    ALTER COLUMN name SET NOT NULL;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not set camp_events.name NOT NULL - check for remaining NULLs';
END$$;

-- event_date: Event must have a date
-- DO NOT set default - events without dates should be investigated
-- Uncomment below only after setting dates for all events
--
-- DO $$
-- BEGIN
--   ALTER TABLE camp_events
--     ALTER COLUMN event_date SET NOT NULL;
-- EXCEPTION
--   WHEN others THEN
--     RAISE NOTICE 'Could not set event_date NOT NULL - events missing dates';
-- END$$;

-- ============================================================================
-- 6. RECRUIT_WATCHLIST TABLE - OWNERSHIP
-- ============================================================================

-- coach_id: Every watchlist entry must have an owner
-- DO NOT set default - orphaned entries should be deleted
-- Uncomment below only after cleaning up orphaned entries
--
-- DO $$
-- BEGIN
--   ALTER TABLE recruit_watchlist
--     ALTER COLUMN coach_id SET NOT NULL;
-- EXCEPTION
--   WHEN others THEN
--     RAISE NOTICE 'Could not set coach_id NOT NULL - orphaned watchlist entries exist';
-- END$$;

-- player_id: Every watchlist entry must reference a player
-- DO NOT set default - orphaned entries should be deleted
-- Uncomment below only after cleaning up orphaned entries
--
-- DO $$
-- BEGIN
--   ALTER TABLE recruit_watchlist
--     ALTER COLUMN player_id SET NOT NULL;
-- EXCEPTION
--   WHEN others THEN
--     RAISE NOTICE 'Could not set player_id NOT NULL - orphaned watchlist entries exist';
-- END$$;

-- ============================================================================
-- 7. TEAM_MEMBERSHIPS TABLE - RELATIONSHIPS
-- ============================================================================

-- team_id: Membership must reference a team
-- DO NOT set default - orphaned memberships should be deleted
-- Uncomment below only after cleaning up orphaned memberships
--
-- DO $$
-- BEGIN
--   ALTER TABLE team_memberships
--     ALTER COLUMN team_id SET NOT NULL;
-- EXCEPTION
--   WHEN others THEN
--     RAISE NOTICE 'Could not set team_id NOT NULL - orphaned memberships exist';
-- END$$;

-- player_id: Membership must reference a player
-- DO NOT set default - orphaned memberships should be deleted
-- Uncomment below only after cleaning up orphaned memberships
--
-- DO $$
-- BEGIN
--   ALTER TABLE team_memberships
--     ALTER COLUMN player_id SET NOT NULL;
-- EXCEPTION
--   WHEN others THEN
--     RAISE NOTICE 'Could not set player_id NOT NULL - orphaned memberships exist';
-- END$$;

-- ============================================================================
-- 8. PLAYER_METRICS TABLE - DATA OWNERSHIP
-- ============================================================================

-- player_id: Every metric must belong to a player
-- DO NOT set default - orphaned metrics should be deleted
-- Uncomment below only after cleaning up orphaned metrics
--
-- DO $$
-- BEGIN
--   ALTER TABLE player_metrics
--     ALTER COLUMN player_id SET NOT NULL;
-- EXCEPTION
--   WHEN others THEN
--     RAISE NOTICE 'Could not set player_id NOT NULL - orphaned metrics exist';
-- END$$;

-- ============================================================================
-- 9. TIMESTAMPS - CREATED_AT DEFAULTS
-- ============================================================================

-- Ensure all tables have created_at with default
-- This prevents NULL created_at values for new records

DO $$
BEGIN
  -- Players
  ALTER TABLE players
    ALTER COLUMN created_at SET DEFAULT NOW();

  -- Coaches
  ALTER TABLE coaches
    ALTER COLUMN created_at SET DEFAULT NOW();

  -- Teams
  ALTER TABLE teams
    ALTER COLUMN created_at SET DEFAULT NOW();

  -- Messages (if not already set)
  ALTER TABLE messages
    ALTER COLUMN created_at SET DEFAULT NOW();

  -- Conversations
  ALTER TABLE conversations
    ALTER COLUMN created_at SET DEFAULT NOW();

  -- Camp events
  ALTER TABLE camp_events
    ALTER COLUMN created_at SET DEFAULT NOW();

  -- Recruit watchlist
  ALTER TABLE recruit_watchlist
    ALTER COLUMN created_at SET DEFAULT NOW();

EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Some tables may not have created_at column';
END$$;

-- ============================================================================
-- 10. DEFAULT VALUES FOR BOOLEAN COLUMNS
-- ============================================================================

-- Ensure boolean columns have proper defaults (prevents null confusion)

DO $$
BEGIN
  -- Players: onboarding_completed default false
  ALTER TABLE players
    ALTER COLUMN onboarding_completed SET DEFAULT false;

  -- Players: profile_visibility default true
  ALTER TABLE players
    ALTER COLUMN profile_visibility SET DEFAULT true;

  -- Coaches: onboarding_completed default false
  ALTER TABLE coaches
    ALTER COLUMN onboarding_completed SET DEFAULT false;

  -- Notifications: is_read default false
  ALTER TABLE notifications
    ALTER COLUMN is_read SET DEFAULT false;

EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Some boolean columns may not exist';
END$$;

-- Update existing NULL boolean values to false
UPDATE players SET onboarding_completed = false WHERE onboarding_completed IS NULL;
UPDATE players SET profile_visibility = true WHERE profile_visibility IS NULL;
UPDATE coaches SET onboarding_completed = false WHERE onboarding_completed IS NULL;
UPDATE notifications SET is_read = false WHERE is_read IS NULL;

-- ============================================================================
-- POST-MIGRATION VERIFICATION
-- ============================================================================
-- Run this to verify constraints were added:
--
-- SELECT
--   a.attname AS column_name,
--   c.relname AS table_name,
--   a.attnotnull AS is_not_null,
--   pg_get_expr(d.adbin, d.adrelid) AS default_value
-- FROM pg_attribute a
-- JOIN pg_class c ON a.attrelid = c.oid
-- LEFT JOIN pg_attrdef d ON a.attrelid = d.adrelid AND a.attnum = d.adnum
-- WHERE c.relnamespace = 'public'::regnamespace
--   AND a.attnum > 0
--   AND NOT a.attisdropped
--   AND a.attname IN (
--     'grad_year', 'primary_position', 'coach_type', 'name', 'body'
--   )
-- ORDER BY c.relname, a.attname;
--
-- Expected: is_not_null = true for grad_year, primary_position, coach_type, etc.
