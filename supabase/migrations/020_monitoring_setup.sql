-- ============================================================================
-- DATABASE MONITORING SETUP MIGRATION
-- Migration: 020_monitoring_setup.sql
-- Purpose: Create views and functions for monitoring database performance
-- Safe to run: YES (creates views and functions only)
-- ============================================================================

-- ============================================================================
-- PHASE 3: MONITORING QUERIES AND VIEWS
-- ============================================================================

-- ============================================================================
-- 1. Index Usage Monitoring View
-- ============================================================================

CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  pg_size_pretty(pg_relation_size(indexrelid) + pg_relation_size(tablename::regclass)) AS total_size,
  CASE 
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 100 THEN 'LOW_USAGE'
    WHEN idx_scan < 1000 THEN 'MEDIUM_USAGE'
    ELSE 'HIGH_USAGE'
  END AS usage_category
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY 
  idx_scan ASC,
  pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- 2. Table Size Monitoring View
-- ============================================================================

CREATE OR REPLACE VIEW table_size_stats AS
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                 pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
  n_live_tup AS row_count,
  n_dead_tup AS dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_tables
LEFT JOIN pg_stat_user_tables USING (schemaname, tablename)
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- 3. Unused Indexes Function
-- ============================================================================

CREATE OR REPLACE FUNCTION get_unused_indexes(min_size_mb numeric DEFAULT 1.0)
RETURNS TABLE (
  schemaname text,
  tablename text,
  indexname text,
  index_size text,
  index_size_bytes bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    i.schemaname,
    i.tablename,
    i.indexname,
    pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
    pg_relation_size(i.indexrelid) AS index_size_bytes
  FROM pg_stat_user_indexes i
  WHERE i.schemaname = 'public'
    AND i.idx_scan = 0
    AND pg_relation_size(i.indexrelid) > (min_size_mb * 1024 * 1024)
  ORDER BY pg_relation_size(i.indexrelid) DESC;
$$;

-- ============================================================================
-- 4. Slow Query Monitoring (requires pg_stat_statements extension)
-- ============================================================================

-- Note: This requires the pg_stat_statements extension to be enabled
-- Run this manually in Supabase SQL editor if needed:
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

CREATE OR REPLACE VIEW slow_query_stats AS
SELECT 
  left(query, 100) AS query_preview,
  calls,
  total_exec_time::numeric(10,2) AS total_exec_time_ms,
  mean_exec_time::numeric(10,2) AS mean_exec_time_ms,
  max_exec_time::numeric(10,2) AS max_exec_time_ms,
  (shared_blks_hit::float / NULLIF(shared_blks_hit + shared_blks_read, 0))::numeric(5,4) AS cache_hit_ratio
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%information_schema%'
ORDER BY mean_exec_time DESC
LIMIT 50;

-- ============================================================================
-- 5. Index Bloat Detection Function
-- ============================================================================

CREATE OR REPLACE FUNCTION get_index_bloat(min_bloat_percent numeric DEFAULT 20.0)
RETURNS TABLE (
  schemaname text,
  tablename text,
  indexname text,
  index_size text,
  estimated_bloat_percent numeric,
  bloat_size text
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    i.schemaname::text,
    i.tablename::text,
    i.indexname::text,
    pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
    CASE 
      WHEN i.idx_scan = 0 THEN 100.0
      ELSE GREATEST(0, (1.0 - (i.idx_scan::numeric / GREATEST(1, i.idx_tup_read + i.idx_tup_fetch))) * 100)
    END AS estimated_bloat_percent,
    pg_size_pretty(
      (pg_relation_size(i.indexrelid) * 
       GREATEST(0, (1.0 - (i.idx_scan::numeric / GREATEST(1, i.idx_tup_read + i.idx_tup_fetch)))))::bigint
    ) AS bloat_size
  FROM pg_stat_user_indexes i
  WHERE i.schemaname = 'public'
    AND pg_relation_size(i.indexrelid) > 1024 * 1024  -- Only check indexes > 1MB
  ORDER BY estimated_bloat_percent DESC;
$$;

-- ============================================================================
-- 6. Database Health Check Function
-- ============================================================================

CREATE OR REPLACE FUNCTION get_database_health()
RETURNS TABLE (
  check_name text,
  status text,
  details text,
  recommendation text
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  unused_index_count integer;
  large_table_count integer;
  missing_stats_count integer;
BEGIN
  -- Check for unused indexes
  SELECT COUNT(*) INTO unused_index_count
  FROM get_unused_indexes(1.0);
  
  RETURN QUERY
  SELECT 
    'Unused Indexes'::text,
    CASE WHEN unused_index_count = 0 THEN 'OK' ELSE 'WARNING' END,
    unused_index_count::text || ' unused indexes found (>1MB)' AS details,
    CASE WHEN unused_index_count > 0 
      THEN 'Consider dropping unused indexes to save space' 
      ELSE 'No action needed' 
    END;
  
  -- Check for large tables without recent analyze
  SELECT COUNT(*) INTO large_table_count
  FROM table_size_stats
  WHERE pg_size_bytes(total_size) > 100 * 1024 * 1024  -- > 100MB
    AND (last_analyze IS NULL OR last_analyze < NOW() - INTERVAL '7 days')
    AND (last_autoanalyze IS NULL OR last_autoanalyze < NOW() - INTERVAL '7 days');
  
  RETURN QUERY
  SELECT 
    'Table Statistics'::text,
    CASE WHEN large_table_count = 0 THEN 'OK' ELSE 'WARNING' END,
    large_table_count::text || ' large tables need statistics update' AS details,
    CASE WHEN large_table_count > 0 
      THEN 'Run ANALYZE on large tables for better query planning' 
      ELSE 'No action needed' 
    END;
  
  -- Check for tables with many dead rows
  SELECT COUNT(*) INTO missing_stats_count
  FROM pg_stat_user_tables
  WHERE n_dead_tup > 1000
    AND n_dead_tup::float / GREATEST(1, n_live_tup) > 0.1;  -- > 10% dead rows
  
  RETURN QUERY
  SELECT 
    'Dead Rows'::text,
    CASE WHEN missing_stats_count = 0 THEN 'OK' ELSE 'WARNING' END,
    missing_stats_count::text || ' tables have >10% dead rows' AS details,
    CASE WHEN missing_stats_count > 0 
      THEN 'Run VACUUM to reclaim space from dead rows' 
      ELSE 'No action needed' 
    END;
END;
$$;

-- ============================================================================
-- 7. Quick Performance Summary View
-- ============================================================================

CREATE OR REPLACE VIEW performance_summary AS
SELECT 
  'Total Tables' AS metric,
  COUNT(*)::text AS value
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Total Indexes' AS metric,
  COUNT(*)::text AS value
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Unused Indexes (>1MB)' AS metric,
  COUNT(*)::text AS value
FROM get_unused_indexes(1.0)
UNION ALL
SELECT 
  'Database Size' AS metric,
  pg_size_pretty(pg_database_size(current_database())) AS value
UNION ALL
SELECT 
  'Total Index Size' AS metric,
  pg_size_pretty((
    SELECT SUM(pg_relation_size(indexrelid))
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
  )) AS value
UNION ALL
SELECT 
  'Average Index Scans' AS metric,
  ROUND(AVG(idx_scan))::text AS value
FROM pg_stat_user_indexes
WHERE schemaname = 'public';

-- ============================================================================
-- 8. Maintenance Recommendations Function
-- ============================================================================

CREATE OR REPLACE FUNCTION get_maintenance_recommendations()
RETURNS TABLE (
  priority text,
  action text,
  reason text,
  command text
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  bloat_count integer;
  old_stats_count integer;
BEGIN
  -- Check for index bloat
  SELECT COUNT(*) INTO bloat_count
  FROM get_index_bloat(30.0)
  WHERE estimated_bloat_percent > 30;
  
  IF bloat_count > 0 THEN
    RETURN QUERY
    SELECT 
      'HIGH'::text,
      'Reindex bloated indexes'::text,
      bloat_count::text || ' indexes have >30% estimated bloat'::text,
      'REINDEX INDEX CONCURRENTLY <index_name>'::text;
  END IF;
  
  -- Check for old statistics
  SELECT COUNT(*) INTO old_stats_count
  FROM table_size_stats
  WHERE pg_size_bytes(total_size) > 50 * 1024 * 1024  -- > 50MB
    AND (last_analyze IS NULL OR last_analyze < NOW() - INTERVAL '3 days')
    AND (last_autoanalyze IS NULL OR last_autoanalyze < NOW() - INTERVAL '3 days');
  
  IF old_stats_count > 0 THEN
    RETURN QUERY
    SELECT 
      'MEDIUM'::text,
      'Update table statistics'::text,
      old_stats_count::text || ' large tables need statistics update'::text,
      'ANALYZE <table_name>'::text;
  END IF;
  
  -- Check for unused indexes
  IF (SELECT COUNT(*) FROM get_unused_indexes(5.0)) > 0 THEN
    RETURN QUERY
    SELECT 
      'LOW'::text,
      'Review unused indexes'::text,
      (SELECT COUNT(*)::text FROM get_unused_indexes(5.0)) || ' large unused indexes (>5MB) found'::text,
      'DROP INDEX CONCURRENTLY <index_name>'::text;
  END IF;
END;
$$;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant select on views to authenticated users (adjust as needed for your security model)
GRANT SELECT ON index_usage_stats TO authenticated;
GRANT SELECT ON table_size_stats TO authenticated;
GRANT SELECT ON slow_query_stats TO authenticated;
GRANT SELECT ON performance_summary TO authenticated;

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_unused_indexes(numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION get_index_bloat(numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_health() TO authenticated;
GRANT EXECUTE ON FUNCTION get_maintenance_recommendations() TO authenticated;

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Monitoring setup complete!';
  RAISE NOTICE 'Views and functions created for database performance monitoring.';
  RAISE NOTICE 'Run SELECT * FROM get_database_health() to check database health.';
END $$;
