

# Add Subtle Upgrade Nudge for Logged-In Free Users

## What this does
Adds a small, non-intrusive "Upgrade" text link in the header for logged-in free-tier users, and a gentle highlight on the pricing page to draw attention to Pro without being pushy.

## Changes

### 1. Header: Add a subtle "Upgrade" text link (`src/components/Header.tsx`)
- Next to the credits badge (which already shows for free users), add a small text link that says "Upgrade" with a subtle sparkle icon
- Styled as a muted text link (not a button) -- blends into the header without shouting
- Links to `/pricing`
- Only visible when: user is logged in AND on the free tier

Visual result: `[credits badge] Upgrade`

### 2. Pricing page: Add a gentle nudge banner for free users (`src/pages/Pricing.tsx`)
- Below the hero text, show a single-line subtle message for logged-in free users: "You're on the Free plan. Upgrade anytime for deeper insights."
- Styled with muted text and a small arrow icon -- no bright colours, no urgency
- Not dismissible (it's just a quiet status line, not a banner)

## Technical Details

**Header.tsx** (~line 416, after credits badge):
```tsx
{user && !isPremium && (
  <Link
    to="/pricing"
    className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
  >
    <Sparkles className="h-3 w-3" />
    Upgrade
  </Link>
)}
```

**Pricing.tsx** (~line 231, after subtitle):
```tsx
{currentPlan === 'free' && workspace && (
  <p className="text-sm text-muted-foreground/70 mt-3 flex items-center justify-center gap-1.5">
    <span>You're on the Free plan</span>
    <span className="text-muted-foreground/40">·</span>
    <span>Upgrade anytime for deeper insights</span>
  </p>
)}
```

## Files Modified
1. `src/components/Header.tsx` -- add subtle "Upgrade" text link for free users
2. `src/pages/Pricing.tsx` -- add quiet status line for free users below hero

Both additions are minimal, non-intrusive, and match the existing design language.
