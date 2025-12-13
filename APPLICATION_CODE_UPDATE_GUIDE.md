# Application Code Update Guide

## Overview

After applying the 7 database migrations (030-036), your application code needs updates to work correctly with the new schema. This guide covers all required changes.

**⚠️ IMPORTANT**: Apply database migrations FIRST, then update application code.

---

## Table of Contents

1. [TypeScript Type Updates](#1-typescript-type-updates)
2. [Breaking Changes](#2-breaking-changes)
3. [New Table Integration](#3-new-table-integration)
4. [Query Updates](#4-query-updates)
5. [Form Validation Updates](#5-form-validation-updates)
6. [Testing Checklist](#6-testing-checklist)

---

## 1. TypeScript Type Updates

### A. Update Existing Types (lib/types.ts)

#### Make Required Fields Non-Nullable

**Migration 033** made these fields NOT NULL. Update your types to reflect this:

```typescript
// BEFORE (lib/types.ts lines 17, 27, 51)
export interface Player {
  grad_year: number | null;        // ❌ Can be null
  primary_position: string | null; // ❌ Can be null
  // ...
}

export interface Coach {
  coach_type: CoachType | null;    // ❌ Can be null
  // ...
}

// AFTER - Remove null for required fields
export interface Player {
  grad_year: number;                // ✅ Required
  primary_position: string;         // ✅ Required
  // ...
}

export interface Coach {
  coach_type: CoachType;            // ✅ Required
  // ...
}
```

**Files to update**:
- `lib/types.ts` (lines 17, 27, 51)

**Impact**:
- TypeScript will catch missing fields at compile time
- Forms must require these fields
- Default values needed for new records

#### Update CoachType Enum

Add 'travel' as default (used in migration 033):

```typescript
// lib/types.ts line 2
export type CoachType = 'college' | 'juco' | 'high_school' | 'showcase' | 'travel';
```

### B. Add New Table Types

Copy all types from `lib/types-new-tables.ts` into `lib/types.ts`:

```typescript
// Add to lib/types.ts (after existing types)

// Scholarship Offers
export type ScholarshipOfferType = 'full_scholarship' | 'partial_scholarship' | 'walk_on' | 'preferred_walk_on';
export type ScholarshipOfferStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn' | 'expired';
export interface ScholarshipOffer { /* ... see types-new-tables.ts */ }

// Campus Visits
export type CampusVisitType = 'official' | 'unofficial' | 'junior_day' | 'camp_visit' | 'game_day';
export type CampusVisitStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export interface CampusVisit { /* ... see types-new-tables.ts */ }

// Contact Log
export type ContactLogType = 'phone_call' | 'text_message' | 'email' | 'in_person' | /* ... */;
export interface ContactLog { /* ... see types-new-tables.ts */ }

// Player Documents
export type PlayerDocumentType = 'transcript' | 'test_scores' | 'medical_clearance' | /* ... */;
export interface PlayerDocument { /* ... see types-new-tables.ts */ }

// Eligibility Tracking
export type ClearinghouseStatus = 'not_submitted' | 'pending' | 'certified' | 'not_certified';
export interface EligibilityTracking { /* ... see types-new-tables.ts */ }
```

**Or simply**:
```typescript
// At the end of lib/types.ts
export * from './types-new-tables';
```

---

## 2. Breaking Changes

### A. Column Renames (Migration 036)

#### team_media.url → team_media.media_url

**Find all references**:
```bash
grep -r "team_media" app lib components
```

**Update queries**:
```typescript
// BEFORE
const { data } = await supabase
  .from('team_media')
  .select('id, url, caption');  // ❌ 'url' no longer exists

// AFTER
const { data } = await supabase
  .from('team_media')
  .select('id, media_url, caption');  // ✅ Use 'media_url'
```

**Affected files** (search and replace):
- Any file with `.from('team_media')`
- Look for `url` in team media queries

### B. Deprecated Tables (Migration 034)

#### recruits → recruit_watchlist

If you have any code using the `recruits` table, migrate to `recruit_watchlist`:

```typescript
// BEFORE
const { data } = await supabase
  .from('recruits')  // ❌ Deprecated table
  .select('*')
  .eq('coach_id', coachId);

// AFTER
const { data } = await supabase
  .from('recruit_watchlist')  // ✅ Use this table
  .select('*')
  .eq('coach_id', coachId);
```

**Column mapping**:
- `recruits.stage` → `recruit_watchlist.status`
- All other columns same

**Files likely affected**:
```bash
grep -r "\.from\('recruits'" app lib components
```

#### Event Tables Consolidation

If using `events` or `recruitment_events`, migrate to `camp_events`:

```typescript
// BEFORE
const { data } = await supabase
  .from('events')  // ❌ Deprecated
  .select('*');

// AFTER
const { data } = await supabase
  .from('camp_events')
  .select('*')
  .eq('event_type', 'general');  // ✅ Filter by type
```

**New event_type column** values:
- `'camp'` - Camp events
- `'recruitment'` - Recruiting events
- `'showcase'` - Showcase events
- `'clinic'` - Clinic events
- `'general'` - General events

---

## 3. New Table Integration

### A. Scholarship Offers

Create UI and API routes for scholarship offer management:

#### API Route: app/api/scholarship-offers/route.ts

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('player_id');

  let query = supabase
    .from('scholarship_offers')
    .select(`
      *,
      player:players(id, full_name, grad_year, primary_position, avatar_url),
      coach:coaches(id, full_name, school_name)
    `)
    .order('offer_date', { ascending: false });

  if (playerId) {
    query = query.eq('player_id', playerId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('scholarship_offers')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
```

#### Component: components/recruiting/ScholarshipOfferCard.tsx

```typescript
import { ScholarshipOffer } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ScholarshipOfferCard({ offer }: { offer: ScholarshipOffer }) {
  const statusColors = {
    pending: 'bg-yellow-500',
    accepted: 'bg-green-500',
    declined: 'bg-red-500',
    withdrawn: 'bg-gray-500',
    expired: 'bg-gray-400',
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{offer.offer_type.replace('_', ' ')}</h3>
          <p className="text-sm text-gray-600">
            Offered: {new Date(offer.offer_date).toLocaleDateString()}
          </p>
        </div>
        <Badge className={statusColors[offer.status]}>
          {offer.status}
        </Badge>
      </div>

      {offer.scholarship_percentage && (
        <div className="mb-2">
          <span className="font-semibold">{offer.scholarship_percentage}%</span> scholarship
        </div>
      )}

      {offer.scholarship_amount && (
        <div className="mb-2">
          <span className="font-semibold">${offer.scholarship_amount.toLocaleString()}</span> per year
        </div>
      )}

      {offer.decision_deadline && (
        <div className="text-sm text-gray-600">
          Decision by: {new Date(offer.decision_deadline).toLocaleDateString()}
        </div>
      )}

      {offer.conditions && (
        <div className="mt-4 text-sm">
          <strong>Conditions:</strong> {offer.conditions}
        </div>
      )}
    </Card>
  );
}
```

### B. Campus Visits

#### API Route: app/api/campus-visits/route.ts

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('player_id');

  let query = supabase
    .from('campus_visits')
    .select(`
      *,
      player:players(id, full_name, grad_year, avatar_url),
      coach:coaches(id, full_name, school_name)
    `)
    .order('visit_date', { ascending: false });

  if (playerId) {
    query = query.eq('player_id', playerId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('campus_visits')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
```

### C. Contact Log (NCAA Compliance)

#### Hook: lib/hooks/useContactLog.ts

```typescript
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ContactLog } from '@/lib/types';

export function useContactLog(coachId: string | null) {
  const [contacts, setContacts] = useState<ContactLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!coachId) return;

    async function fetchContacts() {
      const { data, error } = await supabase
        .from('contact_log')
        .select(`
          *,
          player:players(id, full_name, grad_year, avatar_url)
        `)
        .eq('coach_id', coachId)
        .order('contact_date', { ascending: false })
        .limit(50);

      if (data) setContacts(data);
      setLoading(false);
    }

    fetchContacts();
  }, [coachId]);

  const logContact = async (contactData: Partial<ContactLog>) => {
    const { data, error } = await supabase
      .from('contact_log')
      .insert({
        coach_id: coachId,
        ...contactData,
      })
      .select()
      .single();

    if (data) {
      setContacts([data, ...contacts]);
    }

    return { data, error };
  };

  return { contacts, loading, logContact };
}
```

### D. Player Documents

#### Storage Setup

First, create Supabase Storage bucket:

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('player-documents', 'player-documents', false);

-- Add RLS policy for player documents
CREATE POLICY "Players can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'player-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Players can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'player-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Coaches can view player documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'player-documents' AND
    EXISTS (
      SELECT 1 FROM coaches
      WHERE coaches.user_id = auth.uid()
    )
  );
```

#### Upload Component: components/player/DocumentUpload.tsx

```typescript
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PlayerDocumentType } from '@/lib/types';

export function DocumentUpload({ playerId }: { playerId: string }) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (
    file: File,
    documentType: PlayerDocumentType
  ) => {
    setUploading(true);

    // Upload to storage
    const filePath = `${playerId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('player-documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      setUploading(false);
      return;
    }

    // Create metadata record
    const { data: metadataData, error: metadataError } = await supabase
      .from('player_documents')
      .insert({
        player_id: playerId,
        document_type: documentType,
        document_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    setUploading(false);

    return { data: metadataData, error: metadataError };
  };

  return (
    <div>
      {/* Upload UI here */}
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file, 'transcript');
        }}
        disabled={uploading}
      />
    </div>
  );
}
```

### E. Eligibility Tracking

#### Component: components/player/EligibilityStatus.tsx

```typescript
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EligibilityTracking } from '@/lib/types';

export function EligibilityStatus({ playerId }: { playerId: string }) {
  const [eligibility, setEligibility] = useState<EligibilityTracking | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEligibility() {
      const { data } = await supabase
        .from('eligibility_tracking')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setEligibility(data);
    }

    fetchEligibility();
  }, [playerId]);

  if (!eligibility) return <div>No eligibility data</div>;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Academic Eligibility</h3>
        <p>GPA: {eligibility.gpa?.toFixed(2) || 'N/A'}</p>
        <p>Credits: {eligibility.credits_completed}/{eligibility.credits_required}</p>
        <p className={eligibility.academic_eligible ? 'text-green-600' : 'text-red-600'}>
          Status: {eligibility.academic_eligible ? 'Eligible' : 'Not Eligible'}
        </p>
      </div>

      <div>
        <h3 className="font-semibold">Athletic Eligibility</h3>
        <p>Clearinghouse: {eligibility.clearinghouse_status || 'Not submitted'}</p>
        <p className={eligibility.athletic_eligible ? 'text-green-600' : 'text-red-600'}>
          Status: {eligibility.athletic_eligible ? 'Eligible' : 'Not Eligible'}
        </p>
      </div>

      {eligibility.sat_score && (
        <div>
          <h3 className="font-semibold">Test Scores</h3>
          <p>SAT: {eligibility.sat_score}</p>
          {eligibility.act_score && <p>ACT: {eligibility.act_score}</p>}
        </div>
      )}
    </div>
  );
}
```

---

## 4. Query Updates

### A. RLS-Aware Queries (Migration 030)

After migration 030, these tables have RLS enabled. Ensure you're querying as authenticated user:

```typescript
// For coach_notes, recruiting_pipeline, etc.
const { data } = await supabase
  .from('coach_notes')
  .select('*')
  .eq('coach_id', currentCoachId);  // ✅ RLS will enforce ownership
```

**No code changes needed** if you're already filtering by coach_id/player_id, but RLS provides additional security layer.

### B. Performance Improvements (Migration 031)

No code changes needed! Queries will automatically be faster due to new indexes:

```typescript
// This query is now 10-100x faster
const { data } = await supabase
  .from('recruit_watchlist')
  .select(`
    *,
    player:players(*)
  `)
  .eq('coach_id', coachId)  // ✅ Uses idx_recruit_watchlist_coach_id
  .eq('status', 'active');   // ✅ Uses idx_recruit_watchlist_coach_status
```

### C. Unique Constraint Violations (Migration 032)

Handle unique constraint errors in your code:

```typescript
// When creating player profile
const { data, error } = await supabase
  .from('players')
  .insert({
    user_id: userId,  // ✅ Now has unique constraint
    // ... other fields
  });

if (error?.code === '23505') {  // Unique violation
  console.error('User already has a player profile');
  // Handle duplicate error
}
```

---

## 5. Form Validation Updates

### A. Required Field Validation

Update forms to require fields that are now NOT NULL:

#### Player Profile Form

```typescript
// components/player/ProfileForm.tsx

const playerSchema = z.object({
  grad_year: z.number().min(2025).max(2035),  // ✅ Required (was optional)
  primary_position: z.string().min(1),         // ✅ Required (was optional)
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  // ... other fields
});
```

#### Coach Profile Form

```typescript
// components/coach/ProfileForm.tsx

const coachSchema = z.object({
  coach_type: z.enum(['college', 'juco', 'high_school', 'showcase', 'travel']),  // ✅ Required
  school_name: z.string().min(1),  // Required for college coaches
  // ... other fields
});
```

### B. Default Values

Provide defaults for new records:

```typescript
// When creating new player
const newPlayer = {
  grad_year: 2025,           // ✅ Default to current recruiting class
  primary_position: 'Unknown', // ✅ Default value
  onboarding_completed: false, // ✅ Default from migration 036
  // ...
};
```

---

## 6. Testing Checklist

### A. Functional Tests

After updating code, test these workflows:

- [ ] **Player Registration**
  - [ ] Can create player profile
  - [ ] grad_year and primary_position required
  - [ ] Cannot create duplicate user_id

- [ ] **Coach Registration**
  - [ ] Can create coach profile
  - [ ] coach_type required
  - [ ] Cannot create duplicate user_id

- [ ] **Recruiting Workflow**
  - [ ] Can add player to watchlist
  - [ ] Cannot add same player twice
  - [ ] RLS prevents viewing other coaches' data

- [ ] **Messaging**
  - [ ] Messages load correctly
  - [ ] New indexes improve load time
  - [ ] Cannot send empty messages

- [ ] **New Features**
  - [ ] Can create scholarship offers
  - [ ] Can schedule campus visits
  - [ ] Can log coach-player contact
  - [ ] Can upload player documents
  - [ ] Can track eligibility

### B. Performance Tests

```typescript
// Test query performance
console.time('recruit_watchlist_query');
const { data } = await supabase
  .from('recruit_watchlist')
  .select(`
    *,
    player:players(*)
  `)
  .eq('coach_id', coachId);
console.timeEnd('recruit_watchlist_query');
// Should be <100ms (was 1000ms+ before indexes)
```

### C. RLS Security Tests

```typescript
// Test RLS enforcement
const { data: otherCoachNotes } = await supabase
  .from('coach_notes')
  .select('*')
  .eq('coach_id', 'other-coach-id');  // Should return empty (RLS blocks)

console.assert(
  otherCoachNotes?.length === 0,
  'RLS should prevent viewing other coaches\' notes'
);
```

---

## 7. Migration Checklist

Use this checklist when updating your application:

### Phase 1: Types (1 hour)
- [ ] Update `lib/types.ts` - make fields non-nullable
- [ ] Add new table types from `lib/types-new-tables.ts`
- [ ] Run TypeScript compiler to find errors: `npm run type-check`

### Phase 2: Breaking Changes (2 hours)
- [ ] Find and replace `team_media.url` → `team_media.media_url`
- [ ] Migrate `recruits` → `recruit_watchlist` queries
- [ ] Update event table queries to use `camp_events`
- [ ] Test affected pages

### Phase 3: Form Validation (1 hour)
- [ ] Update player form validation (grad_year, primary_position required)
- [ ] Update coach form validation (coach_type required)
- [ ] Add default values for new records
- [ ] Test registration flows

### Phase 4: New Features (4-8 hours)
- [ ] Create API routes for new tables
- [ ] Build UI components for scholarship offers
- [ ] Build UI components for campus visits
- [ ] Build contact log functionality
- [ ] Build document upload system
- [ ] Build eligibility tracking UI

### Phase 5: Testing (2-3 hours)
- [ ] Run functional tests
- [ ] Run performance tests
- [ ] Run security tests
- [ ] Fix any issues found

### Phase 6: Deployment
- [ ] Deploy updated application
- [ ] Monitor for errors
- [ ] Verify performance improvements

**Total estimated time**: 10-15 hours

---

## 8. Quick Reference

### Files Most Likely Needing Updates

| File | Change Required | Priority |
|------|----------------|----------|
| `lib/types.ts` | Make fields non-nullable, add new types | HIGH |
| `app/onboarding/player/page.tsx` | Require grad_year, primary_position | HIGH |
| `app/onboarding/coach/page.tsx` | Require coach_type | HIGH |
| Any file with `team_media` | Rename `url` → `media_url` | MEDIUM |
| Any file with `recruits` table | Change to `recruit_watchlist` | MEDIUM |
| `lib/schemas/` | Update Zod schemas | HIGH |

### Database Migration → Code Change Mapping

| Migration | Code Changes Needed |
|-----------|---------------------|
| 030 (RLS) | None (security improvement) |
| 031 (Indexes) | None (performance improvement) |
| 032 (Unique) | Handle unique constraint errors |
| 033 (NOT NULL) | Update types, forms, defaults |
| 034 (Consolidate) | Update table names in queries |
| 035 (New tables) | Add types, API routes, UI components |
| 036 (Standardize) | Rename columns in queries |

---

## Need Help?

If you encounter issues:

1. Check TypeScript errors: `npm run type-check`
2. Check runtime errors in browser console
3. Check Supabase logs in dashboard
4. Review migration verification queries

Remember: **Test in development first!**
