
## Root Cause: Premature Scan Completion

The diagnosis is definitive. The scan for "jayquee" completed in **4 seconds** while n8n was still running for 2+ minutes. There are **two separate bugs** causing this.

---

### Bug 1: `finalize_scan_if_complete` references a non-existent column

The PostgreSQL trigger function that finalises scans contains this query:

```sql
SELECT scan_type, started_at  -- ❌ "started_at" does not exist on the scans table
  INTO v_scan_type, v_scan_started_at
FROM public.scans
WHERE id = NEW.scan_id;
```

The `scans` table only has `created_at`, not `started_at`. Because of this:

- `v_scan_started_at` is **always NULL**
- The 120-second grace period check evaluates as: `NULL IS NOT NULL` → **FALSE**
- The grace period is **never enforced**
- As soon as the first provider posts a `complete` event, the trigger bypasses the minimum wait and checks if `v_completed_count >= v_started_count`

### Bug 2: The `stage` value for `started` events doesn't match the trigger's check

The trigger queries for providers that have started:
```sql
AND stage = 'start'
```

But `n8n-scan-progress` inserts events with stage mapped as:
```ts
stage: status === 'started' ? 'start' : status === 'completed' ? 'complete' : status
```

For the "jayquee" scan, the scan events at the time of premature completion were **only `start` events** (Sherlock started, GoSearch started, Maigret started). There were **zero `complete` events**. Yet the scan was marked completed.

**The actual trigger path:**

Looking at the 4-second completion, no `complete` stage event existed at all when the scan finalised. Something **else** set `status = 'completed'` directly — likely a cached scan lookup or a race from `n8n-scan-progress` posting `status: 'completed'` on the **scan** (not a provider), which directly updates `scan_progress` with `status: completed`, and the frontend treats that as terminal.

The `ScanProgress` component watches `scan_progress.status` via realtime. When n8n sends `{ status: 'completed', provider: undefined }`, the progress record becomes `status: completed`, and the UI treats it as done.

---

### The Fix (Two Parts)

**Part 1 — Database migration: Fix `finalize_scan_if_complete`**

Replace `started_at` with `created_at` in the trigger (which is the actual column). This restores the 120-second minimum grace period so the trigger cannot finalise a scan before the n8n workflow has had time to even start its providers.

```sql
CREATE OR REPLACE FUNCTION public.finalize_scan_if_complete()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_scan_type text;
  v_scan_started_at timestamptz;
  v_expected_providers integer;
  v_started_count integer;
  v_completed_count integer;
  v_total_findings integer;
  v_min_wait_seconds integer := 120;
BEGIN
  IF NEW.stage IS DISTINCT FROM 'complete' THEN
    RETURN NEW;
  END IF;

  -- FIX: Use created_at (the actual column) instead of the non-existent started_at
  SELECT scan_type, created_at
    INTO v_scan_type, v_scan_started_at
  FROM public.scans WHERE id = NEW.scan_id;

  -- ... rest unchanged
```

**Part 2 — Guard `n8n-scan-progress` against scan-level "completed" broadcasting prematurely**

When n8n sends `status: 'completed'` without a `provider`, it means the **entire workflow** is done. But right now, `n8n-scan-progress` sets `scan_progress.status = 'completed'` immediately, which the frontend treats as terminal — even though provider `complete` events haven't arrived yet via the separate `n8n-scan-results` webhook.

The fix: only write `status: 'completed'` to `scan_progress` when it comes from the **`n8n-scan-results`** endpoint (which has the actual findings), not from intermediate `n8n-scan-progress` calls. For `n8n-scan-progress`, when `provider` is null/undefined and `status === 'completed'`, we should ignore or convert it to `running` (the results webhook will handle finalisation).

---

### Files to Change

| File | Change |
|---|---|
| `supabase/migrations/new_fix_finalize_trigger.sql` | Fix `started_at` → `created_at` in trigger |
| `supabase/functions/n8n-scan-progress/index.ts` | Guard: skip `completed` status write when no provider is specified (let results webhook handle it) |

---

### Technical Details

- The `scans` table columns confirmed: `created_at` ✅, `started_at` ❌ does not exist
- Database logs show repeated `ERROR: column "started_at" does not exist` — this has been silently failing for every scan
- The grace period has never worked since this trigger was deployed
- The fix is minimal and surgical — no schema changes needed, just correcting the column reference and adding a guard in the progress function
