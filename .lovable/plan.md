

## Fix: Duplicate Meta Descriptions (Bing Webmaster Tools)

### Problem
Bing flagged 10 pages sharing identical meta descriptions. The root causes are:

1. **`/auth` page has no SEO component** -- it falls back to the `index.html` default meta description, creating a duplicate with `/scan`.
2. **`index.html` default description** ("Scan your digital footprint across 500+ platforms...") is too similar to the `/scan` page description and does not match the official `PLATFORM_META_DESCRIPTION` constant. Since this is a single-page app, Bing may read the `index.html` meta before React Helmet overrides it, causing several pages to appear as duplicates.

### Changes

**1. Update `index.html` default meta description (line 63)**
- Replace the current default with the `PLATFORM_META_DESCRIPTION` value: *"FootprintIQ is an ethical digital footprint intelligence platform using OSINT techniques to help you understand online exposure -- without surveillance or invasive data collection."*
- Also update the OG and Twitter description tags (lines 123-124) to stay consistent.

**2. Add `<SEO>` component to `src/pages/Auth.tsx`**
- Import the `SEO` component and add it with a unique title and description:
  - Title: "Sign In or Create Account | FootprintIQ"
  - Description: "Sign in or create your FootprintIQ account to scan your digital footprint, monitor data breaches, and manage your online privacy."
  - Canonical: "https://footprintiq.app/auth"

### Result
Each of the 10 flagged URLs will have a distinct meta description, and the `index.html` fallback will use the official platform description -- preventing future SPA crawling duplicates.

### Technical Details

Files modified:
- `index.html` -- update `<meta name="description">`, `og:description`, and `twitter:description` to `PLATFORM_META_DESCRIPTION` value
- `src/pages/Auth.tsx` -- import `SEO` and render it with unique title/description/canonical
