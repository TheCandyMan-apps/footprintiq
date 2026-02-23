
# Fix Telegram Profile Detection Pipeline

## Problem
The Telegram worker now correctly resolves usernames and returns `{ok: true, entity_metadata: {...}}`. However, the `telegram-proxy` edge function only forwards `result.findings` (which the worker doesn't populate) — resulting in zero findings reaching `n8n-scan-results`, which writes a false `telegram.not_found` sentinel.

**Evidence from logs (all recent scans):**
- Proxy correctly calls `https://telegram-worker-.../telegram/username`
- Worker returns 404 "Entity not found" (was stale — user confirms now fixed)
- n8n-scan-results receives `{"findings":[]}` and writes `telegram.not_found`

## Root Cause
The `telegram-proxy` at line 547 does: `const findings = (result.findings || [])` — but the worker returns entity data in `entity_metadata`, not in a `findings` array. The proxy never synthesizes a finding from this data.

## Plan

### 1. Update `telegram-proxy` to synthesize findings for `action=username`

After parsing a successful worker response (line 464), add logic to create a finding when:
- `typedAction === "username"`
- `result.entity_metadata` exists (worker resolved the username)
- `result.findings` is empty or missing

The synthesized finding will:
- Be inserted directly into the `findings` table (using the service client already available)
- Use `provider: "telegram"`, `kind: "telegram_username"`
- Extract evidence from `entity_metadata` fields (first_name, last_name, username, phone, is_bot, is_verified, photo, last_seen, etc.)
- Set `confidence: 0.9` (high — direct MTProto resolution)
- Include a `meta` object with `title`, `description`, `source: "telegram"` matching the UI's expected format
- Also delete any prior `telegram.not_found` sentinel for this scan

The finding will also be appended to the `findings` array returned to n8n, so `n8n-scan-results` sees it too and won't write a false `telegram.not_found`.

### 2. Store `entity_metadata` as a scan artifact

Add `entity_metadata` to the `ARTIFACT_KEYS` list so the full metadata blob is persisted in `scan_artifacts` for the UI's lazy-load artifact system.

### 3. Deploy and retrigger

- Deploy the updated `telegram-proxy` edge function
- Retrigger the latest jayquee scan (scan `39a59078`) to verify end-to-end

## Technical Detail

```text
BEFORE (broken):
Worker returns: {ok: true, entity_metadata: {first_name, username, ...}}
Proxy reads:    result.findings || [] --> []
n8n receives:   {findings: []}
n8n-scan-results: writes telegram.not_found

AFTER (fixed):
Worker returns: {ok: true, entity_metadata: {first_name, username, ...}}
Proxy creates:  finding from entity_metadata --> [{provider: "telegram", kind: "telegram_username", ...}]
Proxy inserts:  finding directly into DB
Proxy returns:  {findings: [{...}]} to n8n
n8n-scan-results: stores finding, skips not_found sentinel
UI displays:    Profile card with Telegram data
```

## Files Changed
- `supabase/functions/telegram-proxy/index.ts` — Add entity_metadata-to-finding synthesis for username action
