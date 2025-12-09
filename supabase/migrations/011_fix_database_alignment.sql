-- ============================================================================
-- FIX DATABASE ALIGNMENT WITH APPLICATION CODE
-- Migration: 011_fix_database_alignment.sql
-- Fixes: player_stats structure, profiles columns, RLS policies
-- ============================================================================

-- ============================================================================
-- ADD MISSING COLUMNS TO PROFILES TABLE
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END$$;

-- ============================================================================
-- ADD MISSING COLUMNS TO PLAYER_STATS TABLE
-- The existing player_stats table from migration 005 has individual stat columns
-- We need to add team-based tracking columns for the new API routes
-- ============================================================================
DO $$
BEGIN
  -- Add team_id if missing (for team-based stats queries)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_stats' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE player_stats ADD COLUMN team_id uuid REFERENCES teams(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_player_stats_team ON player_stats(team_id);
  END IF;
  
  -- Add game_id as alias for event_id (API routes use game_id)
  -- We'll use event_id for now, but add game_id if needed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_stats' AND column_name = 'game_id'
  ) THEN
    ALTER TABLE player_stats ADD COLUMN game_id uuid REFERENCES team_schedule(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_player_stats_game ON player_stats(game_id);
  END IF;
  
  -- Add stat_type if missing (hitting, pitching, fielding)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_stats' AND column_name = 'stat_type'
  ) THEN
    ALTER TABLE player_stats ADD COLUMN stat_type text CHECK (stat_type IN ('hitting', 'pitching', 'fielding'));
    CREATE INDEX IF NOT EXISTS idx_player_stats_type ON player_stats(stat_type);
  END IF;
  
  -- Add stats_data as JSONB for flexible stat storage (complements individual columns)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_stats' AND column_name = 'stats_data'
  ) THEN
    ALTER TABLE player_stats ADD COLUMN stats_data jsonb;
  END IF;
  
  -- Add verification columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_stats' AND column_name = 'verified'
  ) THEN
    ALTER TABLE player_stats ADD COLUMN verified boolean DEFAULT false;
    CREATE INDEX IF NOT EXISTS idx_player_stats_verified ON player_stats(verified);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_stats' AND column_name = 'verified_by'
  ) THEN
    ALTER TABLE player_stats ADD COLUMN verified_by uuid REFERENCES coaches(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_stats' AND column_name = 'verified_at'
  ) THEN
    ALTER TABLE player_stats ADD COLUMN verified_at timestamptz;
  END IF;
  
  -- Add uploaded_via column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'player_stats' AND column_name = 'uploaded_via'
  ) THEN
    ALTER TABLE player_stats ADD COLUMN uploaded_via text DEFAULT 'manual' CHECK (uploaded_via IN ('manual', 'ai_upload', 'import'));
  END IF;
END$$;

-- ============================================================================
-- FIX RLS POLICIES FOR COACH AUTHENTICATION
-- The policies need to check coaches.user_id = auth.uid(), not teams.coach_id = auth.uid()
-- ============================================================================

-- Drop existing policies that have incorrect auth checks
DROP POLICY IF EXISTS "Coaches can manage their team invitations" ON team_invitations;
DROP POLICY IF EXISTS "Coaches can manage parent access for their teams" ON parent_access;
DROP POLICY IF EXISTS "Coaches can send team messages" ON team_messages;
DROP POLICY IF EXISTS "Coaches can manage player stats" ON player_stats;
DROP POLICY IF EXISTS "Coaches can manage attendance" ON event_attendance;
DROP POLICY IF EXISTS "Coaches can manage practice plans" ON practice_plans;

-- Recreate with correct auth checks
CREATE POLICY "Coaches can manage their team invitations"
  ON team_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      JOIN coaches ON coaches.id = teams.coach_id
      WHERE teams.id = team_invitations.team_id 
      AND coaches.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage parent access for their teams"
  ON parent_access FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      JOIN coaches ON coaches.id = teams.coach_id
      WHERE teams.id = parent_access.team_id 
      AND coaches.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can send team messages"
  ON team_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      JOIN coaches ON coaches.id = teams.coach_id
      WHERE teams.id = team_messages.team_id 
      AND coaches.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage player stats"
  ON player_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      JOIN coaches ON coaches.id = teams.coach_id
      WHERE teams.id = player_stats.team_id 
      AND coaches.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage attendance"
  ON event_attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_schedule ts
      JOIN teams t ON t.id = ts.team_id
      JOIN coaches c ON c.id = t.coach_id
      WHERE ts.id = event_attendance.event_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage practice plans"
  ON practice_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_schedule ts
      JOIN teams t ON t.id = ts.team_id
      JOIN coaches c ON c.id = t.coach_id
      WHERE ts.id = practice_plans.event_id
      AND c.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FIX TEAM MESSAGES RLS POLICY FOR SENDER
-- The sender_id should reference profiles.id, and we need to check if user is coach
-- ============================================================================
DROP POLICY IF EXISTS "Team members can view team messages" ON team_messages;

CREATE POLICY "Team members can view team messages"
  ON team_messages FOR SELECT
  USING (
    sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_memberships 
      WHERE team_memberships.team_id = team_messages.team_id
      AND team_memberships.player_id IN (
        SELECT id FROM players WHERE user_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM teams 
      JOIN coaches ON coaches.id = teams.coach_id
      WHERE teams.id = team_messages.team_id 
      AND coaches.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FIX PARENT ACCESS RLS POLICY
-- parent_id references profiles.id, which is auth.users.id
-- ============================================================================
DROP POLICY IF EXISTS "Parents can view their own access" ON parent_access;

CREATE POLICY "Parents can view their own access"
  ON parent_access FOR SELECT
  USING (parent_id = auth.uid());

-- ============================================================================
-- FIX MESSAGE RECEIPTS RLS POLICIES
-- user_id references profiles.id, which is auth.users.id
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own message receipts" ON message_receipts;
DROP POLICY IF EXISTS "Users can update their own message receipts" ON message_receipts;

CREATE POLICY "Users can view their own message receipts"
  ON message_receipts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own message receipts"
  ON message_receipts FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- FIX EVENT ATTENDANCE RLS POLICY FOR TEAM MEMBERS
-- ============================================================================
DROP POLICY IF EXISTS "Team members can view attendance" ON event_attendance;

CREATE POLICY "Team members can view attendance"
  ON event_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_schedule ts
      JOIN team_memberships tm ON tm.team_id = ts.team_id
      WHERE ts.id = event_attendance.event_id
      AND tm.player_id IN (
        SELECT id FROM players WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- FIX PRACTICE PLANS RLS POLICY FOR TEAM MEMBERS
-- ============================================================================
DROP POLICY IF EXISTS "Team members can view practice plans" ON practice_plans;

CREATE POLICY "Team members can view practice plans"
  ON practice_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_schedule ts
      JOIN team_memberships tm ON tm.team_id = ts.team_id
      WHERE ts.id = practice_plans.event_id
      AND tm.player_id IN (
        SELECT id FROM players WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- FIX PLAYER STATS RLS POLICY FOR TEAM MEMBERS
-- ============================================================================
DROP POLICY IF EXISTS "Team members can view player stats" ON player_stats;

CREATE POLICY "Team members can view player stats"
  ON player_stats FOR SELECT
  USING (
    player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM team_memberships 
      WHERE team_memberships.team_id = player_stats.team_id
      AND team_memberships.player_id IN (
        SELECT id FROM players WHERE user_id = auth.uid()
      )
    )
  );

