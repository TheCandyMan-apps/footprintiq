
# SEO Optimization Plan: SEMRUSH Audit Resolution (Feb 2026)

## Executive Summary

The SEMRUSH audit identified **145 issues** primarily stemming from one root cause: **non-JavaScript crawlers see identical content on every page** because FootprintIQ is a single-page application (SPA). This causes duplicate titles, descriptions, H1 tags, and low content scores across all crawled pages.

---

## Root Cause Analysis

| Issue Type | Count | Root Cause |
|------------|-------|------------|
| Duplicate title tag | 12 | All pages render same `index.html` shell with JS-disabled crawlers |
| Duplicate content | 12 | Same `<noscript>` fallback appears on every route |
| Duplicate meta descriptions | 12 | Same fallback meta for all pages |
| Missing h1 | 12 | H1 is JS-rendered, not in static HTML |
| Low text to HTML ratio | 12 | Heavy JS/CSS bundle, minimal static text |
| Low word count | 12 | `<noscript>` content ~200 words, same on all pages |
| Orphaned sitemap pages | 35 | Sitemap contains URLs that don't exist as routes |
| llms.txt formatting issues | 1 | Minor specification compliance fixes needed |

---

## Solution Overview

Since implementing full server-side rendering (SSR) or static site generation would require a significant architectural change, we'll use a **hybrid approach**:

1. **Route-specific meta injection in index.html** using Cloudflare Workers (edge-side rendering)
2. **Update sitemap.xml** to remove orphaned URLs and only include valid routes
3. **Fix llms.txt** formatting to comply with specification
4. **Add a Contact page** (referenced in sitemap but doesn't exist)

---

## Phase 1: Fix Sitemap Orphans (Immediate)

Remove URLs from `sitemap.xml` that don't have corresponding routes:

**URLs to remove (no matching route):**
- `/contact` → Either create page OR remove from sitemap

**URLs to add (missing from sitemap but have routes):**
- `/username-search` (alias for `/usernames`)
- `/email-exposure` (alias for `/email-breach-check`)
- `/reduce-digital-footprint`
- `/how-identity-theft-starts`
- `/digital-privacy-glossary`
- `/is-my-data-exposed`
- `/old-data-breaches`
- `/which-data-matters`
- `/stay-private-online`
- `/about-footprintiq`
- `/ethical-osint-for-individuals`
- Many blog posts (like `/blog/free-username-search`, `/blog/username-reuse`, etc.)

### Files Modified
- `public/sitemap.xml`

---

## Phase 2: Fix llms.txt Formatting

The current `llms.txt` follows the correct structure but may have minor issues SEMRUSH flags. We'll ensure:
- Proper markdown heading levels
- Valid URL formatting
- No trailing whitespace issues

### Files Modified
- `public/llms.txt`

---

## Phase 3: Create Contact Page

Since `/contact` is in the sitemap but the route doesn't exist, we'll create a simple contact page that redirects to the Support page.

### Files Created
- `src/pages/Contact.tsx`

### Files Modified
- `src/App.tsx` (add route)

---

## Phase 4: Enhanced Noscript Fallbacks (Content Strategy)

For the duplicate content issues, we have two options:

### Option A: Route-based Noscript (Requires Build-time Generation)
Create per-page static HTML snippets that get injected at build time. This would require:
- A pre-build script that generates static HTML for each route
- Modifications to the build process

### Option B: Cloudflare Worker Edge Rendering (Recommended)
Use Cloudflare Workers to inject route-specific meta tags and content for non-JS crawlers. This is handled at the CDN level and doesn't require changes to the React app.

**For now, we'll implement what's feasible within the codebase:**

Enhance the existing `<noscript>` block to mention that content varies by page, and ensure each page's React Helmet meta tags are as unique as possible.

---

## Implementation Details

### Phase 1: Sitemap Update

```xml
<!-- public/sitemap.xml - Updated structure -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Pages -->
  <url><loc>https://footprintiq.app/</loc><priority>1.0</priority></url>
  <url><loc>https://footprintiq.app/scan</loc><priority>0.9</priority></url>
  <url><loc>https://footprintiq.app/pricing</loc><priority>0.9</priority></url>
  
  <!-- SEO Pillar Pages -->
  <url><loc>https://footprintiq.app/digital-footprint-scanner</loc><priority>0.9</priority></url>
  <url><loc>https://footprintiq.app/usernames</loc><priority>0.8</priority></url>
  <url><loc>https://footprintiq.app/email-breach-check</loc><priority>0.8</priority></url>
  
  <!-- Educational Content -->
  <url><loc>https://footprintiq.app/what-is-a-digital-footprint</loc><priority>0.7</priority></url>
  <url><loc>https://footprintiq.app/username-exposure</loc><priority>0.7</priority></url>
  
  <!-- Remove: /contact (no route), /assistant (internal) -->
  <!-- Add all valid blog posts -->
</urlset>
```

### Phase 2: Contact Page Redirect

```tsx
// src/pages/Contact.tsx
import { Navigate } from "react-router-dom";
export default function Contact() {
  return <Navigate to="/support" replace />;
}
```

### Phase 3: llms.txt Cleanup

Ensure proper spacing and formatting per the llms.txt specification.

---

## Expected Outcomes

After implementation:
- **Orphaned sitemap pages**: 35 → 0 (fixed)
- **llms.txt issues**: 1 → 0 (fixed)
- **Duplicate content issues**: Still present (requires SSR/pre-rendering)

### Long-term Recommendation

For complete resolution of duplicate content issues, consider:
1. **Implementing Vite SSG** (Static Site Generation) using `vite-ssg` plugin
2. **Using a pre-rendering service** like Prerender.io
3. **Cloudflare Workers** for edge-side meta injection

These require architectural changes beyond simple code edits.

---

## Files to Modify

| File | Changes |
|------|---------|
| `public/sitemap.xml` | Remove orphaned URLs, add missing valid routes, update lastmod dates |
| `public/llms.txt` | Minor formatting fixes for compliance |
| `src/pages/Contact.tsx` | **NEW** - Redirect to /support |
| `src/App.tsx` | Add Contact route |
