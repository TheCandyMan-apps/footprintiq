
# Brave Search Integration for LENS Corroboration

## Overview

This plan integrates Brave Search into the username scan flow to provide automatic web-index corroboration for LENS scoring. When a username scan finds profiles, the system will verify those findings against Brave's independent web index, boosting confidence scores for verified results (+12 points).

---

## Current State Analysis

### What's Already Built
1. **Brave Search Edge Function** (`supabase/functions/brave-search/index.ts`) — Fully implemented, deployed, accepts `target`, `type`, `searchType` parameters
2. **Provider-Proxy Handler** (`callBraveSearch` in `provider-proxy/index.ts`) — Backend routing already exists
3. **LENS Scoring Hook** (`src/hooks/useLensAnalysis.ts`) — Already boosts scores for `web_index.hit` findings (+12 points)
4. **API Key** — `BRAVE_SEARCH_API_KEY` is configured in secrets

### What's Missing
1. **Registry Entry** — `brave_search` is not in the main `PROVIDER_REGISTRY` (only in `registry.meta.ts`)
2. **Scan Flow Integration** — No trigger calls Brave Search during username scans
3. **Enrichment Timing** — No post-scan enrichment step exists for corroboration

---

## Architecture Decision

### Option A: Add Brave as Regular Provider (In-Scan)
- Add `brave_search` to `PROVIDER_REGISTRY`
- Call it in parallel with Sherlock, Maigret, etc.
- **Problem**: Brave Search doesn't discover profiles — it corroborates existing findings. Calling it with just the username before we have results is wasteful.

### Option B: Post-Scan Enrichment (Recommended)
- After n8n returns findings, trigger a lightweight enrichment step
- Call Brave Search with found profile URLs/sites to verify they appear in web index
- Append `web_index.hit` findings to scan results
- **Benefit**: Targeted corroboration of actual findings, not speculative search

**Selected: Option B** — Post-scan enrichment in `n8n-scan-results` edge function

---

## Implementation Plan

### Phase 1: Add Brave Search Enrichment to n8n-scan-results

Modify `supabase/functions/n8n-scan-results/index.ts` to:

1. After inserting primary findings, check if scan is `username` type
2. Extract up to 5 high-confidence profile findings
3. Call `brave-search` edge function for each unique site/URL
4. Insert `web_index.hit` or `web_index.miss` findings linked to scan
5. Update `scan_progress` with enrichment status

**Location**: After line 234 (post-insert), before status computation (line 289)

```text
┌─────────────────────────────────────────────────────────────────┐
│  n8n-scan-results                                               │
│  ────────────────────────────────────────────────────────────   │
│  1. Receive findings from n8n                                   │
│  2. Insert findings to database                                 │
│  3. [NEW] Brave Search Enrichment for username scans            │
│     → Extract top profile findings                              │
│     → Call brave-search edge function                           │
│     → Insert web_index.hit/miss findings                        │
│  4. Compute final status                                        │
│  5. Broadcast completion                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 2: Add brave_search to PROVIDER_REGISTRY (UI Visibility)

Add to `src/lib/providers/registry.ts`:

```typescript
{
  id: 'brave_search',
  name: 'Web Index Verification',
  description: 'Verifies profiles in independent web index',
  scanType: 'username',
  creditCost: 0, // Included with scan, no extra cost
  minTier: 'free',
  category: 'social',
  enabled: true,
}
```

This makes the provider visible in the scan progress UI.

### Phase 3: Update Scan Progress UI

The `ScanProgress` component should display the Brave Search enrichment step. Since this happens server-side after n8n results arrive, we need to:

1. Add a synthetic "Verifying web index..." step
2. Update progress when `brave_search` findings are inserted
3. Show verification status in results

---

## Technical Details

### Enrichment Logic (n8n-scan-results)

```typescript
// After inserting findings, run Brave Search enrichment for username scans
if (scanType === 'username' && findingsToInsert.length > 0) {
  console.log('[n8n-scan-results] Running Brave Search enrichment...');
  
  // Extract unique sites from findings
  const profileSites = findingsToInsert
    .filter(f => f.kind === 'profile_presence' && f.meta?.url)
    .slice(0, 5)
    .map(f => ({
      site: f.meta?.site || f.provider,
      url: f.meta?.url,
    }));
  
  if (profileSites.length > 0) {
    try {
      // Call brave-search edge function
      const braveResponse = await fetch(
        `${supabaseUrl}/functions/v1/brave-search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            target: username,
            type: 'username',
            searchType: 'web',
            count: 10,
          }),
        }
      );
      
      if (braveResponse.ok) {
        const braveData = await braveResponse.json();
        
        // Insert Brave findings
        if (braveData.findings?.length > 0) {
          const braveFindingsToInsert = braveData.findings.map(f => ({
            scan_id: scanId,
            workspace_id: scan.workspace_id,
            provider: f.provider || 'brave_search',
            kind: f.kind,
            severity: f.severity,
            confidence: f.confidence,
            observed_at: new Date().toISOString(),
            evidence: f.evidence || [],
            meta: f.meta || {},
          }));
          
          await supabase.from('findings').insert(braveFindingsToInsert);
          console.log(`[n8n-scan-results] Inserted ${braveFindingsToInsert.length} Brave findings`);
        }
      }
    } catch (braveErr) {
      console.error('[n8n-scan-results] Brave enrichment failed:', braveErr);
      // Non-fatal - continue without enrichment
    }
  }
}
```

### LENS Scoring (Already Implemented)

The `useLensAnalysis` hook already handles Brave findings:

```typescript
// Lines 126-134 of useLensAnalysis.ts
const kind = (result as any).kind || '';
if (kind === 'web_index.hit') {
  score += 12;  // ← This is the LENS boost
  reasons.push('Profile verified in independent web index');
} else if (kind === 'web_index.result') {
  score += 5;
  reasons.push('Found in web search results');
}
```

---

## File Changes Summary

### Modified Files (2)

| File | Changes |
|------|---------|
| `supabase/functions/n8n-scan-results/index.ts` | Add Brave Search enrichment step after findings insert |
| `src/lib/providers/registry.ts` | Add `brave_search` provider entry for UI visibility |

### No New Files Required

The existing `brave-search` edge function and `provider-proxy` handler are already complete.

---

## Testing Plan

1. Run a username scan (e.g., `footprintiq`)
2. Verify `brave-search` edge function logs show the corroboration request
3. Check database for `web_index.hit` findings in `findings` table
4. Verify LENS scores in results UI show +12 boost for verified profiles
5. Confirm scan completes normally if Brave API is unavailable (graceful degradation)

---

## Cost & Performance

| Metric | Value |
|--------|-------|
| API calls per scan | 1 (single Brave Search per username scan) |
| Added latency | ~500-800ms (non-blocking, post-insert) |
| Credit cost | 0 (included with scan) |
| Failure mode | Graceful — scan completes without enrichment if Brave fails |

---

## Rollout

1. Deploy `n8n-scan-results` changes
2. Update `PROVIDER_REGISTRY` for UI visibility
3. Monitor `brave-search` edge function logs for first 24 hours
4. Verify LENS scores are correctly elevated in production
