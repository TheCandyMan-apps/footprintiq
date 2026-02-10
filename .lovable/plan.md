

# FootprintIQ Site Audit and SEO Review

## Overall Assessment

The site has a strong SEO foundation with good structured data, comprehensive sitemap, a well-built SEO component, and solid performance optimizations. However, there are several issues that need fixing, ranging from critical domain inconsistencies to moderate accessibility gaps.

---

## Critical Issues

### 1. Wrong Domain in 3 Pages (footprintiq.io vs footprintiq.app)

Three pages still reference the old `footprintiq.io` domain instead of the canonical `footprintiq.app`:
- **StayPrivateOnline.tsx** -- canonical URL, schema URLs, breadcrumb URLs all point to `.io`
- **WhichDataMatters.tsx** -- same issue across canonical, schema, and breadcrumbs
- **AIAnswersHub.tsx** -- same issue across canonical, schema, and breadcrumbs

This causes canonical confusion for search engines and splits link equity between two domains.

**Fix:** Replace all `footprintiq.io` references with `footprintiq.app` in these 3 files.

### 2. Fabricated AggregateRating in Schema

The default `SEO.tsx` schema includes a hardcoded `aggregateRating` with `"ratingValue": "4.8"` and `"ratingCount": "127"`. Unless this rating data comes from a real review platform, Google may penalize this as spam/fabricated structured data.

**Fix:** Remove the `aggregateRating` block from the default schema in `SEO.tsx`, or connect it to a real review source.

### 3. Duplicate Schema in index.html and React

`index.html` contains a hardcoded `SoftwareApplication` JSON-LD schema (lines 120-158), while `Index.tsx` also injects one via the `SEO` component. This creates duplicate structured data that confuses crawlers.

**Fix:** Remove the hardcoded JSON-LD from `index.html` since React Helmet manages it per-page.

---

## Moderate Issues

### 4. OG Image Inconsistency

- `index.html` uses a Google Storage URL for `og:image` (line 106): `https://storage.googleapis.com/gpt-engineer-file-uploads/...`
- The `SEO` component defaults to `https://footprintiq.app/og-image.jpg`
- These should be consistent and use the canonical domain.

**Fix:** Update `index.html` OG image to use `https://footprintiq.app/og-image.jpg` (or whichever is the correct branded image).

### 5. Missing OG Title/Description in index.html Defaults

`index.html` lines 161-164 set OG/Twitter title and description, but these will be overridden by Helmet on every page. Having them in `index.html` is fine as fallback, but they should match the canonical descriptions from `platformDescription.ts`.

**Fix:** Align `index.html` OG description with `PLATFORM_META_DESCRIPTION` constant.

### 6. Empty alt="" on ~80 Images

Around 80 instances of `alt=""` across components (favicons, avatars, profile images). While some are decorative (correctly using `alt=""`), many plugin icons, profile images, and avatars should have meaningful alt text for accessibility and image SEO.

**Fix:** Add contextual alt text where images convey meaning (e.g., `alt={plugin.title}` for plugin icons, `alt="User profile photo"` for avatars).

### 7. Sitemap lastmod Dates Are Stale

Most sitemap entries show `lastmod` of `2026-02-02`. If content hasn't actually changed on that date, search engines may distrust the freshness signals.

**Fix:** Consider generating the sitemap dynamically or updating dates when content actually changes.

---

## Minor / Informational Issues

### 8. Content-Security-Policy Inconsistencies Across Configs

Three different CSP headers exist across `_headers`, `netlify.toml`, and `vercel.json`, each with different allowed domains. This can cause issues depending on hosting platform.

**Fix:** Consolidate to a single CSP source of truth. Since the site appears hosted on a custom domain, pick one config file and ensure consistency.

### 9. manifest.json vs manifest.webmanifest

`index.html` references `/manifest.json` but `_headers` caches `/manifest.webmanifest`. The W3C recommends `.webmanifest` extension.

**Fix:** Rename to `manifest.webmanifest` and update the reference in `index.html`.

### 10. Plausible Script Loading

The Plausible analytics script URL (`pa-0A3M4Q9GLRmfRuk2LDGh6.js`) appears to be a custom/proxy URL. Ensure this is still valid and loading correctly.

### 11. No hreflang Tags

If the site targets a global English audience, adding `<link rel="alternate" hreflang="en" href="..." />` would clarify language targeting for search engines.

---

## What's Working Well

- Comprehensive `SEO` component with safe JSON-LD serialization
- Strong `noscript` fallback in `index.html` for JS-disabled crawlers
- `llms.txt` and robots.txt with AI bot directives
- Plausible + GA + Clarity analytics stack
- `content-visibility: auto` for LCP optimization
- IndexNow integration for rapid indexing
- Well-structured sitemap with 80+ URLs
- 404 tracking to database and analytics
- Canonical platform description constants for consistency
- PWA manifest with shortcuts

---

## Recommended Fix Priority

| Priority | Issue | Effort |
|----------|-------|--------|
| 1 | Fix `.io` to `.app` domain in 3 pages | Low |
| 2 | Remove fabricated `aggregateRating` | Low |
| 3 | Remove duplicate JSON-LD from `index.html` | Low |
| 4 | Fix OG image inconsistency in `index.html` | Low |
| 5 | Add meaningful alt text to key images | Medium |
| 6 | Align `index.html` fallback meta with constants | Low |
| 7 | CSP consolidation | Medium |

---

## Technical Details

### Files to Modify
- `src/pages/StayPrivateOnline.tsx` -- replace all `footprintiq.io` with `footprintiq.app`
- `src/pages/WhichDataMatters.tsx` -- replace all `footprintiq.io` with `footprintiq.app`
- `src/pages/AIAnswersHub.tsx` -- replace all `footprintiq.io` with `footprintiq.app`
- `src/components/SEO.tsx` -- remove `aggregateRating` block (lines 156-161)
- `index.html` -- remove hardcoded JSON-LD (lines 120-158), fix OG image URL (line 106), align meta descriptions

