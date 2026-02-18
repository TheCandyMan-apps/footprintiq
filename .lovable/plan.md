
## Root Cause: Username Route Uses Wrong Handler

The `/telegram/username` route is aliased to `handle_channel_scrape`, which **explicitly rejects** non-channel entities:

```python
if not isinstance(entity, Channel):
    return error_response("INVALID_TARGET", f"Target '{handle}' is not a channel/supergroup.")
```

For scan `f5c89120` (target: `Jammmy10`), `get_entity("Jammmy10")` returns a Telethon `User` object (a personal account). The channel check fails immediately, the worker returns `{"ok": false, "error": "INVALID_TARGET"}`, the proxy sees "not found" in the response and silently returns empty findings.

This is why **every personal account username scan returns no Telegram data** — the handler is channel-only.

---

### The Fix: Dedicated `handle_username_lookup` Handler

Create a new handler in `server.py` specifically for the `/telegram/username` route. It must handle **both** cases:
- `User` entities → personal account profile
- `Channel` entities → public channel profile (fallback to existing channel logic)

**Handler logic:**

```python
async def handle_username_lookup(payload: dict) -> dict:
    username = payload.get("username", "") or payload.get("channel", "") or payload.get("query", "")
    handle = normalize_target(username)

    entity = await client.get_entity(handle)

    if isinstance(entity, User):
        # Personal account — extract public fields only
        return {
            "ok": True,
            "findings": [...],       # profile finding
            "artifacts": {
                "channel_profile": {...}  # maps to existing UI key
            }
        }
    elif isinstance(entity, Channel):
        # Delegate to channel scrape logic
        return await handle_channel_scrape(payload)
    else:
        return error_response("INVALID_TARGET", ...)
```

**Personal account findings to return** (public data only, no private info):
- `kind: "profile"` / `kind: "telegram_username"` — maps to existing `ChannelProfileCard` UI
- `display_name`, `username`, `bio` (if public), `photo_present`, `verified`, `bot` flag, `last_seen_bucket`

**Artifacts key**: `channel_profile` — the existing `ChannelProfileCard` component already reads this artifact type, so no UI changes needed.

---

### Files to Change

| File | Change |
|---|---|
| `workers/telegram-worker/server.py` | Add `handle_username_lookup` handler; update ROUTES to point `/telegram/username` at the new handler |

No proxy or UI changes needed — the proxy already correctly routes `action=username` to `/telegram/username` and the UI already renders `channel_profile` artifacts.

---

### Technical Details

**Why the alias broke silently:** The proxy's "not found" guard catches `INVALID_TARGET` errors (which contain "not found") and converts them to a graceful empty-findings 200. This is correct defensive behaviour for genuinely non-existent accounts, but it masked the miscategorised error for valid personal accounts.

**Public-only fields from Telethon `User`:**
- `user.first_name`, `user.last_name`, `user.username` — always public
- `user.photo` — presence boolean only (no download)
- `user.verified`, `user.bot` — flags
- `user.status` — mapped to a bucket: `recently / within_week / within_month / long_ago / unknown`
- `user.about` (bio) — requires `GetFullUserRequest`, public if user hasn't restricted it

**Privacy compliance:** No private messages, no contact list access, no mutual contacts — only what's visible to any Telegram user looking up the handle.
