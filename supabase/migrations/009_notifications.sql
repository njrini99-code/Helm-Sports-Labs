-- ScoutPulse Notifications System
-- Creates notifications table and real-time triggers for in-app notifications

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('player', 'coach')),

  -- Notification details
  type text NOT NULL CHECK (type IN (
    'new_message',
    'profile_view',
    'watchlist_add',
    'college_interest',
    'evaluation_received',
    'camp_registration'
  )),
  title text NOT NULL,
  message text NOT NULL,

  -- Related entity (optional)
  related_id uuid,
  related_type text CHECK (related_type IN ('player', 'coach', 'message', 'conversation', 'evaluation')),

  -- Action URL (optional)
  action_url text,

  -- State
  is_read boolean DEFAULT false,
  read_at timestamptz,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id, is_read, created_at DESC)
  WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_type
  ON notifications(user_id, type, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications (handled by triggers)
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- ============================================================================
-- NOTIFICATION CREATION FUNCTIONS
-- ============================================================================

-- Helper function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_user_type text,
  p_type text,
  p_title text,
  p_message text,
  p_related_id uuid DEFAULT NULL,
  p_related_type text DEFAULT NULL,
  p_action_url text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    user_type,
    type,
    title,
    message,
    related_id,
    related_type,
    action_url
  ) VALUES (
    p_user_id,
    p_user_type,
    p_type,
    p_title,
    p_message,
    p_related_id,
    p_related_type,
    p_action_url
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTOMATIC NOTIFICATION TRIGGERS
-- ============================================================================

-- Trigger: New message received
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation record;
  v_sender_name text;
  v_recipient_id uuid;
  v_recipient_type text;
BEGIN
  -- Get conversation details
  SELECT * INTO v_conversation
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- Determine recipient based on sender type
  IF NEW.sender_type = 'player' THEN
    v_recipient_id := v_conversation.program_id;
    v_recipient_type := 'coach';

    -- Get sender name
    SELECT COALESCE(full_name, first_name || ' ' || last_name)
    INTO v_sender_name
    FROM players
    WHERE id = v_conversation.player_id;
  ELSE
    v_recipient_id := v_conversation.player_id;
    v_recipient_type := 'player';

    -- Get sender name (program name)
    SELECT name INTO v_sender_name
    FROM coaches
    WHERE id = v_conversation.program_id
    LIMIT 1;
  END IF;

  -- Create notification
  PERFORM create_notification(
    v_recipient_id,
    v_recipient_type,
    'new_message',
    'New Message',
    v_sender_name || ': ' || LEFT(NEW.content, 100),
    NEW.conversation_id,
    'conversation',
    '/messages?conversation=' || NEW.conversation_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Trigger: Profile viewed by coach
CREATE OR REPLACE FUNCTION notify_profile_view()
RETURNS TRIGGER AS $$
DECLARE
  v_coach_name text;
  v_coach_program text;
BEGIN
  -- Only notify on coach views (not player viewing their own)
  IF NEW.viewer_type = 'coach' THEN
    -- Get coach info
    SELECT
      c.first_name || ' ' || c.last_name,
      c.program
    INTO v_coach_name, v_coach_program
    FROM coaches c
    WHERE c.id = NEW.viewer_id;

    -- Create notification
    PERFORM create_notification(
      NEW.player_id,
      'player',
      'profile_view',
      'Profile Viewed',
      COALESCE(v_coach_name, 'A coach') ||
        CASE
          WHEN v_coach_program IS NOT NULL THEN ' from ' || v_coach_program
          ELSE ''
        END || ' viewed your profile',
      NEW.viewer_id,
      'coach',
      '/player/profile'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_profile_view
  AFTER INSERT ON player_engagement
  FOR EACH ROW
  WHEN (NEW.event_type = 'profile_view')
  EXECUTE FUNCTION notify_profile_view();

-- Trigger: Added to watchlist
CREATE OR REPLACE FUNCTION notify_watchlist_add()
RETURNS TRIGGER AS $$
DECLARE
  v_coach_name text;
  v_coach_program text;
BEGIN
  -- Get coach info
  SELECT
    c.first_name || ' ' || c.last_name,
    c.program
  INTO v_coach_name, v_coach_program
  FROM coaches c
  WHERE c.id = NEW.coach_id;

  -- Create notification
  PERFORM create_notification(
    NEW.player_id,
    'player',
    'watchlist_add',
    'Added to Watchlist',
    COALESCE(v_coach_name, 'A coach') ||
      CASE
        WHEN v_coach_program IS NOT NULL THEN ' from ' || v_coach_program
        ELSE ''
      END || ' added you to their watchlist (' || NEW.status || ')',
    NEW.coach_id,
    'coach',
    '/player/dashboard'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_watchlist_add
  AFTER INSERT ON recruit_watchlist
  FOR EACH ROW
  EXECUTE FUNCTION notify_watchlist_add();

-- ============================================================================
-- CLEANUP FUNCTION
-- ============================================================================

-- Delete old read notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE is_read = true
    AND read_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
