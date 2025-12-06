/**
 * Test Supabase Client Connection (Recommended)
 * 
 * This uses the Supabase client which is the recommended way to connect.
 * It doesn't require direct PostgreSQL connections.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔌 Testing Supabase Client connection...\n');

  try {
    // Test 1: Check connection
    const { data: tables, error: tablesError } = await supabase
      .from('players')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.error('❌ Connection failed:', tablesError.message);
      if (tablesError.message.includes('JWT')) {
        console.log('\n💡 Check your NEXT_PUBLIC_SUPABASE_ANON_KEY');
      }
      return;
    }

    console.log('✅ Connected to Supabase successfully!\n');

    // Test 2: Get table counts
    const [playersResult, coachesResult, recruitsResult] = await Promise.all([
      supabase.from('players').select('id', { count: 'exact', head: true }),
      supabase.from('coaches').select('id', { count: 'exact', head: true }),
      supabase.from('recruits').select('id', { count: 'exact', head: true }),
    ]);

    console.log('📊 Data Counts:');
    console.log(`   Players: ${playersResult.count || 0}`);
    console.log(`   Coaches: ${coachesResult.count || 0}`);
    console.log(`   Recruits: ${recruitsResult.count || 0}\n`);

    // Test 3: Test a query
    const startTime = Date.now();
    const { data: samplePlayers } = await supabase
      .from('players')
      .select('id, first_name, last_name, grad_year')
      .eq('onboarding_completed', true)
      .limit(5);
    
    const queryTime = Date.now() - startTime;
    console.log(`⚡ Query Performance: ${queryTime}ms`);
    
    if (samplePlayers && samplePlayers.length > 0) {
      console.log(`\n📋 Sample Players:`);
      samplePlayers.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.first_name} ${p.last_name} (${p.grad_year})`);
      });
    }

    console.log('\n✅ All tests passed!');
    console.log('\n💡 For database administration, use the Supabase Dashboard SQL Editor');
    console.log('   or get the correct direct connection string from Settings → Database\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();

