-- ============================================================================
-- HIGH SCHOOL COACH DASHBOARD FEATURES
-- Migration: 010_hs_coach_dashboard_features.sql
-- Adds tables for: invitations, parent access, team messages, stats, notifications
-- ============================================================================

-- ============================================================================
-- TEAM INVITATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  invite_code text UNIQUE NOT NULL,
  created_by uuid REFERENCES coaches(id) ON DELETE CASCADE NOT NULL,
  expires_at timestamptz,
  max_uses integer,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_team_invitations_code ON team_invitations(invite_code);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON team_invitations(team_id);

-- ============================================================================
-- PARENT ACCESS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS parent_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  relationship text NOT NULL DEFAULT 'parent',
  granted_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(parent_id, player_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_access_player ON parent_access(player_id);
CREATE INDEX IF NOT EXISTS idx_parent_access_team ON parent_access(team_id);
CREATE INDEX IF NOT EXISTS idx_parent_access_parent ON parent_access(parent_id);

-- ============================================================================
-- TEAM MESSAGES TABLE (for team broadcasts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('team', 'direct', 'parent', 'alert')),
  recipient_ids uuid[],
  subject text,
  body text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  priority text DEFAULT 'normal' CHECK (priority IN ('normal', 'high')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_team_messages_team ON team_messages(team_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_sender ON team_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_type ON team_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_team_messages_sent ON team_messages(sent_at);

-- ============================================================================
-- MESSAGE RECEIPTS TABLE (for read receipts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS message_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES team_messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  read_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_receipts_message ON message_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_receipts_user ON message_receipts(user_id);

-- ============================================================================
-- PLAYER STATS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  game_id uuid REFERENCES team_schedule(id) ON DELETE SET NULL,
  stat_type text NOT NULL CHECK (stat_type IN ('hitting', 'pitching', 'fielding')),
  stats_data jsonb NOT NULL,
  verified boolean DEFAULT false,
  verified_by uuid REFERENCES coaches(id) ON DELETE SET NULL,
  verified_at timestamptz,
  uploaded_via text DEFAULT 'manual' CHECK (uploaded_via IN ('manual', 'ai_upload', 'import')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_team ON player_stats(team_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_game ON player_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_type ON player_stats(stat_type);
CREATE INDEX IF NOT EXISTS idx_player_stats_verified ON player_stats(verified);

-- ============================================================================
-- EVENT ATTENDANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES team_schedule(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'not_marked' CHECK (status IN ('present', 'absent', 'excused', 'not_marked')),
  marked_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  marked_at timestamptz DEFAULT now() NOT NULL,
  notes text,
  UNIQUE(event_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_event_attendance_event ON event_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_player ON event_attendance(player_id);

-- ============================================================================
-- PRACTICE PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS practice_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES team_schedule(id) ON DELETE CASCADE NOT NULL,
  plan_content text NOT NULL,
  plan_pdf_url text,
  created_by uuid REFERENCES coaches(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_practice_plans_event ON practice_plans(event_id);

-- ============================================================================
-- NOTIFICATIONS TABLE (enhance existing if needed)
-- ============================================================================
-- Check if notifications table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    CREATE TABLE notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      notification_type text NOT NULL,
      title text NOT NULL,
      body text NOT NULL,
      link text,
      read boolean DEFAULT false,
      created_at timestamptz DEFAULT now() NOT NULL
    );
    
    CREATE INDEX idx_notifications_user ON notifications(user_id);
    CREATE INDEX idx_notifications_read ON notifications(read);
    CREATE INDEX idx_notifications_created ON notifications(created_at);
  END IF;
END$$;

-- ============================================================================
-- ADD TEAM_CODE TO TEAMS TABLE (if missing)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'team_code'
  ) THEN
    ALTER TABLE teams ADD COLUMN team_code text UNIQUE;
  END IF;
END$$;

-- Generate team codes for existing teams if they don't have one
UPDATE teams 
SET team_code = UPPER(SUBSTRING(MD5(RANDOM()::text || id::text) FROM 1 FOR 8))
WHERE team_code IS NULL;

-- ============================================================================
-- ADD SEASON_YEAR TO TEAMS TABLE (if missing)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'season_year'
  ) THEN
    ALTER TABLE teams ADD COLUMN season_year text;
  END IF;
END$$;

-- ============================================================================
-- ADD PARENT_ACCESS_ENABLED TO TEAMS TABLE (if missing)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'parent_access_enabled'
  ) THEN
    ALTER TABLE teams ADD COLUMN parent_access_enabled boolean DEFAULT true;
  END IF;
END$$;

-- ============================================================================
-- ADD PRACTICE_PLAN_URL TO TEAM_SCHEDULE TABLE (if missing)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_schedule' AND column_name = 'practice_plan_url'
  ) THEN
    ALTER TABLE team_schedule ADD COLUMN practice_plan_url text;
  END IF;
END$$;

-- ============================================================================
-- ADD CANCELLED TO TEAM_SCHEDULE TABLE (if missing)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_schedule' AND column_name = 'cancelled'
  ) THEN
    ALTER TABLE team_schedule ADD COLUMN cancelled boolean DEFAULT false;
  END IF;
END$$;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Team Invitations: Coaches can manage their team's invitations
CREATE POLICY "Coaches can manage their team invitations"
  ON team_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_invitations.team_id 
      AND teams.coach_id = auth.uid()::text
    )
  );

-- Parent Access: Parents can view their own access, coaches can manage
CREATE POLICY "Parents can view their own access"
  ON parent_access FOR SELECT
  USING (parent_id = auth.uid()::text);

CREATE POLICY "Coaches can manage parent access for their teams"
  ON parent_access FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = parent_access.team_id 
      AND teams.coach_id = auth.uid()::text
    )
  );

-- Team Messages: Team members can view, coaches can send
CREATE POLICY "Team members can view team messages"
  ON team_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_memberships 
      WHERE team_memberships.team_id = team_messages.team_id
      AND team_memberships.player_id IN (
        SELECT id FROM players WHERE user_id = auth.uid()::text
      )
    )
    OR sender_id = auth.uid()::text
  );

CREATE POLICY "Coaches can send team messages"
  ON team_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_messages.team_id 
      AND teams.coach_id = auth.uid()::text
    )
  );

-- Message Receipts: Users can view their own receipts
CREATE POLICY "Users can view their own message receipts"
  ON message_receipts FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own message receipts"
  ON message_receipts FOR UPDATE
  USING (user_id = auth.uid()::text);

-- Player Stats: Team members can view, coaches can manage
CREATE POLICY "Team members can view player stats"
  ON player_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_memberships 
      WHERE team_memberships.team_id = player_stats.team_id
      AND team_memberships.player_id IN (
        SELECT id FROM players WHERE user_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Coaches can manage player stats"
  ON player_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = player_stats.team_id 
      AND teams.coach_id = auth.uid()::text
    )
  );

-- Event Attendance: Team members can view, coaches can manage
CREATE POLICY "Team members can view attendance"
  ON event_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_schedule ts
      JOIN team_memberships tm ON tm.team_id = ts.team_id
      WHERE ts.id = event_attendance.event_id
      AND tm.player_id IN (
        SELECT id FROM players WHERE user_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Coaches can manage attendance"
  ON event_attendance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_schedule ts
      JOIN teams t ON t.id = ts.team_id
      WHERE ts.id = event_attendance.event_id
      AND t.coach_id = auth.uid()::text
    )
  );

-- Practice Plans: Team members can view, coaches can manage
CREATE POLICY "Team members can view practice plans"
  ON practice_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_schedule ts
      JOIN team_memberships tm ON tm.team_id = ts.team_id
      WHERE ts.id = practice_plans.event_id
      AND tm.player_id IN (
        SELECT id FROM players WHERE user_id = auth.uid()::text
      )
    )
  );

CREATE POLICY "Coaches can manage practice plans"
  ON practice_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_schedule ts
      JOIN teams t ON t.id = ts.team_id
      WHERE ts.id = practice_plans.event_id
      AND t.coach_id = auth.uid()::text
    )
  );

