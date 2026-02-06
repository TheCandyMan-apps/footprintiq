
# Viral Growth & SEO Optimization Implementation Plan

## Overview

This plan implements all four recommendations to increase FootprintIQ's conversion and organic growth potential:

1. **Hero Input Field** — Start scans directly from homepage (reduce friction)
2. **Visual Share Cards** — Dynamic OG images for social sharing (increase virality)
3. **Niche Landing Pages** — Targeted SEO pages for crypto, job seekers, developers (capture intent)
4. **Surface Referral System** — Increase visibility of existing referral program (drive organic growth)

---

## 1. Hero Input Field (Friction Reduction)

### Current State
- Hero component (`src/components/Hero.tsx`) has a "Run a Free Scan" button that links to `/scan`
- UnifiedScanForm (`src/components/scan/UnifiedScanForm.tsx`) has the actual input field
- User journey: Homepage → Click CTA → Navigate to /scan → Enter identifier → Start scan

### Proposed Change
Add a lightweight input field directly in the Hero that allows users to type their identifier and immediately redirect to `/scan?q={identifier}` with the value pre-filled.

### Files to Modify

| File | Action |
|------|--------|
| `src/components/Hero.tsx` | Add inline input field with auto-detection badge |
| `src/components/scan/UnifiedScanForm.tsx` | Accept URL query param `?q=` to pre-fill input |
| `src/pages/Index.tsx` | Update Hero integration |

### Implementation Details

**Hero.tsx Changes:**
```text
┌────────────────────────────────────────────────────────────────┐
│  See What the Internet Knows About You                         │
│  ─────────────────────────────────────────────────────────────  │
│  [Username, email, or phone...        ] [Check Now →]           │
│  ┌──────────────────────────────────────────────────┐           │
│  │ 📧 Email detected                                │  (dynamic)│
│  └──────────────────────────────────────────────────┘           │
│                                                                 │
│  ✓ Public data only  ✓ No tracking  ✓ User-initiated          │
└────────────────────────────────────────────────────────────────┘
```

- Input field with live type detection (reuse `detectType()` from UnifiedScanForm)
- On submit: `navigate(\`/scan?q=\${encodeURIComponent(identifier)}\`)`
- Keep secondary "Learn How It Works" button

**UnifiedScanForm.tsx Changes:**
- On mount, check `URLSearchParams` for `q` param
- If present, set `identifier` state and trigger type detection
- User can immediately submit or modify

### SEO Keyword Integration
- H1 remains unchanged (already optimized)
- Input placeholder: "Enter username, email, or phone number"
- Aria-label: "digital footprint scanner input"

---

## 2. Visual Share Cards (Dynamic OG Images)

### Current State
- `ExposureScoreShareCard.tsx` uses Web Share API with text-only content
- No visual OG image generated
- Share text is generic and doesn't include personalized score

### Proposed Change
Create dynamic OG images that visually represent the exposure score without revealing PII.

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/og-share-image/index.ts` | Create | Edge function to generate share images |
| `src/components/exposure/ExposureScoreShareCard.tsx` | Update | Add "Generate Share Card" option |
| `src/pages/share/[scanId].tsx` | Create | Public share page with OG meta |

### Implementation Details

**Edge Function: og-share-image**
- Input: `{ scanId, score, level }` (no PII)
- Output: SVG or Canvas-rendered image (1200x630)
- Visual design:
  - FootprintIQ branding
  - Large score number in circle (72/100)
  - Level badge (Low/Moderate/High)
  - Blurred background pattern
  - "Check yours at footprintiq.app" CTA

**Share Page: /share/[scanId]**
- Public route (no auth required)
- OG meta tags point to edge function image
- Page content: "Someone shared their exposure score"
- CTA: "Run your own free scan"

**ExposureScoreShareCard.tsx Update:**
- Add "Copy Share Link" option alongside native share
- Share URL: `https://footprintiq.app/share/{scanId}`

### Share Message Template
```text
"I just checked my digital footprint on FootprintIQ.
My exposure score: 72/100 (Moderate)
Check yours for free: footprintiq.app/share/abc123"
```

---

## 3. Niche Landing Pages (SEO Capture)

### Current State
- Generic homepage targets broad audience
- No dedicated pages for specific use cases
- Missing long-tail keyword opportunities

### Proposed Pages

| Route | Target Audience | Primary Keywords |
|-------|-----------------|------------------|
| `/for/crypto` | Crypto users | SIM swap protection, wallet security, crypto OPSEC |
| `/for/job-seekers` | Job seekers | employer background check, digital reputation, LinkedIn exposure |
| `/for/developers` | Developers | GitHub exposure, API key leaks, code history |
| `/for/executives` | Executives | executive protection, reputation management |

### Files to Create

| File | Description |
|------|-------------|
| `src/pages/for/Crypto.tsx` | Crypto security landing page |
| `src/pages/for/JobSeekers.tsx` | Job seeker landing page |
| `src/pages/for/Developers.tsx` | Developer-focused landing page |
| `src/pages/for/Executives.tsx` | Executive protection landing page |
| `src/App.tsx` | Add routes |

### Page Template Structure

Each page follows SEO-optimized structure:

```text
1. Hero
   - Audience-specific headline
   - Keyword-rich subheading
   - Hero input field (reused component)

2. Pain Points Section
   - 3-4 audience-specific risks
   - Evidence/statistics where available

3. What We Scan Section
   - Audience-relevant sources
   - Platform examples (GitHub for devs, LinkedIn for job seekers)

4. How It Helps
   - Use case scenarios
   - Before/after framing

5. CTA
   - "Run Your Free Scan"

6. FAQ
   - Audience-specific questions
   - Schema.org FAQPage markup
```

### SEO Implementation

**Meta Tags (per page):**
```typescript
<SEO
  title="Crypto Security Scan — Protect Against SIM Swaps & Doxxing | FootprintIQ"
  description="Free OSINT scan for crypto users. Check if your phone, email, or wallet-linked identifiers are exposed before hackers find them."
  canonical="https://footprintiq.app/for/crypto"
/>
```

**Schema.org Markup:**
- WebPage type
- BreadcrumbList
- FAQPage for questions

---

## 4. Surface Referral System

### Current State
- Full referral system exists at `/referrals`
- `ReferralBanner.tsx` and `ReferralCodeInput.tsx` exist
- Low visibility in user journey

### Proposed Changes

| Location | Change |
|----------|--------|
| Post-scan results page | Add referral prompt after upgrade modal |
| Dashboard sidebar | Add referral card to PowerFeaturesCard |
| Share flow | Include referral link option in share actions |
| Email flows | Add referral mention to welcome email |

### Files to Modify

| File | Action |
|------|--------|
| `src/components/scan/FreeResultsPage.tsx` | Add ReferralPrompt after scan completes |
| `src/components/scan/AdvancedResultsPage.tsx` | Add ReferralPrompt in toolbar area |
| `src/components/exposure/ExposureScoreShareCard.tsx` | Add "Share with referral link" option |
| `src/components/dashboard/PowerFeaturesCard.tsx` | Already has referral card - ensure visibility |

### New Component: ReferralPrompt

```text
┌─────────────────────────────────────────────────────────────┐
│  💰 Know someone who should check their exposure?           │
│                                                             │
│  Share your referral link and earn 100 credits when they   │
│  complete their first scan.                                 │
│                                                             │
│  [Copy Referral Link]  [Share via Email]  [Share on X]     │
└─────────────────────────────────────────────────────────────┘
```

### Referral Link Integration in Share

Current share flow:
- Native share / clipboard copy

Updated share flow:
- Native share / clipboard copy
- **New:** "Share with your referral code" option
- Appends `?ref={code}` to share URL

---

## File Changes Summary

### New Files (7)

| File | Purpose |
|------|---------|
| `supabase/functions/og-share-image/index.ts` | Dynamic OG image generation |
| `src/pages/share/ScanShare.tsx` | Public share page |
| `src/pages/for/Crypto.tsx` | Niche landing page |
| `src/pages/for/JobSeekers.tsx` | Niche landing page |
| `src/pages/for/Developers.tsx` | Niche landing page |
| `src/pages/for/Executives.tsx` | Niche landing page |
| `src/components/ReferralPrompt.tsx` | Inline referral prompt |

### Modified Files (7)

| File | Changes |
|------|---------|
| `src/components/Hero.tsx` | Add inline input field with type detection |
| `src/components/scan/UnifiedScanForm.tsx` | Accept URL query param pre-fill |
| `src/components/exposure/ExposureScoreShareCard.tsx` | Add share link + referral options |
| `src/components/scan/FreeResultsPage.tsx` | Add ReferralPrompt after results |
| `src/components/scan/AdvancedResultsPage.tsx` | Add ReferralPrompt in results |
| `src/App.tsx` | Add new routes |
| `supabase/config.toml` | Add og-share-image function |

---

## Implementation Order

### Phase 1: Hero Input Field (Highest Impact)
1. Update Hero.tsx with inline input
2. Update UnifiedScanForm.tsx to accept query params
3. Test flow end-to-end

### Phase 2: Niche Landing Pages
1. Create page template
2. Build Crypto page (highest-value niche)
3. Build remaining 3 pages
4. Add routes and verify SEO

### Phase 3: Visual Share Cards
1. Create og-share-image edge function
2. Create public share page
3. Update ExposureScoreShareCard
4. Test sharing on social platforms

### Phase 4: Referral Visibility
1. Create ReferralPrompt component
2. Integrate into results pages
3. Add referral option to share flow

---

## Ethical Guardrails Maintained

All changes comply with FootprintIQ's ethical positioning:

- **No urgency language** — CTAs use "Check" not "Protect Now!"
- **No fear-based messaging** — Niche pages focus on awareness, not threats
- **No live activity feeds** — Rejected from strategy (creates false urgency)
- **Neutral share text** — "My exposure score" not "I'm at risk!"
- **No PII in share cards** — Only score and level, never identifiers

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Homepage → Scan conversion | +25% | Analytics funnel |
| Social share rate | +40% | Share click events |
| Organic traffic (niche pages) | +15% in 90 days | GSC impressions |
| Referral program usage | +50% | referral_codes table |
