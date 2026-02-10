

# Premium UI Polish Pass -- Accounts Tab

## 1. Results Summary Bar (new)

Add a compact, chip-based summary row between the AccountFilters and the Focus/Search controls in `AccountsTab.tsx`. It shows at-a-glance stats:

- **Total**: `displayResults.length` total results
- **Found**: `statusCounts.found` found accounts (green chip)
- **High Confidence**: count of results with score >= 75 (from existing `filterCounts.high_confidence`)
- **Hidden by Focus**: `hiddenByFocusMode` count (amber chip, only when > 0)
- **Active filters**: show current sort and status filter as muted text on the right

This replaces the current "Inline Stats" section (lines 272-289) with a cleaner, unified summary row.

## 2. Hide Secondary Actions on Hover (list view)

In `AccountRow.tsx`, wrap the `AccountRowActions` cluster in a container that is `opacity-0 group-hover:opacity-100 focus-within:opacity-100` so secondary actions (Focus, Claim, LENS, Expand) only appear on hover/focus. The **confidence badge** and **LENS badge** (when verified) remain always visible since they are informational, not actions.

In `AccountRowActions.tsx`, add the hover-reveal class to the outer container so the entire action cluster fades in on row hover. The `ExternalLink` (Open) button will be pulled out and kept always visible as the primary action.

### Specific changes:

**AccountRow.tsx (RIGHT section, line 236 area)**:
- Keep the confidence badge and LENS badge always visible
- Move the "Open link" action out of `AccountRowActions` and render it inline as always-visible
- Wrap `AccountRowActions` in `opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity`

**AccountRowActions.tsx**:
- Remove the `ExternalLink` button from this component (it moves to AccountRow)
- Remove `url` from the required props (becomes optional, only for LENS verify)

## 3. Spacing and Typography Tightening

**AccountRow.tsx**:
- Reduce `min-h-[52px]` to `min-h-[44px]` for tighter row height
- Reduce `py-1.5` to `py-1` on the main row div

**AccountCard.tsx**:
- Reduce `pt-2.5 pb-1` to `pt-2 pb-1` on header
- Reduce `pb-1.5` to `pb-1` on bio section
- Ensure action row uses `py-1` consistently

## 4. Empty States with Reset

In `AccountsTab.tsx`, replace the current minimal empty state (lines 292-298) with two distinct states:

**No results at all** (when `displayResults.length === 0`):
- User icon, "No accounts found" title, "This scan did not find any matching accounts." description
- No reset button needed

**No matches for current filters** (when `filteredResults.length === 0` but `displayResults.length > 0`):
- Search icon, "No matching accounts" title, description mentioning active filters
- "Reset Filters" button that clears `searchQuery`, `statusFilter` to 'all', and `quickFilter` to 'all'

Both use the existing `EmptyState` component from `src/components/EmptyState.tsx`.

---

## Technical Summary

| File | Changes |
|------|---------|
| `AccountsTab.tsx` | Replace inline stats with summary bar; add empty states with reset; import EmptyState |
| `AccountRow.tsx` | Reduce row padding/height; extract Open link as always-visible; wrap remaining actions in hover-reveal |
| `AccountRowActions.tsx` | Remove ExternalLink button (moved to parent); make `url` optional |
| `AccountCard.tsx` | Tighten spacing on header, bio, action sections |

No new files created. No functionality or gating changes.
