

# Fix: Frontend Not Displaying Social Profile Results

## Problem Summary
The latest scan completed successfully with 9 social profiles stored in the database, but the UI shows "Waiting for results..." because the frontend queries the wrong table.

## Root Cause

**Data Flow Mismatch:**

```text
Backend (osint-scan):
  └── Writes to: social_profiles table ✅ (9 records stored)

Frontend (useRealtimeResults → useScanResultsData → FreeResultsPage):
  └── Reads from: findings table ❌ (0 records found)
```

The `osint-scan` edge function stores discovered profiles in `social_profiles`, but the `useRealtimeResults` hook only queries `findings`. These are separate tables with different schemas.

**Database Evidence:**
- `social_profiles` for scan `425f9eb1`: 9 records (Flickr, Instagram, Facebook, TikTok, etc.)
- `findings` for scan `425f9eb1`: 0 records

---

## Technical Solution

### Option A: Dual-Table Query in Frontend (Recommended)
Update `useRealtimeResults` to query **both** `findings` and `social_profiles`, then normalize the data into a unified format.

**File:** `src/hooks/useRealtimeResults.ts`

```typescript
const loadInitialResults = async () => {
  // Query both tables in parallel
  const [findingsResult, profilesResult] = await Promise.all([
    supabase.from('findings').select('*').eq('scan_id', jobId),
    supabase.from('social_profiles').select('*').eq('scan_id', jobId),
  ]);
  
  // Normalize social_profiles to match ScanResultRow format
  const normalizedProfiles = (profilesResult.data || []).map(profile => ({
    id: profile.id,
    scan_id: profile.scan_id,
    provider: profile.source || 'unknown',
    kind: 'profile_presence',
    severity: 'info',
    site: profile.platform,
    url: profile.profile_url,
    status: profile.found ? 'found' : 'not_found',
    evidence: { username: profile.username, avatar: profile.avatar_url },
    meta: profile.metadata,
    created_at: profile.first_seen || new Date().toISOString(),
  }));
  
  // Merge and deduplicate
  const merged = [...(findingsResult.data || []), ...normalizedProfiles];
  setResults(merged);
};
```

### Option B: Backend Writes to Both Tables
Update `osint-scan` to also create `findings` records for each social profile discovered. This maintains data consistency but requires backend changes.

---

## Recommended Approach

**Option A (Frontend Fix)** is preferred because:
1. Faster to implement (single file change)
2. No edge function redeployment needed
3. Works with existing scan data (the 9 profiles already stored)
4. No database schema changes required

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useRealtimeResults.ts` | Query both `findings` and `social_profiles`, normalize and merge results |

---

## Implementation Details

### Normalized Schema Mapping

| `social_profiles` field | Maps to `ScanResultRow` field |
|-------------------------|-------------------------------|
| `id` | `id` |
| `scan_id` | `scan_id` |
| `source` | `provider` |
| `platform` | `site` |
| `profile_url` | `url` |
| `found` | `status` ('found' / 'not_found') |
| `username`, `avatar_url` | `evidence` object |
| `metadata` | `meta` |
| `first_seen` | `created_at` |
| (constant) | `kind: 'profile_presence'` |
| (constant) | `severity: 'info'` |

### Realtime Subscription Update
Also add a subscription to `social_profiles` table:

```typescript
// Add second channel for social_profiles
const profilesChannel = supabase
  .channel(`social_profiles_${jobId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'social_profiles',
    filter: `scan_id=eq.${jobId}`,
  }, (payload) => {
    const normalized = normalizeProfile(payload.new);
    setResults(prev => [...prev, normalized]);
  })
  .subscribe();
```

---

## Verification Steps

1. After implementing, reload the results page for scan `425f9eb1`
2. Confirm 9 profiles are displayed (Flickr, Instagram, Facebook, TikTok, Pinterest, Twitch, Discord, Snapchat, Telegram)
3. Confirm no "Waiting for results..." message appears
4. Run a new scan and confirm results appear in real-time

---

## Technical Context

### Current Database State for Latest Scan
```text
Scan ID: 425f9eb1-189d-4b3c-bec3-ed2440b1bcfa
Username: paul.middleweek
Status: completed
Duration: 12 seconds

social_profiles (9 records):
├── Flickr (predicta source, verified profile)
├── Instagram (predicta source)
├── Facebook
├── TikTok
├── Pinterest
├── Twitch
├── Discord
├── Snapchat
└── Telegram
```

