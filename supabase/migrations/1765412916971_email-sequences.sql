-- ============================================================================
-- EMAIL SEQUENCES SYSTEM
-- Migration: 1765412916971_email-sequences.sql
-- Automated email sequences for coaches to send follow-up emails
-- ============================================================================

-- Email sequence templates
CREATE TABLE IF NOT EXISTS email_sequence_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  program_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Email sequence steps (emails in the sequence)
CREATE TABLE IF NOT EXISTS email_sequence_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid REFERENCES email_sequence_templates(id) ON DELETE CASCADE NOT NULL,
  step_order integer NOT NULL, -- Order in sequence (1, 2, 3, etc.)
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text,
  delay_days integer DEFAULT 0, -- Days to wait before sending (from previous step)
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Active email sequences (instances)
CREATE TABLE IF NOT EXISTS email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES email_sequence_templates(id) ON DELETE CASCADE NOT NULL,
  recipient_type text CHECK (recipient_type IN ('player', 'parent')) NOT NULL,
  recipient_id uuid NOT NULL, -- player_id or parent_id
  recipient_email text NOT NULL,
  recipient_name text,
  status text CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'pending',
  current_step integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Email tracking (opens, clicks)
CREATE TABLE IF NOT EXISTS email_sequence_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid REFERENCES email_sequences(id) ON DELETE CASCADE NOT NULL,
  step_id uuid REFERENCES email_sequence_steps(id) ON DELETE SET NULL,
  email_sent_at timestamptz DEFAULT now() NOT NULL,
  opened_at timestamptz,
  clicked_at timestamptz,
  clicked_url text,
  bounced boolean DEFAULT false,
  unsubscribed boolean DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_template_coach ON email_sequence_templates(coach_id);
CREATE INDEX IF NOT EXISTS idx_email_template_program ON email_sequence_templates(program_id);
CREATE INDEX IF NOT EXISTS idx_email_steps_sequence ON email_sequence_steps(sequence_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_template ON email_sequences(template_id);
CREATE INDEX IF NOT EXISTS idx_email_sequences_status ON email_sequences(status);
CREATE INDEX IF NOT EXISTS idx_email_sequences_recipient ON email_sequences(recipient_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_sequence ON email_sequence_tracking(sequence_id);

-- Enable RLS
ALTER TABLE email_sequence_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequence_tracking ENABLE ROW LEVEL SECURITY;

-- Template policies
CREATE POLICY "Coaches can view their templates"
  ON email_sequence_templates FOR SELECT
  USING (
    coach_id = auth.uid()
    OR program_id IN (
      SELECT id FROM teams WHERE coach_id IN (
        SELECT id FROM coaches WHERE user_id = auth.uid()
      )
    )
    OR is_default = true
  );

CREATE POLICY "Coaches can manage their templates"
  ON email_sequence_templates FOR ALL
  USING (
    coach_id = auth.uid()
    OR program_id IN (
      SELECT id FROM teams WHERE coach_id IN (
        SELECT id FROM coaches WHERE user_id = auth.uid()
      )
    )
  );

-- Step policies (inherit from template)
CREATE POLICY "Coaches can view steps for their templates"
  ON email_sequence_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM email_sequence_templates
      WHERE email_sequence_templates.id = email_sequence_steps.sequence_id
      AND (
        email_sequence_templates.coach_id = auth.uid()
        OR email_sequence_templates.program_id IN (
          SELECT id FROM teams WHERE coach_id IN (
            SELECT id FROM coaches WHERE user_id = auth.uid()
          )
        )
        OR email_sequence_templates.is_default = true
      )
    )
  );

CREATE POLICY "Coaches can manage steps for their templates"
  ON email_sequence_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM email_sequence_templates
      WHERE email_sequence_templates.id = email_sequence_steps.sequence_id
      AND (
        email_sequence_templates.coach_id = auth.uid()
        OR email_sequence_templates.program_id IN (
          SELECT id FROM teams WHERE coach_id IN (
            SELECT id FROM coaches WHERE user_id = auth.uid()
          )
        )
      )
    )
  );

-- Sequence policies
CREATE POLICY "Coaches can view their sequences"
  ON email_sequences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM email_sequence_templates
      WHERE email_sequence_templates.id = email_sequences.template_id
      AND (
        email_sequence_templates.coach_id = auth.uid()
        OR email_sequence_templates.program_id IN (
          SELECT id FROM teams WHERE coach_id IN (
            SELECT id FROM coaches WHERE user_id = auth.uid()
          )
        )
      )
    )
  );

CREATE POLICY "Coaches can manage their sequences"
  ON email_sequences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM email_sequence_templates
      WHERE email_sequence_templates.id = email_sequences.template_id
      AND (
        email_sequence_templates.coach_id = auth.uid()
        OR email_sequence_templates.program_id IN (
          SELECT id FROM teams WHERE coach_id IN (
            SELECT id FROM coaches WHERE user_id = auth.uid()
          )
        )
      )
    )
  );

-- Tracking policies (same as sequences)
CREATE POLICY "Coaches can view tracking for their sequences"
  ON email_sequence_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM email_sequences
      JOIN email_sequence_templates ON email_sequences.template_id = email_sequence_templates.id
      WHERE email_sequences.id = email_sequence_tracking.sequence_id
      AND (
        email_sequence_templates.coach_id = auth.uid()
        OR email_sequence_templates.program_id IN (
          SELECT id FROM teams WHERE coach_id IN (
            SELECT id FROM coaches WHERE user_id = auth.uid()
          )
        )
      )
    )
  );

-- Triggers
CREATE TRIGGER update_email_template_updated_at
  BEFORE UPDATE ON email_sequence_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_sequences_updated_at
  BEFORE UPDATE ON email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE email_sequence_templates IS 'Email sequence templates for automated follow-ups';
COMMENT ON TABLE email_sequence_steps IS 'Individual emails in a sequence';
COMMENT ON TABLE email_sequences IS 'Active email sequences being sent to players/parents';
COMMENT ON TABLE email_sequence_tracking IS 'Tracks opens, clicks, and engagement for email sequences';
