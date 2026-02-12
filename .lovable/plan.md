

## Polish Exposure Score Card and Remove Redundancy

### Task A: Remove Duplicate "Risk Assessment" (BlurredRiskGauge)

In `FreeResultsPage.tsx`, remove the `BlurredRiskGauge` component (lines 601-606) and its import (line 84). This was the blurred gauge creating redundancy with the Exposure Score card. The page flow becomes:

1. ExposureScoreCard (locked)
2. Risk Snapshot section (kept)
3. HiddenInsightsTeaser
4. Public Profiles
5. ...remaining blocks

### Task B: Add `interpretation` Prop to ExposureScoreCard

Add an optional `interpretation?: string` prop to `ExposureScoreCard`. Render it as small muted text below the header row (under "Exposure Score" title + badge).

Interpretation text by level (provided by the page components):
- **low**: "Limited public discoverability detected for this identifier."
- **moderate**: "This identifier is publicly discoverable across multiple sources."
- **high**: "High public surface area across multiple independent platforms."
- **severe**: "Extensive public exposure across many sources -- prioritise review."

Wire this in both `FreeResultsPage.tsx` (ExposureScoreCardSection) and `AdvancedResultsPage.tsx`.

### Task C: Badge Text Override for Free "Emerging Exposure"

Add optional `badgeLabel?: string` prop to `ExposureScoreCard`. When provided, it overrides the default `getExposureLevelLabel(level)` text in the badge.

In `FreeResultsPage.tsx` only: if score is 10-24, pass `badgeLabel="Emerging exposure"`. Otherwise omit the prop (uses default labels).

### Task D: Improve Free CTA Copy

In `ExposureScoreCard.tsx`, update the locked section:
- Change the lock text from "Unlock full exposure breakdown + remediation steps" to "See which platforms increase your exposure most + get step-by-step privacy recommendations"
- Add a subtext line below the Upgrade button: "Includes full breakdown, evidence, and remediation checklist." (small muted text)

### Task E: UX Polish

- Tighten locked section spacing: reduce `pt-3` to `pt-2` and gap adjustments
- Ensure no "Unknown" labels anywhere in the card

### Files to Edit

1. **`src/components/results/ExposureScoreCard.tsx`** -- add `interpretation` and `badgeLabel` props, update CTA copy, tighten spacing
2. **`src/components/scan/FreeResultsPage.tsx`** -- remove BlurredRiskGauge import + usage, pass `interpretation` and conditional `badgeLabel` to ExposureScoreCardSection
3. **`src/components/scan/AdvancedResultsPage.tsx`** -- pass `interpretation` based on level

### What Stays Unchanged
- `exposureScore.ts` -- no changes
- `exposureScoreDrivers.ts` -- no changes
- Risk Snapshot section -- kept as-is
- Pro results layout -- no structural changes

