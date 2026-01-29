
# Comprehensive Platform Improvement Plan

## Executive Summary
This plan addresses 7 critical areas identified during the platform audit, prioritized by severity and user impact. The implementation is broken into 4 phases spanning immediate fixes to medium-term improvements.

---

## Phase 1: Critical Fixes (Immediate)

### 1.1 Clean Up Stuck Scans
**Problem**: 7 scans are stuck in `pending` or `running` status for up to 7 days
**Impact**: Poor UX, data inconsistency, potential user confusion

**Solution**:
- Update `scan-reconcile` edge function to also catch `pending` scans (currently only handles `running`)
- Run immediate cleanup SQL to mark orphaned scans as `failed_timeout`
- Schedule the reconcile function via pg_cron (every 10 minutes)

**Changes Required**:
| File | Change |
|------|--------|
| `supabase/functions/scan-reconcile/index.ts` | Add `pending` status to stuck scan query |
| Database | Add pg_cron schedule for scan-reconcile function |
| Database | One-time cleanup SQL for existing stuck scans |

### 1.2 Fix Security Definer View (ERROR)
**Problem**: Database linter detected a Security Definer View which bypasses RLS
**Impact**: Potential data exposure, security vulnerability

**Solution**:
- Identify the problematic view via database query
- Convert to SECURITY INVOKER or remove if unnecessary

### 1.3 Enable Leaked Password Protection
**Problem**: Auth configuration has leaked password protection disabled
**Impact**: Users can sign up with compromised passwords

**Solution**:
- Enable leaked password protection in Supabase Auth settings via configure-auth tool

---

## Phase 2: Technical Debt Cleanup (Short-term)

### 2.1 Remove Debug Console Statements
**Problem**: Temporary verification logs in production code
**Impact**: Console clutter, unprofessional, potential info leakage

**Files to Clean**:
| File | Line | Log to Remove |
|------|------|---------------|
| `src/components/scan/AdvancedResultsPage.tsx` | 51 | `console.log('ADVANCED RESULTS PAGE')` |
| `src/components/scan/FreeResultsPage.tsx` | 131 | `console.log('FREE RESULTS PAGE')` |

### 2.2 Deprecate Legacy `scan_jobs` Table References
**Problem**: 18 files still reference the legacy `scan_jobs` table as fallback
**Impact**: Code complexity, maintenance burden, potential confusion

**Strategy**:
1. Create migration plan to verify no active scans use `scan_jobs`
2. Remove fallback queries from key components
3. Eventually drop the `scan_jobs` table

**Priority Files for Cleanup**:
- `src/components/scan/AdvancedResultsPage.tsx` (lines 243-251)
- `src/components/scan/FreeResultsPage.tsx` (lines 326-336)
- `src/components/dashboard/ScansInProgressCard.tsx`
- `src/components/ArchivedScans.tsx`

### 2.3 Deprecate Legacy `maigret_results` Table
**Problem**: Simple pipeline still referenced in 6 files
**Impact**: Dual-pipeline complexity

**Files Using `maigret_results`**:
- `src/utils/scanPipeline.ts`
- `src/components/maigret/SimpleResultsViewer.tsx`
- `src/components/maigret/MaigretDebugPanel.tsx`
- `src/components/maigret/SimpleScanForm.tsx`

---

## Phase 3: Security Hardening (Short-term)

### 3.1 Audit RLS Policies
**Problem**: 49 policies using `USING (true)` or `WITH CHECK (true)`
**Current Status**: Some are intentionally permissive for service_role

**Action Plan**:
1. Export full list of affected policies
2. Categorize into:
   - **Valid**: Service role only, webhook handlers, system tables
   - **Needs Fix**: User-facing tables with overly broad access
3. Create migration to tighten policies where needed

**High-Priority Tables to Review**:
- `analyst_metrics` - ALL with `USING (true)`
- `api_keys` - ALL with `USING (true)` 
- `audit_activity` - Multiple `USING (true)` policies
- `background_jobs` - ALL with `USING (true)`
- `billing_customers` - ALL with `USING (true)`

### 3.2 Add Missing RLS Policies
**Problem**: 2 tables have RLS enabled but no policies defined
**Impact**: Complete data lockout or exposure depending on default

**Solution**:
- Identify tables via query
- Add appropriate policies based on data sensitivity

### 3.3 Fix Function Search Path
**Problem**: Some functions don't have `search_path` set
**Impact**: Potential security vulnerability via search path injection

**Solution**:
- Identify functions via linter details
- Add `SET search_path = 'public'` to each function

---

## Phase 4: Operational Improvements (Medium-term)

### 4.1 Implement Scheduled Scan Reconciliation
**Problem**: Stuck scans require manual cleanup
**Solution**: Schedule `scan-reconcile` via pg_cron every 10 minutes

```sql
-- Add to pg_cron schedule
SELECT cron.schedule(
  'scan-reconcile-job',
  '*/10 * * * *',  -- Every 10 minutes
  $$SELECT net.http_post(
    url:='https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/scan-reconcile',
    headers:='{"Authorization": "Bearer <anon_key>"}'::jsonb
  )$$
);
```

### 4.2 Fix JSON Parse Errors from n8n
**Problem**: Postgres logs show `invalid input syntax for type json` errors
**Impact**: Data integrity issues, potential scan failures

**Solution**:
- Add defensive JSON parsing in webhook handlers
- Add validation before database insert
- Log malformed payloads for debugging

### 4.3 Consolidate Edge Functions
**Current State**: 200+ edge functions in `supabase/functions`
**Recommendation**: Audit for unused functions and consolidate where possible

---

## Implementation Order

```text
Week 1 (Critical)
├── 1.1 Clean up stuck scans (immediate SQL + code fix)
├── 1.2 Fix Security Definer View
└── 1.3 Enable leaked password protection

Week 2 (Technical Debt)
├── 2.1 Remove debug console statements
├── 2.2 Document scan_jobs deprecation path
└── 4.1 Schedule scan-reconcile cron

Week 3 (Security)
├── 3.1 Audit and tighten RLS policies
├── 3.2 Add missing RLS policies
└── 3.3 Fix function search paths

Week 4+ (Operational)
├── 2.2-2.3 Remove legacy table references
├── 4.2 Fix n8n JSON parsing
└── 4.3 Edge function consolidation audit
```

---

## Verification Checklist

After implementation, verify:

- [ ] All stuck scans marked as `failed_timeout`
- [ ] `scan-reconcile` cron job running every 10 minutes
- [ ] No `console.log('ADVANCED RESULTS PAGE')` in production
- [ ] No `console.log('FREE RESULTS PAGE')` in production
- [ ] Security Definer View resolved
- [ ] Leaked password protection enabled
- [ ] Mind Map renders on `/graph` with cross-scan data
- [ ] Breaches tab correctly shows Pastebin/DeHashed findings
- [ ] `ScanProgress` modal closes on `completed_empty` status

---

## Files to Modify (Summary)

| Priority | File | Changes |
|----------|------|---------|
| P0 | `supabase/functions/scan-reconcile/index.ts` | Add pending status handling |
| P0 | Database | Stuck scan cleanup + cron job |
| P1 | `src/components/scan/AdvancedResultsPage.tsx` | Remove debug log, remove scan_jobs fallback |
| P1 | `src/components/scan/FreeResultsPage.tsx` | Remove debug log, remove scan_jobs fallback |
| P2 | Multiple RLS policies | Tighten USING(true) policies |
| P2 | Database functions | Add SET search_path |
| P3 | 18 files with scan_jobs | Phased deprecation |
| P3 | 6 files with maigret_results | Phased deprecation |
