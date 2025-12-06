/**
 * Database Verification Script
 * Tests all SQL pathways used in the application
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function test(name, fn) {
  try {
    const result = await fn();
    console.log(`  ✓ ${name}`, result ? `(${result})` : '');
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}: ${err.message}`);
    return false;
  }
}

async function verifyDatabase() {
  console.log('🔍 ScoutPulse Database Verification\n');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;

  // 1. Core Tables
  console.log('\n📊 Core Tables:');
  
  if (await test('profiles table', async () => {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    return 'OK';
  })) passed++; else failed++;

  if (await test('players table', async () => {
    const { count, error } = await supabase.from('players').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} players`;
  })) passed++; else failed++;

  if (await test('coaches table', async () => {
    const { count, error } = await supabase.from('coaches').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} coaches`;
  })) passed++; else failed++;

  if (await test('teams table', async () => {
    const { count, error } = await supabase.from('teams').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} teams`;
  })) passed++; else failed++;

  // 2. Player Queries (used in Discover)
  console.log('\n🎯 Player Queries (Discover Page):');

  if (await test('players by state', async () => {
    const { data, error } = await supabase
      .from('players')
      .select('id, full_name, high_school_state, grad_year, primary_position')
      .eq('high_school_state', 'TX')
      .eq('onboarding_completed', true)
      .limit(5);
    if (error) throw error;
    return `${data.length} TX players`;
  })) passed++; else failed++;

  if (await test('players with metrics columns', async () => {
    const { data, error } = await supabase
      .from('players')
      .select('id, pitch_velo, exit_velo, sixty_time, has_video, verified_metrics')
      .limit(5);
    if (error) throw error;
    return 'columns exist';
  })) passed++; else failed++;

  if (await test('state counts query', async () => {
    const { data, error } = await supabase
      .from('players')
      .select('high_school_state')
      .eq('onboarding_completed', true)
      .not('high_school_state', 'is', null);
    if (error) throw error;
    const states = [...new Set(data.map(p => p.high_school_state))];
    return `${states.length} states`;
  })) passed++; else failed++;

  // 3. Coach Queries (used in Dashboard)
  console.log('\n👔 Coach Queries (Dashboard):');

  if (await test('coach with program info', async () => {
    const { data, error } = await supabase
      .from('coaches')
      .select('id, full_name, school_name, program_division, coach_type')
      .eq('coach_type', 'college')
      .limit(1)
      .single();
    if (error) throw error;
    return data.school_name || 'no school name';
  })) passed++; else failed++;

  if (await test('camp events for coach', async () => {
    const { data: coach } = await supabase.from('coaches').select('id').limit(1).single();
    const { data, error } = await supabase
      .from('camp_events')
      .select('*')
      .eq('coach_id', coach.id)
      .order('event_date', { ascending: true });
    if (error) throw error;
    return `${data.length} events`;
  })) passed++; else failed++;

  // 4. Recruiting Pipeline Queries
  console.log('\n⭐ Recruiting Pipeline Queries:');

  if (await test('recruit_watchlist', async () => {
    const { count, error } = await supabase.from('recruit_watchlist').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} entries`;
  })) passed++; else failed++;

  if (await test('recruits (legacy)', async () => {
    const { count, error } = await supabase.from('recruits').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} entries`;
  })) passed++; else failed++;

  if (await test('program_needs', async () => {
    const { count, error } = await supabase.from('program_needs').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} entries`;
  })) passed++; else failed++;

  // 5. Messaging Queries
  console.log('\n💬 Messaging Queries:');

  if (await test('conversations table', async () => {
    const { count, error } = await supabase.from('conversations').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} conversations`;
  })) passed++; else failed++;

  if (await test('messages table', async () => {
    const { count, error } = await supabase.from('messages').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} messages`;
  })) passed++; else failed++;

  // 6. Player Content Queries
  console.log('\n📹 Player Content Queries:');

  if (await test('player_metrics', async () => {
    const { count, error } = await supabase.from('player_metrics').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} metrics`;
  })) passed++; else failed++;

  if (await test('player_videos', async () => {
    const { count, error } = await supabase.from('player_videos').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} videos`;
  })) passed++; else failed++;

  if (await test('player_achievements', async () => {
    const { count, error } = await supabase.from('player_achievements').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} achievements`;
  })) passed++; else failed++;

  // 7. Engagement/Trending Queries
  console.log('\n📈 Engagement/Trending Queries:');

  if (await test('player_engagement', async () => {
    const { count, error } = await supabase.from('player_engagement').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} entries`;
  })) passed++; else failed++;

  if (await test('trending players query', async () => {
    const { data, error } = await supabase
      .from('player_engagement')
      .select(`
        player_id,
        recent_views_7d,
        watchlist_adds_count,
        players (id, full_name, grad_year, primary_position, high_school_state)
      `)
      .order('recent_views_7d', { ascending: false })
      .limit(5);
    if (error) throw error;
    return `${data.length} trending`;
  })) passed++; else failed++;

  // 8. Team Queries
  console.log('\n👥 Team Queries:');

  if (await test('team_memberships', async () => {
    const { count, error } = await supabase.from('team_memberships').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count} memberships`;
  })) passed++; else failed++;

  if (await test('team roster with players', async () => {
    const { data: team } = await supabase.from('teams').select('id').limit(1).single();
    if (!team) return 'no teams';
    
    const { data, error } = await supabase
      .from('team_memberships')
      .select(`
        id,
        player_id,
        players:player_id (id, first_name, last_name, grad_year, primary_position)
      `)
      .eq('team_id', team.id);
    if (error) throw error;
    return `${data.length} members`;
  })) passed++; else failed++;

  // 9. Join Queries (Complex)
  console.log('\n🔗 Complex Join Queries:');

  if (await test('coach conversations with players', async () => {
    const { data: coach } = await supabase.from('coaches').select('id').limit(1).single();
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        last_message_text,
        players:player_id (first_name, last_name)
      `)
      .eq('program_id', coach.id)
      .limit(5);
    if (error) throw error;
    return `${data.length} conversations`;
  })) passed++; else failed++;

  if (await test('recruits with player details', async () => {
    const { data, error } = await supabase
      .from('recruits')
      .select(`
        id,
        stage,
        players:player_id (id, first_name, last_name, grad_year, primary_position)
      `)
      .limit(5);
    if (error) throw error;
    return `${data.length} recruits`;
  })) passed++; else failed++;

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n✅ All database pathways are working correctly!\n');
  } else {
    console.log('\n⚠️  Some pathways need attention.\n');
  }

  // Data summary
  console.log('📋 Data Summary:');
  const { count: playerCount } = await supabase.from('players').select('*', { count: 'exact', head: true });
  const { count: coachCount } = await supabase.from('coaches').select('*', { count: 'exact', head: true });
  const { count: teamCount } = await supabase.from('teams').select('*', { count: 'exact', head: true });
  const { count: campCount } = await supabase.from('camp_events').select('*', { count: 'exact', head: true });
  
  console.log(`   Players: ${playerCount}`);
  console.log(`   Coaches: ${coachCount}`);
  console.log(`   Teams: ${teamCount}`);
  console.log(`   Camp Events: ${campCount}`);
  
  // State distribution
  const { data: stateData } = await supabase
    .from('players')
    .select('high_school_state')
    .eq('onboarding_completed', true)
    .not('high_school_state', 'is', null);
  
  if (stateData) {
    const stateCounts = {};
    stateData.forEach(p => {
      stateCounts[p.high_school_state] = (stateCounts[p.high_school_state] || 0) + 1;
    });
    console.log(`\n🗺️  Players by State:`);
    Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([state, count]) => {
        console.log(`   ${state}: ${count} players`);
      });
  }
}

verifyDatabase().catch(console.error);

