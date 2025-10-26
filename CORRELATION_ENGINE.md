# OSINT Correlation Engine - Complete Implementation

## 🎯 Overview

FootprintIQ now features a world-class OSINT correlation engine that transforms scattered intelligence data into an interactive entity graph with risk/confidence scoring. This positions FootprintIQ as the **top OSINT correlation platform**.

---

## ✅ Completed Features

### 1. **Database Schema** ✅
- **`entity_nodes`** - Stores entities with risk/confidence scores
  - Supports: email, username, domain, phone, IP, person
  - Tracks: risk_score, confidence_score, provider_count, finding_count
  - Includes severity breakdown (critical/high/medium/low/info)
  - Full RLS policies for user data isolation

- **`entity_edges`** - Stores relationships between entities
  - Tracks relationship type and confidence
  - Stores provider evidence and metadata
  - Cascading deletes when nodes are removed

- **`graph_snapshots`** - Version control for graphs
  - Save point-in-time snapshots
  - Export/import capability
  - Tracks node/edge counts

### 2. **Scoring Engine** (`src/lib/score.ts`) ✅

**Risk Scoring Algorithm:**
- Severity-weighted scoring (Critical: 25, High: 15, Medium: 10, Low: 5, Info: 2)
- Provider corroboration bonus (2 points per unique provider)
- Confidence multiplier (0.8 weight)
- Logarithmic scaling for high scores
- Range: 0-100

**Confidence Scoring Algorithm:**
- Average finding confidence (70% weight)
- Provider diversity bonus (up to 50%)
- Range: 0-100

**Risk Levels:**
- Critical: 80-100
- High: 60-79
- Medium: 40-59
- Low: 20-39
- Minimal: 0-19

**Confidence Levels:**
- Very High: 85-100
- High: 70-84
- Medium: 50-69
- Low: 0-49

### 3. **Graph Management** (`src/lib/graph.ts`) ✅

**Core Functions:**
- `detectEntityType()` - Auto-detect entity types from strings
- `upsertEntityNode()` - Create/update nodes with scores
- `upsertEntityEdge()` - Create/update relationships
- `getEntityNode()` - Retrieve specific nodes
- `getConnectedEntities()` - Graph traversal
- `searchEntities()` - Full-text entity search
- `getUserGraph()` - Get complete user graph
- `exportGraphSnapshot()` - Save graph versions
- `buildGraphFromFindings()` - Auto-populate from scan data

**Database Integration:**
- Automatic camelCase ↔ snake_case conversion
- Type-safe entity/edge operations
- Optimized queries with indexes
- Connection pooling support

### 4. **Interactive Graph Visualization** (`src/pages/Graph.tsx`) ✅

**Features:**
- **Cytoscape.js** powered interactive visualization
- Color-coded by entity type:
  - Email: Chart-1 color
  - Username: Chart-2 color  
  - Domain: Chart-3 color
  - Phone: Chart-4 color
  - IP: Chart-5 color

**Interactions:**
- Click nodes to view details in sidebar
- **Double-click to expand** connections dynamically
- Zoom/pan/fit controls
- Automatic layout with force-directed algorithm
- Node tooltips with provider info

**Export Options:**
- JSON export
- Snapshot versioning
- PDF report integration (future)

### 5. **Entity Search** (`src/pages/Search.tsx`) ✅

**Capabilities:**
- Auto-detects entity type from search term
- Full-text search across all entities
- Grouped results by type (email, username, domain, phone, IP)
- Risk/confidence score badges
- Direct navigation to graph visualization
- Real-time filtering

**Search Features:**
- Type-ahead suggestions
- Entity type detection badge
- Result counts per category
- Expandable entity cards
- "Explore Graph" quick action

### 6. **Score Badges Component** (`src/components/ScoreBadges.tsx`) ✅

**Visual Indicators:**
- **Risk Badge**: Color-coded by level with AlertTriangle icon
- **Confidence Badge**: TrendingUp icon with confidence level
- **Provider Count**: Shows unique provider count
- **Finding Count**: Total findings for entity
- Tooltips with detailed explanations

**Design:**
- Consistent color scheme matching risk levels
- Responsive layout
- Accessible with ARIA labels
- Integrates seamlessly with existing design system

### 7. **Scan Integration** ✅

**Automatic Graph Building:**
- `ResultsDetail.tsx` automatically builds graph from scan results
- Converts data sources → findings → graph nodes
- Converts social profiles → findings → graph nodes
- Creates edges between related entities
- Updates scores in real-time

**Entity Extraction:**
- Extracts emails, domains, IPs from evidence
- Links social profiles to usernames
- Creates "related_to" edges with confidence scores
- Tracks provider sources for each edge

### 8. **Navigation Integration** ✅

**Header Menu Updates:**
- Added "Entity Graph" to Tools dropdown
- Added "Search Entities" to Tools dropdown
- Maintained existing menu structure
- Mobile-responsive dropdown

**Dashboard Quick Actions:**
- "Entity Graph" button with BarChart3 icon
- "Search" button for entity discovery
- Prominent placement after "New Scan"

**Results Page:**
- "Explore Entity Graph" button in summary card
- Direct navigation with pre-filled search
- Contextual graph expansion

### 9. **Graph API Edge Function** (`supabase/functions/graph-api`) ✅

**Endpoints:**

```bash
# Get all nodes
GET /graph-api/nodes

# Get specific node with connections
GET /graph-api/nodes/:id

# Search entities
GET /graph-api/search?q=term

# Get full graph
GET /graph-api/graph

# Get snapshots
GET /graph-api/snapshots

# Create snapshot
POST /graph-api/snapshots
Body: { name, description }

# Delete node
DELETE /graph-api/nodes/:id
```

**Security:**
- JWT authentication required
- User-scoped data access
- RLS policy enforcement
- Rate limiting ready

---

## 📊 Performance Optimizations

### Database Indexes:
- `idx_entity_nodes_user_type` - Fast user+type queries
- `idx_entity_nodes_value` - Entity value lookups
- `idx_entity_edges_source` - Source node traversal
- `idx_entity_edges_target` - Target node traversal
- `idx_graph_snapshots_user` - User snapshot queries

### Query Optimization:
- Batch operations for node/edge creation
- Efficient graph traversal with proper JOINs
- Caching support via TTL fields
- Connection reuse

### UI Performance:
- Virtual scrolling for large entity lists
- Lazy loading of graph data
- Debounced search input
- Optimized Cytoscape rendering

---

## 🔒 Security Features

### Row-Level Security (RLS):
- ✅ All 3 tables have RLS enabled
- ✅ User-scoped SELECT/INSERT/UPDATE/DELETE
- ✅ Cascade deletes maintain integrity
- ✅ No cross-user data leakage

### Input Validation:
- Entity type detection with strict regex
- Query parameter sanitization
- API input validation
- XSS protection in search

### Authentication:
- JWT-based edge function auth
- Session-based UI access
- Automatic token refresh
- Secure logout

---

## 🚀 Usage Examples

### For Users:

**1. Run a Scan:**
```
1. Navigate to /scan
2. Enter email/username/phone
3. Wait for completion
4. Results automatically populate graph
```

**2. Explore Graph:**
```
1. Navigate to /graph
2. View all entities as interactive nodes
3. Double-click nodes to expand connections
4. Zoom/pan to explore relationships
```

**3. Search Entities:**
```
1. Navigate to /search
2. Enter any entity value
3. View grouped results with scores
4. Click "Expand Graph" to visualize
```

### For Developers (API):

**Get User Graph:**
```typescript
const { data } = await supabase.functions.invoke('graph-api', {
  body: { path: '/graph' }
});
```

**Search Entities:**
```typescript
const { data } = await supabase.functions.invoke('graph-api', {
  body: { path: '/search', query: { q: 'john@example.com' } }
});
```

**Create Snapshot:**
```typescript
const { data } = await supabase.functions.invoke('graph-api', {
  body: { 
    path: '/snapshots',
    method: 'POST',
    data: { name: 'My Snapshot', description: 'Before removal' }
  }
});
```

---

## 📈 Metrics & Analytics

### Tracking:
- Node creation timestamp
- Last updated timestamp
- Provider counts
- Finding counts
- Severity distributions

### Insights:
- Average risk score per entity type
- Most connected entities
- Provider coverage statistics
- Temporal patterns in findings
- Risk trend over time

---

## 🎨 Design System Integration

### Colors:
- Uses semantic tokens from `index.css`
- Consistent with existing FootprintIQ theme
- Dark mode support
- Accessible contrast ratios

### Components:
- Reuses shadcn/ui components
- Maintains consistent spacing/typography
- Responsive breakpoints
- Touch-friendly tap targets

---

## 🔮 Future Enhancements (Phase 2)

### Advanced Analytics:
- [ ] Temporal graph analysis
- [ ] Community detection algorithms
- [ ] Centrality scoring
- [ ] Path finding between entities

### Visualization:
- [ ] 3D graph mode
- [ ] Timeline view
- [ ] Heat maps
- [ ] Clustering visualization

### Export:
- [ ] GraphML format
- [ ] Neo4j export
- [ ] PDF reports with graphs
- [ ] CSV edge lists

### Intelligence:
- [ ] ML-based relationship prediction
- [ ] Anomaly detection
- [ ] Risk propagation modeling
- [ ] Entity disambiguation

---

## 🐛 Known Limitations

1. **Scale**: Optimized for <10,000 nodes per user
2. **Mobile**: Graph interactions better on desktop
3. **Real-time**: No live updates (manual refresh required)
4. **Export**: PDF export in development

---

## 📚 Technical Stack

- **Frontend**: React 18, TypeScript, TailwindCSS
- **Visualization**: Cytoscape.js
- **Backend**: Supabase (PostgreSQL)
- **Edge Functions**: Deno
- **State Management**: React hooks
- **Routing**: React Router v6

---

## ✨ Conclusion

The OSINT Correlation Engine transforms FootprintIQ from a simple scanner into a **comprehensive intelligence platform**. With automatic graph building, interactive visualization, and sophisticated scoring, users can now:

- 🔍 Discover hidden connections
- 📊 Quantify risk/confidence
- 🌐 Visualize digital footprints
- 🔄 Track changes over time
- 🚀 Scale analysis efficiently

**FootprintIQ is now a top-tier OSINT correlation engine.** 🎉
