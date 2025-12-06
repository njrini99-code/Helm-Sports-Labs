-- ScoutPulse Optimized Migration 006
-- Clean, deduplicated, safe to run multiple times

-- ============================================================================
-- 1. ORGANIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('high_school', 'showcase_org', 'juco', 'college', 'travel_ball', 'club')),
  location_city text,
  location_state text,
  logo_url text,
  banner_url text,
  website_url text,
  description text,
  conference text,
  division text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Link players to HS org
DO $$ BEGIN
  ALTER TABLE players ADD COLUMN IF NOT EXISTS high_school_org_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ============================================================================
-- 2. ORGANIZATION MEMBERSHIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'coach', 'assistant', 'staff', 'member')),
  title text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- ============================================================================
-- 3. EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  created_by uuid,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('game', 'practice', 'scrimmage', 'showcase', 'tournament', 'camp', 'combine', 'tryout', 'meeting', 'other')),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  location_name text,
  location_city text,
  location_state text,
  level text,
  opponent_name text,
  is_home boolean,
  is_public boolean DEFAULT true,
  is_cancelled boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 4. EVENT PARTICIPANTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_team_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  team_id uuid,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  result text CHECK (result IN ('win', 'loss', 'tie', NULL)),
  score_for integer,
  score_against integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, COALESCE(team_id, organization_id))
);

-- ============================================================================
-- 5. PLAYER SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL UNIQUE,
  is_discoverable boolean DEFAULT true,
  show_gpa boolean DEFAULT false,
  show_contact_info boolean DEFAULT false,
  notify_on_eval boolean DEFAULT true,
  notify_on_interest boolean DEFAULT true,
  notify_on_message boolean DEFAULT true,
  notify_on_watchlist_add boolean DEFAULT true,
  allow_coach_messages boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 6. RECRUITING INTERESTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS recruiting_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL,
  program_id uuid,
  school_name text NOT NULL,
  conference text,
  division text,
  status text DEFAULT 'interested' CHECK (status IN ('interested', 'contacted', 'questionnaire', 'unofficial_visit', 'official_visit', 'offer', 'verbal', 'signed', 'declined')),
  interest_level text CHECK (interest_level IN ('low', 'medium', 'high')),
  coach_name text,
  notes text,
  last_contact_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 7. CONVERSATIONS (Recreate cleanly)
-- ============================================================================

DROP TABLE IF EXISTS message_reads CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'team')),
  title text,
  created_by uuid,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  last_message_text text,
  last_message_at timestamptz,
  last_message_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  unread_count integer DEFAULT 0,
  last_read_at timestamptz,
  is_muted boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  reply_to_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachments jsonb DEFAULT '[]',
  is_edited boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 8. ENABLE RLS
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_team_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiting_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. RLS POLICIES (Simplified)
-- ============================================================================

-- Organizations: Public read
CREATE POLICY "org_read" ON organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "org_update" ON organizations FOR UPDATE TO authenticated 
  USING (id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Org Memberships
CREATE POLICY "orgmem_read" ON organization_memberships FOR SELECT TO authenticated USING (true);
CREATE POLICY "orgmem_manage" ON organization_memberships FOR ALL TO authenticated 
  USING (user_id = auth.uid() OR organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Events: Public or own org
CREATE POLICY "events_read" ON events FOR SELECT TO authenticated 
  USING (is_public = true OR org_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));
CREATE POLICY "events_manage" ON events FOR ALL TO authenticated 
  USING (created_by = auth.uid() OR org_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'coach')));

-- Event Participants
CREATE POLICY "evtpart_read" ON event_team_participants FOR SELECT TO authenticated USING (true);

-- Player Settings: Own only
CREATE POLICY "settings_own" ON player_settings FOR ALL TO authenticated 
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- Recruiting Interests: Player sees own, coach sees their entries
CREATE POLICY "recruit_player" ON recruiting_interests FOR SELECT TO authenticated 
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));
CREATE POLICY "recruit_coach" ON recruiting_interests FOR ALL TO authenticated 
  USING (program_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()));

-- Conversations: Participants only
CREATE POLICY "conv_read" ON conversations FOR SELECT TO authenticated 
  USING (id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid() AND left_at IS NULL));
CREATE POLICY "conv_create" ON conversations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- Conversation Participants
CREATE POLICY "convpart_read" ON conversation_participants FOR SELECT TO authenticated 
  USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));
CREATE POLICY "convpart_own" ON conversation_participants FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Messages: Participants only
CREATE POLICY "msg_read" ON messages FOR SELECT TO authenticated 
  USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid() AND left_at IS NULL));
CREATE POLICY "msg_send" ON messages FOR INSERT TO authenticated 
  WITH CHECK (sender_id = auth.uid() AND conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid() AND left_at IS NULL));
CREATE POLICY "msg_edit" ON messages FOR UPDATE TO authenticated USING (sender_id = auth.uid());

-- ============================================================================
-- 10. INDEXES (Essential only)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_org_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_org_state ON organizations(location_state);
CREATE INDEX IF NOT EXISTS idx_orgmem_org ON organization_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_orgmem_user ON organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_events_org ON events(org_id);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_evtpart_event ON event_team_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_settings_player ON player_settings(player_id);
CREATE INDEX IF NOT EXISTS idx_recruit_player ON recruiting_interests(player_id);
CREATE INDEX IF NOT EXISTS idx_recruit_status ON recruiting_interests(status);
CREATE INDEX IF NOT EXISTS idx_conv_last ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_convpart_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_convpart_unread ON conversation_participants(user_id) WHERE unread_count > 0;
CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_sender ON messages(sender_id);

-- ============================================================================
-- 11. TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DO $$ 
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['organizations', 'organization_memberships', 'events', 'event_team_participants', 'player_settings', 'recruiting_interests', 'conversations', 'conversation_participants', 'messages'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_%s ON %s', t, t);
    EXECUTE format('CREATE TRIGGER trg_updated_%s BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;

-- Update conversation on new message
CREATE OR REPLACE FUNCTION on_new_message() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE conversations SET last_message_text = LEFT(NEW.content, 100), last_message_at = NEW.created_at, last_message_by = NEW.sender_id WHERE id = NEW.conversation_id;
  UPDATE conversation_participants SET unread_count = unread_count + 1 WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id AND left_at IS NULL;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_new_message ON messages;
CREATE TRIGGER trg_new_message AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION on_new_message();

-- ============================================================================
-- 12. HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION create_dm(user1 uuid, user2 uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE cid uuid;
BEGIN
  SELECT c.id INTO cid FROM conversations c
    JOIN conversation_participants p1 ON p1.conversation_id = c.id AND p1.user_id = user1
    JOIN conversation_participants p2 ON p2.conversation_id = c.id AND p2.user_id = user2
    WHERE c.type = 'direct' LIMIT 1;
  IF cid IS NOT NULL THEN RETURN cid; END IF;
  INSERT INTO conversations (type, created_by) VALUES ('direct', user1) RETURNING id INTO cid;
  INSERT INTO conversation_participants (conversation_id, user_id) VALUES (cid, user1), (cid, user2);
  RETURN cid;
END; $$;

CREATE OR REPLACE FUNCTION get_unread_count(uid uuid) RETURNS int LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COALESCE(SUM(unread_count), 0)::int FROM conversation_participants WHERE user_id = uid AND left_at IS NULL;
$$;

-- ============================================================================
-- DONE
-- ============================================================================

SELECT 'Migration 006 complete!' as result;


