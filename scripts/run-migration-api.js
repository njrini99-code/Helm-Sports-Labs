/**
 * Run database migrations using Supabase REST API
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function executeSql(sql) {
  // Use the Supabase REST API to execute SQL
  // The /rest/v1/rpc endpoint can execute stored procedures
  // But for raw SQL, we need to use the postgrest proxy or create a function
  
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'GET',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
    }
  });
  
  return response.ok;
}

// Split SQL into individual statements
function splitSql(sql) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let dollarTag = '';
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    
    // Check for dollar quote start/end
    if (char === '$') {
      let tag = '$';
      let j = i + 1;
      while (j < sql.length && (sql[j].match(/[a-zA-Z0-9_]/) || sql[j] === '$')) {
        tag += sql[j];
        if (sql[j] === '$') {
          j++;
          break;
        }
        j++;
      }
      
      if (tag.endsWith('$')) {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = tag;
        } else if (tag === dollarTag) {
          inDollarQuote = false;
          dollarTag = '';
        }
        current += tag;
        i = j - 1;
        continue;
      }
    }
    
    current += char;
    
    // Split on semicolon if not in dollar quote
    if (char === ';' && !inDollarQuote) {
      const trimmed = current.trim();
      if (trimmed && !trimmed.match(/^--/) && trimmed !== ';') {
        statements.push(trimmed);
      }
      current = '';
    }
  }
  
  if (current.trim()) {
    statements.push(current.trim());
  }
  
  return statements;
}

async function runMigration() {
  console.log('🚀 Running database migration via Supabase API...\n');
  
  // Read migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/004_complete_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  // Filter out comment-only lines and get meaningful statements
  const statements = splitSql(sql);
  
  console.log(`📋 Found ${statements.length} SQL statements\n`);
  
  // Group statements by type for better logging
  const creates = statements.filter(s => s.toUpperCase().startsWith('CREATE'));
  const alters = statements.filter(s => s.toUpperCase().startsWith('ALTER'));
  const drops = statements.filter(s => s.toUpperCase().startsWith('DROP'));
  const others = statements.filter(s => 
    !s.toUpperCase().startsWith('CREATE') && 
    !s.toUpperCase().startsWith('ALTER') && 
    !s.toUpperCase().startsWith('DROP')
  );
  
  console.log('📊 Statement breakdown:');
  console.log(`   CREATE statements: ${creates.length}`);
  console.log(`   ALTER statements: ${alters.length}`);
  console.log(`   DROP statements: ${drops.length}`);
  console.log(`   Other statements: ${others.length}`);
  
  // Output the SQL file for manual execution
  console.log('\n' + '='.repeat(60));
  console.log('⚠️  Direct SQL execution requires Supabase Dashboard');
  console.log('='.repeat(60));
  console.log('\n📋 To run this migration:');
  console.log('   1. Go to your Supabase Dashboard');
  console.log('   2. Navigate to SQL Editor');
  console.log('   3. Copy and paste the contents of:');
  console.log(`      ${migrationPath}`);
  console.log('   4. Click "Run"');
  console.log('\n🔗 Dashboard URL:');
  console.log(`   https://supabase.com/dashboard/project/blspsttgyxuoqhskpmrg/sql/new`);
  
  // Also try to verify connection
  console.log('\n🔍 Verifying Supabase connection...');
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/profiles?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      }
    });
    
    if (response.ok) {
      console.log('   ✓ Connection to Supabase is working\n');
    } else {
      console.log(`   ⚠️  Connection issue: ${response.status}\n`);
    }
  } catch (err) {
    console.log(`   ⚠️  Could not verify connection: ${err.message}\n`);
  }
  
  // Create a simplified version that can be copy-pasted
  console.log('='.repeat(60));
  console.log('📄 Quick Migration SQL (essential tables only):');
  console.log('='.repeat(60));
  console.log(`
-- Copy this to Supabase SQL Editor and run:

-- Add missing columns to players
ALTER TABLE players ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS pitch_velo numeric;
ALTER TABLE players ADD COLUMN IF NOT EXISTS exit_velo numeric;
ALTER TABLE players ADD COLUMN IF NOT EXISTS sixty_time numeric;
ALTER TABLE players ADD COLUMN IF NOT EXISTS has_video boolean DEFAULT false;
ALTER TABLE players ADD COLUMN IF NOT EXISTS verified_metrics boolean DEFAULT false;

-- Add missing columns to teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS organization_name text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  program_id uuid REFERENCES coaches(id) ON DELETE CASCADE,
  last_message_text text,
  last_message_at timestamptz,
  last_sender text,
  player_unread_count integer DEFAULT 0,
  program_unread_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id, program_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type text NOT NULL,
  sender_id uuid,
  message_text text NOT NULL,
  read_by_player boolean DEFAULT false,
  read_by_program boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create player_engagement table
CREATE TABLE IF NOT EXISTS player_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  profile_views_count integer DEFAULT 0,
  watchlist_adds_count integer DEFAULT 0,
  recent_views_7d integer DEFAULT 0,
  recent_updates_30d integer DEFAULT 0,
  last_activity_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id)
);

-- Create program_needs table
CREATE TABLE IF NOT EXISTS program_needs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  positions_needed text[] DEFAULT '{}',
  grad_years_needed integer[] DEFAULT '{}',
  min_pitch_velo numeric,
  min_exit_velo numeric,
  preferred_states text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(coach_id)
);

-- Create recruit_watchlist table  
CREATE TABLE IF NOT EXISTS recruit_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'watchlist',
  position_role text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(coach_id, player_id)
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruit_watchlist ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow authenticated users)
CREATE POLICY IF NOT EXISTS "auth_read_conversations" ON conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "auth_write_conversations" ON conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_read_messages" ON messages FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "auth_write_messages" ON messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "auth_read_engagement" ON player_engagement FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "auth_manage_needs" ON program_needs FOR ALL TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "auth_manage_watchlist" ON recruit_watchlist FOR ALL TO authenticated USING (true);

-- Update existing players' full_name
UPDATE players SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) WHERE full_name IS NULL;

SELECT 'Migration complete!' as status;
`);
}

runMigration();

