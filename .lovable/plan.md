

# Plan: Fix Misleading Credit Usage Guide

## Problem Summary

The current Credit Usage Guide advertises a scan tier system that **does not exist**:

| What's Claimed | Reality |
|----------------|---------|
| Basic Scan (1 credit): HIBP, DeHashed | HIBP is Pro-only (2 credits). DeHashed is not active. |
| Advanced Scan (5 credits): Pipl, FullContact, Clearbit, Shodan | None of these providers exist in the codebase |
| Dark Web Scan (10 credits): Paste sites, forums, marketplaces | No dedicated dark web scan tier exists |
| Dating/NSFW Sites (3 credits) | Not implemented |

This is a **compliance and trust issue** that could expose you to false advertising claims.

---

## Solution: Rewrite Credit Usage Guide to Match Reality

Replace the fictional tier system with an **accurate per-provider credit breakdown** that matches `src/lib/providers/registry.ts`.

### New Credit Usage Guide Content

```text
┌─────────────────────────────────────────────────────────────────┐
│  Credit Usage Guide                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USERNAME SCANS                                                  │
│  ├─ Maigret (500+ platforms)          1 credit   [Free]         │
│  ├─ Sherlock (Social media)           1 credit   [Pro]          │
│  └─ GoSearch (Advanced OSINT)         2 credits  [Business]     │
│                                                                  │
│  EMAIL SCANS                                                     │
│  ├─ Holehe (Registration checks)      1 credit   [Free]         │
│  ├─ Abstract Email (Validation)       1 credit   [Pro]          │
│  ├─ IPQS Email (Fraud scoring)        2 credits  [Pro]          │
│  └─ Have I Been Pwned (Breaches)      2 credits  [Pro]          │
│                                                                  │
│  PHONE SCANS (Pro & Business)                                    │
│  ├─ Carrier Intel                     2 credits  [Pro]          │
│  ├─ NumVerify                         2 credits  [Pro]          │
│  ├─ IPQS Phone (Fraud scoring)        3 credits  [Pro]          │
│  ├─ Twilio Lookup                     3 credits  [Pro]          │
│  ├─ WhatsApp/Telegram/Signal          1-2 credits [Pro]         │
│  └─ TrueCaller, Phone OSINT           2-3 credits [Business]    │
│                                                                  │
│  Note: You select which providers to run. Credits are           │
│  deducted per provider, not per scan.                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Settings/Credits.tsx` | Replace the fictional Credit Usage Guide (lines 259-286) with accurate provider-based breakdown |

---

## Additional Cleanup Needed

Also remove misleading text from the credit package cards (lines 129-133):

**Current (misleading):**
```tsx
<p>• {Math.floor(pack.credits / 1)} basic scans</p>
<p>• {Math.floor(pack.credits / 5)} advanced scans</p>
<p>• {Math.floor(pack.credits / 10)} dark web scans</p>
```

**Replacement (accurate):**
```tsx
<p>• Use credits with any available provider</p>
<p>• Provider costs range from 1-3 credits</p>
<p>• Select providers per scan for cost control</p>
```

---

## Implementation Details

### New Component Structure

The updated Credit Usage Guide will:
1. Group providers by scan type (Username / Email / Phone)
2. Show credit cost per provider
3. Display tier requirement (Free / Pro / Business)
4. Include a note explaining the per-provider billing model

### Styling

- Use a clean table or grouped list format
- Tier badges match existing UI (muted for Free, primary for Pro, accent for Business)
- Responsive layout for mobile

---

## Technical Notes

- Data sourced directly from `PROVIDER_REGISTRY` in `src/lib/providers/registry.ts`
- Could optionally be made dynamic (import registry and generate UI) for future-proofing
- No new dependencies required

