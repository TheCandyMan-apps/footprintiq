
# Fix: Pass Turnstile Token to n8n-scan-trigger

## Problem Summary
Scans fail for free tier users with "Scan Not Found" because the Turnstile verification token is not being passed to the backend.

**Flow breakdown:**
1. User completes Turnstile captcha in `ScanForm` 
2. Token is correctly added to `scanData.turnstile_token`
3. `ScanProgress` receives `scanData` with the token
4. `ScanProgress` builds `requestBody` but **omits** `turnstile_token`
5. Edge function receives request without token
6. Turnstile validation fails: `[turnstile] Missing token for free tier user`
7. Edge function returns 400 error (NOT 200)
8. No scan record is created in database
9. UI navigates to `/results/{scanId}` but that scan doesn't exist

## Solution
Add `turnstile_token` to the request body in `ScanProgress.tsx` when it exists in `scanData`.

## Technical Changes

### File: `src/components/ScanProgress.tsx`

**Location:** After line 104 (after phone handling, before the log statement)

**Add:**
```typescript
// Include turnstile token for free tier verification
if (scanData.turnstile_token) {
  requestBody.turnstile_token = scanData.turnstile_token;
}
```

This single change will ensure the token flows through to the edge function:

```text
┌──────────────────────────────────────────────────────────────┐
│  ScanForm                                                    │
│  ─────────                                                   │
│  User completes Turnstile → turnstileToken stored            │
│  On submit: scanData.turnstile_token = turnstileToken        │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  ScanPage                                                    │
│  ────────                                                    │
│  Receives scanData, passes to ScanProgress                   │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  ScanProgress (THE FIX)                                      │
│  ─────────────────────────                                   │
│  Builds requestBody including:                               │
│    - scanId, scanType, workspaceId                           │
│    - username, email, phone, etc.                            │
│    - turnstile_token ← ADD THIS                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  n8n-scan-trigger Edge Function                              │
│  ──────────────────────────────                              │
│  enforceTurnstile() receives token                           │
│  Verification passes → scan record created                   │
│  n8n workflow triggered successfully                         │
└──────────────────────────────────────────────────────────────┘
```

## Expected Outcome
After this fix:
- Free tier users complete Turnstile verification
- Token is passed through the entire flow
- Edge function validates token successfully
- Scan record is created in database
- n8n workflow is triggered
- Results display correctly

## Risk Assessment
- **Low risk**: Single line addition
- **No breaking changes**: Only adds field when present, doesn't affect Pro/Business users who bypass Turnstile
- **Backwards compatible**: Token is optional in request body
