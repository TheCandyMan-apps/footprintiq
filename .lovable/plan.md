

# Fix Overlapping Text on Mobile — Connections Tab

## Problem
On mobile screens, the Connections tab toolbar has text elements that overlap and become unreadable. Specifically:
- The mode toggle buttons (Correlation / Mind Map) and the stats text ("3 profiles · 1 correlations") are in a single `flex` row that doesn't wrap on narrow screens
- The compact explanation bar below also crams stats + explanation summary into a single non-wrapping line

## Solution
Make the toolbar and explanation bar responsive so they stack vertically on small screens instead of overlapping.

## Changes

### File: `src/components/scan/results-tabs/ConnectionsTab.tsx`

1. **Mode Toggle Bar (line ~317)**: Change the container from a single-row flex to one that wraps on small screens:
   - Add `flex-wrap` so the stats text drops below the mode toggles on narrow viewports
   - Ensure the stats div has `whitespace-nowrap` to prevent partial line breaks

2. **Compact Explanation Bar (line ~445)**: Fix the info bar that shows "3 profiles · 1 correlations · Linked via bio similarity signals":
   - Allow the text to wrap naturally instead of using `truncate` which causes visual clipping
   - Alternatively, hide the redundant stats from this bar on mobile since they're already shown in the toggle bar above, keeping only the explanation summary

3. **General mobile polish**: Add `min-w-0` and `overflow-hidden` where needed to prevent flex children from forcing the container wider than the viewport.

These are small CSS/className changes — no logic or functionality changes required.
