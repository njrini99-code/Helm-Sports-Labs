# Next Session Recommendations

## Session 5 Completed ✅

Successfully implemented Player stats and measurables display with D1 benchmarks:
- Created D1 benchmark constants system (lib/constants/d1-benchmarks.ts) ✅
- Built D1Badge component with Elite and D1 Range variants ✅
- Enhanced player dashboard metrics display ✅
- Enhanced public profile metrics display ✅
- All acceptance criteria met ✅

**Status:** 9/30 improvements complete (30%)

---

## Recommended Next Improvement

**#21: Fix calendar event modal date handling** (High Priority, Quick Win, Bug)

This is a critical bug that affects coach workflow and should be addressed soon.

### Why This Next?
1. High priority bug - affects data integrity
2. Quick win - should be straightforward date/timezone fix
3. Prevents coaches from entering incorrect event dates
4. Impacts coach calendar functionality (already completed feature)
5. Small, focused fix that can be completed quickly

### Files to Focus On
- `components/coach/college/calendar/calendar-event-modal.tsx` - Main modal component
- Check how dates are being parsed and saved
- Look for timezone conversion issues
- Verify date display vs stored date

### Acceptance Criteria
- [ ] Dates save correctly to database
- [ ] Timezone handled properly (UTC conversion)
- [ ] Events display on correct day in calendar
- [ ] Edit preserves original date (doesn't shift by day)
- [ ] No off-by-one day errors

### Implementation Approach
1. Review current date handling in calendar-event-modal.tsx
2. Identify where timezone conversion happens
3. Check if dates are being stored as UTC properly
4. Common issue: Using `new Date()` with local timezone vs UTC
5. Solution often involves: Using `toISOString().split('T')[0]` or date-fns/UTC methods
6. Test with dates near timezone boundaries (e.g., 11pm PST)
7. Verify in both create and edit modes

### Common Date/Timezone Pitfalls
- JavaScript Date objects use local timezone by default
- SQL DATE columns expect YYYY-MM-DD format (no time component)
- Converting between local time and UTC can shift dates
- Form input[type="date"] returns YYYY-MM-DD string (no timezone)
- Supabase stores TIMESTAMP WITH TIME ZONE as UTC

### Testing Strategy
1. Create event with date (e.g., "2025-06-15")
2. Verify it saves as "2025-06-15" in database (not "2025-06-14" or "2025-06-16")
3. Reload page and edit event
4. Verify date still shows as "2025-06-15"
5. Test from different timezones if possible (PST, EST, etc.)

---

## Alternative High-Priority Options

**#20: Player engagement analytics** (High Priority, Integration)
- Expand on profile view tracking already implemented in Session 3
- Show players who's viewing their profile
- Add analytics dashboard section
- Track engagement metrics over time

**#9: Player messaging with coaches** (Medium Priority)
- Real-time messaging functionality
- Critical for player-coach communication
- Builds on existing message infrastructure
- More complex, would take longer than #21

**#10: Player Discover page polish** (Medium Priority)
- Help players find colleges matching their profile
- Uses existing discover patterns from coach side
- Filters by division, location, program strength

---

## Notes from Session 5

**D1 Benchmark System:**
- Speed metrics: 60-yard dash (< 7.0s D1, < 6.7s Elite), Pop time (< 2.0s D1, < 1.9s Elite)
- Velocity metrics: Exit velo (≥ 90 mph D1, ≥ 95 mph Elite), FB velo (≥ 87 mph D1, ≥ 92 mph Elite)
- Handles various input formats: "6.8s", "92 mph", "6.8", "92"
- Returns null for unparseable values (no badge shown)

**D1Badge Component:**
- Elite variant: Amber/gold gradient with star icon
- D1 Range variant: Emerald gradient with trophy icon
- Size variants: sm and md
- Returns null when level is 'none' (clean UI)

**Integration Pattern:**
- Works seamlessly with existing verification badges
- Both badges display side by side with gap-2
- Metrics categorized by type (velocity, speed, power, other)
- Fully responsive on mobile

**Code Quality:**
- Zero TypeScript errors in ScoutPulse code
- Follows ScoutPulse design system (emerald green)
- Premium UI with gradients and shadows
- Proper component composition

**Completion Rate:**
- 9/30 improvements complete (30%)
- Strong progress on Player Experience (Priority 1)
- 3 more high-priority improvements remaining
