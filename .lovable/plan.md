# Telegram Integration: Full Diagnostic & Fix Plan

## Root Cause Summary

Three distinct problems are confirmed by logs and database evidence:

**Problem 1 — n8n Telegram workflow never posts results back (the main issue)**  
The database shows 10+ scans triggered with `telegram_triggered_at` set, but **every single one has 0 telegram findings**. The n8n Telegram Username workflow is being triggered successfully (the webhook fires), but it never calls `n8n-scan-results` back with Telegram data. This is a workflow-level issue: either the n8n workflow is not completing, or the `HTTP - Results` node is misconfigured with the wrong URL/payload.

**Problem 2 —** `telegram-retrigger` **is never being invoked**  
The edge function logs show zero executions — the "Re-run Telegram Scan" button is not successfully calling the `telegram-retrigger` function. The session replay confirms the button click happened, but the function was never reached.

**Problem 3 —** `updated_at` **column error in** `n8n-scan-results`  
The logs still show `column "updated_at" of relation "scans" does not exist` on every scan completion — the previous fix did not fully remove this reference.

---

## What Will Be Fixed

### Fix 1: The `telegram-retrigger` invocation bug (frontend)

The "Re-run Telegram Scan" button in `TelegramTab.tsx` needs to be verified — the `supabase.functions.invoke('telegram-retrigger', ...)` call likely has an incorrect function name, missing auth header, or is being swallowed silently. The fix will add explicit error logging and ensure the invocation is correct.

### Fix 2: Fully remove `updated_at` from `n8n-scan-results`

Search and remove any remaining reference to `updated_at` in the `n8n-scan-results` edge function and redeploy.

### Fix 3: Add a diagnostic endpoint to test the n8n Telegram callback path

Since the n8n workflow is the opaque part, add a clear test route so the Telegram results callback can be tested in isolation. This will confirm whether the n8n workflow is configured to call the right URL.

### Fix 4: Add detailed logging to `n8n-scan-trigger` for the Telegram path

Ensure that when the Telegram webhook is fired from `n8n-scan-trigger`, the response status and body are logged so future failures are visible.

---

## Technical Implementation

### Files to Edit

`src/components/scan/results-tabs/TelegramTab.tsx`

- Read the `RetriggerButton` invocation to verify it uses `supabase.functions.invoke('telegram-retrigger', { body: { scan_id } })` with the user's auth token.
- Add a `console.error` on failure so errors surface in browser console.
- Add a toast on both success and error so the user gets clear feedback.

`supabase/functions/n8n-scan-results/index.ts`

- Full search and removal of any remaining `updated_at` reference in the `scans` upsert/update block.
- Redeploy.

`supabase/functions/telegram-retrigger/index.ts`

- Add a startup log line confirming the function is booting (helps diagnose silent failures).
- Ensure the n8n webhook URL is logged on call (without exposing the full URL for security).
- Redeploy.

---

## After These Fixes

The n8n Telegram workflow itself is an external system (n8n Cloud). Once the retrigger is confirmed to be reaching the function, and the function is confirmed to be reaching n8n, the problem will be isolated to the n8n workflow configuration — specifically whether the `HTTP - Results` node in the Telegram workflow is correctly posting back to `n8n-scan-results`. That step will require inspecting the n8n execution history directly in the n8n Cloud UI.

---

## Sequence of Events (Expected Flow After Fix)

```text
User clicks "Re-run Telegram Scan"
    → TelegramTab calls supabase.functions.invoke('telegram-retrigger')
    → telegram-retrigger clears lock, deletes stale data
    → telegram-retrigger POSTs to N8N_TELEGRAM_USERNAME_WEBHOOK_URL
    → n8n Telegram workflow runs (Cloud Run worker)
    → n8n HTTP-Results node POSTs findings to n8n-scan-results
    → n8n-scan-results inserts findings with provider='telegram'
    → Realtime subscription in useTelegramFindings fires
    → UI updates with Telegram data
```

The current break is confirmed to be between steps 3 and 4 (the retrigger function is not being called at all), and also between steps 5 and 6 (n8n never calls back with results for any scan).