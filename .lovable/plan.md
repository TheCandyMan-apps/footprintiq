
# SEMrush Recommendations Implementation Plan

## Overview

This plan addresses all SEMrush audit findings and competitor intelligence to improve FootprintIQ's organic search performance.

---

## Issues Identified

### 1. Technical Issues

| Issue | Severity | Root Cause |
|-------|----------|------------|
| **Incorrect pages in sitemap.xml** | High | New pages (`/for/crypto`, `/for/job-seekers`, `/for/developers`, `/for/executives`, `/share/:scanId`) are in routes but missing from sitemap |
| **Low word count** | Medium | Niche landing pages (~300-400 words) fall below 600-word SEO threshold |
| **Low text-to-HTML ratio** | Medium | Component-heavy pages with minimal prose content |

### 2. Keyword Opportunities (Not Currently Targeted)

| Keyword | Volume | Current Coverage |
|---------|--------|------------------|
| "free user name search" | 70 | Partial (blog only) |
| "search username" | 480 | Partial (/usernames targets "username search") |
| "free social media username search" | 720 | Good (/usernames page targets this) |

### 3. Competitor Intelligence

| Competitor | Insight |
|------------|---------|
| **user-searcher.com** | `/tiktok-viewer` page gaining organic traffic — indicates demand for platform-specific tools |
| **Backlink gaps** | Missing links from yahoo.com, medium.com, gitbook.io |

---

## Implementation Plan

### Phase 1: Fix Sitemap (Critical)

**File:** `public/sitemap.xml`

Add missing URLs (insert after AI Hub section, before Legal):

```xml
<!-- Niche Landing Pages -->
<url>
  <loc>https://footprintiq.app/for/crypto</loc>
  <lastmod>2026-02-06</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://footprintiq.app/for/job-seekers</loc>
  <lastmod>2026-02-06</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://footprintiq.app/for/developers</loc>
  <lastmod>2026-02-06</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://footprintiq.app/for/executives</loc>
  <lastmod>2026-02-06</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

---

### Phase 2: Expand Niche Landing Page Content (Word Count Fix)

Each `/for/` page currently has ~300 words. Expand to 600+ words by adding:

**New sections to add to each niche page:**

1. **"Why This Matters" section** — 150-200 words explaining audience-specific risks with statistics
2. **"How It Works" section** — 100-150 words on the scan process
3. **Extended FAQ** — Add 2-3 more questions (currently 3, expand to 5-6)
4. **"What You'll Learn" section** — Bullet list with narrative context

**Example expansion for `/for/crypto`:**

Current word count: ~380 words
Target word count: 700+ words

Add:
- Statistics about SIM swap attacks (cite FBI IC3 data)
- Step-by-step "How to use FootprintIQ for crypto security"
- 3 additional FAQs about wallet security, exchange exposure, phone number risks
- "Real-world scenarios" section

---

### Phase 3: Keyword Optimization

#### 3a. Create dedicated "Search Username" landing page

**New file:** `src/pages/SearchUsername.tsx`

Target keywords:
- "search username" (480/mo)
- "free user name search" (70/mo)
- "username search free" (variation)

Structure:
- H1: "Search Any Username — Free Username Lookup Tool"
- H2: "How to Search for a Username Online"
- H2: "What Our Free Username Search Reveals"
- H2: "Why Search Usernames?"
- FAQ section with Schema.org markup
- HeroInputField component for direct scanning

Route: `/search-username` (add to App.tsx)

#### 3b. Update existing UsernamePage.tsx

Enhance secondary keyword targeting:
- Add more natural mentions of "search username" variation
- Include "free user name search" in FAQ section
- Add internal links to new `/search-username` page

---

### Phase 4: Platform-Specific Tool Pages (Competitor Response)

Create platform-specific landing pages to capture traffic like user-searcher.com's TikTok viewer:

**New pages:**

| Route | Target Keywords |
|-------|-----------------|
| `/tiktok-username-search` | "tiktok username search", "find tiktok profile" |
| `/instagram-username-search` | "instagram username search", "find instagram user" |
| `/twitter-username-search` | "twitter username search", "find twitter user" |

**Page template structure:**
- Platform-specific hero with icon
- Explanation of what the scan reveals for that platform
- Platform-specific privacy tips
- FAQ section
- HeroInputField pre-configured for username type

**Note:** These pages use the same scanning infrastructure but position for platform-specific search intent.

---

### Phase 5: Improve Text-to-HTML Ratio

Add prose content blocks to component-heavy pages:

**Pages to enhance:**
- `/scan` — Add 200-word intro paragraph above the form
- `/pricing` — Add 150-word comparison narrative section
- `/features` — Expand feature descriptions from bullet points to short paragraphs

---

## File Changes Summary

### New Files (4)

| File | Purpose |
|------|---------|
| `src/pages/SearchUsername.tsx` | Dedicated "search username" landing page |
| `src/pages/TikTokUsernameSearch.tsx` | Platform-specific TikTok page |
| `src/pages/InstagramUsernameSearch.tsx` | Platform-specific Instagram page |
| `src/pages/TwitterUsernameSearch.tsx` | Platform-specific Twitter/X page |

### Modified Files (6)

| File | Changes |
|------|---------|
| `public/sitemap.xml` | Add 4 niche landing pages + 4 platform pages |
| `src/pages/for/Crypto.tsx` | Expand content to 700+ words |
| `src/pages/for/JobSeekers.tsx` | Expand content to 700+ words |
| `src/pages/for/Developers.tsx` | Expand content to 700+ words |
| `src/pages/for/Executives.tsx` | Expand content to 700+ words |
| `src/App.tsx` | Add 4 new platform-specific routes |

---

## SEO Metadata Standards

All new pages will include:

```typescript
<SEO
  title="[Primary Keyword] — [Secondary Benefit] | FootprintIQ"
  description="[150-160 char with primary + secondary keywords and CTA]"
  canonical="https://footprintiq.app/[route]"
  schema={{ /* FAQPage + BreadcrumbList */ }}
/>
```

---

## Internal Linking Strategy

Add cross-links between:
- `/usernames` ↔ `/search-username` ↔ `/tiktok-username-search` etc.
- `/for/crypto` → `/phone-number-privacy` (SIM swap context)
- `/for/job-seekers` → `/username-exposure` (employer research context)
- `/for/developers` → `/guides/how-username-search-tools-work` (technical context)

---

## IndexNow Notification

After deployment, trigger IndexNow for new URLs via existing `src/lib/indexnow.ts` infrastructure.

---

## Expected Outcomes

| Metric | Target |
|--------|--------|
| Sitemap errors | 0 |
| Pages with <600 words | Reduced by 80% |
| "search username" ranking | Top 20 within 90 days |
| Platform-specific traffic | +500 sessions/month from TikTok/Instagram terms |

---

## Implementation Order

1. **Immediate** — Fix sitemap (5 min)
2. **Day 1** — Create SearchUsername.tsx and add route
3. **Day 1-2** — Expand all 4 niche landing pages
4. **Day 2-3** — Create platform-specific pages (TikTok, Instagram, Twitter)
5. **Day 3** — Update internal links and trigger IndexNow
