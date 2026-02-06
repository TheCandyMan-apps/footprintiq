
# Fix Stripe Subscription Sync Issues

## Problem Summary

Kelly Frazier (easterkelly37@gmail.com) has an **active Pro Monthly subscription** in Stripe (`sub_1SwUBTA3ptI9drLWucJ0zvfo`) but her database records show `free` tier:
- `user_roles.subscription_tier` = `free`
- `workspaces.subscription_tier` = `free`
- `workspaces.stripe_customer_id` = `null`
- `workspaces.stripe_subscription_id` = `null`

## Root Cause Analysis

There are **TWO** Stripe webhook handlers in the codebase with **DIFFERENT** price mappings:

| File | Has Pro Price `price_1ShgNPA3ptI9drLW40rbWMjq`? |
|------|-----------------------------------------------|
| `supabase/functions/stripe-webhook/index.ts` | ✅ YES → maps to `premium` |
| `supabase/functions/billing/webhook/index.ts` | ❌ NO → defaults to `free` |

The `billing/webhook` function contains **outdated/legacy price IDs** that no longer match the current Stripe configuration. When Kelly's subscription was processed, if it went through the wrong webhook, it would default to `free`.

## Current Price Configuration (src/config/stripe.ts)

```text
┌─────────────────────────────────────────────────────────────┐
│ Pro Monthly:  price_1ShgNPA3ptI9drLW40rbWMjq → £14.99/mo   │
│ Pro Annual:   price_1Si2vkA3ptI9drLWCQrxU4Dc → £140/year   │
│ Business:     price_1ShdxJA3ptI9drLWjndMjptw → £49.99/mo   │
│ Enterprise:   price_1SQh9JPNdM5SAyj722p376Qh → custom      │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Part 1: Fix Kelly's Subscription Immediately (Manual Database Update)

Update Kelly's records to reflect her active Pro subscription:

```sql
-- 1. Update user_roles to premium tier
UPDATE user_roles
SET 
  subscription_tier = 'premium',
  subscription_expires_at = '2026-03-02T20:56:12+00:00'
WHERE user_id = '87536df3-ed93-48f6-9087-e1ca5eadc370';

-- 2. Update workspace with Stripe IDs and tier
UPDATE workspaces
SET 
  subscription_tier = 'premium',
  plan = 'pro',
  scan_limit_monthly = 100,
  stripe_customer_id = 'cus_TuInrqb6PdV30C',
  stripe_subscription_id = 'sub_1SwUBTA3ptI9drLWucJ0zvfo'
WHERE id = '3ba9351a-5cd0-4be1-84be-40c82556de17';
```

### Part 2: Synchronize Price Mappings in billing/webhook

Update `supabase/functions/billing/webhook/index.ts` to use the same price mappings as `stripe-webhook`:

```text
Before (OUTDATED):
┌───────────────────────────────────────────────────────────────┐
│ price_1SQwVyPNdM5SAyj7gXDm8Mkc → free                        │
│ price_1SQwWCPNdM5SAyj7XS394cD8 → premium                     │
│ price_1SQh7LPNdM5SAyj7PMKySuO6 → premium (analyst)           │
│ price_1SPXcEPNdM5SAyj7AbannmpP → premium (professional)      │
│ price_1SQh9JPNdM5SAyj722p376Qh → enterprise                  │
└───────────────────────────────────────────────────────────────┘

After (CURRENT):
┌───────────────────────────────────────────────────────────────┐
│ price_1ShgNPA3ptI9drLW40rbWMjq → premium (Pro Monthly)       │
│ price_1Si2vkA3ptI9drLWCQrxU4Dc → premium (Pro Annual)        │
│ price_1ShdxJA3ptI9drLWjndMjptw → enterprise (Business)       │
│ price_1SQh9JPNdM5SAyj722p376Qh → enterprise (Enterprise)     │
└───────────────────────────────────────────────────────────────┘
```

### Part 3: Audit Other Affected Users

Query all Stripe subscriptions vs database to find mismatches:

```sql
-- Find users with active Stripe subscriptions but free tier
SELECT 
  p.email,
  p.user_id,
  ur.subscription_tier,
  w.stripe_subscription_id,
  w.plan
FROM profiles p
JOIN user_roles ur ON p.user_id = ur.user_id
JOIN workspace_members wm ON p.user_id = wm.user_id
JOIN workspaces w ON wm.workspace_id = w.id
WHERE ur.subscription_tier = 'free'
  AND w.stripe_subscription_id IS NULL;
```

Then cross-reference with Stripe API to identify any other affected customers.

### Part 4: Consolidate Webhook Logic (Optional but Recommended)

Consider deprecating `billing/webhook` in favor of `stripe-webhook` which has the correct mappings, or create a shared `_shared/stripe-price-mapping.ts` file to ensure both use the same source of truth.

---

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/billing/webhook/index.ts` | Update `PRICE_TO_TIER_MAP` with current price IDs |
| Database | Manual update for Kelly's user_roles and workspaces |

### Database Tier Enum Values

The `subscription_tier` enum accepts: `free`, `basic`, `premium`, `family`, `enterprise`

- Pro plans map to `premium`
- Business plans map to `enterprise`

### Validation After Fix

1. Kelly should see "Pro" tier in her account settings
2. Workspace should show 100 scans/month limit
3. Pro-tier features (Sherlock, HIBP, exports) should be unlocked
4. Future webhook events should correctly update tiers
