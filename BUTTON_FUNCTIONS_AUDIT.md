# Button Functions Audit Report

**Date:** Generated  
**Scope:** All button onClick handlers across the application  
**Status:** Issues Found - Action Required

---

## Summary

**Total Issues Found:** 15  
**Critical:** 3  
**High:** 6  
**Medium:** 4  
**Low:** 2

---

## Critical Issues

### 1. ❌ Missing Error Handling in `handleDeleteStaff` (College Settings)
**File:** `app/(dashboard)/coach/college/settings/page.tsx:274`  
**Severity:** Critical  
**Issue:** Async function without try-catch, no error handling, optimistic update without rollback

```typescript
const handleDeleteStaff = async (staffId: string) => {
  setStaff(staff.filter(s => s.id !== staffId));
  toast.success('Staff member removed');
};
```

**Problems:**
- No API call to actually delete from database
- No error handling
- Optimistic update without rollback capability
- No loading state

**Fix Required:**
```typescript
const handleDeleteStaff = async (staffId: string) => {
  const originalStaff = [...staff];
  setStaff(staff.filter(s => s.id !== staffId));
  
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('staff') // or appropriate table
      .delete()
      .eq('id', staffId);
    
    if (error) {
      setStaff(originalStaff); // Rollback
      toast.error('Failed to remove staff member');
      return;
    }
    
    toast.success('Staff member removed');
  } catch (error) {
    setStaff(originalStaff); // Rollback
    console.error('Error deleting staff:', error);
    toast.error('An error occurred');
  }
};
```

---

### 2. ❌ Missing Error Handling in Watchlist Handlers
**File:** `app/(dashboard)/coach/college/watchlist/page.tsx`  
**Severity:** Critical  
**Issues:**

#### 2a. `handleRemoveFromWatchlist` (Line 456)
- Missing try-catch wrapper
- No loading state
- Optimistic update without rollback

#### 2b. `handleUpdateStage` (Line 471)
- Missing try-catch wrapper
- No loading state
- Optimistic update without rollback

#### 2c. `handleUpdateRating` (Line 487)
- Missing try-catch wrapper
- No loading state
- Optimistic update without rollback

#### 2d. `handleUpdatePriority` (Line 501)
- Missing try-catch wrapper
- No loading state
- Optimistic update without rollback

#### 2e. `handleSaveNotes` (Line 521)
- Missing try-catch wrapper
- Loading state not reset in finally block
- Optimistic update without rollback

**Fix Pattern:**
```typescript
const handleRemoveFromWatchlist = async (recruitId: string, playerName: string) => {
  const originalRecruits = [...recruits];
  setRecruits(recruits.filter(r => r.id !== recruitId));
  
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('recruits')
      .delete()
      .eq('id', recruitId);

    if (error) {
      setRecruits(originalRecruits); // Rollback
      toast.error('Failed to remove from watchlist');
      return;
    }
    
    toast.success(`${playerName} removed from watchlist`);
  } catch (error) {
    setRecruits(originalRecruits); // Rollback
    console.error('Error removing from watchlist:', error);
    toast.error('An error occurred');
  }
};
```

---

### 3. ❌ Missing Error Handling in Bulk Actions
**File:** `app/(dashboard)/coach/college/watchlist/page.tsx`  
**Severity:** Critical  
**Issues:**

#### 3a. `handleBulkMoveStage` (Line 571)
- Missing try-catch wrapper
- Loading state not reset in finally block

#### 3b. `handleBulkSetPriority` (Line 594)
- Missing try-catch wrapper
- Loading state not reset in finally block

#### 3c. `handleBulkRemove` (Line 617)
- Missing try-catch wrapper
- Loading state not reset in finally block

**Fix Pattern:**
```typescript
const handleBulkMoveStage = async (newStage: string) => {
  if (selectedIds.size === 0) return;
  
  const originalRecruits = [...recruits];
  setBulkActionLoading(true);
  
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('recruits')
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .in('id', Array.from(selectedIds));

    if (error) {
      setRecruits(originalRecruits); // Rollback
      toast.error('Failed to move selected recruits');
      return;
    }
    
    const stageName = STAGES.find(s => s.id === newStage)?.label;
    toast.success(`${selectedIds.size} recruits moved to ${stageName}`);
    setRecruits(recruits.map(r => 
      selectedIds.has(r.id) ? { ...r, stage: newStage, updated_at: new Date().toISOString() } : r
    ));
    clearSelection();
  } catch (error) {
    setRecruits(originalRecruits); // Rollback
    console.error('Error moving stage:', error);
    toast.error('An error occurred');
  } finally {
    setBulkActionLoading(false);
  }
};
```

---

## High Priority Issues

### 4. ⚠️ Missing Loading State Reset in `handleSaveNotes`
**File:** `app/(dashboard)/coach/college/watchlist/page.tsx:521`  
**Severity:** High  
**Issue:** Loading state set but not reset in finally block

```typescript
const handleSaveNotes = async () => {
  // ...
  setSavingNotes(true);
  // ... API call ...
  setSavingNotes(false); // ❌ Should be in finally block
};
```

**Fix:**
```typescript
const handleSaveNotes = async () => {
  if (!notesModal.recruit) return;
  
  setSavingNotes(true);
  try {
    // ... API call ...
  } catch (error) {
    console.error('Error saving notes:', error);
    toast.error('An error occurred');
  } finally {
    setSavingNotes(false);
  }
};
```

---

### 5. ⚠️ Missing Error Handling in `handleBulkExport`
**File:** `app/(dashboard)/coach/college/watchlist/page.tsx:640`  
**Severity:** High  
**Issue:** Synchronous function that could fail (CSV generation, download)

```typescript
const handleBulkExport = () => {
  if (selectedIds.size === 0) return;
  
  const selectedRecruits = recruits.filter(r => selectedIds.has(r.id));
  const csvContent = [
    // ... CSV generation ...
  ];
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recruits-${new Date().toISOString()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

**Problems:**
- No try-catch for blob creation
- No error handling for download
- No user feedback on failure

**Fix:**
```typescript
const handleBulkExport = () => {
  if (selectedIds.size === 0) return;
  
  try {
    const selectedRecruits = recruits.filter(r => selectedIds.has(r.id));
    const csvContent = [
      ['Name', 'Position', 'Grad Year', 'State', 'Stage', 'Priority', 'Rating', 'Notes'].join(','),
      ...selectedRecruits.map(r => [
        `"${r.name}"`,
        r.player?.primary_position || r.primary_position || '',
        r.player?.grad_year || r.grad_year || '',
        r.player?.high_school_state || r.high_school_state || '',
        r.stage || '',
        r.priority || '',
        r.rating?.toString() || '',
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruits-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${selectedIds.size} recruits`);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    toast.error('Failed to export CSV');
  }
};
```

---

### 6. ⚠️ Missing Validation in `handleJoinTeam`
**File:** `app/join/[code]/page.tsx:68`  
**Severity:** High  
**Issue:** No validation before API call, no check for already joined

```typescript
const handleJoinTeam = async () => {
  try {
    setJoining(true);
    const response = await fetch(`/api/teams/join/${code}`, {
      method: 'POST',
    });
    // ...
  }
};
```

**Problems:**
- No validation that user is logged in
- No check if already a member
- No validation of invitation status

**Fix:**
```typescript
const handleJoinTeam = async () => {
  if (!invitation) {
    toast.error('Invalid invitation');
    return;
  }
  
  if (joined) {
    toast.info('You have already joined this team');
    return;
  }
  
  try {
    setJoining(true);
    const response = await fetch(`/api/teams/join/${code}`, {
      method: 'POST',
    });
    // ... rest of code
  } catch (err) {
    console.error('Error joining team:', err);
    toast.error('Failed to join team');
  } finally {
    setJoining(false);
  }
};
```

---

### 7. ⚠️ Missing Error Handling in Share Functions
**File:** `components/coach/hs/TeamInviteModal.tsx`  
**Severity:** High  
**Issues:**

#### 7a. `shareViaEmail` (Line 123)
- No error handling for mailto: failures
- No validation that link exists

#### 7b. `shareViaSMS` (Line 131)
- No error handling for sms: failures
- No validation that link exists

**Fix:**
```typescript
const shareViaEmail = (link: string) => {
  if (!link) {
    toast.error('No link to share');
    return;
  }
  
  try {
    const subject = encodeURIComponent('Join my team on ScoutPulse');
    const body = encodeURIComponent(
      `I've invited you to join my team on ScoutPulse. Click the link below to join:\n\n${link}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success('Email client opened');
  } catch (error) {
    console.error('Error opening email client:', error);
    toast.error('Failed to open email client');
  }
};
```

---

### 8. ⚠️ Missing Error Handling in `generateQRCode`
**File:** `components/coach/hs/TeamInviteModal.tsx:117`  
**Severity:** High  
**Issue:** No validation, no error handling for external service

```typescript
const generateQRCode = (link: string) => {
  const qrServiceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
  setQrCodeUrl(qrServiceUrl);
};
```

**Problems:**
- No validation that link exists
- No error handling if external service fails
- No loading state

**Fix:**
```typescript
const generateQRCode = (link: string) => {
  if (!link) {
    toast.error('No link to generate QR code for');
    return;
  }
  
  try {
    const qrServiceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
    setQrCodeUrl(qrServiceUrl);
    toast.success('QR code generated');
  } catch (error) {
    console.error('Error generating QR code:', error);
    toast.error('Failed to generate QR code');
  }
};
```

---

### 9. ⚠️ Missing Error Handling in Calendar Handlers
**File:** `app/(dashboard)/coach/college/calendar/page.tsx`  
**Severity:** High  
**Issues:**

#### 9a. `handleSaveEvent` (Line 158)
- Check if has proper error handling

#### 9b. `handleDeleteEvent` (Line 180)
- Check if has proper error handling

**Note:** Need to verify these handlers have try-catch blocks.

---

## Medium Priority Issues

### 10. ⚠️ Inconsistent Error Handling Patterns
**Severity:** Medium  
**Issue:** Some handlers use try-catch, others don't. Some use toast, others use console.error only.

**Recommendation:** Standardize error handling pattern:
```typescript
const handleAction = async () => {
  setLoading(true);
  try {
    // API call
    const result = await apiCall();
    toast.success('Success message');
  } catch (error) {
    console.error('Error context:', error);
    toast.error('User-friendly error message');
  } finally {
    setLoading(false);
  }
};
```

---

### 11. ⚠️ Missing Loading States
**Severity:** Medium  
**Files:** Multiple  
**Issue:** Some async handlers don't disable buttons during operation

**Examples:**
- `handleRemoveFromWatchlist` - no loading state
- `handleUpdateStage` - no loading state
- `handleUpdateRating` - no loading state
- `handleUpdatePriority` - no loading state

**Fix:** Add loading states and disable buttons:
```typescript
const [updating, setUpdating] = useState<string | null>(null);

const handleUpdateStage = async (recruitId: string, newStage: string, playerName: string) => {
  setUpdating(recruitId);
  try {
    // ... API call ...
  } finally {
    setUpdating(null);
  }
};

// In JSX:
<Button disabled={updating === recruit.id} onClick={() => handleUpdateStage(...)}>
  {updating === recruit.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
</Button>
```

---

### 12. ⚠️ Missing Input Validation
**Severity:** Medium  
**Issue:** Some handlers don't validate inputs before processing

**Examples:**
- `handleSaveNotes` - validates recruit exists, but could validate note length
- `handleBulkExport` - validates selection size, but could validate data format

---

### 13. ⚠️ Missing Optimistic Update Rollback
**Severity:** Medium  
**Issue:** Many handlers update state optimistically but don't rollback on error

**Files Affected:**
- All watchlist handlers
- `handleDeleteStaff`

**Fix Pattern:** Store original state before update, restore on error.

---

## Low Priority Issues

### 14. ℹ️ Missing User Feedback
**Severity:** Low  
**Issue:** Some operations complete silently without user feedback

**Examples:**
- `handleBulkExport` - no success toast
- Some state updates don't show feedback

---

### 15. ℹ️ Inconsistent Button Disabled States
**Severity:** Low  
**Issue:** Some buttons use `disabled` prop, others use conditional rendering

**Recommendation:** Standardize to always use `disabled` prop with loading indicator.

---

## Recommendations

### 1. Create Standardized Handler Pattern
Create a utility hook for async button handlers:

```typescript
// hooks/useAsyncHandler.ts
export function useAsyncHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  options?: {
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const [loading, setLoading] = useState(false);
  
  const wrappedHandler = useCallback(async (...args: Parameters<T>) => {
    setLoading(true);
    try {
      const result = await handler(...args);
      options?.onSuccess?.(result);
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      return result;
    } catch (error) {
      console.error('Handler error:', error);
      options?.onError?.(error);
      toast.error(options?.errorMessage || 'An error occurred');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handler, options]);
  
  return [wrappedHandler, loading] as const;
}
```

### 2. Add Error Boundary for Button Handlers
Wrap critical button handlers in error boundaries.

### 3. Add Loading States to All Async Handlers
Ensure all async operations show loading indicators.

### 4. Standardize Error Messages
Create a centralized error message system.

---

## Action Items

1. ✅ Fix `handleDeleteStaff` - Add API call and error handling
2. ✅ Fix all watchlist handlers - Add try-catch and rollback
3. ✅ Fix bulk action handlers - Add finally blocks
4. ✅ Fix `handleSaveNotes` - Move loading reset to finally
5. ✅ Fix `handleBulkExport` - Add error handling
6. ✅ Fix `handleJoinTeam` - Add validation
7. ✅ Fix share functions - Add error handling
8. ✅ Fix `generateQRCode` - Add validation and error handling
9. ✅ Add loading states to all async handlers
10. ✅ Standardize error handling pattern

---

## Files Requiring Updates

1. `app/(dashboard)/coach/college/settings/page.tsx`
2. `app/(dashboard)/coach/college/watchlist/page.tsx`
3. `app/join/[code]/page.tsx`
4. `components/coach/hs/TeamInviteModal.tsx`
5. `app/(dashboard)/coach/college/calendar/page.tsx` (verify)

---

**Next Steps:** Review and fix all identified issues, then re-audit.

