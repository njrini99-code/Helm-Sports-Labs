-- export-functionality Feature Database Schema

CREATE TABLE IF NOT EXISTS export-functionality (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_export-functionality_user_id ON export-functionality(user_id);
CREATE INDEX idx_export-functionality_status ON export-functionality(status);

ALTER TABLE export-functionality ENABLE ROW LEVEL SECURITY;

CREATE POLICY "export-functionality_owner_policy" ON export-functionality
  FOR ALL USING (auth.uid() = user_id);
