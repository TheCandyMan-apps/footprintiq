
# Fix Email Scan "Scan Not Found" Error

## Problem Summary

Email scans from the Email Breach Check page are failing with "Scan Not Found" because:

1. The `ScanProgress` component routes **all scans** to the `n8n-scan-trigger` edge function
2. That edge function was built only for **username scans** and strictly requires a `username` field
3. Email-only scans don't have a username, causing a 400 error before the scan record is created
4. Users are redirected to a results page for a scan that doesn't exist

## Solution

Update the `n8n-scan-trigger` edge function to accept email, phone, and domain scans in addition to username scans. This is the cleanest fix because:

- It keeps all scan routing through a single function
- It maintains the n8n async workflow benefits (timeout resilience)
- It avoids splitting routing logic across multiple places

## ✅ COMPLETED: Technical Changes

### 1. Updated `n8n-scan-trigger` Edge Function

**File:** `supabase/functions/n8n-scan-trigger/index.ts`

**Changes Made:**
- ✅ Replaced strict `username` validation with scan-type-aware validation
- ✅ Accepts `email`, `phone`, and `domain` as alternative target fields
- ✅ Derives target value and column name based on scan type
- ✅ Updates the scan record insert to use the correct column
- ✅ Defines providers based on scan type (email → holehe, breach_check)

### 2. Updated Frontend Scan Type Detection

**File:** `src/components/ScanProgress.tsx`

**Changes Made:**
- ✅ Added explicit email-only scan detection
- ✅ Routes email-only scans with `scanType: 'email'` instead of `personal_details`

### 3. Improved Empty Results Messaging

**File:** `src/components/scan/FreeResultsPage.tsx`

**Changes Made:**
- ✅ Added positive "Good news — no breaches found" messaging for email scans
- ✅ Shows scan-type-aware empty states instead of generic "No results" text

## ⚠️ PENDING: n8n Workflow Update (External)

**Issue Identified:** The n8n workflow does NOT respect the `scanType` field and runs all username providers (Sherlock, GoSearch, Maigret) regardless of scan type.

**Evidence from logs:**
```
🔍 Run Sherlock no results array found. Full structure: {"error":"Bad request","details":"Missing username"}
🔍 Run GoSearch no results array found. Full structure: {"error":"Bad request","details":"Missing username"}
🔍 Run Maigret no results array found. Full structure: {"error":"Bad request","details":"Missing username"}
🔍 Run Holehe found results at firstItem.results (0 findings)
```

**Required n8n Workflow Fix:**
The n8n workflow needs conditional logic to check the `scanType` field from the trigger payload:

```
IF scanType === 'email':
  - Run ONLY: holehe, breach_check providers
  - SKIP: sherlock, gosearch, maigret, whatsmyname
  
IF scanType === 'phone':
  - Run ONLY: phoneinfoga
  - SKIP: all username tools
  
IF scanType === 'username' (default):
  - Run: sherlock, gosearch, maigret, holehe, whatsmyname
```

**Impact:** Email scans currently "work" (holehe runs and returns results), but username tools fail with "Missing username" errors, causing noisy logs and wasted Cloud Run worker calls.

## Testing Checklist

- [x] Email scan creates scan record correctly
- [x] n8n webhook accepts email scan payload
- [x] Holehe runs and returns results for email scans
- [x] Empty email scan shows positive "No breaches found" message
- [ ] n8n workflow conditionally skips username providers for email scans (PENDING)
- [ ] Phone scan routing (if applicable)

## Files Modified

| File | Status | Changes |
|------|--------|---------|
| `supabase/functions/n8n-scan-trigger/index.ts` | ✅ Done | Multi-scan-type support, validation, payload construction |
| `src/components/ScanProgress.tsx` | ✅ Done | Email-only scan type detection |
| `src/components/scan/FreeResultsPage.tsx` | ✅ Done | Positive empty-state messaging for email scans |
| n8n Workflow (external) | ⚠️ Pending | Add scanType conditional provider selection |
