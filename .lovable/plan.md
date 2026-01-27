
# Fix: Scan Results Not Displaying ("Waiting for results...")

## Problem Summary
A completed scan shows "Scan Complete" with 9s elapsed time, but the main results area displays "Waiting for results..." indefinitely. The scan recorded 13 sources found, but users see no actual results.

## Root Cause Analysis

### Issue 1: Database Constraint Violation (Backend)
The Predicta API returns profile URLs in a field called `link`, but the code maps `profile.url` (which is `undefined`):

```text
Edge Function Log:
Error storing social profiles: null value in column "profile_url" of relation 
"social_profiles" violates not-null constraint
```

**Location**: `supabase/functions/osint-scan/index.ts` line 467

```typescript
// Current (broken):
profile_url: profile.url,  // profile.url is undefined

// Predicta response structure:
{ platform: "picsart", link: "https://picsart.com/u/coralhowells", ... }
```

### Issue 2: Status Mismatch in UI (Frontend)
The `FreeResultsPage` checks for `job.status === 'finished'` but the scan has `status: 'completed'`:

**Location**: `src/components/scan/FreeResultsPage.tsx` lines 384-386

```typescript
// Current logic shows "Waiting for results..." when status isn't 'finished':
{job.status === 'finished'
  ? 'No results captured—try again later or adjust tags.'
  : 'Waiting for results...'}
```

### Issue 3: No Findings Data
Because the social profile insert failed with a constraint violation:
- `social_profiles` table: 0 records for this scan
- `findings` table: 0 records for this scan
- Frontend's `useRealtimeResults` hook returns empty array
- UI branch for `results.length === 0` is triggered

---

## Technical Fix Plan

### Step 1: Fix Predicta Profile URL Mapping (Backend)
**File**: `supabase/functions/osint-scan/index.ts`

Update line 467 to use the correct field with fallback:

```typescript
profile_url: profile.link || profile.url || `https://${profile.platform}.com/${profile.username}`,
```

This ensures:
- Primary: Use `link` field (what Predicta actually returns)
- Fallback 1: Use `url` field (for other providers)
- Fallback 2: Generate a reasonable URL from platform/username

### Step 2: Fix Status Check in FreeResultsPage (Frontend)
**File**: `src/components/scan/FreeResultsPage.tsx`

Update the status check to recognize all terminal statuses:

```typescript
const terminalStatuses = ['finished', 'completed', 'completed_partial', 'failed', 'failed_timeout'];
const isTerminal = terminalStatuses.includes(job.status);

// Then in the render:
{isTerminal
  ? 'No results captured—try again later or adjust tags.'
  : 'Waiting for results...'}
```

### Step 3: Add Defensive Null Checks (Backend)
**File**: `supabase/functions/osint-scan/index.ts`

Filter out profiles with missing URLs before insert to prevent constraint violations:

```typescript
// Before inserting socialProfilesWithConfidence:
const validProfiles = socialProfilesWithConfidence.filter(sp => sp.profile_url);

if (validProfiles.length > 0) {
  const { error: spError } = await supabase
    .from('social_profiles')
    .insert(validProfiles);
  
  if (spError) console.error('Error storing social profiles:', spError);
}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/osint-scan/index.ts` | Fix `profile.url` → `profile.link \|\| profile.url \|\| fallback` |
| `supabase/functions/osint-scan/index.ts` | Add filter to exclude profiles with null URLs before insert |
| `src/components/scan/FreeResultsPage.tsx` | Update status check to include 'completed' as terminal |

---

## Verification Steps

1. Run a username scan and confirm:
   - Social profiles insert successfully (no constraint errors in logs)
   - Results display after scan completes (not "Waiting for results...")
   - Status "completed" is treated as terminal

2. Check edge function logs:
   - No `23502` (null constraint) errors
   - Profiles stored correctly with valid URLs

---

## Technical Details

### Database Schema Constraint
```sql
-- social_profiles.profile_url is NOT NULL
profile_url is_nullable:NO
```

### Predicta API Response Format
```json
{
  "platform": "picsart",
  "username": "coralhowells",
  "link": "https://picsart.com/u/coralhowells",  // <-- "link" not "url"
  "user_id": "244590113021102"
}
```

### Status Flow Mapping
| Backend Status | Expected UI State |
|----------------|-------------------|
| `running` | Show progress/scanning |
| `completed` | Show results |
| `completed_partial` | Show partial results |
| `finished` | Show results (legacy) |
| `failed`, `failed_timeout` | Show error state |
