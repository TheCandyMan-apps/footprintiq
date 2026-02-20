
## Fix: Harden the Telegram Worker Error Handling

### What's broken

The `handle_username_lookup` function in `workers/telegram-worker/server.py` uses a narrow string-match filter to decide whether to retry with `ResolveUsernameRequest`:

```python
if "no user" in err_str or "not found" in err_str or "cannot find" in err_str or "username" in err_str or "invalid" in err_str:
    # try fallback
else:
    raise  # ← This causes the 500
```

Any Telethon error that doesn't contain one of those substrings (e.g. `FloodWaitError`, `UsernameOccupiedError`, `UsernameNotOccupiedError`, `PeerIdInvalidError`, network timeouts) hits the bare `raise` and produces a 500 instead of a graceful 404.

### Fix strategy

1. **Broaden the fallback to catch all non-private, non-flood errors** — instead of matching specific strings, only `raise` for `FloodWaitError` (which needs to be surfaced as a 429) and unknown catastrophic errors. Catch everything else and attempt the `ResolveUsername` fallback before giving up.

2. **Add explicit `FloodWaitError` handling** — return a structured error with a `retry_after` hint so the proxy/n8n can back off gracefully instead of getting a hard 500.

3. **Wrap `GetFullUserRequest` bio fetch more safely** — currently it re-raises on unexpected errors; make it fully silent (non-fatal only).

### Files to change

- `workers/telegram-worker/server.py` — update `handle_username_lookup` error handling (~lines 769–792)

### Technical changes

In `handle_username_lookup`, replace the narrow `if/else raise` block with:

```python
except Exception as e:
    err_str = str(e).lower()
    err_type = type(e).__name__

    # FloodWait must surface as 429, not 500
    if "floodwait" in err_type.lower() or "flood_wait" in err_str:
        wait = getattr(e, 'seconds', 60)
        return error_response("FLOOD_WAIT", f"Rate limited by Telegram — retry after {wait}s", 429)

    # Private/invite link
    if "invite" in err_str or "private" in err_str:
        return error_response("PRIVATE_CHANNEL_UNSUPPORTED", "Private account or invite link.")

    # For ALL other errors, attempt ResolveUsername fallback before giving up
    log.info(f"[username_lookup] get_entity raised {err_type}: {e} — trying ResolveUsername fallback")
    try:
        from telethon.tl.functions.contacts import ResolveUsernameRequest
        resolved = await client(ResolveUsernameRequest(handle))
        if resolved.users:
            entity = resolved.users[0]
        elif resolved.chats:
            entity = resolved.chats[0]
        else:
            return error_response("INVALID_TARGET", f"Account not found: {handle}", 404)
    except Exception as e2:
        e2_type = type(e2).__name__
        if "floodwait" in e2_type.lower():
            wait = getattr(e2, 'seconds', 60)
            return error_response("FLOOD_WAIT", f"Rate limited — retry after {wait}s", 429)
        log.warning(f"[username_lookup] ResolveUsername also failed: {e2}")
        return error_response("INVALID_TARGET", f"Account not found: {handle}", 404)
```

This ensures:
- `FloodWaitError` → 429 (proxy/n8n can detect and back off)
- Private account → 403
- Any other lookup failure → tries `ResolveUsername`, then gracefully returns 404
- Nothing propagates as an unhandled 500

### After the code change

The worker code change requires a redeployment. The user will need to run:

```bash
cd ~/telegram-worker
gcloud run deploy telegram-worker \
  --source . \
  --region europe-west2 \
  --no-allow-unauthenticated \
  --project footprintiq
```

Then retrigger the `Jammmy10` scan using the retrigger button on the Telegram tab — it should resolve and return a profile this time.

### Why previous scans for Jammmy10 also returned not_found

All four previous scans also wrote `telegram.not_found`. The session was live but the entity resolution was silently failing — this fix will make the fallback path fire correctly for accounts that require the MTProto `ResolveUsername` path.
