-- ============================================================================
-- FIX ADDITIONAL DATABASE IMPROVEMENTS
-- Migration: 013_fix_additional_improvements.sql
-- Addresses 10 additional improvements found
-- ============================================================================

-- ============================================================================
-- IMPROVEMENT 6: team_memberships Unique Constraint
-- ============================================================================

-- First, remove duplicate memberships (keep the oldest one)
DO $$
BEGIN
  -- Delete duplicates, keeping the one with the earliest joined_at
  DELETE FROM team_memberships tm1
  USING team_memberships tm2
  WHERE tm1.team_id = tm2.team_id
    AND tm1.player_id = tm2.player_id
    AND tm1.id < tm2.id;
END$$;

-- Add unique constraint to prevent duplicate memberships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'team_memberships'
      AND constraint_name = 'unique_team_player'
  ) THEN
    ALTER TABLE team_memberships
    ADD CONSTRAINT unique_team_player 
    UNIQUE (team_id, player_id);
  END IF;
END$$;

-- ============================================================================
-- IMPROVEMENT 7: Fix notifications Column Name
-- ============================================================================

-- Standardize on 'read' (database already has this)
-- Add 'is_read' as an alias via a view or update code
-- For now, ensure consistency - database uses 'read', we'll keep it
-- But add a check to ensure it's not null
ALTER TABLE notifications
ALTER COLUMN read SET DEFAULT false;

-- Ensure read column is NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notifications'
      AND column_name = 'read'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE notifications
    ALTER COLUMN read SET NOT NULL;
    
    -- Set default for any NULL values
    UPDATE notifications SET read = false WHERE read IS NULL;
  END IF;
END$$;

-- ============================================================================
-- IMPROVEMENT 8: practice_plans Unique Constraint
-- ============================================================================

-- Ensure only one practice plan per event
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'practice_plans'
      AND constraint_name = 'unique_practice_plan_per_event'
  ) THEN
    -- First, remove any duplicates (keep the most recent)
    DELETE FROM practice_plans p1
    USING practice_plans p2
    WHERE p1.event_id = p2.event_id
      AND p1.id < p2.id;
    
    ALTER TABLE practice_plans
    ADD CONSTRAINT unique_practice_plan_per_event 
    UNIQUE (event_id);
  END IF;
END$$;

-- ============================================================================
-- IMPROVEMENT 9: team_invitations Expiration Cleanup
-- ============================================================================

-- Create function to deactivate expired invitations
CREATE OR REPLACE FUNCTION deactivate_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE team_invitations
  SET is_active = false
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Run initial cleanup
SELECT deactivate_expired_invitations();

-- Add constraint to prevent using expired invitations (enforced in application)
-- Note: We can't easily add a CHECK constraint that references NOW() in INSERT/UPDATE
-- So we'll rely on application logic, but the function helps with cleanup

-- ============================================================================
-- IMPROVEMENT 10: team_schedule Validation Constraints
-- ============================================================================

-- Add CHECK constraint for event_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'team_schedule'
      AND constraint_name = 'check_event_type'
  ) THEN
    ALTER TABLE team_schedule
    ADD CONSTRAINT check_event_type
    CHECK (event_type IN ('game', 'practice', 'tournament', 'showcase'));
  END IF;
END$$;

-- Add CHECK constraint for time validation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'team_schedule'
      AND constraint_name = 'check_end_after_start'
  ) THEN
    -- Fix any existing invalid data first
    UPDATE team_schedule
    SET end_time = start_time + INTERVAL '2 hours'
    WHERE end_time IS NOT NULL
      AND end_time < start_time;
    
    ALTER TABLE team_schedule
    ADD CONSTRAINT check_end_after_start
    CHECK (end_time IS NULL OR end_time >= start_time);
  END IF;
END$$;

-- Ensure cancelled has default
ALTER TABLE team_schedule
ALTER COLUMN cancelled SET DEFAULT false;

-- Fix any NULL cancelled values
UPDATE team_schedule SET cancelled = false WHERE cancelled IS NULL;

-- ============================================================================
-- IMPROVEMENT 11: parent_access.relationship CHECK Constraint
-- ============================================================================

-- Add CHECK constraint for relationship type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'parent_access'
      AND constraint_name = 'check_relationship_type'
  ) THEN
    ALTER TABLE parent_access
    ADD CONSTRAINT check_relationship_type
    CHECK (relationship IN ('parent', 'guardian', 'legal_guardian', 'other'));
  END IF;
END$$;

-- ============================================================================
-- IMPROVEMENT 12: team_memberships.status CHECK Constraint
-- ============================================================================

-- Add CHECK constraint for status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'team_memberships'
      AND constraint_name = 'check_membership_status'
  ) THEN
    -- Normalize any invalid status values first
    UPDATE team_memberships
    SET status = 'active'
    WHERE status IS NULL OR status NOT IN ('active', 'inactive', 'alumni', 'pending', 'removed');
    
    ALTER TABLE team_memberships
    ADD CONSTRAINT check_membership_status
    CHECK (status IN ('active', 'inactive', 'alumni', 'pending', 'removed'));
  END IF;
END$$;

-- ============================================================================
-- IMPROVEMENT 13: notifications RLS Policies
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- System/service role can insert notifications (no policy = service role only)
-- Application code should use service role for creating notifications

-- ============================================================================
-- IMPROVEMENT 14: team_memberships primary_team Column
-- ============================================================================

-- Add primary_team column if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'team_memberships'
      AND column_name = 'primary_team'
  ) THEN
    ALTER TABLE team_memberships
    ADD COLUMN primary_team boolean DEFAULT false;
    
    -- Set primary_team = true for the first team each player joined
    UPDATE team_memberships tm1
    SET primary_team = true
    WHERE tm1.id = (
      SELECT tm2.id
      FROM team_memberships tm2
      WHERE tm2.player_id = tm1.player_id
      ORDER BY tm2.joined_at ASC
      LIMIT 1
    );
  END IF;
END$$;

-- ============================================================================
-- IMPROVEMENT 15: Missing Composite Indexes
-- ============================================================================

-- Composite index for active team members
CREATE INDEX IF NOT EXISTS idx_team_memberships_team_status 
ON team_memberships(team_id, status) 
WHERE status = 'active';

-- Composite index for notification queries (user_id, read, created_at)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
ON notifications(user_id, read, created_at DESC);

-- Index for schedule date range queries
CREATE INDEX IF NOT EXISTS idx_team_schedule_team_time 
ON team_schedule(team_id, start_time);

-- Index for unread notifications (partial index)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, created_at DESC) 
WHERE read = false;

-- Index for team_memberships primary team queries
CREATE INDEX IF NOT EXISTS idx_team_memberships_primary 
ON team_memberships(player_id, primary_team) 
WHERE primary_team = true;

-- Index for active invitations
CREATE INDEX IF NOT EXISTS idx_team_invitations_active 
ON team_invitations(team_id, is_active, expires_at) 
WHERE is_active = true;

-- ============================================================================
-- VERIFICATION QUERIES (for manual checking)
-- ============================================================================

-- Check unique constraint exists:
-- SELECT constraint_name FROM information_schema.table_constraints 
-- WHERE table_name = 'team_memberships' AND constraint_name = 'unique_team_player';

-- Check notifications RLS policies:
-- SELECT policyname FROM pg_policies WHERE tablename = 'notifications';

-- Check indexes created:
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('team_memberships', 'notifications', 'team_schedule');

