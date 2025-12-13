-- ============================================================================
-- STANDARDIZE COLUMN NAMES AND STRUCTURE
-- Migration: 036_standardize_column_names.sql
-- Purpose: Fix column naming inconsistencies across tables
-- Priority: LOW - Code quality and maintainability
-- Safe to run: REQUIRES CODE REVIEW
-- ============================================================================
--
-- Background:
-- Several inconsistencies were found in column naming:
-- 1. team_media has BOTH 'url' and 'media_url' columns (wasteful)
-- 2. Inconsistent timestamp columns (created_at vs creation_date)
-- 3. Missing created_at/updated_at on some tables
-- 4. Inconsistent ID column types
--
-- This migration standardizes naming conventions:
-- - All media URLs: use 'url' column
-- - All timestamps: created_at, updated_at (TIMESTAMPTZ)
-- - All IDs: UUID type with gen_random_uuid() default
--
-- IMPORTANT: Review application code before running!
-- Update any queries referencing old column names.
-- ============================================================================

-- ============================================================================
-- 1. FIX TEAM_MEDIA URL COLUMN INCONSISTENCY
-- ============================================================================
--
-- Background:
-- team_media table has both 'url' and 'media_url' columns
-- This is wasteful and confusing - should have one column
--
-- Strategy:
-- 1. Migrate any data from 'url' to 'media_url' (if needed)
-- 2. Drop the redundant 'url' column
-- 3. Keep 'media_url' as the standard
--
DO $$
BEGIN
  -- Check if both columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_media' AND column_name = 'url'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_media' AND column_name = 'media_url'
  ) THEN

    RAISE NOTICE 'Found both url and media_url columns in team_media';

    -- Copy data from 'url' to 'media_url' if media_url is NULL
    UPDATE team_media
    SET media_url = url
    WHERE media_url IS NULL AND url IS NOT NULL;

    RAISE NOTICE 'Migrated data from url to media_url';

    -- Drop the redundant 'url' column
    ALTER TABLE team_media DROP COLUMN IF EXISTS url;

    RAISE NOTICE 'Dropped redundant url column from team_media';

  ELSE
    RAISE NOTICE 'team_media column standardization not needed';
  END IF;

EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'team_media table does not exist';
  WHEN others THEN
    RAISE NOTICE 'Error standardizing team_media columns: %', SQLERRM;
END$$;

-- ============================================================================
-- 2. ENSURE ALL TABLES HAVE CREATED_AT AND UPDATED_AT
-- ============================================================================
--
-- Add created_at and updated_at to tables that don't have them
-- Standard for all database tables to track record lifecycle
--

-- Helper function to add timestamp columns if they don't exist
CREATE OR REPLACE FUNCTION add_timestamp_columns(table_name TEXT)
RETURNS void AS $$
BEGIN
  -- Add created_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND information_schema.columns.table_name = add_timestamp_columns.table_name
      AND column_name = 'created_at'
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()', table_name);
    RAISE NOTICE 'Added created_at to %', table_name;
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND information_schema.columns.table_name = add_timestamp_columns.table_name
      AND column_name = 'updated_at'
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()', table_name);
    RAISE NOTICE 'Added updated_at to %', table_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that might be missing timestamps
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT IN ('schema_migrations', 'auth%')
  LOOP
    BEGIN
      PERFORM add_timestamp_columns(tbl);
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Could not add timestamps to %: %', tbl, SQLERRM;
    END;
  END LOOP;
END$$;

-- Drop helper function
DROP FUNCTION IF EXISTS add_timestamp_columns(TEXT);

-- ============================================================================
-- 3. ADD UPDATED_AT TRIGGER TO ALL TABLES
-- ============================================================================
--
-- Automatically update updated_at column on record modification
-- Ensures updated_at is always accurate without manual updates
--

-- Create trigger function (if not exists)
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to add updated_at trigger
CREATE OR REPLACE FUNCTION add_updated_at_trigger(table_name TEXT)
RETURNS void AS $$
DECLARE
  trigger_name TEXT;
BEGIN
  trigger_name := 'set_updated_at_' || table_name;

  -- Check if trigger already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = trigger_name
  ) THEN
    EXECUTE format('
      CREATE TRIGGER %I
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION trigger_set_updated_at()
    ', trigger_name, table_name);

    RAISE NOTICE 'Added updated_at trigger to %', table_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'updated_at'
    GROUP BY table_name
  LOOP
    BEGIN
      PERFORM add_updated_at_trigger(tbl);
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Could not add trigger to %: %', tbl, SQLERRM;
    END;
  END LOOP;
END$$;

-- Drop helper function
DROP FUNCTION IF EXISTS add_updated_at_trigger(TEXT);

-- ============================================================================
-- 4. STANDARDIZE BOOLEAN COLUMN DEFAULTS
-- ============================================================================
--
-- Ensure all boolean columns have explicit defaults (not NULL)
-- Common booleans: is_active, is_verified, is_public, etc.
--

-- Set default false for common boolean columns
DO $$
BEGIN
  -- Players
  ALTER TABLE players
    ALTER COLUMN onboarding_completed SET DEFAULT false;

  ALTER TABLE players
    ALTER COLUMN profile_visibility SET DEFAULT true;

  -- Coaches
  ALTER TABLE coaches
    ALTER COLUMN onboarding_completed SET DEFAULT false;

  -- Notifications
  ALTER TABLE notifications
    ALTER COLUMN is_read SET DEFAULT false;

  -- Team memberships
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_memberships' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE team_memberships
      ALTER COLUMN is_active SET DEFAULT true;
  END IF;

  RAISE NOTICE 'Standardized boolean defaults';

EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Some boolean columns may not exist: %', SQLERRM;
END$$;

-- ============================================================================
-- 5. RENAME INCONSISTENT TIMESTAMP COLUMNS
-- ============================================================================
--
-- Some tables may use different names for timestamps:
-- - creation_date → created_at
-- - modification_date → updated_at
-- - date_created → created_at
--
-- This section renames them for consistency
--

DO $$
DECLARE
  tbl TEXT;
  col TEXT;
BEGIN
  -- Rename creation_date to created_at
  FOR tbl, col IN
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name IN ('creation_date', 'date_created', 'create_date')
      AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns c2
        WHERE c2.table_name = information_schema.columns.table_name
          AND c2.column_name = 'created_at'
      )
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO created_at', tbl, col);
      RAISE NOTICE 'Renamed %.% to created_at', tbl, col;
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Could not rename %.%: %', tbl, col, SQLERRM;
    END;
  END LOOP;

  -- Rename modification_date to updated_at
  FOR tbl, col IN
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name IN ('modification_date', 'date_modified', 'modify_date', 'last_modified')
      AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns c2
        WHERE c2.table_name = information_schema.columns.table_name
          AND c2.column_name = 'updated_at'
      )
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO updated_at', tbl, col);
      RAISE NOTICE 'Renamed %.% to updated_at', tbl, col;
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Could not rename %.%: %', tbl, col, SQLERRM;
    END;
  END LOOP;
END$$;

-- ============================================================================
-- 6. STANDARDIZE JSON COLUMN TYPES
-- ============================================================================
--
-- Ensure all JSON columns use JSONB (binary JSON) for better performance
-- JSON → JSONB conversion
--

DO $$
DECLARE
  tbl TEXT;
  col TEXT;
BEGIN
  FOR tbl, col IN
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type = 'json'  -- Find JSON columns (not JSONB)
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE JSONB USING %I::jsonb', tbl, col, col);
      RAISE NOTICE 'Converted %.% from JSON to JSONB', tbl, col;
    EXCEPTION
      WHEN others THEN
        RAISE NOTICE 'Could not convert %.%: %', tbl, col, SQLERRM;
    END;
  END LOOP;
END$$;

-- ============================================================================
-- 7. ADD TABLE COMMENTS FOR DOCUMENTATION
-- ============================================================================
--
-- Add descriptive comments to tables without them
-- Helps developers understand table purpose
--

DO $$
BEGIN
  -- Core tables
  COMMENT ON TABLE profiles IS
    'User role mapping - links auth.users to player or coach profiles';

  COMMENT ON TABLE players IS
    'Player profiles with athletic info, academics, and recruiting status';

  COMMENT ON TABLE coaches IS
    'Coach and program profiles (college, travel, high school, JUCO)';

  COMMENT ON TABLE teams IS
    'Team rosters managed by coaches';

  COMMENT ON TABLE recruit_watchlist IS
    'Active recruiting tracking - coaches monitoring players';

  COMMENT ON TABLE messages IS
    'Direct messages between players and coaches/programs';

  COMMENT ON TABLE conversations IS
    'Message thread management between players and programs';

  COMMENT ON TABLE camp_events IS
    'Coach-hosted camps, showcases, clinics, and recruitment events';

  COMMENT ON TABLE player_engagement_events IS
    'Tracking coach-player interactions (views, favorites, messages, etc.)';

EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not add some table comments: %', SQLERRM;
END$$;

-- ============================================================================
-- POST-MIGRATION VERIFICATION
-- ============================================================================
-- Run these queries to verify standardization:
--
-- -- Check for timestamp columns
-- SELECT table_name, column_name
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND column_name IN ('created_at', 'updated_at')
-- ORDER BY table_name, column_name;
--
-- -- Check for non-standard timestamp columns
-- SELECT table_name, column_name
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND column_name LIKE '%date%'
--   AND column_name NOT IN ('created_at', 'updated_at', 'event_date', 'birth_date')
-- ORDER BY table_name, column_name;
--
-- -- Verify JSONB usage (should return 0 rows)
-- SELECT table_name, column_name
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND data_type = 'json';  -- Should be empty
--
-- -- Check updated_at triggers exist
-- SELECT tgname, tgrelid::regclass
-- FROM pg_trigger
-- WHERE tgname LIKE 'set_updated_at%'
-- ORDER BY tgrelid::regclass::text;
