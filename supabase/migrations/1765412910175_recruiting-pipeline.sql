-- ============================================================================
-- RECRUITING PIPELINE STAGES
-- Migration: 1765412910175_recruiting-pipeline.sql
-- Tracks players through recruiting stages (Watchlist → Contacted → Offered → Committed)
-- ============================================================================

-- Pipeline stages configuration (can be customized per coach/program)
CREATE TABLE IF NOT EXISTS recruiting_pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  program_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  stage_name text NOT NULL,
  stage_order integer NOT NULL, -- Order in pipeline (1, 2, 3, etc.)
  stage_color text, -- For UI display
  is_default boolean DEFAULT false, -- Default stages vs custom
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Default stages for all coaches
INSERT INTO recruiting_pipeline_stages (stage_name, stage_order, stage_color, is_default)
VALUES 
  ('Watchlist', 1, 'blue', true),
  ('Contacted', 2, 'yellow', true),
  ('Interested', 3, 'orange', true),
  ('Offered', 4, 'purple', true),
  ('Committed', 5, 'green', true),
  ('Declined', 6, 'red', true)
ON CONFLICT DO NOTHING;

-- Player pipeline tracking
CREATE TABLE IF NOT EXISTS player_pipeline_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  program_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  stage_id uuid REFERENCES recruiting_pipeline_stages(id) ON DELETE SET NULL,
  stage_name text NOT NULL, -- Denormalized for performance
  moved_to_stage_at timestamptz DEFAULT now() NOT NULL,
  notes text,
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(player_id, coach_id, program_id) -- One status per player per coach/program
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pipeline_player ON player_pipeline_status(player_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_coach ON player_pipeline_status(coach_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_program ON player_pipeline_status(program_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON player_pipeline_status(stage_name);
CREATE INDEX IF NOT EXISTS idx_pipeline_priority ON player_pipeline_status(priority);
CREATE INDEX IF NOT EXISTS idx_pipeline_moved_at ON player_pipeline_status(moved_to_stage_at DESC);

-- Enable RLS
ALTER TABLE recruiting_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_pipeline_status ENABLE ROW LEVEL SECURITY;

-- Stage policies
CREATE POLICY "Coaches can view default stages"
  ON recruiting_pipeline_stages FOR SELECT
  USING (is_default = true OR coach_id = auth.uid() OR program_id IN (
    SELECT id FROM teams WHERE coach_id IN (
      SELECT id FROM coaches WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Coaches can create custom stages"
  ON recruiting_pipeline_stages FOR INSERT
  WITH CHECK (
    coach_id = auth.uid()
    OR program_id IN (
      SELECT id FROM teams WHERE coach_id IN (
        SELECT id FROM coaches WHERE user_id = auth.uid()
      )
    )
  );

-- Pipeline status policies
CREATE POLICY "Coaches can view their pipeline"
  ON player_pipeline_status FOR SELECT
  USING (
    coach_id = auth.uid()
    OR program_id IN (
      SELECT id FROM teams WHERE coach_id IN (
        SELECT id FROM coaches WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Coaches can manage their pipeline"
  ON player_pipeline_status FOR ALL
  USING (
    coach_id = auth.uid()
    OR program_id IN (
      SELECT id FROM teams WHERE coach_id IN (
        SELECT id FROM coaches WHERE user_id = auth.uid()
      )
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_pipeline_status_updated_at
  BEFORE UPDATE ON player_pipeline_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE recruiting_pipeline_stages IS 'Pipeline stages for organizing recruits (Watchlist, Contacted, Offered, etc.)';
COMMENT ON TABLE player_pipeline_status IS 'Tracks which stage each player is in for each coach/program';
