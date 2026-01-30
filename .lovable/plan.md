

# Integration Verification and Fixes

## Current Status

The Free Tier Quick Scan implementation is complete, with the n8n workflow created and MCP access enabled. However, there are **two configuration issues** that need to be resolved before the system will work end-to-end.

---

## Issue 1: Authorization Header Mismatch

### Problem
The n8n workflow progress nodes send the callback token using the `Authorization` header:
```
Authorization: {{ $json.callbackToken }}
```

But the `n8n-scan-progress` edge function expects the `x-callback-token` header:
```typescript
const callbackToken = req.headers.get('x-callback-token');
```

### Solution Options

**Option A (Recommended): Update the n8n workflow**
Change all progress nodes to use `x-callback-token` header instead of `Authorization`.

For each HTTP Request node (Progress: Checking reputation, Progress: Searching platforms, etc.):
- Change header from `Authorization` → `x-callback-token`
- Value remains: `={{ $json.callbackToken }}`

**Option B: Update the edge function**
Modify `n8n-scan-progress` to check both headers:
```typescript
const callbackToken = 
  req.headers.get('x-callback-token') || 
  req.headers.get('Authorization')?.replace('Bearer ', '');
```

I recommend **Option A** (updating n8n) because:
- It's consistent with the existing Unified OSINT workflow
- No code deployment required for header consistency
- The `Authorization` header has semantic meaning in HTTP that doesn't match this use case

---

## Issue 2: Worker URL Configuration

### Problem
The workflow has a placeholder value for the OSINT Worker URL:
```
"value":"<__PLACEHOLDER_VALUE__OSINT Worker API URL__>"
```

### Solution
Update the "Workflow Configuration" Set node in n8n to use the actual worker URL:
```
https://osint-multitool-worker-iikvulknua-ew.a.run.app
```

This is the same URL used by the Unified OSINT workflow.

---

## Verification Checklist

Once the fixes are applied, here's what should happen when a Free user runs a scan:

```text
1. User submits scan (Free tier)
      │
      ▼
2. ScanProgress passes tier='free' to edge function
      │
      ▼
3. n8n-scan-trigger routes to N8N_FREE_SCAN_WEBHOOK_URL
      │
      ▼
4. n8n Quick Scan workflow:
   ├── Step 1: POST progress (reputation_check)
   ├── Step 2: POST progress (platform_search)
   ├── Call WhatsMyName via worker
   ├── Step 3: POST progress (cross_reference)
   ├── Step 4: POST progress (entity_mapping)
   ├── Step 5: POST progress (georeferencing)
   ├── Step 6: POST progress (timeline)
   ├── POST results to n8n-scan-results
   └── POST final complete status
      │
      ▼
5. Frontend receives step_update broadcasts
      │
      ▼
6. StepProgressUI shows checklist with checkmarks
      │
      ▼
7. User sees engaging 6-step progress in ~10 seconds
```

---

## Next Steps

### Your action in n8n:

1. **Open the "Free Tier Username Reputation and Platform Scan" workflow**

2. **Update each HTTP Request progress node** to use correct header:
   - Change `Authorization` → `x-callback-token`
   - Nodes to update:
     - Progress: Checking reputation
     - Progress: Searching platforms
     - Progress: Cross-referencing
     - Progress: Mapping entities
     - Progress: Georeferencing
     - Progress: Building timeline
     - Progress: Complete

3. **Update the "Workflow Configuration" Set node**:
   - Change `workerUrl` from placeholder to:
     `https://osint-multitool-worker-iikvulknua-ew.a.run.app`

4. **Add Authorization header to "Run WhatsMyName" node** (if not present):
   - Header: `Authorization`
   - Value: `Bearer {{ $json.workerToken }}`

5. **Verify "Send Results" node** calls the correct endpoint:
   - URL: `{{ $json.resultsWebhookUrl }}`
   - Should resolve to: `https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/n8n-scan-results`

---

## Alternative: Code Fix

If you prefer, I can update the edge function to accept both header formats. This would be a quick code change:

```typescript
// Accept both x-callback-token and Authorization headers
const callbackToken = 
  req.headers.get('x-callback-token') || 
  req.headers.get('Authorization');
```

Let me know which approach you'd prefer:
- **Fix in n8n** (change headers to x-callback-token)
- **Fix in code** (accept both Authorization and x-callback-token)

---

## Testing

After fixes are applied, test by:
1. Sign out and sign in as a Free tier user (or use incognito)
2. Run a username scan
3. Verify the StepProgressUI shows the 6-step checklist
4. Confirm scan completes in ~10-15 seconds
5. Check results appear on FreeResultsPage

