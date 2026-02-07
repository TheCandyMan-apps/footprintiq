

# Fix Clarity-Identified UX Issues

## Summary

Four issues were flagged by Clarity session recordings. Two require immediate fixes, one is working correctly, and one confirms healthy usage.

---

## Issue 1: `/usernames` Landing Page Flow
**Status: No action needed**

The `/usernames` page correctly links users to `/scan` via the "Run a Free Username Scan" CTA. This is working as designed after the unified scan interface consolidation.

---

## Issue 2: 404s on `/new-scan` and `/scan-history` (CRITICAL)

**Root cause:** The `MobileCTABar` component (visible on all mobile pages) has two buttons that navigate to `/new-scan` and `/scan-history`, but neither route exists in the router.

**Impact from real 404 data:**
- `/new-scan` -- 1,035+ hits (sources: Google, Reddit, direct, dashboard)
- `/scan-history` -- 456+ hits (sources: direct, Google, dashboard, Stripe checkout returns)

**Fix:**
1. Update `MobileCTABar.tsx` to navigate to correct existing routes:
   - "New Scan" button: `/new-scan` --> `/scan`
   - "History" button: `/scan-history` --> `/dashboard` (the dashboard contains scan history)
2. Add redirect routes in `App.tsx` as safety nets for anyone who bookmarked these URLs:
   - `/new-scan` --> redirect to `/scan`
   - `/scan-history` --> redirect to `/dashboard`

---

## Issue 3: Extended Multi-Step Scanning Flows
**Status: No action needed**

This confirms healthy product usage -- users are completing full scan flows, exploring results, and re-scanning. No friction detected.

---

## Issue 4: Authentication Loop / Drop-off (IMPORTANT)

**Root cause:** The auth page has no "redirect back" mechanism. The flow breaks like this:

```text
User on /usernames --> clicks "Run a Free Username Scan" --> /scan
  --> ScanPage checks auth --> no session --> redirect to /auth
    --> user signs in/up --> hardcoded redirect to /dashboard
      --> user has to manually find scan again (many don't)
```

**Fix:**
1. Update `ScanPage.tsx` to pass the intended destination when redirecting to auth:
   - Change `navigate("/auth")` to `navigate("/auth?redirect=/scan")`
2. Update `Auth.tsx` to read the `redirect` query parameter and use it after successful login:
   - Read `redirect` from `URLSearchParams`
   - After successful auth, navigate to the redirect URL instead of always `/dashboard`
   - Validate the redirect URL starts with `/` to prevent open redirect attacks
3. Apply the same pattern to other pages that redirect to `/auth` (e.g., Dashboard, Monitoring) so the user always returns to where they intended to go.

---

## Files Modified

1. **`src/components/MobileCTABar.tsx`** -- Fix navigation targets from `/new-scan` to `/scan` and `/scan-history` to `/dashboard`
2. **`src/App.tsx`** -- Add two redirect routes for `/new-scan` and `/scan-history` as safety nets
3. **`src/pages/Auth.tsx`** -- Read `redirect` query param and use it after successful login instead of hardcoded `/dashboard`
4. **`src/pages/ScanPage.tsx`** -- Pass `?redirect=/scan` when redirecting unauthenticated users to `/auth`

---

## Technical Details

### MobileCTABar fix
```typescript
// Before
onClick={() => navigate('/new-scan')}
onClick={() => navigate('/scan-history'))

// After
onClick={() => navigate('/scan'))
onClick={() => navigate('/dashboard'))
```

### Auth redirect-back logic
```typescript
// In Auth.tsx useEffect and sign-in handler
const searchParams = new URLSearchParams(window.location.search);
const redirectTo = searchParams.get('redirect');

// Validate: must start with "/" and not "//" (prevents open redirect)
const safeRedirect = redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
  ? redirectTo
  : '/dashboard';

// Use safeRedirect instead of hardcoded '/dashboard'
navigate(safeRedirect);
```

### ScanPage auth redirect
```typescript
// Before
navigate("/auth");

// After
navigate("/auth?redirect=/scan");
```

### Safety-net redirect routes in App.tsx
```tsx
<Route path="/new-scan" element={<Navigate to="/scan" replace />} />
<Route path="/scan-history" element={<Navigate to="/dashboard" replace />} />
```

