

# SEMrush Issues Fix Plan

## Root Cause Analysis

All 5 SEMrush issues trace back to **one fundamental problem**: SEMrush crawled with **"JS rendering: Disabled"** (visible in the audit header). Since FootprintIQ is a React SPA, without JavaScript, every page returns the same `index.html` shell. This means:

- Every page shows the **same canonical URL** (`https://footprintiq.app/`) -- causing the "90 incorrect pages" error
- Every page shows the **same title** ("FootprintIQ -- Ethical Digital Footprint Intelligence") -- causing the "97 duplicate H1/title" warning
- Every page only renders the **104-word noscript fallback** -- causing "low word count" and "low text-HTML ratio" warnings
- The **unminified JS** warning is Google's `gtag.js` file loaded via Cloudflare gateway -- this is external and **cannot be fixed**

## What We Can Fix (3 of 5 issues)

### 1. Fix "90 Non-canonical URLs" (Error -- highest priority)

**The problem:** The pre-JS fallback script in `index.html` only maps ~15 routes with proper canonical/title/description. All other pages (90 of them) fall through to the default canonical of `/`.

**The fix:** Expand the `R` route map in the inline `<script>` block (line 128-174 of `index.html`) to include **every public route** in the sitemap. Each entry sets the correct `<title>`, `<meta description>`, and `<link rel="canonical">` before React loads.

This single change fixes all three fixable issues at once:
- Canonical URL becomes correct per-page
- Title becomes unique per-page (fixing duplicate H1/title)
- The `og:title` and `twitter:title` also become unique

### 2. Fix "97 Duplicate H1 and Title Tags" (Warning)

Solved by the same route-map expansion above. Each page will get its own unique `<title>` tag set by the pre-JS script.

### 3. Partially mitigate "Low Word Count" and "Low Text-HTML Ratio" (Warnings)

These cannot be fully fixed without server-side rendering, which is not possible with this architecture. However, we can **expand the `<noscript>` block** to include more descriptive content about the platform's pages and capabilities, increasing word count from 104 to ~300+.

### 4. "Unminified JavaScript and CSS" (Warning) -- NOT FIXABLE

All 97 instances point to `https://footprintiq.app/google-tag/gtag/js?id=G-7B32ERNHXN` -- this is Google's Analytics script proxied through Cloudflare. We do not control its minification. This can be safely ignored or excluded in SEMrush.

---

## Technical Implementation

### File: `index.html` (lines 128-174)

Expand the inline `R` route map from ~15 entries to ~90+ entries covering every URL in `sitemap.xml`. Each entry follows the existing format:

```javascript
'/path': { t: 'Unique Page Title | FootprintIQ', d: 'Unique meta description.', og: 'article' }
```

Routes to add include all blog posts, educational pages, AI hub pages, guides, comparison pages, research pages, privacy/removal guides, mainstream entry pages, persona landing pages, and SEO tool pages.

### File: `index.html` (noscript block, lines 183-217)

Expand the noscript fallback content with additional sections covering key platform capabilities, tool categories, and content clusters to increase word count for non-JS crawlers.

### Estimated scope
- ~90 new route entries in the pre-JS script
- Expanded noscript content block
- Single file change (`index.html`)

