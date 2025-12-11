-- bulk-actions Feature Database Schema

CREATE TABLE IF NOT EXISTS bulk-actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bulk-actions_user_id ON bulk-actions(user_id);
CREATE INDEX idx_bulk-actions_status ON bulk-actions(status);

ALTER TABLE bulk-actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bulk-actions_owner_policy" ON bulk-actions
  FOR ALL USING (auth.uid() = user_id);
