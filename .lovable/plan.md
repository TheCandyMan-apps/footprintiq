

# Fix Missing h1 Tag on Auth Page

## Problem

Bing Webmaster Tools reports "The h1 tag is missing" on three pages. After code inspection:

- **`/` (Homepage)**: Already has an h1 in the Hero component. Likely a stale Bing crawl result.
- **`/dashboard`**: Already has an h1. Same as above.
- **`/auth`**: Genuinely missing an h1 tag. This is the real issue to fix.

## Solution

Add a visually appropriate h1 heading to the Auth page. The current structure has a logo and a paragraph — we will convert the implicit page title into a proper h1 element.

## File Change

**`src/pages/Auth.tsx`** (line ~288-289)

Current:
```html
<img src="/logo-dark.png" alt="FootprintIQ Logo" ... />
<p className="text-muted-foreground">Protect your privacy across the internet</p>
```

Updated:
```html
<img src="/logo-dark.png" alt="FootprintIQ Logo" ... />
<h1 className="text-xl font-semibold text-foreground mb-1">Sign in to FootprintIQ</h1>
<p className="text-muted-foreground">Protect your privacy across the internet</p>
```

This gives Bing (and all search engines) a clear, keyword-rich h1 tag without changing the visual design significantly.

## Post-Fix

After deployment, re-submit `/auth` via Bing Webmaster Tools URL Submission (or IndexNow) to clear the error. The `/` and `/dashboard` errors should resolve on the next Bing recrawl since they already contain valid h1 tags.

