-- ============================================================================
-- UNIQUE CONSTRAINTS FOR DATA INTEGRITY
-- Migration: 032_add_unique_constraints.sql
-- Purpose: Add unique constraints to prevent duplicate records
-- Priority: HIGH - Data integrity and consistency
-- Safe to run: REQUIRES DATA CLEANUP FIRST
-- ============================================================================
--
-- Background:
-- Unique constraints prevent duplicate records that break business logic.
-- Without these constraints:
-- - One user_id can have multiple player/coach profiles
-- - Same player can be added to a team multiple times
-- - Duplicate camp registrations possible
-- - Data inconsistency in UI and reporting
--
-- IMPORTANT: Before running this migration, check for existing duplicates!
-- If duplicates exist, the ALTER TABLE commands will fail.
--
-- Pre-flight check queries are provided below to verify data integrity.
-- ============================================================================

-- ============================================================================
-- PRE-FLIGHT CHECKS (RUN THESE FIRST)
-- ============================================================================
--
-- Check for duplicate user_id in players table:
--
-- SELECT user_id, COUNT(*) as count
-- FROM players
-- WHERE user_id IS NOT NULL
-- GROUP BY user_id
-- HAVING COUNT(*) > 1;
--
-- If this returns rows, you have duplicates! Resolve before continuing.
--
-- ============================================================================
--
-- Check for duplicate user_id in coaches table:
--
-- SELECT user_id, COUNT(*) as count
-- FROM coaches
-- WHERE user_id IS NOT NULL
-- GROUP BY user_id
-- HAVING COUNT(*) > 1;
--
-- ============================================================================
--
-- Check for duplicate team memberships:
--
-- SELECT team_id, player_id, COUNT(*) as count
-- FROM team_memberships
-- GROUP BY team_id, player_id
-- HAVING COUNT(*) > 1;
--
-- ============================================================================

-- ============================================================================
-- 1. USER PROFILE UNIQUENESS
-- ============================================================================

-- CRITICAL: Ensure one user_id maps to exactly one player profile
-- This prevents a single auth user from having multiple player accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'players_user_id_unique'
  ) THEN
    ALTER TABLE players
      ADD CONSTRAINT players_user_id_unique UNIQUE (user_id);
  END IF;
END$$;

-- CRITICAL: Ensure one user_id maps to exactly one coach profile
-- This prevents a single auth user from having multiple coach accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'coaches_user_id_unique'
  ) THEN
    ALTER TABLE coaches
      ADD CONSTRAINT coaches_user_id_unique UNIQUE (user_id);
  END IF;
END$$;

-- ============================================================================
-- 2. TEAM MEMBERSHIP UNIQUENESS
-- ============================================================================

-- Prevent duplicate team memberships (same player added to team multiple times)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'team_memberships_team_player_unique'
  ) THEN
    ALTER TABLE team_memberships
      ADD CONSTRAINT team_memberships_team_player_unique
      UNIQUE (team_id, player_id);
  END IF;
END$$;

-- ============================================================================
-- 3. RECRUITING WATCHLIST UNIQUENESS
-- ============================================================================

-- Prevent duplicate watchlist entries (same coach tracking same player twice)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recruit_watchlist_coach_player_unique'
  ) THEN
    ALTER TABLE recruit_watchlist
      ADD CONSTRAINT recruit_watchlist_coach_player_unique
      UNIQUE (coach_id, player_id);
  END IF;
END$$;

-- ============================================================================
-- 4. CAMP REGISTRATION UNIQUENESS
-- ============================================================================

-- Prevent duplicate camp registrations (same player registering twice)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'camp_registrations_camp_player_unique'
  ) THEN
    ALTER TABLE camp_registrations
      ADD CONSTRAINT camp_registrations_camp_player_unique
      UNIQUE (camp_id, player_id);
  END IF;
END$$;

-- ============================================================================
-- 5. CONVERSATION UNIQUENESS
-- ============================================================================

-- Prevent duplicate conversation threads between same player and program
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'conversations_player_program_unique'
  ) THEN
    ALTER TABLE conversations
      ADD CONSTRAINT conversations_player_program_unique
      UNIQUE (player_id, program_id);
  END IF;
END$$;

-- ============================================================================
-- 6. RECRUITING INTERESTS UNIQUENESS
-- ============================================================================

-- Prevent duplicate interest records (same player interested in same program twice)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recruiting_interests_player_program_unique'
  ) THEN
    ALTER TABLE recruiting_interests
      ADD CONSTRAINT recruiting_interests_player_program_unique
      UNIQUE (player_id, program_id);
  END IF;
END$$;

-- ============================================================================
-- 7. CALENDAR EVENT PLAYERS UNIQUENESS
-- ============================================================================

-- Prevent duplicate player associations with calendar events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'coach_calendar_event_players_event_player_unique'
  ) THEN
    ALTER TABLE coach_calendar_event_players
      ADD CONSTRAINT coach_calendar_event_players_event_player_unique
      UNIQUE (event_id, player_id);
  END IF;
END$$;

-- ============================================================================
-- 8. TEAM COMMITMENTS UNIQUENESS
-- ============================================================================

-- Prevent duplicate commitment records (same player committing to same team twice)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'team_commitments_team_player_unique'
  ) THEN
    ALTER TABLE team_commitments
      ADD CONSTRAINT team_commitments_team_player_unique
      UNIQUE (team_id, player_id);
  END IF;
END$$;

-- ============================================================================
-- 9. PUSH SUBSCRIPTIONS UNIQUENESS
-- ============================================================================

-- Prevent duplicate push subscriptions (same endpoint registered twice)
-- Note: A user can have multiple devices, but each endpoint should be unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'push_subscriptions_endpoint_unique'
  ) THEN
    ALTER TABLE push_subscriptions
      ADD CONSTRAINT push_subscriptions_endpoint_unique
      UNIQUE (endpoint);
  END IF;
END$$;

-- ============================================================================
-- 10. NOTIFICATION PREFERENCES UNIQUENESS
-- ============================================================================

-- Ensure one set of preferences per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'notification_preferences_user_id_unique'
  ) THEN
    ALTER TABLE notification_preferences
      ADD CONSTRAINT notification_preferences_user_id_unique
      UNIQUE (user_id);
  END IF;
END$$;

-- ============================================================================
-- 11. ORGANIZATION MEMBERSHIPS UNIQUENESS
-- ============================================================================

-- Prevent duplicate organization memberships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'organization_memberships_org_user_unique'
  ) THEN
    ALTER TABLE organization_memberships
      ADD CONSTRAINT organization_memberships_org_user_unique
      UNIQUE (organization_id, user_id);
  END IF;
END$$;

-- ============================================================================
-- OPTIONAL: EMAIL/SLUG UNIQUENESS
-- ============================================================================
--
-- Consider adding if your schema has these columns:
--
-- -- Unique email for coaches (if not using auth.users.email)
-- ALTER TABLE coaches
--   ADD CONSTRAINT coaches_email_unique UNIQUE (email)
--   WHERE email IS NOT NULL;
--
-- -- Unique slugs for SEO-friendly URLs
-- ALTER TABLE players
--   ADD CONSTRAINT players_slug_unique UNIQUE (slug)
--   WHERE slug IS NOT NULL;
--
-- ALTER TABLE coaches
--   ADD CONSTRAINT coaches_slug_unique UNIQUE (slug)
--   WHERE slug IS NOT NULL;
--
-- ============================================================================

-- ============================================================================
-- POST-MIGRATION VERIFICATION
-- ============================================================================
-- Run this to verify all unique constraints were created:
--
-- SELECT
--   conrelid::regclass AS table_name,
--   conname AS constraint_name,
--   pg_get_constraintdef(oid) AS constraint_definition
-- FROM pg_constraint
-- WHERE contype = 'u'
--   AND connamespace = 'public'::regnamespace
--   AND conname LIKE '%_unique'
-- ORDER BY table_name, constraint_name;
--
-- Expected: 11+ unique constraints
