-- player-comparison-tool Feature Database Schema

CREATE TABLE IF NOT EXISTS player-comparison-tool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_player-comparison-tool_user_id ON player-comparison-tool(user_id);
CREATE INDEX idx_player-comparison-tool_status ON player-comparison-tool(status);

ALTER TABLE player-comparison-tool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "player-comparison-tool_owner_policy" ON player-comparison-tool
  FOR ALL USING (auth.uid() = user_id);
