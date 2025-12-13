-- ============================================================================
-- CONSOLIDATE DUPLICATE TABLES
-- Migration: 034_consolidate_duplicate_tables.sql
-- Purpose: Merge redundant tables and remove deprecated structures
-- Priority: MEDIUM - Code cleanup and maintainability
-- Safe to run: REQUIRES MANUAL REVIEW
-- ============================================================================
--
-- Background:
-- The schema analysis identified several duplicate or overlapping tables:
-- 1. recruits vs recruit_watchlist (same purpose)
-- 2. college_interests vs recruiting_interests (overlapping)
-- 3. events vs camp_events vs recruitment_events (three event tables)
-- 4. player_stats vs game_stats vs verified_player_stats (may be intentional)
--
-- This migration consolidates these tables to:
-- - Reduce maintenance burden
-- - Improve data consistency
-- - Simplify application code
-- - Reduce database complexity
--
-- IMPORTANT: Review your application code before running this migration!
-- Ensure no active code references the deprecated tables.
-- ============================================================================

-- ============================================================================
-- PRE-FLIGHT CHECKS
-- ============================================================================
--
-- Check if deprecated tables have data:
--
-- SELECT
--   'recruits' as table_name,
--   COUNT(*) as row_count
-- FROM recruits
-- UNION ALL
-- SELECT 'college_interests', COUNT(*) FROM college_interests
-- UNION ALL
-- SELECT 'events', COUNT(*) FROM events
-- UNION ALL
-- SELECT 'recruitment_events', COUNT(*) FROM recruitment_events;
--
-- If any table has >0 rows, data migration is required before dropping.
--
-- ============================================================================

-- ============================================================================
-- 1. CONSOLIDATE RECRUITING TABLES: recruits → recruit_watchlist
-- ============================================================================
--
-- Background:
-- - 'recruits' table appears to be deprecated/legacy
-- - 'recruit_watchlist' is the active recruiting tracking table
-- - Both serve the same purpose: coaches tracking players
--
-- Action: Migrate any data from 'recruits' to 'recruit_watchlist'
-- ============================================================================

-- Step 1: Check if recruits table exists and has data
DO $$
DECLARE
  recruits_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recruits_count FROM recruits;

  IF recruits_count > 0 THEN
    RAISE NOTICE 'Found % records in recruits table - migrating to recruit_watchlist', recruits_count;

    -- Migrate data (adjust columns as needed based on actual schema)
    INSERT INTO recruit_watchlist (
      coach_id,
      player_id,
      status,
      notes,
      created_at,
      updated_at
    )
    SELECT
      r.coach_id,
      r.player_id,
      COALESCE(r.stage, 'prospecting') as status,  -- Map 'stage' to 'status'
      r.notes,
      r.created_at,
      r.updated_at
    FROM recruits r
    WHERE NOT EXISTS (
      -- Prevent duplicates if record already in watchlist
      SELECT 1 FROM recruit_watchlist rw
      WHERE rw.coach_id = r.coach_id
        AND rw.player_id = r.player_id
    );

    RAISE NOTICE 'Migration from recruits to recruit_watchlist complete';
  ELSE
    RAISE NOTICE 'recruits table is empty - no migration needed';
  END IF;

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'recruits table does not exist - skipping migration';
  WHEN others THEN
    RAISE NOTICE 'Error migrating recruits table: %', SQLERRM;
END$$;

-- Step 2: Drop the deprecated 'recruits' table (uncomment after verification)
-- WARNING: Only run after confirming migration was successful
--
-- DROP TABLE IF EXISTS recruits CASCADE;
--
-- RAISE NOTICE 'Dropped deprecated recruits table';

-- ============================================================================
-- 2. CONSOLIDATE RECRUITING INTERESTS TABLES
-- ============================================================================
--
-- Background:
-- - 'college_interests' and 'recruiting_interests' may overlap
-- - Need to determine if they serve different purposes or are duplicates
--
-- Recommended approach:
-- 1. Review both table schemas
-- 2. If identical → merge into recruiting_interests
-- 3. If different → document the distinction and keep both
--
-- ============================================================================

-- Check table schemas to determine if consolidation is needed
DO $$
DECLARE
  college_interests_exists BOOLEAN;
  recruiting_interests_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'college_interests'
  ) INTO college_interests_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'recruiting_interests'
  ) INTO recruiting_interests_exists;

  IF college_interests_exists AND recruiting_interests_exists THEN
    RAISE NOTICE 'Both college_interests and recruiting_interests exist - manual review needed';
    RAISE NOTICE 'Compare schemas and data before consolidation';
  ELSIF college_interests_exists THEN
    RAISE NOTICE 'Only college_interests exists - no consolidation needed';
  ELSIF recruiting_interests_exists THEN
    RAISE NOTICE 'Only recruiting_interests exists - no consolidation needed';
  ELSE
    RAISE NOTICE 'Neither table exists - skipping consolidation';
  END IF;
END$$;

-- If tables are identical, uncomment below to migrate:
--
-- INSERT INTO recruiting_interests (
--   player_id,
--   program_id,
--   interest_level,
--   created_at
-- )
-- SELECT
--   ci.player_id,
--   ci.college_id as program_id,
--   ci.interest_level,
--   ci.created_at
-- FROM college_interests ci
-- WHERE NOT EXISTS (
--   SELECT 1 FROM recruiting_interests ri
--   WHERE ri.player_id = ci.player_id
--     AND ri.program_id = ci.college_id
-- );
--
-- DROP TABLE IF EXISTS college_interests CASCADE;

-- ============================================================================
-- 3. CONSOLIDATE EVENT TABLES
-- ============================================================================
--
-- Background:
-- - Three event tables: 'events', 'camp_events', 'recruitment_events'
-- - Likely can be unified into single table with 'event_type' column
-- - Reduces code duplication and simplifies queries
--
-- Recommended structure:
-- - Keep 'camp_events' as primary (most comprehensive)
-- - Add 'event_type' enum: 'camp', 'recruitment', 'general'
-- - Migrate data from other tables
--
-- ============================================================================

-- Step 1: Add event_type column to camp_events if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camp_events'
      AND column_name = 'event_type'
  ) THEN
    -- Add event_type column with default 'camp'
    ALTER TABLE camp_events
      ADD COLUMN event_type TEXT DEFAULT 'camp' CHECK (
        event_type IN ('camp', 'recruitment', 'showcase', 'clinic', 'general')
      );

    RAISE NOTICE 'Added event_type column to camp_events';
  ELSE
    RAISE NOTICE 'event_type column already exists in camp_events';
  END IF;
END$$;

-- Step 2: Migrate data from 'events' table if it exists
DO $$
DECLARE
  events_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO events_count FROM events;

  IF events_count > 0 THEN
    RAISE NOTICE 'Migrating % records from events to camp_events', events_count;

    -- Adjust column mapping based on actual schema
    INSERT INTO camp_events (
      name,
      event_date,
      event_type,
      created_at
    )
    SELECT
      e.name,
      e.event_date,
      'general' as event_type,
      e.created_at
    FROM events e
    WHERE NOT EXISTS (
      SELECT 1 FROM camp_events ce
      WHERE ce.name = e.name
        AND ce.event_date = e.event_date
    );

    RAISE NOTICE 'Migration from events to camp_events complete';
  ELSE
    RAISE NOTICE 'events table is empty - no migration needed';
  END IF;

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'events table does not exist - skipping migration';
  WHEN others THEN
    RAISE NOTICE 'Error migrating events table: %', SQLERRM;
END$$;

-- Step 3: Migrate data from 'recruitment_events' if it exists
DO $$
DECLARE
  recruitment_events_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recruitment_events_count FROM recruitment_events;

  IF recruitment_events_count > 0 THEN
    RAISE NOTICE 'Migrating % records from recruitment_events to camp_events', recruitment_events_count;

    INSERT INTO camp_events (
      name,
      event_date,
      event_type,
      coach_id,
      created_at
    )
    SELECT
      re.name,
      re.event_date,
      'recruitment' as event_type,
      re.coach_id,
      re.created_at
    FROM recruitment_events re
    WHERE NOT EXISTS (
      SELECT 1 FROM camp_events ce
      WHERE ce.name = re.name
        AND ce.event_date = re.event_date
    );

    RAISE NOTICE 'Migration from recruitment_events to camp_events complete';
  ELSE
    RAISE NOTICE 'recruitment_events table is empty - no migration needed';
  END IF;

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'recruitment_events table does not exist - skipping migration';
  WHEN others THEN
    RAISE NOTICE 'Error migrating recruitment_events table: %', SQLERRM;
END$$;

-- Step 4: Drop deprecated event tables (uncomment after verification)
--
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS recruitment_events CASCADE;
--
-- RAISE NOTICE 'Dropped deprecated event tables';

-- ============================================================================
-- 4. PLAYER STATS TABLES REVIEW
-- ============================================================================
--
-- Background:
-- - player_stats: May be legacy/general stats
-- - game_stats: Per-game performance metrics
-- - verified_player_stats: Officially verified statistics
--
-- These tables may serve different purposes:
-- - player_stats: Season/career aggregates
-- - game_stats: Individual game breakdown
-- - verified_player_stats: Official records (NCAA, etc.)
--
-- RECOMMENDATION: Keep all three BUT document their purposes
--
-- ============================================================================

-- Add comments to document table purposes
COMMENT ON TABLE game_stats IS
  'Per-game performance statistics. Created in migration 025_fix_database_issues.sql. Use for game-by-game tracking.';

COMMENT ON TABLE verified_player_stats IS
  'Officially verified statistics from authoritative sources (schools, NCAA, etc.). Created in migration 025. Use for recruiting verification.';

DO $$
BEGIN
  COMMENT ON TABLE player_stats IS
    'Legacy/general player statistics. Consider migrating to game_stats or verified_player_stats.';
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'player_stats table does not exist';
END$$;

-- ============================================================================
-- 5. CLEANUP UNUSED TABLES
-- ============================================================================
--
-- Review and potentially drop these tables if confirmed unused:
-- - conversation_participants (if conversations already track participants)
-- - notification_queue (if using a different queue system)
-- - event_team_participants (if team_schedule covers this)
--
-- ============================================================================

-- Check if conversation_participants is used
DO $$
DECLARE
  participants_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO participants_count FROM conversation_participants;

  IF participants_count = 0 THEN
    RAISE NOTICE 'conversation_participants table is empty - candidate for removal';
    RAISE NOTICE 'Verify conversations table handles participants before dropping';
  ELSE
    RAISE NOTICE 'conversation_participants has % records - review before dropping', participants_count;
  END IF;

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'conversation_participants table does not exist';
END$$;

-- ============================================================================
-- POST-MIGRATION VERIFICATION
-- ============================================================================
-- Run these queries to verify consolidation:
--
-- -- Check recruit_watchlist has all data
-- SELECT COUNT(*) FROM recruit_watchlist;
--
-- -- Check camp_events includes all event types
-- SELECT event_type, COUNT(*) FROM camp_events GROUP BY event_type;
--
-- -- Verify deprecated tables are empty or dropped
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('recruits', 'events', 'recruitment_events', 'college_interests')
-- ORDER BY table_name;
--
-- Expected: Either empty tables or tables not found (dropped)
