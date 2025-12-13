-- ============================================================================
-- COACH NOTES SYSTEM
-- Migration: 1765412625150_coach-notes.sql
-- Allows coaches to save private notes on players during recruiting
-- ============================================================================

CREATE TABLE IF NOT EXISTS coach_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  note_content text NOT NULL,
  is_private boolean DEFAULT true, -- Private to coach or shared with staff
  tags text[], -- For categorizing notes (e.g., 'strengths', 'concerns', 'follow-up')
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_coach_notes_coach ON coach_notes(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_notes_player ON coach_notes(player_id);
CREATE INDEX IF NOT EXISTS idx_coach_notes_created_at ON coach_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coach_notes_tags ON coach_notes USING GIN(tags);

-- Enable RLS
ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;

-- Policies: Coaches can manage their own notes
CREATE POLICY "Coaches can view their own notes"
  ON coach_notes FOR SELECT
  USING (
    coach_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM coaches c1
      JOIN coaches c2 ON c1.program_id = c2.program_id
      WHERE c1.user_id = auth.uid()
      AND c2.user_id = coach_notes.coach_id
      AND coach_notes.is_private = false
    )
  );

CREATE POLICY "Coaches can create notes"
  ON coach_notes FOR INSERT
  WITH CHECK (
    coach_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM coaches
      WHERE coaches.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can update their own notes"
  ON coach_notes FOR UPDATE
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can delete their own notes"
  ON coach_notes FOR DELETE
  USING (coach_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_coach_notes_updated_at
  BEFORE UPDATE ON coach_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE coach_notes IS 'Private notes that coaches can save on players during recruiting';
