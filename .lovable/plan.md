
## Telegram Integration End-to-End Test Plan

### Current Status (from live database)

All scans from the last hour show:
- `telegram_triggered_at = NULL` on every scan (trigger timestamp still not persisting)
- Zero Telegram findings on the 4 most recent scans for `shubham_27.2007` and `clemence.wtrs`
- The last Telegram result recorded was a `telegram.not_found` sentinel, written before the Cloud Run rebuild

This confirms the Cloud Run fix has not yet been validated — the worker hasn't successfully returned a positive result since the rebuild.

---

### Two Things to Test

#### Test 1: Cloud Run Worker Returns a Valid Account

The previous issue was that the worker returned a 404 even for accounts that exist. The MTProto `ResolveUsernameRequest` fallback was added to fix this.

**Action needed:** Run a fresh scan on a username with a **confirmed active Telegram account** (e.g., a public channel or a known active user). The Sherlock results for `shubham_27.2007` show active accounts on multiple platforms — this username is likely valid. If you have a username you can confirm exists on Telegram (e.g., your own), that is the ideal test.

**Expected result after the fix:**
- Cloud Run worker returns `200` with a profile payload
- `telegram-proxy` writes findings with `kind: telegram.profile` or similar
- TG tab shows profile data, not "not found"

#### Test 2: Trigger Timestamp Persistence

The `telegram_triggered_at` column is still NULL on all recent scans, meaning the `.update().eq().select('id')` fix in `n8n-scan-trigger` may not have deployed properly or the code path isn't being reached.

**Action needed:** After running the scan in Test 1, query the database directly to confirm `telegram_triggered_at` is non-null on the new scan row.

---

### What to Deploy / Verify Before Testing

The following edge functions were modified in previous sessions. Confirm they are at their latest deployed version:

1. `n8n-scan-trigger` — must have `.select('id')` on the `telegram_triggered_at` update
2. `telegram-proxy` — must include `observed_at` and `confidence` in the diagnostic insert
3. `telegram-retrigger` — must stamp `telegram_triggered_at` immediately after firing the webhook

---

### Test Execution Plan

#### Step 1: Run a new scan on a confirmed Telegram username
- Go to the FootprintIQ dashboard
- Start a username scan on a username you know has an active Telegram account
- Watch the Telegram tab in the scan results

#### Step 2: Observe the TG tab behaviour
- If the Cloud Run fix is working: the tab should transition from "Results pending" → profile data within 30–60 seconds
- If still returning not_found: the Cloud Run worker is still not resolving the entity correctly

#### Step 3: Re-trigger test
- On the same scan, use the "Re-trigger" button in the TG tab
- Confirm the 30-second cooldown activates
- Confirm a new result arrives via realtime

#### Step 4: Validate `telegram_triggered_at` in the database
- After the scan completes, check that the `telegram_triggered_at` column on the scan row is non-null
- If it is still null, the edge function update fix is not persisting — likely a deployment issue

---

### Technical Scope (if fixes are still needed after testing)

If Test 1 still returns 404 from the worker:
- The Cloud Run container needs to be rebuilt and redeployed with the `ResolveUsernameRequest` fallback using: `gcloud run deploy telegram-worker --source workers/telegram-worker/ --region europe-west2 --no-allow-unauthenticated`
- The specific issue is that the initial `GetEntityRequest` fails for some account types; the MTProto fallback is the fix

If `telegram_triggered_at` is still null:
- `n8n-scan-trigger` needs to be redeployed (the `.select('id')` change must be in the live function)
- Alternatively, the trigger code path for username scans may be taking a different branch that bypasses the update

No database migrations needed.
