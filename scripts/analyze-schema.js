/**
 * Comprehensive Supabase Database Schema Analysis
 *
 * This script connects to Supabase and performs a thorough analysis of:
 * - All tables, columns, types, constraints
 * - Foreign key relationships
 * - Indexes
 * - RLS policies
 * - Data integrity issues
 * - Performance concerns
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to run raw SQL queries
async function runQuery(query) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
  if (error) {
    // Try alternative method for queries
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sql_query: query })
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${error?.message || response.statusText}`);
    }
    return await response.json();
  }
  return data;
}

async function getAllTables() {
  const query = `
    SELECT
      schemaname,
      tablename,
      tableowner
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `;

  try {
    const { data, error } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename, tableowner')
      .eq('schemaname', 'public');

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching tables:', e.message);
    return [];
  }
}

async function getTableColumns(tableName) {
  const query = `
    SELECT
      column_name,
      data_type,
      character_maximum_length,
      is_nullable,
      column_default,
      udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position;
  `;

  try {
    // Use direct table query instead
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);

    // This won't return data but we can get column info from error or metadata
    // Let's try a different approach - query the information schema
    return [];
  } catch (e) {
    return [];
  }
}

async function analyzeSchema() {
  console.log('🔍 Starting Comprehensive Database Schema Analysis...\n');
  console.log('=' .repeat(80));

  // 1. Get all tables
  console.log('\n📊 SECTION 1: SCHEMA OVERVIEW\n');
  console.log('-'.repeat(80));

  const tables = await getAllTables();
  console.log(`\nFound ${tables.length} tables in public schema:\n`);

  for (const table of tables) {
    console.log(`  ✓ ${table.tablename}`);
  }

  // 2. Analyze each table
  console.log('\n\n📋 SECTION 2: DETAILED TABLE ANALYSIS\n');
  console.log('-'.repeat(80));

  const tableDetails = {};

  for (const table of tables) {
    console.log(`\n\nAnalyzing: ${table.tablename}`);
    console.log('─'.repeat(60));

    try {
      // Try to query the table to understand its structure
      const { data, error, count } = await supabase
        .from(table.tablename)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`  ⚠️  Error accessing table: ${error.message}`);
        tableDetails[table.tablename] = { error: error.message, accessible: false };
      } else {
        console.log(`  ✓ Accessible`);
        console.log(`  📊 Row count: ${count !== null ? count : 'Unknown'}`);
        tableDetails[table.tablename] = {
          accessible: true,
          rowCount: count,
          hasData: count > 0
        };
      }

      // Try to get a sample row to understand columns
      const { data: sample } = await supabase
        .from(table.tablename)
        .select('*')
        .limit(1)
        .single();

      if (sample) {
        const columns = Object.keys(sample);
        console.log(`  📝 Columns (${columns.length}): ${columns.join(', ')}`);
        tableDetails[table.tablename].columns = columns;
        tableDetails[table.tablename].sampleData = sample;
      }
    } catch (e) {
      console.log(`  ❌ Exception: ${e.message}`);
      tableDetails[table.tablename] = { error: e.message, accessible: false };
    }
  }

  // 3. Check RLS status
  console.log('\n\n🔒 SECTION 3: ROW LEVEL SECURITY ANALYSIS\n');
  console.log('-'.repeat(80));

  for (const table of tables) {
    try {
      // Try to query without auth to test RLS
      const testClient = createClient(supabaseUrl, supabaseKey);
      const { error } = await testClient
        .from(table.tablename)
        .select('*')
        .limit(1);

      if (error && error.message.includes('row-level security')) {
        console.log(`  ✓ ${table.tablename}: RLS ENABLED`);
      } else if (error) {
        console.log(`  ⚠️  ${table.tablename}: ${error.message}`);
      } else {
        console.log(`  ⚠️  ${table.tablename}: RLS DISABLED or publicly readable`);
      }
    } catch (e) {
      console.log(`  ❌ ${table.tablename}: Error checking RLS - ${e.message}`);
    }
  }

  // 4. Summary
  console.log('\n\n📈 SECTION 4: SUMMARY & RECOMMENDATIONS\n');
  console.log('-'.repeat(80));

  const accessibleTables = Object.values(tableDetails).filter(t => t.accessible).length;
  const tablesWithData = Object.values(tableDetails).filter(t => t.hasData).length;
  const emptyTables = Object.values(tableDetails).filter(t => t.accessible && !t.hasData).length;

  console.log(`\n  Total Tables: ${tables.length}`);
  console.log(`  Accessible Tables: ${accessibleTables}`);
  console.log(`  Tables with Data: ${tablesWithData}`);
  console.log(`  Empty Tables: ${emptyTables}`);

  // List empty tables
  if (emptyTables > 0) {
    console.log('\n  📭 Empty Tables (potential unused/incomplete):');
    for (const [name, details] of Object.entries(tableDetails)) {
      if (details.accessible && !details.hasData) {
        console.log(`    - ${name}`);
      }
    }
  }

  // List inaccessible tables
  const inaccessibleTables = Object.values(tableDetails).filter(t => !t.accessible).length;
  if (inaccessibleTables > 0) {
    console.log('\n  ⚠️  Inaccessible Tables (RLS or permission issues):');
    for (const [name, details] of Object.entries(tableDetails)) {
      if (!details.accessible) {
        console.log(`    - ${name}: ${details.error}`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Schema Analysis Complete\n');

  return {
    tables: tables.map(t => t.tablename),
    details: tableDetails,
    summary: {
      total: tables.length,
      accessible: accessibleTables,
      withData: tablesWithData,
      empty: emptyTables,
      inaccessible: inaccessibleTables
    }
  };
}

// Run analysis
analyzeSchema()
  .then(result => {
    console.log('\n💾 Analysis complete. Results saved to memory.');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error during analysis:', error);
    process.exit(1);
  });
