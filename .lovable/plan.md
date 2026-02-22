

## Fix: Only Log `scan.failed` After All Retries Are Exhausted

### Problem
The `ScanProgress.tsx` component logs a `scan.failed` activity entry on the first transient failure (e.g. cold-start timeout) even though the scan may succeed on a subsequent attempt or via polling. This creates misleading "Scan Failed" entries in the admin activity logs.

### Root Cause
- `ScanProgress.tsx` uses `withTimeout()` (a single attempt with a 15-second timeout) to call `n8n-scan-trigger`, not `invokeWithRetry()`.
- When that single attempt fails transiently, it immediately logs `scan.failed` via `ActivityLogger.scanFailed()`.
- Meanwhile, `AdvancedScan.tsx` correctly uses `invokeWithRetry()` which retries before reporting failure -- but both paths can fire for the same scan, resulting in a false `scan.failed` entry even when the retry succeeds.

### Changes

**1. `src/components/ScanProgress.tsx`** -- Replace `withTimeout()` with `invokeWithRetry()` for the `n8n-scan-trigger` call, so retries happen before any failure is logged. This aligns it with how `AdvancedScan.tsx` already works.

- Import `invokeWithRetry` instead of (or in addition to) `withTimeout`
- Wrap the `n8n-scan-trigger` invocation with `invokeWithRetry()` using a short retry config (2 attempts, 15s timeout)
- Keep the existing error classification and block-detection logic after retries are exhausted
- Only call `ActivityLogger.scanFailed()` after `invokeWithRetry` returns a final error

**2. `src/pages/AdvancedScan.tsx`** -- No changes needed. It already uses `invokeWithRetry()` and only logs `scan.failed` after all retries are exhausted.

### Technical Details

```text
Before:
  ScanProgress -> withTimeout(invoke, 15s) -> fail on 1st timeout -> log scan.failed
  (scan may still succeed via polling)

After:
  ScanProgress -> invokeWithRetry(invoke, {maxAttempts: 2, timeout: 15s}) -> fail only after retries -> log scan.failed
  (transient failures are silently retried)
```

### Impact
- Eliminates false `scan.failed` activity log entries caused by transient cold-start timeouts
- Admin activity logs will only show genuine failures
- No user-facing behaviour change -- scans that currently recover will continue to do so, just without the misleading log entry

