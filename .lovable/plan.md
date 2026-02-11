
## Fix: Exposure Score Data Mapping and Driver Detection

### Problem
The current confidence mapping in both results pages references `r.evidence.confidence_score` -- a property that does not exist on findings rows. Findings have a top-level `confidence` column (0-1 decimal), while social_profiles have `confidence_score` (0-100 integer) placed inside `evidence` during normalization. The driver detection also misses `breach.hit` as a primary kind match and does not handle social_profiles (which use `found: true` normalized to `status: 'found'`).

### Changes

**1. Create `src/lib/results/getEvidenceValue.ts`**
A small utility to safely extract values from evidence arrays (array of `{key, value}` objects):
- `getEvidenceValue(evidence: any, key: string): string | undefined`
- Handles both array-of-objects format and plain object format
- Case-insensitive key matching

**2. Update `src/lib/exposureScoreDrivers.ts`**
- Breach detection: check `kind === 'breach.hit'` first, then check if provider includes `hibp`, then fall back to existing keyword matching on kind/provider/site/meta/evidence
- Profile detection: also match rows where `status === 'found'` (covers normalized social_profiles) alongside the existing `kind === 'profile_presence'` check
- Use `site` or `meta?.platform` for platform labels, never show empty/undefined
- Ensure all labels are factual and never say "Unknown"

**3. Fix confidence mapping in `FreeResultsPage.tsx` (`ExposureScoreCardSection`)**
Replace the broken `r.evidence?.confidence_score` logic with:
```
confidence:
  typeof (r as any).confidence === 'number' ? (r as any).confidence :
  typeof (r as any).evidence?.confidence_score === 'number' ? (r as any).evidence.confidence_score / 100 :
  0.5
```
This correctly handles:
- Findings rows: top-level `confidence` (0-1)
- Social profile rows: `evidence.confidence_score` (0-100, divided by 100)
- Unknown: fallback 0.5

**4. Fix confidence mapping in `AdvancedResultsPage.tsx` (`AdvancedExposureScoreSection`)**
Apply the same confidence mapping fix as above.

### Files to Create
- `src/lib/results/getEvidenceValue.ts`

### Files to Edit
- `src/lib/exposureScoreDrivers.ts` -- breach detection priority, profile detection broadening
- `src/components/scan/FreeResultsPage.tsx` -- fix confidence mapping (line 144)
- `src/components/scan/AdvancedResultsPage.tsx` -- fix confidence mapping (line 65)

### What stays unchanged
- `ExposureScoreCard.tsx` UI component -- no changes needed
- `exposureScore.ts` calculation logic -- no changes needed
- `useRealtimeResults.ts` -- already correct
