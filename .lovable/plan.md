
## Root Cause: Telegram n8n Workflow Calls n8n-scan-results Prematurely

### The Smoking Gun

Logs for scan `bd945154` (Cheekyblueeyes21, completed in 3.5s) confirm exactly what's happening:

```
[n8n-scan-results] Body: {"scanId":"bd945154...","source":"telegram","ok":true,"findings":[]}
[n8n-scan-results] Scan bd945154 completed with status: completed
```

The **Telegram username n8n workflow** fires a callback to `n8n-scan-results` only 4 seconds after scan creation, with `findings: []`. The `n8n-scan-results` function then:
1. Writes `status: completed` to the `scans` table immediately
2. Broadcasts a `scan_complete` realtime event
3. The UI's 2-second polling loop picks it up and shows "Scan Complete" in 3s

The real OSINT workers (Sherlock, Maigret, GoSearch, WhatsMyName) are still running — the `scan_events` table confirms Sherlock didn't complete until 01:40:27 (77 seconds later), then GoSearch started at 01:40:28.

---

### Why This Happens

The Telegram username workflow in n8n is designed to call `n8n-scan-results` when it finishes its work. However, `n8n-scan-results` is **the terminal endpoint** — it's supposed to be called only once, by the **main OSINT workflow**, after ALL providers complete. The Telegram workflow calling it independently races with (and beats) the real scan.

The `n8n-scan-results` function currently has **no guard** against early or partial completion — it unconditionally sets `status: completed` and broadcasts `scan_complete`, regardless of whether the main workflow has finished.

---

### The Fix: Two-Pronged Approach

**Fix 1 — `n8n-scan-results` edge function: Ignore Telegram-source callbacks**

When the payload contains `"source":"telegram"`, the function should treat it as a partial result contribution — insert any findings, but **not** finalize the scan status. Instead, it should call `n8n-scan-progress` logic (update progress only).

**Fix 2 — `n8n-scan-results` edge function: Add a minimum elapsed time guard**

Before setting `status: completed`, check how long ago the scan was created. If less than 60 seconds have elapsed and only a Telegram/empty source sent results, skip finalization and return `200 OK` with `{"accepted": true, "finalized": false}`.

---

### Files to Change

| File | Change |
|---|---|
| `supabase/functions/n8n-scan-results/index.ts` | Add source guard: if `body.source === "telegram"`, insert findings but skip scan finalization (no status update, no broadcast). Return `{accepted: true, finalized: false}`. |

### What this achieves
- Telegram results (profile data, channel findings) are still stored correctly in the `findings` table
- The scan status is **not** prematurely set to `completed`
- The main OSINT workflow (Sherlock → GoSearch → Maigret → WhatsMyName) still finalizes the scan correctly via its own `n8n-scan-results` call after all providers complete
- No n8n workflow changes required — the fix is entirely within the edge function

### Technical Detail — The Guard Logic

```typescript
// After inserting findings, before updating scan status:

const isTelegramCallback = body.source === 'telegram' || body.source === 'telegram-proxy';

if (isTelegramCallback) {
  // Telegram partial results accepted — do NOT finalize the scan
  console.log(`[n8n-scan-results] Telegram callback for ${scanId} — findings stored, scan NOT finalized`);
  return new Response(JSON.stringify({ 
    accepted: true, 
    finalized: false, 
    reason: 'telegram_partial_results',
    findingsStored: findingsToInsert?.length || 0
  }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
```

This is a single conditional block inserted immediately after the findings insert block and before the scan status update block (lines ~413–489 of the current file). No other logic changes needed.
