
# Consolidate Duplicate Scan Buttons on Dashboard

## What Changes

Remove the outlined "Start Scan" button from the Dashboard toolbar and keep only the filled "Start New Scan" button. Both buttons currently navigate to the same `/scan` page, which already detects the user's tier and displays options accordingly -- so there's no need for two separate buttons.

## Before / After

```text
Before:  [Saved Views] [Anomaly History] [Entity Graph] [Batch Scan] [Start Scan] [Start New Scan]
After:   [Saved Views] [Anomaly History] [Entity Graph] [Batch Scan] [Start New Scan]
```

## Technical Details

**File:** `src/pages/Dashboard.tsx`

- Remove lines 712-715 (the outlined "Start Scan" button with `data-tour="advanced-scan-btn"`)
- Move the `data-tour="advanced-scan-btn"` attribute to the remaining "Start New Scan" button so any onboarding tour still targets the correct element
- No other files need changes -- the `/scan` page already handles all tier-aware logic (provider filtering, upgrade prompts, scan type routing)
