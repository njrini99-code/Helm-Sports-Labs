-- ScoutPulse App Structure Updates
-- Updates database to match current application structure
-- Safe to run multiple times (IF NOT EXISTS throughout)

-- ============================================================================
-- PLAYERS TABLE UPDATES
-- ============================================================================

-- Add avatar_url column (used in PlayerListItem and throughout app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE players ADD COLUMN avatar_url text;
  END IF;
END$$;

-- Add full_name computed column or ensure it can be derived
-- Note: App uses first_name + last_name, but adding full_name for convenience
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE players ADD COLUMN full_name text;
  END IF;
END$$;

-- Create a function to auto-update full_name
CREATE OR REPLACE FUNCTION update_player_full_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name = TRIM(COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update full_name
DROP TRIGGER IF EXISTS trigger_update_player_full_name ON players;
CREATE TRIGGER trigger_update_player_full_name
  BEFORE INSERT OR UPDATE OF first_name, last_name ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_player_full_name();

-- Update existing rows
UPDATE players SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) WHERE full_name IS NULL;

-- ============================================================================
-- CONVERSATIONS TABLE (for messaging system)
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  program_id uuid REFERENCES coaches(id) ON DELETE CASCADE,
  last_message_text text,
  last_message_at timestamptz,
  last_sender text CHECK (last_sender IN ('player', 'coach', 'system')),
  player_unread_count integer DEFAULT 0,
  program_unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(player_id, program_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
DROP POLICY IF EXISTS "Players can view own conversations" ON conversations;
CREATE POLICY "Players can view own conversations" ON conversations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p 
      WHERE p.id = conversations.player_id 
      AND p.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can view own conversations" ON conversations;
CREATE POLICY "Coaches can view own conversations" ON conversations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.id = conversations.program_id 
      AND c.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Players can create conversations" ON conversations;
CREATE POLICY "Players can create conversations" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players p 
      WHERE p.id = conversations.player_id 
      AND p.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can create conversations" ON conversations;
CREATE POLICY "Coaches can create conversations" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.id = conversations.program_id 
      AND c.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Players can update own conversations" ON conversations;
CREATE POLICY "Players can update own conversations" ON conversations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p 
      WHERE p.id = conversations.player_id 
      AND p.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players p 
      WHERE p.id = conversations.player_id 
      AND p.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can update own conversations" ON conversations;
CREATE POLICY "Coaches can update own conversations" ON conversations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.id = conversations.program_id 
      AND c.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coaches c 
      WHERE c.id = conversations.program_id 
      AND c.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- MESSAGES TABLE (for messaging system)
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('player', 'coach', 'system')),
  sender_player_id uuid REFERENCES players(id) ON DELETE SET NULL,
  sender_program_id uuid REFERENCES coaches(id) ON DELETE SET NULL,
  message_text text NOT NULL,
  read_by_player boolean DEFAULT false,
  read_by_program boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
DROP POLICY IF EXISTS "Players can view messages in own conversations" ON messages;
CREATE POLICY "Players can view messages in own conversations" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN players p ON p.id = c.player_id
      WHERE c.id = messages.conversation_id
      AND p.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can view messages in own conversations" ON messages;
CREATE POLICY "Coaches can view messages in own conversations" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN coaches co ON co.id = c.program_id
      WHERE c.id = messages.conversation_id
      AND co.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Players can send messages" ON messages;
CREATE POLICY "Players can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN players p ON p.id = c.player_id
      WHERE c.id = messages.conversation_id
      AND p.user_id = (SELECT auth.uid())
      AND messages.sender_type = 'player'
    )
  );

DROP POLICY IF EXISTS "Coaches can send messages" ON messages;
CREATE POLICY "Coaches can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN coaches co ON co.id = c.program_id
      WHERE c.id = messages.conversation_id
      AND co.user_id = (SELECT auth.uid())
      AND messages.sender_type = 'coach'
    )
  );

DROP POLICY IF EXISTS "Players can update own messages" ON messages;
CREATE POLICY "Players can update own messages" ON messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN players p ON p.id = c.player_id
      WHERE c.id = messages.conversation_id
      AND p.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN players p ON p.id = c.player_id
      WHERE c.id = messages.conversation_id
      AND p.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can update own messages" ON messages;
CREATE POLICY "Coaches can update own messages" ON messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN coaches co ON co.id = c.program_id
      WHERE c.id = messages.conversation_id
      AND co.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN coaches co ON co.id = c.program_id
      WHERE c.id = messages.conversation_id
      AND co.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- INDEXES FOR MESSAGING
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_conversations_player_id ON conversations(player_id);
CREATE INDEX IF NOT EXISTS idx_conversations_program_id ON conversations(program_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_player ON messages(sender_player_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_program ON messages(sender_program_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

DROP TRIGGER IF EXISTS set_updated_at_conversations ON conversations;
CREATE TRIGGER set_updated_at_conversations
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_messages ON messages;
CREATE TRIGGER set_updated_at_messages
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- FUNCTION TO UPDATE CONVERSATION LAST MESSAGE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message_text = NEW.message_text,
    last_message_at = NEW.created_at,
    last_sender = NEW.sender_type,
    player_unread_count = CASE 
      WHEN NEW.sender_type = 'coach' THEN player_unread_count + 1
      ELSE player_unread_count
    END,
    program_unread_count = CASE 
      WHEN NEW.sender_type = 'player' THEN program_unread_count + 1
      ELSE program_unread_count
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- ============================================================================
-- INDEXES FOR PLAYERS (avatar_url, full_name)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_players_avatar_url ON players(avatar_url) WHERE avatar_url IS NOT NULL;

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'App structure updates completed successfully!';
  RAISE NOTICE 'Added: avatar_url, full_name, conversations, messages tables';
END $$;

