
# Remove Free Trial — Complete Billing Refactor Plan

## What Exists Today (Trial System Inventory)

The trial system is spread across these locations:

**Frontend (src)**
- `src/hooks/useProPreview.ts` — the entire hook is trial-only logic (`isTrialActive`, `isTrialEligible`, `startTrialCheckout`, `trialStartedAt`, `trialEndsAt`, `trialScansUsed`, `trialScansRemaining`, `trialStatus`)
- `src/components/Header.tsx` — "Start Free Trial" button (lines 443, 673)
- `src/components/billing/ProPreviewBanner.tsx` — displays active trial status and countdown
- `src/components/results/ProUpgradeModal.tsx` — imports `useProPreview`, shows trial CTA branch
- `src/components/upsell/PostScanUpgradeModal.tsx` — imports `useProPreview`, shows trial CTA branch
- `src/hooks/useTrialEmailAnalytics.ts` — entire hook queries trial-related workspace columns
- `src/components/admin/TrialConversionMetrics.tsx` — admin panel trial funnel chart
- `src/components/admin/GrowthAnalyticsTabs.tsx` — imports `useTrialEmailAnalytics` and `TrialConversionMetrics`
- `src/components/admin/EmailMetricsDashboard.tsx` — references `EmailMetrics` from `useTrialEmailAnalytics`

**Backend (edge functions)**
- `supabase/functions/stripe-trial-checkout/index.ts` — entire function creates trial subscriptions with `trial_period_days: 3`
- `supabase/functions/send-trial-email/index.ts` — entire function sends trial lifecycle emails
- `supabase/functions/stripe-webhook/index.ts` — sets `trial_status: 'converted'` in two places (lines 435, 717)
- `supabase/functions/admin-backfill-subscriptions/index.ts` — sets `trial_status: 'converted'` in two places

**Database columns on `workspaces` table** (NOT removing via migration — keeping schema intact, just ignoring)
- `trial_started_at`
- `trial_ends_at`
- `trial_scans_used`
- `trial_status`

---

## What Will NOT Be Touched

- Free tier scanning capability — free users keep maigret/holehe access permanently
- Stripe webhook handlers for `subscription.created`, `subscription.updated`, `subscription.deleted` — these stay
- `stripe-webhook` overall logic — only the `trial_status: 'converted'` field writes will be removed
- Pricing page card structure — only button copy changes
- Admin Growth Analytics tab — the "Trial Funnel" tab will be repurposed into a "Subscription Funnel" showing paid vs free users

---

## Files to Change

### 1. `src/hooks/useProPreview.ts` — Stub Out (keep file, remove trial logic)

The hook is imported in 3 places. Rather than removing it and causing import errors, it will be converted into a no-op stub that always returns `isTrialActive: false`, `isTrialEligible: false`, so any remaining conditional logic in modals (`isTrialEligible && !isTrialActive`) safely evaluates to `false` without needing to touch every consumer.

```ts
// Stub: always returns inactive/ineligible trial state
export function useProPreview(): UseProPreviewReturn {
  return {
    isTrialActive: false,
    isTrialEligible: false,
    trialStartedAt: null,
    trialEndsAt: null,
    trialScansUsed: 0,
    trialScansRemaining: 0,
    trialStatus: null,
    timeRemaining: null,
    loading: false,
    startTrialCheckout: async () => {},
    refreshTrialStatus: async () => {},
  };
}
```

This means:
- `ProUpgradeModal` — the `{isTrialEligible && !isTrialActive}` branch evaluates to `false`, falls through to the direct "Upgrade to Pro" button. No file change needed.
- `PostScanUpgradeModal` — `showTrialCTA = false`, falls through to the upgrade button. No file change needed.
- `ProPreviewBanner` — `if (!isTrialActive) return null` fires immediately — banner never shows. No file change needed.

### 2. `src/components/Header.tsx` — Replace "Start Free Trial"

Lines 443 and 673: change button text from `"Start Free Trial"` → `"Get Started"` and navigate to `/auth?tab=signup` (which is already the action, so only the label changes).

### 3. `src/pages/Pricing.tsx` — Update CTA copy

- Bottom CTA section (line ~689): Change `"Start with a free scan. Upgrade only if you need more."` → `"Start with a free scan. Upgrade to Pro for full intelligence."` 
- Button text line ~697: `"Run a Free Scan"` stays (correct — this is for free tier, not trial)
- The Pro card CTA button (line 451): Currently `"Switch to Pro Intelligence"` — stays unchanged, this is already correct
- Free card button (line 326): `"Try Free Scan"` — stays unchanged

### 4. `src/hooks/useTrialEmailAnalytics.ts` — Remove trial-specific metrics, keep email metrics

The `TrialMetrics` section queries `trial_status`, `trial_scans_used`, `trial_started_at` on workspaces. Replace the trial metrics with a subscription conversion metrics shape instead (paid vs free workspace count), keeping the email metrics section intact.

New `TrialMetrics` shape renamed to `ConversionMetrics`:
```ts
export interface ConversionMetrics {
  totalFreeUsers: number;
  totalProUsers: number;
  conversionRate: number;
}
```

This means `TrialConversionMetrics.tsx` also needs to be updated to display the new shape.

### 5. `src/components/admin/TrialConversionMetrics.tsx` — Repurpose as `ConversionMetrics`

Change to display:
- Free users count
- Pro/paid users count  
- Conversion rate (paid / total)

Remove the funnel bars for `activeTrials`, `cancelledTrials`, `expiredTrials`.

### 6. `supabase/functions/stripe-webhook/index.ts` — Remove `trial_status: 'converted'`

Two workspace update blocks set `trial_status: 'converted'`. Remove those field entries — the trial columns stay in the database schema (no breaking migration needed), they just won't be written to anymore.

### 7. `supabase/functions/stripe-trial-checkout/index.ts` — Deactivate

Replace the entire function body with a 410 Gone response:
```ts
return new Response(JSON.stringify({ error: 'Free trials are no longer available.' }), { status: 410 });
```

This is safer than deleting — any stale frontend code that still calls it gets a clear error rather than a 404 mystery.

### 8. `supabase/functions/send-trial-email/index.ts` — Deactivate

Same pattern — replace body with a 410 response and clear log message.

### 9. `supabase/functions/admin-backfill-subscriptions/index.ts` — Remove `trial_status: 'converted'`

Two upsert blocks set `trial_status: 'converted'`. Remove those field entries from the update payloads.

---

## Database (No Migration Required)

The `trial_started_at`, `trial_ends_at`, `trial_scans_used`, and `trial_status` columns **stay in the database**. Removing them would require a migration and could break existing data. The approach is:
- Stop writing to them (edge functions)
- Stop reading from them (frontend hooks)
- Existing values are retained for historical record (some workspaces have `trial_status: 'converted'` — these users are already Pro, no action needed)

The `workspaces` subscription_tier enum change from `'trialing'` to just `'free'/'pro'/'business'` — `'trialing'` already is not in `CAPABILITIES_BY_PLAN` and normalizes to `'free'` in `normalizePlanTier`, so no code change is needed for access control.

---

## Access Control After This Change

| User State | Tier | Access |
|---|---|---|
| Signed up, not paid | `free` | Free features permanently |
| Active Pro subscriber | `pro` | Full Pro features |
| Pro subscription cancelled | `free` (immediate downgrade via webhook) | Free features |
| Admin | `admin` (displayed as `enterprise`) | Full access |

This is already how the system works for paying users — the trial was just a parallel path that bypassed Stripe. Removing it leaves a cleaner binary: free or paid.

---

## Technical Implementation Order

1. Stub `useProPreview.ts` → trial CTAs disappear from all modals automatically
2. Update `Header.tsx` button text
3. Update `stripe-webhook/index.ts` — remove `trial_status: 'converted'` writes
4. Update `admin-backfill-subscriptions/index.ts` — remove `trial_status: 'converted'` writes
5. Deactivate `stripe-trial-checkout` edge function
6. Deactivate `send-trial-email` edge function
7. Refactor `useTrialEmailAnalytics.ts` — remove trial workspace queries, replace with conversion metrics
8. Update `TrialConversionMetrics.tsx` — repurpose to show conversion metrics
9. Deploy updated edge functions

---

## Files NOT Changed (Confirmed Clean)

- `src/pages/Auth.tsx` — no trial references
- `src/hooks/useSubscription.tsx` — already clean (no trial logic)
- `src/hooks/useTierGating.tsx` — clean
- `src/lib/billing/planCapabilities.ts` — clean
- `supabase/functions/_shared/tiers.ts` — clean
- `supabase/functions/_shared/stripePlans.ts` — clean (no trial period in price configs)
- `src/pages/BillingPage.tsx` — no trial references
- `src/pages/Pricing.tsx` — pricing cards already use "Upgrade to Pro" for the CTA; the Free card button says "Try Free Scan" (correct)
- `src/components/billing/SubscriptionBadge.tsx` — shows `pro`/`enterprise` badges, no trial badge
