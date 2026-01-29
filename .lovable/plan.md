
# Plan: Transform Entity Graph to Use Mind Map Visualization

## Summary
Replace the current Entity Graph page (`/graph`) with a cross-scan Mind Map visualization that matches the style and behavior of the Connections/Mind Map component used in individual scan results.

---

## What Changes

### Current Behavior
- **Entity Graph button** navigates to `/graph`, which displays a Cytoscape-based network of `entity_nodes` and `entity_edges` tables
- Uses rectangular node shapes, cose layout, and entity-type-based coloring
- Data comes from aggregated cross-scan entity tables

### New Behavior
- **Entity Graph button** will navigate to a page with Mind Map-style visualization
- Radial/sunburst layout with central root node and category-based "legs"
- Category grouping with deterministic color palette
- Confidence signals, reasoning chips, and profile inspector panel
- Same visual language as the scan-specific Connections tab

---

## Implementation Steps

### 1. Create Aggregated Data Fetcher
Create a new hook `useAggregatedMindMapData` that:
- Fetches all `findings` and `social_profiles` for the current user across all scans
- Deduplicates by URL (same logic as `MindMapGraph`)
- Returns data in the same `ScanResult` format expected by `MindMapGraph`

### 2. Update Entity Graph Page
Modify `src/pages/Graph.tsx` to:
- Import and use `MindMapGraph` and `MindMapInspector` components
- Add view mode toggles (Category / All), connect-by controls
- Replace Cytoscape initialization with the Mind Map component
- Keep the header, toolbar, and export functionality

### 3. Wire Inspector Panel
Integrate `MindMapInspector` for:
- Profile node selection (platform, confidence, reasoning)
- Leg/category selection (group stats, member list)
- Same interaction patterns as ConnectionsTab

### 4. Preserve Existing Functionality
- JSON export (already exists)
- Snapshot save (already exists)
- Clear graph (reset aggregated data filter)
- Zoom controls (handled by MindMapGraph)

---

## Technical Details

### Data Flow
```text
User clicks "Entity Graph"
       ↓
/graph page mounts
       ↓
useAggregatedMindMapData hook fetches all user findings/profiles
       ↓
MindMapGraph renders with cross-scan data
       ↓
User interactions update MindMapInspector panel
```

### Files to Modify
| File | Change |
|------|--------|
| `src/pages/Graph.tsx` | Replace Cytoscape with MindMapGraph + MindMapInspector |
| `src/hooks/useAggregatedMindMapData.ts` | **New file** - fetch cross-scan data |

### Files to Reuse (no changes)
| File | Purpose |
|------|---------|
| `src/components/scan/results-tabs/connections/MindMapGraph.tsx` | Core visualization |
| `src/components/scan/results-tabs/connections/MindMapInspector.tsx` | Side panel |
| `src/hooks/usePlatformCatalog.ts` | Category mapping |

---

## UI Preview

The new Entity Graph page will have:
- **Header**: "Entity Graph" title + stats (X profiles, Y categories)
- **Toolbar**: View mode toggle, Connect-by dropdown, export buttons
- **Main area**: MindMapGraph with radial layout
- **Right panel**: MindMapInspector (collapsible)

Layout will be similar to the existing ConnectionsTab but scoped to all user data instead of a single scan.

---

## Edge Cases

1. **No data**: Show empty state with "Run some scans to populate your graph"
2. **Large datasets**: MindMapGraph already caps at 200 profiles with sorting by confidence
3. **Performance**: Reuse existing memoization patterns from MindMapGraph

---

## Testing Checklist
- [ ] Verify Entity Graph button navigates to updated page
- [ ] Confirm Mind Map renders with cross-scan data
- [ ] Test category grouping and color consistency
- [ ] Verify inspector panel opens on node/leg click
- [ ] Test zoom controls work
- [ ] Confirm JSON export still functions
- [ ] Check empty state when no scans exist
