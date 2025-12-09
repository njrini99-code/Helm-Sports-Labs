# Database Verification Report
**Date:** $(date)
**Migration Applied:** 011_fix_database_alignment.sql

## Summary
Verified and fixed database structure alignment issues between the application code and database schema.

## Issues Found and Fixed

### 1. ✅ player_stats Table Structure Mismatch
**Problem:** 
- Migration 010 tried to create a new `player_stats` table structure with `team_id`, `game_id`, `stat_type`, `stats_data`, `verified`, etc.
- But the table already existed from migration 005 with a different structure (individual stat columns like `at_bats`, `hits`, etc.)
- Since `CREATE TABLE IF NOT EXISTS` was used, the new structure was never created
- API routes expected the new structure

**Fix:**
- Added missing columns to existing `player_stats` table:
  - `team_id` (uuid, references teams)
  - `game_id` (uuid, references team_schedule)
  - `stat_type` (text, CHECK constraint: 'hitting', 'pitching', 'fielding')
  - `stats_data` (jsonb, for flexible stat storage)
  - `verified` (boolean, default false)
  - `verified_by` (uuid, references coaches)
  - `verified_at` (timestamptz)
  - `uploaded_via` (text, CHECK constraint: 'manual', 'ai_upload', 'import')
- Created indexes on new columns for performance

### 2. ✅ Missing Columns in profiles Table
**Problem:**
- API routes reference `profiles.full_name` and `profiles.avatar_url`
- These columns didn't exist in the profiles table

**Fix:**
- Added `full_name` (text, nullable)
- Added `avatar_url` (text, nullable)

**Note:** These columns may need to be populated from `players` or `coaches` tables via triggers or application logic.

### 3. ✅ Incorrect RLS Policies
**Problem:**
- RLS policies were checking `teams.coach_id = auth.uid()::text`
- But `teams.coach_id` references `coaches.id`, not `coaches.user_id`
- Should check: `coaches.user_id = auth.uid()` where `coaches.id = teams.coach_id`

**Fix:**
- Updated all coach-related RLS policies to properly join through coaches table:
  ```sql
  EXISTS (
    SELECT 1 FROM teams 
    JOIN coaches ON coaches.id = teams.coach_id
    WHERE teams.id = [table].team_id 
    AND coaches.user_id = auth.uid()
  )
  ```
- Fixed policies for:
  - `team_invitations`
  - `parent_access`
  - `team_messages`
  - `player_stats`
  - `event_attendance`
  - `practice_plans`

### 4. ✅ Team Messages RLS Policy
**Problem:**
- Policy didn't allow coaches to view messages they sent
- Policy didn't properly check coach access

**Fix:**
- Updated policy to allow:
  - Sender can view their own messages (`sender_id = auth.uid()`)
  - Team members can view team messages
  - Coaches can view messages for their teams

### 5. ✅ Parent Access and Message Receipts RLS
**Problem:**
- Policies were using incorrect auth checks

**Fix:**
- Updated to use `parent_id = auth.uid()` (since parent_id references profiles.id which is auth.users.id)
- Updated message receipts to use `user_id = auth.uid()`

## Verified Structures

### Tables Created/Modified
✅ `team_invitations` - All columns and foreign keys correct
✅ `parent_access` - All columns and foreign keys correct
✅ `team_messages` - All columns and foreign keys correct
✅ `message_receipts` - All columns and foreign keys correct
✅ `event_attendance` - All columns, foreign keys, and unique constraint correct
✅ `practice_plans` - All columns and foreign keys correct
✅ `player_stats` - Now has both old structure (individual columns) and new structure (team-based columns)
✅ `profiles` - Added missing columns
✅ `team_schedule` - All columns correct
✅ `teams` - All new columns added correctly

### Foreign Key Relationships
✅ All foreign keys properly reference correct tables and columns
✅ Cascade behaviors are appropriate (CASCADE for dependent data, SET NULL for optional references)

### Indexes
✅ All necessary indexes created for:
- Foreign key columns
- Frequently queried columns (team_id, player_id, event_id, etc.)
- Status/type columns for filtering

### Constraints
✅ Unique constraints in place:
- `event_attendance(event_id, player_id)` - Prevents duplicate attendance records
- `message_receipts(message_id, user_id)` - Prevents duplicate receipts
- `parent_access(parent_id, player_id, team_id)` - Prevents duplicate access grants
- `team_invitations.invite_code` - Ensures unique invite codes

✅ Check constraints:
- `team_messages.message_type` - ('team', 'direct', 'parent', 'alert')
- `team_messages.priority` - ('normal', 'high')
- `event_attendance.status` - ('present', 'absent', 'excused', 'not_marked')
- `player_stats.stat_type` - ('hitting', 'pitching', 'fielding')
- `player_stats.uploaded_via` - ('manual', 'ai_upload', 'import')

## API Route Alignment

### ✅ `/api/teams/[teamId]/invite`
- Expects: `team_invitations` table
- Status: Aligned ✓

### ✅ `/api/teams/join/[code]`
- Expects: `team_invitations` table with `invite_code`, `teams` join
- Status: Aligned ✓

### ✅ `/api/teams/[teamId]/messages`
- Expects: `team_messages` with `sender_id` referencing profiles
- Expects: `message_receipts` table
- Expects: `profiles.full_name`, `profiles.avatar_url`
- Status: Aligned ✓ (profiles columns now exist)

### ✅ `/api/teams/[teamId]/stats`
- Expects: `player_stats` with `team_id`, `game_id`, `stat_type`, `stats_data`, `verified`, etc.
- Status: Aligned ✓ (all columns now exist)

### ✅ `/api/stats/[statId]/verify`
- Expects: `player_stats` with `verified`, `verified_by`, `verified_at`
- Status: Aligned ✓

### ✅ `/api/events/[eventId]/attendance`
- Expects: `event_attendance` with `event_id`, `player_id`, `status`, `marked_by`
- Expects: `team_schedule` table
- Status: Aligned ✓

### ✅ `/api/events/[eventId]/practice-plan`
- Expects: `practice_plans` table with `event_id`, `plan_content`, `created_by`
- Status: Aligned ✓

## Remaining Considerations

### 1. Profiles Data Population
The `profiles.full_name` and `profiles.avatar_url` columns are now available but may be empty. Consider:
- Creating triggers to sync from `players` or `coaches` tables
- Or updating API routes to join with `players`/`coaches` for name/avatar data

### 2. player_stats Dual Structure
The `player_stats` table now supports both:
- Legacy structure: Individual columns (`at_bats`, `hits`, etc.) for player dashboard
- New structure: Team-based columns (`team_id`, `game_id`, `stat_type`, `stats_data`) for coach dashboard

Both can coexist, but consider:
- Migrating existing data to new structure if needed
- Or maintaining both for backward compatibility

### 3. RLS Policy Testing
All RLS policies have been updated, but should be tested with:
- Coach users accessing their teams
- Player users accessing their team data
- Parent users accessing their children's data
- Unauthorized access attempts

## Next Steps

1. ✅ Database structure aligned
2. ⏳ Test API routes with actual data
3. ⏳ Verify RLS policies work correctly in production
4. ⏳ Consider data migration for existing player_stats records
5. ⏳ Populate profiles.full_name and profiles.avatar_url from players/coaches

## Conclusion

All critical database structure issues have been identified and fixed. The database schema now correctly aligns with the application code expectations. The migration has been successfully applied and verified.

