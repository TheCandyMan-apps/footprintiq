
# Fix: Scan Status and Results Not Updating on Results Page

## Problem Summary
The user's scan shows "running" at 5% after 8+ minutes, but database records confirm:
- Scan status: `completed` (at 16:42:17)
- Findings count: 351 records in `findings` table
- All providers finished: sherlock, gosearch, maigret, holehe

The UI is not recognizing the completed state or displaying the results.

## Root Causes

### 1. Status Detection Relies on Realtime - Misses Already-Completed Scans
When a user opens the results page for a scan that has already completed:
- The `loadJob()` function in `FreeResultsPage` fetches the current status
- But the realtime channel subscription only catches future UPDATE events
- If the page loads after completion, the component may have stale state

**Fix**: Ensure `loadJob()` properly updates the job state on initial load, and add a fallback poll to detect terminal status.

### 2. Findings Not Mapping to Display Format
The `findings` table has:
- `evidence`: `[{key:"site", value:"7Cups"}, {key:"url", value:"..."}]`
- `meta`: `{platform:"7Cups", provider:"sherlock", ...}`

But `ScanResultRow` expects:
- `.site`: Direct string property
- `.url`: Direct string property
- `.status`: Direct string property

The `useRealtimeResults` hook does `select('*')` but doesn't transform the data to match the expected interface.

**Fix**: Add data transformation in `useRealtimeResults` to extract `site`, `url`, and `status` from `evidence` and `meta` fields.

### 3. ScanProgress Component Uses resultCount=0
The progress calculation:
```typescript
resultCount / estimatedTotal * 100
```
Shows 5% because `resultCount` is passed as `Math.max(results.length, broadcastResultCount)` which equals 0.

**Fix**: Once findings are properly fetched and transformed, `results.length` will be 351 and progress will show correctly.

## Technical Changes

### File 1: `src/hooks/useRealtimeResults.ts`

Add data transformation to extract required fields from the findings' evidence/meta structure:

```typescript
// Transform findings to match expected ScanResultRow format
function transformFinding(finding: any): ScanResultRow {
  // Extract site from evidence array or meta
  let site = finding.meta?.platform || '';
  let url = '';
  
  if (Array.isArray(finding.evidence)) {
    const siteEntry = finding.evidence.find((e: any) => e.key === 'site');
    const urlEntry = finding.evidence.find((e: any) => e.key === 'url');
    if (siteEntry?.value) site = siteEntry.value;
    if (urlEntry?.value) url = urlEntry.value;
  } else if (finding.evidence?.site) {
    site = finding.evidence.site;
    url = finding.evidence.url || '';
  }
  
  return {
    ...finding,
    site,
    url,
    status: finding.meta?.status || 'found',
  };
}
```

Apply this transformation in `loadInitialResults()` and in the realtime INSERT handler.

### File 2: `src/components/scan/FreeResultsPage.tsx`

Add a fallback poll that checks the scan status from the database if it doesn't update via realtime within 5 seconds:

```typescript
// Fallback poll for scan status
useEffect(() => {
  if (!job || ['completed', 'completed_partial', 'failed', 'failed_timeout'].includes(job.status)) {
    return;
  }
  
  const interval = setInterval(() => {
    loadJob(); // Re-fetch job status from database
  }, 5000);
  
  return () => clearInterval(interval);
}, [job?.status]);
```

Also trigger a re-fetch of results when status changes to completed:

```typescript
// Reload results when scan completes
useEffect(() => {
  if (job?.status === 'completed' && results.length === 0) {
    // Trigger a manual refetch by calling the hook's internal load function
    // Or add a refetch capability to useRealtimeResults
  }
}, [job?.status]);
```

### File 3: `src/hooks/useRealtimeResults.ts` (additional)

Add a `refetch` function export so components can manually trigger a data reload:

```typescript
const refetch = async () => {
  await loadInitialResults();
};

return { results, loading, refetch };
```

## Expected Outcome

After these changes:
1. Navigating to `/results/{scanId}` for a completed scan will show `completed` status immediately
2. The 351 findings will be fetched, transformed, and displayed
3. Progress will show 100% with "Scan Complete"
4. The results list will populate with profile cards

## Testing Steps

1. Navigate to the existing scan: `/results/0024d48b-2352-481b-a0f1-eb111e0c81ad`
2. Verify status shows "completed"
3. Verify findings count shows 351
4. Verify progress shows 100%
5. Start a new scan and verify realtime updates work during in-progress state
