

## Update Exposure Score to Surface Area Model

### Overview
Replace the current weighted-category scoring algorithm in `src/lib/exposureScore.ts` with an additive "surface area" model that prioritizes public profile visibility as the dominant factor, adds breach/severity/reuse contributions, and introduces a new `severe` exposure level.

### Changes

**1. `src/lib/exposureScore.ts` -- Major rewrite of scoring logic**

- Add `'severe'` to the `ExposureLevel` type: `'low' | 'moderate' | 'high' | 'severe'`
- Update `getExposureLevel()` to new thresholds:
  - 0-24: `low`
  - 25-49: `moderate`
  - 50-74: `high`
  - 75+: `severe`
- Update `getExposureLevelColor`, `getExposureLevelBgColor`, `getExposureLevelLabel` to handle `severe` (red-600 styling, "Severe exposure" label)
- Replace `calculateCategoryScores()` and the weighted score calculation in `calculateExposureScore()` with the new additive model:

```text
Score Buckets (additive, clamped 0-100):

Profile Presence (dominant):
  Count findings where type === 'social_media' OR type === 'identity'
  0-5:   +5
  6-20:  +15
  21-50: +30
  51-100: +45
  100+:  +60

Breach Association:
  Count findings where type === 'breach'
  1:    +15
  2-5:  +25
  5+:   +35

High Severity Signals:
  Each finding with severity 'high' or 'critical': +5
  Capped at +20

Identifier Reuse:
  Unique providers across social_media + identity findings >= 3: +10
```

- Update the `categories` output so `detected` reflects which buckets contributed (non-zero contribution)
- Set `insight` based on the highest contributing bucket
- Keep CATEGORY_DEFINITIONS and ExposureCategory interface unchanged (backward compatible)

**2. `src/components/results/ExposureScoreCard.tsx` -- Simplify severe handling**

- Remove the local `ExposureScoreLevel` type extension and `getLevelColor`/`getLevelBg`/`getLevelLabel` wrappers since `severe` is now part of the core `ExposureLevel` type
- Use the core `getExposureLevelColor`, `getExposureLevelBgColor`, `getExposureLevelLabel` directly

**3. `src/components/exposure/DigitalExposureScore.tsx` -- No changes needed**

Already uses the core helpers which will now handle `severe`.

**4. `src/components/exposure/ExposureScoreShareCard.tsx` -- No changes needed**

Already uses `ExposureLevel` type which will now include `severe`.

### What stays unchanged
- `ExposureCategory` interface shape
- `CATEGORY_DEFINITIONS` array (same 5 categories)
- `Finding` type in `ufm.ts`
- `generateExposureDrivers()` in `exposureScoreDrivers.ts`
- Results page mapping logic (already fixed in previous plan)
- `useRealtimeResults.ts`

### Technical Details
- The function still accepts `Finding[]` as input
- Profile counting uses `finding.type === 'social_media' || finding.type === 'identity'`
- Breach counting uses `finding.type === 'breach'`
- The additive model produces scores that align intuitively with real exposure (many profiles = high surface area)
- Empty findings still return score 0 / level low / default insight
