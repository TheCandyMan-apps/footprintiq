
# Fix: Pro Conversion Issue - "premium" Tier Not Recognized

## Problem Summary

User Erin Armstrong (erink328@gmail.com) paid for Pro twice but is still seeing the Free tier experience. Investigation confirmed:

- Database has correct values: `subscription_tier: 'premium'`, `plan: 'premium'`
- User has 1,100 credits granted
- The issue is in frontend tier normalization

## Root Cause

The `normalizePlan()` function in `src/hooks/useWorkspace.tsx` does not recognize the `'premium'` tier name:

```text
function normalizePlan(tier):
  if tier === 'analyst' → return 'pro'
  if tier === 'enterprise' → return 'business'
  if tier === 'pro' or 'business' → return tier
  else → return 'free'  ← BUG: 'premium' falls through here!
```

This causes `workspace.plan` to be computed as `'free'` instead of `'pro'`, which then routes the user to the `FreeResultsPage`.

## Solution

Update the `normalizePlan()` function to handle `'premium'` as a legacy tier that maps to `'pro'`:

```text
function normalizePlan(tier):
  if tier === 'analyst' → return 'pro'
  if tier === 'premium' → return 'pro'      ← ADD THIS
  if tier === 'enterprise' → return 'business'
  if tier === 'pro' or 'business' → return tier
  else → return 'free'
```

---

## Technical Details

### File to Modify

`src/hooks/useWorkspace.tsx`

### Change

Update the `normalizePlan` function (lines 23-29) to include `'premium'` mapping:

```typescript
function normalizePlan(subscription_tier: string | null | undefined): 'free' | 'pro' | 'business' {
  const tier = (subscription_tier || 'free').toLowerCase();
  if (tier === 'analyst') return 'pro';
  if (tier === 'premium') return 'pro';      // ADD: Map legacy 'premium' to 'pro'
  if (tier === 'enterprise') return 'business';
  if (tier === 'pro' || tier === 'business') return tier as 'pro' | 'business';
  return 'free';
}
```

---

## Impact

- Immediate fix for Erin Armstrong and any other users with `subscription_tier: 'premium'`
- No database changes required
- Change affects all workspaces with legacy tier names
- User will see Pro/Advanced results page after page refresh

## Verification

After the fix, when Erin logs in:
1. `useWorkspace` will load her workspace with `subscription_tier: 'premium'`
2. `normalizePlan('premium')` will return `'pro'`
3. `workspace.plan` will be `'pro'`
4. `ScanResultsRouter` will route to `AdvancedResultsPage`
