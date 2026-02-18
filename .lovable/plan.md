
# Re-run Telegram Scan Button

## What this builds

A "Re-run Telegram" button on the Telegram tab that lets a user manually re-trigger only the Telegram worker for an existing scan — without starting a full new scan. It works for both `username` (via the n8n Telegram Username Workflow) and `phone` scan types (via the `telegram-proxy` edge function directly).

## Architecture Overview

```text
[Re-run Telegram button]
        │
        ▼
[New Edge Function: telegram-retrigger]
        │  Validates: user owns the scan, scan type, clears idempotency lock
        ├─── username scan ──► POST n8n Telegram Username Webhook (fire-and-forget)
        └─── phone scan ──────► POST telegram-proxy (phone_presence action)
        │
        ▼
[Clears telegram_triggered_at + old findings/artifacts]
        │
        ▼
[Results arrive via existing n8n-scan-results webhook]
        │
        ▼
[Telegram findings realtime subscription refreshes UI]
```

## Why a new edge function (not calling telegram-proxy directly)?

The `telegram-proxy` currently only allows:
- n8n gateway key (`x-n8n-key`) — secret, never exposed to browser
- Admin JWT — users are not admins

Calling it directly from the frontend is not safe. The new `telegram-retrigger` function:
1. Authenticates the user via their Supabase JWT
2. Verifies they own the workspace the scan belongs to
3. Clears the `telegram_triggered_at` idempotency lock (allowing re-trigger)
4. Optionally deletes stale findings from the previous failed attempt
5. Routes to the correct backend (n8n webhook for username, telegram-proxy for phone)

## Files to Create / Edit

### 1. New: `supabase/functions/telegram-retrigger/index.ts`

New edge function with:
- JWT auth: validates user is authenticated
- Ownership check: user must be a member of the scan's workspace
- Clears `telegram_triggered_at` from the `scans` table
- Deletes existing `findings` rows where `provider = 'telegram'` for this scan (stale data cleanup)
- Deletes existing `scan_artifacts` rows where `source = 'telegram'` for this scan
- For `scan_type = 'username'`: fires the n8n Telegram Username Webhook (same payload as `n8n-scan-trigger`)
- For `scan_type = 'phone'`: calls `telegram-proxy` with action `phone_presence` using the service role key + gateway key
- Returns `{ ok: true, message: '...' }` immediately (fire-and-forget)

### 2. Edit: `src/components/scan/results-tabs/TelegramTab.tsx`

- Add a `scanType` prop (`'username' | 'phone' | string`)
- Add a `RetriggerButton` component at the top of the "no data" empty state and also in the header bar when data exists
- Uses `supabase.functions.invoke('telegram-retrigger', ...)` from the frontend
- Shows: idle → loading spinner → success toast → resets (relies on realtime to update findings)
- Rate-limited in UI: disables button for 30 seconds after click to prevent spam

### 3. Edit: `src/components/scan/AdvancedResultsPage.tsx`

- Pass `scanType={job?.scan_type}` to `<TelegramTab>` so it knows which re-trigger path to use

## User Experience Flow

1. User opens the Telegram tab for a failed/empty scan
2. Sees "No Telegram data found" empty state with a **Re-run Telegram Scan** button
3. Clicks the button → spinner → toast "Telegram scan re-triggered. Results will appear shortly."
4. Button disables for 30s (prevents double-clicks)
5. When worker completes and posts results back → realtime subscription in `useTelegramFindings` fires → findings appear automatically
6. If data already exists (partial results), button also appears in the header as a small "Re-scan" icon button

## Technical Details

### Idempotency Lock Clearing
The `telegram_triggered_at` timestamp in the `scans` table acts as an idempotency guard in `n8n-scan-trigger`. The retrigger function sets this to `NULL` before firing the new request, which allows the workflow to run again.

### Stale Data Cleanup
Before re-triggering, the function deletes:
- `findings` where `scan_id = ? AND provider = 'telegram'`
- `scan_artifacts` where `scan_id = ? AND source = 'telegram'`

This ensures the UI doesn't show mixed old + new results.

### Auth Flow for the Edge Function
```
Frontend (user JWT)
  → telegram-retrigger (validates JWT + workspace membership)
    → clears DB idempotency lock
    → fires n8n webhook (using server-side env vars for secrets)
    → returns 200 OK immediately
```

### No new secrets needed
All required secrets already exist:
- `N8N_TELEGRAM_USERNAME_WEBHOOK_URL` — for username scans
- `N8N_GATEWAY_KEY` — for phone_presence via telegram-proxy
- `SUPABASE_SERVICE_ROLE_KEY` — available in all edge functions by default
