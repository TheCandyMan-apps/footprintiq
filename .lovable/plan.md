
# Fix Plan: n8n Callback Token Authorization Issue

## Problem Identified

The n8n workflow has the correct structure, but there's a **token format mismatch** between what n8n sends and what the edge function expects.

### Evidence
- Scan `c9c8b91f-edc6-4bc9-8424-2161bbc6b824` stuck at `current_step: 0`
- **Zero scan_events** for this scan (no provider updates received)
- **No logs** for `n8n-scan-progress` (n8n callbacks never reach the function OR they're rejected as 401)

### Root Cause: Authorization Header Mismatch

The `n8n-scan-progress` edge function compares tokens using **exact string match**:

```typescript
const callbackToken = 
  req.headers.get('x-callback-token') || 
  req.headers.get('Authorization');
const expectedToken = Deno.env.get('N8N_CALLBACK_TOKEN');

if (callbackToken !== expectedToken) {
  return 401 Unauthorized;
}
```

If `N8N_CALLBACK_TOKEN = "my-secret-token"`:
- n8n sends `Authorization: my-secret-token` → Matches
- n8n sends `Authorization: Bearer my-secret-token` → Does NOT match
- n8n sends `x-callback-token: Bearer my-secret-token` → Does NOT match

---

## Solution Options

### Option A: Update n8n Workflow (Recommended)
In the n8n workflow, ensure the progress nodes send the callback token **without** "Bearer " prefix:

**Current (likely incorrect):**
```text
Header: Authorization = Bearer {{ $('Workflow Configuration').first().json.callbackToken }}
```

**Correct:**
```text
Header: x-callback-token = {{ $('Workflow Configuration').first().json.callbackToken }}
```

OR:
```text
Header: Authorization = {{ $('Workflow Configuration').first().json.callbackToken }}
```

### Option B: Update Edge Function to Handle "Bearer " Prefix
Modify the edge function to strip "Bearer " prefix before comparison:

```typescript
// In n8n-scan-progress/index.ts
let callbackToken = 
  req.headers.get('x-callback-token') || 
  req.headers.get('Authorization');

// Strip "Bearer " prefix if present
if (callbackToken?.startsWith('Bearer ')) {
  callbackToken = callbackToken.slice(7);
}

if (!callbackToken || callbackToken !== expectedToken) {
  return 401;
}
```

This is more flexible as it handles both formats.

---

## Recommended Approach

**Implement Option B** - This is more robust because:
1. It handles both `Authorization: Bearer <token>` and `Authorization: <token>`
2. It also handles `x-callback-token: Bearer <token>` if accidentally configured
3. It doesn't require changing the n8n workflow

### Changes Required

**File: `supabase/functions/n8n-scan-progress/index.ts`**

Update lines 20-40 to handle Bearer prefix:

```typescript
// Validate authentication token - accept both x-callback-token and Authorization headers
// for compatibility with different n8n workflow configurations
let callbackToken = 
  req.headers.get('x-callback-token') || 
  req.headers.get('Authorization');

// Strip "Bearer " prefix if present for flexibility
if (callbackToken?.startsWith('Bearer ')) {
  callbackToken = callbackToken.slice(7);
}

const expectedToken = Deno.env.get('N8N_CALLBACK_TOKEN');

if (!expectedToken) {
  console.error('[n8n-scan-progress] N8N_CALLBACK_TOKEN not configured');
  return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

if (!callbackToken || callbackToken !== expectedToken) {
  console.error('[n8n-scan-progress] Token mismatch. Received:', callbackToken?.substring(0, 10) + '...');
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

---

## Additional Fix: n8n-scan-results Endpoint

The same issue likely affects `n8n-scan-results`. Apply the same fix there to ensure results are received.

**File: `supabase/functions/n8n-scan-results/index.ts`**

Apply identical Bearer prefix stripping logic.

---

## Verification Steps

After applying the fix:

1. Deploy edge functions
2. Run a new Free tier scan
3. Check `n8n-scan-progress` logs - should see incoming requests
4. Watch `scan_progress` table - `current_step` should increment from 0 to 6
5. StepProgressUI should show checkmarks progressing

---

## Technical Details

### Token Flow
```text
n8n-scan-trigger
    ↓
    callbackToken = Deno.env.get('N8N_CALLBACK_TOKEN')  // e.g. "abc123"
    ↓
    Sends to n8n: { callbackToken: "abc123", ... }
    ↓
n8n Workflow Configuration
    ↓
    Stores: callbackToken = "abc123"
    ↓
Progress Nodes send:
    Authorization: Bearer abc123  ← Note the "Bearer " prefix added by n8n!
    ↓
n8n-scan-progress receives:
    req.headers.get('Authorization') = "Bearer abc123"
    ↓
Comparison: "Bearer abc123" !== "abc123"  ← MISMATCH!
    ↓
Returns 401 Unauthorized
```

### Why This Happens
n8n's HTTP Request node often adds "Bearer " prefix automatically when using Authorization headers. The workflow might look correct but the actual HTTP request includes the prefix.

---

## Summary

| File | Change |
|------|--------|
| `supabase/functions/n8n-scan-progress/index.ts` | Strip "Bearer " prefix from Authorization header before comparing to N8N_CALLBACK_TOKEN |
| `supabase/functions/n8n-scan-results/index.ts` | Same fix for results endpoint |

This is a backend-only fix that will make the edge functions more flexible in accepting token formats, resolving the 401 errors that are preventing n8n from sending progress updates.
