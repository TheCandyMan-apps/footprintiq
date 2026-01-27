` tags. Since my previous messages were summaries of earlier responses (before you switched back to Chat mode), the plan wasn't freshly presented in this session.

Let me present the plan again so you get the **"Open"** and **"Approve"** buttons:

<lov-plan>

# Fix: Scan Status and Results Not Updating on Results Page

## Problem Summary
The user's scan shows "running" at 5% after 8+ minutes, but database records confirm:
- Scan status: `completed`
- Findings count: 351 records in `findings` table
- All providers finished: sherlock, gosearch, maigret, holehe

The UI is not recognizing the completed state or displaying the results.

## Root Causes

### 1. Findings Not Mapping to Display Format
The `findings` table stores data as:
- `evidence`: `[{key:"site", value:"7Cups"}, {key:"url", value:"..."}]`
- `meta`: `{platform:"7Cups", provider:"sherlock", ...}`

But `ScanResultRow` expects direct properties:
- `.site`: Direct string property
- `.url`: Direct string property
- `.status`: Direct string property

The hook does `select('*')` but doesn't transform the data.

### 2. Status Detection Misses Completed Scans
If a user opens the results page after a scan completes, the realtime subscription only catches future events - it misses the already-completed status.

### 3. Progress Shows 5%
The progress calculation uses `results.length` which equals 0 due to the mapping issue.

## Technical Changes

### File 1: `src/hooks/useRealtimeResults.ts`

**Add transformation function** (after line 42, before `useRealtimeResults`):

```typescript
// Transform findings to match expected ScanResultRow format
function transformFinding(finding: any): ScanResultRow {
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

**Apply transformation in loadInitialResults** (around line 80):

```typescript
// Transform findings before merging
const transformedFindings = (findingsResult.data || []).map(transformFinding);

const merged = [
  ...transformedFindings,
  ...normalizedProfiles,
];
```

**Apply transformation in realtime handler** (around line 108):

```typescript
const transformed = transformFinding(payload.new);
setResults((prev) => [...prev, transformed]);
```

**Add refetch export** (around line 130):

```typescript
const refetch = async () => {
  setLoading(true);
  await loadInitialResults();
};

return { results, loading, refetch };
```

### File 2: `src/components/scan/FreeResultsPage.tsx`

**Add fallback polling** for scan status:

```typescript
// Fallback poll for scan status (every 5 seconds)
useEffect(() => {
  if (!job || ['completed', 'completed_partial', 'failed', 'failed_timeout'].includes(job.status)) {
    return;
  }
  
  const interval = setInterval(() => {
    loadJob();
  }, 5000);
  
  return () => clearInterval(interval);
}, [job?.status]);
```

**Add results refetch when scan completes**:

```typescript
// Reload results when scan completes but we have no results
useEffect(() => {
  if (job?.status === 'completed' && results.length === 0 && refetch) {
    refetch();
  }
}, [job?.status, results.length]);
```

## Expected Outcome

After these changes:
1. Navigating to `/results/{scanId}` for a completed scan will show `completed` status immediately
2. The 351 findings will be fetched, transformed, and displayed with correct `site`/`url` values
3. Progress will show 100% with "Scan Complete"
4. The results list will populate with profile cards
5. In-progress scans will poll for status updates every 5 seconds as a fallback

## Risk Assessment
- **Low risk**: Additive changes only
- **Backwards compatible**: Transformation handles both array and object evidence formats
- **No breaking changes**: Existing realtime functionality preserved

