
# Add AI Answers Pages to Sitemap and Trigger IndexNow

## Summary

Three of the requested URLs (`/ai-answers-hub`, `/ai`, `/usernames`) are already in both the sitemap and the IndexNow list. The five individual `/ai-answers/*` pages are missing from both. This plan adds them and updates the `lastmod` dates on the pages that recently changed.

## Changes

### 1. `public/sitemap.xml`

Add 5 new `<url>` entries inside the existing "AI Hub" section (after the `/ai-answers-hub` entry at line 469), with today's date and monthly change frequency:

- `/ai-answers/what-is-a-username-osint-scan` (priority 0.6)
- `/ai-answers/why-username-reuse-is-risky` (priority 0.6)
- `/ai-answers/are-username-search-tools-accurate` (priority 0.6)
- `/ai-answers/is-username-osint-legal` (priority 0.6)
- `/ai-answers/ethical-osint-tools` (priority 0.6)

Also update `lastmod` to `2026-02-08` on these three existing entries (since they were recently modified with new internal links):

- `/usernames` (line 38)
- `/ai-answers-hub` (line 467)
- `/ai` (line 431) -- only if it links to the new group; will update date regardless for consistency

### 2. `src/lib/indexnow.ts`

Add the 5 AI Answers page paths to the `INDEXNOW_URLS` array, grouped under the existing "AI Hub" comment block (after `/ai-answers-hub` on line 70):

```
"/ai-answers/what-is-a-username-osint-scan",
"/ai-answers/why-username-reuse-is-risky",
"/ai-answers/are-username-search-tools-accurate",
"/ai-answers/is-username-osint-legal",
"/ai-answers/ethical-osint-tools",
```

### 3. Trigger IndexNow submission

After deployment, the existing `submitToIndexNow()` function can be called to notify Bing, Yandex, Naver, and Seznam about all updated and new URLs. No code change needed for this -- it will use the updated `INDEXNOW_URLS` array automatically.

## What is NOT changed

- No new files created
- No UI changes
- No route changes
- `/ai`, `/usernames`, and `/ai-answers-hub` are already in both files and only need date updates in the sitemap
