

## Fix Telegram Proxy Validation + n8n Field Reference

### Problem
The Telegram Proxy node call fails with "Missing required fields: scanId, workspaceId, userId, tier" because:

1. **`tier` reference is wrong in n8n**: The Proxy node uses `$('SET - Defaults').item.json.tier` but the data is nested at `$('SET - Defaults').item.json.body.tier`
2. **`workspaceId` is empty string**: The edge function validation `!workspaceId` treats `""` as falsy/missing

### Fix 1: Update `telegram-proxy` edge function validation (code change)

In `supabase/functions/telegram-proxy/index.ts`, change the validation to allow empty `workspaceId`:

```typescript
// Before:
if (!scanId || !workspaceId || !userId || !tier) {

// After:
if (!scanId || workspaceId === undefined || workspaceId === null || !userId || !tier) {
```

Or more simply, just remove `workspaceId` from the required check since it can legitimately be empty.

### Fix 2: Update n8n Proxy node `tier` reference (user action in n8n)

In the **HTTP - Telegram Proxy (username)** node, update the JSON body `tier` field:

```
// Before:
"tier": "{{ $('SET - Defaults').item.json.tier }}"

// After:
"tier": "{{ $('SET - Defaults').item.json.body.tier }}"
```

### Steps

1. Update the `telegram-proxy` edge function to relax the `workspaceId` validation
2. User updates the n8n Proxy node `tier` reference to `body.tier` and publishes
3. Re-trigger the workflow to verify end-to-end success

### Technical Detail

The SET - Defaults node passes through the webhook body as-is under `.body`, so all fields from the trigger payload are at `item.json.body.*`. The Proxy node correctly references `body.username`, `body.scanId`, `body.userId`, `body.workspaceId` — but `tier` was incorrectly referenced at the root level without `body.`.

