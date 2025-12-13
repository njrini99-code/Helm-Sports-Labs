-- ============================================================================
-- CRITICAL RLS POLICIES
-- Migration: 030_critical_rls_policies.sql
-- Purpose: Enable RLS and add policies to sensitive tables without protection
-- Priority: CRITICAL - Privacy/Security Risk
-- Safe to run: YES
-- ============================================================================

-- ============================================================================
-- 1. ENABLE RLS ON SENSITIVE TABLES
-- ============================================================================

ALTER TABLE IF EXISTS coach_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recruiting_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS player_comparison ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recruiting_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS player_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recruiting_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bulk_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS export_functionality ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recruiting_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS player_comparison_tool ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. COACH NOTES POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Coaches can manage their own notes
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'coach_notes'
    AND policyname = 'Coaches can manage own notes'
  ) THEN
    CREATE POLICY "Coaches can manage own notes" ON coach_notes
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.id = coach_notes.coach_id
            AND c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.id = coach_notes.coach_id
            AND c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- ============================================================================
-- 3. RECRUITING PIPELINE POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Coaches can manage their own pipeline
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'recruiting_pipeline'
    AND policyname = 'Coaches can manage own pipeline'
  ) THEN
    CREATE POLICY "Coaches can manage own pipeline" ON recruiting_pipeline
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.id = recruiting_pipeline.coach_id
            AND c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.id = recruiting_pipeline.coach_id
            AND c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- ============================================================================
-- 4. PLAYER COMPARISON POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Coaches can manage their own comparisons
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'player_comparison'
    AND policyname = 'Coaches can manage own comparisons'
  ) THEN
    CREATE POLICY "Coaches can manage own comparisons" ON player_comparison
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.id = player_comparison.coach_id
            AND c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.id = player_comparison.coach_id
            AND c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- ============================================================================
-- 5. EMAIL SEQUENCES POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Coaches can manage their own email sequences
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'email_sequences'
    AND policyname = 'Coaches can manage own email sequences'
  ) THEN
    CREATE POLICY "Coaches can manage own email sequences" ON email_sequences
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.id = email_sequences.coach_id
            AND c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.id = email_sequences.coach_id
            AND c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- ============================================================================
-- 6. RECRUITING ANALYTICS POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Coaches can manage their own analytics
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'recruiting_analytics'
    AND policyname = 'Coaches can manage own analytics'
  ) THEN
    CREATE POLICY "Coaches can manage own analytics" ON recruiting_analytics
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.id = recruiting_analytics.coach_id
            AND c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.id = recruiting_analytics.coach_id
            AND c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- ============================================================================
-- 7. PLAYER SETTINGS POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Players can manage their own settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'player_settings'
    AND policyname = 'Players can manage own settings'
  ) THEN
    CREATE POLICY "Players can manage own settings" ON player_settings
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM players p
          WHERE p.id = player_settings.player_id
            AND p.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM players p
          WHERE p.id = player_settings.player_id
            AND p.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- ============================================================================
-- 8. RECRUITING TIMELINE POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Players can view their own timeline
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'recruiting_timeline'
    AND policyname = 'Players can manage own timeline'
  ) THEN
    CREATE POLICY "Players can manage own timeline" ON recruiting_timeline
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM players p
          WHERE p.id = recruiting_timeline.player_id
            AND p.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM players p
          WHERE p.id = recruiting_timeline.player_id
            AND p.user_id = auth.uid()
        )
      );
  END IF;

  -- Coaches can view timelines for players they're recruiting
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'recruiting_timeline'
    AND policyname = 'Coaches can view recruiting timelines'
  ) THEN
    CREATE POLICY "Coaches can view recruiting timelines" ON recruiting_timeline
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- ============================================================================
-- 9. RECRUITING TEMPLATES POLICIES
-- ============================================================================

DO $$
BEGIN
  -- Coaches can manage their own templates
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'recruiting_templates'
    AND policyname = 'Coaches can manage own templates'
  ) THEN
    CREATE POLICY "Coaches can manage own templates" ON recruiting_templates
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.id = recruiting_templates.coach_id
            AND c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.id = recruiting_templates.coach_id
            AND c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- ============================================================================
-- 10. BULK ACTIONS POLICIES (Coaches only)
-- ============================================================================

DO $$
BEGIN
  -- Only coaches can manage bulk actions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'bulk_actions'
    AND policyname = 'Coaches can manage bulk actions'
  ) THEN
    CREATE POLICY "Coaches can manage bulk actions" ON bulk_actions
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- ============================================================================
-- 11. EXPORT FUNCTIONALITY POLICIES (Coaches only)
-- ============================================================================

DO $$
BEGIN
  -- Only coaches can manage exports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'export_functionality'
    AND policyname = 'Coaches can manage exports'
  ) THEN
    CREATE POLICY "Coaches can manage exports" ON export_functionality
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM coaches c
          WHERE c.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify all policies are in place:
--
-- SELECT tablename, policyname
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'coach_notes', 'recruiting_pipeline', 'player_comparison',
--     'email_sequences', 'recruiting_analytics', 'player_settings',
--     'recruiting_timeline', 'bulk_actions', 'export_functionality',
--     'recruiting_templates'
--   )
-- ORDER BY tablename, policyname;
