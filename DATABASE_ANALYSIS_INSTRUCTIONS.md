# Database Schema Analysis Instructions

## Overview

I've created a comprehensive database schema analysis script that will examine your entire Supabase database and generate a detailed report covering:

1. **Schema Overview** - All tables, columns, types, constraints
2. **Foreign Key Relationships** - Complete relationship mapping
3. **Indexes & Performance** - Index analysis and performance recommendations
4. **Row Level Security (RLS)** - Policy audit and security review
5. **Data Integrity** - Orphaned records, nullable columns, constraints
6. **Completeness Audit** - Missing tables, incomplete structures
7. **Recommendations** - Prioritized fixes with SQL migrations

## Prerequisites

You need your Supabase database connection string. Get it from:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Copy the **Connection string** (under "Connection string")
5. Make sure to replace `[YOUR-PASSWORD]` with your actual database password

The format should look like:
```
postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.blspsttgyxuoqhskpmrg.supabase.co:5432/postgres
```

## Running the Analysis

### Method 1: Using Environment Variable (Recommended)

Create a `.env.local` file in the project root:

```bash
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.blspsttgyxuoqhskpmrg.supabase.co:5432/postgres
```

Then run:

```bash
node scripts/comprehensive-schema-analysis.js
```

### Method 2: Inline Environment Variable

```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.blspsttgyxuoqhskpmrg.supabase.co:5432/postgres" node scripts/comprehensive-schema-analysis.js
```

## What the Script Does

The script will:

1. ✅ Connect to your Supabase PostgreSQL database
2. 📊 Analyze all tables and their structure
3. 🔗 Map all foreign key relationships
4. 🔍 Review all indexes and identify missing ones
5. 🔒 Audit Row Level Security policies
6. 🔍 Check for data integrity issues
7. 💡 Generate prioritized recommendations
8. 📄 Save detailed reports (JSON + Markdown)

## Output Files

After running, you'll get two report files:

1. **DATABASE_SCHEMA_ANALYSIS_REPORT.json** - Complete analysis data
2. **DATABASE_SCHEMA_ANALYSIS_REPORT.md** - Human-readable report

## Security Notes

⚠️ **IMPORTANT**:

- Never commit your `.env.local` file with real credentials
- The `.env.local` file is already in `.gitignore`
- Keep your database password secure
- This script only **reads** data - it doesn't modify anything

## Troubleshooting

### "Missing Supabase credentials"

Make sure your DATABASE_URL is properly set and contains the actual password, not `[YOUR-PASSWORD]`.

### "Connection timeout"

Check that:
- Your database is running
- Your IP is allowed in Supabase settings
- The connection string is correct

### "Permission denied"

Some tables may have strict RLS policies. The script will note these as inaccessible.

## What Happens Next

1. Run the script to generate the analysis
2. Review the console output for immediate insights
3. Check the generated reports for full details
4. Provide the reports to me (or share the output)
5. I'll create a prioritized action plan with specific SQL migrations

## Example Output

The script will display output like:

```
🔍 COMPREHENSIVE DATABASE SCHEMA ANALYSIS
================================================================================

📊 SECTION 1: SCHEMA OVERVIEW
--------------------------------------------------------------------------------

Found 25 tables:

📋 Table: players
   Size: 128 kB
   Columns: 15

   Columns:
     - id: uuid NOT NULL [PRIMARY KEY]
     - user_id: uuid NULL
     - first_name: character varying(255) NULL
     ...

📊 Rows: 142

[... and so on for all sections ...]
```

## Questions?

If you encounter any issues running the script, let me know and I can help troubleshoot or provide alternative analysis methods.
