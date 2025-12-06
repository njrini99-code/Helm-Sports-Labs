const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Use DATABASE_URL from environment
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log('❌ DATABASE_URL not set');
    process.exit(1);
  }

  console.log('🔌 Connecting to Supabase...');
  
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected!\n');

    // Read the migration SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '006_optimized.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Running migration 006_optimized.sql...\n');
    
    await client.query(sql);
    
    console.log('✅ Migration complete!\n');
    
    // Verify tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('organizations', 'organization_memberships', 'events', 'event_team_participants', 
                         'player_settings', 'recruiting_interests', 'conversations', 
                         'conversation_participants', 'messages')
      ORDER BY table_name;
    `;
    
    const tables = await client.query(tablesQuery);
    console.log('📊 Tables verified:');
    tables.rows.forEach(row => console.log(`   ✅ ${row.table_name}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected');
  }
}

runMigration();
