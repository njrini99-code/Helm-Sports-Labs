/**
 * COMPREHENSIVE SUPABASE DATABASE SCHEMA ANALYSIS
 *
 * This script performs an exhaustive analysis of your Supabase database:
 * 1. Schema Overview - All tables, columns, types, constraints
 * 2. Foreign Key Relationships
 * 3. Indexes and Performance
 * 4. Row Level Security (RLS) Policies
 * 5. Data Integrity Issues
 * 6. Completeness Audit
 * 7. Recommended Improvements
 *
 * Usage:
 *   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.blspsttgyxuoqhskpmrg.supabase.co:5432/postgres" node scripts/comprehensive-schema-analysis.js
 *
 * Or add to .env.local and run:
 *   node scripts/comprehensive-schema-analysis.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.log('\n💡 Add to .env.local or pass as environment variable:');
  console.log('DATABASE_URL=postgresql://postgres:[PASSWORD]@db.blspsttgyxuoqhskpmrg.supabase.co:5432/postgres\n');
  process.exit(1);
}

// Validate password
const match = databaseUrl.match(/postgresql:\/\/postgres:([^@]+)@/);
const password = match ? match[1] : null;

if (!password || password === '[YOUR_PASSWORD]' || password === '[PASSWORD]') {
  console.error('❌ Please replace [PASSWORD] with your actual database password\n');
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

// Analysis Results Storage
const analysis = {
  timestamp: new Date().toISOString(),
  tables: [],
  foreignKeys: [],
  indexes: [],
  rlsPolicies: [],
  issues: {
    critical: [],
    high: [],
    medium: [],
    low: []
  },
  recommendations: []
};

// Helper Functions
function addIssue(severity, category, table, description, suggestion) {
  const issue = { category, table, description, suggestion };
  analysis.issues[severity].push(issue);
}

function addRecommendation(priority, description, sql) {
  analysis.recommendations.push({ priority, description, sql });
}

// Main Analysis Functions

async function analyzeTableStructure() {
  console.log('\n' + '='.repeat(90));
  console.log('📊 SECTION 1: SCHEMA OVERVIEW');
  console.log('='.repeat(90) + '\n');

  // Get all tables with column details
  const tablesQuery = `
    SELECT
      t.table_name,
      pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name)::regclass)) as size,
      obj_description(quote_ident(t.table_name)::regclass) as description,
      (SELECT COUNT(*) FROM information_schema.columns c
       WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name;
  `;

  const tablesResult = await client.query(tablesQuery);

  console.log(`Found ${tablesResult.rows.length} tables:\n`);

  for (const table of tablesResult.rows) {
    console.log(`\n📋 Table: ${table.table_name}`);
    console.log(`   Size: ${table.size}`);
    console.log(`   Columns: ${table.column_count}`);

    // Get detailed column information
    const columnsQuery = `
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default,
        CASE
          WHEN column_name IN (
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY'
          ) THEN 'PRIMARY KEY'
          WHEN column_name IN (
            SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = $1 AND tc.constraint_type = 'UNIQUE'
          ) THEN 'UNIQUE'
          ELSE NULL
        END as constraint_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `;

    const columnsResult = await client.query(columnsQuery, [table.table_name]);

    console.log(`   \n   Columns:`);
    for (const col of columnsResult.rows) {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const constraint = col.constraint_type ? ` [${col.constraint_type}]` : '';
      const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';

      console.log(`     - ${col.column_name}: ${col.data_type}${maxLength} ${nullable}${constraint}${defaultVal}`);
    }

    // Get row count
    try {
      const countResult = await client.query(`SELECT COUNT(*) as count FROM "${table.table_name}"`);
      console.log(`   \n   📊 Rows: ${countResult.rows[0].count}`);

      if (countResult.rows[0].count === '0') {
        addIssue('low', 'Empty Table', table.table_name,
          'Table exists but contains no data',
          'Verify if this table is needed or should be populated');
      }
    } catch (e) {
      console.log(`   \n   ⚠️  Could not count rows: ${e.message}`);
    }

    // Store table info
    analysis.tables.push({
      name: table.table_name,
      size: table.size,
      columns: columnsResult.rows,
      rowCount: null
    });
  }
}

async function analyzeForeignKeys() {
  console.log('\n\n' + '='.repeat(90));
  console.log('🔗 SECTION 2: FOREIGN KEY RELATIONSHIPS');
  console.log('='.repeat(90) + '\n');

  const fkQuery = `
    SELECT
      tc.table_name as from_table,
      kcu.column_name as from_column,
      ccu.table_name AS to_table,
      ccu.column_name AS to_column,
      tc.constraint_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name;
  `;

  const fkResult = await client.query(fkQuery);

  console.log(`Found ${fkResult.rows.length} foreign key relationships:\n`);

  if (fkResult.rows.length === 0) {
    console.log('⚠️  WARNING: No foreign key constraints found!');
    addIssue('high', 'Missing Foreign Keys', 'ALL TABLES',
      'No foreign key constraints defined in the schema',
      'Add foreign key constraints to enforce referential integrity');
  } else {
    for (const fk of fkResult.rows) {
      console.log(`  ${fk.from_table}.${fk.from_column} → ${fk.to_table}.${fk.to_column}`);
      analysis.foreignKeys.push(fk);

      // Check if foreign key column is indexed
      const indexCheckQuery = `
        SELECT COUNT(*) as count
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = $1
          AND indexdef LIKE '%' || $2 || '%';
      `;

      const indexCheck = await client.query(indexCheckQuery, [fk.from_table, fk.from_column]);

      if (indexCheck.rows[0].count === '0') {
        addIssue('medium', 'Missing FK Index', fk.from_table,
          `Foreign key ${fk.from_column} is not indexed`,
          `CREATE INDEX idx_${fk.from_table}_${fk.from_column} ON ${fk.from_table}(${fk.from_column});`);
      }
    }
  }
}

async function analyzeIndexes() {
  console.log('\n\n' + '='.repeat(90));
  console.log('🔍 SECTION 3: INDEXES & PERFORMANCE');
  console.log('='.repeat(90) + '\n');

  const indexQuery = `
    SELECT
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
  `;

  const indexResult = await client.query(indexQuery);

  console.log(`Found ${indexResult.rows.length} indexes:\n`);

  const indexesByTable = {};
  for (const idx of indexResult.rows) {
    if (!indexesByTable[idx.tablename]) {
      indexesByTable[idx.tablename] = [];
    }
    indexesByTable[idx.tablename].push(idx);
  }

  for (const [tableName, indexes] of Object.entries(indexesByTable)) {
    console.log(`\n📊 ${tableName} (${indexes.length} indexes):`);
    for (const idx of indexes) {
      console.log(`   - ${idx.indexname}`);
      console.log(`     ${idx.indexdef}`);
    }

    analysis.indexes.push(...indexes);
  }

  // Check for tables without indexes (except primary keys)
  for (const table of analysis.tables) {
    const nonPkIndexes = indexesByTable[table.name]?.filter(idx =>
      !idx.indexname.includes('_pkey')
    ) || [];

    if (nonPkIndexes.length === 0) {
      addIssue('medium', 'No Indexes', table.name,
        'Table has no indexes besides primary key',
        'Consider adding indexes on frequently queried columns');
    }
  }
}

async function analyzeRLS() {
  console.log('\n\n' + '='.repeat(90));
  console.log('🔒 SECTION 4: ROW LEVEL SECURITY (RLS)');
  console.log('='.repeat(90) + '\n');

  // Check RLS enabled status
  const rlsStatusQuery = `
    SELECT
      tablename,
      rowsecurity as rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `;

  const rlsStatusResult = await client.query(rlsStatusQuery);

  // Get policies
  const policiesQuery = `
    SELECT
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `;

  const policiesResult = await client.query(policiesQuery);

  console.log('RLS Status by Table:\n');

  for (const table of rlsStatusResult.rows) {
    const policies = policiesResult.rows.filter(p => p.tablename === table.tablename);
    const rlsStatus = table.rls_enabled ? '✓ ENABLED' : '✗ DISABLED';

    console.log(`\n  ${table.tablename}: ${rlsStatus}`);

    if (table.rls_enabled && policies.length === 0) {
      console.log(`    ⚠️  RLS enabled but NO policies defined!`);
      addIssue('critical', 'RLS Misconfigured', table.tablename,
        'RLS is enabled but no policies are defined - table is inaccessible',
        `Add RLS policies or disable RLS for this table`);
    } else if (!table.rls_enabled) {
      addIssue('high', 'RLS Disabled', table.tablename,
        'Row Level Security is disabled - table is publicly accessible',
        `Enable RLS: ALTER TABLE ${table.tablename} ENABLE ROW LEVEL SECURITY;`);
    } else {
      console.log(`    Policies (${policies.length}):`);
      for (const policy of policies) {
        console.log(`      - ${policy.policyname} [${policy.cmd}]`);
        console.log(`        Roles: ${policy.roles.join(', ')}`);

        analysis.rlsPolicies.push(policy);
      }
    }
  }
}

async function analyzeDataIntegrity() {
  console.log('\n\n' + '='.repeat(90));
  console.log('🔍 SECTION 5: DATA INTEGRITY ANALYSIS');
  console.log('='.repeat(90) + '\n');

  // Check for orphaned records in common relationship patterns
  const orphanChecks = [
    {
      name: 'Players without users',
      query: `SELECT COUNT(*) FROM players WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM auth.users)`,
      table: 'players'
    },
    {
      name: 'Coaches without users',
      query: `SELECT COUNT(*) FROM coaches WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM auth.users)`,
      table: 'coaches'
    }
  ];

  console.log('Checking for orphaned records:\n');

  for (const check of orphanChecks) {
    try {
      const result = await client.query(check.query);
      const count = parseInt(result.rows[0].count);

      if (count > 0) {
        console.log(`  ⚠️  ${check.name}: ${count} orphaned records`);
        addIssue('high', 'Orphaned Records', check.table,
          `Found ${count} records referencing non-existent users`,
          'Clean up orphaned records or add proper foreign key constraints');
      } else {
        console.log(`  ✓ ${check.name}: OK`);
      }
    } catch (e) {
      console.log(`  ⚠️  ${check.name}: Could not check (${e.message})`);
    }
  }

  // Check for nullable columns that probably shouldn't be
  console.log('\n\nChecking for potentially problematic nullable columns:\n');

  const nullableChecks = [
    { table: 'players', column: 'grad_year', reason: 'Graduation year is core player data' },
    { table: 'coaches', column: 'school_name', reason: 'School affiliation is essential for coaches' },
    { table: 'teams', column: 'name', reason: 'Team name is required' }
  ];

  for (const check of nullableChecks) {
    try {
      const query = `
        SELECT is_nullable
        FROM information_schema.columns
        WHERE table_name = $1 AND column_name = $2 AND table_schema = 'public'
      `;
      const result = await client.query(query, [check.table, check.column]);

      if (result.rows.length > 0 && result.rows[0].is_nullable === 'YES') {
        console.log(`  ⚠️  ${check.table}.${check.column} is nullable`);
        console.log(`      Reason: ${check.reason}`);

        addIssue('medium', 'Nullable Column', check.table,
          `${check.column} is nullable but should probably be required`,
          `ALTER TABLE ${check.table} ALTER COLUMN ${check.column} SET NOT NULL;`);
      }
    } catch (e) {
      // Table or column doesn't exist, skip
    }
  }
}

async function generateCompleteSummary() {
  console.log('\n\n' + '='.repeat(90));
  console.log('📋 SECTION 6: COMPLETENESS AUDIT');
  console.log('='.repeat(90) + '\n');

  // Expected tables for a recruiting platform
  const expectedTables = [
    'players', 'coaches', 'teams', 'colleges', 'users',
    'player_stats', 'player_videos', 'player_metrics',
    'player_achievements', 'recruitment_events', 'messages',
    'recruiting_interests', 'college_interests', 'watchlists',
    'notifications', 'camps', 'schedules', 'team_rosters'
  ];

  const existingTables = analysis.tables.map(t => t.name);
  const missingTables = expectedTables.filter(t => !existingTables.includes(t));

  if (missingTables.length > 0) {
    console.log('⚠️  Potentially Missing Tables:\n');
    for (const table of missingTables) {
      console.log(`  - ${table}`);
    }
    console.log('\nNote: These may be intentionally not implemented yet.\n');
  }

  // Check for incomplete table structures
  console.log('\nChecking for incomplete table structures:\n');

  const tableCompleteness = {
    'players': ['id', 'user_id', 'first_name', 'last_name', 'email', 'grad_year', 'primary_position'],
    'coaches': ['id', 'user_id', 'full_name', 'email', 'school_name'],
    'teams': ['id', 'name', 'owner_id', 'sport'],
  };

  for (const [tableName, expectedCols] of Object.entries(tableCompleteness)) {
    const table = analysis.tables.find(t => t.name === tableName);

    if (table) {
      const existingCols = table.columns.map(c => c.column_name);
      const missingCols = expectedCols.filter(c => !existingCols.includes(c));

      if (missingCols.length > 0) {
        console.log(`  ⚠️  ${tableName} missing expected columns: ${missingCols.join(', ')}`);
        addIssue('medium', 'Incomplete Table', tableName,
          `Missing expected columns: ${missingCols.join(', ')}`,
          'Review table schema and add missing columns if needed');
      } else {
        console.log(`  ✓ ${tableName}: All expected columns present`);
      }
    }
  }
}

async function generateRecommendations() {
  console.log('\n\n' + '='.repeat(90));
  console.log('💡 SECTION 7: RECOMMENDATIONS');
  console.log('='.repeat(90) + '\n');

  // Generate specific recommendations based on issues found
  const criticalCount = analysis.issues.critical.length;
  const highCount = analysis.issues.high.length;
  const mediumCount = analysis.issues.medium.length;
  const lowCount = analysis.issues.low.length;

  console.log(`Issues Found:`);
  console.log(`  🔴 Critical: ${criticalCount}`);
  console.log(`  🟠 High: ${highCount}`);
  console.log(`  🟡 Medium: ${mediumCount}`);
  console.log(`  🟢 Low: ${lowCount}\n`);

  if (criticalCount > 0) {
    console.log('\n🔴 CRITICAL ISSUES (Fix Immediately):\n');
    for (const issue of analysis.issues.critical) {
      console.log(`  Table: ${issue.table}`);
      console.log(`  Issue: ${issue.description}`);
      console.log(`  Fix: ${issue.suggestion}\n`);
    }
  }

  if (highCount > 0) {
    console.log('\n🟠 HIGH PRIORITY ISSUES:\n');
    for (const issue of analysis.issues.high) {
      console.log(`  Table: ${issue.table}`);
      console.log(`  Issue: ${issue.description}`);
      console.log(`  Fix: ${issue.suggestion}\n`);
    }
  }

  if (mediumCount > 0) {
    console.log('\n🟡 MEDIUM PRIORITY ISSUES:\n');
    for (const issue of analysis.issues.medium.slice(0, 10)) {  // Limit to first 10
      console.log(`  Table: ${issue.table}`);
      console.log(`  Issue: ${issue.description}`);
      console.log(`  Fix: ${issue.suggestion}\n`);
    }

    if (analysis.issues.medium.length > 10) {
      console.log(`  ... and ${analysis.issues.medium.length - 10} more medium priority issues\n`);
    }
  }
}

async function saveReport() {
  const reportPath = path.join(__dirname, '..', 'DATABASE_SCHEMA_ANALYSIS_REPORT.json');
  const mdReportPath = path.join(__dirname, '..', 'DATABASE_SCHEMA_ANALYSIS_REPORT.md');

  // Save JSON report
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  console.log(`\n✅ Full JSON report saved to: DATABASE_SCHEMA_ANALYSIS_REPORT.json`);

  // Generate Markdown report
  let mdReport = `# Database Schema Analysis Report\n\n`;
  mdReport += `**Generated**: ${analysis.timestamp}\n\n`;
  mdReport += `## Summary\n\n`;
  mdReport += `- **Total Tables**: ${analysis.tables.length}\n`;
  mdReport += `- **Foreign Keys**: ${analysis.foreignKeys.length}\n`;
  mdReport += `- **Indexes**: ${analysis.indexes.length}\n`;
  mdReport += `- **RLS Policies**: ${analysis.rlsPolicies.length}\n\n`;
  mdReport += `### Issues by Severity\n\n`;
  mdReport += `- 🔴 **Critical**: ${analysis.issues.critical.length}\n`;
  mdReport += `- 🟠 **High**: ${analysis.issues.high.length}\n`;
  mdReport += `- 🟡 **Medium**: ${analysis.issues.medium.length}\n`;
  mdReport += `- 🟢 **Low**: ${analysis.issues.low.length}\n\n`;

  // Add detailed sections...
  mdReport += `## Tables Overview\n\n`;
  for (const table of analysis.tables) {
    mdReport += `### ${table.name}\n\n`;
    mdReport += `- **Size**: ${table.size}\n`;
    mdReport += `- **Columns**: ${table.columns.length}\n\n`;
  }

  fs.writeFileSync(mdReportPath, mdReport);
  console.log(`✅ Markdown report saved to: DATABASE_SCHEMA_ANALYSIS_REPORT.md\n`);
}

// Main Execution
async function runAnalysis() {
  console.log('\n🔍 COMPREHENSIVE DATABASE SCHEMA ANALYSIS');
  console.log('Starting analysis at ' + new Date().toISOString());

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    await analyzeTableStructure();
    await analyzeForeignKeys();
    await analyzeIndexes();
    await analyzeRLS();
    await analyzeDataIntegrity();
    await generateCompleteSummary();
    await generateRecommendations();
    await saveReport();

    console.log('\n' + '='.repeat(90));
    console.log('✅ ANALYSIS COMPLETE');
    console.log('='.repeat(90) + '\n');

  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runAnalysis();
