
## Root Cause: `/telegram/username` Route Missing from Worker

The Telegram worker (`server.py`) only registers two routes in its `ROUTES` dictionary:

```
ROUTES = {
    "/telegram/channel-scrape": handle_channel_scrape,
    "/telegram/activity-intel": handle_activity_intel,
}
```

When the n8n Telegram Username workflow calls `telegram-proxy` with `action: "username"`, the proxy maps it to `/telegram/username` — which doesn't exist. The worker returns a `404`, which the proxy interprets as "entity not found" and returns empty findings. This is why the Telegram tab always shows "No Telegram data found."

---

### Evidence

- `telegram-proxy` logs at `00:55:03Z`: **Worker returned 404** for scan `6c0f0f78-e99c-49c1-8443-6e9fb71a965e`
- Database: `telegram_findings_count: 0`, `total_findings_count: 179` — other providers worked, Telegram did not
- `scan_artifacts` table: empty for this scan
- `server.py` line 680–683: `ROUTES` only contains `channel-scrape` and `activity-intel`

---

### The Fix (Two Parts)

**Part 1 — `workers/telegram-worker/server.py`**

Add `/telegram/username` to the `ROUTES` dictionary, aliased to `handle_channel_scrape`. A username on Telegram is treated the same as a channel handle — the `channel_scrape` handler already normalises `@handle` targets and resolves them via Telethon. No new handler code needed.

```python
ROUTES = {
    "/telegram/username":        handle_channel_scrape,   # ← ADD THIS
    "/telegram/channel-scrape":  handle_channel_scrape,
    "/telegram/activity-intel":  handle_activity_intel,
}
```

This means the n8n username workflow will now correctly resolve a username as a public profile and return `channel_profile` findings + artifacts — which the existing `ChannelProfileCard` UI component already renders.

**Part 2 — `supabase/functions/n8n-scan-trigger/index.ts`**

The payload sent to the Telegram username n8n workflow currently only includes `username` and `query` fields. The `telegram-proxy` edge function requires a `channel` field for `channel_scrape`-style actions. When the proxy receives `action: "username"`, it looks for `body.username` ✅ — this is already handled in the proxy. No change needed here.

However, confirm the `workerPayload` in `telegram-proxy` for `action: "username"` sends `workerPayload.username = username.trim()` (line 332) — but `handle_channel_scrape` looks for `payload.get("channel", "") or payload.get("query", "")`, **not** `payload.get("username")`. This means even after the route fix, the username won't be passed correctly to the handler.

So the worker payload mapping also needs fixing: either the proxy sends `channel = username` for `action: "username"`, or the `handle_channel_scrape` handler also checks `payload.get("username")`.

The cleanest fix: update the `telegram-proxy` worker payload builder to include `channel = username` when `action = "username"`:

```typescript
case "username":
  workerPayload.username = username.trim();
  workerPayload.channel = username.trim();  // ← ADD: channel_scrape reads this field
  break;
```

---

### Files to Change

| File | Change |
|---|---|
| `workers/telegram-worker/server.py` | Add `/telegram/username` to `ROUTES`, aliased to `handle_channel_scrape` |
| `supabase/functions/telegram-proxy/index.ts` | Add `workerPayload.channel = username.trim()` for `action: "username"` |

---

### Why No New Handler Is Needed

For username-based Telegram OSINT, the `channel_scrape` handler is the correct approach:
- Usernames on Telegram map directly to public channels/users
- `handle_channel_scrape` already normalises `@handle` → bare handle
- It returns `channel_profile` findings which the `ChannelProfileCard` UI already renders
- This keeps the worker lean and avoids duplicating entity-resolution logic

After this fix, username scans will produce Telegram results visible in the Telegram tab immediately.
