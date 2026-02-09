

# Fix Empty Name Searches (personal_details scans)

## Root Cause

Name searches are broken due to a **race condition** between two parallel processes:

1. The n8n workflow is triggered with the full name (e.g., "johnny parker") and sends it to username-only tools (Sherlock, Maigret, GoSearch, Holehe) which don't support spaces -- so they return nothing.
2. The `name-intel` edge function calls PredictaSearch (which does support names) and may find results.
3. The n8n results callback fires after `name-intel` and **overwrites the scan status back to `completed_empty`**, even when PredictaSearch found real data.

Evidence: The "johnny parker" scan has **101 findings in the database** but still shows `completed_empty` because n8n's callback overwrote the status.

## What Changes

**File: `supabase/functions/n8n-scan-trigger/index.ts`**

Skip the n8n workflow call entirely when `scanType === 'personal_details'`. The name-intel edge function is the sole handler for name searches, so there is no reason to also trigger the n8n pipeline (which only runs username-based tools that are incompatible with full names).

Specifically:

1. Wrap the n8n webhook fetch call (around lines 401-478) in a condition that excludes `personal_details` scans.
2. For `personal_details`, immediately set the scan status to `running` (since name-intel handles its own status updates to `completed` or `completed_empty` on completion).

This is a small, surgical change -- roughly 3-5 lines of conditional logic added around the existing n8n fetch block.

## Expected Outcome

- Name searches will only run through PredictaSearch via `name-intel` (no more wasted calls to Sherlock/Maigret with spaces).
- No more race condition overwriting valid results.
- Scans like "johnny parker" (which already returned 101 findings) will correctly show as `completed` instead of `completed_empty`.
- Names that PredictaSearch genuinely has no data for will still show `completed_empty` -- but without the false hope of username tools running.

