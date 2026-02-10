

# Add "Start Free Trial" Button to Header and Pricing Page

## Overview
Add a visible "Start Free Trial" button in the header navigation for unauthenticated users, and update the pricing page's free-tier CTA. Both will link to `/auth?tab=signup` so the sign-up tab is pre-selected, reducing friction.

## Confirming: Sign-up without a trial
Yes -- users can sign up on the free tier and run scans without subscribing to a Pro trial. The free tier provides default credits and a scan quota via the workspace system. The "Start Free Trial" label is a marketing label for the free-tier sign-up, not a gated trial requiring payment.

## Changes

### 1. Auth page: read `tab` query parameter (`src/pages/Auth.tsx`)
- Read `?tab=signup` from the URL search params
- Pass it as `defaultValue` to the `<Tabs>` component so the sign-up tab is pre-selected when users arrive via the new button

### 2. Header: replace "Get Started" with "Start Free Trial" (`src/components/Header.tsx`)
- Change the unauthenticated "Get Started" button (line 431) to say "Start Free Trial"
- Update its destination from `/auth` to `/auth?tab=signup`
- Also update the "Sign In" text link (line 380) to remain as-is for returning users

### 3. Pricing page: update free-tier CTA (`src/pages/Pricing.tsx`)
- Update the free plan's `navigate('/auth')` call (line 40) to `navigate('/auth?tab=signup')` so clicking "Get Started" on the free tier pre-selects sign-up
- No visual changes needed -- just the link target

### 4. Mobile nav: add matching CTA
- In the mobile navigation menu section of Header.tsx, ensure the unauthenticated mobile CTA also reads "Start Free Trial" and links to `/auth?tab=signup`

## Technical Detail

**Auth.tsx tab pre-selection:**
```typescript
const searchParams = new URLSearchParams(window.location.search);
const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';
// ...
<Tabs defaultValue={defaultTab} className="w-full">
```

**Header.tsx button update:**
```typescript
<Button onClick={() => navigate('/auth?tab=signup')}>
  Start Free Trial
</Button>
```

**Pricing.tsx free plan link:**
```typescript
if (planId === 'free') {
  navigate('/auth?tab=signup');
  return;
}
```

## Files Modified
1. `src/pages/Auth.tsx` -- read `tab` query param for tab pre-selection
2. `src/components/Header.tsx` -- rename button, update link target (desktop + mobile)
3. `src/pages/Pricing.tsx` -- update free-tier CTA destination

All changes are minimal: a query parameter reader, two string changes, and one navigate path update. No new dependencies.
