
# Fix Scan Progress Labels and Provider Tier Restrictions

## Summary
Two changes are needed:
1. Update the scan progress UI to show scan-type-aware step descriptions instead of always saying "username"
2. Change API providers (Abstract, IPQS, HIBP, NumVerify) to Pro tier while keeping worker tools (Holehe, Maigret) on Free

---

## Part 1: Dynamic Scan Progress Steps

### Problem
The step progress UI always shows "username" in the step descriptions regardless of scan type:
- "Checking **username** reputation..."
- "Detecting the **username** across social networks..."
- "Linking the **username** to emails..."

### Solution
Create scan-type-specific step definitions that use the correct terminology:

| Scan Type | Term Used |
|-----------|-----------|
| username | "username" |
| email | "email address" |
| phone | "phone number" |

### Files to Modify

**`src/lib/scan/freeScanSteps.ts`**
- Add scan-type-specific step generators
- Create `getStepsForScanType(scanType: 'username' | 'email' | 'phone')` function
- Keep username steps as default/fallback

**`src/hooks/useStepProgress.ts`** (if it exists) or **`src/components/ScanProgress.tsx`**
- Pass the scan type to the step generator
- Derive scan type from `scanData`

### New Step Definitions

```text
Email Steps:
- "Checking email reputation..." 
- "Scanning breach databases..."
- "Cross-referencing related accounts..."
- "Mapping associated identities..."
- "Analyzing registration patterns..."
- "Building exposure timeline..."

Phone Steps:
- "Validating phone format..."
- "Checking carrier intelligence..."
- "Scanning messaging platforms..."
- "Cross-referencing public records..."
- "Analyzing risk indicators..."
- "Building intelligence summary..."
```

---

## Part 2: Move API Providers to Pro Tier

### Current State (Free)
| Provider | Scan Type | Current Tier |
|----------|-----------|--------------|
| abstract_phone | phone | free |
| numverify | phone | free |
| ipqs_phone | phone | free |
| twilio_lookup | phone | free |
| abstract_email | email | free |
| ipqs_email | email | free |
| hibp | email | free |
| holehe | email | free |
| maigret | username | free |

### Target State
| Provider | Scan Type | New Tier | Reason |
|----------|-----------|----------|--------|
| abstract_phone | phone | **pro** | API provider |
| numverify | phone | **pro** | API provider |
| ipqs_phone | phone | **pro** | API provider |
| twilio_lookup | phone | **pro** | API provider |
| abstract_email | email | **pro** | API provider |
| ipqs_email | email | **pro** | API provider |
| hibp | email | **pro** | API provider (breach data) |
| holehe | email | free | Worker tool (basic check) |
| maigret | username | free | Worker tool (basic check) |

### Files to Modify

**`src/lib/providers/registry.ts`**
- Change `minTier: 'free'` to `minTier: 'pro'` for:
  - `abstract_phone`
  - `numverify`
  - `ipqs_phone`
  - `twilio_lookup`
  - `abstract_email`
  - `ipqs_email`
  - `hibp`

**`src/lib/billing/tiers.ts`** (if needed)
- Verify `allowedProviders` arrays match the new tier restrictions

**`supabase/functions/_shared/phoneProviderConfig.ts`** (if exists)
- Update minTier for phone providers to match registry

---

## Technical Details

### Step Progress Integration
The `ScanProgress.tsx` component already has access to `scanData` which includes:
- `scanData.email`
- `scanData.phone`
- `scanData.username`

It calculates `scanType` for the request body. We need to:
1. Pass this scan type to the step progress hook
2. Use it to select the appropriate step definitions

### Provider Registry Changes
Simple one-line changes per provider in the registry:
```typescript
// Before
minTier: 'free',

// After  
minTier: 'pro',
```

### Backend Enforcement
The `phone-intel` and `email-intel` edge functions already use `enforceProviderAccess()` which checks `minTier`. Once the registry is updated, Free users will be automatically blocked from these providers with a `tier_restricted` status.

---

## Files Summary

| File | Change |
|------|--------|
| `src/lib/scan/freeScanSteps.ts` | Add email/phone step definitions + getter function |
| `src/components/ScanProgress.tsx` | Pass scanType to step progress |
| `src/hooks/useStepProgress.ts` | Accept scanType parameter |
| `src/lib/providers/registry.ts` | Update 7 providers to `minTier: 'pro'` |
| `supabase/functions/_shared/phoneProviderConfig.ts` | Update phone providers to `minTier: 'pro'` |

---

## Expected Behavior After Fix

### Free Tier
- **Username scans**: Maigret only (basic profile detection)
- **Email scans**: Holehe only (registration checks)
- **Phone scans**: No API providers (need Pro)
- **Progress UI**: Shows correct terminology ("email address" / "phone number")

### Pro Tier
- Full access to all API providers (HIBP, Abstract, IPQS, NumVerify)
- Enhanced intelligence and breach data
- Same progress UI with correct terminology
