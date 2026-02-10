
# Skeleton Loading States and Layout Stability for Accounts Tab

## Overview

Add dedicated skeleton loading states to the Accounts tab that match the current list and grid view layouts. Also harden all image/icon containers with fixed dimensions and fallback placeholders to prevent Cumulative Layout Shift (CLS).

## Current State

- The `AccountsTab` component receives `results` as a prop -- by the time it mounts, results are already loaded (the parent `AdvancedResultsPage` shows a spinner until results arrive).
- However, the Suspense boundary wrapping `AccountsTab` uses a generic `TabSkeleton` that does not match the accounts layout at all.
- Inside the tab, there is no skeleton state for initial render or when filters are being applied.
- Profile images (`<img>` tags in `AccountRow`, `AccountCard`, and `AccountPreviewPanel`) have no fixed dimensions on the `<img>` element itself, relying only on parent containers -- this can cause micro-shifts when images load or fail.
- The `PlatformIcon` component (favicon) has fixed container sizes but lacks a placeholder while loading.

## Changes

### 1. New Component: `AccountsTabSkeleton.tsx`

**File**: `src/components/scan/results-tabs/accounts/AccountsTabSkeleton.tsx`

A dedicated skeleton that mirrors the Accounts tab layout, supporting both `list` and `grid` variants.

- **List variant**: Renders 8 skeleton rows matching `AccountRow` structure (left icon block + text lines + right badges), each at the fixed 44px row height.
- **Grid variant**: Renders 6 skeleton cards matching `AccountCard` structure (icon header + text + action bar).
- Includes a skeleton for the filter bar, focus toggle, search box, and summary bar at the top.
- Uses the existing `Skeleton` component with shimmer animation for consistency.

### 2. Update: `AccountsTab.tsx`

- Accept an optional `isLoading` prop (boolean, defaults to false).
- When `isLoading` is true and `results.length === 0`, render `AccountsTabSkeleton` with the current `viewMode`.
- This provides a smooth transition for the Suspense fallback and for any future streaming-results scenarios.
- Replace the generic `TabSkeleton` in `AdvancedResultsPage.tsx` and `FreeResultsPage.tsx` Suspense boundaries with the new accounts-specific skeleton.

### 3. Layout Stability: Fixed Image Dimensions

**AccountRow.tsx** (profile thumbnail):
- Add explicit `width` and `height` attributes to the `<img>` element (44px x 44px to match container).
- Ensure the fallback initials div is always rendered (not hidden/shown via JS) using CSS `opacity` toggling instead of `display:none`, preventing reflow.

**AccountCard.tsx** (profile thumbnail):
- Add explicit `width` and `height` to `<img>` (32px x 32px to match container).
- Same opacity-based fallback strategy.

**AccountPreviewPanel.tsx** (profile image in sheet header):
- Add explicit `width` and `height` to `<img>` (48px x 48px).
- Same opacity-based fallback strategy.

**PlatformIcon.tsx** (favicon):
- Add a subtle muted background placeholder that shows while the favicon loads.
- Add explicit `width` and `height` attributes to the `<img>` element matching the size config.
- The container already has fixed dimensions, so this is a minor reinforcement.

### 4. Virtualization Stability

- The virtualizer already uses a fixed `estimateSize` of 52px and `overscan` of 10 -- no changes needed there.
- The skeleton will not interact with the virtualizer; it replaces the entire list container during loading.
- This prevents the "flash" pattern where the virtualizer mounts with 0 items then repopulates.

## Technical Details

### AccountsTabSkeleton Structure (List Mode)

```text
+------------------------------------------+
| [_ toggle] [______ search ___] [sort][v] |  <- Filter bar skeleton
+------------------------------------------+
| [_ total] [_ found] [_ high conf]       |  <- Summary bar skeleton
+------------------------------------------+
| [icon] [====== text ======] [badge]      |  <- Row skeleton x 8
| [icon] [====== text ======] [badge]      |
| [icon] [====== text ======] [badge]      |
| ...                                       |
+------------------------------------------+
```

### AccountsTabSkeleton Structure (Grid Mode)

```text
+------------------------------------------+
| [_ toggle] [______ search ___] [sort][v] |
+------------------------------------------+
| +--------+  +--------+  +--------+       |
| | [icon] |  | [icon] |  | [icon] |       |
| | [text] |  | [text] |  | [text] |       |
| | [acts] |  | [acts] |  | [acts] |       |
| +--------+  +--------+  +--------+       |
| +--------+  +--------+  +--------+       |
| | ...    |  | ...    |  | ...    |       |
| +--------+  +--------+  +--------+       |
+------------------------------------------+
```

### Image Fallback Strategy (Before vs After)

**Before**: `onError` handler uses `style.display = 'none'` and shows/hides sibling, causing reflow.

**After**: Both `<img>` and fallback `<div>` are always in the DOM. Use a `useState` (`imageLoaded` / `imageError`) to control opacity:
- Image: `opacity-0` until loaded, then `opacity-100`
- Fallback: `opacity-100` by default, `opacity-0` when image loads

This eliminates all layout shift from image loading/failure.

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/scan/results-tabs/accounts/AccountsTabSkeleton.tsx` | List and grid skeleton matching AccountsTab layout |

## Files to Modify

| File | Change |
|------|--------|
| `AccountsTab.tsx` | Add `isLoading` prop, render skeleton when loading with no results |
| `AccountRow.tsx` | Fixed img dimensions, opacity-based fallback instead of display toggle |
| `AccountCard.tsx` | Fixed img dimensions, opacity-based fallback instead of display toggle |
| `AccountPreviewPanel.tsx` | Fixed img dimensions, opacity-based fallback instead of display toggle |
| `PlatformIcon.tsx` | Add explicit width/height to `<img>`, loading placeholder background |
| `AdvancedResultsPage.tsx` | Replace `TabSkeleton` with `AccountsTabSkeleton` in accounts Suspense |

## No Changes To

- Skeleton base component (`skeleton.tsx`) -- already has shimmer animation
- Virtualization config -- already stable with fixed height + overscan
- Filter/sort logic
- Free tier gating
- Sheet/panel behavior
