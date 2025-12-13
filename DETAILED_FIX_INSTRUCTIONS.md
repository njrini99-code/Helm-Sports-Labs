# Detailed Fix Instructions - Line by Line

**CRITICAL: Follow these instructions EXACTLY in order**

---

## 🚨 PRIORITY 1: Build-Blocking Issues

### Fix 1: WatchlistSkeleton Export

**File:** `components/ui/loading-state.tsx`  
**Action:** Add export at end of file

**Step 1:** Open `components/ui/loading-state.tsx`

**Step 2:** Scroll to the very end of the file (after all existing exports)

**Step 3:** Add this code:

```tsx
// Watchlist skeleton component
export function WatchlistSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
```

**Step 4:** Verify:
```bash
npx tsc --noEmit components/ui/loading-state.tsx
```

---

## 🚨 PRIORITY 2: AdvancedCharts.tsx - Exact Fixes

### Fix 2.1: Line 161 - Double Opening Brace

**File:** `components/analytics/AdvancedCharts.tsx`  
**Line:** 161  
**Current (WRONG):**
```tsx
            {{dataKeys.length === 0 ? (
```

**Fix to:**
```tsx
            {dataKeys.length === 0 ? (
```

**Action:** Remove one `{` - change `{{` to `{`

---

### Fix 2.2: Lines 175-176 - Missing Double Braces

**File:** `components/analytics/AdvancedCharts.tsx`  
**Lines:** 175-176

**Current (WRONG):**
```tsx
                dot={ fill: colors[index % colors.length], r: 3 }
                activeDot={ r: 5 } />
```

**Fix to:**
```tsx
                dot={{ fill: colors[index % colors.length], r: 3 }}
                activeDot={{ r: 5 }} />
```

**Action:** 
- Line 175: Change `dot={ fill:` to `dot={{ fill:`
- Line 175: Change `r: 3 }` to `r: 3 }}`
- Line 176: Change `activeDot={ r: 5 }` to `activeDot={{ r: 5 }}`

---

### Fix 2.3: Line 177 - Missing Closing Paren

**File:** `components/analytics/AdvancedCharts.tsx`  
**Line:** 177

**Current (WRONG):**
```tsx
            })
```

**Fix to:**
```tsx
            ))}
```

**Action:** Change `})` to `))}`

---

### Fix 2.4: Line 274 - Missing Closing Paren

**File:** `components/analytics/AdvancedCharts.tsx`  
**Line:** 274

**Current (WRONG):**
```tsx
              })
```

**Fix to:**
```tsx
              ))}
```

**Action:** Change `})` to `))}`

**Verify:**
```bash
npx tsc --noEmit components/analytics/AdvancedCharts.tsx
# Should show 0 errors
```

---

## 🚨 PRIORITY 3: discover-filters.tsx - Exact Fixes

### Fix 3.1: Line 100 - Double Opening Brace

**File:** `components/coach/college/discover-filters.tsx`  
**Line:** 100

**Current (WRONG):**
```tsx
            {{POSITIONS.length === 0 ? (
```

**Fix to:**
```tsx
            {POSITIONS.length === 0 ? (
```

**Action:** Remove one `{` - change `{{` to `{`

---

### Fix 3.2: Line 100 - Missing Comma (if needed)

**Check line 99-100 context:**
```tsx
          <div className="flex flex-wrap gap-2">
            {POSITIONS.length === 0 ? (
```

If there's a missing comma before line 100, add it. But based on the error, the main issue is the double brace.

---

### Fix 3.3: Line 124 - Missing Closing Paren/Brace

**File:** `components/coach/college/discover-filters.tsx`  
**Line:** 124

**Read lines 120-130 to see context.** The error says missing `)` and `}`. This is likely a map function closure issue.

**Look for pattern:**
```tsx
// ❌ WRONG:
            POSITIONS.map((pos) => {
              // ...
            })

// ✅ CORRECT:
            POSITIONS.map((pos) => {
              // ...
            }))
```

**Action:** Find the map function ending around line 124 and ensure it closes with `))}` not `)}`

---

### Fix 3.4: Lines 184-188 - JSX Closing Tag Issues

**File:** `components/coach/college/discover-filters.tsx`  
**Lines:** 184-188

**Read the context around these lines.** Errors indicate:
- Missing closing `</div>` tag
- Unexpected token (likely missing closing brace/paren)

**Action:** 
1. Read lines 180-190
2. Find the unclosed JSX element
3. Add the missing closing tag
4. Ensure map functions close with `))}`

---

### Fix 3.5: Lines 201-212 - Multiple JSX Closing Tag Issues

**File:** `components/coach/college/discover-filters.tsx`  
**Lines:** 201-212

**Errors indicate missing closing tags for:**
- `div` (line 204)
- `CardContent` (line 207)
- `Card` (line 212)

**Action:**
1. Read lines 195-215
2. Find each opening tag
3. Ensure each has a matching closing tag
4. Check for proper nesting

---

### Fix 3.6: Lines 219-235 - Identifier and Token Errors

**File:** `components/coach/college/discover-filters.tsx`  
**Lines:** 219-235

**These errors suggest syntax issues with JSX or expressions.**

**Action:**
1. Read lines 215-240
2. Check for:
   - Missing closing braces `}`
   - Missing closing parens `)`
   - Incorrect JSX syntax
   - Unclosed map functions

---

## 🚨 PRIORITY 4: discover-state-panel.tsx - Exact Fixes

### Fix 4.1: Lines 136, 142, 167, 175-176 - Missing Closing div Tags

**File:** `components/coach/college/discover-state-panel.tsx`  
**Lines:** 136, 142, 167, 175, 176

**Action for each line:**
1. Read 10 lines before each error line
2. Find the opening `<div>` tag
3. Add the missing `</div>` closing tag

**Example fix for line 136:**
- Read lines 130-140
- Find opening `<div>` around line 133
- Add `</div>` before line 137

---

### Fix 4.2: Lines 198-200 - Missing Commas in Object

**File:** `components/coach/college/discover-state-panel.tsx`  
**Lines:** 198-200

**Current (likely WRONG):**
```tsx
                    })
                    size="sm"
                    onAddToWatchlist={onAddToWatchlist}
```

**Fix to:**
```tsx
                    }),
                    size="sm",
                    onAddToWatchlist={onAddToWatchlist},
```

**OR if it's JSX props:**
```tsx
                    })
                  size="sm"
                  onAddToWatchlist={onAddToWatchlist}
```

**Action:**
1. Read lines 195-205
2. Determine if this is an object literal or JSX props
3. If object: add commas after each property
4. If JSX: ensure proper syntax

---

### Fix 4.3: Line 200 - onView Prop Syntax

**File:** `components/coach/college/discover-state-panel.tsx`  
**Line:** 200

**Current:**
```tsx
                    onView={(id) => router.push(`/coach/college/player/${id}`)}
```

**Check if this is correct.** The error suggests a syntax issue. 

**Possible fixes:**
1. If missing closing brace: `onView={(id) => router.push(`/coach/college/player/${id}`)}`
2. If template literal issue: Check for extra `}` in template

**Action:**
1. Read line 200
2. Ensure the arrow function is properly closed
3. Check template literal syntax

---

### Fix 4.4: Lines 212, 222, 233, 243 - Missing Closing div Tags

**File:** `components/coach/college/discover-state-panel.tsx`  
**Lines:** 212, 222, 233, 243

**Action:** Same as Fix 4.1 - find opening `<div>` and add closing `</div>`

---

### Fix 4.5: Line 271 - Missing Closing div Tag

**File:** `components/coach/college/discover-state-panel.tsx`  
**Line:** 271

**Action:**
1. Read lines 265-275
2. Find the opening `<div>` that's not closed
3. Add `</div>` at the appropriate location

---

## 🚨 PRIORITY 5: AIRecruitingAssistant.tsx - Exact Fixes

### Fix 5.1: Line 73 - Missing Comma

**File:** `components/coach/AIRecruitingAssistant.tsx`  
**Line:** 73

**Current (WRONG):**
```tsx
      })}
      .sort((a, b) => b.score - a.score)
```

**Fix to:**
```tsx
      })},
      .sort((a, b) => b.score - a.score)
```

**OR if it's method chaining:**
```tsx
      })
      .sort((a, b) => b.score - a.score)
```

**Action:**
1. Read lines 70-75
2. Determine if line 73 ends an object/array (needs comma) or is method chaining (no comma)
3. Based on context, line 73 appears to be closing an object in a map, so it needs `})` not `})}`
4. Actually, looking at the code, line 73 should be `})` closing the map callback, then `.sort` is chained

**Correct fix:**
```tsx
      })
      .sort((a, b) => b.score - a.score)
```

The issue is line 72 has `})}` but should be `})` because `.sort` is chained.

---

### Fix 5.2: Lines 74, 89 - Try/Catch Block Issues

**File:** `components/coach/AIRecruitingAssistant.tsx`  
**Lines:** 74, 89

**Error says:** 'catch' or 'finally' expected (line 74), 'try' expected (line 89)

**Action:**
1. Read lines 65-95
2. Find the `try` block
3. Ensure it has a matching `catch` or `finally`
4. The structure should be:
```tsx
try {
  // code
} catch (error) {
  // handle error
}
```

---

### Fix 5.3: Line 174 - JSX Multiple Root Elements

**File:** `components/coach/AIRecruitingAssistant.tsx`  
**Line:** 174

**Error:** JSX expressions must have one parent element

**Current (likely WRONG):**
```tsx
return (
  <div>...</div>
  <div>...</div>
)
```

**Fix to:**
```tsx
return (
  <>
    <div>...</div>
    <div>...</div>
  </>
)
```

**OR:**
```tsx
return (
  <div>
    <div>...</div>
    <div>...</div>
  </div>
)
```

**Action:**
1. Read lines 170-180
2. Find the return statement
3. Wrap multiple root elements in Fragment `<>...</>` or single parent div

---

### Fix 5.4: Lines 179, 195, 212 - Missing Closing div Tags

**File:** `components/coach/AIRecruitingAssistant.tsx`  
**Lines:** 179, 195, 212

**Action:** Find opening `<div>` tags and add matching `</div>` closing tags

---

### Fix 5.5: Lines 183-185, 201-203 - Missing Closing Tags and Parens

**File:** `components/coach/AIRecruitingAssistant.tsx`  
**Lines:** 183-185, 201-203

**Action:**
1. Read context around these lines
2. Find missing closing tags
3. Add missing closing parens `)`
4. Ensure proper JSX structure

---

## 📋 Systematic Fix Process

### For Each File:

1. **Get exact errors:**
   ```bash
   npx tsc --noEmit --pretty false 2>&1 | grep "FILENAME.tsx" > /tmp/errors.txt
   cat /tmp/errors.txt
   ```

2. **Open the file in your editor**

3. **Fix errors in order** (start with the first error line number)

4. **After each fix:**
   ```bash
   npx tsc --noEmit FILENAME.tsx
   ```

5. **Move to next error**

6. **When file has 0 errors, move to next file**

---

## ✅ Verification Checklist

After fixing each file:
- [ ] `npx tsc --noEmit FILENAME.tsx` shows 0 errors
- [ ] No new errors introduced
- [ ] File syntax is valid

After fixing all Priority 1-5 files:
- [ ] `npx tsc --noEmit` shows reduced error count
- [ ] `npm run build` progresses further (may still have errors in other files)

Final verification:
- [ ] `npx tsc --noEmit` shows 0 errors
- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts without errors

---

## 🎯 File Priority Order

Fix in this exact order:

1. ✅ `components/ui/loading-state.tsx` - Add WatchlistSkeleton
2. ✅ `components/analytics/AdvancedCharts.tsx` - 4 fixes (lines 161, 175-176, 177, 274)
3. ✅ `components/coach/college/discover-filters.tsx` - 36 errors
4. ✅ `components/coach/college/discover-state-panel.tsx` - 33 errors
5. ✅ `components/coach/AIRecruitingAssistant.tsx` - 30 errors
6. Then continue with remaining files from COMPLETE_FIX_GUIDE.md

---

## 📝 Notes

- **Always read 10-20 lines of context** around error lines
- **Fix one error at a time** - don't try to fix multiple
- **Verify after each fix** - make sure error count decreases
- **Use bracket matching** in your editor to find matching braces/parens
- **Check for patterns** - similar errors often have similar fixes

---

**Last Updated:** Current  
**Status:** 629 errors remaining  
**Target:** 0 errors

