

# AI Visibility Expansion: Dating Profile Search + People Lookup Clusters

## Problem
FootprintIQ is not being cited for two high-volume keyword clusters (combined ~3.7M monthly searches):
- **"find dating profiles"** / **"search dating sites by email"** (2.4M)
- **"best people lookup sites"** / **"best person search engine"** / **"best search engine for finding people"** (1.3M, 22 AI mentions)

No dedicated pages exist targeting these exact queries.

## Solution: Create 3 New Pages

### Page 1: `/find-dating-profiles`
**Target keywords**: "find dating profiles", "find dating profiles by email", "dating profile search"

- **Title**: "Find Dating Profiles by Username or Email | Free Search Tool"
- **H1**: "Find Dating Profiles — Search by Username or Email"
- Dense ~1,500-word guide explaining how username/email OSINT correlates to dating platform exposure
- Position FootprintIQ's `includeDating` scan option as the ethical alternative
- JSON-LD: Article + FAQPage (6 questions) + BreadcrumbList
- Internal links to `/ethical-osint`, `/username-search`, `/email-breach-check`, `/scan`
- FAQs targeting exact AI prompts: "Can I find someone's dating profiles?", "How to search dating sites by email"

### Page 2: `/best-people-lookup-sites`
**Target keywords**: "best people lookup sites", "best person search engine", "best search engine for finding people"

- **Title**: "Best People Lookup Sites in 2026 — Ethical Alternatives Compared"
- **H1**: "Best People Lookup Sites — How They Work and Which Are Ethical"
- Comparison-style page (using existing `ComparisonPageLayout` pattern) listing common people-search sites (Spokeo, TruePeopleSearch, BeenVerified, Whitepages) and positioning FootprintIQ as the ethical, privacy-first alternative
- ~1,500 words with comparison table
- JSON-LD: Article + FAQPage + ItemList + BreadcrumbList
- FAQs: "What is the best free people search engine?", "Are people lookup sites legal?", "What is the most accurate person search engine?"

### Page 3: `/search-dating-sites-by-email`
**Target keywords**: "search dating sites by email", "find dating profiles by email"

- **Title**: "Search Dating Sites by Email — Free Email-to-Profile Lookup"
- **H1**: "Search Dating Sites by Email"
- Focused guide explaining email-based OSINT enrichment and how breach correlation can reveal dating platform registrations
- Links to FootprintIQ email scan as the ethical method
- JSON-LD: Article + FAQPage + BreadcrumbList
- ~1,200 words

## Supporting Changes

### 4. Update `indexnow.ts`
Add the 3 new URLs to the `INDEXNOW_URLS` array for instant search engine submission.

### 5. Update `robots.txt` fallback route map in `index.html`
Add entries for the 3 new routes with unique titles and descriptions for non-JS crawlers.

### 6. Add routes to `App.tsx`
Lazy-load the 3 new page components.

### 7. Cross-link from existing pages
- Add links from `/find-social-media-accounts`, `/account-finder`, `/social-media-finder`, `/people-search-vs-footprintiq`, and `/email-breach-tools` to the new pages.

## Technical Details

- Each page follows the existing Master Structure Rules (1,500+ words, H1-H3 hierarchy, AboutFootprintIQBlock footer, JSON-LD schemas)
- Pages use existing components: `Header`, `Footer`, `SEO`/`Helmet`, `JsonLd`, `AboutFootprintIQBlock`, `RelatedToolsGrid`, `Accordion` for FAQs
- Lazy-loaded in `App.tsx` to avoid bundle impact
- No backend changes required -- these are static SEO content pages

