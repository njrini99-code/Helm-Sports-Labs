# Cleanup Checklist

This document tracks remaining cleanup opportunities and technical debt identified during Phase 3 refactoring.

## ✅ Completed (Phase 3)

- [x] Deleted unused `components/activity/ActivityFeed.tsx`
- [x] Deleted glassmorphism backup files (`lib/glassmorphism*.backup`)
- [x] Deleted unused `components/ui/StatCard.tsx` and `components/ui/stat-card.tsx`
- [x] Created comprehensive dashboard component README
- [x] Added exports to `components/dashboard/index.ts`
- [x] Added exports to `components/error/index.ts`
- [x] Created `lib/schemas/index.ts` for clean imports
- [x] Fixed all data-related 'any' types in dashboards
- [x] Created E2E testing infrastructure
- [x] Extracted reusable dashboard components

## 🔄 Future Cleanup Opportunities

### 1. Duplicate EmptyState Components

**Issue**: Two different EmptyState implementations exist:
- `components/ui/EmptyState.tsx` (281 lines, more feature-rich)
- `components/ui/empty-state.tsx` (185 lines, simpler)

**Files using EmptyState.tsx**:
- `app/(dashboard)/player/camps/page.tsx`

**Files using empty-state.tsx**:
- `app/(dashboard)/player/page.tsx`
- `app/auth/signup/page.tsx`
- `app/player/dashboard/recruiting/page.tsx`

**Recommendation**:
- Standardize on `EmptyState.tsx` (capital E) - more comprehensive
- Update 3 imports to use capital E version
- Delete `empty-state.tsx` (lowercase)
- Verify UI consistency after migration

**Priority**: Medium (affects 4 files)

---

### 2. Duplicate ErrorState Components

**Check**: Similar pattern may exist for error states
- Verify if `components/ui/ErrorState.tsx` and `components/ui/error-state.tsx` both exist
- If so, standardize naming

**Priority**: Low (needs investigation)

---

### 3. Duplicate LoadingState Components

**Check**: Similar pattern may exist for loading states
- Verify if `components/ui/LoadingState.tsx` and `components/ui/loading-state.tsx` both exist
- Check usage and standardize

**Priority**: Low (needs investigation)

---

### 4. Unused Error Boundary Components

**Issue**: Error boundary components created in Phase 2 but never integrated into app
- `components/error/ErrorBoundary.tsx` (756 lines)
- `components/error/GlobalErrorBoundary.tsx` (179 lines)

**Current Usage**: None (only referenced in documentation)

**Recommendation**:
- Integrate `GlobalErrorBoundary` into `app/layout.tsx` to catch all errors
- Use `ErrorBoundary` for specific sections/features
- Add error boundary wrapping to dashboards
- Test error scenarios

**Priority**: High (important for production error handling)

**Example Integration**:
```typescript
// app/layout.tsx
import { GlobalErrorBoundary } from '@/components/error';

export default function RootLayout({ children }) {
  return (
    <GlobalErrorBoundary>
      <html>
        <body>{children}</body>
      </html>
    </GlobalErrorBoundary>
  );
}
```

---

### 5. Dashboard Component Migration

**Issue**: New reusable components created but not yet used in existing dashboards

**Components Ready for Use**:
- `ActivityFeed` - Replace custom activity feed code
- `RosterList` - Replace custom roster display code
- `DashboardStatCard` - Already documented, verify usage

**Dashboards to Migrate**:
- College Coach dashboard (`app/(dashboard)/coach/college/page.tsx`)
- High School Coach dashboard (`app/(dashboard)/coach/high-school/page.tsx`)
- JUCO Coach dashboard (`app/(dashboard)/coach/juco/page.tsx`)
- Player dashboard (`app/(dashboard)/player/page.tsx`)

**Recommendation**:
- Migrate one dashboard at a time
- Start with College Coach (most feature-complete)
- Test thoroughly after each migration
- Remove old custom code
- Verify no regressions

**Priority**: Medium (improves maintainability but not blocking)

**Estimated Impact**: -500 lines of duplicate code

---

### 6. Test Coverage Expansion

**Current Coverage**:
- Unit tests: 30 tests (Vitest) for GenericForm, GenericList
- E2E tests: 36+ tests (Playwright) for auth, dashboard navigation

**Missing Coverage**:
- [ ] Unit tests for new dashboard components (ActivityFeed, RosterList)
- [ ] E2E tests for recruiting planner
- [ ] E2E tests for messaging system
- [ ] E2E tests for camp management
- [ ] Integration tests for API routes
- [ ] Visual regression tests

**Recommendation**:
- Add unit tests for ActivityFeed (15-20 tests)
- Add unit tests for RosterList (15-20 tests)
- Expand E2E coverage to critical user flows
- Consider adding visual regression testing (Percy, Chromatic)

**Priority**: Medium (important for confidence in refactoring)

---

### 7. Import Path Consistency

**Issue**: Mixed import styles throughout codebase
- Some use `@/components/ui/button`
- Some use `@/components/ui/Button`
- Some import from index files, others from specific files

**Recommendation**:
- Audit all imports across codebase
- Standardize on kebab-case for file names (`button.tsx`, not `Button.tsx`)
- Always import from index files where available
- Use TypeScript path aliases consistently

**Priority**: Low (cosmetic, doesn't affect functionality)

---

### 8. Zod Schema Application

**Current State**: Schemas created but only used in 2 dashboard files

**Opportunity**:
- Apply schemas to all API route handlers
- Add runtime validation to form submissions
- Use schemas in Supabase query responses
- Create schemas for all database tables

**Files to Update**:
- All files in `app/api/`
- Form components using react-hook-form
- Data fetching hooks in `lib/hooks/`

**Recommendation**:
- Start with high-traffic API routes
- Add schema validation to user-facing forms
- Create additional schemas as needed
- Document validation errors properly

**Priority**: High (improves type safety and runtime validation)

**Estimated Impact**: +50-100 files updated

---

### 9. Component Documentation

**Current State**: Only dashboard components have README

**Missing Documentation**:
- `components/shared/` - GenericForm, GenericList
- `components/ui/` - All UI components
- `lib/hooks/` - Custom hooks
- `lib/utils/` - Utility functions

**Recommendation**:
- Create README for each major component directory
- Document props, usage examples, best practices
- Add JSDoc comments to component files
- Consider Storybook for UI component documentation

**Priority**: Medium (improves developer experience)

---

### 10. Bundle Size Optimization

**Check**: Verify bundle size after Phase 3 changes

**Actions**:
- Run `npm run analyze` to check bundle size
- Identify large dependencies
- Look for code splitting opportunities
- Consider lazy loading dashboard components

**Priority**: Low (check after migrations)

---

## 🚀 Quick Wins (Do First)

1. **Integrate GlobalErrorBoundary** (30 min)
   - Wrap app in error boundary
   - Test error scenarios
   - Improves production stability

2. **Standardize EmptyState imports** (1 hour)
   - Update 3 files to use capital E version
   - Delete lowercase version
   - Run tests to verify

3. **Add unit tests for new components** (3-4 hours)
   - ActivityFeed: 15 tests
   - RosterList: 15 tests
   - Improves test coverage to 70%+

4. **Apply Zod schemas to top 5 API routes** (2-3 hours)
   - Identify most-used routes
   - Add schema validation
   - Document validation errors

---

## 📊 Impact Estimation

| Task | Priority | Effort | Impact | Lines Changed |
|------|----------|--------|--------|---------------|
| Integrate Error Boundaries | High | Low | High | ~20 |
| Standardize EmptyState | Medium | Low | Low | ~10 |
| Migrate Dashboards | Medium | High | High | ~500 |
| Add Component Tests | Medium | Medium | Medium | ~800 |
| Apply Zod Schemas | High | High | High | ~300 |
| Bundle Optimization | Low | Medium | Medium | ~50 |

---

## 🎯 Recommended Next Phase (Phase 4)

**Focus**: Integration & Polish

1. Integrate error boundaries across app
2. Migrate all dashboards to use new components
3. Add comprehensive testing (unit + E2E)
4. Apply Zod schemas to API routes and forms
5. Standardize component naming and imports
6. Bundle size optimization
7. Performance monitoring setup

**Estimated Duration**: 2-3 weeks
**Estimated Impact**: Additional -1,000 lines of code, 70%+ test coverage

---

## 📝 Notes

- This checklist created: December 13, 2025
- Based on Phase 3 refactoring completion
- Priorities: High = do soon, Medium = do eventually, Low = nice to have
- All "completed" items in this document were part of Phase 3

---

## ✨ Success Metrics

Track these metrics as cleanup progresses:

- [ ] Test coverage ≥ 70%
- [ ] Zero 'any' types in production code
- [ ] All dashboards use reusable components
- [ ] Bundle size < 500 KB (main bundle)
- [ ] All API routes have runtime validation
- [ ] Error boundaries on all major routes
- [ ] Component documentation complete
- [ ] Zero duplicate implementations

---

**Last Updated**: December 13, 2025 (Phase 3 completion)
