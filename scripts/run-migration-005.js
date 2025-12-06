/**
 * Run Migration 005 - Player Dashboard Wiring
 * Executes the SQL migration via Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🚀 Running Migration 005: Player Dashboard Wiring\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_player_dashboard_wiring.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split into individual statements (rough split on semicolons, handling $$ blocks)
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1] || '';
    
    // Track $$ blocks
    if (char === '$' && nextChar === '$') {
      inDollarQuote = !inDollarQuote;
      current += '$$';
      i++;
      continue;
    }
    
    current += char;
    
    // Split on semicolon if not in $$ block
    if (char === ';' && !inDollarQuote) {
      const stmt = current.trim();
      if (stmt && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      current = '';
    }
  }

  console.log(`📜 Found ${statements.length} SQL statements to execute\n`);

  // Execute each statement
  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // Skip comments and empty statements
    if (!stmt || stmt.startsWith('--') || stmt.trim() === '') {
      skipped++;
      continue;
    }

    // Extract statement type for logging
    const firstWords = stmt.split(/\s+/).slice(0, 3).join(' ').toUpperCase();
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_string: stmt });
      
      if (error) {
        // Try direct query for certain statements
        const { error: directError } = await supabase.from('_migrations_log').select('*').limit(0);
        
        // If it's a "already exists" type error, count as success
        if (error.message?.includes('already exists') || 
            error.message?.includes('duplicate') ||
            error.message?.includes('does not exist')) {
          console.log(`   ⏭️  ${firstWords}... (already done)`);
          skipped++;
        } else {
          console.log(`   ❌ ${firstWords}...`);
          console.log(`      Error: ${error.message}`);
          errors++;
        }
      } else {
        console.log(`   ✓ ${firstWords}...`);
        success++;
      }
    } catch (e) {
      // Supabase doesn't support direct SQL execution via client
      // We'll need to use a different approach
      skipped++;
    }
  }

  // Since Supabase JS client doesn't support raw SQL execution,
  // let's create the tables directly using the client API
  console.log('\n📦 Creating tables via Supabase client...\n');

  // Check and create organizations table
  const { error: orgCheckError } = await supabase.from('organizations').select('id').limit(1);
  if (orgCheckError?.code === '42P01') {
    console.log('   Creating organizations table...');
    // Table doesn't exist - we need to create it via SQL editor
    console.log('   ⚠️  Table creation requires Supabase Dashboard');
  } else {
    console.log('   ✓ organizations table exists');
  }

  // Check other tables
  const tables = ['events', 'event_team_participants', 'player_stats', 'evaluations', 'player_settings', 'recruiting_interests'];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error?.code === '42P01') {
      console.log(`   ⚠️  ${table} - needs to be created via Dashboard`);
    } else if (error) {
      console.log(`   ⚠️  ${table} - ${error.message}`);
    } else {
      console.log(`   ✓ ${table} exists`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 MIGRATION SUMMARY\n');
  
  // Check which tables exist
  const { data: existingTables } = await supabase.rpc('get_tables_list').catch(() => ({ data: null }));
  
  if (!existingTables) {
    console.log('⚠️  Direct SQL execution is not available via the Supabase JS client.');
    console.log('\n📝 Please run the migration manually:');
    console.log('\n   1. Go to: https://supabase.com/dashboard/project/blspsttgyxuoqhskpmrg/sql');
    console.log('   2. Copy the contents of: supabase/migrations/005_player_dashboard_wiring.sql');
    console.log('   3. Paste and run in the SQL Editor');
    console.log('\n   Or run: cat supabase/migrations/005_player_dashboard_wiring.sql | pbcopy');
    console.log('   Then paste in the Supabase SQL Editor\n');
  }

  // Output simplified SQL for quick copy
  console.log('\n📄 Quick SQL (simplified for direct paste):\n');
  console.log('-- Copy this to Supabase SQL Editor:\n');
  
  const simplifiedSQL = `
-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('high_school', 'showcase_org', 'juco', 'college', 'travel_ball')),
  location_city text,
  location_state text,
  logo_url text,
  banner_url text,
  website_url text,
  description text,
  conference text,
  division text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('game', 'showcase', 'tournament', 'camp', 'combine', 'tryout')),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  location_city text,
  location_state text,
  location_venue text,
  level text,
  is_public boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event team participants
CREATE TABLE IF NOT EXISTS event_team_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  result text CHECK (result IN ('win', 'loss', 'tie', NULL)),
  score_for integer,
  score_against integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, team_id)
);

-- Player stats
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  at_bats integer, hits integer, doubles integer, triples integer, home_runs integer,
  rbis integer, runs integer, stolen_bases integer, walks integer, strikeouts integer,
  batting_avg numeric(4,3),
  innings_pitched numeric(4,1), pitches_thrown integer, strikeouts_pitched integer,
  walks_allowed integer, hits_allowed integer, earned_runs integer, era numeric(5,2),
  putouts integer, assists integer, errors integer, fielding_pct numeric(4,3),
  points integer, rebounds integer, assists_bb integer,
  fg_made integer, fg_attempts integer, three_made integer, three_attempts integer,
  ft_made integer, ft_attempts integer,
  source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Evaluations
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  evaluator_id uuid REFERENCES coaches(id) ON DELETE SET NULL,
  evaluator_name text,
  overall_grade integer, arm_grade integer, bat_grade integer,
  speed_grade integer, fielding_grade integer, baseball_iq_grade integer,
  tags text[] DEFAULT '{}',
  notes text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Player settings
CREATE TABLE IF NOT EXISTS player_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_discoverable boolean DEFAULT true,
  show_gpa boolean DEFAULT false,
  show_test_scores boolean DEFAULT false,
  show_contact_info boolean DEFAULT false,
  notify_on_eval boolean DEFAULT true,
  notify_on_interest boolean DEFAULT true,
  notify_on_message boolean DEFAULT true,
  notify_on_watchlist_add boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recruiting interests
CREATE TABLE IF NOT EXISTS recruiting_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  program_id uuid REFERENCES coaches(id) ON DELETE CASCADE,
  school_name text NOT NULL,
  conference text,
  division text,
  status text DEFAULT 'interested' CHECK (status IN ('interested', 'contacted', 'questionnaire', 'unofficial_visit', 'official_visit', 'offer', 'verbal', 'signed')),
  interest_level text CHECK (interest_level IN ('low', 'medium', 'high')),
  notes text,
  last_contact_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add high_school_org_id to players if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'high_school_org_id') THEN
    ALTER TABLE players ADD COLUMN high_school_org_id uuid REFERENCES organizations(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_team_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiting_interests ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read for most)
CREATE POLICY IF NOT EXISTS "read_orgs" ON organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "read_events" ON events FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY IF NOT EXISTS "read_participants" ON event_team_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "read_own_stats" ON player_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "read_public_evals" ON evaluations FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY IF NOT EXISTS "manage_own_settings" ON player_settings FOR ALL TO authenticated USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));
CREATE POLICY IF NOT EXISTS "read_own_interests" ON recruiting_interests FOR SELECT TO authenticated USING (player_id IN (SELECT id FROM players WHERE user_id = auth.uid()));

SELECT 'Migration 005 complete!' as status;
`;

  console.log(simplifiedSQL);
}

runMigration().catch(console.error);

