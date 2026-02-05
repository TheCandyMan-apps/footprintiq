
# Fix Focus Mode Filtering for False Positives (OP.GG, etc.)

## Problem Summary

The Focus Mode filtering logic exists in `src/lib/findingFilters.ts` but is **never actually used** anywhere in the application. Additionally, the filter's URL extraction function doesn't recognize the `url` field that the results actually use.

From the database, OP.GG findings look like this:
- `url`: `https://www.op.gg/summoners/search?q=LondonBob77&region=kr`
- `meta.platform`: `OP.GG [LeagueOfLegends] Korea`

The patterns `/summoners?/` and `?q=` in `SEARCH_URL_PATTERNS` and `op.gg` in `GAMING_LOOKUP_SITES` should catch these—but the code never runs!

---

## Root Causes

1. **Missing field fallback**: `getItemUrl()` checks for `platformUrl`, `platform_url`, `primary_url` but NOT `url` (which is the actual field in `ScanResultRow`)
2. **Never imported**: `filterFindings` from `findingFilters.ts` has zero imports anywhere in the codebase
3. **No UI toggle**: There's no Focus Mode switch in the results UI to enable/disable filtering

---

## Implementation Plan

### Step 1: Fix URL Field Extraction in `findingFilters.ts`

Update `getItemUrl()` to include `url` as a fallback:

```typescript
function getItemUrl(item: FilterableItem): string {
  return (
    item.platformUrl ?? 
    item.platform_url ?? 
    item.primary_url ?? 
    (item as any).url ??              // <-- ADD THIS
    (item as any).raw?.primary_url ?? 
    (item as any).raw?.url ??         // <-- AND THIS
    ''
  );
}
```

Also add `site` field support to `getPlatformNameEarly()`:

```typescript
function getPlatformNameEarly(item: FilterableItem): string {
  return (
    item.platformName ??
    item.platform_name ??
    (item as any).site ??             // <-- ADD THIS (matches ScanResultRow)
    (item as any).raw?.platform_name ??
    (item as any).raw?.platformName ??
    ''
  ).toLowerCase();
}
```

### Step 2: Add Focus Mode Toggle to AccountsTab

Update `src/components/scan/results-tabs/AccountsTab.tsx`:

1. Import the filter function:
   ```typescript
   import { filterFindings, FilterOptions, isSearchResult } from '@/lib/findingFilters';
   ```

2. Add Focus Mode state:
   ```typescript
   const [focusMode, setFocusMode] = useState(true); // Default ON
   ```

3. Apply filtering to `displayResults` before rendering:
   ```typescript
   const filteredByFocusMode = useMemo(() => {
     return filterFindings(displayResults, { 
       hideSearch: true, 
       focusMode 
     });
   }, [displayResults, focusMode]);
   ```

4. Add UI toggle in the filter bar:
   ```tsx
   <div className="flex items-center gap-1.5">
     <Switch 
       checked={focusMode} 
       onCheckedChange={setFocusMode}
       className="scale-75"
     />
     <span className="text-[10px] text-muted-foreground">Focus Mode</span>
   </div>
   ```

### Step 3: Show Filter Statistics

Display how many items are being filtered out:

```tsx
{focusMode && displayResults.length !== filteredByFocusMode.length && (
  <span className="text-[10px] text-amber-600">
    {displayResults.length - filteredByFocusMode.length} hidden by Focus Mode
  </span>
)}
```

### Step 4: Update FilterableItem Interface

Extend the interface to include the fields actually used by `ScanResultRow`:

```typescript
export interface FilterableItem {
  // ... existing fields ...
  
  // ScanResultRow fields (from useRealtimeResults)
  url?: string;
  site?: string;
}
```

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/lib/findingFilters.ts` | Add `url` and `site` to extraction functions, extend `FilterableItem` interface |
| `src/components/scan/results-tabs/AccountsTab.tsx` | Import filter, add Focus Mode state + toggle, apply filtering |
| `src/components/scan/results-tabs/accounts/AccountFilters.tsx` | Add Focus Mode toggle to the filter bar (optional: could be in AccountsTab instead) |

### Expected Behavior After Fix

With Focus Mode **enabled** (default):
- OP.GG regional lookup pages (Korea, Oceania, Russia, etc.) → **HIDDEN**
- Tracker.gg, U.GG, and other gaming lookup sites → **HIDDEN**
- Any URL matching `/search?`, `?q=`, `/summoners/`, `/players/` → **HIDDEN**
- Low-confidence "Other" platform findings → **HIDDEN**

With Focus Mode **disabled**:
- All results shown (current behavior)

---

## Validation

After implementation, the scan for `LondonBob77` should:
1. Show a Focus Mode toggle in the Accounts tab (default: ON)
2. Hide all 10+ OP.GG regional duplicates when Focus Mode is ON
3. Show count of hidden items ("12 hidden by Focus Mode")
4. Reveal all items when Focus Mode is toggled OFF
