
## Fix: Stack Overflow and Dead Click Issues on Results Pages

### Problem 1: "Maximum call stack size exceeded" (Stability)
The `useScanResultsData` hook calls `JSON.stringify(r.meta)` to search for breach keywords inside result metadata. If any result's `meta` field contains circular references (common with Supabase realtime payloads or deeply nested worker output), this crashes the page.

**Fix**: Replace unsafe `JSON.stringify` with a safe helper that catches circular reference errors and falls back gracefully.

**File**: `src/hooks/useScanResultsData.ts` (lines 83 and 168)
- Add a `safeStringify` helper at the top of the file that wraps `JSON.stringify` in a try-catch, returning `'{}'` on failure
- Replace both `JSON.stringify(r.meta || {})` calls with `safeStringify(r.meta)`

### Problem 2: "Dead clicks" on result rows (UX)
Free users click result rows expecting something to happen, but the expanded panel is fully blurred with only a tiny lock badge. There is no clear visual distinction between collapsed and expanded states.

**Fix**: When a free user expands a row, show a compact, clear locked message instead of (or in addition to) the blurred content. This provides obvious feedback that the click registered and directs the user to upgrade.

**File**: `src/components/scan/results-tabs/accounts/PlatformExpandedDetail.tsx` (lines 203-226)
- Replace the blurred overlay with a more visible locked state: a short message like "Upgrade to Pro for full match breakdown, risk analysis, and removal priority" with a subtle call-to-action link
- Keep the blurred preview behind it but make the lock overlay more prominent (larger text, icon)

### Technical Details

```
safeStringify helper (useScanResultsData.ts):
  function safeStringify(obj: unknown): string {
    try { return JSON.stringify(obj || {}); }
    catch { return '{}'; }
  }
```

```
PlatformExpandedDetail locked state:
  - Increase lock overlay opacity and text size
  - Add a one-line description of what Pro reveals
  - Add subtle "Learn more" link to /pricing
```

### Files Changed
1. `src/hooks/useScanResultsData.ts` -- fix stack overflow
2. `src/components/scan/results-tabs/accounts/PlatformExpandedDetail.tsx` -- improve locked state visibility
