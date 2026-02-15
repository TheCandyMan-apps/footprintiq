

## Keyword Gap Analysis and Content Plan

### Current Ranking Summary
FootprintIQ currently ranks for 14 out of 76 tracked keywords. The strongest positions are:
- "reverse username search" (#5, 210 vol)
- "find social media accounts by username" (#5, 20 vol)
- "username search tool" (#5, 10 vol)
- "most accurate username search" (#5)
- "reverse username lookup" (#7)

All ranking keywords land on `/usernames` or `/reverse-username-search`. The rest of the keyword set has zero visibility.

### Gap Analysis: 7 New Pages Needed

After cross-referencing every unranked keyword against existing pages and routes, these are the content gaps that have no dedicated landing page:

---

### Page 1: `/best-osint-tools` -- OSINT Tools Guide
**Targets (combined ~1,850 monthly volume):**
- "osint tools" (1,000 vol, KD 50)
- "open source intelligence tools" (480 vol, KD 48)
- "best osint tools" (140 vol, KD 43)
- "free osint tools" (40 vol)
- "osint investigation tools" (20 vol)
- "ai osint tools" (20 vol)
- "ethical osint tools" (no vol data)
- "osint tools for cybersecurity" (no vol data)
- "privacy friendly osint tool" (no vol data)
- "best username osint tool" (no vol data)
- "digital footprint analysis tool" (no vol data)

**Content:** Authoritative guide covering categories of OSINT tools (username, email, breach, dark web, domain), how FootprintIQ automates and ethically wraps these tools, comparison table of manual vs. automated approaches. FAQ schema covering "What are OSINT tools?", "Are OSINT tools legal?", "Best free OSINT tools in 2026?".

---

### Page 2: `/comparisons/pimeyes-alternative` -- PimEyes Alternative
**Targets (480 vol, KD 20 -- low difficulty, high opportunity):**
- "pimeyes alternative" (480 vol, KD 20)

**Content:** Comparison page using `ComparisonPageLayout`. PimEyes = facial recognition search (invasive, paid). FootprintIQ = ethical username/email/breach intelligence (no facial recognition, privacy-first). Differentiation table, use cases, ethical positioning. FAQ schema.

---

### Page 3: `/how-to-find-someone-online` -- How to Find Someone Online
**Targets (combined ~510 vol):**
- "how to find someone online" (320 vol, KD 28)
- "find social media accounts" (170 vol, KD 37) -- partial overlap with existing page but that page isn't ranking
- "how to find all accounts linked to an email" (20 vol)

**Content:** Educational guide framed as risk awareness and self-audit. Covers what methods exist (username search, email lookup, breach checks, social media enumeration), ethical boundaries, how FootprintIQ helps you understand your own exposure. Links to `/usernames`, `/email-breach-check`, `/scan`.

---

### Page 4: `/osint-techniques` -- OSINT Techniques Guide
**Targets (combined ~150+ vol):**
- "osint techniques" (110 vol, KD 30)
- "osint examples" (20 vol, KD 35)
- "osint for beginners" (20 vol)

**Content:** Authority page explaining OSINT methodology: passive vs active reconnaissance, username enumeration, email verification, breach correlation, false-positive filtering. Real examples of how FootprintIQ applies these techniques ethically. Links to `/what-is-osint` and `/best-osint-tools`.

---

### Page 5: `/check-username-across-platforms` -- Check Username Across Platforms
**Targets (combined ~60+ vol, mid-KD):**
- "check username across platforms" (no vol data, KD 48)
- "check username availability across sites" (no vol data, KD 47)
- "username osint" (40 vol, KD 37)
- "osint username search" (20 vol, KD 48)
- "social media profile search" (110 vol, KD 54)

**Content:** Action-oriented landing page targeting users who want to check a specific username across multiple sites. Direct CTA to `/username-search`. Explains the process, what gets checked, accuracy notes, and ethical usage. Differentiates from "availability checkers" (which check if a name is taken for registration) vs. "exposure checkers" (which find where you already appear).

---

### Page 6: `/comparisons/sherlock-vs-footprintiq` -- Sherlock and Maigret Comparison
**Targets (combined ~100+ vol):**
- "sherlock username search" (40 vol, KD 25)
- "maigret osint" (20 vol, KD 40)
- "whatsmyname alternative" (20 vol, KD 24)

**Content:** Comparison page using `ComparisonPageLayout`. CLI tools (Sherlock, Maigret, WhatsMyName) vs. FootprintIQ's automated, GUI-based, false-positive-filtered approach. Comparison table: installation, accuracy, false-positive handling, breach correlation, reporting. FAQ schema.

---

### Page 7: `/credential-reuse-risk` -- Credential Reuse and Stuffing Risk
**Targets (combined ~60+ vol):**
- "credential reuse risk" (no vol data, KD 26)
- "credential stuffing risk" (no vol data, KD 40)
- "username reuse risk" (no vol data, KD 35)
- "why username reuse is dangerous" (no vol data, KD 19)
- "account discovery attack" (no vol data, KD 17)

**Content:** Risk education page explaining how credential reuse enables account takeover and identity mapping. Distinct from the existing `/username-reuse-risk` page (which focuses on username reuse across platforms) by focusing on credential stuffing attacks, password reuse, and automated attack methods. Links to `/username-reuse-risk` and `/scan`. FAQ schema.

---

### Additional Keyword Coverage via Existing Pages (Minor Tweaks)

These keywords already have pages but are not ranking -- small SEO metadata improvements:

| Keyword | Volume | Existing Page | Fix |
|---|---|---|---|
| "digital footprint check" | 720 | `/digital-footprint-check` | Already aliased to DigitalFootprintScanner -- may need content enrichment |
| "data broker removal" | 110 | `/data-broker-removal-guide` | Exists, just not ranking yet |
| "how to check if your information is online" | -- | `/is-my-data-exposed` | Exists |
| "people search alternative" | -- | `/comparisons/people-search-vs-footprintiq` | Exists |
| "seon alternative" | -- | No page -- low priority, very niche |
| "username.ai alternative" | -- | No page -- low priority, very niche |

---

### Technical Implementation Plan

For each new page:
1. Create the page component following existing patterns (Header, Footer, Helmet SEO, JSON-LD schemas: FAQPage, BreadcrumbList, WebPage/Article)
2. Follow the Master Structure Rules (1,500-2,000 words, H1-H3 hierarchy, internal links to `/ethical-osint-charter`, `/how-it-works`, `/pricing`, `/scan`)
3. Include `AboutFootprintIQBlock` footer reinforcement
4. Include `RelatedToolsGrid` for internal linking
5. Register lazy-loaded routes in `App.tsx`
6. Add to `sitemap.xml`
7. Add to `index.html` fallback route map with unique titles and descriptions
8. Add to `indexnow.ts` for discovery
9. Add to `ComparisonPageLayout` sidebar navigation (for comparison pages)

### Priority Order
1. `/best-osint-tools` -- highest combined volume (1,850+)
2. `/how-to-find-someone-online` -- 510 vol, low KD
3. `/comparisons/pimeyes-alternative` -- 480 vol, very low KD (20)
4. `/osint-techniques` -- authority builder
5. `/check-username-across-platforms` -- action-oriented
6. `/comparisons/sherlock-vs-footprintiq` -- competitor cluster
7. `/credential-reuse-risk` -- risk cluster

I will implement these in priority order. Due to the volume of pages, I will batch them into 2-3 groups.

