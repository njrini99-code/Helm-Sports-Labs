-- ============================================================================
-- RLS POLICY OPTIMIZATION MIGRATION
-- Migration: 017_rls_optimization.sql
-- Purpose: Optimize RLS policies with better indexes and helper functions
-- Safe to run: YES (adds indexes and functions, doesn't change existing policies)
-- ============================================================================

-- ============================================================================
-- PHASE 2: RLS OPTIMIZATION INDEXES
-- ============================================================================

-- These indexes are specifically designed to speed up RLS policy checks

-- ============================================================================
-- 1. Player-Coach Relationship Indexes
-- ============================================================================

-- Optimize: "Players can view own conversations" and similar policies
-- Covers: players.id → players.user_id lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_players_user_id_covering 
ON players(user_id) 
INCLUDE (id, first_name, last_name, full_name)
WHERE user_id IS NOT NULL;

-- Optimize: "Coaches can view own conversations" and similar policies
-- Covers: coaches.id → coaches.user_id lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_coaches_user_id_covering 
ON coaches(user_id) 
INCLUDE (id, coach_type, program_name)
WHERE user_id IS NOT NULL;

-- ============================================================================
-- 2. Team Membership RLS Optimization
-- ============================================================================

-- Optimize: Team membership checks for RLS (used in many policies)
-- This composite index covers team → player → coach relationship
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_memberships_rls_check 
ON team_memberships(team_id, player_id, status)
INCLUDE (id, joined_at)
WHERE status = 'active';

-- Optimize: Team → Coach relationship for RLS
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_teams_coach_rls_check 
ON teams(coach_id, id)
INCLUDE (team_type, name, state)
WHERE coach_id IS NOT NULL;

-- ============================================================================
-- 3. Organization Membership RLS Optimization
-- ============================================================================

-- Optimize: Organization membership checks (used in events, org policies)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_memberships_rls_check 
ON organization_memberships(organization_id, user_id, role)
WHERE role IN ('owner', 'admin', 'coach', 'assistant');

-- ============================================================================
-- 4. Conversation RLS Optimization
-- ============================================================================

-- Optimize: Conversation participant checks (very common RLS check)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conv_participants_rls_check 
ON conversation_participants(user_id, conversation_id, left_at)
INCLUDE (unread_count, role)
WHERE left_at IS NULL;

-- ============================================================================
-- 5. Helper Functions for RLS Optimization
-- ============================================================================

-- Function: Check if user is coach of player's team
-- Used in multiple RLS policies
CREATE OR REPLACE FUNCTION is_coach_of_player(player_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM team_memberships tm
    JOIN teams t ON t.id = tm.team_id
    JOIN coaches c ON c.id = t.coach_id
    WHERE tm.player_id = player_uuid
      AND tm.status = 'active'
      AND c.user_id = user_uuid
  );
$$;

-- Function: Check if user has role in organization
CREATE OR REPLACE FUNCTION has_org_role(org_uuid uuid, user_uuid uuid, allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_memberships
    WHERE organization_id = org_uuid
      AND user_id = user_uuid
      AND role = ANY(allowed_roles)
      AND left_at IS NULL
  );
$$;

-- Function: Check if user is participant in conversation
CREATE OR REPLACE FUNCTION is_conversation_participant(conv_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = conv_uuid
      AND user_id = user_uuid
      AND left_at IS NULL
  );
$$;

-- Function: Get player's teams for a user (coach)
CREATE OR REPLACE FUNCTION get_player_team_ids_for_coach(player_uuid uuid, coach_user_uuid uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(t.id)
  FROM team_memberships tm
  JOIN teams t ON t.id = tm.team_id
  JOIN coaches c ON c.id = t.coach_id
  WHERE tm.player_id = player_uuid
    AND tm.status = 'active'
    AND c.user_id = coach_user_uuid;
$$;

-- ============================================================================
-- 6. Materialized Helper Views for Complex RLS (Optional, for very large datasets)
-- ============================================================================

-- Uncomment if you have performance issues with RLS on large tables
-- These would need refresh triggers

/*
-- Create materialized view for active team memberships with coach info
CREATE MATERIALIZED VIEW IF NOT EXISTS team_memberships_with_coach AS
SELECT 
  tm.id,
  tm.team_id,
  tm.player_id,
  tm.status,
  t.coach_id,
  c.user_id as coach_user_id,
  c.coach_type
FROM team_memberships tm
JOIN teams t ON t.id = tm.team_id
JOIN coaches c ON c.id = t.coach_id
WHERE tm.status = 'active';

CREATE UNIQUE INDEX ON team_memberships_with_coach(id);
CREATE INDEX ON team_memberships_with_coach(player_id, coach_user_id);
CREATE INDEX ON team_memberships_with_coach(team_id, coach_user_id);
*/

-- ============================================================================
-- ANALYZE TABLES FOR RLS OPTIMIZATION
-- ============================================================================

ANALYZE team_memberships;
ANALYZE teams;
ANALYZE coaches;
ANALYZE players;
ANALYZE organization_memberships;
ANALYZE conversation_participants;

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'RLS optimization migration complete!';
  RAISE NOTICE 'RLS helper functions created for common checks.';
  RAISE NOTICE 'Indexes optimized for RLS policy performance.';
END $$;
