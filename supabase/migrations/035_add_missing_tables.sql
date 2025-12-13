-- ============================================================================
-- ADD MISSING TABLES FOR RECRUITING PLATFORM
-- Migration: 035_add_missing_tables.sql
-- Purpose: Add tables expected for a complete recruiting platform
-- Priority: MEDIUM - Feature completeness
-- Safe to run: YES
-- ============================================================================
--
-- Background:
-- Based on recruiting platform standards, several expected tables are missing:
-- 1. scholarship_offers - Track scholarship offers (critical!)
-- 2. campus_visits - Campus/facility visit tracking
-- 3. contact_log - Coach-player contact history (NCAA compliance)
-- 4. player_documents - Transcripts, test scores, medical records
-- 5. financial_aid_packages - Scholarship/aid package details
-- 6. eligibility_tracking - Academic/athletic eligibility status
-- 7. commitment_intentions - Verbal commitments before official
--
-- These tables enable core recruiting workflows and compliance tracking.
-- ============================================================================

-- ============================================================================
-- 1. SCHOLARSHIP OFFERS TABLE
-- ============================================================================
--
-- Track scholarship offers from colleges to players
-- CRITICAL for recruiting process
--
CREATE TABLE IF NOT EXISTS scholarship_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  program_id UUID REFERENCES coaches(id),  -- The offering program

  -- Offer details
  offer_type TEXT NOT NULL CHECK (
    offer_type IN ('full_scholarship', 'partial_scholarship', 'walk_on', 'preferred_walk_on')
  ),

  -- Financial details
  scholarship_percentage DECIMAL(5,2) CHECK (
    scholarship_percentage >= 0 AND scholarship_percentage <= 100
  ),
  scholarship_amount DECIMAL(10,2),  -- Dollar amount
  scholarship_years INTEGER CHECK (scholarship_years > 0),

  -- Dates
  offer_date DATE NOT NULL,
  expiration_date DATE,
  decision_deadline DATE,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'declined', 'withdrawn', 'expired')
  ),

  decision_date DATE,

  -- Additional terms
  conditions TEXT,  -- Academic requirements, performance benchmarks
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scholarship_offers_player_id
  ON scholarship_offers(player_id);

CREATE INDEX IF NOT EXISTS idx_scholarship_offers_coach_id
  ON scholarship_offers(coach_id);

CREATE INDEX IF NOT EXISTS idx_scholarship_offers_status
  ON scholarship_offers(status);

CREATE INDEX IF NOT EXISTS idx_scholarship_offers_offer_date
  ON scholarship_offers(offer_date DESC);

-- RLS Policies
ALTER TABLE scholarship_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own offers" ON scholarship_offers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = scholarship_offers.player_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage offers they make" ON scholarship_offers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c
      WHERE c.id = scholarship_offers.coach_id
        AND c.user_id = auth.uid()
    )
  );

COMMENT ON TABLE scholarship_offers IS
  'Tracks scholarship offers from college programs to players. Critical for recruiting process.';

-- ============================================================================
-- 2. CAMPUS VISITS TABLE
-- ============================================================================
--
-- Track official and unofficial campus visits
-- Important for recruiting timeline and NCAA compliance
--
CREATE TABLE IF NOT EXISTS campus_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id),  -- Host coach
  program_id UUID REFERENCES coaches(id),  -- Visiting program

  -- Visit details
  visit_type TEXT NOT NULL CHECK (
    visit_type IN ('official', 'unofficial', 'junior_day', 'camp_visit', 'game_day')
  ),

  visit_date DATE NOT NULL,
  visit_end_date DATE,

  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'completed', 'cancelled', 'no_show')
  ),

  -- Visit details
  itinerary JSONB,  -- Structured visit schedule
  attendees TEXT[],  -- Family members, coaches, etc.

  -- Outcomes
  player_rating INTEGER CHECK (player_rating BETWEEN 1 AND 5),
  player_notes TEXT,
  coach_rating INTEGER CHECK (coach_rating BETWEEN 1 AND 5),
  coach_notes TEXT,

  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campus_visits_player_id
  ON campus_visits(player_id);

CREATE INDEX IF NOT EXISTS idx_campus_visits_coach_id
  ON campus_visits(coach_id);

CREATE INDEX IF NOT EXISTS idx_campus_visits_visit_date
  ON campus_visits(visit_date DESC);

CREATE INDEX IF NOT EXISTS idx_campus_visits_status
  ON campus_visits(status);

-- RLS Policies
ALTER TABLE campus_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can manage own visits" ON campus_visits
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = campus_visits.player_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can view and manage visits" ON campus_visits
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c
      WHERE c.id = campus_visits.coach_id
        AND c.user_id = auth.uid()
    )
  );

COMMENT ON TABLE campus_visits IS
  'Tracks campus visits (official, unofficial, junior days, etc.). Important for NCAA compliance.';

-- ============================================================================
-- 3. CONTACT LOG TABLE
-- ============================================================================
--
-- Track all coach-player contact for NCAA compliance
-- Required for Division I/II programs
--
CREATE TABLE IF NOT EXISTS contact_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,

  -- Contact details
  contact_type TEXT NOT NULL CHECK (
    contact_type IN (
      'phone_call', 'text_message', 'email', 'in_person',
      'social_media', 'video_call', 'mail', 'other'
    )
  ),

  contact_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,  -- For calls/meetings

  -- Contact direction
  initiated_by TEXT NOT NULL CHECK (
    initiated_by IN ('coach', 'player', 'parent', 'high_school_coach')
  ),

  -- Content
  subject TEXT,
  notes TEXT,

  -- NCAA compliance
  recruiting_period TEXT CHECK (
    recruiting_period IN ('contact', 'evaluation', 'quiet', 'dead')
  ),

  compliance_approved BOOLEAN DEFAULT true,
  compliance_notes TEXT,

  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_log_player_id
  ON contact_log(player_id);

CREATE INDEX IF NOT EXISTS idx_contact_log_coach_id
  ON contact_log(coach_id);

CREATE INDEX IF NOT EXISTS idx_contact_log_contact_date
  ON contact_log(contact_date DESC);

CREATE INDEX IF NOT EXISTS idx_contact_log_contact_type
  ON contact_log(contact_type);

-- Composite index for compliance reporting
CREATE INDEX IF NOT EXISTS idx_contact_log_coach_period
  ON contact_log(coach_id, recruiting_period, contact_date DESC);

-- RLS Policies
ALTER TABLE contact_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own contact log" ON contact_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = contact_log.player_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage own contact log" ON contact_log
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c
      WHERE c.id = contact_log.coach_id
        AND c.user_id = auth.uid()
    )
  );

COMMENT ON TABLE contact_log IS
  'NCAA compliance: Tracks all coach-player contact with dates, types, and recruiting period.';

-- ============================================================================
-- 4. PLAYER DOCUMENTS TABLE
-- ============================================================================
--
-- Store references to player documents (transcripts, test scores, medical)
-- Note: Actual files stored in Supabase Storage, this table stores metadata
--
CREATE TABLE IF NOT EXISTS player_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id),

  -- Document details
  document_type TEXT NOT NULL CHECK (
    document_type IN (
      'transcript', 'test_scores', 'medical_clearance', 'birth_certificate',
      'academic_eligibility', 'athletic_eligibility', 'recommendation',
      'resume', 'highlight_reel', 'other'
    )
  ),

  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,  -- Path in Supabase Storage
  file_size INTEGER,  -- Bytes
  mime_type TEXT,

  -- Academic year/term for transcripts
  academic_year TEXT,
  term TEXT CHECK (term IN ('fall', 'spring', 'summer', 'annual')),

  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES coaches(id),
  verified_at TIMESTAMPTZ,

  -- Expiration (for medical clearances, etc.)
  expiration_date DATE,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_player_documents_player_id
  ON player_documents(player_id);

CREATE INDEX IF NOT EXISTS idx_player_documents_document_type
  ON player_documents(document_type);

CREATE INDEX IF NOT EXISTS idx_player_documents_verified
  ON player_documents(verified);

-- RLS Policies
ALTER TABLE player_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can manage own documents" ON player_documents
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = player_documents.player_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can view player documents" ON player_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c
      WHERE c.user_id = auth.uid()
    )
  );

COMMENT ON TABLE player_documents IS
  'Metadata for player documents (transcripts, test scores, medical). Files stored in Supabase Storage.';

-- ============================================================================
-- 5. ELIGIBILITY TRACKING TABLE
-- ============================================================================
--
-- Track academic and athletic eligibility status
-- Critical for NCAA compliance
--
CREATE TABLE IF NOT EXISTS eligibility_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

  -- Academic eligibility
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL CHECK (term IN ('fall', 'spring', 'summer')),

  gpa DECIMAL(3,2) CHECK (gpa >= 0.0 AND gpa <= 4.0),
  credits_completed INTEGER,
  credits_required INTEGER,

  academic_eligible BOOLEAN,
  academic_notes TEXT,

  -- Test scores
  sat_score INTEGER CHECK (sat_score >= 400 AND sat_score <= 1600),
  act_score INTEGER CHECK (act_score >= 1 AND act_score <= 36),

  -- Athletic eligibility
  athletic_eligible BOOLEAN,
  clearinghouse_status TEXT CHECK (
    clearinghouse_status IN (
      'not_submitted', 'pending', 'certified', 'not_certified'
    )
  ),

  -- Medical
  medical_clearance BOOLEAN,
  medical_clearance_date DATE,
  medical_expiration_date DATE,

  -- Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one record per player per term
  UNIQUE (player_id, academic_year, term)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_eligibility_tracking_player_id
  ON eligibility_tracking(player_id);

CREATE INDEX IF NOT EXISTS idx_eligibility_tracking_academic_year
  ON eligibility_tracking(academic_year, term);

CREATE INDEX IF NOT EXISTS idx_eligibility_tracking_eligible
  ON eligibility_tracking(academic_eligible, athletic_eligible);

-- RLS Policies
ALTER TABLE eligibility_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own eligibility" ON eligibility_tracking
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p
      WHERE p.id = eligibility_tracking.player_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can view and manage eligibility" ON eligibility_tracking
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c
      WHERE c.user_id = auth.uid()
    )
  );

COMMENT ON TABLE eligibility_tracking IS
  'Tracks academic and athletic eligibility by term. Critical for NCAA compliance.';

-- ============================================================================
-- POST-MIGRATION VERIFICATION
-- ============================================================================
-- Run this to verify all tables were created:
--
-- SELECT table_name, table_type
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN (
--     'scholarship_offers', 'campus_visits', 'contact_log',
--     'player_documents', 'eligibility_tracking'
--   )
-- ORDER BY table_name;
--
-- Expected: 5 tables with type 'BASE TABLE'
--
-- ============================================================================
-- Check RLS is enabled:
--
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'scholarship_offers', 'campus_visits', 'contact_log',
--     'player_documents', 'eligibility_tracking'
--   );
--
-- Expected: rowsecurity = true for all tables
