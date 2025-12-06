# Next Session Recommendations

## Recommended First Improvement

**#11: Fix TypeScript errors in discover page** (Critical, Quick Win)

This is marked as critical priority and a quick win. It should be tackled first to ensure the codebase is stable.

### Why This First?
1. Critical priority - blocking issues should be fixed first
2. Quick win - can be completed quickly
3. Foundation - fixes enable other improvements to work correctly

### Files to Focus On
- `app/(dashboard)/coach/college/discover/page.tsx`

### Potential Challenges
- Boolean filter handling (hasVideo, verifiedOnly)
- Status change handler null handling
- May need to check related query files

---

## After Critical Fix

Move to **Player Dashboard improvements** (Priority 1 in game plan):

1. **#1: Polish Player Dashboard hero section** (High, Quick Win)
2. **#2: Add Player Dashboard stat cards** (High, Quick Win)
3. **#6: Player Dashboard data fetching** (High, Integration)

These three form a cohesive unit - do them together.

---

## Session Workflow

1. Run `npm run type-check` first
2. Fix any errors found
3. Test in browser
4. Update improvement_list.json
5. Commit changes
6. Update this file with next recommendation

