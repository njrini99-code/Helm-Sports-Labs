-- Create team_schedule table for team events/games
CREATE TABLE IF NOT EXISTS team_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('game', 'practice', 'tournament', 'camp', 'other')),
  event_date timestamptz NOT NULL,
  event_time timestamptz,
  location text,
  opponent text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_media table for team photos/videos
CREATE TABLE IF NOT EXISTS team_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('photo', 'video', 'document')),
  media_url text NOT NULL,
  thumbnail_url text,
  title text,
  description text,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_team_schedule_team_id ON team_schedule(team_id);
CREATE INDEX IF NOT EXISTS idx_team_schedule_event_date ON team_schedule(event_date);
CREATE INDEX IF NOT EXISTS idx_team_media_team_id ON team_media(team_id);
CREATE INDEX IF NOT EXISTS idx_team_media_created_at ON team_media(created_at);

-- Enable RLS
ALTER TABLE team_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_schedule
CREATE POLICY "Users can view their team's schedule"
  ON team_schedule FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_schedule.team_id
      AND (t.coach_id = auth.uid() OR EXISTS (
        SELECT 1 FROM team_memberships tm
        WHERE tm.team_id = t.id AND tm.player_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Coaches can manage their team's schedule"
  ON team_schedule FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_schedule.team_id AND t.coach_id = auth.uid()
    )
  );

-- RLS Policies for team_media
CREATE POLICY "Users can view their team's media"
  ON team_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_media.team_id
      AND (t.coach_id = auth.uid() OR EXISTS (
        SELECT 1 FROM team_memberships tm
        WHERE tm.team_id = t.id AND tm.player_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Coaches can manage their team's media"
  ON team_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_media.team_id AND t.coach_id = auth.uid()
    )
  );