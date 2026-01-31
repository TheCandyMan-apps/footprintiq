

## Email Scan Failure Fix — Plan

### Problem Summary
Email scans on free tier are failing with `400 Bad Request: Missing username` because:
1. The backend routes **all** free-tier scans to the Quick Scan n8n workflow
2. That workflow only runs WhatsMyName, which requires a `username` (not an email)
3. When an email scan is triggered, WhatsMyName receives `username: null` and fails

### Root Cause
In `n8n-scan-trigger/index.ts`:
```text
Line 73:  isFreeTierScan = tier === "free" && n8nFreeScanWebhookUrl
Line 284: webhookUrl = isFreeTierScan ? n8nFreeScanWebhookUrl : n8nWebhookUrl
```
This sends **all** free-tier scans (including email) to the quick scan workflow, but that workflow only supports usernames.

---

### Proposed Fix

#### Option A: Backend-Only Fix (Recommended)
Restrict the free quick scan workflow to username scans only.

**File: `supabase/functions/n8n-scan-trigger/index.ts`**

Change line 73 from:
```typescript
const isFreeTierScan = tier === "free" && n8nFreeScanWebhookUrl;
```
To:
```typescript
const isFreeTierScan = tier === "free" && scanType === "username" && n8nFreeScanWebhookUrl;
```

This ensures:
- Username scans on free tier → Quick Scan workflow (WhatsMyName)
- Email/phone/domain scans on free tier → Standard workflow (with Holehe, etc.)

#### Alternative Option B: n8n Workflow Update
Add conditional routing in n8n to select the correct tool based on `scanType`:
- If `scanType === 'username'` → Run WhatsMyName node
- If `scanType === 'email'` → Run Holehe node

This requires manual changes in the n8n workflow editor.

---

### Technical Details

| Aspect | Current Behavior | Fixed Behavior |
|--------|------------------|----------------|
| Free + Username | Quick Scan (WhatsMyName) ✅ | Quick Scan (WhatsMyName) ✅ |
| Free + Email | Quick Scan (WhatsMyName) ❌ | Standard Scan (Holehe) ✅ |
| Free + Phone | Quick Scan (WhatsMyName) ❌ | Standard Scan (PhoneInfoga) ✅ |

---

### Files to Modify
1. `supabase/functions/n8n-scan-trigger/index.ts` — Add `scanType === "username"` condition to `isFreeTierScan`

### Impact
- Email scans on free tier will now route to the standard n8n workflow
- Those scans will use the appropriate email provider (Holehe) instead of WhatsMyName
- No changes required to the n8n workflow itself

---

### Testing Steps
1. Run a free-tier email scan (e.g., `test@example.com`)
2. Verify it routes to the standard workflow (not quick scan)
3. Confirm Holehe is called with the email parameter
4. Verify results are returned correctly

