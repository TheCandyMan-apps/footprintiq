

# Add Referrer Tracking to Email and Phone Scans

## Problem
Referrer data is only captured for **username scans** (in `useUsernameScan.ts`). Email and phone scans go through `useAdvancedScan.tsx`, which never calls `getReferrerHostname()` or includes `referrer` in the request body. That is why almost all scans show "---" in the Referrer column.

## Solution
Add the same referrer capture logic to `useAdvancedScan.tsx` so email and phone scans also record the referring domain.

## Changes

### 1. `src/hooks/useAdvancedScan.tsx`
- Import `getReferrerHostname` from `@/lib/referrer`
- Before building the `orchestrateBody`, capture the referrer
- Spread `referrer` into the request body (same pattern as the username hook)

Specifically, around the orchestrate body construction (line ~244), add:

```text
const referrer = getReferrerHostname();

const orchestrateBody = withTurnstileToken({
  type,
  value: value!,
  workspaceId: workspace.id,
  ...(referrer && { referrer }),   // <-- add this line
  options: { ... },
}, options.turnstileToken);
```

This is a one-file, ~3-line change that brings email/phone scans in line with the existing username scan referrer tracking.
