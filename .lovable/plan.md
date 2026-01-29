
# Plan: Add Fallback Polling to AdvancedResultsPage

## Summary
Add a 5-second fallback polling mechanism to `AdvancedResultsPage.tsx` to ensure the UI correctly detects scan completion even when Supabase realtime events are missed.

---

## Problem
The `AdvancedResultsPage` component (used by Pro/Business/Admin users) relies solely on Supabase realtime subscriptions to detect scan status changes. If the realtime event is missed (race condition, network hiccup, or subscription timing), the UI remains stuck showing "Scanning..." even after the backend has marked the scan as complete.

---

## Solution
Port the fallback polling pattern from `FreeResultsPage.tsx` (lines 268-286) to `AdvancedResultsPage.tsx`. This pattern:
1. Polls the `scans` table every 5 seconds while scan is active
2. Stops polling when a terminal status is detected
3. Triggers a results refetch if scan completes with zero results

---

## Changes

### File: `src/components/scan/AdvancedResultsPage.tsx`

**Add fallback polling useEffect (after line 189)**

```typescript
// Fallback poll for scan status (every 5 seconds)
useEffect(() => {
  if (!job || ['completed', 'completed_partial', 'completed_empty', 'failed', 'failed_timeout', 'finished', 'error', 'cancelled'].includes(job.status)) {
    return;
  }
  
  const interval = setInterval(() => {
    loadJob();
  }, 5000);
  
  return () => clearInterval(interval);
}, [job?.status]);
```

**Add results refetch on completion (requires accessing refetch from useScanResultsData)**

```typescript
// Reload results when scan completes but we have no results
useEffect(() => {
  if (job?.status && ['completed', 'completed_empty'].includes(job.status) && results.length === 0) {
    // Trigger refetch from useScanResultsData hook
  }
}, [job?.status, results.length]);
```

---

## Technical Details

### Terminal Status List
The polling will stop when status matches any of:
- `completed`
- `completed_partial`
- `completed_empty`
- `failed`
- `failed_timeout`
- `finished`
- `error`
- `cancelled`

### Data Flow
```text
Component mounts
       |
       v
Realtime subscription active
       |
       +--> Event received --> Update job state --> Stop polling
       |
       +--> Event missed --> Fallback poll every 5s --> Detect terminal --> Stop polling
```

### Hook Modification
The `useScanResultsData` hook uses `useRealtimeResults` internally, which already exports a `refetch` function. Need to verify this is exposed through `useScanResultsData` or add it.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/scan/AdvancedResultsPage.tsx` | Add fallback polling useEffect |
| `src/hooks/useScanResultsData.ts` | Expose `refetch` if not already |

---

## Testing Checklist
- [ ] Start a scan as Pro/Admin user
- [ ] Verify UI updates to "Complete" within 5-10 seconds of n8n finishing
- [ ] Verify results appear even if realtime event is missed
- [ ] Confirm polling stops after scan reaches terminal status
- [ ] Verify no memory leaks (interval cleared on unmount)
