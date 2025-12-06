/**
 * Direct PostgreSQL Connection Test
 * 
 * Tests direct connection to Supabase PostgreSQL database
 * 
 * Usage:
 *   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.blspsttgyxuoqhskpmrg.supabase.co:5432/postgres" node scripts/test-db-connection-direct.js
 * 
 * Or add to .env.local:
 *   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.blspsttgyxuoqhskpmrg.supabase.co:5432/postgres
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.log('\n💡 Add to .env.local:');
  console.log('DATABASE_URL=postgresql://postgres:[PASSWORD]@db.blspsttgyxuoqhskpmrg.supabase.co:5432/postgres');
  process.exit(1);
}

// Parse connection string - handle postgresql:// format
let password;
try {
  // Extract password from postgresql:// format
  const match = databaseUrl.match(/postgresql:\/\/postgres:([^@]+)@/);
  password = match ? match[1] : null;
} catch (e) {
  password = null;
}

if (!password || password === '[YOUR_PASSWORD]') {
  console.error('❌ Please replace [YOUR_PASSWORD] with your actual database password');
  console.log('\n💡 Get your password from:');
  console.log('   Supabase Dashboard → Settings → Database → Connection string');
  process.exit(1);
}

// Use connection string directly (pg handles parsing)
const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false // Supabase uses SSL
  },
  // Add connection timeout
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  console.log('🔌 Testing direct PostgreSQL connection...\n');

  try {
    await client.connect();
    console.log('✅ Connected to database successfully!\n');

    // Test 1: Check database version
    const versionResult = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:');
    console.log(`   ${versionResult.rows[0].version.split(',')[0]}\n`);

    // Test 2: Check table count
    const tablesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(`📋 Tables in database: ${tablesResult.rows[0].count}\n`);

    // Test 3: List all tables
    const tableListResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📑 Table List:');
    tableListResult.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.table_name}`);
    });
    console.log('');

    // Test 4: Check indexes
    const indexesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public'
    `);
    console.log(`🔍 Indexes: ${indexesResult.rows[0].count}\n`);

    // Test 5: Check RLS policies
    const rlsResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM pg_policies 
      WHERE schemaname = 'public'
    `);
    console.log(`🔐 RLS Policies: ${rlsResult.rows[0].count}\n`);

    // Test 6: Sample data counts
    const sampleCounts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM players) as players,
        (SELECT COUNT(*) FROM coaches) as coaches,
        (SELECT COUNT(*) FROM recruits) as recruits,
        (SELECT COUNT(*) FROM player_metrics) as metrics,
        (SELECT COUNT(*) FROM player_videos) as videos
    `);
    console.log('📊 Sample Data Counts:');
    const counts = sampleCounts.rows[0];
    console.log(`   Players: ${counts.players}`);
    console.log(`   Coaches: ${counts.coaches}`);
    console.log(`   Recruits: ${counts.recruits}`);
    console.log(`   Metrics: ${counts.metrics}`);
    console.log(`   Videos: ${counts.videos}\n`);

    // Test 7: Check for optimization indexes
    const optIndexes = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `);
    console.log('⚡ Optimization Indexes:');
    if (optIndexes.rows.length > 0) {
      optIndexes.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.indexname}`);
      });
    } else {
      console.log('   ⚠️  No optimization indexes found. Run migration 002_query_optimization_indexes.sql');
    }
    console.log('');

    // Test 8: Query performance test
    console.log('⚡ Performance Test:');
    const startTime = Date.now();
    await client.query(`
      SELECT p.id, p.first_name, p.last_name, p.grad_year, p.primary_position
      FROM players p
      WHERE p.onboarding_completed = true
      LIMIT 10
    `);
    const queryTime = Date.now() - startTime;
    console.log(`   Simple query: ${queryTime}ms`);
    
    if (queryTime > 500) {
      console.log('   ⚠️  Query is slow. Consider running optimization indexes migration.');
    } else {
      console.log('   ✅ Query performance is good!');
    }
    console.log('');

    console.log('✅ All connection tests passed!\n');
    console.log('💡 You can now use this connection for:');
    console.log('   - Running migrations directly');
    console.log('   - Database administration');
    console.log('   - Performance monitoring');
    console.log('   - Data analysis\n');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Check your database password in the connection string');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Check your database host and port');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection();

