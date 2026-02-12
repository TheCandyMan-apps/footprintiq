

## Finalise Exposure Score Polish

Most structural changes (BlurredRiskGauge removal, interpretation prop, badgeLabel prop) are already implemented. The remaining work is small copy adjustments across two files.

### What is already done (no action needed)
- BlurredRiskGauge / "Risk Assessment" block -- already removed from FreeResultsPage
- `interpretation` and `badgeLabel` props -- already wired in ExposureScoreCard and both results pages
- Locked section CTA -- already updated in prior plan

### Remaining changes

#### 1. Update Risk Snapshot wording (FreeResultsPage.tsx, line 624)

Change:
```
"signals need your attention"
```
To:
```
"public exposure signals detected"
```

#### 2. Adjust interpretation wording (FreeResultsPage.tsx, lines 162-167)

Update the `interpretationMap` values to match the requested wording:
- **moderate**: "This identifier appears across multiple public platforms."
- **high**: "High public surface area across independent platforms."
- **severe**: "Extensive public exposure detected across many sources."

(`low` stays unchanged.)

#### 3. Shorten locked CTA text (ExposureScoreCard.tsx, line 126)

Change:
```
"See which platforms increase your exposure most + get step-by-step privacy recommendations"
```
To:
```
"See which platforms increase your exposure most"
```

#### 4. Update subtext wording (ExposureScoreCard.tsx, line 143)

Change:
```
"Includes full breakdown, evidence, and remediation checklist."
```
To:
```
"Includes full breakdown, evidence, and privacy recommendations."
```

#### 5. Mirror interpretation updates in AdvancedResultsPage.tsx

Apply the same wording changes (moderate/high/severe) to the `interpretationMap` in AdvancedResultsPage.

### Files to edit
1. `src/components/scan/FreeResultsPage.tsx` -- Risk Snapshot copy (line 624) + interpretation wording (lines 164-166)
2. `src/components/results/ExposureScoreCard.tsx` -- CTA text (line 126) + subtext (line 143)
3. `src/components/scan/AdvancedResultsPage.tsx` -- interpretation wording alignment

### What stays unchanged
- `exposureScore.ts`, `exposureScoreDrivers.ts` -- no changes
- ExposureScoreCard component structure and props -- no changes
- Risk Snapshot grid layout -- no changes
