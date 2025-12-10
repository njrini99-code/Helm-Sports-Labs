-- ============================================================================
-- COLLEGE INTEREST TRACKING & PRODUCTION DATA REPLACEMENT
-- Migration: 015_college_interest_tracking.sql
-- Adds tables to replace mock data across HS/JUCO/Showcase dashboards
-- ============================================================================

-- ============================================================================
-- COLLEGE INTEREST TRACKING (for HS/JUCO/Showcase coaches)
-- ============================================================================
CREATE TABLE IF NOT EXISTS college_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  college_id uuid REFERENCES colleges(id) ON DELETE CASCADE NOT NULL,
  coach_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  interest_level text CHECK (interest_level IN ('watching', 'high_priority', 'offered', 'committed')) NOT NULL DEFAULT 'watching',
  status text CHECK (status IN ('active', 'inactive', 'committed_elsewhere')) NOT NULL DEFAULT 'active',
  first_contact_date timestamptz DEFAULT now(),
  last_activity_date timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(player_id, college_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_college_interest_player ON college_interest(player_id);
CREATE INDEX IF NOT EXISTS idx_college_interest_college ON college_interest(college_id);
CREATE INDEX IF NOT EXISTS idx_college_interest_status ON college_interest(status);
CREATE INDEX IF NOT EXISTS idx_college_interest_coach ON college_interest(coach_id);
CREATE INDEX IF NOT EXISTS idx_college_interest_last_activity ON college_interest(last_activity_date DESC);

-- ============================================================================
-- PLAYER JOURNEY/TIMELINE EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS player_journey_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  event_type text CHECK (event_type IN ('profile_view', 'campus_visit', 'evaluation', 'offer', 'commitment', 'message', 'call', 'camp_invite')) NOT NULL,
  college_id uuid REFERENCES colleges(id) ON DELETE SET NULL,
  event_date timestamptz DEFAULT now() NOT NULL,
  title text NOT NULL,
  description text,
  location text,
  status text CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'completed',
  metadata jsonb, -- For flexible additional data
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journey_player ON player_journey_events(player_id);
CREATE INDEX IF NOT EXISTS idx_journey_date ON player_journey_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_journey_type ON player_journey_events(event_type);
CREATE INDEX IF NOT EXISTS idx_journey_college ON player_journey_events(college_id);

-- ============================================================================
-- SHOWCASE EVENTS (for Showcase coaches)
-- ============================================================================
CREATE TABLE IF NOT EXISTS showcase_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  showcase_team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  event_name text NOT NULL,
  event_type text CHECK (event_type IN ('showcase', 'tournament', 'camp', 'tryout')) NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  location text NOT NULL,
  city text,
  state text,
  venue text,
  capacity integer,
  registered_count integer DEFAULT 0,
  status text CHECK (status IN ('upcoming', 'registration_open', 'full', 'in_progress', 'completed', 'cancelled')) NOT NULL DEFAULT 'upcoming',
  description text,
  registration_deadline timestamptz,
  cost_per_player decimal(10,2),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_showcase_team ON showcase_events(showcase_team_id);
CREATE INDEX IF NOT EXISTS idx_showcase_date ON showcase_events(start_date);
CREATE INDEX IF NOT EXISTS idx_showcase_status ON showcase_events(status);

-- ============================================================================
-- SHOWCASE EVENT REGISTRATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS showcase_event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES showcase_events(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  registration_date timestamptz DEFAULT now() NOT NULL,
  status text CHECK (status IN ('registered', 'confirmed', 'attended', 'no_show', 'cancelled')) NOT NULL DEFAULT 'registered',
  payment_status text CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(event_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_registration_event ON showcase_event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registration_player ON showcase_event_registrations(player_id);
CREATE INDEX IF NOT EXISTS idx_registration_status ON showcase_event_registrations(status);

-- ============================================================================
-- PERFORMANCE TRACKING (for Showcase coaches)
-- ============================================================================
CREATE TABLE IF NOT EXISTS player_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES showcase_events(id) ON DELETE SET NULL,
  metric_date timestamptz DEFAULT now() NOT NULL,
  exit_velocity decimal(5,2),
  sixty_yard_dash decimal(5,2),
  pop_time decimal(5,2), -- For catchers
  fastball_velocity decimal(5,2), -- For pitchers
  radar_gun_max decimal(5,2),
  overall_rating decimal(3,1) CHECK (overall_rating >= 1 AND overall_rating <= 10),
  notes text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_performance_player ON player_performance_metrics(player_id);
CREATE INDEX IF NOT EXISTS idx_performance_event ON player_performance_metrics(event_id);
CREATE INDEX IF NOT EXISTS idx_performance_rating ON player_performance_metrics(overall_rating DESC);

-- ============================================================================
-- RECENT ACTIVITY FEED (generic table for all coach types)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  activity_type text CHECK (activity_type IN ('college_follow', 'player_view', 'offer_made', 'commitment', 'message', 'camp_registration', 'evaluation')) NOT NULL,
  title text NOT NULL,
  description text,
  related_player_id uuid REFERENCES players(id) ON DELETE SET NULL,
  related_college_id uuid REFERENCES colleges(id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_team ON activity_feed(team_id);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_feed(activity_type);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE college_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- College Interest Policies
CREATE POLICY "Coaches can view college interest for their players"
  ON college_interest FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN team_memberships ON teams.id = team_memberships.team_id
      JOIN coaches ON teams.coach_id = coaches.id
      WHERE team_memberships.player_id = college_interest.player_id
      AND coaches.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = college_interest.player_id
      AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can insert college interest"
  ON college_interest FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaches
      WHERE coaches.user_id = auth.uid()
      AND coaches.id = (SELECT coach_id FROM teams WHERE id IN (
        SELECT team_id FROM team_memberships WHERE player_id = college_interest.player_id
      ) LIMIT 1)
    )
  );

-- Player Journey Events Policies
CREATE POLICY "Players can view their own journey events"
  ON player_journey_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_journey_events.player_id
      AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Players can insert their own journey events"
  ON player_journey_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_journey_events.player_id
      AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can view journey events for their players"
  ON player_journey_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN team_memberships ON teams.id = team_memberships.team_id
      JOIN coaches ON teams.coach_id = coaches.id
      WHERE team_memberships.player_id = player_journey_events.player_id
      AND coaches.user_id = auth.uid()
    )
  );

-- Showcase Events Policies
CREATE POLICY "Showcase coaches can manage their events"
  ON showcase_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN coaches ON teams.coach_id = coaches.id
      WHERE teams.id = showcase_events.showcase_team_id
      AND coaches.user_id = auth.uid()
      AND coaches.coach_type = 'showcase'
    )
  );

-- Showcase Event Registrations Policies
CREATE POLICY "Players can view their own registrations"
  ON showcase_event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = showcase_event_registrations.player_id
      AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Showcase coaches can view all registrations for their events"
  ON showcase_event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM showcase_events
      JOIN teams ON showcase_events.showcase_team_id = teams.id
      JOIN coaches ON teams.coach_id = coaches.id
      WHERE showcase_events.id = showcase_event_registrations.event_id
      AND coaches.user_id = auth.uid()
    )
  );

-- Player Performance Metrics Policies
CREATE POLICY "Players can view their own performance metrics"
  ON player_performance_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = player_performance_metrics.player_id
      AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Showcase coaches can manage performance metrics for their events"
  ON player_performance_metrics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM showcase_events
      JOIN teams ON showcase_events.showcase_team_id = teams.id
      JOIN coaches ON teams.coach_id = coaches.id
      WHERE showcase_events.id = player_performance_metrics.event_id
      AND coaches.user_id = auth.uid()
    )
  );

-- Activity Feed Policies
CREATE POLICY "Users can view their own activity feed"
  ON activity_feed FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view team activity feed"
  ON activity_feed FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams
      JOIN coaches ON teams.coach_id = coaches.id
      WHERE teams.id = activity_feed.team_id
      AND coaches.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM team_memberships
      JOIN players ON team_memberships.player_id = players.id
      WHERE team_memberships.team_id = activity_feed.team_id
      AND players.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_college_interest_updated_at
  BEFORE UPDATE ON college_interest
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_showcase_events_updated_at
  BEFORE UPDATE ON showcase_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE college_interest IS 'Tracks which college coaches are interested in which players (for HS/JUCO/Showcase coaches to see)';
COMMENT ON TABLE player_journey_events IS 'Timeline of recruiting events for players (visits, offers, commitments, etc.)';
COMMENT ON TABLE showcase_events IS 'Showcase tournaments, camps, and tryouts organized by showcase coaches';
COMMENT ON TABLE showcase_event_registrations IS 'Player registrations for showcase events';
COMMENT ON TABLE player_performance_metrics IS 'Performance metrics recorded at showcase events (exit velo, 60-yard dash, etc.)';
COMMENT ON TABLE activity_feed IS 'Generic activity feed for all coach types to see recent recruiting activity';

