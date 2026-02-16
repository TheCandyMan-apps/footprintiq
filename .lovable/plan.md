

## HMAC Signature Verification for n8n Webhook Functions

### Overview
Add optional HMAC-SHA256 signing verification to `n8n-scan-progress` and `n8n-scan-results`. When the `x-fpiq-ts` and `x-fpiq-sig` headers are present, the function validates the signature before processing. Existing `x-n8n-key` and `x-callback-token` auth remain as fallbacks.

### New Secret
- `N8N_WEBHOOK_HMAC_SECRET` — shared HMAC signing key between n8n and FootprintIQ

### Authentication Priority (updated)
1. **HMAC** (preferred) — if `x-fpiq-ts` + `x-fpiq-sig` headers are present, verify signature; reject on mismatch or clock drift > 300s
2. **x-n8n-key** — existing shared secret check (unchanged)
3. **x-callback-token / Authorization** — legacy fallback (unchanged)

### Signature Scheme
```text
message  = "${x-fpiq-ts}.${rawBody}"
expected = HMAC-SHA256(N8N_WEBHOOK_HMAC_SECRET, message) → hex
compare  = x-fpiq-sig === expected
reject if |Date.now()/1000 - x-fpiq-ts| > 300
```

### Technical Changes

**1. Create shared HMAC utility** (`supabase/functions/_shared/hmacAuth.ts`)
- `verifyFpiqHmac(rawBody, headers)` function that:
  - Reads `x-fpiq-ts` and `x-fpiq-sig` from headers
  - Reads `N8N_WEBHOOK_HMAC_SECRET` from env
  - Returns `{ authenticated: true }` or `{ authenticated: false, error: string }`
  - Checks timestamp drift (rejects if > 300 seconds)
  - Computes HMAC-SHA256 using Web Crypto API (`crypto.subtle`)
  - Uses constant-time comparison where possible

**2. Update `n8n-scan-progress/index.ts`**
- Add `x-fpiq-ts, x-fpiq-sig` to CORS `Access-Control-Allow-Headers`
- Read raw body with `await req.text()` BEFORE any JSON parsing
- Insert HMAC check as the first auth method (before `x-n8n-key`)
- Parse JSON from the raw body string (`JSON.parse(rawBody)`) instead of `req.json()`

**3. Update `n8n-scan-results/index.ts`**
- Same CORS, raw body, and HMAC changes as progress function
- Replace `await req.json()` with `JSON.parse(rawBody)`

**4. Add secret**
- Use the secrets tool to request `N8N_WEBHOOK_HMAC_SECRET` from the user

### Auth Flow (both functions)

```text
1. Read rawBody = await req.text()
2. If x-fpiq-ts AND x-fpiq-sig present:
     - If N8N_WEBHOOK_HMAC_SECRET not set → 401 "HMAC secret not configured"
     - If |now - ts| > 300s → 401 "Timestamp expired"
     - Compute expected sig, compare → 401 "Signature mismatch" or pass
3. Else if x-n8n-key present → existing check (unchanged)
4. Else → legacy x-callback-token check (unchanged)
5. body = JSON.parse(rawBody) — rest of function unchanged
```

### Error Responses (401)
- `"HMAC verification failed: secret not configured"` — secret missing on server
- `"HMAC verification failed: timestamp expired"` — clock drift > 5 minutes
- `"HMAC verification failed: signature mismatch"` — bad signature

### What Stays the Same
- All downstream logic (DB writes, broadcasts, payload extraction)
- Existing `x-n8n-key` and `x-callback-token` auth paths
- CORS preflight handling

