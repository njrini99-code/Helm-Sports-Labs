-- ============================================================================
-- FIX MISSING COLUMNS AND EXTENSIONS
-- Migration: 023_fix_missing_columns_and_extensions.sql
-- Purpose: Add missing columns referenced in code and enable required extensions
-- Safe to run: YES
-- ============================================================================

-- ============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- Enable pg_stat_statements for query monitoring (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Ensure pg_trgm is enabled for text search (should already be enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- 2. VERIFY TEAM_MEMBERSHIPS COLUMNS EXIST
-- ============================================================================

-- The columns status, primary_team, and jersey_number should already exist
-- from migration 004, but verify and add if missing

-- Status column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_memberships' AND column_name = 'status'
  ) THEN
    ALTER TABLE team_memberships ADD COLUMN status text DEFAULT 'active';
    RAISE NOTICE 'Added status column to team_memberships';
  END IF;
END$$;

-- Primary team column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_memberships' AND column_name = 'primary_team'
  ) THEN
    ALTER TABLE team_memberships ADD COLUMN primary_team boolean DEFAULT true;
    RAISE NOTICE 'Added primary_team column to team_memberships';
  END IF;
END$$;

-- Jersey number column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_memberships' AND column_name = 'jersey_number'
  ) THEN
    ALTER TABLE team_memberships ADD COLUMN jersey_number text;
    RAISE NOTICE 'Added jersey_number column to team_memberships';
  END IF;
END$$;

-- Updated_at column (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_memberships' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE team_memberships ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE 'Added updated_at column to team_memberships';
  END IF;
END$$;

-- ============================================================================
-- 3. ADD INDEXES FOR NEW COLUMNS
-- ============================================================================

-- Index for status filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_memberships_status 
ON team_memberships(status) 
WHERE status = 'active';

-- Index for primary team lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_memberships_primary_team 
ON team_memberships(player_id, primary_team) 
WHERE primary_team = true;

-- ============================================================================
-- 4. UPDATE TRIGGER FOR UPDATED_AT
-- ============================================================================

-- Ensure updated_at trigger exists for team_memberships
DROP TRIGGER IF EXISTS set_updated_at_team_memberships ON team_memberships;
CREATE TRIGGER set_updated_at_team_memberships
  BEFORE UPDATE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 5. FIX SLOW_QUERY_STATS VIEW (Handle missing extension gracefully)
-- ============================================================================

-- Update slow_query_stats view to handle case where pg_stat_statements doesn't exist
CREATE OR REPLACE VIEW slow_query_stats AS
SELECT 
  'pg_stat_statements extension not enabled' AS query_preview,
  0 AS calls,
  0.0::numeric(10,2) AS total_exec_time_ms,
  0.0::numeric(10,2) AS mean_exec_time_ms,
  0.0::numeric(10,2) AS max_exec_time_ms,
  0.0::numeric(5,4) AS cache_hit_ratio
WHERE NOT EXISTS (
  SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
)
UNION ALL
SELECT 
  left(query, 100) AS query_preview,
  calls,
  total_exec_time::numeric(10,2) AS total_exec_time_ms,
  mean_exec_time::numeric(10,2) AS mean_exec_time_ms,
  max_exec_time::numeric(10,2) AS max_exec_time_ms,
  (shared_blks_hit::float / NULLIF(shared_blks_hit + shared_blks_read, 0))::numeric(5,4) AS cache_hit_ratio
FROM pg_stat_statements
WHERE EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements')
  AND query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%information_schema%'
ORDER BY mean_exec_time DESC
LIMIT 50;

-- ============================================================================
-- 6. ADD HELPER FUNCTION TO CHECK EXTENSION STATUS
-- ============================================================================

CREATE OR REPLACE FUNCTION check_required_extensions()
RETURNS TABLE (
  extension_name text,
  installed boolean,
  version text,
  recommendation text
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    'pg_stat_statements'::text AS extension_name,
    EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') AS installed,
    (SELECT extversion FROM pg_extension WHERE extname = 'pg_stat_statements') AS version,
    CASE 
      WHEN EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') 
      THEN 'Extension is installed'::text
      ELSE 'Run: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;'::text
    END AS recommendation
  UNION ALL
  SELECT 
    'pg_trgm'::text,
    EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') AS installed,
    (SELECT extversion FROM pg_extension WHERE extname = 'pg_trgm') AS version,
    CASE 
      WHEN EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') 
      THEN 'Extension is installed'::text
      ELSE 'Run: CREATE EXTENSION IF NOT EXISTS pg_trgm;'::text
    END AS recommendation
  UNION ALL
  SELECT 
    'pgcrypto'::text,
    EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') AS installed,
    (SELECT extversion FROM pg_extension WHERE extname = 'pgcrypto') AS version,
    CASE 
      WHEN EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') 
      THEN 'Extension is installed'::text
      ELSE 'Run: CREATE EXTENSION IF NOT EXISTS pgcrypto;'::text
    END AS recommendation;
$$;

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Missing columns and extensions fix complete!';
  RAISE NOTICE 'Check extension status: SELECT * FROM check_required_extensions();';
END $$;
