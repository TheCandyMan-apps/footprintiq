
# Fix Stripe Subscription Sync Issues - ✅ COMPLETED

## Problem Summary

Kelly Frazier (easterkelly37@gmail.com) had an **active Pro Monthly subscription** in Stripe (`sub_1SwUBTA3ptI9drLWucJ0zvfo`) but her database records showed `free` tier.

## Resolution Summary

### ✅ Part 1: Kelly's Subscription Fixed

**Database updates applied:**
- `user_roles.subscription_tier` = `premium` ✅
- `user_roles.subscription_expires_at` = `2026-03-02T20:56:12+00:00` ✅
- `workspaces.subscription_tier` = `premium` ✅
- `workspaces.plan` = `pro` ✅
- `workspaces.scan_limit_monthly` = `100` ✅
- `workspaces.stripe_customer_id` = `cus_TuInrqb6PdV30C` ✅
- `workspaces.stripe_subscription_id` = `sub_1SwUBTA3ptI9drLWucJ0zvfo` ✅

### ✅ Part 2: Price Mappings Synchronized

Updated `supabase/functions/billing/webhook/index.ts` with current price IDs:

```typescript
const PRICE_TO_TIER_MAP: Record<string, 'free' | 'premium' | 'enterprise'> = {
  // Pro Monthly (£14.99/mo) - premium tier
  'price_1ShgNPA3ptI9drLW40rbWMjq': 'premium',
  
  // Pro Annual (£140/year) - premium tier
  'price_1Si2vkA3ptI9drLWCQrxU4Dc': 'premium',
  
  // Business (£49.99/mo) - enterprise tier
  'price_1ShdxJA3ptI9drLWjndMjptw': 'enterprise',
  
  // Enterprise (custom) - enterprise tier
  'price_1SQh9JPNdM5SAyj722p376Qh': 'enterprise',
};
```

### ✅ Part 3: Audit Results

**Active Stripe subscriptions checked:** 3 total
1. `sub_1SwUBTA3ptI9drLWucJ0zvfo` - Kelly Frazier ✅ FIXED
2. `sub_1SuUbSA3ptI9drLWNoSLDLO4` - Customer `cus_TsF5YamHmIv06h` (no workspace linked yet)
3. `sub_1Smv2nA3ptI9drLWgxwnnIeg` - Matt (`mattthepilot83@gmail.com`) ✅ Already correct (premium tier)

**Note:** One subscriber (cus_TsF5YamHmIv06h) has no workspace linked in database. This may be a new subscription not yet fully processed.

## Root Cause

Two Stripe webhook handlers existed with different price mappings:
- `stripe-webhook/index.ts` - Had correct mappings
- `billing/webhook/index.ts` - Had **OUTDATED** legacy price IDs

Now both are synchronized.

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/billing/webhook/index.ts` | Updated `PRICE_TO_TIER_MAP` with current price IDs |

## Validation

Kelly's current database state:
- Email: `easterkelly37@gmail.com`
- Subscription Tier: `premium` ✅
- Plan: `pro` ✅
- Stripe Subscription ID: `sub_1SwUBTA3ptI9drLWucJ0zvfo` ✅
- Expires: `2026-03-02T20:56:12+00:00`

Future subscription events will now correctly map to the proper tiers.
