
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

## Technical Changes

### 1. Update `n8n-scan-trigger` Edge Function

**File:** `supabase/functions/n8n-scan-trigger/index.ts`

**Changes:**
- Replace strict `username` validation with scan-type-aware validation
- Accept `email`, `phone`, and `domain` as alternative target fields
- Derive target value and column name based on scan type
- Update the scan record insert to use the correct column

**Logic Flow:**
```
1. Parse request body for scanType, username, email, phone, etc.
2. Determine the "target" value based on scan type:
   - If scanType is 'email' → use email field
   - If scanType is 'phone' → use phone field  
   - If scanType is 'username' → use username field
   - If scanType is 'personal_details' → use email/firstName as available
3. Validate target is present and valid
4. Create scan record with appropriate column populated
5. Trigger n8n webhook with normalized payload
```

### 2. Update n8n Payload Construction

Ensure the n8n webhook receives the correct target information regardless of scan type:

```typescript
const n8nPayload = {
  scanId: scan.id,
  scanType: scanType,
  target: targetValue,  // The actual value being searched
  username: scanType === 'username' ? targetValue : undefined,
  email: scanType === 'email' ? targetValue : undefined,
  // ... other fields
};
```

### 3. Validation Updates

Current strict username validation:
```typescript
// REMOVE: This only works for username scans
if (!username || typeof username !== 'string') {
  return bad(400, "Username must be a non-empty string");
}
```

Replace with scan-type-aware validation:
```typescript
// NEW: Validate based on scan type
let targetValue: string | undefined;
let targetColumn: string;

switch (scanType) {
  case 'email':
    targetValue = body.email?.trim();
    targetColumn = 'email';
    break;
  case 'phone':
    targetValue = body.phone?.trim();
    targetColumn = 'phone';
    break;
  case 'username':
  default:
    targetValue = body.username?.trim();
    targetColumn = 'username';
    break;
}

if (!targetValue || targetValue.length < 2) {
  return bad(400, `${targetColumn} must be a non-empty string`);
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/n8n-scan-trigger/index.ts` | Add multi-scan-type support, update validation, fix payload construction |

## Testing Plan

1. Test email scan from Email Breach Check page
2. Test username scan from Scanner page (ensure no regression)
3. Test phone scan if applicable
4. Verify scan records are created in database
5. Verify n8n receives correct payloads
6. Confirm results page loads properly

## Alternative Considered

Routing email scans to `scan-orchestrate` instead was considered but rejected because:
- It would require maintaining two different scan paths in the frontend
- The n8n workflow provides better timeout handling for OSINT tools
- Unifying all scans through one trigger is cleaner long-term
