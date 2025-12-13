# TypeScript Error Fix Instructions for Agents

## AGENT 1: Template Literal Closing Brace Errors

**Task:** Fix extra closing braces `}}` in template literals and callback functions.

**Pattern to find:**
- `onClick={() => ...}}` → should be `onClick={() => ...}`
- `fill={`url(#gradient-${color.replace('#', '')}})`}` → should be `fill={`url(#gradient-${color.replace('#', '')})`}`
- `animation: \`${getAnimation()}} 150ms\`` → should be `animation: \`${getAnimation()} 150ms\``

**Files to fix:**
1. `components/player/VideoUpload.tsx` - Line 495
2. `components/pwa/PWASummary.tsx` - Lines 86, 93
3. `components/dashboard/DashboardInteractive.tsx` - Line 636
4. `components/ui/GlassTooltip.tsx` - Line 550
5. `components/ui/GlassDropdownMenu.tsx` - Line 937
6. `components/ui/GlassToast.tsx` - Line 340 (check if exists)
7. `components/ui/PageAnimations.tsx` - Line 634 (check if exists)
8. `src/components/NewBiz/NewBizView.tsx` - Line 272
9. `src/components/StartDay/BusinessSummaryModal.tsx` - Line 270
10. `anthropic-quickstarts/financial-data-analyst/app/finance/page.tsx` - Line 639

**Fix method:**
- Search for `}}` at end of lines with `onClick`, `onChange`, `fill=`, or `animation:`
- Remove one `}` to make it `}`
- For template literals, ensure closing is `})` not `}})`

**Verification:**
- Run `read_lints` on each file after fixing
- Check TypeScript compiler: `npx tsc --noEmit` for these files

---

## AGENT 2: JSX Closing Tag Errors

**Task:** Fix missing or incorrect JSX closing tags.

**Pattern to find:**
- `Expected corresponding JSX closing tag for 'div'`
- `JSX element 'div' has no corresponding closing tag`
- `Expected corresponding JSX closing tag for 'motion.div'`

**Files to fix (priority order):**

1. **`app/(dashboard)/coach/college/page.tsx`** - ~20 errors
   - Lines: 845, 846, 889, 893, 894, 936, 958, 959, 986, 987, 1010, 1046, 1061, 1067, 1076, 1077, 1083, 1087, 1109
   - Check for missing `</div>`, `</motion.div>`, `</section>` tags

2. **`app/(dashboard)/coach/college/discover/page.tsx`** - ~15 errors
   - Line 1030: Missing closing `</div>`
   - Check lines 1006, 1012, 1018, 1025-1028, 1125, 1172

3. **`app/(dashboard)/college/[id]/page.tsx`** - ~10 errors
   - Line 44: Missing closing tag
   - Lines: 80, 82, 96, 97, 129, 162, 163

4. **`app/(dashboard)/player/page.tsx`** - ~30 errors
   - Lines: 456, 584, 632, 633, 645, 744, 780, 785, 793, 798, 872, 920, 992, 1111, 1159, 1202, 1216, 1262, 1298, 1320-1334, 1630

5. **`app/(dashboard)/player/profile/page.tsx`** - ~10 errors
   - Lines: 263, 272, 440, 441, 448, 466, 479, 500

6. **`app/(dashboard)/coach/high-school/messages/page.tsx`** - ~5 errors
   - Lines: 440, 446, 502, 547-550

7. **`app/(dashboard)/coach/showcase/page.tsx`** - ~3 errors
   - Lines: 883, 888

**Fix method:**
- Use `read_file` to see context around error lines
- Match opening tags with closing tags
- Common issues:
  - Map functions missing `))` → should be `))}`
  - Ternary operators missing `)}` → should be `)}`
  - Missing `</div>` after conditional rendering

**Verification:**
- Run `read_lints` on each file
- Check TypeScript: `npx tsc --noEmit app/(dashboard)/coach/college/page.tsx` etc.

---

## AGENT 3: Map Function & Callback Closure Errors

**Task:** Fix incorrect closures in `.map()` functions and callback handlers.

**Pattern to find:**
- `{items.map(item => (...))}` missing closing parens → should be `{items.map(item => (...)))}`
- `onChange={(e) => setForm(prev => ({ ...prev, field: value }}` → should be `onChange={(e) => setForm(prev => ({ ...prev, field: value }))}`
- `onValueChange={(value) => setForm(prev => ({ ...prev, type: value }}` → should be `onValueChange={(value) => setForm(prev => ({ ...prev, type: value }))}`

**Files to check (search for these patterns):**

1. Files with `setForm` callbacks:
   - Search: `setForm(prev => ({ ...prev,`
   - Look for `}}` that should be `}))`

2. Files with map functions in JSX:
   - Search: `.map(` followed by JSX
   - Ensure closure is `))}` not `)}`

3. Files with `onChange`/`onValueChange`:
   - Search: `onChange=.*setForm.*}}`
   - Search: `onValueChange=.*setForm.*}}`

**Common locations:**
- Form components
- Table/list components with dynamic rendering
- Files with state setters in callbacks

**Fix method:**
- Find pattern: `}}` at end of callback functions
- Replace with: `}))` for nested arrow functions
- For map: ensure `))}` closure

**Verification:**
- Run `grep` for remaining `}}` patterns: `grep -r "}})" --include="*.tsx" --include="*.ts"`
- Run `read_lints` on fixed files

---

## AGENT 4: Style Prop Errors

**Task:** Fix extra closing braces in style objects.

**Pattern to find:**
- `style={{ width: \`${percentage}%}\` }}` → should be `style={{ width: \`${percentage}%\` }}`
- Extra `}` in template literals within style objects

**Files to fix:**
1. `components/player/PlayerStatsCharts.tsx` - Line 531
2. `src/components/Manager/ManagerDashboardEnhanced.tsx` - Lines 597, 610
3. `src/components/Goals/GoalsView.tsx` - Line 252

**Fix method:**
- Look for `style={{` with template literals
- Ensure template literal closes with `}` not `}}`
- Style object should close with `}}` not `}}}`

**Verification:**
- Run `read_lints` on each file
- Check for TypeScript errors on these specific lines

---

## AGENT 5: Expression & Statement Errors (Large Files)

**Task:** Fix syntax errors causing "Expression expected", "Declaration expected", missing commas/parentheses.

**Pattern to find:**
- `error TS1005: ')' expected`
- `error TS1005: ',' expected`
- `error TS1109: Expression expected`
- `error TS1128: Declaration or statement expected`
- `error TS1381: Unexpected token`

**Files to fix (in order of error count):**

1. **`app/(dashboard)/player/page.tsx`** - ~50 errors
   - Lines: 456, 584, 632, 633, 645, 744, 780, 785, 793, 798, 872, 920-925, 992, 1111, 1159, 1202, 1216, 1262, 1298, 1320-1334, 1630
   - Focus on: missing commas, parentheses, incorrect JSX syntax

2. **`app/(dashboard)/coach/college/page.tsx`** - ~20 errors
   - Lines: 845-847, 852-853, 889-1109 (multiple)
   - Focus on: JSX closing tags (overlaps with Agent 2)

3. **`app/(dashboard)/coach/college/discover/page.tsx`** - ~15 errors
   - Lines: 1006, 1012-1013, 1018, 1025-1028, 1125, 1172
   - Focus on: unexpected tokens, missing expressions

4. **`app/(dashboard)/player/profile/page.tsx`** - ~10 errors
   - Lines: 263, 272, 440-441, 448, 466, 479, 500
   - Focus on: missing commas, JSX syntax

**Fix method:**
- Read file around error line
- Check for:
  - Missing commas in object/array literals
  - Missing closing parentheses
  - Incorrect JSX syntax (e.g., `>` instead of `/>`)
  - Missing closing braces
- Use `read_lints` to see exact error messages

**Verification:**
- Run `npx tsc --noEmit` on each file
- Check `read_lints` output
- Fix errors one by one, re-checking after each fix

---

## General Instructions for All Agents

1. **Before starting:**
   - Run `read_lints` on your assigned files to see current errors
   - Use `read_file` to see context around error lines

2. **During fixes:**
   - Fix one file at a time
   - Re-run `read_lints` after each file
   - Use `search_replace` for pattern-based fixes
   - Be careful with indentation

3. **After fixing:**
   - Run `read_lints` on all fixed files
   - Verify with: `npx tsc --noEmit --pretty false | grep "your-file-name"`
   - Report any files that still have errors

4. **Common patterns to watch:**
   - Map functions: `{items.map(item => (...)))}` ✓
   - Callbacks: `onClick={() => handler()}` ✓
   - State setters: `setForm(prev => ({ ...prev, field: value }))` ✓
   - Template literals: `` `${value}` `` ✓ (not `` `${value}}` ``)

---

## Quick Reference: Error Pattern Fixes

| Error Pattern | Fix |
|--------------|-----|
| `onClick={() => ...}}` | `onClick={() => ...}` |
| `fill={\`url(#...\`}})` | `fill={\`url(#...\`)}` |
| `animation: \`${func()}} ms\`` | `animation: \`${func()} ms\`` |
| `{items.map(i => (...))}` | `{items.map(i => (...)))}` |
| `setForm(prev => ({ ...prev, f: v }}` | `setForm(prev => ({ ...prev, f: v }))` |
| `style={{ width: \`${p}%}\` }}` | `style={{ width: \`${p}%\` }}` |
| Missing `</div>` | Add appropriate closing tag |
| `, expected` | Add comma in object/array |
| `) expected` | Add closing parenthesis |

