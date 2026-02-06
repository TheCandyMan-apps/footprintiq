
## Goal
Prevent “paid in Stripe but still free in-app” (and the resulting failed Pro conversion UX) by removing tier/price mapping drift, eliminating conflicting billing entry points, and adding automatic reconciliation + alerting when something is off.

## What I found (why this happened multiple times)
Right now subscription state can be derived/updated by multiple independent paths, with inconsistent mappings and expectations:

1) **Multiple price→plan/tier maps in different places**
- `supabase/functions/stripe-webhook/index.ts` has `PRICE_TO_TIER` (price → `premium|enterprise`) and also maps to workspace `plan`.
- `supabase/functions/billing/webhook/index.ts` has its own `PRICE_TO_TIER_MAP` (recently updated, but still separate).
- `supabase/functions/billing-sync/index.ts` has `PRICE_TO_PLAN` and it is **incomplete** (only includes Pro Monthly + Business, missing Pro Annual and Enterprise).
- `supabase/functions/billing/check-subscription/index.ts` returns tiers as **`pro|business|enterprise`** (frontend naming), while database uses **`premium|enterprise`** in `user_roles.subscription_tier`.
- Frontend config also exists in `src/config/stripe.ts`.

This fragmentation guarantees that when you add/change a Stripe price (monthly vs annual, new product, etc.), something will eventually drift.

2) **“billing-sync” can accidentally treat unknown prices as “free”**
In `supabase/functions/billing-sync/index.ts`:
- It resolves `plan = PRICE_TO_PLAN[priceId] || 'free'`
- That means if Stripe returns a price ID not in that map (e.g., Pro Annual), the sync result becomes `free`, and the UI verification can fail or even appear downgraded.

3) **Frontend upgrade verification compares the wrong values**
In `src/pages/Settings/Billing.tsx`:
- `verifyUpgrade(expectedTier)` sets `expectedTier = selectedPlan` (e.g., `pro`, `business`)
- But the DB stores `user_roles.subscription_tier` as `premium` or `enterprise`
- Result: the “upgrade verification” can fail even if the webhook updated correctly, which looks like a “conversion failed”.

4) **Too many checkout entry points**
There are multiple functions/UI components that start subscription flows:
- `stripe-checkout` (more modern, workspace-aware, returns to `/settings/billing?...`)
- `supabase/functions/billing/checkout/index.ts` (older; only pro/business, returns to `/subscription`)
- `supabase/functions/billing/create-subscription/index.ts` (older; takes `price_id`, returns to `/dashboard`)
- Various UI components call different ones (`billing-checkout` vs `stripe-checkout`, etc.)

This increases the chance that a customer goes through a path that doesn’t set the metadata you expect or doesn’t line up with the webhook you’re relying on.

## Implementation approach (what we’ll change)
### A) Create a single, shared “Stripe plan mapping” module (canonical source of truth)
Create a shared module in backend-functions shared code that defines:
- All current Stripe **price IDs**
- Normalized internal tier (`free|premium|enterprise`) that matches DB enums
- Workspace `plan` mapping (`free|pro|business`)
- Scan limits mapping
- A helper that returns a structured resolution result with a safe fallback behavior

This module will be imported/used by:
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/billing/webhook/index.ts`
- `supabase/functions/billing-sync/index.ts`
- `supabase/functions/billing/check-subscription/index.ts`

Outcome: adding/changing a Stripe price requires updating exactly one place.

### B) Harden reconciliation logic: never default unknown Stripe price IDs to “free”
Update `billing-sync` behavior:
- If Stripe returns an active subscription with an **unknown price ID**:
  - Do **not** downgrade to `free`
  - Keep existing workspace plan/tier as-is (or return an “unknown_price_id” status)
  - Log a record to `system_errors` (you already have this table and admin tooling)
  - Optionally log an audit event so it’s visible in the admin audit trail

Outcome: mapping drift becomes a visible alert, not a silent downgrade or “conversion failed”.

### C) Make the webhook + sync update the same set of records consistently
Standardize what gets updated on successful subscription events:
- `user_roles.subscription_tier` + `subscription_expires_at`
- `workspaces.subscription_tier` + `plan` + `scan_limit_monthly` + `stripe_customer_id` + `stripe_subscription_id` + `subscription_expires_at`
- `subscriptions` table record (`stripe_price_id`, period start/end, status, limits)

We’ll ensure both webhook handlers (if both must exist) call the same “applySubscriptionToWorkspaceAndUser(...)” logic, using the shared mapping.

### D) Reduce/route all checkout flows to one canonical function
Pick **one** canonical subscription checkout starter (recommended: `stripe-checkout` because it’s workspace-aware, rate-limited, and returns to the billing verification modal).
Then:
- Update other “legacy” functions (`billing/checkout`, `billing/create-subscription`, and frontend calls to `billing-checkout`) to either:
  1) Become thin wrappers that call the canonical flow, or
  2) Be removed if they’re confirmed unused (safer to wrap rather than delete initially)

Outcome: all new subscribers go through one consistent metadata + success URL + verification experience.

### E) Fix the UI “verification” logic so it matches real tiers
Update frontend to normalize expected values:
- If user picks `pro` or `pro_annual` → expected DB tier is `premium`
- If user picks `business` or `enterprise` → expected DB tier is `enterprise`
- Use one helper (likely from the existing `planCapabilities` / tier normalization patterns) so UI gating, labels, and verification don’t drift.

Also update the “post-checkout verification” modal (`PurchaseVerification`) to accept “plan variants” but compare using normalized tier/plan.

Outcome: “conversion failed” modals won’t trigger just because naming differs.

### F) Add an automatic “self-heal” check after checkout and on login
You already call `billing-sync` in `PurchaseVerification`. We’ll strengthen it and also add:
- On app load / login: call `billing-sync` (or a lightweight “billing-status” function) for the active workspace
- On billing page load: auto-refresh once
- Optional: periodic background refresh (e.g., every 10–30 minutes while app is open) for premium users

Outcome: even if a webhook is delayed, the app catches up quickly without manual intervention.

### G) Add monitoring + operator workflow for billing mismatches
1) Log to `system_errors` on:
- Unknown Stripe price ID
- Stripe customer exists but no workspace found
- Subscription active but DB tier not updated after N retries

2) Add/extend an admin page action (you already have `/admin/system-audit` patterns) to:
- Run a “Billing Reconciliation Audit” that finds any workspace/user with Stripe IDs but mismatched tier
- Trigger a safe fix that runs the reconciliation logic (no raw SQL from functions; use normal DB methods)

Outcome: you can proactively catch issues before customers report them.

## Files we will likely modify
Backend functions:
- `supabase/functions/billing-sync/index.ts` (critical: mapping completeness + safe fallback)
- `supabase/functions/billing/check-subscription/index.ts` (use shared mapping + align tier names)
- `supabase/functions/stripe-webhook/index.ts` (use shared mapping + consistent updates)
- `supabase/functions/billing/webhook/index.ts` (use shared mapping + consistent updates)
- Add a shared module under `supabase/functions/_shared/` for Stripe plan resolution

Frontend:
- `src/pages/Settings/Billing.tsx` (fix verifyUpgrade expected tier mapping)
- `src/components/billing/PurchaseVerification.tsx` (verify using normalized tier/plan)
- Any components calling `billing-checkout` (route to canonical checkout)

## Rollout / safety
1) Implement shared mapping + update backend functions first.
2) Deploy and test with Stripe test mode event simulation (or real low-risk internal purchase).
3) Update frontend verification logic second (so the UI aligns with the corrected backend).
4) Enable monitoring + admin audit last (so you have immediate visibility if anything still drifts).

## Acceptance criteria (what “won’t happen again” means)
- A Pro Annual purchase cannot be downgraded/treated as “free” by reconciliation.
- UI verification succeeds when the DB tier is correct (no naming mismatch false negatives).
- Any unknown Stripe price ID triggers a visible system error and does not silently break access.
- All subscription purchases go through one consistent checkout path and one consistent webhook/update pathway.
- Admin can run a reconciliation audit and fix any rare edge cases quickly.

## One critical question (needed to fully eliminate duplicates)
We should confirm which webhook endpoint(s) are currently configured in Stripe:
- Only `stripe-webhook`, only `billing/webhook`, or both?
If both are active, we’ll either disable one in Stripe or ensure they’re fully identical in behavior (recommended: only one active endpoint to reduce race conditions).
