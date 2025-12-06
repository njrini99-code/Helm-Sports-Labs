# Database Migration Improvements

This document outlines all the security and performance improvements made to the initial schema migration.

## ✅ Improvements Applied

### 1. **Wrapped `auth.uid()` in Subselects**
   - **Before**: `auth.uid() = user_id`
   - **After**: `(SELECT auth.uid()) = user_id`
   - **Why**: Prevents planner/caching issues and follows Supabase best practices

### 2. **Added `WITH CHECK` Clauses to All UPDATE Policies**
   - **Before**: Only `USING` clause on UPDATE policies
   - **After**: Both `USING` and `WITH CHECK` clauses
   - **Why**: Prevents users from updating rows to disallowed values

### 3. **Restricted Public Access Policies**
   - **Before**: `USING (true)` allowed all users (including unauthenticated)
   - **After**: `TO authenticated USING (...)` restricts to authenticated users only
   - **Why**: Better security - only authenticated users can access data

### 4. **Improved Coach Access to Players**
   - **Before**: `USING (true)` - any authenticated user could view all players
   - **After**: `USING (EXISTS (SELECT 1 FROM coaches c WHERE c.user_id = (SELECT auth.uid())))`
   - **Why**: Only authenticated coaches can view players, not all authenticated users

### 5. **Auto-Update `updated_at` Triggers**
   - **Added**: `set_updated_at()` function and triggers on all tables with `updated_at`
   - **Why**: Automatically updates timestamps on row changes

### 6. **Function Ownership & Security**
   - **Added**: `ALTER FUNCTION ... OWNER TO postgres` for security definer functions
   - **Why**: Ensures functions have proper permissions to bypass RLS when needed

### 7. **Consistency Improvements**
   - Made `is_public` NOT NULL in `camp_events`
   - Made `created_at` NOT NULL in `teams` and `team_memberships`
   - Made `joined_at` NOT NULL in `team_memberships`

### 8. **Additional Indexes**
   - Added indexes on `camp_events.event_date`
   - Added indexes on `recruits.stage`
   - Added indexes on `teams.coach_id`
   - Added indexes on `team_memberships` foreign keys
   - **Why**: Improves query performance for common lookups

### 9. **Extension Check**
   - Added `CREATE EXTENSION IF NOT EXISTS "pgcrypto"` at the top
   - **Why**: Ensures `gen_random_uuid()` is available

## 🔒 Security Enhancements

1. **All policies now use wrapped `auth.uid()`** - Better query planning
2. **All UPDATE policies have `WITH CHECK`** - Prevents privilege escalation
3. **Public access restricted to authenticated users** - No anonymous access
4. **Coach access verified via EXISTS check** - Only actual coaches can view players
5. **Function ownership set to postgres** - Proper security context

## 📊 Performance Improvements

1. **Additional indexes** on frequently queried columns
2. **Wrapped `auth.uid()`** improves query plan stability
3. **EXISTS checks** are optimized with proper indexes

## 🚀 How to Apply

1. If you've already run the old migration:
   - You can run this improved version - it uses `DROP POLICY IF EXISTS` and `CREATE OR REPLACE FUNCTION` to safely update
   - The triggers will be recreated automatically

2. If this is a fresh database:
   - Just run the entire migration file as-is

## ✅ Verification Checklist

After running the migration, verify:

- [ ] All tables created (check Table Editor)
- [ ] RLS enabled on all tables (check Table Editor → RLS column)
- [ ] Policies created (check Authentication → Policies)
- [ ] Functions exist: `handle_new_user()`, `get_state_counts()`, `set_updated_at()`
- [ ] Triggers exist: `on_auth_user_created`, `set_updated_at_*` triggers
- [ ] Test signup creates profile/player/coach records automatically
- [ ] Test that `updated_at` auto-updates on row changes

## 📝 Notes

- The migration is idempotent (safe to run multiple times)
- Uses `IF NOT EXISTS` and `DROP IF EXISTS` for safety
- All destructive operations are clearly marked
- Functions use `SECURITY DEFINER` with proper ownership

