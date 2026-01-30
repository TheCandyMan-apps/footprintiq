
# Fix Plan: n8n Callback Token Authorization Issue

## ✅ COMPLETED

Both edge functions have been updated to strip the "Bearer " prefix from Authorization headers, resolving the token mismatch that was causing 401 errors.

### Changes Applied

| File | Change |
|------|--------|
| `supabase/functions/n8n-scan-progress/index.ts` | ✅ Strip "Bearer " prefix from Authorization header |
| `supabase/functions/n8n-scan-results/index.ts` | ✅ Strip "Bearer " prefix from Authorization header |

### Verification Steps

1. ✅ Edge functions deployed
2. Run a new Free tier scan
3. Check `n8n-scan-progress` logs - should see incoming requests
4. Watch `scan_progress` table - `current_step` should increment from 0 to 6
5. StepProgressUI should show checkmarks progressing

---

## Original Problem

The n8n workflow was correctly configured, but there was a **token format mismatch** between what n8n sends and what the edge function expected.

n8n's HTTP Request node adds "Bearer " prefix automatically:
- n8n sends: `Authorization: Bearer <token>`
- Edge function expected: raw `<token>`
- Result: 401 Unauthorized

## Solution Implemented

Both edge functions now:
1. Accept both `x-callback-token` and `Authorization` headers
2. Strip "Bearer " prefix if present before comparison
3. Log token mismatches with partial token for debugging
