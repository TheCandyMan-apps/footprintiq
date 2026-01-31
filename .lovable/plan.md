
# Email & Phone Scan Provider Fix

## Problem Summary

Email and phone scans are not calling the API providers (HIBP, Abstract Email, IPQS Email, Abstract Phone, IPQS Phone, NumVerify) because:

| Scan Type | What n8n-scan-trigger Lists | What n8n Actually Calls | What's Missing |
|-----------|----------------------------|------------------------|----------------|
| Email | holehe, abstract_email, ipqs_email, hibp | Holehe only | abstract_email, ipqs_email, **hibp** |
| Phone | phoneinfoga, abstract_phone, numverify, ipqs_phone | PhoneInfoga only | abstract_phone, numverify, ipqs_phone |

The n8n workflow only calls OSINT worker tools via HTTP requests to the OSINT worker service. It doesn't call the Supabase `provider-proxy` edge function which handles all the API providers.

---

## Root Cause

The architecture has two provider execution paths:

```text
Path A: OSINT Worker Tools (Sherlock, Maigret, GoSearch, Holehe, WhatsMyName, PhoneInfoga)
  n8n-scan-trigger → n8n workflow → OSINT Worker HTTP API → n8n-scan-results

Path B: API Providers (HIBP, Abstract, IPQS, NumVerify)  
  Phone: phone-intel edge function → Direct API calls → Database writes
  Email: ❌ NO HANDLER EXISTS
```

Phone scans work because `phone-intel` edge function exists and directly calls the API providers.
Email scans fail because there's no equivalent `email-intel` edge function.

---

## Proposed Solution

Create a new `email-intel` edge function that mirrors `phone-intel` structure:

### New File: `supabase/functions/email-intel/index.ts`

This function will:
1. Accept scanId, email, workspaceId, and providers list
2. Call each provider directly via their APIs:
   - **HIBP** - Have I Been Pwned breach database
   - **Abstract Email** - Email validation and deliverability
   - **IPQS Email** - Fraud scoring and disposable detection
3. Store findings directly in the database
4. Broadcast real-time progress updates
5. Update scan status when complete

### Update n8n-scan-trigger

For email scans, instead of sending to n8n (which only handles Holehe), call:
1. n8n workflow for Holehe (worker tool)
2. email-intel edge function for API providers (parallel)

---

## Technical Implementation

### 1. Create `email-intel` Edge Function

Structure (following phone-intel pattern):

```text
- Accept: { scanId, email, workspaceId, providers, userPlan }
- Providers to implement:
  - hibp: Call haveibeenpwned.com/api/v3/breachedaccount/{email}
  - abstract_email: Call emailvalidation.abstractapi.com/v1/
  - ipqs_email: Call ipqualityscore.com/api/json/email/
- Store findings in 'findings' table
- Track provider status in 'scan_events' table
- Broadcast progress via realtime channel
- Return: { success, findingsCount, providerResults }
```

### 2. Update n8n-scan-trigger

For email scans, add parallel call to email-intel:

```typescript
case 'email':
  // Fire n8n webhook for Holehe (worker tool)
  await triggerN8nWorkflow(n8nPayload);
  
  // Also call email-intel for API providers
  const emailIntelResponse = await supabase.functions.invoke('email-intel', {
    body: {
      scanId: scan.id,
      email: targetValue,
      workspaceId,
      providers: ["hibp", "abstract_email", "ipqs_email"],
      userPlan: tier
    }
  });
  break;
```

### 3. Required Secrets Check

The following API keys must be configured:
- `HIBP_API_KEY` - Have I Been Pwned
- `ABSTRACTAPI_EMAIL_VALIDATION_KEY` - Abstract Email
- `IPQS_API_KEY` - IPQualityScore

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/email-intel/index.ts` | CREATE | New edge function for email API providers |
| `supabase/functions/n8n-scan-trigger/index.ts` | MODIFY | Add parallel call to email-intel for email scans |

---

## Testing Steps

1. Run email scan for `katherinegrapsas@hotmail.com`
2. Check edge function logs for `email-intel`
3. Verify HIBP breach data appears in findings
4. Confirm Abstract/IPQS validation data is stored
5. Run phone scan to verify it still works with `phone-intel`

---

## Expected Results After Fix

| Email Scan | Provider | Data Returned |
|------------|----------|---------------|
| katherinegrapsas@hotmail.com | hibp | Breach records (multiple breaches expected) |
| | abstract_email | Validation, deliverability, format |
| | ipqs_email | Fraud score, disposable check, leak status |
| | holehe | Registration checks (via n8n) |

---

## Notes

- The `phone-intel` function already works correctly - no changes needed there
- Both email and phone scans will run API providers in parallel with worker tools
- Free tier will have access to all these providers based on your earlier request
