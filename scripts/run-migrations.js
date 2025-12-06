/**
 * Run Database Migrations
 * 
 * This script runs all pending migrations against your Supabase database
 * 
 * Usage:
 *   node scripts/run-migrations.js
 * 
 * Requirements:
 *   - DATABASE_URL in .env.local
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get migration files
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📋 Found ${files.length} migration files:\n`);

    for (const file of files) {
      console.log(`  📄 Running: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      try {
        await client.query(sql);
        console.log(`  ✅ ${file} completed\n`);
      } catch (error) {
        // Some errors are expected (IF NOT EXISTS, etc.)
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.message.includes('IF NOT EXISTS')) {
          console.log(`  ⚠️  ${file} - Some objects already exist (this is OK)\n`);
        } else {
          console.error(`  ❌ ${file} failed:`, error.message);
          throw error;
        }
      }
    }

    console.log('✅ All migrations completed successfully!\n');
    
    // Verify tables
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`📊 Database now has ${tables.length} tables:`);
    tables.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.table_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();

