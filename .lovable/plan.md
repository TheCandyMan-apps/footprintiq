
# Root Cause: n8n Telegram Workflow Has Wrong Field References

## The Problem (Confirmed)

The n8n workflow's **`HTTP - Telegram Proxy (username)`** node is calling the Telegram proxy with a **blank username** because of a field reference mismatch.

The `telegram-retrigger` edge function sends a flat payload:
```json
{
  "scanId": "...",
  "username": "jayquee",
  "query": "jayquee",
  "tier": "pro",
  ...
}
```

But the n8n workflow's **`SET - Defaults`** node reads the tier field as:
```
={{ $json.body.tier ?? 'free' }}
```

...using `.body.` prefix. This works when the webhook trigger wraps the body (standard n8n webhook behaviour with `"body"` wrapper), but the proxy call then uses `$('SET - Defaults').item.json.body.username` — and since the `SET - Defaults` node only mapped `tier` with the `.body.` prefix but not `username`, the username extracted is empty.

**Evidence from the proxy call body in the workflow:**
```json
{
  "action": "username",
  "query": "{{ $('SET - Defaults').item.json.body.username }}",
  "username": "{{ $('SET - Defaults').item.json.body.username }}"
}
```

When `body.username` is undefined, the proxy gets `query=""` and returns nothing.

This is the reason `findings: []` is always returned — the Telegram proxy is being asked to look up an empty string.

---

## The Fix: Two Changes in the n8n Workflow

### Change 1 — `SET - Defaults` node: Fix field references
The `query` field currently reads `={{ $json.query || $json.username || '' }}` at the top level, which IS correct. But `tier` uses `$json.body.tier` which forces a `.body.` prefix that breaks downstream references.

The fix is to update the `SET - Defaults` node to also extract `scanId`, `username`, and `workspaceId` at the same level, so downstream nodes can use `$('SET - Defaults').item.json.username` consistently.

**Fields to add/fix in SET - Defaults:**
- `username` → `={{ $json.body.username || $json.username || '' }}`
- `scanId` → `={{ $json.body.scanId || $json.scanId || '' }}`
- `workspaceId` → `={{ $json.body.workspace_id || $json.workspace_id || '' }}`
- `tier` → `={{ $json.body.tier || $json.tier || 'free' }}` (already correct logic, just needs fallback)

### Change 2 — `HTTP - Telegram Proxy (username)` node: Use the fixed references
After fixing SET - Defaults, update the proxy body to use the mapped fields:
```json
{
  "action": "username",
  "query": "{{ $('SET - Defaults').item.json.username }}",
  "username": "{{ $('SET - Defaults').item.json.username }}",
  "scanId": "{{ $('SET - Defaults').item.json.scanId }}",
  "workspaceId": "{{ $('SET - Defaults').item.json.workspaceId }}",
  "tier": "{{ $('SET - Defaults').item.json.tier }}"
}
```

### Change 3 — `HTTP - Results (Telegram findings)` node: Fix scanId reference
The results node sends `$('SET - Defaults').item.json.body.scanId` — also broken. Fix to use `$('SET - Defaults').item.json.scanId`.

---

## What You Need to Do in n8n

These are n8n workflow configuration changes — they cannot be made from code and must be done directly in the n8n Cloud UI.

### Step-by-step in n8n:

**1. Open `SET - Defaults` node → add these string fields:**

| Name | Value |
|---|---|
| `username` | `={{ $json.body.username \|\| $json.username \|\| '' }}` |
| `scanId` | `={{ $json.body.scanId \|\| $json.scanId \|\| '' }}` |
| `workspaceId` | `={{ $json.body.workspace_id \|\| $json.workspace_id \|\| $json.body.workspaceId \|\| $json.workspaceId \|\| '' }}` |
| `tier` (fix existing) | `={{ $json.body.tier \|\| $json.tier \|\| 'free' }}` |

**2. Open `HTTP - Telegram Proxy (username)` node → update JSON body to:**
```json
{
  "action": "username",
  "query": "{{ $('SET - Defaults').item.json.username }}",
  "username": "{{ $('SET - Defaults').item.json.username }}",
  "scanId": "{{ $('SET - Defaults').item.json.scanId }}",
  "userId": "{{ $('SET - Defaults').item.json.body.userId || $json.body.userId }}",
  "workspaceId": "{{ $('SET - Defaults').item.json.workspaceId }}",
  "tier": "{{ $('SET - Defaults').item.json.tier }}"
}
```

**3. Open `HTTP - Results (Telegram findings)` node → update JSON body to:**
```json
{
  "scanId": "{{ $('SET - Defaults').item.json.scanId }}",
  "source": "telegram",
  "ok": true,
  "findings": {{ JSON.stringify($json.findings || []) }}
}
```

---

## Verification

After saving the workflow in n8n, click **"Re-run Telegram Scan"** on the jayquee results page. The proxy should now receive `username: "jayquee"` and return findings, which will post back to the results endpoint populated.

---

## Technical Details

- The webhook trigger in n8n wraps the incoming POST body under a `.body` property automatically when using the "Webhook" node in "default" response mode. 
- The `SET - Defaults` node partially accounted for this with `.body.tier` but left `username` and `scanId` unmapped, causing empty proxy calls.
- The `findings: []` in every Telegram callback is **not a backend bug** — it is a data extraction failure in n8n before the callback is even made.
- No Supabase edge function changes are required. The edge functions are working correctly.
