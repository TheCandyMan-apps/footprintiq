
# Update FreeResultsPage: Full Results for First 10 Findings

## Overview

This plan updates the Free tier results experience to show the **first 10 scan findings in full Pro-style detail**, followed by a **lock divider** showing how many findings were seen, and then a **locked section** indicating how many more are available in Pro.

## Current State

The FreeResultsPage currently:
- Shows only 3 preview profiles via a basic `ProfilePreviewRow` component
- Displays redacted/minimal info (platform name, badge, basic metadata)
- Uses a simplified card-based layout
- Hides provider names and detailed metadata

## Target State

The updated FreeResultsPage will:
1. Display the **first 10 results** using the same `AccountRow` component from the Pro/Advanced experience
2. Show full metadata, confidence scoring, platform icons, and bio text for these 10
3. Insert a **lock divider** after the 10th result: "You've seen 10 of X findings"
4. Display a **locked results block** below: "Y more findings available in Pro"
5. Remove all blurring/truncation within the first 10 results

## Technical Changes

### 1. Import the AccountRow Component
Import `AccountRow` from `@/components/scan/results-tabs/accounts/AccountRow` to render Pro-style result cards.

### 2. Convert Aggregated Profiles to ScanResult Format
The `foundProfiles` array uses `AggregatedProfile` type, but `AccountRow` expects `ScanResult`. Create an adapter function to convert aggregated profiles to the expected format.

### 3. Update Display Logic
- Change `previewProfiles` from `slice(0, 3)` to show first 10 results
- Update `hiddenCount` calculation accordingly
- Add state for expanded rows and LENS score mocking (since Free users won't have real LENS data)

### 4. Replace ProfilePreviewRow with AccountRow
Remove the simplified `ProfilePreviewRow` component usage and render `AccountRow` for each of the first 10 findings in a container styled identically to the Pro Accounts tab.

### 5. Add Lock Divider Component
After the 10th result, insert a divider with:
- Lock icon
- Text: "You've seen 10 of {totalProfiles} findings"

### 6. Add Locked Results Block
Below the divider, show:
- Grayed-out/muted styling
- Text: "{remainingCount} more findings available in Pro"
- Upgrade button

### 7. Remove Curiosity-Gap Blur Elements
The following curiosity-gap components can remain on the page (BlurredRiskGauge, HiddenInsightsTeaser, ScanDepthIndicator) but the result cards themselves will NOT be blurred or truncated.

## Files to Modify

**`src/components/scan/FreeResultsPage.tsx`**
- Import `AccountRow` component
- Create adapter function for profile → ScanResult conversion
- Update `previewProfiles` to show 10 instead of 3
- Replace `ProfilePreviewRow` mapping with `AccountRow` rendering
- Add lock divider component after results list
- Add locked results block
- Update `hiddenCount` calculation

## UI Structure

```text
┌──────────────────────────────────────────────┐
│ Header: "Here's what we found"               │
├──────────────────────────────────────────────┤
│ BlurredRiskGauge (curiosity gap)             │
├──────────────────────────────────────────────┤
│ Risk Snapshot Card                           │
├──────────────────────────────────────────────┤
│ HiddenInsightsTeaser (curiosity gap)         │
├──────────────────────────────────────────────┤
│ Public Profiles Section                      │
│ ┌──────────────────────────────────────────┐ │
│ │ AccountRow #1 (full Pro-style)           │ │
│ │ AccountRow #2 (full Pro-style)           │ │
│ │ ... (up to 10)                           │ │
│ │ AccountRow #10 (full Pro-style)          │ │
│ ├──────────────────────────────────────────┤ │
│ │ 🔒 You've seen 10 of 47 findings         │ │
│ ├──────────────────────────────────────────┤ │
│ │ 37 more findings available in Pro        │ │
│ │ [Unlock Pro →]                           │ │
│ └──────────────────────────────────────────┘ │
├──────────────────────────────────────────────┤
│ ScanDepthIndicator                           │
├──────────────────────────────────────────────┤
│ Connections Teaser                           │
├──────────────────────────────────────────────┤
│ Personalized Pro Value Block                 │
└──────────────────────────────────────────────┘
```

## Rules Compliance

- **First 10 results in FULL Pro-style detail** - Using actual `AccountRow` component
- **No blur** - Results are rendered cleanly
- **No truncation** - Full metadata shown within AccountRow
- **Consistent risk labels** - Using same confidence badge system as Pro
- **Lock divider** with dynamic count
- **Locked section** with remaining count and upgrade CTA
