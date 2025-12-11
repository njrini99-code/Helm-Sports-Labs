-- ============================================================================
-- RECRUITING ANALYTICS & METRICS
-- Migration: 1765412917835_recruiting-analytics.sql
-- Stores computed analytics and metrics for recruiting dashboards
-- Note: Most analytics are computed on-the-fly, but we store snapshots for performance
-- ============================================================================

-- Analytics snapshots (daily/weekly summaries)
CREATE TABLE IF NOT EXISTS recruiting_analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  program_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  snapshot_date date NOT NULL,
  snapshot_type text CHECK (snapshot_type IN ('daily', 'weekly', 'monthly')) NOT NULL,
  -- Pipeline metrics
  total_in_pipeline integer DEFAULT 0,
  watchlist_count integer DEFAULT 0,
  contacted_count integer DEFAULT 0,
  interested_count integer DEFAULT 0,
  offered_count integer DEFAULT 0,
  committed_count integer DEFAULT 0,
  -- Conversion metrics
  pipeline_conversion_rate decimal(5,2), -- % moving through stages
  avg_time_in_stage_days integer, -- Average days in each stage
  -- Engagement metrics
  profile_views integer DEFAULT 0,
  messages_sent integer DEFAULT 0,
  responses_received integer DEFAULT 0,
  response_rate decimal(5,2),
  -- Source metrics (stored as JSONB for flexibility)
  source_breakdown jsonb, -- e.g., {"discover": 10, "referral": 5, "camp": 3}
  -- Top performers
  top_players jsonb, -- Array of top player IDs and metrics
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(coach_id, program_id, snapshot_date, snapshot_type)
);

-- Saved analytics reports
CREATE TABLE IF NOT EXISTS recruiting_analytics_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  program_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  report_name text NOT NULL,
  report_type text CHECK (report_type IN ('pipeline', 'engagement', 'conversion', 'custom')) NOT NULL,
  date_range_start date,
  date_range_end date,
  filters jsonb, -- Applied filters for the report
  metrics jsonb NOT NULL, -- Computed metrics
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_coach ON recruiting_analytics_snapshots(coach_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_program ON recruiting_analytics_snapshots(program_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_date ON recruiting_analytics_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_report_coach ON recruiting_analytics_reports(coach_id);
CREATE INDEX IF NOT EXISTS idx_analytics_report_program ON recruiting_analytics_reports(program_id);
CREATE INDEX IF NOT EXISTS idx_analytics_report_created ON recruiting_analytics_reports(created_at DESC);

-- Enable RLS
ALTER TABLE recruiting_analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiting_analytics_reports ENABLE ROW LEVEL SECURITY;

-- Snapshot policies
CREATE POLICY "Coaches can view their analytics snapshots"
  ON recruiting_analytics_snapshots FOR SELECT
  USING (
    coach_id = auth.uid()
    OR program_id IN (
      SELECT id FROM teams WHERE coach_id IN (
        SELECT id FROM coaches WHERE user_id = auth.uid()
      )
    )
  );

-- Report policies
CREATE POLICY "Coaches can view their reports"
  ON recruiting_analytics_reports FOR SELECT
  USING (
    coach_id = auth.uid()
    OR program_id IN (
      SELECT id FROM teams WHERE coach_id IN (
        SELECT id FROM coaches WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Coaches can create reports"
  ON recruiting_analytics_reports FOR INSERT
  WITH CHECK (
    coach_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM coaches
      WHERE coaches.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can update their reports"
  ON recruiting_analytics_reports FOR UPDATE
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can delete their reports"
  ON recruiting_analytics_reports FOR DELETE
  USING (coach_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_analytics_reports_updated_at
  BEFORE UPDATE ON recruiting_analytics_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE recruiting_analytics_snapshots IS 'Daily/weekly snapshots of recruiting metrics for performance';
COMMENT ON TABLE recruiting_analytics_reports IS 'Saved analytics reports with custom date ranges and filters';
