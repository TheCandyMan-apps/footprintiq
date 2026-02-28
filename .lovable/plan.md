
# Fix: Eliminate Auth Wall on Free Scan Entry Points

## Problem
Users arriving via search (especially `/usernames`, the 2nd most visited page today) click "Run a Free Username Scan" and get routed to `/scan`, which **immediately redirects to `/auth`**. This creates the drop-off seen in session recordings.

The anonymous-friendly `/free-scan` page exists and works perfectly, but most CTAs across the site link to `/scan` instead.

## Root Cause
- `ScanPage.tsx` (line 31-33): `if (!session) { navigate("/auth?redirect=/scan"); return; }` -- hard auth gate
- `/usernames` page CTAs: `<Link to="/scan">Run a Free Username Scan</Link>` -- sends unauthenticated users into the auth wall
- 126 pages across the site have CTAs linking to `/scan` instead of `/free-scan`

## Solution

### 1. Update high-traffic landing page CTAs to route to `/free-scan`
Change the CTA buttons on `/usernames` (UsernamePage.tsx) from `/scan` to `/free-scan`:
- Line 155: Hero CTA button
- Line 343: Bottom CTA button

### 2. Make `/scan` itself redirect unauthenticated users to `/free-scan` instead of `/auth`
In `ScanPage.tsx`, change the auth check (line 31-33) from:
```
navigate("/auth?redirect=/scan")
```
to:
```
navigate("/free-scan")
```
And update the `onAuthStateChange` handler (line 71-72) similarly.

This way, any user hitting `/scan` without being logged in lands on the working anonymous scan page instead of hitting an auth wall. This preserves the existing flow for logged-in users while eliminating the drop-off.

### 3. Update other high-value SEO/content pages
Update CTAs on the most impactful content pages to link to `/free-scan` instead of `/scan`:
- `DigitalFootprintScan.tsx` (pillar page)
- `Lens.tsx`
- `RomanceScamWarningSigns.tsx`
- Other guide/blog pages with "Run a Free Scan" copy

Pages that say "Run a Free Scan" but link to an auth-gated page are misleading -- the copy and destination should match.

### 4. Preserve `/free-scan` query params on redirect
When redirecting from `/scan` to `/free-scan`, carry over any `q` and `type` search params so the user's input isn't lost.

## What This Does NOT Change
- Logged-in users still see the full `/scan` interface with all scan types
- Email, phone, and name scans on `/free-scan` still prompt signup (as designed)
- No backend changes needed
- No billing or tier logic changes

## Technical Details
- **Files modified**: ~8-10 files
- **Risk**: Low -- only changing navigation targets, no logic changes
- **Impact**: Directly addresses the #1 session recording finding (auth drop-off)
