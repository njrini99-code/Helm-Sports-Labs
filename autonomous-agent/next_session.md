# Next Session Recommendations

## Session 6 Completed ✅

Successfully fixed calendar event date handling and timezone issues:
- Created date utility library (lib/utils/date.ts) ✅
- Created database migration for coach_calendar_events ✅
- Updated calendar queries to avoid timezone bugs ✅
- Updated calendar page to use new utilities ✅
- Comprehensive verification guide created ✅
- All acceptance criteria met ✅

**Status:** 10/30 improvements complete (33%)

---

## Recommended Next Improvement

**#20: Player engagement analytics** (High Priority, Integration)

This builds directly on the profile view tracking already implemented in Session 3.

### Why This Next?

1. High priority - Helps players understand their recruiting visibility
2. Integration work - Expands existing profile tracking system
3. Natural progression - We already track coach views in public profiles
4. Player-focused - Continues Priority 1 (Player Experience) work
5. Relatively straightforward - Database schema likely exists, need to add UI

### What Needs to Be Done

**Current State (from Session 3):**
- Profile view tracking already exists
- `player_engagement` table tracks coach_id when profiles are viewed
- Data is being recorded in `/profile/[id]/page.tsx`

**Implementation Tasks:**
1. Create analytics queries (lib/queries/analytics.ts):
   - getProfileViews(playerId, dateRange)
   - getViewsByCoach(playerId) - Show which coaches viewed
   - getViewTrends(playerId) - Daily/weekly view counts
   - getEngagementMetrics(playerId) - Summary stats

2. Create analytics component (components/player/AnalyticsDashboard.tsx):
   - View count over time (line chart)
   - Top viewing coaches (list with avatars)
   - Total views, unique coaches, trending metrics
   - Date range selector (7d, 30d, 90d, all time)

3. Add to player dashboard:
   - New "Analytics" section or tab
   - Show key metrics in hero section
   - Link to detailed analytics page

4. Optional: Add analytics page (app/(dashboard)/player/analytics/page.tsx):
   - Full analytics dashboard
   - More detailed charts and insights
   - Export functionality

### Files to Focus On

- `lib/queries/analytics.ts` - Create analytics queries
- `components/player/AnalyticsDashboard.tsx` - Analytics UI component
- `app/(dashboard)/player/page.tsx` - Add analytics section to dashboard
- Check existing `player_engagement` table schema in migrations

### Acceptance Criteria

- [ ] Page views tracked and displayed
- [ ] View duration tracked (if not already)
- [ ] Coach info captured and shown (which coaches viewed)
- [ ] Analytics dashboard section shows trends
- [ ] Privacy compliant (no PII exposure)

### Implementation Approach

1. **Review existing tracking:**
   ```typescript
   // Already exists in /profile/[id]/page.tsx
   await supabase.from('player_engagement').insert({
     player_id: playerId,
     coach_id: coachId, // if logged in
     engagement_type: 'profile_view',
   });
   ```

2. **Create analytics queries:**
   - Query player_engagement table
   - Group by date for trends
   - Join with coaches table for coach info
   - Calculate unique vs total views

3. **Build analytics UI:**
   - Use existing GlassCard components
   - Chart library (recharts or chart.js)
   - Responsive design (mobile + desktop)
   - Loading states and error handling

4. **Add to player dashboard:**
   - New section below College Journey
   - Or new tab in existing tabbed interface
   - Show summary metrics prominently

### Testing Strategy

1. Create test profile views with different coaches
2. Verify view counts are accurate
3. Test date range filtering
4. Check mobile responsiveness
5. Verify privacy (players only see their own analytics)
6. Test with no views (empty state)

---

## Alternative High-Priority Options

### #9: Player messaging with coaches (Medium Priority)
- Real-time messaging between players and coaches
- Uses Supabase realtime subscriptions
- More complex, would take longer than #20
- Still high value for player-coach communication

**Why defer:** More complex than analytics, requires UI work across both player and coach sides

### #10: Player Discover page polish (Medium Priority)
- Help players find colleges that match their profile
- Search, filter, favorite functionality
- Uses existing patterns from coach discover page

**Why defer:** Less impactful than analytics, more of a polish item

### #22: Add loading skeletons to dashboard (Medium Priority, Quick Win)
- Replace loading spinners with skeleton loaders
- Better perceived performance
- Quick win potential

**Why defer:** Pure UI polish, less functional value than analytics

---

## Progress Summary

### Completed (10/30):
1. ✅ Player Dashboard hero section (High, Quick Win)
2. ✅ Player Dashboard stat cards (High, Quick Win)
3. ✅ Player Profile public view (High)
4. ✅ Player Team Hub component (High)
5. ✅ Player College Journey component (High)
6. ✅ Player Dashboard data fetching (High)
7. ✅ Player video upload functionality (High)
8. ✅ Player stats and measurables display (High)
9. ✅ Fix TypeScript errors (Critical, Quick Win)
10. ✅ Fix calendar event date handling (High, Quick Win)

### High Priority Remaining:
- #20: Player engagement analytics (Integration)
- #9: Player messaging with coaches (Feature)

### Current Focus Area:
**Priority 1: Player Experience** - 8 of 10 completed (80%)
- Only 2 items remaining in Priority 1

---

## Notes from Session 6

**Date Utility Library:**
The date utility functions created in this session should be used throughout the application whenever working with calendar dates:
- Use `getTodayLocal()` instead of `new Date().toISOString().split('T')[0]`
- Use `formatDateLocal(date)` instead of date.toISOString().split('T')[0]
- Use `addDaysLocal(date, days)` for date arithmetic
- This prevents timezone conversion bugs

**Database Migration:**
The coach_calendar_events migration (#007) needs to be applied to the database:
```bash
supabase db push
```

**Code Quality:**
- TypeScript: 0 errors in ScoutPulse code ✅
- Linting: Clean ✅
- All changes follow existing patterns
- Comprehensive documentation created

**Completion Rate:**
- 10/30 improvements complete (33%)
- Strong progress on Player Experience
- Calendar system now production-ready
