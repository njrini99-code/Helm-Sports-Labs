-- ============================================================================
-- PLAYER COMPARISON SAVED SESSIONS
-- Migration: 1765412912522_player-comparison.sql
-- Allows coaches to save comparison sessions for later reference
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_comparison_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_name text NOT NULL,
  player_ids uuid[] NOT NULL, -- Array of player IDs being compared
  comparison_notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comparison_coach ON player_comparison_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_comparison_created_at ON player_comparison_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comparison_player_ids ON player_comparison_sessions USING GIN(player_ids);

-- Enable RLS
ALTER TABLE player_comparison_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Coaches can view their own comparison sessions"
  ON player_comparison_sessions FOR SELECT
  USING (coach_id = auth.uid());

CREATE POLICY "Coaches can create comparison sessions"
  ON player_comparison_sessions FOR INSERT
  WITH CHECK (
    coach_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM coaches
      WHERE coaches.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can update their own sessions"
  ON player_comparison_sessions FOR UPDATE
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can delete their own sessions"
  ON player_comparison_sessions FOR DELETE
  USING (coach_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_comparison_sessions_updated_at
  BEFORE UPDATE ON player_comparison_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE player_comparison_sessions IS 'Saved player comparison sessions for coaches to reference later';
