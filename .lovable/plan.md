
# Fix: Two Bugs Blocking Telegram Results

## Root Cause Analysis

Two separate bugs are preventing Telegram data from being saved:

### Bug 1 — `n8n-scan-results` crashes on empty Telegram callbacks (CRITICAL)

**File**: `supabase/functions/n8n-scan-results/index.ts`

`findingsToInsert` is declared inside an `if (findings && findings.length > 0)` block (line 216), but then referenced **outside** that block at line 426 inside the Telegram source guard:

```typescript
findingsStored: findingsToInsert?.length || 0,  // ← ReferenceError when findings = []
```

When Telegram returns 0 findings (username not found, or fallback returns empty), the `if` block is skipped entirely, `findingsToInsert` is never defined, and the function crashes with:
```
ReferenceError: findingsToInsert is not defined
```

This means **every Telegram callback is crashing** the edge function, even when the worker succeeds and returns an empty array.

### Bug 2 — Worker routing 404 (the `{"detail":"Not Found"}` response)

The worker returned `{"detail":"Not Found"}` — this is a **FastAPI-style JSON 404**, not a Telethon "user not found" error. This means the Cloud Run worker is **not recognising the `/telegram/username` route** correctly. Most likely cause: the worker code was updated locally but the new Python file was compiled to a different binary or the route registration is failing at startup.

The `server.py` file uses Python's standard `http.server` (not FastAPI), so `{"detail":"Not Found"}` is unexpected. This suggests the deployed container image may still be running the old version, or a startup error is preventing the new route from loading — and Cloud Run is serving its own default 404.

## Fix Plan

### Fix 1 — `n8n-scan-results` edge function (immediate, high impact)

Hoist `findingsToInsert` declaration to the outer scope so it is always defined before the Telegram source guard checks it:

```typescript
// Before (line 214-309):
if (findings && Array.isArray(findings) && findings.length > 0) {
  const findingsToInsert = findings.filter(...).map(...);  // scoped only here
  // ... insert logic
}

// After:
let findingsToInsert: Array<...> = [];  // always defined
if (findings && Array.isArray(findings) && findings.length > 0) {
  findingsToInsert = findings.filter(...).map(...);
  // ... insert logic
}
```

This ensures the Telegram source guard at line 426 can safely reference `findingsToInsert.length` even when findings is empty.

### Fix 2 — Worker startup verification

The `{"detail":"Not Found"}` from Cloud Run strongly indicates the new container is not running the updated `server.py`. The fix is to check if the new image was actually built and pushed — the previous deploy used `--source` which builds a new image, but if the `server.py` write did not make it into the filesystem before deployment, the old image is still running.

Action: Force a fresh Cloud Run redeploy with an explicit build trigger to ensure the new `server.py` (with `ResolveUsername` fallback) is included in the container image.

Since Lovable can only edit edge functions and source code (not trigger Cloud Run deployments), the plan is:

1. Fix the edge function bug (deployable automatically)
2. Instruct you to trigger a fresh Cloud Run rebuild

## Files to Change

### `supabase/functions/n8n-scan-results/index.ts`

- Hoist `findingsToInsert` to outer scope (fix the `ReferenceError`)
- Change `const findingsToInsert = ...` → `let findingsToInsert: typeof ... = []` declared before the `if` block
- Remove the optional chaining `?.` on line 426 since it will always be defined

### Technical Details

- The `findingsToInsert` variable is used in 3 places: the insert call, the Brave enrichment, and the Telegram source guard response — all need access to it regardless of whether findings is empty.
- The Telegram source guard is specifically designed to handle the case of 0 findings (legitimate "no account found") — this crash is preventing that graceful path from working.

## After Deployment

Once the edge function fix is deployed:
1. Run a fresh scan for `Jammmy10`
2. If Telegram still returns 404 from the worker, you will need to rebuild the Cloud Run image:
   ```bash
   gcloud run deploy telegram-worker \
     --source workers/telegram-worker/ \
     --region europe-west2 \
     --no-allow-unauthenticated
   ```
   This forces a fresh Docker build from the current source, picking up the `ResolveUsername` fallback code.
