

# Add Predicta Search to Username Scan Pipeline (with Credit Deduction)

## Overview

Currently, username scans only use Sherlock, Maigret, GoSearch, Holehe, and WhatsMyName. Predicta Search -- which returns profile photos, breach data, and social metadata -- is only used for `personal_details` (name) scans. This plan wires Predicta into the username scan pipeline so every username scan also gets rich profile data with photos, and deducts credits for the API call.

## Credit Cost

Predicta Search will cost **3 credits** per call (it's an expensive external API). This is consistent with other premium API providers like IPQS and TrueCaller.

## Changes

### 1. Frontend Provider Registry
**File:** `src/lib/providers/registry.ts`

Add a new `predictasearch` entry to `PROVIDER_REGISTRY` under the username providers section:
- `id`: `'predictasearch'`
- `name`: `'Predicta Search'`
- `description`: `'Social profiles, breaches & profile photos'`
- `scanType`: `'username'`
- `creditCost`: 3
- `minTier`: `'pro'` (Pro tier -- the API is expensive)
- `category`: `'social'`
- `requiresKey`: `'PREDICTA_SEARCH_API_KEY'`
- `enabled`: true

This registers Predicta in the UI so users can see it in provider lists and credit calculations.

### 2. Backend Scan Trigger -- Add Provider and Parallel Call
**File:** `supabase/functions/n8n-scan-trigger/index.ts`

Two changes:

**a) Add `predictasearch` to the username providers list (line ~340)**

Add `"predictasearch"` to the `providers` array for username scans so the progress tracker knows about it:
```
providers = ["sherlock", "gosearch", "maigret", "holehe", "whatsmyname", "predictasearch"];
```

**b) Add a new parallel call section (after the name-intel block, before the return)**

Similar to how email-intel and phone-intel are fired in parallel for their respective scan types, add a `PREDICTA-INTEL PARALLEL CALL` block for username scans:

- Only fires for non-free-tier username scans (Pro and above)
- Checks credit balance first (3 credits required)
- Deducts credits using `spend_credits` RPC with reason `'api_usage'` and meta `{ provider: 'predictasearch', scan_id, username }`
- Calls the `predicta-search` edge function with `queryType: 'username'`
- On success, normalizes results into findings (social profiles and breaches) and inserts them into the `findings` table
- Logs scan events for progress tracking
- Fire-and-forget pattern (does not block the main scan response)

### 3. Backend Predicta Username Handler
**File:** `supabase/functions/n8n-scan-trigger/index.ts` (same file, new section)

The parallel call block will:

1. Check workspace has >= 3 credits via `get_credits_balance` RPC
2. Deduct 3 credits via `spend_credits` RPC (reason: `'api_usage'`, meta: `{ provider: 'predictasearch', scan_id }`)
3. Call `predicta-search` edge function with the username
4. Parse results into `findings` rows (same format as name-intel: `social.profile` and `breach.hit` kinds)
5. Store avatar URLs in `meta.avatar` so the frontend fix we just made picks them up
6. Log `scan_events` for `predictasearch` provider
7. Broadcast progress via realtime channel
8. If credits insufficient, log provider as `skipped` with message and continue (scan not blocked)

### Technical Detail: Credit Deduction

The `credits_ledger` table has a CHECK constraint allowing these reasons: `'darkweb_scan', 'purchase', 'reverse_image_search', 'export', 'scan', 'api_usage', 'admin_grant'`.

We will use `'api_usage'` as the reason (matching existing patterns like quick-analysis), with the provider name in the `_meta` field:
```json
{ "provider": "predictasearch", "scan_id": "...", "scan_type": "username" }
```

### What This Does NOT Change

- Free tier username scans remain unaffected (only WhatsMyName runs on free quick scans)
- The existing `predicta-search` edge function is reused as-is
- The name-intel pipeline for `personal_details` scans remains unchanged
- No database schema changes needed

### Summary of Flow

```text
User starts username scan (Pro+)
  -> n8n-scan-trigger
     -> Creates scan record
     -> Fires n8n webhook (Sherlock, Maigret, etc.)
     -> NEW: Fires Predicta Search in parallel
        -> Check credits (3 required)
        -> Deduct 3 credits (reason: api_usage)
        -> Call predicta-search edge function
        -> Insert findings with meta.avatar
        -> Log scan events + broadcast progress
  -> Returns scan ID to frontend
```
