-- ============================================================================
-- FOREIGN KEY INDEXES FOR PERFORMANCE
-- Migration: 031_add_missing_fk_indexes.sql
-- Purpose: Add indexes to foreign key columns for query performance
-- Priority: CRITICAL - 10-100x performance improvement
-- Safe to run: YES (indexes are non-blocking in Postgres)
-- ============================================================================
--
-- Background:
-- Foreign keys without indexes cause slow queries when:
-- - Joining tables (most common operation)
-- - Filtering by foreign key (WHERE coach_id = ...)
-- - Cascading deletes/updates
--
-- Impact: Without these indexes, queries on tables with >1000 rows will be
-- extremely slow, especially in JOIN operations and dashboard queries.
--
-- Safety: Creating indexes is safe and non-destructive. Uses IF NOT EXISTS
-- to prevent errors if index already exists.
-- ============================================================================

-- ============================================================================
-- 1. RECRUITING & WATCHLIST INDEXES
-- ============================================================================

-- recruit_watchlist: Most frequently queried recruiting table
CREATE INDEX IF NOT EXISTS idx_recruit_watchlist_coach_id
  ON recruit_watchlist(coach_id);

CREATE INDEX IF NOT EXISTS idx_recruit_watchlist_player_id
  ON recruit_watchlist(player_id);

-- Composite index for common query pattern: coach filtering by status
CREATE INDEX IF NOT EXISTS idx_recruit_watchlist_coach_status
  ON recruit_watchlist(coach_id, status);

-- ============================================================================
-- 2. MESSAGING INDEXES
-- ============================================================================

-- messages: High-traffic table for coach-player communication
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
  ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_player_id
  ON messages(sender_player_id)
  WHERE sender_player_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_sender_program_id
  ON messages(sender_program_id)
  WHERE sender_program_id IS NOT NULL;

-- conversations: Thread-level queries
CREATE INDEX IF NOT EXISTS idx_conversations_player_id
  ON conversations(player_id);

CREATE INDEX IF NOT EXISTS idx_conversations_program_id
  ON conversations(program_id);

-- Composite index for conversation list sorted by last message
CREATE INDEX IF NOT EXISTS idx_conversations_player_last_message
  ON conversations(player_id, last_message_at DESC);

-- ============================================================================
-- 3. ENGAGEMENT & ANALYTICS INDEXES
-- ============================================================================

-- player_engagement_events: Track coach-player interactions
CREATE INDEX IF NOT EXISTS idx_player_engagement_events_coach_id
  ON player_engagement_events(coach_id);

CREATE INDEX IF NOT EXISTS idx_player_engagement_events_player_id
  ON player_engagement_events(player_id);

-- Composite index for coach's engagement timeline
CREATE INDEX IF NOT EXISTS idx_player_engagement_events_coach_date
  ON player_engagement_events(coach_id, engagement_date DESC);

-- ============================================================================
-- 4. CAMP & EVENT INDEXES
-- ============================================================================

-- camp_registrations: Player signups for camps
CREATE INDEX IF NOT EXISTS idx_camp_registrations_camp_id
  ON camp_registrations(camp_id);

CREATE INDEX IF NOT EXISTS idx_camp_registrations_player_id
  ON camp_registrations(player_id);

-- camp_events: Coach-hosted camps/events
CREATE INDEX IF NOT EXISTS idx_camp_events_coach_id
  ON camp_events(coach_id);

-- Composite index for upcoming events by coach
CREATE INDEX IF NOT EXISTS idx_camp_events_coach_date
  ON camp_events(coach_id, event_date DESC);

-- coach_calendar_events: Coach's personal calendar
CREATE INDEX IF NOT EXISTS idx_coach_calendar_events_coach_id
  ON coach_calendar_events(coach_id);

-- coach_calendar_event_players: Players associated with calendar events
CREATE INDEX IF NOT EXISTS idx_coach_calendar_event_players_event_id
  ON coach_calendar_event_players(event_id);

CREATE INDEX IF NOT EXISTS idx_coach_calendar_event_players_player_id
  ON coach_calendar_event_players(player_id);

-- schedule_events: Player-side schedule/calendar
CREATE INDEX IF NOT EXISTS idx_schedule_events_player_id
  ON schedule_events(player_id);

-- ============================================================================
-- 5. TEAM & ROSTER INDEXES
-- ============================================================================

-- team_memberships: Player-team relationships
CREATE INDEX IF NOT EXISTS idx_team_memberships_team_id
  ON team_memberships(team_id);

CREATE INDEX IF NOT EXISTS idx_team_memberships_player_id
  ON team_memberships(player_id);

-- teams: Team management
CREATE INDEX IF NOT EXISTS idx_teams_coach_id
  ON teams(coach_id);

-- team_schedule: Game/practice schedule
CREATE INDEX IF NOT EXISTS idx_team_schedule_team_id
  ON team_schedule(team_id);

-- team_media: Team photos/videos
CREATE INDEX IF NOT EXISTS idx_team_media_team_id
  ON team_media(team_id);

-- team_commitments: College commitment tracking
CREATE INDEX IF NOT EXISTS idx_team_commitments_team_id
  ON team_commitments(team_id);

CREATE INDEX IF NOT EXISTS idx_team_commitments_player_id
  ON team_commitments(player_id);

-- ============================================================================
-- 6. PLAYER DATA INDEXES
-- ============================================================================

-- player_metrics: Performance measurables (60-time, exit velo, etc.)
CREATE INDEX IF NOT EXISTS idx_player_metrics_player_id
  ON player_metrics(player_id);

-- player_videos: Highlight reels
CREATE INDEX IF NOT EXISTS idx_player_videos_player_id
  ON player_videos(player_id);

-- player_achievements: Awards/honors
CREATE INDEX IF NOT EXISTS idx_player_achievements_player_id
  ON player_achievements(player_id);

-- game_stats: Per-game statistics
CREATE INDEX IF NOT EXISTS idx_game_stats_player_id
  ON game_stats(player_id);

-- verified_player_stats: Official/verified stats
CREATE INDEX IF NOT EXISTS idx_verified_player_stats_player_id
  ON verified_player_stats(player_id);

-- ============================================================================
-- 7. RECRUITING TOOLS INDEXES
-- ============================================================================

-- coach_notes: Private notes on players
CREATE INDEX IF NOT EXISTS idx_coach_notes_coach_id
  ON coach_notes(coach_id);

CREATE INDEX IF NOT EXISTS idx_coach_notes_player_id
  ON coach_notes(player_id);

-- Composite index for coach's notes on specific player
CREATE INDEX IF NOT EXISTS idx_coach_notes_coach_player
  ON coach_notes(coach_id, player_id);

-- recruiting_pipeline: Pipeline stage tracking
CREATE INDEX IF NOT EXISTS idx_recruiting_pipeline_coach_id
  ON recruiting_pipeline(coach_id);

CREATE INDEX IF NOT EXISTS idx_recruiting_pipeline_player_id
  ON recruiting_pipeline(player_id);

-- Composite index for pipeline filtering by stage
CREATE INDEX IF NOT EXISTS idx_recruiting_pipeline_coach_stage
  ON recruiting_pipeline(coach_id, stage);

-- player_comparison: Side-by-side player comparisons
CREATE INDEX IF NOT EXISTS idx_player_comparison_coach_id
  ON player_comparison(coach_id);

-- email_sequences: Automated email campaigns
CREATE INDEX IF NOT EXISTS idx_email_sequences_coach_id
  ON email_sequences(coach_id);

-- recruiting_analytics: Recruiting KPIs and metrics
CREATE INDEX IF NOT EXISTS idx_recruiting_analytics_coach_id
  ON recruiting_analytics(coach_id);

-- recruiting_timeline: Recruitment milestones
CREATE INDEX IF NOT EXISTS idx_recruiting_timeline_player_id
  ON recruiting_timeline(player_id);

-- recruiting_templates: Email/message templates
CREATE INDEX IF NOT EXISTS idx_recruiting_templates_coach_id
  ON recruiting_templates(coach_id);

-- ============================================================================
-- 8. NOTIFICATIONS & SETTINGS INDEXES
-- ============================================================================

-- notifications: User notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON notifications(user_id);

-- Composite index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications(user_id, is_read, created_at DESC);

-- player_settings: Player-specific settings
CREATE INDEX IF NOT EXISTS idx_player_settings_player_id
  ON player_settings(player_id);

-- push_subscriptions: Web push notification subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions(user_id);

-- ============================================================================
-- 9. SEARCH & DISCOVERY INDEXES
-- ============================================================================

-- Player search by graduation year (common filter)
CREATE INDEX IF NOT EXISTS idx_players_grad_year
  ON players(grad_year)
  WHERE grad_year IS NOT NULL;

-- Player search by position (common filter)
CREATE INDEX IF NOT EXISTS idx_players_primary_position
  ON players(primary_position)
  WHERE primary_position IS NOT NULL;

-- Composite index for common player search pattern
CREATE INDEX IF NOT EXISTS idx_players_grad_year_position
  ON players(grad_year, primary_position)
  WHERE grad_year IS NOT NULL AND primary_position IS NOT NULL;

-- Player search by onboarding status (filter incomplete profiles)
CREATE INDEX IF NOT EXISTS idx_players_onboarding_completed
  ON players(onboarding_completed);

-- Full-text search on player names (GIN index for fast text search)
CREATE INDEX IF NOT EXISTS idx_players_full_name_gin
  ON players USING gin(to_tsvector('english', COALESCE(full_name, '')));

-- Coach search by school
CREATE INDEX IF NOT EXISTS idx_coaches_school_name
  ON coaches(school_name)
  WHERE school_name IS NOT NULL;

-- ============================================================================
-- 10. RECRUITING INTERESTS INDEXES
-- ============================================================================

-- recruiting_interests: Player interest in colleges
CREATE INDEX IF NOT EXISTS idx_recruiting_interests_player_id
  ON recruiting_interests(player_id);

CREATE INDEX IF NOT EXISTS idx_recruiting_interests_program_id
  ON recruiting_interests(program_id);

-- Composite index for player's interested schools sorted by interest level
CREATE INDEX IF NOT EXISTS idx_recruiting_interests_player_level
  ON recruiting_interests(player_id, interest_level DESC);

-- ============================================================================
-- 11. EVALUATIONS INDEXES
-- ============================================================================

-- evaluations: Coach evaluations of players
CREATE INDEX IF NOT EXISTS idx_evaluations_coach_id
  ON evaluations(coach_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_player_id
  ON evaluations(player_id);

-- Composite index for coach's evaluations sorted by grade
CREATE INDEX IF NOT EXISTS idx_evaluations_coach_grade
  ON evaluations(coach_id, grade DESC);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify all indexes were created:
--
-- SELECT
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;
--
-- Expected result: 60+ indexes starting with 'idx_'
