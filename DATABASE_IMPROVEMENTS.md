# Database Improvements Needed

## 1. ⚠️ Sync profiles.full_name and profiles.avatar_url from players/coaches

**Problem:**
- `profiles.full_name` and `profiles.avatar_url` columns exist but are not automatically populated
- Data exists in `players.full_name`, `players.avatar_url`, and `coaches.full_name` tables
- API routes query `profiles.full_name` and `profiles.avatar_url` but get NULL values
- There's a trigger for `players.full_name` but nothing syncs it to `profiles`

**Impact:**
- Team messages API returns NULL for sender names/avatars
- User profiles show missing information
- Inconsistent data across tables

**Solution:**
Create triggers to sync data from players/coaches to profiles:
```sql
-- Sync from players to profiles
CREATE OR REPLACE FUNCTION sync_profile_from_player()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    full_name = NEW.full_name,
    avatar_url = NEW.avatar_url,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_profile_on_player_update
  AFTER UPDATE OF full_name, avatar_url ON players
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_from_player();

-- Sync from coaches to profiles  
CREATE OR REPLACE FUNCTION sync_profile_from_coach()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    full_name = NEW.full_name,
    avatar_url = COALESCE(NEW.logo_url, profiles.avatar_url),
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_profile_on_coach_update
  AFTER UPDATE OF full_name, logo_url ON coaches
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_from_coach();
```

**Priority:** High - Affects user experience

---

## 2. ⚠️ player_stats.team_id should be NOT NULL for team-based stats

**Problem:**
- `player_stats.team_id` is nullable but API routes filter by `team_id`
- Stats created without `team_id` won't appear in team queries (`/api/teams/[teamId]/stats`)
- No data integrity constraint ensuring team-based stats have a team_id

**Impact:**
- Stats may be created without team association
- Team stats queries may miss data
- Inconsistent data model (legacy stats vs new team stats)

**Solution:**
Add constraint and update existing data:
```sql
-- For new team-based stats, team_id should be required
-- But we need to preserve backward compatibility with legacy stats

-- Option 1: Add CHECK constraint for new stats (when stat_type is set)
ALTER TABLE player_stats
ADD CONSTRAINT check_team_stats_require_team_id
CHECK (
  (stat_type IS NULL) OR -- Legacy stats don't need team_id
  (team_id IS NOT NULL) -- New team stats require team_id
);

-- Option 2: Set default team_id from player's primary team
-- This would require a function to get player's primary team
```

**Priority:** Medium - Data integrity issue

---

## 3. ⚠️ Missing GIN index on team_messages.recipient_ids array

**Problem:**
- `team_messages.recipient_ids` is a `uuid[]` array column
- Queries filter messages by checking if a user_id is in the array
- No GIN (Generalized Inverted Index) index exists for array operations
- Array containment queries (`@>`, `<@`, `&&`) will be slow on large datasets

**Impact:**
- Slow queries when fetching messages for a specific user
- Performance degradation as message volume grows
- No efficient way to find all messages sent to a specific user

**Solution:**
Create GIN index for array operations:
```sql
CREATE INDEX IF NOT EXISTS idx_team_messages_recipient_ids_gin 
ON team_messages USING GIN (recipient_ids);

-- This enables fast queries like:
-- SELECT * FROM team_messages WHERE recipient_ids @> ARRAY['user-uuid']::uuid[];
```

**Priority:** Medium - Performance optimization

---

## 4. ⚠️ No validation constraint for player_stats event/game references

**Problem:**
- `player_stats` has both `event_id` (legacy) and `game_id` (new) columns
- Both can be NULL simultaneously
- No constraint ensuring at least one is set
- No constraint preventing both from being set
- Could lead to orphaned stats or data inconsistency

**Impact:**
- Stats may exist without any event/game reference
- Ambiguity about which reference to use
- Potential data integrity issues

**Solution:**
Add CHECK constraint:
```sql
ALTER TABLE player_stats
ADD CONSTRAINT check_stats_has_event_or_game
CHECK (
  (event_id IS NOT NULL AND game_id IS NULL) OR -- Legacy: event_id only
  (event_id IS NULL AND game_id IS NOT NULL) OR -- New: game_id only
  (event_id IS NULL AND game_id IS NULL AND stat_type IS NULL) -- Legacy stats without event
);

-- Or simpler: ensure at least one reference exists for team-based stats
ALTER TABLE player_stats
ADD CONSTRAINT check_team_stats_has_reference
CHECK (
  (stat_type IS NULL) OR -- Legacy stats can have no reference
  (game_id IS NOT NULL OR event_id IS NOT NULL) -- Team stats need a reference
);
```

**Priority:** Medium - Data integrity

---

## 5. ⚠️ Missing NOT NULL constraint on player_stats.stat_type

**Problem:**
- `player_stats.stat_type` is nullable but required for team-based stats
- API routes expect `stat_type` to be set ('hitting', 'pitching', 'fielding')
- No constraint ensuring stat_type is set when using new structure
- Legacy stats don't have stat_type, but new team stats should

**Impact:**
- Team stats queries may fail or return incomplete data
- Inconsistent data model
- API routes may need null checks

**Solution:**
Add conditional NOT NULL constraint:
```sql
-- Make stat_type required when team_id is set (new team-based stats)
ALTER TABLE player_stats
ADD CONSTRAINT check_team_stats_require_type
CHECK (
  (team_id IS NULL) OR -- Legacy stats don't need stat_type
  (stat_type IS NOT NULL) -- Team stats require stat_type
);

-- Or add default value and make it NOT NULL for new inserts
-- But this would break backward compatibility
```

**Priority:** Medium - Data consistency

---

## Summary

| # | Issue | Priority | Impact |
|---|-------|----------|--------|
| 1 | Sync profiles.full_name/avatar_url | **High** | User experience, API functionality |
| 2 | player_stats.team_id nullable | Medium | Data integrity, query completeness |
| 3 | Missing GIN index on recipient_ids | Medium | Query performance |
| 4 | No event/game validation | Medium | Data integrity |
| 5 | stat_type nullable for team stats | Medium | Data consistency |

**Recommended Implementation Order:**
1. Fix #1 (profiles sync) - Immediate user impact
2. Fix #3 (GIN index) - Performance before scale
3. Fix #2, #4, #5 (constraints) - Data integrity improvements

