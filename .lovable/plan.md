

## Stripe Webhook 400 Errors: Root Cause & Fix

### Problem

Every `customer.subscription.created` webhook returns **400 ERR** because of a database enum mismatch.

### Root Cause

The `subscription_tier` database enum has these values:
`free | pro | family | basic | enterprise`

But `stripePlans.ts` maps Pro subscriptions to tier **`premium`** -- a value that does NOT exist in the enum. When the webhook tries to write `subscription_tier: 'premium'` to `user_roles`, Postgres rejects it.

- `checkout.session.completed` silently logs the error (returns 200, but data is NOT persisted)
- `customer.subscription.created` **throws** the error (line 604), causing the 400 response

This means **no subscriber is actually getting their Pro tier saved to the database**, even though checkout appears to succeed.

### Fix (2 changes)

#### 1. Update `stripePlans.ts` — change `'premium'` to `'pro'`

The canonical mapping must use values that exist in the database enum.

```text
Before:  tier: 'premium'   (for Pro plans)
After:   tier: 'pro'       (matches DB enum)
```

Also update the `SubscriptionTier` type and all helper functions (`frontendPlanToTier`, `tierToFrontendPlan`) to use `'pro'` instead of `'premium'`.

#### 2. Fix the throw in `handleSubscriptionChange` (line 604)

Replace `throw updateError` with a log-and-return pattern to match the other handlers. Throwing here causes the entire webhook to return 400, which makes Stripe keep retrying.

```text
Before:  throw updateError;
After:   logStep("ERROR: ...", { error: updateError.message });
         return;
```

### Secondary: Audit other `'premium'` references

Several database functions reference `'premium'` (e.g., `has_subscription_tier`, `update_user_subscription`, `sync_workspace_scan_limits`). These also need updating to use `'pro'` to match the actual enum. This will require a database migration to update those functions.

### Technical Details

| File | Change |
|------|--------|
| `supabase/functions/_shared/stripePlans.ts` | Change `tier: 'premium'` to `tier: 'pro'` for both Pro price IDs. Update `SubscriptionTier` type. Update `frontendPlanToTier` and `tierToFrontendPlan` helpers. |
| `supabase/functions/stripe-webhook/index.ts` | Line 604: replace `throw updateError` with log + return. |
| Database migration | Update `has_subscription_tier`, `update_user_subscription`, `sync_workspace_scan_limits` functions to reference `'pro'` instead of `'premium'`. |

### Expected Outcome

- All `customer.subscription.created` webhooks return 200
- Pro subscribers correctly get `subscription_tier = 'pro'` persisted
- No more silent data loss on `checkout.session.completed`
- Stripe stops retrying failed webhook deliveries

