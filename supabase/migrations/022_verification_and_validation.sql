-- ============================================================================
-- VERIFICATION AND VALIDATION MIGRATION
-- Migration: 022_verification_and_validation.sql
-- Purpose: Verify all optimizations are in place and validate setup
-- Safe to run: YES (read-only checks and reporting functions)
-- ============================================================================

-- ============================================================================
-- VERIFICATION FUNCTIONS
-- ============================================================================

-- Function: Verify all optimizations are deployed
CREATE OR REPLACE FUNCTION verify_optimizations_deployed()
RETURNS TABLE (
  optimization_type text,
  expected_count integer,
  actual_count integer,
  status text,
  details text
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  index_count integer;
  function_count integer;
  trigger_count integer;
  count_column_count integer;
BEGIN
  -- Check indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
  
  RETURN QUERY
  SELECT 
    'Indexes'::text,
    50 AS expected_count,
    index_count AS actual_count,
    CASE WHEN index_count >= 50 THEN 'OK'::text ELSE 'WARNING'::text END,
    'Found ' || index_count || ' optimization indexes' AS details;
  
  -- Check functions
  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN (
      'search_players', 'get_trending_players', 'get_coach_pipeline_summary',
      'get_player_recommendations', 'get_unread_message_count',
      'get_conversations_with_messages', 'update_player_engagement_stats',
      'get_team_statistics', 'is_coach_of_player', 'has_org_role',
      'is_conversation_participant', 'get_player_team_ids_for_coach',
      'get_unused_indexes', 'get_index_bloat', 'get_database_health',
      'get_maintenance_recommendations', 'get_player_summary',
      'fix_player_count_inconsistencies'
    );
  
  RETURN QUERY
  SELECT 
    'Functions'::text,
    17 AS expected_count,
    function_count AS actual_count,
    CASE WHEN function_count >= 17 THEN 'OK'::text ELSE 'WARNING'::text END,
    'Found ' || function_count || ' optimization functions' AS details;
  
  -- Check triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%update_%count%';
  
  RETURN QUERY
  SELECT 
    'Count Triggers'::text,
    6 AS expected_count,
    trigger_count AS actual_count,
    CASE WHEN trigger_count >= 6 THEN 'OK'::text ELSE 'WARNING'::text END,
    'Found ' || trigger_count || ' count maintenance triggers' AS details;
  
  -- Check count columns
  SELECT COUNT(*) INTO count_column_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'players'
    AND column_name IN ('video_count', 'metric_count', 'watchlist_count', 'achievement_count', 'team_count');
  
  RETURN QUERY
  SELECT 
    'Count Columns (Players)'::text,
    5 AS expected_count,
    count_column_count AS actual_count,
    CASE WHEN count_column_count = 5 THEN 'OK'::text ELSE 'WARNING'::text END,
    'Found ' || count_column_count || ' count columns on players table' AS details;
  
  -- Check team count column
  SELECT COUNT(*) INTO count_column_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'teams'
    AND column_name = 'player_count';
  
  RETURN QUERY
  SELECT 
    'Count Columns (Teams)'::text,
    1 AS expected_count,
    count_column_count AS actual_count,
    CASE WHEN count_column_count = 1 THEN 'OK'::text ELSE 'WARNING'::text END,
    'Found ' || count_column_count || ' count columns on teams table' AS details;
  
  -- Check monitoring views
  SELECT COUNT(*) INTO function_count
  FROM information_schema.views
  WHERE table_schema = 'public'
    AND table_name IN ('index_usage_stats', 'table_size_stats', 'slow_query_stats', 'performance_summary');
  
  RETURN QUERY
  SELECT 
    'Monitoring Views'::text,
    4 AS expected_count,
    function_count AS actual_count,
    CASE WHEN function_count = 4 THEN 'OK'::text ELSE 'WARNING'::text END,
    'Found ' || function_count || ' monitoring views' AS details;
END;
$$;

-- Function: Get deployment summary
CREATE OR REPLACE FUNCTION get_optimization_deployment_summary()
RETURNS TABLE (
  category text,
  item_name text,
  status text,
  notes text
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    'Indexes' AS category,
    indexname AS item_name,
    CASE WHEN idx_scan > 0 THEN 'Active' ELSE 'Unused' END AS status,
    pg_size_pretty(pg_relation_size(indexrelid)) || ' - ' || idx_scan || ' scans' AS notes
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
  ORDER BY idx_scan DESC
  LIMIT 20
  
  UNION ALL
  
  SELECT 
    'Functions' AS category,
    routine_name AS item_name,
    'Deployed' AS status,
    routine_type AS notes
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN ('search_players', 'get_trending_players', 'get_database_health')
  ORDER BY routine_name
  
  UNION ALL
  
  SELECT 
    'Columns' AS category,
    table_name || '.' || column_name AS item_name,
    'Added' AS status,
    data_type AS notes
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'players'
    AND column_name LIKE '%_count'
  ORDER BY column_name;
$$;

-- Function: Check for potential issues
CREATE OR REPLACE FUNCTION check_optimization_issues()
RETURNS TABLE (
  severity text,
  issue_type text,
  description text,
  recommendation text
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  unused_large_indexes integer;
  zero_count_players integer;
  missing_triggers integer;
BEGIN
  -- Check for large unused indexes
  SELECT COUNT(*) INTO unused_large_indexes
  FROM get_unused_indexes(5.0);
  
  IF unused_large_indexes > 5 THEN
    RETURN QUERY
    SELECT 
      'MEDIUM'::text,
      'Unused Large Indexes'::text,
      unused_large_indexes::text || ' unused indexes larger than 5MB found'::text,
      'Consider dropping unused indexes to save space'::text;
  END IF;
  
  -- Check for players with incorrect counts (sample check)
  SELECT COUNT(*) INTO zero_count_players
  FROM players p
  WHERE p.onboarding_completed = true
    AND p.video_count = 0
    AND EXISTS (SELECT 1 FROM player_videos pv WHERE pv.player_id = p.id)
  LIMIT 10;
  
  IF zero_count_players > 0 THEN
    RETURN QUERY
    SELECT 
      'LOW'::text,
      'Count Inconsistencies'::text,
      'Some players have incorrect count values'::text,
      'Run fix_player_count_inconsistencies() to correct'::text;
  END IF;
  
  -- Check for missing triggers
  SELECT COUNT(*) INTO missing_triggers
  FROM (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_schema = 'public' AND trigger_name = 'trigger_update_video_count'
  ) t
  HAVING COUNT(*) = 0;
  
  IF missing_triggers > 0 THEN
    RETURN QUERY
    SELECT 
      'HIGH'::text,
      'Missing Triggers'::text,
      'Some count maintenance triggers are missing'::text,
      'Re-run migration 018 to create missing triggers'::text;
  END IF;
END;
$$;

-- ============================================================================
-- PERFORMANCE VALIDATION
-- ============================================================================

-- Function: Test query performance (benchmark)
CREATE OR REPLACE FUNCTION benchmark_optimizations()
RETURNS TABLE (
  test_name text,
  execution_time_ms numeric,
  status text
)
LANGUAGE plpgsql
AS $$
DECLARE
  start_time timestamptz;
  end_time timestamptz;
  elapsed_ms numeric;
BEGIN
  -- Test 1: Player search
  start_time := clock_timestamp();
  PERFORM * FROM search_players('test', NULL, NULL, NULL, 10);
  end_time := clock_timestamp();
  elapsed_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  RETURN QUERY
  SELECT 
    'Player Search'::text,
    elapsed_ms,
    CASE WHEN elapsed_ms < 100 THEN 'GOOD'::text WHEN elapsed_ms < 500 THEN 'OK'::text ELSE 'SLOW'::text END;
  
  -- Test 2: Trending players
  start_time := clock_timestamp();
  PERFORM * FROM get_trending_players(7, 20);
  end_time := clock_timestamp();
  elapsed_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  RETURN QUERY
  SELECT 
    'Trending Players'::text,
    elapsed_ms,
    CASE WHEN elapsed_ms < 200 THEN 'GOOD'::text WHEN elapsed_ms < 1000 THEN 'OK'::text ELSE 'SLOW'::text END;
  
  -- Test 3: Index usage check
  start_time := clock_timestamp();
  PERFORM * FROM index_usage_stats LIMIT 50;
  end_time := clock_timestamp();
  elapsed_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  RETURN QUERY
  SELECT 
    'Index Stats Query'::text,
    elapsed_ms,
    CASE WHEN elapsed_ms < 50 THEN 'GOOD'::text WHEN elapsed_ms < 200 THEN 'OK'::text ELSE 'SLOW'::text END;
  
  -- Test 4: Health check
  start_time := clock_timestamp();
  PERFORM * FROM get_database_health();
  end_time := clock_timestamp();
  elapsed_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
  
  RETURN QUERY
  SELECT 
    'Health Check'::text,
    elapsed_ms,
    CASE WHEN elapsed_ms < 100 THEN 'GOOD'::text WHEN elapsed_ms < 500 THEN 'OK'::text ELSE 'SLOW'::text END;
END;
$$;

-- ============================================================================
-- COMPLETION REPORT
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION AND VALIDATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Run these to verify optimizations:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Verify deployment:';
  RAISE NOTICE '   SELECT * FROM verify_optimizations_deployed();';
  RAISE NOTICE '';
  RAISE NOTICE '2. Check for issues:';
  RAISE NOTICE '   SELECT * FROM check_optimization_issues();';
  RAISE NOTICE '';
  RAISE NOTICE '3. Get summary:';
  RAISE NOTICE '   SELECT * FROM get_optimization_deployment_summary();';
  RAISE NOTICE '';
  RAISE NOTICE '4. Benchmark performance:';
  RAISE NOTICE '   SELECT * FROM benchmark_optimizations();';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;
