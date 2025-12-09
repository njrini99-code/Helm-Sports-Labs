# Additional Database Improvements Found

## 6. ⚠️ team_memberships Missing Unique Constraint

**Problem:**
- No UNIQUE constraint on `(team_id, player_id)`
- Could allow duplicate memberships (same player in same team multiple times)
- Code expects one membership per player per team

**Impact:**
- Data integrity issue
- Potential duplicate roster entries
- Queries may return incorrect counts

**Solution:**
```sql
ALTER TABLE team_memberships
ADD CONSTRAINT unique_team_player 
UNIQUE (team_id, player_id);
```

**Priority:** High - Data integrity

---

## 7. ⚠️ notifications Column Name Mismatch

**Problem:**
- Database column is `read` (boolean)
- API routes and code use `is_read` (boolean)
- Mismatch causes queries to fail or return wrong data

**Impact:**
- Notification read status not working correctly
- API routes may fail
- User experience broken

**Solution:**
Either:
- Option A: Rename column to match code
```sql
ALTER TABLE notifications RENAME COLUMN read TO is_read;
```

- Option B: Update all code to use `read` instead of `is_read`

**Priority:** High - Functionality broken

---

## 8. ⚠️ practice_plans Missing Unique Constraint

**Problem:**
- No UNIQUE constraint on `event_id`
- Multiple practice plans can exist for same event
- Business logic likely expects one plan per event

**Impact:**
- Data inconsistency
- Ambiguity about which plan to use
- Potential UI confusion

**Solution:**
```sql
ALTER TABLE practice_plans
ADD CONSTRAINT unique_practice_plan_per_event 
UNIQUE (event_id);
```

**Priority:** Medium - Data integrity

---

## 9. ⚠️ team_invitations No Expiration Cleanup

**Problem:**
- Expired invitations remain in database with `is_active = true`
- No automatic cleanup mechanism
- No constraint preventing use of expired invitations
- `expires_at` is checked in code but not enforced at DB level

**Impact:**
- Database bloat over time
- Potential security issue if code check is bypassed
- Confusing data state

**Solution:**
```sql
-- Add function to auto-deactivate expired invitations
CREATE OR REPLACE FUNCTION deactivate_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE team_invitations
  SET is_active = false
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job (using pg_cron if available)
-- Or add trigger/constraint to prevent using expired invitations
```

**Priority:** Medium - Data hygiene

---

## 10. ⚠️ team_schedule Missing Validation Constraints

**Problem:**
- `event_type` has no CHECK constraint (only in code)
- `end_time` can be before `start_time`
- `cancelled` has no default value consistency

**Impact:**
- Invalid data can be inserted
- Logic errors in queries
- Inconsistent state

**Solution:**
```sql
-- Add CHECK constraint for event_type
ALTER TABLE team_schedule
ADD CONSTRAINT check_event_type
CHECK (event_type IN ('game', 'practice', 'tournament', 'showcase'));

-- Add CHECK constraint for time validation
ALTER TABLE team_schedule
ADD CONSTRAINT check_end_after_start
CHECK (end_time IS NULL OR end_time >= start_time);

-- Ensure cancelled has default
ALTER TABLE team_schedule
ALTER COLUMN cancelled SET DEFAULT false;
```

**Priority:** Medium - Data integrity

---

## 11. ⚠️ parent_access.relationship Missing CHECK Constraint

**Problem:**
- `relationship` column has default 'parent' but no CHECK constraint
- Could accept invalid relationship types
- No validation of allowed values

**Impact:**
- Invalid data entry
- Potential UI/UX issues

**Solution:**
```sql
ALTER TABLE parent_access
ADD CONSTRAINT check_relationship_type
CHECK (relationship IN ('parent', 'guardian', 'legal_guardian', 'other'));
```

**Priority:** Low - Data validation

---

## 12. ⚠️ team_memberships.status Missing CHECK Constraint

**Problem:**
- `status` column has default 'active' but no CHECK constraint
- Code expects specific values ('active', 'inactive', 'alumni', etc.)
- No database-level validation

**Impact:**
- Invalid status values can be inserted
- Queries may fail or return wrong results

**Solution:**
```sql
ALTER TABLE team_memberships
ADD CONSTRAINT check_membership_status
CHECK (status IN ('active', 'inactive', 'alumni', 'pending', 'removed'));
```

**Priority:** Medium - Data integrity

---

## 13. ⚠️ notifications Missing RLS Policies

**Problem:**
- No RLS policies found for `notifications` table
- Table may be accessible to all users or no users
- Security risk

**Impact:**
- Security vulnerability
- Users may see others' notifications
- Or notifications may not be accessible at all

**Solution:**
```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System can insert notifications (via service role)
-- Users cannot insert their own notifications
```

**Priority:** High - Security issue

---

## 14. ⚠️ team_memberships Missing primary_team Column

**Problem:**
- Code expects `primary_team` column (boolean)
- Column doesn't exist in database
- Queries may fail or return wrong data

**Impact:**
- Code functionality broken
- Players can't have primary team designation
- Team queries may be incorrect

**Solution:**
```sql
ALTER TABLE team_memberships
ADD COLUMN IF NOT EXISTS primary_team boolean DEFAULT false;

-- Add index for queries
CREATE INDEX IF NOT EXISTS idx_team_memberships_primary 
ON team_memberships(player_id, primary_team) 
WHERE primary_team = true;
```

**Priority:** Medium - Missing feature

---

## 15. ⚠️ Missing Indexes for Common Queries

**Problem:**
- `team_memberships` missing composite index on `(team_id, status)`
- `notifications` missing composite index on `(user_id, read, created_at)`
- `team_schedule` missing index on `(team_id, start_time)` for date range queries

**Impact:**
- Slow queries as data grows
- Poor performance on common operations

**Solution:**
```sql
-- Composite index for active team members
CREATE INDEX IF NOT EXISTS idx_team_memberships_team_status 
ON team_memberships(team_id, status) 
WHERE status = 'active';

-- Composite index for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
ON notifications(user_id, read, created_at DESC);

-- Index for schedule date range queries
CREATE INDEX IF NOT EXISTS idx_team_schedule_team_time 
ON team_schedule(team_id, start_time);
```

**Priority:** Medium - Performance

---

## Summary

| # | Issue | Priority | Type |
|---|-------|----------|------|
| 6 | team_memberships unique constraint | **High** | Data integrity |
| 7 | notifications column mismatch | **High** | Functionality |
| 8 | practice_plans unique constraint | Medium | Data integrity |
| 9 | team_invitations expiration cleanup | Medium | Data hygiene |
| 10 | team_schedule validation | Medium | Data integrity |
| 11 | parent_access relationship check | Low | Data validation |
| 12 | team_memberships status check | Medium | Data integrity |
| 13 | notifications RLS policies | **High** | Security |
| 14 | team_memberships primary_team | Medium | Missing feature |
| 15 | Missing composite indexes | Medium | Performance |

**Critical Issues (High Priority):**
- #6: Duplicate memberships possible
- #7: Notifications not working
- #13: Security vulnerability

**Recommended Implementation Order:**
1. Fix #7 (notifications column) - Immediate functionality fix
2. Fix #13 (notifications RLS) - Security fix
3. Fix #6 (unique constraint) - Data integrity
4. Fix #14 (primary_team column) - Missing feature
5. Fix #8, #10, #12 (constraints) - Data integrity
6. Fix #15 (indexes) - Performance
7. Fix #9, #11 (cleanup/validation) - Data hygiene

