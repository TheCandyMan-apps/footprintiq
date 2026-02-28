

## Fix: Friendly Rate Limit Error Handling on Auth Pages

### Problem
When Supabase Auth returns an "email rate limit exceeded" error (e.g., from rapid signups or verification resends), the raw technical error message is shown directly to the user. This is confusing and unhelpful.

### Solution
Add error message mapping in `Auth.tsx` to catch rate-limit and other common auth errors, replacing them with friendly, actionable messages.

### Changes

**File: `src/pages/Auth.tsx`** (lines 246-252, the signup catch block)

Replace the raw `error.message` toast with a helper that detects common auth error patterns:

- `over_email_send_rate` / "rate limit" --> "Too many attempts. Please wait a minute before trying again."
- `user_already_exists` --> "An account with this email already exists. Try signing in instead."
- `weak_password` --> "Please choose a stronger password."
- Default fallback --> "Something went wrong. Please try again."

Also apply the same pattern to the **sign-in** catch block (around line 120-130) for consistency.

### Technical Details

A small helper function (e.g., `getFriendlyAuthError`) will be added at the top of the file that maps known Supabase auth error strings to user-friendly messages. Both the sign-up and sign-in error handlers will use it. No new dependencies required.

