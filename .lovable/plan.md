

## HIBP Breach Detection Fix

### Problem Summary
Email scans are returning "no breaches found" because **Have I Been Pwned (HIBP) is not being called**. The investigation revealed:

| Issue | Current State | Impact |
|-------|--------------|--------|
| Wrong provider name | `breach_check` in trigger | Provider doesn't exist - silently fails |
| Missing HIBP | Not in email provider list | Breach detection skipped entirely |
| Tier restriction | HIBP set to `minTier: 'pro'` | Free users blocked (if we want it for free tier) |

### Root Cause Details

**File: `supabase/functions/n8n-scan-trigger/index.ts` (line 206)**
```typescript
// CURRENT (broken):
providers = ["holehe", "abstract_email", "ipqs_email", "breach_check"];
//                                                      ^^^^^^^^^^^^
// "breach_check" does NOT exist in provider-proxy - it's silently ignored!
```

**File: `src/lib/providers/registry.ts` (line 241)**
```typescript
// HIBP is set to Pro tier only:
minTier: 'pro',  // Should be 'free' if you want it available to all users
```

---

### Proposed Fix

#### 1. Add HIBP to Email Provider List
**File:** `supabase/functions/n8n-scan-trigger/index.ts`

Change line 206 from:
```typescript
providers = ["holehe", "abstract_email", "ipqs_email", "breach_check"];
```
To:
```typescript
providers = ["holehe", "abstract_email", "ipqs_email", "hibp"];
```

#### 2. Make HIBP Available to Free Tier (Optional)
**File:** `src/lib/providers/registry.ts`

Change HIBP's `minTier` from `'pro'` to `'free'`:
```typescript
{
  id: 'hibp',
  name: 'Have I Been Pwned',
  ...
  minTier: 'free',  // Changed from 'pro'
}
```

---

### What Already Works
- HIBP API key is configured (`HIBP_API_KEY` exists in secrets)
- HIBP handler exists in `provider-proxy/index.ts` (lines 54-55, 1127-1176)
- The handler properly calls `https://haveibeenpwned.com/api/v3/breachedaccount/`

---

### Technical Details

**Provider-proxy HIBP handler (already exists):**
```text
Lines 54-55:   case 'hibp': result = await callHIBP(target); break;
Lines 1127-1176: callHIBP function with proper HIBP API integration
```

**After fix, email scans will call:**
1. Holehe - Email registration checks
2. Abstract Email - Validation & deliverability
3. IPQS Email - Fraud scoring & disposable detection
4. HIBP - **Breach database lookup** (the missing piece!)

---

### Files to Modify
1. `supabase/functions/n8n-scan-trigger/index.ts` - Replace `breach_check` with `hibp`
2. `src/lib/providers/registry.ts` - Change HIBP `minTier` to `'free'` (if desired)

### Testing
1. Run email scan for `robin.s.clifford@gmail.com`
2. Check n8n-scan-trigger logs for `hibp` provider call
3. Verify breach results appear in scan output

