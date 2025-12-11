-- recruiting-templates Feature Database Schema

CREATE TABLE IF NOT EXISTS recruiting-templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recruiting-templates_user_id ON recruiting-templates(user_id);
CREATE INDEX idx_recruiting-templates_status ON recruiting-templates(status);

ALTER TABLE recruiting-templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recruiting-templates_owner_policy" ON recruiting-templates
  FOR ALL USING (auth.uid() = user_id);
