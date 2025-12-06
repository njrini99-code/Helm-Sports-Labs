-- ============================================================================
-- COACH CALENDAR EVENTS
-- Migration to create the coach calendar system tables
-- ============================================================================

-- Create coach_calendar_events table
CREATE TABLE IF NOT EXISTS coach_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES coaches(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('camp', 'evaluation', 'visit', 'other')),
  title text NOT NULL,
  event_date date NOT NULL,  -- Using DATE type (no timezone) for consistency
  start_time time,
  end_time time,
  location text,
  notes text,
  camp_event_id uuid REFERENCES camp_events(id) ON DELETE SET NULL,
  opponent_event_name text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create coach_calendar_event_players junction table
CREATE TABLE IF NOT EXISTS coach_calendar_event_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_event_id uuid REFERENCES coach_calendar_events(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(calendar_event_id, player_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_coach_calendar_events_coach_id
  ON coach_calendar_events(coach_id);

CREATE INDEX IF NOT EXISTS idx_coach_calendar_events_event_date
  ON coach_calendar_events(event_date);

CREATE INDEX IF NOT EXISTS idx_coach_calendar_events_type
  ON coach_calendar_events(type);

CREATE INDEX IF NOT EXISTS idx_coach_calendar_event_players_event
  ON coach_calendar_event_players(calendar_event_id);

CREATE INDEX IF NOT EXISTS idx_coach_calendar_event_players_player
  ON coach_calendar_event_players(player_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_coach_calendar_event_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_coach_calendar_event_updated_at
  ON coach_calendar_events;

CREATE TRIGGER trigger_coach_calendar_event_updated_at
  BEFORE UPDATE ON coach_calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_coach_calendar_event_updated_at();

-- Add RLS policies
ALTER TABLE coach_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_calendar_event_players ENABLE ROW LEVEL SECURITY;

-- Policy: Coaches can view their own calendar events
CREATE POLICY coach_calendar_events_select_own
  ON coach_calendar_events
  FOR SELECT
  USING (coach_id = auth.uid() OR coach_id IN (
    SELECT id FROM coaches WHERE user_id = auth.uid()
  ));

-- Policy: Coaches can insert their own calendar events
CREATE POLICY coach_calendar_events_insert_own
  ON coach_calendar_events
  FOR INSERT
  WITH CHECK (coach_id IN (
    SELECT id FROM coaches WHERE user_id = auth.uid()
  ));

-- Policy: Coaches can update their own calendar events
CREATE POLICY coach_calendar_events_update_own
  ON coach_calendar_events
  FOR UPDATE
  USING (coach_id IN (
    SELECT id FROM coaches WHERE user_id = auth.uid()
  ));

-- Policy: Coaches can delete their own calendar events
CREATE POLICY coach_calendar_events_delete_own
  ON coach_calendar_events
  FOR DELETE
  USING (coach_id IN (
    SELECT id FROM coaches WHERE user_id = auth.uid()
  ));

-- Policy: Coaches can manage player links for their own events
CREATE POLICY coach_calendar_event_players_select
  ON coach_calendar_event_players
  FOR SELECT
  USING (calendar_event_id IN (
    SELECT id FROM coach_calendar_events
    WHERE coach_id IN (
      SELECT id FROM coaches WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY coach_calendar_event_players_insert
  ON coach_calendar_event_players
  FOR INSERT
  WITH CHECK (calendar_event_id IN (
    SELECT id FROM coach_calendar_events
    WHERE coach_id IN (
      SELECT id FROM coaches WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY coach_calendar_event_players_delete
  ON coach_calendar_event_players
  FOR DELETE
  USING (calendar_event_id IN (
    SELECT id FROM coach_calendar_events
    WHERE coach_id IN (
      SELECT id FROM coaches WHERE user_id = auth.uid()
    )
  ));
