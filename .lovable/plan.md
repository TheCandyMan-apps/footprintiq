✅ COMPLETED

Goal
- Stop “scan.failed / Edge Function returned a non‑2xx status code” from appearing for scans that are actually expected “blocked” outcomes (free-tier restrictions / email verification).
- Prevent free-tier phone/email scans from starting (and then completing_empty) when the user isn’t eligible.
- Make the UI show clear, actionable guidance (Verify email / Upgrade) instead of silently failing or hanging.

What I found (from your screenshot + database reads)
1) The recent failures in Activity Logs are email scans on FREE workspaces.
   - Workspaces in the screenshot are plan=free, subscription_tier=free.
   - Those scan IDs do not exist in the scans table → meaning the frontend generated a “preScanId”, the edge function returned non‑2xx before creating a scan record, and the frontend logged scan.failed anyway.

2) scan-orchestrate already returns structured 403 JSON for free-tier blocks:
   - email_verification_required (403)
   - free_any_scan_exhausted (403)
   It also logs scan.blocked server-side.
   But the frontend (AdvancedScan) currently treats these as generic failures and logs scan.failed.

3) Phone scans are also showing completed_empty on FREE accounts.
   - scan_events show providers were tier_restricted (Abstract/IPQS/Numverify require Pro).
   - This isn’t a crash; it’s a plan restriction presented as “empty results”, which is confusing UX.

Root causes
A) Frontend error parsing is too weak
- supabase-js “non‑2xx” function errors often don’t set error.status in the way your classifyError() expects.
- So your classifyError() returns “unknown”, and AdvancedScan logs scan.failed even for a structured 403 block.

B) ScanProgress (the /scan flow) doesn’t handle trigger errors properly
- ScanProgress calls n8n-scan-trigger and:
  - Logs invokeResult.error, but does not set failed state or show the user why.
  - Can leave users “stuck” or navigate to results for a scan that never existed.

C) n8n-scan-trigger does not enforce the same free-tier gating rules as scan-orchestrate
- So free users can start phone/email scans that they shouldn’t be able to run (unless they have the “free any-scan credit” and verified email).
- This leads to completed_empty outcomes and inconsistent behavior vs AdvancedScan.

Plan (implementation)
1) Add robust function-error parsing on the frontend (shared utility)
- Create a helper that extracts:
  - HTTP status (from error.context?.status or similar)
  - JSON body (from error.context?.body, or parse error.message if it contains JSON)
  - error code (code/error fields) and message
- Update src/lib/supabaseRetry.ts classifyError() to use this extracted status + code.
  - Ensure 401/403 blocks are recognized even when status isn’t in error.status.

2) Fix AdvancedScan behavior for “blocked” outcomes (not “failed”)
- In src/pages/AdvancedScan.tsx:
  - Expand “tier block” detection to include:
    - email_verification_required
    - free_any_scan_exhausted
    - scan_blocked_by_tier / no_providers_available_for_tier
  - When blocked:
    - Do NOT ActivityLogger.scanFailed(...)
    - Show a toast with the right CTA:
      - email_verification_required → “Verify email” + action to resend verification (reuse existing useEmailVerification hook pattern used elsewhere)
      - free_any_scan_exhausted → “Upgrade required” + navigate to billing/settings
    - Close the progress modal cleanly.

3) Fix /scan flow (ScanProgress) to stop silent failures and hanging
- In src/components/ScanProgress.tsx:
  - If n8n-scan-trigger returns invokeResult.error:
    - Parse the structured error (same helper as above)
    - If blocked → show Verify/Upgrade CTA and end the scan flow (set failed, stop polling)
    - If real failure → show a “Scan failed” message and log scan.failed with useful metadata (include parsed status/code).
  - Also handle the case “scan record was never created”:
    - If n8n-scan-trigger fails, do not continue polling a non-existent scanId.

4) Enforce consistent gating in backend trigger (n8n-scan-trigger)
- Update supabase/functions/n8n-scan-trigger/index.ts to mirror scan-orchestrate’s free-tier rules for non-username scans:
  - Fetch workspace plan/tier from DB (service role or user client appropriately)
  - Check email_confirmed_at
  - Check free_any_scan_credits (if your schema supports it; scan-orchestrate expects it on workspace)
  - If blocked:
    - Return 403 with the same structured payload shape:
      { error, code, message, scanType }
    - Log scan.blocked (server-side) for audit visibility
    - Crucially: do NOT create a scan row or scan_progress row.

5) (Optional but recommended) Harden internal-call detection in phone-intel
- Your current change uses strict equality:
  authHeader === `Bearer ${serviceRoleKey}`
- Make it tolerant of formatting differences:
  - Accept “Bearer <token>” case-insensitively, trim whitespace, compare only token values.
- This prevents reintroducing the original 401 issue due to minor header formatting differences.

How we’ll verify (end-to-end)
1) Free user, unverified email:
   - Attempt email scan (AdvancedScan + /scan flow)
   - Expected: blocked message “Verify your email” + resend CTA
   - Expected: NO scan.failed log; scan.blocked should be logged.

2) Free user, verified email, free_any_scan_credits = 0:
   - Attempt email/phone scan
   - Expected: “Upgrade required” flow; no scan created; no completed_empty.

3) Pro user:
   - Email + Phone scans should create scans and proceed normally.

4) Admin Activity Logs:
   - Confirm fewer scan.failed entries with “non‑2xx”, replaced by scan.blocked with clear metadata.

Files involved
Frontend
- src/lib/supabaseRetry.ts (improve error parsing/classification)
- src/pages/AdvancedScan.tsx (treat blocked outcomes correctly; stop logging scan.failed for them)
- src/components/ScanProgress.tsx (handle trigger errors; stop hanging/polling non-existent scanId)

Backend (Lovable Cloud functions)
- supabase/functions/n8n-scan-trigger/index.ts (add tier/email verification gating consistent with scan-orchestrate)
- supabase/functions/phone-intel/index.ts (optional: make internal auth detection more robust)

Notes / risks
- This plan doesn’t weaken security; it improves consistency and prevents users from initiating scans they can’t run.
- If free_any_scan_credits isn’t actually present in workspaces in your current DB schema, we’ll adapt the gating to “free users cannot run phone/email” (or whatever rule you prefer), but we should keep the error codes stable so the UI can reliably handle them.
