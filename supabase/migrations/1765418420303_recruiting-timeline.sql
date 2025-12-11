-- recruiting-timeline Feature Database Schema

CREATE TABLE IF NOT EXISTS recruiting-timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recruiting-timeline_user_id ON recruiting-timeline(user_id);
CREATE INDEX idx_recruiting-timeline_status ON recruiting-timeline(status);

ALTER TABLE recruiting-timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recruiting-timeline_owner_policy" ON recruiting-timeline
  FOR ALL USING (auth.uid() = user_id);
