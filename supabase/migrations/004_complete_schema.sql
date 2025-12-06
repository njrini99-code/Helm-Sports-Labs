-- ScoutPulse Complete Schema Migration
-- Ensures all tables and columns match current application code
-- Safe to run multiple times (IF NOT EXISTS / DO $$ blocks throughout)

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- PLAYERS TABLE - Add missing columns
-- ============================================================================

-- avatar_url (for profile images)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE players ADD COLUMN avatar_url text;
  END IF;
END$$;

-- full_name (computed from first_name + last_name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE players ADD COLUMN full_name text;
  END IF;
END$$;

-- pitch_velo (for metrics)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'pitch_velo'
  ) THEN
    ALTER TABLE players ADD COLUMN pitch_velo numeric;
  END IF;
END$$;

-- exit_velo (for metrics)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'exit_velo'
  ) THEN
    ALTER TABLE players ADD COLUMN exit_velo numeric;
  END IF;
END$$;

-- sixty_time (for metrics)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'sixty_time'
  ) THEN
    ALTER TABLE players ADD COLUMN sixty_time numeric;
  END IF;
END$$;

-- has_video (for filtering)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'has_video'
  ) THEN
    ALTER TABLE players ADD COLUMN has_video boolean DEFAULT false;
  END IF;
END$$;

-- verified_metrics (for filtering)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'verified_metrics'
  ) THEN
    ALTER TABLE players ADD COLUMN verified_metrics boolean DEFAULT false;
  END IF;
END$$;

-- Update existing players' full_name
UPDATE players 
SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) 
WHERE full_name IS NULL OR full_name = '';

-- Trigger to auto-update full_name
CREATE OR REPLACE FUNCTION update_player_full_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_player_full_name ON players;
CREATE TRIGGER trigger_update_player_full_name
  BEFORE INSERT OR UPDATE OF first_name, last_name ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_player_full_name();

-- ============================================================================
-- TEAMS TABLE - Add missing columns
-- ============================================================================

-- organization_name (for showcase/juco)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'organization_name'
  ) THEN
    ALTER TABLE teams ADD COLUMN organization_name text;
  END IF;
END$$;

-- school_name (for high school teams)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'school_name'
  ) THEN
    ALTER TABLE teams ADD COLUMN school_name text;
  END IF;
END$$;

-- logo_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE teams ADD COLUMN logo_url text;
  END IF;
END$$;

-- banner_url
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE teams ADD COLUMN banner_url text;
  END IF;
END$$;

-- about
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'about'
  ) THEN
    ALTER TABLE teams ADD COLUMN about text;
  END IF;
END$$;

-- program_values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'program_values'
  ) THEN
    ALTER TABLE teams ADD COLUMN program_values text;
  END IF;
END$$;

-- placement_highlights (for JUCO)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'placement_highlights'
  ) THEN
    ALTER TABLE teams ADD COLUMN placement_highlights text[];
  END IF;
END$$;

-- updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teams' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE teams ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END$$;

-- ============================================================================
-- TEAM_MEMBERSHIPS TABLE - Add missing columns
-- ============================================================================

-- status (pending/active/former)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_memberships' AND column_name = 'status'
  ) THEN
    ALTER TABLE team_memberships ADD COLUMN status text DEFAULT 'active';
  END IF;
END$$;

-- primary_team (boolean)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_memberships' AND column_name = 'primary_team'
  ) THEN
    ALTER TABLE team_memberships ADD COLUMN primary_team boolean DEFAULT true;
  END IF;
END$$;

-- jersey_number
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_memberships' AND column_name = 'jersey_number'
  ) THEN
    ALTER TABLE team_memberships ADD COLUMN jersey_number text;
  END IF;
END$$;

-- updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_memberships' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE team_memberships ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END$$;

-- ============================================================================
-- RECRUITS TABLE - Add high_school_state column
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recruits' AND column_name = 'high_school_state'
  ) THEN
    ALTER TABLE recruits ADD COLUMN high_school_state text;
  END IF;
END$$;

-- ============================================================================
-- CONVERSATIONS TABLE (if not exists from migration 003)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  program_id uuid REFERENCES coaches(id) ON DELETE CASCADE,
  last_message_text text,
  last_message_at timestamptz,
  last_sender text CHECK (last_sender IN ('player', 'coach', 'system')),
  player_unread_count integer DEFAULT 0,
  program_unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(player_id, program_id)
);

-- ============================================================================
-- MESSAGES TABLE (if not exists from migration 003)
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('player', 'coach', 'system')),
  sender_id uuid, -- Can be player_id or coach_id depending on sender_type
  sender_player_id uuid REFERENCES players(id) ON DELETE SET NULL,
  sender_program_id uuid REFERENCES coaches(id) ON DELETE SET NULL,
  message_text text NOT NULL,
  read_by_player boolean DEFAULT false,
  read_by_program boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- PLAYER_ENGAGEMENT TABLE (for trending/activity tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  profile_views_count integer DEFAULT 0,
  watchlist_adds_count integer DEFAULT 0,
  recent_views_7d integer DEFAULT 0,
  recent_updates_30d integer DEFAULT 0,
  last_viewed_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(player_id)
);

-- ============================================================================
-- PROGRAM_NEEDS TABLE (for AI recommendations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS program_needs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  positions_needed text[] DEFAULT '{}',
  grad_years_needed integer[] DEFAULT '{}',
  min_height integer,
  max_height integer,
  min_pitch_velo numeric,
  min_exit_velo numeric,
  max_sixty_time numeric,
  preferred_states text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(coach_id)
);

-- ============================================================================
-- RECRUIT_WATCHLIST TABLE (new pipeline system)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recruit_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'watchlist' CHECK (status IN ('watchlist', 'high_priority', 'offer_extended', 'committed', 'uninterested')),
  position_role text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(coach_id, player_id)
);

-- ============================================================================
-- TEAM_SCHEDULE TABLE (for team events)
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('game', 'practice', 'tournament', 'showcase')),
  opponent_name text,
  event_name text,
  location_name text,
  location_address text,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  notes text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- TEAM_MEDIA TABLE (for team photos/videos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS team_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('photo', 'video')),
  title text,
  description text,
  url text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruit_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_media ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Conversations
DROP POLICY IF EXISTS "Players can view own conversations" ON conversations;
CREATE POLICY "Players can view own conversations" ON conversations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM players p WHERE p.id = conversations.player_id AND p.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Coaches can view own conversations" ON conversations;
CREATE POLICY "Coaches can view own conversations" ON conversations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM coaches c WHERE c.id = conversations.program_id AND c.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Players can create conversations" ON conversations;
CREATE POLICY "Players can create conversations" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM players p WHERE p.id = conversations.player_id AND p.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Coaches can create conversations" ON conversations;
CREATE POLICY "Coaches can create conversations" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM coaches c WHERE c.id = conversations.program_id AND c.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Players can update own conversations" ON conversations;
CREATE POLICY "Players can update own conversations" ON conversations
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM players p WHERE p.id = conversations.player_id AND p.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM players p WHERE p.id = conversations.player_id AND p.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Coaches can update own conversations" ON conversations;
CREATE POLICY "Coaches can update own conversations" ON conversations
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM coaches c WHERE c.id = conversations.program_id AND c.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM coaches c WHERE c.id = conversations.program_id AND c.user_id = (SELECT auth.uid())));

-- Messages
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON messages;
CREATE POLICY "Users can view messages in own conversations" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      LEFT JOIN players p ON p.id = c.player_id
      LEFT JOIN coaches co ON co.id = c.program_id
      WHERE c.id = messages.conversation_id
      AND (p.user_id = (SELECT auth.uid()) OR co.user_id = (SELECT auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      LEFT JOIN players p ON p.id = c.player_id
      LEFT JOIN coaches co ON co.id = c.program_id
      WHERE c.id = messages.conversation_id
      AND (p.user_id = (SELECT auth.uid()) OR co.user_id = (SELECT auth.uid()))
    )
  );

-- Player Engagement
DROP POLICY IF EXISTS "Authenticated can read engagement" ON player_engagement;
CREATE POLICY "Authenticated can read engagement" ON player_engagement
  FOR SELECT TO authenticated USING (true);

-- Program Needs
DROP POLICY IF EXISTS "Coach can manage own needs" ON program_needs;
CREATE POLICY "Coach can manage own needs" ON program_needs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM coaches c WHERE c.id = program_needs.coach_id AND c.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM coaches c WHERE c.id = program_needs.coach_id AND c.user_id = (SELECT auth.uid())));

-- Recruit Watchlist
DROP POLICY IF EXISTS "Coach can manage own watchlist" ON recruit_watchlist;
CREATE POLICY "Coach can manage own watchlist" ON recruit_watchlist
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM coaches c WHERE c.id = recruit_watchlist.coach_id AND c.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM coaches c WHERE c.id = recruit_watchlist.coach_id AND c.user_id = (SELECT auth.uid())));

-- Team Schedule
DROP POLICY IF EXISTS "Team owners can manage schedule" ON team_schedule;
CREATE POLICY "Team owners can manage schedule" ON team_schedule
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      JOIN coaches c ON c.id = t.coach_id
      WHERE t.id = team_schedule.team_id AND c.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      JOIN coaches c ON c.id = t.coach_id
      WHERE t.id = team_schedule.team_id AND c.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Anyone can view public schedule" ON team_schedule;
CREATE POLICY "Anyone can view public schedule" ON team_schedule
  FOR SELECT TO authenticated
  USING (is_public = true);

-- Team Media
DROP POLICY IF EXISTS "Team owners can manage media" ON team_media;
CREATE POLICY "Team owners can manage media" ON team_media
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      JOIN coaches c ON c.id = t.coach_id
      WHERE t.id = team_media.team_id AND c.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      JOIN coaches c ON c.id = t.coach_id
      WHERE t.id = team_media.team_id AND c.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Anyone can view team media" ON team_media;
CREATE POLICY "Anyone can view team media" ON team_media
  FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Players
CREATE INDEX IF NOT EXISTS idx_players_state ON players(high_school_state);
CREATE INDEX IF NOT EXISTS idx_players_grad_year ON players(grad_year);
CREATE INDEX IF NOT EXISTS idx_players_primary_position ON players(primary_position);
CREATE INDEX IF NOT EXISTS idx_players_full_name_trgm ON players USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_players_avatar_url ON players(avatar_url) WHERE avatar_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_players_pitch_velo ON players(pitch_velo);
CREATE INDEX IF NOT EXISTS idx_players_exit_velo ON players(exit_velo);
CREATE INDEX IF NOT EXISTS idx_players_sixty_time ON players(sixty_time);
CREATE INDEX IF NOT EXISTS idx_players_onboarding ON players(onboarding_completed);

-- Teams
CREATE INDEX IF NOT EXISTS idx_teams_state ON teams(state);
CREATE INDEX IF NOT EXISTS idx_teams_type ON teams(team_type);
CREATE INDEX IF NOT EXISTS idx_teams_coach_id ON teams(coach_id);

-- Team Memberships
CREATE INDEX IF NOT EXISTS idx_team_memberships_team_id ON team_memberships(team_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_player_id ON team_memberships(player_id);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_player_id ON conversations(player_id);
CREATE INDEX IF NOT EXISTS idx_conversations_program_id ON conversations(program_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Engagement
CREATE INDEX IF NOT EXISTS idx_player_engagement_recent_views ON player_engagement(recent_views_7d DESC);
CREATE INDEX IF NOT EXISTS idx_player_engagement_player_id ON player_engagement(player_id);

-- Watchlist
CREATE INDEX IF NOT EXISTS idx_recruit_watchlist_coach_status ON recruit_watchlist(coach_id, status);
CREATE INDEX IF NOT EXISTS idx_recruit_watchlist_player ON recruit_watchlist(player_id);

-- Program Needs
CREATE UNIQUE INDEX IF NOT EXISTS idx_program_needs_coach ON program_needs(coach_id);

-- Team Schedule
CREATE INDEX IF NOT EXISTS idx_team_schedule_team_id ON team_schedule(team_id);
CREATE INDEX IF NOT EXISTS idx_team_schedule_start_time ON team_schedule(start_time);

-- Team Media
CREATE INDEX IF NOT EXISTS idx_team_media_team_id ON team_media(team_id);

-- ============================================================================
-- UPDATED_AT TRIGGERS
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

-- Teams
DROP TRIGGER IF EXISTS set_updated_at_teams ON teams;
CREATE TRIGGER set_updated_at_teams
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Team Memberships
DROP TRIGGER IF EXISTS set_updated_at_team_memberships ON team_memberships;
CREATE TRIGGER set_updated_at_team_memberships
  BEFORE UPDATE ON team_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Conversations
DROP TRIGGER IF EXISTS set_updated_at_conversations ON conversations;
CREATE TRIGGER set_updated_at_conversations
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Messages
DROP TRIGGER IF EXISTS set_updated_at_messages ON messages;
CREATE TRIGGER set_updated_at_messages
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Player Engagement
DROP TRIGGER IF EXISTS set_updated_at_player_engagement ON player_engagement;
CREATE TRIGGER set_updated_at_player_engagement
  BEFORE UPDATE ON player_engagement
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Program Needs
DROP TRIGGER IF EXISTS set_updated_at_program_needs ON program_needs;
CREATE TRIGGER set_updated_at_program_needs
  BEFORE UPDATE ON program_needs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Recruit Watchlist
DROP TRIGGER IF EXISTS set_updated_at_recruit_watchlist ON recruit_watchlist;
CREATE TRIGGER set_updated_at_recruit_watchlist
  BEFORE UPDATE ON recruit_watchlist
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Team Schedule
DROP TRIGGER IF EXISTS set_updated_at_team_schedule ON team_schedule;
CREATE TRIGGER set_updated_at_team_schedule
  BEFORE UPDATE ON team_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- FUNCTION: Update conversation on new message
-- ============================================================================

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_text = NEW.message_text,
    last_message_at = NEW.created_at,
    last_sender = NEW.sender_type,
    player_unread_count = CASE 
      WHEN NEW.sender_type = 'coach' THEN player_unread_count + 1
      ELSE player_unread_count
    END,
    program_unread_count = CASE 
      WHEN NEW.sender_type = 'player' THEN program_unread_count + 1
      ELSE program_unread_count
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- ============================================================================
-- FUNCTION: Get state counts for map
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_state_counts()
RETURNS TABLE (state text, count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT high_school_state as state, COUNT(*) as count
  FROM players
  WHERE high_school_state IS NOT NULL
    AND onboarding_completed = true
  GROUP BY high_school_state
  ORDER BY count DESC;
$$;

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'ScoutPulse complete schema migration finished!';
  RAISE NOTICE 'All tables, columns, indexes, triggers, and RLS policies are in place.';
END $$;

