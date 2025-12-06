-- ScoutPulse Complete Wiring Migration
-- Adds: organization_memberships, conversations, conversation_participants, messages
-- Updates: organizations, events, event_team_participants, player_settings, recruiting_interests
-- Safe to run multiple times (IF NOT EXISTS / DO $$ blocks)

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('high_school', 'showcase_org', 'juco', 'college', 'travel_ball', 'club')),
  location_city text,
  location_state text,
  location_address text,
  logo_url text,
  banner_url text,
  website_url text,
  phone text,
  email text,
  description text,
  conference text,
  division text,
  mascot text,
  primary_color text,
  secondary_color text,
  founded_year integer,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add high_school_org_id to players
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'high_school_org_id') THEN
    ALTER TABLE players ADD COLUMN high_school_org_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- ORGANIZATION_MEMBERSHIPS TABLE (Coaches/Staff belonging to organizations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'coach', 'assistant', 'staff', 'member')),
  title text, -- 'Head Coach', 'Athletic Director', etc.
  is_primary boolean DEFAULT false, -- Primary org for this user
  permissions jsonb DEFAULT '{}', -- Custom permissions
  joined_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(organization_id, user_id)
);

-- ============================================================================
-- EVENTS TABLE (Games, Practices, Showcases, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('game', 'practice', 'scrimmage', 'showcase', 'tournament', 'camp', 'combine', 'tryout', 'meeting', 'other')),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  all_day boolean DEFAULT false,
  location_name text,
  location_address text,
  location_city text,
  location_state text,
  location_venue text,
  level text, -- 'Varsity', 'JV', '17U', '18U', etc.
  opponent_name text, -- For games
  opponent_org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  is_home boolean, -- Home or away game
  is_public boolean DEFAULT true,
  is_cancelled boolean DEFAULT false,
  notes text,
  recurrence_rule text, -- iCal RRULE for recurring events
  parent_event_id uuid REFERENCES events(id) ON DELETE CASCADE, -- For recurring event instances
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- EVENT_TEAM_PARTICIPANTS TABLE (Links teams/orgs to events with results)
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_team_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  is_home boolean DEFAULT true,
  result text CHECK (result IN ('win', 'loss', 'tie', 'cancelled', NULL)),
  score_for integer,
  score_against integer,
  innings_played integer, -- For baseball
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(event_id, team_id),
  CHECK (team_id IS NOT NULL OR organization_id IS NOT NULL)
);

-- ============================================================================
-- EVENT_PLAYER_ATTENDANCE TABLE (Track player attendance at events)
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_player_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'maybe', 'attended', 'absent', 'excused')),
  responded_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(event_id, player_id)
);

-- ============================================================================
-- PLAYER_SETTINGS TABLE (Player preferences and privacy)
-- ============================================================================

CREATE TABLE IF NOT EXISTS player_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  -- Privacy settings
  is_discoverable boolean DEFAULT true,
  profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'coaches_only', 'private')),
  show_gpa boolean DEFAULT false,
  show_test_scores boolean DEFAULT false,
  show_contact_info boolean DEFAULT false,
  show_academic_info boolean DEFAULT false,
  -- Notification settings
  notify_on_eval boolean DEFAULT true,
  notify_on_interest boolean DEFAULT true,
  notify_on_message boolean DEFAULT true,
  notify_on_watchlist_add boolean DEFAULT true,
  notify_on_event boolean DEFAULT true,
  notify_on_team_update boolean DEFAULT true,
  email_digest text DEFAULT 'daily' CHECK (email_digest IN ('realtime', 'daily', 'weekly', 'never')),
  -- Communication preferences
  allow_coach_messages boolean DEFAULT true,
  allow_program_invites boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(player_id)
);

-- ============================================================================
-- RECRUITING_INTERESTS TABLE (College interest in players)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recruiting_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  program_id uuid REFERENCES coaches(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  school_name text NOT NULL,
  conference text,
  division text,
  status text NOT NULL DEFAULT 'interested' CHECK (status IN (
    'interested', 'contacted', 'questionnaire', 'camp_invite', 
    'unofficial_visit', 'official_visit', 'offer', 'verbal', 'signed', 'declined'
  )),
  interest_level text CHECK (interest_level IN ('low', 'medium', 'high')),
  scholarship_type text CHECK (scholarship_type IN ('full', 'partial', 'walk_on', 'preferred_walk_on', NULL)),
  initiated_by text CHECK (initiated_by IN ('player', 'coach', 'mutual')),
  coach_name text,
  coach_email text,
  coach_phone text,
  notes text,
  last_contact_at timestamptz,
  next_step text,
  next_step_date timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- CONVERSATIONS TABLE (Message threads)
-- ============================================================================

DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'team', 'announcement')),
  title text, -- For group chats
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE, -- For team/org chats
  is_archived boolean DEFAULT false,
  last_message_text text,
  last_message_at timestamptz,
  last_message_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- CONVERSATION_PARTICIPANTS TABLE (Who is in each conversation)
-- ============================================================================

CREATE TABLE conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  nickname text, -- Custom display name in this conversation
  unread_count integer DEFAULT 0,
  last_read_at timestamptz,
  is_muted boolean DEFAULT false,
  muted_until timestamptz,
  is_pinned boolean DEFAULT false,
  joined_at timestamptz DEFAULT now() NOT NULL,
  left_at timestamptz, -- NULL if still in conversation
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(conversation_id, user_id)
);

-- ============================================================================
-- MESSAGES TABLE (Individual messages)
-- ============================================================================

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  reply_to_id uuid REFERENCES messages(id) ON DELETE SET NULL, -- For threaded replies
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file', 'system', 'event_share', 'player_share')),
  content text NOT NULL,
  -- Rich content
  attachments jsonb DEFAULT '[]', -- [{type, url, name, size}]
  metadata jsonb DEFAULT '{}', -- For special message types
  -- Status
  is_edited boolean DEFAULT false,
  edited_at timestamptz,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  -- Reactions
  reactions jsonb DEFAULT '{}', -- {emoji: [user_ids]}
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- MESSAGE_READS TABLE (Track who has read which messages)
-- ============================================================================

CREATE TABLE IF NOT EXISTS message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  read_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(message_id, user_id)
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_team_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_player_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiting_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - Organizations
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view organizations" ON organizations;
CREATE POLICY "Anyone can view organizations" ON organizations
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Org admins can update" ON organizations;
CREATE POLICY "Org admins can update" ON organizations
  FOR UPDATE TO authenticated
  USING (id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- ============================================================================
-- RLS POLICIES - Organization Memberships
-- ============================================================================

DROP POLICY IF EXISTS "View org memberships" ON organization_memberships;
CREATE POLICY "View org memberships" ON organization_memberships
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Manage own membership" ON organization_memberships;
CREATE POLICY "Manage own membership" ON organization_memberships
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Org admins manage memberships" ON organization_memberships;
CREATE POLICY "Org admins manage memberships" ON organization_memberships
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- ============================================================================
-- RLS POLICIES - Events
-- ============================================================================

DROP POLICY IF EXISTS "View public events" ON events;
CREATE POLICY "View public events" ON events
  FOR SELECT TO authenticated USING (is_public = true);

DROP POLICY IF EXISTS "View org events" ON events;
CREATE POLICY "View org events" ON events
  FOR SELECT TO authenticated
  USING (org_id IN (
    SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Create events for own org" ON events;
CREATE POLICY "Create events for own org" ON events
  FOR INSERT TO authenticated
  WITH CHECK (org_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'coach')
  ));

DROP POLICY IF EXISTS "Update own org events" ON events;
CREATE POLICY "Update own org events" ON events
  FOR UPDATE TO authenticated
  USING (org_id IN (
    SELECT organization_id FROM organization_memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'coach')
  ));

-- ============================================================================
-- RLS POLICIES - Event Participants
-- ============================================================================

DROP POLICY IF EXISTS "View event participants" ON event_team_participants;
CREATE POLICY "View event participants" ON event_team_participants
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Manage event participants" ON event_team_participants;
CREATE POLICY "Manage event participants" ON event_team_participants
  FOR ALL TO authenticated
  USING (event_id IN (SELECT id FROM events WHERE created_by = auth.uid()));

-- ============================================================================
-- RLS POLICIES - Event Attendance
-- ============================================================================

DROP POLICY IF EXISTS "View own attendance" ON event_player_attendance;
CREATE POLICY "View own attendance" ON event_player_attendance
  FOR SELECT TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Manage own attendance" ON event_player_attendance;
CREATE POLICY "Manage own attendance" ON event_player_attendance
  FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()))
  WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- ============================================================================
-- RLS POLICIES - Player Settings
-- ============================================================================

DROP POLICY IF EXISTS "Manage own settings" ON player_settings;
CREATE POLICY "Manage own settings" ON player_settings
  FOR ALL TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()))
  WITH CHECK (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

-- ============================================================================
-- RLS POLICIES - Recruiting Interests
-- ============================================================================

DROP POLICY IF EXISTS "Players view own interests" ON recruiting_interests;
CREATE POLICY "Players view own interests" ON recruiting_interests
  FOR SELECT TO authenticated
  USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Coaches manage interests" ON recruiting_interests;
CREATE POLICY "Coaches manage interests" ON recruiting_interests
  FOR ALL TO authenticated
  USING (program_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()))
  WITH CHECK (program_id IN (SELECT id FROM coaches WHERE user_id = auth.uid()));

-- ============================================================================
-- RLS POLICIES - Conversations
-- ============================================================================

DROP POLICY IF EXISTS "View own conversations" ON conversations;
CREATE POLICY "View own conversations" ON conversations
  FOR SELECT TO authenticated
  USING (id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid() AND left_at IS NULL
  ));

DROP POLICY IF EXISTS "Create conversations" ON conversations;
CREATE POLICY "Create conversations" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Update own conversations" ON conversations;
CREATE POLICY "Update own conversations" ON conversations
  FOR UPDATE TO authenticated
  USING (id IN (
    SELECT conversation_id FROM conversation_participants 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND left_at IS NULL
  ));

-- ============================================================================
-- RLS POLICIES - Conversation Participants
-- ============================================================================

DROP POLICY IF EXISTS "View conversation participants" ON conversation_participants;
CREATE POLICY "View conversation participants" ON conversation_participants
  FOR SELECT TO authenticated
  USING (conversation_id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid() AND left_at IS NULL
  ));

DROP POLICY IF EXISTS "Manage own participation" ON conversation_participants;
CREATE POLICY "Manage own participation" ON conversation_participants
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - Messages
-- ============================================================================

DROP POLICY IF EXISTS "View messages in own conversations" ON messages;
CREATE POLICY "View messages in own conversations" ON messages
  FOR SELECT TO authenticated
  USING (conversation_id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid() AND left_at IS NULL
  ));

DROP POLICY IF EXISTS "Send messages" ON messages;
CREATE POLICY "Send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid() AND left_at IS NULL
    )
  );

DROP POLICY IF EXISTS "Edit own messages" ON messages;
CREATE POLICY "Edit own messages" ON messages
  FOR UPDATE TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- ============================================================================
-- RLS POLICIES - Message Reads
-- ============================================================================

DROP POLICY IF EXISTS "Manage own reads" ON message_reads;
CREATE POLICY "Manage own reads" ON message_reads
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Organizations
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_state ON organizations(location_state);
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);

-- Organization Memberships
CREATE INDEX IF NOT EXISTS idx_org_memberships_org ON organization_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_user ON organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_role ON organization_memberships(role);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_org ON events(org_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- Event Participants
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_team_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_team ON event_team_participants(team_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_org ON event_team_participants(organization_id);

-- Event Attendance
CREATE INDEX IF NOT EXISTS idx_event_attendance_event ON event_player_attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_player ON event_player_attendance(player_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_status ON event_player_attendance(status);

-- Player Settings
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_settings_player ON player_settings(player_id);

-- Recruiting Interests
CREATE INDEX IF NOT EXISTS idx_recruiting_player ON recruiting_interests(player_id);
CREATE INDEX IF NOT EXISTS idx_recruiting_program ON recruiting_interests(program_id);
CREATE INDEX IF NOT EXISTS idx_recruiting_status ON recruiting_interests(status);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_conversations_org ON conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);

-- Conversation Participants
CREATE INDEX IF NOT EXISTS idx_conv_participants_conv ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_unread ON conversation_participants(user_id, unread_count) WHERE unread_count > 0;

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_reply ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;

-- Message Reads
CREATE INDEX IF NOT EXISTS idx_message_reads_message ON message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON message_reads(user_id);

-- ============================================================================
-- TRIGGERS - Updated At
-- ============================================================================

-- Ensure set_updated_at function exists
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply triggers
DROP TRIGGER IF EXISTS set_updated_at_organizations ON organizations;
CREATE TRIGGER set_updated_at_organizations BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_org_memberships ON organization_memberships;
CREATE TRIGGER set_updated_at_org_memberships BEFORE UPDATE ON organization_memberships FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_events ON events;
CREATE TRIGGER set_updated_at_events BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_event_participants ON event_team_participants;
CREATE TRIGGER set_updated_at_event_participants BEFORE UPDATE ON event_team_participants FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_event_attendance ON event_player_attendance;
CREATE TRIGGER set_updated_at_event_attendance BEFORE UPDATE ON event_player_attendance FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_player_settings ON player_settings;
CREATE TRIGGER set_updated_at_player_settings BEFORE UPDATE ON player_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_recruiting ON recruiting_interests;
CREATE TRIGGER set_updated_at_recruiting BEFORE UPDATE ON recruiting_interests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_conversations ON conversations;
CREATE TRIGGER set_updated_at_conversations BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_conv_participants ON conversation_participants;
CREATE TRIGGER set_updated_at_conv_participants BEFORE UPDATE ON conversation_participants FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_messages ON messages;
CREATE TRIGGER set_updated_at_messages BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- TRIGGERS - Message/Conversation Updates
-- ============================================================================

-- Update conversation when new message is sent
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Update conversation metadata
  UPDATE conversations SET
    last_message_text = LEFT(NEW.content, 100),
    last_message_at = NEW.created_at,
    last_message_by = NEW.sender_id,
    message_count = message_count + 1,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  -- Increment unread count for other participants
  UPDATE conversation_participants SET
    unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id 
    AND left_at IS NULL;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_message_update_conversation ON messages;
CREATE TRIGGER trigger_message_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Reset unread count when user reads messages
CREATE OR REPLACE FUNCTION reset_unread_on_read()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE conversation_participants SET
    unread_count = 0,
    last_read_at = NOW()
  WHERE conversation_id = (SELECT conversation_id FROM messages WHERE id = NEW.message_id)
    AND user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_message_read ON message_reads;
CREATE TRIGGER trigger_message_read
  AFTER INSERT ON message_reads
  FOR EACH ROW
  EXECUTE FUNCTION reset_unread_on_read();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Create a direct conversation between two users
CREATE OR REPLACE FUNCTION create_direct_conversation(user1_id uuid, user2_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  conv_id uuid;
BEGIN
  -- Check if conversation already exists
  SELECT c.id INTO conv_id
  FROM conversations c
  JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = user1_id
  JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = user2_id
  WHERE c.type = 'direct'
  LIMIT 1;
  
  IF conv_id IS NOT NULL THEN
    RETURN conv_id;
  END IF;
  
  -- Create new conversation
  INSERT INTO conversations (type, created_by)
  VALUES ('direct', user1_id)
  RETURNING id INTO conv_id;
  
  -- Add participants
  INSERT INTO conversation_participants (conversation_id, user_id, role)
  VALUES 
    (conv_id, user1_id, 'member'),
    (conv_id, user2_id, 'member');
  
  RETURN conv_id;
END;
$$;

-- Get unread message count for a user
CREATE OR REPLACE FUNCTION get_total_unread_count(target_user_id uuid)
RETURNS integer LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COALESCE(SUM(unread_count), 0)::integer
  FROM conversation_participants
  WHERE user_id = target_user_id AND left_at IS NULL;
$$;

-- ============================================================================
-- COMPLETION
-- ============================================================================

SELECT 'Migration 006 complete! Tables created: organizations, organization_memberships, events, event_team_participants, event_player_attendance, player_settings, recruiting_interests, conversations, conversation_participants, messages, message_reads' as status;

