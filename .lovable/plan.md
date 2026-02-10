
# Side Panel Preview for Accounts Tab

## Overview

Replace inline expand/collapse with a right-side Sheet panel that opens when clicking a row (list) or card (grid). Rows and cards become compact, selection-only surfaces. The Sheet displays all detailed content currently in the collapsible/dialog areas.

## Architecture

**New file**: `src/components/scan/results-tabs/accounts/AccountPreviewPanel.tsx`
- A Sheet (from existing `@/components/ui/sheet`) sliding in from the right
- Contains all content currently in `AccountRow`'s `CollapsibleContent` and `AccountCard`'s Details Dialog:
  - Platform icon, name, username, profile image
  - Confidence breakdown (full `ConfidenceBreakdown` component)
  - LENS badge and "LENS Verify" button (with tier gating)
  - Full bio, metadata grid (followers, following, location, joined, website)
  - Profile URL link
  - AI enrichment buttons (Quick Analysis / Deep Enrichment) for Pro users
  - Claim toggle and Focus button
  - ForensicModal launcher (if verified)
- Props: the selected `ScanResult`, `jobId`, lens score, verification/claim state, callbacks, and `open`/`onOpenChange`
- Built-in accessibility: Sheet already provides focus trap and ESC-to-close; will add `aria-label` for the panel

**Modified: `AccountsTab.tsx`**
- Replace `expandedRows` state with `selectedResultId: string | null`
- Clicking a row/card sets `selectedResultId` (instead of toggling expand)
- Render `AccountPreviewPanel` at the bottom of the component, driven by `selectedResultId`
- Remove `toggleExpanded` and `expandedRows` from `VirtualizedAccountList` props
- Virtualizer `estimateSize` can use a fixed height (no dynamic expand), improving performance

**Modified: `AccountRow.tsx`**
- Remove `Collapsible`/`CollapsibleContent` wrapper entirely
- Remove `isExpanded`/`onToggleExpand` props
- Replace with `onSelect` prop (clicking the row calls this)
- Add `isSelected` prop for visual highlight (subtle background change)
- Remove all expanded-panel content (confidence breakdown, bio, metadata grid, AI buttons)
- Remove ForensicModal, QuickAnalysisDialog, EnrichmentDialog (moved to panel)
- Keep the compact row: icon, platform, username, signal chips, bio snippet, confidence badge, LENS badge, open-link button
- Secondary hover actions remain (Focus, Claim) but remove Expand chevron

**Modified: `AccountRowActions.tsx`**
- Remove the "Expand" (ChevronRight) button and related props (`isExpanded`, `onToggleExpand`)

**Modified: `AccountCard.tsx`**
- Remove the Details `Dialog` entirely
- Replace with `onSelect` prop; clicking the card calls it
- Add `isSelected` prop for ring highlight
- Remove the "Details" button from action row, replace with "Preview" or just make the whole card clickable
- Remove QuickAnalysisDialog/EnrichmentDialog (moved to panel)

## Accessibility

- The Sheet component already implements focus trap and ESC-to-close
- Keyboard navigation: pressing Enter on a focused row/card opens the panel
- `aria-label="Account preview panel"` on the Sheet
- Panel close button is keyboard-accessible (Sheet provides this)

## Visual Behavior

- List view: clicking a row highlights it and opens the right sheet; clicking another row switches content; clicking the same row or pressing ESC closes it
- Grid view: same behavior -- clicking a card opens the sheet
- The sheet width: `sm:max-w-md` (roughly 28rem) to leave the list visible

## What Moves Where

| Content | Currently in | Moves to |
|---------|-------------|----------|
| ConfidenceBreakdown | AccountRow expanded, AccountCard dialog | AccountPreviewPanel |
| Full bio | AccountRow expanded, AccountCard dialog | AccountPreviewPanel |
| Metadata grid (followers, location, etc.) | AccountRow expanded, AccountCard dialog | AccountPreviewPanel |
| AI enrichment buttons | AccountRow expanded, AccountCard inline | AccountPreviewPanel |
| ForensicModal launcher | AccountRow | AccountPreviewPanel |
| LENS upgrade prompt | AccountRow expanded | AccountPreviewPanel |
| Profile URL link | AccountRow expanded, AccountCard dialog | AccountPreviewPanel |

## No Changes To

- Filtering, sorting, search, focus mode, view mode toggle
- Free/Pro tier gating logic
- Summary bar and empty states
- AccountFilters component
- FocusedEntityCard component
