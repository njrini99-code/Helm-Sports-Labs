-- ScoutPulse Player Dashboard Wiring Migration
-- Adds organizations, events, player_stats, evaluations, player_settings, recruiting_interests
-- Safe to run multiple times (IF NOT EXISTS / DO $$ blocks throughout)

-- ============================================================================
-- ORGANIZATIONS TABLE (High Schools, Showcase Orgs, JUCO Programs as orgs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('high_school', 'showcase_org', 'juco', 'college', 'travel_ball')),
  location_city text,
  location_state text,
  logo_url text,
  banner_url text,
  website_url text,
  description text,
  conference text,
  division text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add high_school_org_id to players if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'high_school_org_id'
  ) THEN
    ALTER TABLE players ADD COLUMN high_school_org_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;
END$$;

-- ============================================================================
-- EVENTS TABLE (Games, Showcases, Tournaments)
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('game', 'showcase', 'tournament', 'camp', 'combine', 'tryout')),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  location_city text,
  location_state text,
  location_venue text,
  level text, -- 'Varsity', 'JV', '17U', '18U', etc.
  is_public boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- EVENT_TEAM_PARTICIPANTS TABLE (Links teams to events)
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_team_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  result text CHECK (result IN ('win', 'loss', 'tie', NULL)),
  score_for integer,
  score_against integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(event_id, team_id)
);

-- ============================================================================
-- PLAYER_STATS TABLE (Per-game stats for players)
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  -- Baseball specific
  at_bats integer,
  hits integer,
  singles integer,
  doubles integer,
  triples integer,
  home_runs integer,
  rbis integer,
  runs integer,
  stolen_bases integer,
  walks integer,
  strikeouts integer,
  batting_avg numeric(4,3),
  -- Pitching
  innings_pitched numeric(4,1),
  pitches_thrown integer,
  strikeouts_pitched integer,
  walks_allowed integer,
  hits_allowed integer,
  earned_runs integer,
  era numeric(5,2),
  -- Fielding
  putouts integer,
  assists integer,
  errors integer,
  fielding_pct numeric(4,3),
  -- Basketball (if needed)
  points integer,
  rebounds integer,
  assists_bb integer,
  fg_made integer,
  fg_attempts integer,
  three_made integer,
  three_attempts integer,
  ft_made integer,
  ft_attempts integer,
  -- Meta
  source text, -- 'manual', 'imported', 'verified'
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- EVALUATIONS TABLE (Coach/Scout evaluations of players at events)
-- ============================================================================

CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  evaluator_id uuid REFERENCES coaches(id) ON DELETE SET NULL,
  evaluator_name text,
  overall_grade integer CHECK (overall_grade >= 0 AND overall_grade <= 100),
  arm_grade integer,
  bat_grade integer,
  speed_grade integer,
  fielding_grade integer,
  baseball_iq_grade integer,
  tags text[] DEFAULT '{}',
  notes text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- PLAYER_SETTINGS TABLE (Player preferences and privacy)
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  is_discoverable boolean DEFAULT true,
  show_gpa boolean DEFAULT false,
  show_test_scores boolean DEFAULT false,
  show_contact_info boolean DEFAULT false,
  notify_on_eval boolean DEFAULT true,
  notify_on_interest boolean DEFAULT true,
  notify_on_message boolean DEFAULT true,
  notify_on_watchlist_add boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(player_id)
);

-- ============================================================================
-- RECRUITING_INTERESTS TABLE (College interest in players)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recruiting_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  program_id uuid REFERENCES coaches(id) ON DELETE CASCADE, -- Coach represents program
  school_name text NOT NULL,
  conference text,
  division text,
  status text NOT NULL DEFAULT 'interested' CHECK (status IN ('interested', 'contacted', 'questionnaire', 'unofficial_visit', 'official_visit', 'offer', 'verbal', 'signed')),
  interest_level text CHECK (interest_level IN ('low', 'medium', 'high')),
  notes text,
  last_contact_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_team_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiting_interests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Organizations (public read)
DROP POLICY IF EXISTS "Anyone can view organizations" ON organizations;
CREATE POLICY "Anyone can view organizations" ON organizations
  FOR SELECT TO authenticated USING (true);

-- Events (public read)
DROP POLICY IF EXISTS "Anyone can view public events" ON events;
CREATE POLICY "Anyone can view public events" ON events
  FOR SELECT TO authenticated USING (is_public = true OR org_id IN (
    SELECT t.id FROM teams t 
    JOIN team_memberships tm ON tm.team_id = t.id
    JOIN players p ON p.id = tm.player_id
    WHERE p.user_id = (SELECT auth.uid())
  ));

-- Event Team Participants
DROP POLICY IF EXISTS "Anyone can view event participants" ON event_team_participants;
CREATE POLICY "Anyone can view event participants" ON event_team_participants
  FOR SELECT TO authenticated USING (true);

-- Player Stats
DROP POLICY IF EXISTS "Players can view own stats" ON player_stats;
CREATE POLICY "Players can view own stats" ON player_stats
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM players p WHERE p.id = player_stats.player_id AND p.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Coaches can view stats of onboarded players" ON player_stats;
CREATE POLICY "Coaches can view stats of onboarded players" ON player_stats
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM players p WHERE p.id = player_stats.player_id AND p.onboarding_completed = true
  ));

DROP POLICY IF EXISTS "Players can manage own stats" ON player_stats;
CREATE POLICY "Players can manage own stats" ON player_stats
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players p WHERE p.id = player_stats.player_id AND p.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM players p WHERE p.id = player_stats.player_id AND p.user_id = (SELECT auth.uid())));

-- Evaluations
DROP POLICY IF EXISTS "Players can view own evaluations" ON evaluations;
CREATE POLICY "Players can view own evaluations" ON evaluations
  FOR SELECT TO authenticated
  USING (
    is_public = true OR 
    EXISTS (SELECT 1 FROM players p WHERE p.id = evaluations.player_id AND p.user_id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "Coaches can create evaluations" ON evaluations;
CREATE POLICY "Coaches can create evaluations" ON evaluations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM coaches c WHERE c.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Coaches can manage own evaluations" ON evaluations;
CREATE POLICY "Coaches can manage own evaluations" ON evaluations
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM coaches c WHERE c.id = evaluations.evaluator_id AND c.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM coaches c WHERE c.id = evaluations.evaluator_id AND c.user_id = (SELECT auth.uid())));

-- Player Settings
DROP POLICY IF EXISTS "Players can manage own settings" ON player_settings;
CREATE POLICY "Players can manage own settings" ON player_settings
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM players p WHERE p.id = player_settings.player_id AND p.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM players p WHERE p.id = player_settings.player_id AND p.user_id = (SELECT auth.uid())));

-- Recruiting Interests
DROP POLICY IF EXISTS "Players can view own recruiting interests" ON recruiting_interests;
CREATE POLICY "Players can view own recruiting interests" ON recruiting_interests
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM players p WHERE p.id = recruiting_interests.player_id AND p.user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Coaches can manage recruiting interests" ON recruiting_interests;
CREATE POLICY "Coaches can manage recruiting interests" ON recruiting_interests
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM coaches c WHERE c.id = recruiting_interests.program_id AND c.user_id = (SELECT auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM coaches c WHERE c.id = recruiting_interests.program_id AND c.user_id = (SELECT auth.uid())));

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_state ON organizations(location_state);

CREATE INDEX IF NOT EXISTS idx_events_org_id ON events(org_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);

CREATE INDEX IF NOT EXISTS idx_event_team_participants_event ON event_team_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_team_participants_team ON event_team_participants(team_id);

CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_event ON player_stats(event_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_created ON player_stats(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evaluations_player ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_event ON evaluations(event_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_created ON evaluations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_player_settings_player ON player_settings(player_id);

CREATE INDEX IF NOT EXISTS idx_recruiting_interests_player ON recruiting_interests(player_id);
CREATE INDEX IF NOT EXISTS idx_recruiting_interests_status ON recruiting_interests(status);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS set_updated_at_organizations ON organizations;
CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_events ON events;
CREATE TRIGGER set_updated_at_events
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_player_stats ON player_stats;
CREATE TRIGGER set_updated_at_player_stats
  BEFORE UPDATE ON player_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_evaluations ON evaluations;
CREATE TRIGGER set_updated_at_evaluations
  BEFORE UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_player_settings ON player_settings;
CREATE TRIGGER set_updated_at_player_settings
  BEFORE UPDATE ON player_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_recruiting_interests ON recruiting_interests;
CREATE TRIGGER set_updated_at_recruiting_interests
  BEFORE UPDATE ON recruiting_interests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Player dashboard wiring migration complete!';
  RAISE NOTICE 'Tables added: organizations, events, event_team_participants, player_stats, evaluations, player_settings, recruiting_interests';
END $$;

