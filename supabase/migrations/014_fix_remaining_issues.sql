-- ============================================================================
-- FIX REMAINING DATABASE ISSUES
-- Migration: 014_fix_remaining_issues.sql
-- Addresses: missing triggers, missing indexes, data consistency
-- ============================================================================

-- ============================================================================
-- ISSUE 1: Missing updated_at Triggers
-- ============================================================================

-- Ensure set_updated_at function exists
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for tables with updated_at but no trigger
DROP TRIGGER IF EXISTS set_updated_at_team_invitations ON team_invitations;
CREATE TRIGGER set_updated_at_team_invitations
  BEFORE UPDATE ON team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_team_messages ON team_messages;
CREATE TRIGGER set_updated_at_team_messages
  BEFORE UPDATE ON team_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_message_receipts ON message_receipts;
CREATE TRIGGER set_updated_at_message_receipts
  BEFORE UPDATE ON message_receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_practice_plans ON practice_plans;
CREATE TRIGGER set_updated_at_practice_plans
  BEFORE UPDATE ON practice_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_notifications ON notifications;
CREATE TRIGGER set_updated_at_notifications
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_player_stats ON player_stats;
CREATE TRIGGER set_updated_at_player_stats
  BEFORE UPDATE ON player_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_team_schedule ON team_schedule;
CREATE TRIGGER set_updated_at_team_schedule
  BEFORE UPDATE ON team_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- ISSUE 2: Missing Indexes on Foreign Keys
-- ============================================================================

-- Index on event_attendance.marked_by (foreign key to profiles)
CREATE INDEX IF NOT EXISTS idx_event_attendance_marked_by 
ON event_attendance(marked_by) 
WHERE marked_by IS NOT NULL;

-- Index on player_stats.verified_by (foreign key to coaches)
CREATE INDEX IF NOT EXISTS idx_player_stats_verified_by 
ON player_stats(verified_by) 
WHERE verified_by IS NOT NULL;

-- Index on practice_plans.created_by (foreign key to coaches)
CREATE INDEX IF NOT EXISTS idx_practice_plans_created_by 
ON practice_plans(created_by);

-- Index on team_invitations.created_by (foreign key to coaches)
CREATE INDEX IF NOT EXISTS idx_team_invitations_created_by 
ON team_invitations(created_by);

-- ============================================================================
-- ISSUE 3: Missing Indexes on Frequently Queried Columns
-- ============================================================================

-- Index on team_messages.scheduled_for (for scheduled message queries)
CREATE INDEX IF NOT EXISTS idx_team_messages_scheduled_for 
ON team_messages(scheduled_for) 
WHERE scheduled_for IS NOT NULL;

-- Index on event_attendance.status (for filtering by status)
CREATE INDEX IF NOT EXISTS idx_event_attendance_status 
ON event_attendance(status);

-- Composite index for event_attendance queries (event_id + status)
CREATE INDEX IF NOT EXISTS idx_event_attendance_event_status 
ON event_attendance(event_id, status);

-- ============================================================================
-- ISSUE 4: Ensure Default Values Are Set Correctly
-- ============================================================================

-- Ensure team_messages.priority has default
ALTER TABLE team_messages
ALTER COLUMN priority SET DEFAULT 'normal';

-- Ensure message_receipts columns have proper defaults (they're nullable by design)
-- No changes needed - nullable is correct for read_at and delivered_at

-- ============================================================================
-- ISSUE 5: Add Composite Index for Team Messages Queries
-- ============================================================================

-- Composite index for team messages by team and sent status
CREATE INDEX IF NOT EXISTS idx_team_messages_team_sent 
ON team_messages(team_id, sent_at DESC NULLS LAST);

-- Composite index for scheduled messages
CREATE INDEX IF NOT EXISTS idx_team_messages_scheduled 
ON team_messages(team_id, scheduled_for) 
WHERE scheduled_for IS NOT NULL;

-- ============================================================================
-- ISSUE 6: Add Index for Team Invitations Queries
-- ============================================================================

-- Composite index for active invitations by team
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_active 
ON team_invitations(team_id, is_active, created_at DESC) 
WHERE is_active = true;

-- ============================================================================
-- ISSUE 7: Add Index for Practice Plans Queries
-- ============================================================================

-- Index for practice plans by creator
CREATE INDEX IF NOT EXISTS idx_practice_plans_created_by_event 
ON practice_plans(created_by, event_id);

-- ============================================================================
-- VERIFICATION QUERIES (for manual checking)
-- ============================================================================

-- Check triggers:
-- SELECT trigger_name, event_object_table 
-- FROM information_schema.triggers 
-- WHERE trigger_schema = 'public' 
--   AND trigger_name LIKE 'set_updated_at_%'
-- ORDER BY event_object_table;

-- Check indexes:
-- SELECT indexname, tablename 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
--   AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;

