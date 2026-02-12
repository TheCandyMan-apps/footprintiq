

## SEO and AI Visibility Optimisation + IndexNow Submission

### What needs to happen

Both `/privacy-centre` and `/remove-mylife-profile` are well-structured but missing a few items for full SEO and AI crawler coverage.

### Changes

**1. Add OG image and site name meta tags to both pages**
- Add `og:image` pointing to `https://footprintiq.app/og-image.jpg` (the standard OG image)
- Add `og:site_name: FootprintIQ` to both pages

**2. Add both URLs to the IndexNow URL list**
- Add `/privacy-centre` and `/remove-mylife-profile` to the `INDEXNOW_URLS` array in `src/lib/indexnow.ts`

**3. Update `llms.txt` for AI visibility**
- Add a new "Privacy & Removal" section to `public/llms.txt` with links to both pages, so AI crawlers (GPTBot, Claude-Web, etc.) can discover them

**4. Trigger IndexNow submission**
- Call the IndexNow edge function to notify Bing, Yandex, Naver, and Seznam about the new pages

### Files to modify
- `src/pages/RemoveMyLifeProfile.tsx` -- add `og:image`, `og:site_name`
- `src/pages/PrivacyCentrePage.tsx` -- add `og:image`, `og:site_name`
- `src/lib/indexnow.ts` -- add both new URLs to the array
- `public/llms.txt` -- add Privacy and Removal section

### Technical detail
- No routing changes
- No scan logic changes
- Static content only
- IndexNow will be triggered via the existing edge function after deployment

