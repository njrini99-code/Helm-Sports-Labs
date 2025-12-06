-- Recruiting Intelligence & Planner support
-- Safe to run multiple times (IF NOT EXISTS throughout)

-- Required extension for trigram search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------
-- Players: add metrics columns used in discover/recommendations
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'pitch_velo'
  ) THEN
    ALTER TABLE players ADD COLUMN pitch_velo numeric;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'exit_velo'
  ) THEN
    ALTER TABLE players ADD COLUMN exit_velo numeric;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'sixty_time'
  ) THEN
    ALTER TABLE players ADD COLUMN sixty_time numeric;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE players ADD COLUMN full_name text;
    UPDATE players SET full_name = concat_ws(' ', first_name, last_name) WHERE full_name IS NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'has_video'
  ) THEN
    ALTER TABLE players ADD COLUMN has_video boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'verified_metrics'
  ) THEN
    ALTER TABLE players ADD COLUMN verified_metrics boolean DEFAULT false;
  END IF;
END$$;

-- ------------------------------------------------------------
-- player_engagement: captures trending signals
-- ------------------------------------------------------------
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
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE player_engagement ENABLE ROW LEVEL SECURITY;

-- Allow authenticated (coaches) to read engagement aggregates; writes are system-owned.
DROP POLICY IF EXISTS "Authenticated can read engagement" ON player_engagement;
CREATE POLICY "Authenticated can read engagement" ON player_engagement
  FOR SELECT TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- program_needs: criteria for AI-style matches per coach
-- ------------------------------------------------------------
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

ALTER TABLE program_needs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coach can manage own needs" ON program_needs;
CREATE POLICY "Coach can manage own needs" ON program_needs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM coaches c WHERE c.id = program_needs.coach_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM coaches c WHERE c.id = program_needs.coach_id AND c.user_id = auth.uid()));

-- ------------------------------------------------------------
-- recruit_watchlist: pipeline statuses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recruit_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'watchlist',
  position_role text,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE recruit_watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coach can manage own watchlist" ON recruit_watchlist;
CREATE POLICY "Coach can manage own watchlist" ON recruit_watchlist
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM coaches c WHERE c.id = recruit_watchlist.coach_id AND c.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM coaches c WHERE c.id = recruit_watchlist.coach_id AND c.user_id = auth.uid()));

-- ------------------------------------------------------------
-- Updated_at triggers for new tables
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS set_updated_at_player_engagement ON player_engagement;
CREATE TRIGGER set_updated_at_player_engagement
  BEFORE UPDATE ON player_engagement
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_program_needs ON program_needs;
CREATE TRIGGER set_updated_at_program_needs
  BEFORE UPDATE ON program_needs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_recruit_watchlist ON recruit_watchlist;
CREATE TRIGGER set_updated_at_recruit_watchlist
  BEFORE UPDATE ON recruit_watchlist
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- Indexes for Discover/Trending/Planner performance
-- ------------------------------------------------------------
-- Players filters/search
CREATE INDEX IF NOT EXISTS idx_players_state ON players(high_school_state);
CREATE INDEX IF NOT EXISTS idx_players_grad_year ON players(grad_year);
CREATE INDEX IF NOT EXISTS idx_players_primary_position ON players(primary_position);
CREATE INDEX IF NOT EXISTS idx_players_full_name_trgm ON players USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_players_pitch_velo ON players(pitch_velo);
CREATE INDEX IF NOT EXISTS idx_players_exit_velo ON players(exit_velo);
CREATE INDEX IF NOT EXISTS idx_players_sixty_time ON players(sixty_time);

-- Engagement sorting
CREATE INDEX IF NOT EXISTS idx_player_engagement_recent_views ON player_engagement(recent_views_7d DESC);
CREATE INDEX IF NOT EXISTS idx_player_engagement_last_activity ON player_engagement(last_activity_at);

-- Watchlist lookups
CREATE INDEX IF NOT EXISTS idx_recruit_watchlist_coach_status ON recruit_watchlist(coach_id, status);
CREATE INDEX IF NOT EXISTS idx_recruit_watchlist_player ON recruit_watchlist(player_id);

-- Program needs lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_program_needs_coach ON program_needs(coach_id);
