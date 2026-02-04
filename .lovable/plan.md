
# Plan: Add Abstract Email Reputation API for Free and Pro Tiers

## Overview
This plan integrates the Abstract Email Reputation API (`https://emailreputation.abstractapi.com/v1`) into the email scanning pipeline for **both Free and Pro tiers**, providing email quality scoring, abuse detection, and spam trap identification.

---

## Current State Analysis

| Component | Status |
|-----------|--------|
| API Handler (`callAbstractEmailReputation`) | Exists in `provider-proxy/index.ts` |
| Secret (`ABSTRACTAPI_EMAIL_REPUTATION_KEY`) | **NOT configured** |
| Provider Registry (frontend) | **Missing** from `src/lib/providers/registry.ts` |
| Email Intel Edge Function | **NOT calling** this provider |
| Tier Restriction | Currently hardcoded as "premium" in comments |

---

## Implementation Steps

### Step 1: Add API Secret
You'll need to provide your Abstract Email Reputation API key. This is obtained from the Abstract API dashboard under **Email Reputation API**.

**Action:** Use the secret management tool to request the `ABSTRACTAPI_EMAIL_REPUTATION_KEY` secret.

---

### Step 2: Update Provider Registry (Frontend)

**File:** `src/lib/providers/registry.ts`

Add the new provider entry with `minTier: 'free'`:

```text
{
  id: 'abstract_email_reputation',
  name: 'Email Reputation',
  description: 'Quality scoring, abuse & spam trap detection',
  scanType: 'email',
  creditCost: 1,
  minTier: 'free',  // Available to all tiers
  category: 'risk',
  requiresKey: 'ABSTRACTAPI_EMAIL_REPUTATION_KEY',
  enabled: true,
}
```

---

### Step 3: Update Backend Plan Capabilities

**File:** `supabase/functions/_shared/planCapabilities.ts`

No changes needed since this module focuses on feature toggles, not individual provider access. Provider tier gating is handled by the registry.

---

### Step 4: Update Email Intel Edge Function

**File:** `supabase/functions/email-intel/index.ts`

Add the `abstract_email_reputation` provider to the email scanning flow:

1. Add it to the default providers list
2. Implement the API call logic (similar to existing `abstract_email` implementation)
3. Parse the reputation response and generate findings

**API Response Fields to Parse:**
- `email_address`: The validated email
- `email_deliverability`: Deliverability status
- `email_quality`: Object containing quality score (0-1)
- `is_format_valid`, `is_smtp_valid`, `is_mx_valid`
- `mx_records`: Array of MX records

---

### Step 5: Update N8N Scan Trigger

**File:** `supabase/functions/n8n-scan-trigger/index.ts`

Add `abstract_email_reputation` to the email providers list:

```text
case 'email':
  providers = ["holehe", "abstract_email", "abstract_email_reputation", "ipqs_email", "hibp"];
  break;
```

Also update the email-intel invocation to include the new provider.

---

### Step 6: Update Provider Costs

**File:** `supabase/functions/_shared/providerCosts.ts`

Verify the cost is set correctly (currently shows `2` credits for reputation - may adjust to `1` for Free tier).

---

## Technical Details

### API Endpoint
```
GET https://emailreputation.abstractapi.com/v1/?api_key={API_KEY}&email={email}
```

### Sample Response
```json
{
  "email_address": "benjamin.richard@abstractapi.com",
  "email_deliverability": {
    "status": "deliverable",
    "status_detail": "valid_email"
  },
  "is_format_valid": true,
  "is_smtp_valid": true,
  "is_mx_valid": true,
  "mx_records": [
    "gmail-smtp-in.l.google.com",
    "alt1.gmail-smtp-in.l.google.com"
  ],
  "email_quality": {
    "score": 0.8
  }
}
```

### Findings Generated
1. **email.reputation** - Main quality score finding
2. **email.abuse_detected** - If abuse flag is true (severity: high)
3. **email.spam_trap** - If spam trap flag is true (severity: high)

---

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/providers/registry.ts` | Add provider entry |
| `supabase/functions/email-intel/index.ts` | Add provider call logic |
| `supabase/functions/n8n-scan-trigger/index.ts` | Include in providers list |
| `supabase/functions/_shared/providerCosts.ts` | Verify/adjust credit cost |

---

## Deployment Steps

1. Add the `ABSTRACTAPI_EMAIL_REPUTATION_KEY` secret
2. Apply code changes
3. Deploy edge functions (automatic)
4. Test with an email scan

---

## Cost Impact

- Free tier: 1 credit per scan (estimated)
- Provider already exists in `providerCosts.ts` at 2 credits - will adjust to 1 for accessibility

---

## Notes

- The Abstract Email Reputation API is **different** from the Email Validation API
- The `provider-proxy` already has the `callAbstractEmailReputation()` handler ready
- No UI changes needed - findings will appear automatically in the results view
