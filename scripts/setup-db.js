/**
 * Database Setup Script
 * Uses Supabase JS client to set up missing tables and data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkTable(tableName) {
  const { data, error } = await supabase.from(tableName).select('*').limit(1);
  return !error;
}

async function setupDatabase() {
  console.log('🔍 Checking database tables...\n');

  const tables = [
    'profiles',
    'players', 
    'coaches',
    'teams',
    'team_memberships',
    'recruits',
    'camp_events',
    'player_metrics',
    'player_videos',
    'player_achievements',
    'conversations',
    'messages',
    'player_engagement',
    'program_needs',
    'recruit_watchlist'
  ];

  const results = {};
  
  for (const table of tables) {
    const exists = await checkTable(table);
    results[table] = exists;
    console.log(`  ${exists ? '✓' : '✗'} ${table}`);
  }

  console.log('\n📊 Summary:');
  const existing = Object.entries(results).filter(([_, exists]) => exists);
  const missing = Object.entries(results).filter(([_, exists]) => !exists);
  
  console.log(`   Existing tables: ${existing.length}`);
  console.log(`   Missing tables: ${missing.length}`);

  if (missing.length > 0) {
    console.log('\n⚠️  Missing tables:');
    missing.forEach(([table]) => console.log(`   - ${table}`));
    console.log('\n📋 These tables need to be created via Supabase Dashboard SQL Editor.');
    console.log('   See: https://supabase.com/dashboard/project/blspsttgyxuoqhskpmrg/sql/new');
  }

  // Test if we can update players with new columns
  console.log('\n🔍 Checking player columns...');
  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .select('id, first_name, last_name, full_name, avatar_url, pitch_velo, exit_velo, sixty_time, has_video, verified_metrics')
    .limit(1);

  if (playerError) {
    console.log('   ⚠️  Some player columns may be missing');
    console.log(`   Error: ${playerError.message}`);
    
    // Try to identify which columns are missing
    const columns = ['full_name', 'avatar_url', 'pitch_velo', 'exit_velo', 'sixty_time', 'has_video', 'verified_metrics'];
    for (const col of columns) {
      const { error } = await supabase.from('players').select(`id, ${col}`).limit(1);
      if (error) {
        console.log(`   ✗ Column missing: ${col}`);
      } else {
        console.log(`   ✓ Column exists: ${col}`);
      }
    }
  } else {
    console.log('   ✓ All player columns exist');
  }

  // Update existing player full_names
  console.log('\n📝 Updating player full_names...');
  const { data: playersToUpdate } = await supabase
    .from('players')
    .select('id, first_name, last_name, full_name')
    .is('full_name', null);

  if (playersToUpdate && playersToUpdate.length > 0) {
    let updated = 0;
    for (const player of playersToUpdate) {
      const fullName = `${player.first_name || ''} ${player.last_name || ''}`.trim();
      if (fullName) {
        const { error } = await supabase
          .from('players')
          .update({ full_name: fullName })
          .eq('id', player.id);
        if (!error) updated++;
      }
    }
    console.log(`   ✓ Updated ${updated} player full_names`);
  } else {
    console.log('   ✓ All players have full_names');
  }

  // Create sample player engagement data if table exists
  if (results['player_engagement']) {
    console.log('\n📈 Checking player engagement data...');
    const { data: engagement, error: engError } = await supabase
      .from('player_engagement')
      .select('id')
      .limit(1);

    if (!engError && (!engagement || engagement.length === 0)) {
      console.log('   Creating sample engagement data...');
      
      const { data: players } = await supabase
        .from('players')
        .select('id')
        .eq('onboarding_completed', true)
        .limit(20);

      if (players) {
        for (const player of players) {
          await supabase.from('player_engagement').upsert({
            player_id: player.id,
            profile_views_count: Math.floor(Math.random() * 100) + 10,
            watchlist_adds_count: Math.floor(Math.random() * 20) + 1,
            recent_views_7d: Math.floor(Math.random() * 30) + 5,
            recent_updates_30d: Math.floor(Math.random() * 10) + 1,
            last_activity_at: new Date().toISOString(),
          }, { onConflict: 'player_id' });
        }
        console.log(`   ✓ Created engagement data for ${players.length} players`);
      }
    } else if (engagement && engagement.length > 0) {
      console.log('   ✓ Player engagement data exists');
    }
  }

  console.log('\n✅ Database check complete!\n');
}

setupDatabase().catch(console.error);

