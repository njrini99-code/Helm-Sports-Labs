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
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '008_player_engagement_events.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration 008_player_engagement_events.sql...\n');

    await client.query(sql);

    console.log('✅ Migration complete!\n');

    // Verify the table and functions were created
    const verifyQuery = `
      -- Check table exists
      SELECT
        EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'player_engagement_events'
        ) as table_exists,

        -- Check functions exist
        EXISTS (
          SELECT FROM pg_proc
          WHERE proname = 'get_player_engagement_summary'
        ) as summary_function_exists,

        EXISTS (
          SELECT FROM pg_proc
          WHERE proname = 'get_player_view_trend'
        ) as trend_function_exists,

        -- Check trigger exists
        EXISTS (
          SELECT FROM pg_trigger
          WHERE tgname = 'trigger_sync_engagement_aggregates'
        ) as trigger_exists;
    `;

    const verify = await client.query(verifyQuery);
    const results = verify.rows[0];

    console.log('📊 Verification:');
    console.log(`   ${results.table_exists ? '✅' : '❌'} player_engagement_events table`);
    console.log(`   ${results.summary_function_exists ? '✅' : '❌'} get_player_engagement_summary function`);
    console.log(`   ${results.trend_function_exists ? '✅' : '❌'} get_player_view_trend function`);
    console.log(`   ${results.trigger_exists ? '✅' : '❌'} trigger_sync_engagement_aggregates trigger`);

    // Check indexes
    const indexQuery = `
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'player_engagement_events'
      ORDER BY indexname;
    `;

    const indexes = await client.query(indexQuery);
    console.log('\n📊 Indexes created:');
    indexes.rows.forEach(row => console.log(`   ✅ ${row.indexname}`));

    console.log('\n🎉 Analytics system ready!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected');
  }
}

runMigration();
