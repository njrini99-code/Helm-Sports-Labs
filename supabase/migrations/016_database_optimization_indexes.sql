-- ============================================================================
-- DATABASE OPTIMIZATION MIGRATION
-- Migration: 016_database_optimization_indexes.sql
-- Purpose: Add missing indexes and optimize query performance
-- Safe to run: YES (uses IF NOT EXISTS and CONCURRENTLY)
-- ============================================================================

-- ============================================================================
-- PHASE 1: CRITICAL INDEXES (High Priority)
-- ============================================================================

-- 1. Composite Indexes for Common Query Patterns
-- ============================================================================

-- Players: Search by position + grad_year + state (very common filter combo)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_pos_grad_state_filtered 
ON players(primary_position, grad_year, high_school_state) 
WHERE onboarding_completed = true AND primary_position IS NOT NULL;

-- Players: Discovery queries with updated_at sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_discovery 
ON players(high_school_state, grad_year, primary_position, updated_at DESC) 
WHERE onboarding_completed = true;

-- Recruits: Coach pipeline queries (coach_id + stage + priority + updated_at)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recruits_coach_stage_priority_updated 
ON recruits(coach_id, stage, priority, updated_at DESC) 
WHERE player_id IS NOT NULL;

-- Messages: Conversation listing with pagination and read status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conv_created_read 
ON messages(conversation_id, created_at DESC, read_by_player, read_by_program);

-- Messages: Active messages only (for soft deletes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_active 
ON messages(conversation_id, created_at DESC) 
WHERE is_deleted = false;

-- Conversations: Sorting by last message with unread counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_unread_sorted 
ON conversations(player_id, last_message_at DESC) 
WHERE (player_unread_count > 0 OR program_unread_count > 0);

-- Conversations: Active conversations only (last 90 days)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_active 
ON conversations(player_id, last_message_at DESC) 
WHERE last_message_at > NOW() - INTERVAL '90 days';

-- Conversation Participants: Active members only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conv_participants_active 
ON conversation_participants(conversation_id, user_id) 
WHERE left_at IS NULL;

-- Activity Feed: Recent activity only (last 30 days)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_feed_recent 
ON activity_feed(user_id, created_at DESC) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- ============================================================================
-- 2. Foreign Key Indexes (Critical for Performance)
-- ============================================================================

-- Team memberships → teams (verify exists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_memberships_team_id_fk ON team_memberships(team_id);

-- Team memberships → players (verify exists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_memberships_player_id_fk ON team_memberships(player_id);

-- Recruits → coaches (may already exist, but ensure)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recruits_coach_id_fk ON recruits(coach_id);

-- Player metrics → players
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_metrics_player_id_fk ON player_metrics(player_id);

-- Player videos → players
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_videos_player_id_fk ON player_videos(player_id);

-- College interest → colleges
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_college_interest_college_id_fk ON college_interest(college_id);

-- Event participants → events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_participants_event_id_fk ON event_team_participants(event_id);

-- Organization memberships → organizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_memberships_org_id_fk ON organization_memberships(organization_id);

-- Organization memberships → users
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_memberships_user_id_fk ON organization_memberships(user_id);

-- ============================================================================
-- 3. Partial Indexes for Filtered Queries
-- ============================================================================

-- Players: Verified metrics only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_verified_metrics 
ON players(pitch_velo, exit_velo, sixty_time) 
WHERE verified_metrics = true AND onboarding_completed = true;

-- Teams: Only active teams (with coach)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_teams_active 
ON teams(team_type, state, coach_id) 
WHERE coach_id IS NOT NULL;

-- ============================================================================
-- 4. Text Search Optimization
-- ============================================================================

-- Players: Prefix search index (much faster than trigram for exact matches)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_full_name_btree 
ON players(full_name text_pattern_ops) 
WHERE full_name IS NOT NULL;

-- ============================================================================
-- 5. RLS Optimization Indexes
-- ============================================================================

-- For team membership RLS checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_memberships_player_team_covering 
ON team_memberships(player_id, team_id);

-- For coach access checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_teams_coach_covering 
ON teams(coach_id) 
INCLUDE (id, name, team_type);

-- ============================================================================
-- PHASE 2: JSONB AND SPECIALTY INDEXES (Medium Priority)
-- ============================================================================

-- Messages: Index attachments JSONB
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_attachments_type 
ON messages USING gin (attachments jsonb_path_ops) 
WHERE attachments IS NOT NULL AND jsonb_array_length(attachments) > 0;

-- Activity feed: Index metadata for filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_metadata 
ON activity_feed USING gin (metadata) 
WHERE metadata IS NOT NULL;

-- Player journey events: Index metadata
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journey_metadata 
ON player_journey_events USING gin (metadata) 
WHERE metadata IS NOT NULL;

-- ============================================================================
-- PHASE 3: OPTIMIZED SEARCH FUNCTION
-- ============================================================================

-- Note: Enhanced search_players function with filters is in migration 019
-- This basic version is kept for backward compatibility but will be replaced

-- ============================================================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================================================

-- Update table statistics for query planner
ANALYZE players;
ANALYZE conversations;
ANALYZE messages;
ANALYZE recruits;
ANALYZE team_memberships;
ANALYZE coaches;
ANALYZE teams;

-- ============================================================================
-- MONITORING QUERIES (Run these to check index usage)
-- ============================================================================

-- Uncomment to check index usage after deployment:
/*
-- Check for unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
  idx_scan AS index_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- Check table and index sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                 pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
*/

-- ============================================================================
-- ADDITIONAL COMPOSITE INDEXES FOR SPECIFIC QUERY PATTERNS
-- ============================================================================

-- Recruit Watchlist: Coach filtering by status and player
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recruit_watchlist_coach_player_status 
ON recruit_watchlist(coach_id, status, player_id, updated_at DESC);

-- Player Engagement: Trending players query optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_engagement_trending 
ON player_engagement(recent_views_7d DESC, recent_updates_30d DESC, last_activity_at DESC NULLS LAST);

-- College Interest: Status and activity filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_college_interest_status_activity 
ON college_interest(status, interest_level, last_activity_date DESC);

-- Showcase Events: Status and date filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_showcase_events_status_date 
ON showcase_events(status, start_date) 
WHERE status IN ('upcoming', 'registration_open');

-- Event Participants: Event and organization lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_participants_event_org 
ON event_team_participants(event_id, organization_id);

-- ============================================================================
-- MISSING FOREIGN KEY INDEXES (Additional)
-- ============================================================================

-- Conversations foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_player_id_fk ON conversations(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_program_id_fk ON conversations(program_id) WHERE program_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_org_id_fk ON conversations(organization_id) WHERE organization_id IS NOT NULL;

-- Messages foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id_fk ON messages(sender_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_reply_to_id_fk ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;

-- Conversation participants
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conv_participants_conv_id_fk ON conversation_participants(conversation_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conv_participants_user_id_fk ON conversation_participants(user_id);

-- Events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_org_id_fk ON events(org_id) WHERE org_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_created_by_fk ON events(created_by) WHERE created_by IS NOT NULL;

-- Player journey events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journey_player_id_fk ON player_journey_events(player_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journey_college_id_fk ON player_journey_events(college_id) WHERE college_id IS NOT NULL;

-- Showcase event registrations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_showcase_reg_event_id_fk ON showcase_event_registrations(event_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_showcase_reg_player_id_fk ON showcase_event_registrations(player_id);

-- Player performance metrics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_player_id_fk ON player_performance_metrics(player_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_performance_event_id_fk ON player_performance_metrics(event_id) WHERE event_id IS NOT NULL;

-- ============================================================================
-- INDEXES FOR SORTING AND ORDERING
-- ============================================================================

-- Players: Popular sorting (by engagement)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_engagement_sort 
ON players(updated_at DESC, created_at DESC) 
WHERE onboarding_completed = true;

-- Teams: Sorting by creation and activity
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_teams_activity_sort 
ON teams(created_at DESC, updated_at DESC NULLS LAST);

-- Coaches: Sorting by type and creation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_coaches_type_created 
ON coaches(coach_type, created_at DESC) 
WHERE onboarding_completed = true;

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Database optimization migration complete!';
  RAISE NOTICE 'All critical indexes have been created.';
  RAISE NOTICE 'Monitor index usage with provided queries above.';
END $$;
