

# Fix Profile Photos: Cache Avatars to Prevent Expiry

## The Problem

Profile photos from Predicta Search ARE being saved to the database (the schema fix worked), but the URLs are temporary CDN links from Instagram, TikTok, etc. that expire within hours. When a user revisits scan results, the images fail to load and show initials instead.

- TikTok CDN URLs have `x-expires` parameters
- Instagram CDN URLs have `oe=` expiry tokens
- Most social platforms block direct hotlinking after a short window

## The Fix

Cache avatar images into the project's existing `scan-images` Storage bucket during scan time. Store the permanent Storage URL alongside the original CDN URL.

```text
Scan Flow (current):
  Predicta API --> CDN URL --> meta.avatar --> (expires) --> broken image

Scan Flow (fixed):
  Predicta API --> CDN URL --> download image --> upload to Storage --> meta.avatar_cached
                                                                    --> permanent URL --> image displays
```

## Changes

### 1. Update `n8n-scan-trigger` edge function -- avatar caching

After receiving Predicta results, before inserting findings:

- For each profile with a `pfp_image` or `avatar_url`, fetch the image from the CDN
- Upload it to the `scan-images` bucket at path: `avatars/{scan_id}/{platform}.jpg`
- Store the public Storage URL in `meta.avatar_cached`
- Keep the original CDN URL in `meta.avatar` as a fallback
- Use a 3-second timeout per image to avoid blocking the scan
- Skip failed downloads gracefully (original URL still available as fallback)

### 2. Make `scan-images` bucket public

The `scan-images` bucket is currently private. To serve avatar thumbnails without auth tokens, it needs to be public (these are publicly-available profile photos already scraped from public profiles).

### 3. Update `AccountRow.tsx` -- prefer cached URL

Change the profile image resolution chain:

**Before:**
```
meta.avatar_url || meta.avatar || meta.profile_image || meta.image || meta.pfp_image
```

**After:**
```
meta.avatar_cached || meta.avatar_url || meta.avatar || meta.profile_image || meta.image || meta.pfp_image
```

### 4. Update `useRealtimeResults.ts` -- pass avatar from social_profiles

When normalizing `social_profiles` into `ScanResultRow`, ensure the `avatar_url` field is also mapped into `meta` so the `AccountRow` fallback chain can find it:

```
meta: { ...profile.metadata, avatar_url: profile.avatar_url }
```

## What This Fixes

- Profile photos will persist permanently after scan completion
- Revisiting old scan results will still show photos
- Photos display correctly even days/weeks later
- No dependency on third-party CDN availability

## What Stays the Same

- The Confidence Breakdown "Profile image: Confirmed" logic remains correct (it checks if a URL was provided at scan time)
- Scans without Predicta (free tier, or non-username scans) will still show initials -- this is expected
- The original CDN URL is preserved as a fallback

## Files Modified

1. `supabase/functions/n8n-scan-trigger/index.ts` -- add avatar download and Storage upload logic
2. `src/components/scan/results-tabs/accounts/AccountRow.tsx` -- prefer `avatar_cached` in fallback chain
3. `src/hooks/useRealtimeResults.ts` -- merge `avatar_url` into meta for social_profiles
4. Database migration -- make `scan-images` bucket public

