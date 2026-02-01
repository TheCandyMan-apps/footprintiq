

# Phone Scan Pipeline Fix

## Problem Identified

**All phone scans are failing** because the `phone-intel` edge function is rejecting calls from the `n8n-scan-trigger` function with a **401 Unauthorized** error.

### Root Cause

When `n8n-scan-trigger` triggers a phone scan, it calls `phone-intel` with the service role key:

```typescript
fetch(`${supabaseUrl}/functions/v1/phone-intel`, {
  headers: {
    'Authorization': `Bearer ${serviceRoleKey}`,  // Service role key
  },
  ...
})
```

However, `phone-intel` uses `validateAuth(req)` which attempts to decode this as a **user JWT** token:

```typescript
const authResult = await validateAuth(req);  // Fails with service role key
if (!authResult.valid) {
  return 401 Unauthorized;  // Always returns this!
}
```

This means every phone scan immediately fails authentication and produces zero findings.

**Evidence:**
- Edge function logs show: `phone-intel responded: 401`
- All 10 recent phone scans have status: `completed_empty`
- No findings exist for any phone scans

---

## Solution

Update `phone-intel` to handle **internal service-to-service calls** the same way `email-intel` does (which works correctly).

### Changes Required

**File: `supabase/functions/phone-intel/index.ts`**

1. **Add detection for internal calls**
   - Check if request is using service role key
   - Allow internal calls to bypass user auth

2. **Modify authentication logic**
   - If service role key detected, extract userId from request body instead
   - If user token provided, validate normally via `validateAuth()`

3. **Pattern match email-intel**
   - `email-intel` simply uses the service role key directly and trusts the payload
   - Apply same pattern for consistency

---

## Technical Details

### Current (Broken) Code

```typescript
// phone-intel/index.ts line 169-177
const authResult = await validateAuth(req);
if (!authResult.valid || !authResult.context) {
  return new Response(
    JSON.stringify({ error: authResult.error || 'Unauthorized' }),
    { status: 401, headers: ... }
  );
}
const userId = authResult.context.userId;
```

### Fixed Code

```typescript
// Detect if this is an internal service call (from n8n-scan-trigger)
const authHeader = req.headers.get('Authorization');
const isInternalCall = authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');

let userId: string;

if (isInternalCall) {
  // Internal call from n8n-scan-trigger - trust the payload
  const body = await req.json();
  if (!body.scanId || !body.phone) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields for internal call' }),
      { status: 400, ... }
    );
  }
  // Get userId from scan record (trusted internal flow)
  const { data: scan } = await supabase
    .from('scans')
    .select('user_id')
    .eq('id', body.scanId)
    .single();
  
  if (!scan?.user_id) {
    return new Response(
      JSON.stringify({ error: 'Invalid scan ID' }),
      { status: 400, ... }
    );
  }
  userId = scan.user_id;
} else {
  // External call - require user auth
  const authResult = await validateAuth(req);
  if (!authResult.valid || !authResult.context) {
    return 401 Unauthorized;
  }
  userId = authResult.context.userId;
}
```

---

## Verification Steps

After the fix:

1. Re-run a phone scan
2. Check `scan_provider_events` table for provider activity
3. Check `findings` table for phone intelligence results
4. Verify scan status changes from `completed_empty` to `completed`

---

## Affected Files

| File | Change |
|------|--------|
| `supabase/functions/phone-intel/index.ts` | Add internal call detection and bypass auth for service-to-service calls |

