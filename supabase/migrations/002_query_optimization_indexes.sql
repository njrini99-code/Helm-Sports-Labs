-- ScoutPulse Query Optimization Indexes
-- Run this in your Supabase SQL Editor after the initial schema migration
-- This adds indexes to improve query performance

-- ============================================================================
-- PLAYER METRICS INDEXES
-- ============================================================================

-- Index for filtering metrics by player (used in trending, recommendations, pipeline)
CREATE INDEX IF NOT EXISTS idx_player_metrics_player_id ON player_metrics(player_id);

-- Index for filtering by metric type (e.g., velocity, exit velo)
CREATE INDEX IF NOT EXISTS idx_player_metrics_type ON player_metrics(metric_type);

-- Composite index for common metric lookups
CREATE INDEX IF NOT EXISTS idx_player_metrics_player_type ON player_metrics(player_id, metric_type);

-- ============================================================================
-- PLAYER VIDEOS INDEXES
-- ============================================================================

-- Index for checking video existence by player
CREATE INDEX IF NOT EXISTS idx_player_videos_player_id ON player_videos(player_id);

-- Index for filtering by video type
CREATE INDEX IF NOT EXISTS idx_player_videos_type ON player_videos(video_type);

-- ============================================================================
-- PLAYERS TABLE ADDITIONAL INDEXES
-- ============================================================================

-- Index for position filtering (used in recommendations)
CREATE INDEX IF NOT EXISTS idx_players_primary_position ON players(primary_position);

CREATE INDEX IF NOT EXISTS idx_players_secondary_position ON players(secondary_position);

-- Index for updated_at (used in trending)
CREATE INDEX IF NOT EXISTS idx_players_updated_at ON players(updated_at DESC);

-- Composite index for recommendation queries (position + grad_year + state)
CREATE INDEX IF NOT EXISTS idx_players_position_grad_state ON players(primary_position, grad_year, high_school_state) 
WHERE onboarding_completed = true;

-- Composite index for trending queries (updated_at + grad_year)
CREATE INDEX IF NOT EXISTS idx_players_trending ON players(updated_at DESC, grad_year) 
WHERE onboarding_completed = true AND grad_year IS NOT NULL;

-- Index for state filtering
CREATE INDEX IF NOT EXISTS idx_players_state_grad ON players(high_school_state, grad_year) 
WHERE onboarding_completed = true;

-- ============================================================================
-- RECRUITS TABLE INDEXES
-- ============================================================================

-- Index for player_id lookups (used in pipeline joins)
CREATE INDEX IF NOT EXISTS idx_recruits_player_id ON recruits(player_id);

-- Composite index for coach pipeline queries (coach_id + stage + updated_at)
CREATE INDEX IF NOT EXISTS idx_recruits_coach_stage_updated ON recruits(coach_id, stage, updated_at DESC);

-- ============================================================================
-- COACHES TABLE INDEXES
-- ============================================================================

-- Index for coach_type filtering (already exists, but ensuring it's there)
CREATE INDEX IF NOT EXISTS idx_coaches_type_user ON coaches(coach_type, user_id);

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================

-- These indexes will improve:
-- 1. Trending players queries (updated_at index)
-- 2. Recommendation queries (position + grad_year + state composite)
-- 3. Pipeline queries (coach_id + stage composite)
-- 4. Metric lookups (player_id indexes)
-- 5. Video existence checks (player_id index)

-- Monitor index usage with:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

