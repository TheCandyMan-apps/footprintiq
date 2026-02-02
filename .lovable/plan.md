

# Plan: Credits vs. Pro Subscription Comparison Table

## Overview

Add a clear, informative comparison table to the Billing page that helps users understand the key difference between:
1. **Buying credits** (one-time purchase, no feature unlock)
2. **Upgrading to Pro** (subscription that unlocks premium features + providers)

This addresses user confusion where people might buy credits expecting Pro-level access.

---

## What the Table Will Show

| Aspect | Credit Pack (e.g., OSINT Starter £9) | Pro Subscription (£14.99/mo) |
|--------|--------------------------------------|------------------------------|
| **What you get** | 500 credits (one-time) | 100 scans/month + premium features |
| **Plan tier** | Stays on Free | Upgrades to Pro |
| **Username providers** | Maigret only | Maigret + Sherlock |
| **Email providers** | Holehe only | Holehe + IPQS + HIBP |
| **Phone providers** | ❌ None | ✓ All Pro-tier providers |
| **AI Insights** | ❌ | ✓ |
| **PDF/CSV Export** | ❌ | ✓ |
| **Risk Scoring** | ❌ | ✓ |
| **Priority Queue** | ❌ | ✓ |
| **Context Enrichment** | ❌ | ✓ |
| **LENS Verification** | ❌ | ✓ |

---

## Implementation Details

### New Component
**File:** `src/components/billing/CreditsVsProComparison.tsx`

A self-contained card component with:
- Clear header explaining the purpose
- Two-column comparison table using the existing `Table` UI components
- Visual checkmarks (✓) and crosses (✗) for features
- Subtle styling to highlight the Pro column as the recommended option

### Integration Point
**File:** `src/pages/Settings/Billing.tsx`

Insert the comparison component **above** the Credit Packs section (around line 415), so users see the comparison before making a purchase decision.

---

## Component Structure

```text
┌─────────────────────────────────────────────────────────┐
│  📊 Credits vs. Pro: What's the Difference?             │
├─────────────────────────────────────────────────────────┤
│  A brief explanation that credit packs add scan         │
│  credits but don't unlock premium features.             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────┬──────────────┬───────────────────┐   │
│  │ Feature       │ Credits Only │ Pro Subscription  │   │
│  ├───────────────┼──────────────┼───────────────────┤   │
│  │ Plan Tier     │ Free         │ Pro               │   │
│  │ Username Tools│ 1 (Maigret)  │ 2 (+ Sherlock)    │   │
│  │ Email Tools   │ 1 (Holehe)   │ 4 (+ IPQS, HIBP…) │   │
│  │ Phone Tools   │ ✗            │ ✓ All Pro tools   │   │
│  │ AI Insights   │ ✗            │ ✓                 │   │
│  │ Exports       │ ✗            │ ✓                 │   │
│  │ Risk Scoring  │ ✗            │ ✓                 │   │
│  │ LENS          │ ✗            │ ✓                 │   │
│  └───────────────┴──────────────┴───────────────────┘   │
│                                                         │
│  [ Upgrade to Pro → ]                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/billing/CreditsVsProComparison.tsx` | **Create** - New comparison table component |
| `src/pages/Settings/Billing.tsx` | **Modify** - Import and render the component above Credit Packs |

---

## Technical Notes

- Uses existing UI components: `Card`, `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableCell`, `TableBody`, `Badge`, `Button`
- No new dependencies required
- Data sourced from existing `planCapabilities.ts` and `registry.ts` for accuracy
- Includes a subtle CTA button linking to the Pro upgrade action

