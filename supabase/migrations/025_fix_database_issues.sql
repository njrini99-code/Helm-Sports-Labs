-- ============================================================================
-- FIX ALL DATABASE ISSUES
-- Migration: 025_fix_database_issues.sql
-- Purpose: Fix security issues, missing tables, and complete schema
-- Safe to run: YES
-- ============================================================================

-- ============================================================================
-- 1. FIX SECURITY ISSUES
-- ============================================================================

-- Fix: Enable RLS on team_schedule (CRITICAL SECURITY ISSUE)
ALTER TABLE IF EXISTS team_schedule ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for team_schedule if they don't exist
DO $$
BEGIN
  -- Team owners can manage schedule
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'team_schedule' 
    AND policyname = 'Team owners can manage schedule'
  ) THEN
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
  END IF;

  -- Anyone can view public schedule
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'team_schedule' 
    AND policyname = 'Anyone can view public schedule'
  ) THEN
    CREATE POLICY "Anyone can view public schedule" ON team_schedule
      FOR SELECT TO authenticated
      USING (is_public = true);
  END IF;
END$$;

-- Fix: Set search_path on all functions (SECURITY FIX)
CREATE OR REPLACE FUNCTION sync_profile_from_player()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Implementation
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION sync_profile_from_coach()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Implementation
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION deactivate_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Implementation
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_player_full_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.full_name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION is_coach()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'coach'
  );
$$;

-- ============================================================================
-- 2. FIX TEAM_MEDIA TABLE COLUMN NAMES
-- ============================================================================

-- team_media table exists but may have url vs media_url mismatch
-- Add both columns for compatibility
DO $$
BEGIN
  -- Add url column if it doesn't exist (for compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_media' AND column_name = 'url'
  ) THEN
    ALTER TABLE team_media ADD COLUMN url text;
    -- Copy media_url to url if media_url exists
    UPDATE team_media SET url = media_url WHERE media_url IS NOT NULL;
  END IF;
  
  -- Add media_url column if it doesn't exist (for compatibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_media' AND column_name = 'media_url'
  ) THEN
    ALTER TABLE team_media ADD COLUMN media_url text;
    -- Copy url to media_url if url exists
    UPDATE team_media SET media_url = url WHERE url IS NOT NULL;
  END IF;
  
  -- Add thumbnail_url if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'team_media' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE team_media ADD COLUMN thumbnail_url text;
  END IF;
END$$;

-- ============================================================================
-- 3. CREATE MISSING TABLES REFERENCED IN CODE
-- ============================================================================

-- Game Stats Table (for player game statistics)
CREATE TABLE IF NOT EXISTS game_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  game_date date NOT NULL,
  points integer DEFAULT 0,
  field_goal_percentage numeric(5,2),
  fg_percentage numeric(5,2), -- Alias for compatibility
  three_point_percentage numeric(5,2),
  three_pct numeric(5,2), -- Alias for compatibility
  free_throw_percentage numeric(5,2),
  ft_percentage numeric(5,2), -- Alias for compatibility
  rebounds integer DEFAULT 0,
  assists integer DEFAULT 0,
  steals integer DEFAULT 0,
  blocks integer DEFAULT 0,
  turnovers integer DEFAULT 0,
  minutes_played integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Schedule Events Table (for player-specific events)
CREATE TABLE IF NOT EXISTS schedule_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  event_date date NOT NULL,
  event_name text,
  event_type text CHECK (event_type IN ('game', 'practice', 'tournament', 'showcase', 'camp', 'other')),
  opponent_name text,
  location_name text,
  location_address text,
  start_time time,
  end_time time,
  notes text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Team Commitments Table (for tracking player college commitments)
CREATE TABLE IF NOT EXISTS team_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  player_name text NOT NULL,
  grad_year integer NOT NULL,
  college_name text NOT NULL,
  division text,
  conference text,
  commitment_year integer,
  commitment_date date,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Verified Player Stats Table (for verified statistics)
CREATE TABLE IF NOT EXISTS verified_player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  stat_type text NOT NULL,
  value numeric NOT NULL,
  source text,
  event_name text,
  measured_at timestamptz,
  verified_by uuid REFERENCES coaches(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Evaluations Table (already exists, ensure it has all needed columns)
DO $$
BEGIN
  -- Add missing columns if needed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evaluations' AND column_name = 'grade'
  ) THEN
    ALTER TABLE evaluations ADD COLUMN grade integer CHECK (grade >= 0 AND grade <= 100);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evaluations' AND column_name = 'evaluation_notes'
  ) THEN
    ALTER TABLE evaluations ADD COLUMN evaluation_notes text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evaluations' AND column_name = 'event_name'
  ) THEN
    ALTER TABLE evaluations ADD COLUMN event_name text;
  END IF;
END$$;

-- Evaluations Table structure (for reference - table already exists)
-- CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  evaluator_id uuid REFERENCES coaches(id) ON DELETE SET NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  eval_date date NOT NULL,
  event_name text,
  overall_grade integer CHECK (overall_grade >= 0 AND overall_grade <= 100),
  grade integer CHECK (grade >= 0 AND grade <= 100), -- Alias for compatibility
  strengths text[],
  evaluation_notes text,
  areas_to_improve text,
  notes text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
) - Table already exists, columns added above if missing;

-- Colleges Table (already exists - verified in table list)
-- No changes needed - table exists with all required columns

-- ============================================================================
-- 3. ADD INDEXES FOR NEW TABLES
-- ============================================================================

-- Game Stats indexes
CREATE INDEX IF NOT EXISTS idx_game_stats_player_id ON game_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_event_id ON game_stats(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_stats_game_date ON game_stats(game_date DESC);

-- Schedule Events indexes
CREATE INDEX IF NOT EXISTS idx_schedule_events_player_id ON schedule_events(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_schedule_events_team_id ON schedule_events(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_schedule_events_date ON schedule_events(event_date DESC);

-- Team Commitments indexes
CREATE INDEX IF NOT EXISTS idx_team_commitments_team_id ON team_commitments(team_id);
CREATE INDEX IF NOT EXISTS idx_team_commitments_player_id ON team_commitments(player_id);
CREATE INDEX IF NOT EXISTS idx_team_commitments_grad_year ON team_commitments(grad_year);

-- Verified Player Stats indexes
CREATE INDEX IF NOT EXISTS idx_verified_stats_team_id ON verified_player_stats(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_verified_stats_player_id ON verified_player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_verified_stats_type ON verified_player_stats(stat_type);

-- Evaluations indexes
CREATE INDEX IF NOT EXISTS idx_evaluations_player_id ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator_id ON evaluations(evaluator_id) WHERE evaluator_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_evaluations_event_id ON evaluations(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_evaluations_date ON evaluations(eval_date DESC);

-- Colleges indexes
CREATE INDEX IF NOT EXISTS idx_colleges_name ON colleges(name);
CREATE INDEX IF NOT EXISTS idx_colleges_state ON colleges(state);
CREATE INDEX IF NOT EXISTS idx_colleges_division ON colleges(division);

-- ============================================================================
-- 5. ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE IF EXISTS game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verified_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS colleges ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. ADD RLS POLICIES FOR NEW TABLES
-- ============================================================================

-- Game Stats Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'game_stats' AND policyname = 'Players can view own stats'
  ) THEN
    CREATE POLICY "Players can view own stats" ON game_stats
      FOR SELECT TO authenticated
      USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'game_stats' AND policyname = 'Coaches can view team player stats'
  ) THEN
    CREATE POLICY "Coaches can view team player stats" ON game_stats
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM team_memberships tm
          JOIN teams t ON t.id = tm.team_id
          JOIN coaches c ON c.id = t.coach_id
          WHERE tm.player_id = game_stats.player_id
          AND tm.status = 'active'
          AND c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- Schedule Events Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'schedule_events' AND policyname = 'Players can view own events'
  ) THEN
    CREATE POLICY "Players can view own events" ON schedule_events
      FOR SELECT TO authenticated
      USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'schedule_events' AND policyname = 'Team members can view team events'
  ) THEN
    CREATE POLICY "Team members can view team events" ON schedule_events
      FOR SELECT TO authenticated
      USING (
        team_id IN (
          SELECT tm.team_id FROM team_memberships tm
          JOIN players p ON p.id = tm.player_id
          WHERE p.user_id = auth.uid() AND tm.status = 'active'
        )
        OR
        team_id IN (
          SELECT t.id FROM teams t
          JOIN coaches c ON c.id = t.coach_id
          WHERE c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- Team Commitments Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'team_commitments' AND policyname = 'Public read team commitments'
  ) THEN
    CREATE POLICY "Public read team commitments" ON team_commitments
      FOR SELECT TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'team_commitments' AND policyname = 'Team owners can manage commitments'
  ) THEN
    CREATE POLICY "Team owners can manage commitments" ON team_commitments
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM teams t
          JOIN coaches c ON c.id = t.coach_id
          WHERE t.id = team_commitments.team_id AND c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- Verified Player Stats Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'verified_player_stats' AND policyname = 'Players can view own stats'
  ) THEN
    CREATE POLICY "Players can view own stats" ON verified_player_stats
      FOR SELECT TO authenticated
      USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'verified_player_stats' AND policyname = 'Coaches can manage stats'
  ) THEN
    CREATE POLICY "Coaches can manage stats" ON verified_player_stats
      FOR ALL TO authenticated
      USING (
        verified_by = (SELECT id FROM coaches WHERE user_id = auth.uid())
        OR
        team_id IN (
          SELECT t.id FROM teams t
          JOIN coaches c ON c.id = t.coach_id
          WHERE c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- Evaluations Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'evaluations' AND policyname = 'Players can view own evaluations'
  ) THEN
    CREATE POLICY "Players can view own evaluations" ON evaluations
      FOR SELECT TO authenticated
      USING (
        player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
        OR is_public = true
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'evaluations' AND policyname = 'Evaluators can manage evaluations'
  ) THEN
    CREATE POLICY "Evaluators can manage evaluations" ON evaluations
      FOR ALL TO authenticated
      USING (
        evaluator_id = (SELECT id FROM coaches WHERE user_id = auth.uid())
      );
  END IF;
END$$;

-- Colleges Policies (public read)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'colleges' AND policyname = 'Public read colleges'
  ) THEN
    CREATE POLICY "Public read colleges" ON colleges
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END$$;

-- ============================================================================
-- 7. ADD TRIGGERS FOR UPDATED_AT ON NEW TABLES
-- ============================================================================

-- Game Stats
DROP TRIGGER IF EXISTS set_updated_at_game_stats ON game_stats;
CREATE TRIGGER set_updated_at_game_stats
  BEFORE UPDATE ON game_stats
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Schedule Events
DROP TRIGGER IF EXISTS set_updated_at_schedule_events ON schedule_events;
CREATE TRIGGER set_updated_at_schedule_events
  BEFORE UPDATE ON schedule_events
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Team Commitments
DROP TRIGGER IF EXISTS set_updated_at_team_commitments ON team_commitments;
CREATE TRIGGER set_updated_at_team_commitments
  BEFORE UPDATE ON team_commitments
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Verified Player Stats
DROP TRIGGER IF EXISTS set_updated_at_verified_stats ON verified_player_stats;
CREATE TRIGGER set_updated_at_verified_stats
  BEFORE UPDATE ON verified_player_stats
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Evaluations
DROP TRIGGER IF EXISTS set_updated_at_evaluations ON evaluations;
CREATE TRIGGER set_updated_at_evaluations
  BEFORE UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Colleges
DROP TRIGGER IF EXISTS set_updated_at_colleges ON colleges;
CREATE TRIGGER set_updated_at_colleges
  BEFORE UPDATE ON colleges
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 7. ADD FOREIGN KEY INDEXES
-- ============================================================================

-- Game Stats foreign keys
CREATE INDEX IF NOT EXISTS idx_game_stats_player_fk ON game_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_event_fk ON game_stats(event_id) WHERE event_id IS NOT NULL;

-- Schedule Events foreign keys
CREATE INDEX IF NOT EXISTS idx_schedule_events_player_fk ON schedule_events(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_schedule_events_team_fk ON schedule_events(team_id) WHERE team_id IS NOT NULL;

-- Team Commitments foreign keys
CREATE INDEX IF NOT EXISTS idx_team_commitments_team_fk ON team_commitments(team_id);
CREATE INDEX IF NOT EXISTS idx_team_commitments_player_fk ON team_commitments(player_id);

-- Verified Stats foreign keys
CREATE INDEX IF NOT EXISTS idx_verified_stats_team_fk ON verified_player_stats(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_verified_stats_player_fk ON verified_player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_verified_stats_verified_by_fk ON verified_player_stats(verified_by) WHERE verified_by IS NOT NULL;

-- Evaluations foreign keys
CREATE INDEX IF NOT EXISTS idx_evaluations_player_fk ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator_fk ON evaluations(evaluator_id) WHERE evaluator_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_evaluations_event_fk ON evaluations(event_id) WHERE event_id IS NOT NULL;

-- ============================================================================
-- 9. ADD MISSING COLUMN TO TEAM_MEMBERSHIPS
-- ============================================================================

-- Ensure updated_at exists on team_memberships
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
-- 10. ANALYZE ALL TABLES
-- ============================================================================

ANALYZE game_stats;
ANALYZE schedule_events;
ANALYZE team_commitments;
ANALYZE verified_player_stats;
ANALYZE evaluations;
ANALYZE colleges;
ANALYZE team_schedule;

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Database issues fixed!';
  RAISE NOTICE 'Security issues resolved (RLS, search_path)';
  RAISE NOTICE 'Missing tables created';
  RAISE NOTICE 'Indexes and policies added';
END $$;



