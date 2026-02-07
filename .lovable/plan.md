

# Display Profile Photos from Scan Results

## Problem

Profile photos are already being scraped and stored in the database, but they are not displayed due to a **key name mismatch** between backend storage and frontend rendering.

| Provider | Stores avatar as | Frontend checks |
|----------|-----------------|-----------------|
| Predicta Search | `meta.avatar` | `meta.avatar_url`, `meta.profile_image`, `meta.image` |
| osint-scan (GitHub/Reddit) | `meta.avatar_url` | Same as above (works) |

5 of 6 Predicta profile findings already contain real avatar URLs (Facebook, MapMyFitness, PicsArt, etc.) that are simply not being rendered.

## Solution

Add `meta.avatar` to the image lookup chain in all components that display profile thumbnails. This is a one-line fix in each file.

## Files to Change

### 1. `src/components/scan/results-tabs/accounts/AccountRow.tsx` (line 284)

The main results table row. Change the profileImage extraction to include `meta.avatar`:

```
// Before
const profileImage = meta.avatar_url || meta.profile_image || meta.image;

// After
const profileImage = meta.avatar_url || meta.avatar || meta.profile_image || meta.image || meta.pfp_image;
```

### 2. `src/components/scan/results-tabs/accounts/FocusedEntityCard.tsx` (line 16)

The focused entity sidebar card. Same fix:

```
// Before
const profileImage = meta.avatar_url || meta.profile_image || meta.image;

// After
const profileImage = meta.avatar_url || meta.avatar || meta.profile_image || meta.image || meta.pfp_image;
```

### 3. `src/components/scan/results-tabs/connections/ConnectionsInspector.tsx` (line 101)

The connections inspector panel. Same fix:

```
// Before
const profileImage = meta.avatar_url || meta.profile_image || meta.image;

// After
const profileImage = meta.avatar_url || meta.avatar || meta.profile_image || meta.image || meta.pfp_image;
```

## Why This Works

- Predicta stores the URL in `meta.avatar` (from `profile.pfp_image`)
- osint-scan stores it in `meta.avatar_url` (from GitHub/Reddit APIs)
- Adding `meta.pfp_image` as a final fallback catches any edge cases where the raw Predicta field name leaks through via the `...profile` spread
- No backend changes needed -- the data is already there

## What You Will See

After this fix, scan results from Predicta will show profile thumbnails (Instagram, TikTok, Facebook, Gravatar, etc.) directly in the Accounts table, just like the reference screenshots from Predicta Search and SherlocEye show.
