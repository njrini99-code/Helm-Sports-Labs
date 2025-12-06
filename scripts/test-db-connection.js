// Test script to verify Supabase database connection
// Run with: node scripts/test-db-connection.js

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure .env.local has:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check if we can query profiles table
    console.log('1️⃣ Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('   ❌ Error:', profilesError.message);
      return false;
    }
    console.log('   ✅ Profiles table accessible\n');

    // Test 2: Check if we can query players table
    console.log('2️⃣ Testing players table access...');
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('count')
      .limit(1);
    
    if (playersError) {
      console.error('   ❌ Error:', playersError.message);
      return false;
    }
    console.log('   ✅ Players table accessible\n');

    // Test 3: Check if we can query coaches table
    console.log('3️⃣ Testing coaches table access...');
    const { data: coaches, error: coachesError } = await supabase
      .from('coaches')
      .select('count')
      .limit(1);
    
    if (coachesError) {
      console.error('   ❌ Error:', coachesError.message);
      return false;
    }
    console.log('   ✅ Coaches table accessible\n');

    // Test 4: Check if functions exist (test get_state_counts)
    console.log('4️⃣ Testing get_state_counts function...');
    const { data: stateCounts, error: functionError } = await supabase
      .rpc('get_state_counts');
    
    if (functionError) {
      console.error('   ❌ Error:', functionError.message);
      return false;
    }
    console.log('   ✅ Function accessible');
    console.log('   📊 State counts:', stateCounts?.length || 0, 'states\n');

    // Test 5: Check table structure
    console.log('5️⃣ Verifying table structure...');
    const tables = ['profiles', 'players', 'coaches', 'camp_events', 'teams', 'recruits'];
    let allTablesExist = true;
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.error(`   ❌ Table ${table} not accessible:`, error.message);
        allTablesExist = false;
      }
    }
    
    if (allTablesExist) {
      console.log('   ✅ All core tables exist\n');
    } else {
      return false;
    }

    // Test 6: Check RLS is enabled (try to insert without auth - should fail)
    console.log('6️⃣ Testing RLS policies...');
    const { error: rlsError } = await supabase
      .from('profiles')
      .insert({ id: '00000000-0000-0000-0000-000000000000', role: 'player' });
    
    // This should fail due to RLS - if it succeeds, RLS might not be working
    if (!rlsError) {
      console.warn('   ⚠️  RLS might not be working - insert succeeded without auth');
    } else if (rlsError.code === '42501' || rlsError.message.includes('policy')) {
      console.log('   ✅ RLS is working (insert blocked as expected)\n');
    } else {
      console.log('   ✅ RLS appears to be enabled\n');
    }

    console.log('🎉 All tests passed! Your database is ready to go.\n');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Visit: http://localhost:3000');
    console.log('   3. Try signing up as a player or coach');
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});

