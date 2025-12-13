# Database Migration Guide

## Overview

This guide explains how to apply the 7 critical database migrations created from the comprehensive schema analysis. These migrations fix security vulnerabilities, improve performance, and ensure data integrity.

**Generated**: 2025-12-13
**Analysis Report**: See `DATABASE_SCHEMA_ANALYSIS_REPORT.md`
**Total Migrations**: 7 (030-036)

---

## Executive Summary

### What These Migrations Fix

| Priority | Issue | Migration | Impact |
|----------|-------|-----------|--------|
| **CRITICAL** | Missing RLS on sensitive tables | 030 | Prevents privacy breaches |
| **CRITICAL** | Missing FK indexes (20+) | 031 | 10-100x query performance |
| **HIGH** | Missing unique constraints | 032 | Prevents duplicate data |
| **HIGH** | Nullable required columns | 033 | Prevents null pointer errors |
| **MEDIUM** | Duplicate/redundant tables | 034 | Reduces maintenance |
| **MEDIUM** | Missing recruiting tables | 035 | Feature completeness |
| **LOW** | Column naming inconsistencies | 036 | Code quality |

### Estimated Impact

- **Security**: Fixes 2 critical vulnerabilities
- **Performance**: 10-100x faster queries on large datasets
- **Data Integrity**: Prevents duplicate and invalid records
- **Features**: Adds 5 essential recruiting platform tables

---

## Prerequisites

Before applying migrations:

1. **Backup your database** (critical!)
2. **Review each migration file** - understand what it does
3. **Test in development environment first**
4. **Schedule downtime** for migrations 032-034 (they modify data)

### How to Backup

```bash
# Using Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# Or from Supabase Dashboard:
# Dashboard → Database → Backups → Create backup
```

---

## Migration Order (MUST FOLLOW)

Apply migrations **in this exact order**:

```
030 → 031 → 032 → 033 → 034 → 035 → 036
 ↓     ↓     ↓     ↓     ↓     ↓     ↓
RLS  Index  Uniq  NotN  Cons  New  Std
```

**Why order matters**:
- 030 must run first (security critical)
- 031 improves performance for subsequent migrations
- 032-033 require data cleanup (run after indexes)
- 034 consolidates tables (needs constraints first)
- 035 adds new tables (needs clean schema)
- 036 standardizes (should be last)

---

## Migration Details

### 030_critical_rls_policies.sql

**Purpose**: Enable Row Level Security on 11 sensitive tables

**Priority**: 🔴 CRITICAL - Run immediately

**What it does**:
- Enables RLS on: `coach_notes`, `recruiting_pipeline`, `player_comparison`, `email_sequences`, `recruiting_analytics`, `player_settings`, `recruiting_timeline`, `bulk_actions`, `export_functionality`, `recruiting_templates`, `player_comparison_tool`
- Creates policies for coach/player ownership

**Safe to run**: ✅ YES - Only adds security, doesn't modify data

**How to apply**:
```bash
# Using Supabase CLI
supabase db push supabase/migrations/030_critical_rls_policies.sql

# Or in Supabase SQL Editor:
# Copy/paste file contents and execute
```

**Verification**:
```sql
-- Run this query to verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'coach_notes', 'recruiting_pipeline', 'player_comparison',
    'email_sequences', 'recruiting_analytics', 'player_settings'
  );
-- Expected: rowsecurity = true for all
```

---

### 031_add_missing_fk_indexes.sql

**Purpose**: Add 60+ indexes to foreign keys and common queries

**Priority**: 🔴 CRITICAL - Run after 030

**What it does**:
- Adds indexes to all foreign key columns
- Adds composite indexes for common query patterns
- Adds full-text search index on player names

**Safe to run**: ✅ YES - Indexes are non-destructive

**Performance impact**:
- 10-100x faster JOIN operations
- Dramatically improves dashboard load times
- Speeds up recruiting queries

**How to apply**:
```bash
supabase db push supabase/migrations/031_add_missing_fk_indexes.sql
```

**Verification**:
```sql
-- Verify indexes were created
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
-- Expected: 60+ indexes
```

**Note**: Index creation may take 1-5 minutes on large tables.

---

### 032_add_unique_constraints.sql

**Purpose**: Prevent duplicate records

**Priority**: 🟡 HIGH - Run after indexes (031)

**What it does**:
- Adds unique constraint on `players.user_id`
- Adds unique constraint on `coaches.user_id`
- Adds composite unique constraints on join tables

**⚠️ REQUIRES DATA CLEANUP FIRST**:
```sql
-- RUN THIS FIRST to check for duplicates
SELECT user_id, COUNT(*) as count
FROM players
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1;

SELECT user_id, COUNT(*) as count
FROM coaches
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1;
```

**If duplicates exist**:
1. Review duplicate records manually
2. Keep the most recent record
3. Delete or merge older records
4. Then run migration

**How to apply**:
```bash
# Only after confirming no duplicates!
supabase db push supabase/migrations/032_add_unique_constraints.sql
```

**Verification**:
```sql
-- Verify constraints were created
SELECT
  conrelid::regclass AS table_name,
  conname AS constraint_name
FROM pg_constraint
WHERE contype = 'u'
  AND connamespace = 'public'::regnamespace
  AND conname LIKE '%_unique'
ORDER BY table_name;
-- Expected: 11+ unique constraints
```

---

### 033_add_not_null_constraints.sql

**Purpose**: Make required columns non-nullable

**Priority**: 🟡 HIGH - Run after 032

**What it does**:
- Makes `players.grad_year` NOT NULL (sets default 2099 for NULL)
- Makes `players.primary_position` NOT NULL (sets default 'Unknown')
- Makes `coaches.coach_type` NOT NULL (sets default 'travel')
- Makes `teams.name` NOT NULL
- Makes `messages.body` NOT NULL

**⚠️ MODIFIES EXISTING DATA**:
```sql
-- RUN THIS FIRST to check for NULLs
SELECT
  COUNT(*) FILTER (WHERE grad_year IS NULL) as null_grad_year,
  COUNT(*) FILTER (WHERE primary_position IS NULL) as null_position
FROM players;

SELECT
  COUNT(*) FILTER (WHERE coach_type IS NULL) as null_coach_type
FROM coaches;
```

**Safe to run**: ⚠️ MOSTLY - Sets reasonable defaults for NULL values

**How to apply**:
```bash
# Review defaults in migration file first!
supabase db push supabase/migrations/033_add_not_null_constraints.sql
```

**Post-migration cleanup**:
- Review records with default values (2099, 'Unknown', etc.)
- Update with correct data where possible

---

### 034_consolidate_duplicate_tables.sql

**Purpose**: Merge redundant tables

**Priority**: 🟠 MEDIUM - Run after 033

**What it does**:
- Migrates `recruits` → `recruit_watchlist`
- Consolidates event tables
- Reviews duplicate tables for consolidation

**⚠️ REQUIRES MANUAL REVIEW**:
This migration is **semi-automated**. It includes:
1. Data migration queries
2. Commented-out DROP TABLE statements

**Steps to apply**:
1. Review the migration file
2. Verify data migration worked
3. Uncomment DROP TABLE statements
4. Run migration

**How to apply**:
```bash
# Run migration (data migration only)
supabase db push supabase/migrations/034_consolidate_duplicate_tables.sql

# After verification, edit file to uncomment DROP statements
# Then run again to drop old tables
```

**Verification**:
```sql
-- Check data was migrated
SELECT COUNT(*) FROM recruit_watchlist;
SELECT COUNT(*) FROM camp_events WHERE event_type = 'recruitment';

-- Verify old tables are empty
SELECT COUNT(*) FROM recruits;  -- Should be 0
```

---

### 035_add_missing_tables.sql

**Purpose**: Add essential recruiting platform tables

**Priority**: 🟠 MEDIUM - Run after 034

**What it does**:
Creates 5 new tables:
1. **scholarship_offers** - Track scholarship offers to players
2. **campus_visits** - Track official/unofficial visits
3. **contact_log** - NCAA compliance tracking
4. **player_documents** - Document metadata (transcripts, etc.)
5. **eligibility_tracking** - Academic/athletic eligibility

**Safe to run**: ✅ YES - Only creates new tables

**How to apply**:
```bash
supabase db push supabase/migrations/035_add_missing_tables.sql
```

**Verification**:
```sql
-- Verify tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'scholarship_offers', 'campus_visits', 'contact_log',
    'player_documents', 'eligibility_tracking'
  )
ORDER BY table_name;
-- Expected: 5 tables
```

**Next steps after migration**:
1. Update application code to use new tables
2. Create UI for scholarship offers
3. Implement contact log for NCAA compliance
4. Add campus visit scheduling

---

### 036_standardize_column_names.sql

**Purpose**: Fix naming inconsistencies

**Priority**: 🟢 LOW - Run last

**What it does**:
- Fixes `team_media` URL column duplication
- Ensures all tables have `created_at`/`updated_at`
- Adds `updated_at` triggers
- Standardizes boolean defaults
- Converts JSON → JSONB

**Safe to run**: ⚠️ MOSTLY - Renames some columns

**⚠️ UPDATE APPLICATION CODE**:
If you reference these columns in your app:
- `team_media.url` → `team_media.media_url`
- Any `creation_date` → `created_at`
- Any `modification_date` → `updated_at`

**How to apply**:
```bash
# Review column renames in file first!
supabase db push supabase/migrations/036_standardize_column_names.sql
```

**Verification**:
```sql
-- Check timestamp standardization
SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('created_at', 'updated_at')
ORDER BY table_name;
-- Expected: All tables have both columns

-- Verify updated_at triggers
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgname LIKE 'set_updated_at%'
ORDER BY tgrelid::regclass::text;
-- Expected: Trigger for each table with updated_at
```

---

## Application Guide: All Migrations at Once

If your database is new or in development, you can apply all migrations together:

```bash
# Option 1: Using Supabase CLI (recommended)
cd /home/user/Helm-Sports-Labs
supabase db reset  # Resets database and applies all migrations in order

# Option 2: Manual application
for migration in supabase/migrations/03{0..6}*.sql; do
  echo "Applying $migration..."
  supabase db push "$migration"
done
```

**⚠️ For production databases**:
- Apply migrations **one at a time**
- Verify each migration before proceeding
- Monitor performance after each migration
- Have rollback plan ready

---

## Rollback Procedures

If a migration causes issues:

### Immediate Rollback

```bash
# Restore from backup
supabase db restore backup_YYYYMMDD_HHMMSS.sql
```

### Selective Rollback

Each migration includes verification queries. If a migration fails:

1. **030 (RLS)**: Disable RLS temporarily
   ```sql
   ALTER TABLE coach_notes DISABLE ROW LEVEL SECURITY;
   -- Repeat for other tables
   ```

2. **031 (Indexes)**: Drop problematic indexes
   ```sql
   DROP INDEX IF EXISTS idx_recruit_watchlist_coach_id;
   -- Repeat as needed
   ```

3. **032 (Unique Constraints)**: Drop constraints
   ```sql
   ALTER TABLE players DROP CONSTRAINT IF EXISTS players_user_id_unique;
   ```

4. **033 (NOT NULL)**: Allow NULLs again
   ```sql
   ALTER TABLE players ALTER COLUMN grad_year DROP NOT NULL;
   ```

5. **034 (Consolidation)**: Restore dropped tables from backup

6. **035 (New Tables)**: Drop new tables
   ```sql
   DROP TABLE IF EXISTS scholarship_offers CASCADE;
   -- Repeat for other new tables
   ```

7. **036 (Standardization)**: Rename columns back
   ```sql
   ALTER TABLE team_media RENAME COLUMN media_url TO url;
   ```

---

## Testing Checklist

After applying all migrations:

### Functional Tests

- [ ] User registration/login works
- [ ] Player profiles load correctly
- [ ] Coach dashboards display data
- [ ] Recruiting watchlist functions
- [ ] Messaging system works
- [ ] Camp registration works
- [ ] Team rosters display

### Performance Tests

```sql
-- Test query performance (should be <50ms)
EXPLAIN ANALYZE
SELECT p.*, rw.status
FROM players p
JOIN recruit_watchlist rw ON rw.player_id = p.id
WHERE rw.coach_id = 'some-coach-id'
  AND p.grad_year = 2025;
```

### Security Tests

```sql
-- Verify RLS is enforced
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub":"some-user-id"}';

-- Try to access another user's data (should return 0 rows)
SELECT * FROM coach_notes WHERE coach_id != 'your-coach-id';
```

---

## Monitoring Post-Migration

After migrations are live, monitor:

1. **Query Performance**
   ```sql
   -- Top 10 slowest queries
   SELECT
     query,
     calls,
     total_time,
     mean_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

2. **Database Size**
   ```sql
   SELECT
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

3. **Index Usage**
   ```sql
   -- Unused indexes (consider dropping)
   SELECT
     schemaname,
     tablename,
     indexname,
     idx_scan
   FROM pg_stat_user_indexes
   WHERE idx_scan = 0
     AND indexname LIKE 'idx_%'
   ORDER BY tablename;
   ```

---

## Troubleshooting

### Migration 030 Fails: "policy already exists"

**Cause**: Policies were already created in a previous run

**Fix**: Safe to ignore - policies are already in place

### Migration 031 Takes Too Long

**Cause**: Large tables (>100k rows) take time to index

**Fix**: Run during low-traffic period, indexes are created concurrently

### Migration 032 Fails: "duplicate key value violates unique constraint"

**Cause**: Duplicate records exist

**Fix**: Run pre-flight check queries, remove duplicates first

### Migration 033 Fails: "column contains null values"

**Cause**: Migration didn't set defaults for all NULL values

**Fix**: Manually set defaults before adding NOT NULL constraint

### Application Errors After 036

**Cause**: Code references old column names

**Fix**: Update application code to use standardized names

---

## Support

If you encounter issues:

1. Review the specific migration file
2. Check the `DATABASE_SCHEMA_ANALYSIS_REPORT.md` for context
3. Run verification queries from migration files
4. Restore from backup if necessary

---

## Summary

| Migration | Purpose | Priority | Safe | Est. Time |
|-----------|---------|----------|------|-----------|
| 030 | RLS policies | CRITICAL | ✅ Yes | 2 min |
| 031 | FK indexes | CRITICAL | ✅ Yes | 5 min |
| 032 | Unique constraints | HIGH | ⚠️ Check duplicates | 2 min |
| 033 | NOT NULL constraints | HIGH | ⚠️ Sets defaults | 2 min |
| 034 | Consolidate tables | MEDIUM | ⚠️ Manual review | 10 min |
| 035 | Add new tables | MEDIUM | ✅ Yes | 3 min |
| 036 | Standardize names | LOW | ⚠️ Update code | 5 min |

**Total estimated time**: 30-45 minutes (plus testing)

**Critical migrations (run first)**: 030, 031
**Data-modifying migrations**: 032, 033, 034
**Optional migrations**: 035, 036

---

**Next Steps**:
1. Backup database
2. Apply 030 (RLS) immediately
3. Apply 031 (Indexes) immediately
4. Schedule 032-036 for maintenance window
5. Test thoroughly
6. Monitor performance
