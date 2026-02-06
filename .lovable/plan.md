

# Brave Search API Integration for FootprintIQ

## Overview

Integrate the Brave Search API as a new enrichment provider to complement existing intelligence sources (Perplexity, Google CSE) and enhance LENS confidence scoring through independent web-index corroboration.

---

## Rationale

### Why Brave Search?

| Factor | Benefit for FootprintIQ |
|--------|------------------------|
| **Independent Index** | 30B+ page index separate from Google/Bing — reduces single-source bias |
| **Cost-Effective** | 2,000 free queries/month, then $0.003–$0.009/query (vs Perplexity at higher per-query cost) |
| **Privacy-First** | Aligns with FootprintIQ's ethical OSINT positioning |
| **Rich Metadata** | Returns timestamps, descriptions, language, freshness — valuable for confidence signals |
| **News API** | Separate endpoint for news mentions (useful for entity research) |

### Integration Points

1. **Profile Enrichment** — Verify if discovered usernames/profiles are indexed by major search
2. **LENS Confidence Boost** — Web-indexed profiles get +10-15% confidence bump
3. **False Positive Reduction** — Filter template/placeholder pages that aren't web-indexed
4. **Citation Sources** — Provide users with additional context links

---

## Technical Implementation

### 1. New Edge Function: `brave-search`

Create `supabase/functions/brave-search/index.ts`:

```text
┌─────────────────────────────────────────────────────────┐
│                    brave-search                         │
├─────────────────────────────────────────────────────────┤
│ Endpoints:                                              │
│   • Web Search (primary)                                │
│   • News Search (entity research)                       │
│                                                         │
│ Features:                                               │
│   • Rate limiting (10 req/sec)                          │
│   • Response caching (24h TTL)                          │
│   • Freshness filtering (week/month/year)               │
│   • Country/language targeting                          │
│   • Safe search controls                                │
│                                                         │
│ Output:                                                 │
│   UFM-normalized findings with:                         │
│   - kind: "web_index.hit" | "web_index.miss"            │
│   - confidence based on result quality                  │
│   - citations array                                     │
└─────────────────────────────────────────────────────────┘
```

### 2. Provider Registry Updates

Add to `supabase/functions/_shared/providerRegistry.ts`:
- `brave_search` — Web search enrichment
- `brave_news` — News mentions (entity/domain research)

Add to `src/providers/registry.meta.ts`:
```typescript
{
  id: 'brave_search',
  title: 'Brave Web Index',
  category: 'enrichment',
  supports: ['username', 'email', 'domain', 'phone'],
  cost: 'low',
  ttlMs: 24 * 3600e3,
  description: 'Independent web index verification',
}
```

### 3. Provider-Proxy Integration

Add `callBraveSearch()` function to `provider-proxy/index.ts`:

```typescript
async function callBraveSearch(target: string, type: string): Promise<any> {
  const BRAVE_API_KEY = Deno.env.get('BRAVE_SEARCH_API_KEY');
  // Build query based on type (username, email, domain)
  // Call https://api.search.brave.com/res/v1/web/search
  // Normalize to UFM findings
}
```

### 4. LENS Integration

Update `useLensAnalysis.ts` to include Brave corroboration signal:

```typescript
// New scoring factor
if (braveIndexed) {
  score += 12;
  reasons.push('Profile verified in independent web index');
}
```

Add new metadata field to ForensicModal confidence breakdown:
- "Web index corroboration" — shows Brave verification status

### 5. Scan Pipeline Integration

**Option A: Automatic Enrichment (Recommended)**
- Add to email/username scan flows as a low-cost verification step
- Run after primary providers return results
- Only for profiles marked as "found"

**Option B: On-Demand Research**
- Add "Verify with Web Search" button on profile cards
- Similar to existing "LENS Verify" button
- Deducts 1 credit per lookup

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/brave-search/index.ts` | Create | New edge function for Brave API calls |
| `supabase/functions/_shared/providerRegistry.ts` | Update | Add `brave_search` and `brave_news` |
| `supabase/functions/provider-proxy/index.ts` | Update | Add `callBraveSearch()` handler |
| `src/providers/registry.meta.ts` | Update | Add provider metadata for UI |
| `src/hooks/useLensAnalysis.ts` | Update | Add web-index corroboration scoring |
| `src/components/forensic/ForensicModal.tsx` | Update | Add corroboration signal to breakdown |
| `supabase/config.toml` | Update | Add function config |

---

## API Key Setup

**Secret Required:** `BRAVE_SEARCH_API_KEY`

- Obtain from: https://api.search.brave.com/
- Free tier: 2,000 queries/month
- Pro tier: Pay-as-you-go ($0.003–$0.009 per query)

---

## Cost Analysis

| Use Case | Queries/Scan | Est. Monthly Cost (10k scans) |
|----------|--------------|-------------------------------|
| Auto-enrich found profiles | ~3-5 per scan | ~$100-150 |
| On-demand only | ~0.5 per scan | ~$15-25 |
| LENS verification | 1 per verify | Usage-based |

**Recommendation:** Start with on-demand to control costs, then evaluate auto-enrich based on user value.

---

## Tier Gating

| Tier | Access |
|------|--------|
| Free | None (or 3 lookups/month as preview) |
| Pro | Unlimited within scan budget |
| Business | Priority + news search access |

---

## Success Metrics

1. **Confidence Improvement** — Track LENS scores before/after Brave integration
2. **False Positive Reduction** — Measure template page filtering rate
3. **User Engagement** — Monitor usage of web verification feature
4. **Cost Efficiency** — Compare Brave vs Perplexity cost per enrichment

---

## Implementation Order

1. **Phase 1** — Edge function + provider-proxy integration
2. **Phase 2** — LENS scoring integration
3. **Phase 3** — UI components (verify button, ForensicModal update)
4. **Phase 4** — Auto-enrich in scan pipeline (optional)

