-- ScoutPulse Initial Database Schema (Improved Version)
-- Run this in your Supabase SQL Editor
-- This version includes security improvements, proper RLS policies, and auto-update triggers

-- Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('player', 'coach')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  grad_year integer,
  high_school_name text,
  high_school_city text,
  high_school_state text,
  showcase_team_name text,
  showcase_team_level text,
  height_feet integer,
  height_inches integer,
  weight_lbs integer,
  primary_position text,
  secondary_position text,
  throws text,
  bats text,
  perfect_game_url text,
  twitter_url text,
  primary_goal text,
  about_me text,
  top_schools text[] DEFAULT '{}',
  onboarding_completed boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create coaches table
CREATE TABLE IF NOT EXISTS coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  coach_type text CHECK (coach_type IN ('college', 'juco', 'high_school', 'showcase')),
  coach_title text,
  staff_role text,
  -- Program info (college/juco)
  program_name text,
  program_division text,
  athletic_conference text,
  school_name text,
  school_city text,
  school_state text,
  -- Contact
  email_contact text,
  phone_contact text,
  years_in_program integer,
  -- Program profile
  program_values text,
  facility_summary text,
  recruiting_needs text[],
  about text,
  what_we_look_for text,
  academic_profile text,
  -- Media
  logo_url text,
  banner_url text,
  intro_video_url text,
  tags text[] DEFAULT '{}',
  -- Showcase specific
  organization_name text,
  organization_city text,
  organization_state text,
  age_groups text[],
  team_divisions text[],
  showcase_success_highlights text[],
  showcase_mission text,
  -- JUCO specific
  placement_rate text,
  placement_highlights text[],
  program_philosophy text,
  program_website text,
  -- High school specific
  team_level text[],
  primary_field_name text,
  primary_field_address text,
  practice_philosophy text,
  developmental_focus text[],
  communication_pref text,
  years_coaching integer,
  -- Status
  onboarding_completed boolean DEFAULT false NOT NULL,
  onboarding_step integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create camp_events table
CREATE TABLE IF NOT EXISTS camp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES coaches(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  event_type text NOT NULL DEFAULT 'Prospect Camp',
  description text,
  location text,
  registration_link text,
  is_public boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES coaches(id) ON DELETE CASCADE NOT NULL,
  team_type text NOT NULL,
  name text NOT NULL,
  level text,
  city text,
  state text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create team_memberships table
CREATE TABLE IF NOT EXISTS team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'player',
  joined_at timestamptz DEFAULT now() NOT NULL
);

-- Create recruits table (coach watchlist)
CREATE TABLE IF NOT EXISTS recruits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES coaches(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE SET NULL,
  name text NOT NULL,
  grad_year text,
  primary_position text,
  high_school_name text,
  high_school_state text,
  stage text NOT NULL DEFAULT 'Watchlist',
  priority text DEFAULT 'B',
  notes text,
  next_action_date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create player_metrics table
CREATE TABLE IF NOT EXISTS player_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  metric_label text NOT NULL,
  metric_value text NOT NULL,
  metric_type text DEFAULT 'other',
  context text,
  verified_date date,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create player_videos table
CREATE TABLE IF NOT EXISTS player_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  video_type text NOT NULL CHECK (video_type IN ('Game', 'Training')),
  video_url text NOT NULL,
  recorded_date date,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create player_achievements table
CREATE TABLE IF NOT EXISTS player_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  achievement_text text NOT NULL,
  achievement_date date,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruits ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (Improved with wrapped auth.uid() and WITH CHECK clauses)
-- ============================================================================

-- Profiles RLS
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Players RLS
DROP POLICY IF EXISTS "Players can read own record" ON players;
DROP POLICY IF EXISTS "Players can insert own record" ON players;
DROP POLICY IF EXISTS "Players can update own record" ON players;
DROP POLICY IF EXISTS "Coaches can view all players" ON players;

CREATE POLICY "Players can read own record" ON players
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Players can insert own record" ON players
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Players can update own record" ON players
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Coaches can view all players (restricted to authenticated coaches only)
CREATE POLICY "Coaches can view all players" ON players
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.user_id = (SELECT auth.uid())
    )
  );

-- Coaches RLS
DROP POLICY IF EXISTS "Coaches can read own record" ON coaches;
DROP POLICY IF EXISTS "Coaches can insert own record" ON coaches;
DROP POLICY IF EXISTS "Coaches can update own record" ON coaches;
DROP POLICY IF EXISTS "Public can view coaches" ON coaches;

CREATE POLICY "Coaches can read own record" ON coaches
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Coaches can insert own record" ON coaches
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Coaches can update own record" ON coaches
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Public can view coaches (authenticated users only)
CREATE POLICY "Public can view coaches" ON coaches
  FOR SELECT TO authenticated
  USING (true);

-- Camp Events RLS
DROP POLICY IF EXISTS "Coaches can manage own events" ON camp_events;
DROP POLICY IF EXISTS "Anyone can view public events" ON camp_events;

CREATE POLICY "Coaches can manage own events" ON camp_events
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.id = camp_events.coach_id 
      AND c.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.id = camp_events.coach_id 
      AND c.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Anyone can view public events" ON camp_events
  FOR SELECT TO authenticated
  USING (is_public = true);

-- Teams RLS
DROP POLICY IF EXISTS "Coaches can manage own teams" ON teams;

CREATE POLICY "Coaches can manage own teams" ON teams
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.id = teams.coach_id 
      AND c.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.id = teams.coach_id 
      AND c.user_id = (SELECT auth.uid())
    )
  );

-- Recruits RLS
DROP POLICY IF EXISTS "Coaches can manage own recruits" ON recruits;

CREATE POLICY "Coaches can manage own recruits" ON recruits
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.id = recruits.coach_id 
      AND c.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.id = recruits.coach_id 
      AND c.user_id = (SELECT auth.uid())
    )
  );

-- Player Metrics/Videos/Achievements RLS
DROP POLICY IF EXISTS "Players can manage own metrics" ON player_metrics;
DROP POLICY IF EXISTS "Coaches can view metrics" ON player_metrics;
DROP POLICY IF EXISTS "Players can manage own videos" ON player_videos;
DROP POLICY IF EXISTS "Coaches can view videos" ON player_videos;
DROP POLICY IF EXISTS "Players can manage own achievements" ON player_achievements;
DROP POLICY IF EXISTS "Coaches can view achievements" ON player_achievements;

CREATE POLICY "Players can manage own metrics" ON player_metrics
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p 
      WHERE p.id = player_metrics.player_id 
      AND p.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players p 
      WHERE p.id = player_metrics.player_id 
      AND p.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Coaches can view metrics" ON player_metrics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Players can manage own videos" ON player_videos
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p 
      WHERE p.id = player_videos.player_id 
      AND p.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players p 
      WHERE p.id = player_videos.player_id 
      AND p.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Coaches can view videos" ON player_videos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Players can manage own achievements" ON player_achievements
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p 
      WHERE p.id = player_achievements.player_id 
      AND p.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players p 
      WHERE p.id = player_achievements.player_id 
      AND p.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Coaches can view achievements" ON player_achievements
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_state ON players(high_school_state);
CREATE INDEX IF NOT EXISTS idx_players_grad_year ON players(grad_year);
CREATE INDEX IF NOT EXISTS idx_coaches_user_id ON coaches(user_id);
CREATE INDEX IF NOT EXISTS idx_coaches_type ON coaches(coach_type);
CREATE INDEX IF NOT EXISTS idx_camp_events_coach_id ON camp_events(coach_id);
CREATE INDEX IF NOT EXISTS idx_camp_events_date ON camp_events(event_date);
CREATE INDEX IF NOT EXISTS idx_recruits_coach_id ON recruits(coach_id);
CREATE INDEX IF NOT EXISTS idx_recruits_stage ON recruits(stage);
CREATE INDEX IF NOT EXISTS idx_teams_coach_id ON teams(coach_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_player_id ON team_memberships(player_id);
CREATE INDEX IF NOT EXISTS idx_team_memberships_team_id ON team_memberships(team_id);

-- ============================================================================
-- AUTO-UPDATE TRIGGERS FOR updated_at
-- ============================================================================

-- Function to set updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers to all tables with updated_at column
-- Drop existing triggers first to make migration idempotent
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_players ON players;
CREATE TRIGGER set_updated_at_players
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_coaches ON coaches;
CREATE TRIGGER set_updated_at_coaches
  BEFORE UPDATE ON coaches
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_camp_events ON camp_events;
CREATE TRIGGER set_updated_at_camp_events
  BEFORE UPDATE ON camp_events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_recruits ON recruits;
CREATE TRIGGER set_updated_at_recruits
  BEFORE UPDATE ON recruits
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_player_metrics ON player_metrics;
CREATE TRIGGER set_updated_at_player_metrics
  BEFORE UPDATE ON player_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_player_videos ON player_videos;
CREATE TRIGGER set_updated_at_player_videos
  BEFORE UPDATE ON player_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_player_achievements ON player_achievements;
CREATE TRIGGER set_updated_at_player_achievements
  BEFORE UPDATE ON player_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- USER SIGNUP TRIGGER FUNCTION
-- ============================================================================

-- Create function for new user signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role TEXT;
  coach_type_value TEXT;
BEGIN
  -- Get role from user metadata (Supabase uses raw_user_meta_data)
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Default to 'player' if no role specified
  IF user_role IS NULL THEN
    user_role := 'player';
  END IF;
  
  -- Create profile record (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO public.profiles (id, role, created_at, updated_at)
  VALUES (NEW.id, user_role, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Create player or coach record based on role
  IF user_role = 'player' THEN
    INSERT INTO public.players (user_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF user_role = 'coach' THEN
    -- Get coach_type from metadata
    coach_type_value := NEW.raw_user_meta_data->>'coach_type';
    INSERT INTO public.coaches (user_id, coach_type, created_at, updated_at)
    VALUES (NEW.id, coach_type_value, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Set function owner to postgres for proper permissions
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get player counts by state
CREATE OR REPLACE FUNCTION public.get_state_counts()
RETURNS TABLE (state text, count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT high_school_state as state, COUNT(*) as count
  FROM players
  WHERE high_school_state IS NOT NULL
  GROUP BY high_school_state
  ORDER BY count DESC;
$$;

-- Set function owner and grant permissions
ALTER FUNCTION public.get_state_counts() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.get_state_counts() TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'ScoutPulse database schema created successfully!';
  RAISE NOTICE 'All tables, RLS policies, triggers, and functions are ready.';
END $$;
