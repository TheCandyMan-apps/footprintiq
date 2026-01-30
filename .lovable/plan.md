

# Fix: n8n Progress Updates Not Working

## Summary
Progress updates from the n8n workflow to the `n8n-scan-progress` edge function are failing due to a database constraint violation. The edge function has a bug where it doesn't preserve the existing `status` field during updates, and the n8n Progress nodes may not be sending a `status` value.

## Root Cause Analysis

### Database Constraint
```
null value in column "status" of relation "scan_progress" violates not-null constraint
```

### Edge Function Logic Bug
The current code in `n8n-scan-progress/index.ts` lines 98-102:
```typescript
if (status) {
  updateData.status = status;
} else if (!currentProgress) {
  updateData.status = 'running';
}
// Problem: If status is NOT provided AND currentProgress EXISTS,
// status is never set, but upsert replaces the entire row
```

The upsert with `onConflict: 'scan_id'` replaces the row, so any field not in `updateData` becomes NULL.

## Solution

### Technical Changes

**File: `supabase/functions/n8n-scan-progress/index.ts`**

Update the status handling logic (lines 98-102) to always preserve or provide a status:

```text
BEFORE:
if (status) {
  updateData.status = status;
} else if (!currentProgress) {
  updateData.status = 'running';
}

AFTER:
if (status) {
  updateData.status = status;
} else if (currentProgress?.status) {
  // Preserve existing status when not explicitly provided
  updateData.status = currentProgress.status;
} else {
  // Default for new records
  updateData.status = 'running';
}
```

This ensures:
1. If n8n sends a status → use it
2. If updating an existing record → preserve the current status  
3. If creating a new record → default to 'running'

## Architecture Flow

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                          n8n Quick Scan Workflow                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐    │
│  │ Webhook Trigger │ ──▶ │ Workflow Config  │ ──▶ │ Run WhatsMyName     │    │
│  │ (receives scan) │     │ (stores tokens)  │     │ (OSINT worker call) │    │
│  └─────────────────┘     └──────────────────┘     └─────────────────────┘    │
│                                                             │                 │
│                                                             ▼                 │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                    Progress HTTP Nodes (Steps 1-6)                    │   │
│  │                                                                       │   │
│  │  POST /n8n-scan-progress                                              │   │
│  │  Headers: Authorization: Bearer {{ callbackToken }}                   │   │
│  │  Body: { scanId, step, stepTitle, stepDescription }                   │   │
│  │                                                                       │   │
│  │  ✓ Authorization header now has Bearer prefix                        │   │
│  │  ✗ Missing status field → Fixed in edge function                     │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                             │                 │
│                                                             ▼                 │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │                         Send Results                                 │     │
│  │  POST /n8n-scan-results (final results + findings)                   │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Edge Function: n8n-scan-progress                       │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  1. Validate x-callback-token or Authorization header                        │
│  2. Parse scanId, step, stepTitle, stepDescription                           │
│  3. Fetch current scan_progress record                                       │
│  4. Build updateData with status fallback (THE FIX)                          │
│  5. Upsert to scan_progress table                                            │
│  6. Broadcast realtime update to frontend                                    │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Frontend (ScanProgress)                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  useStepProgress hook:                                                       │
│  - Polls scan_progress every 1s                                              │
│  - Listens for realtime broadcasts on scan_progress:${scanId}                │
│  - Updates UI with step progress (1-6)                                       │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Testing Plan

After the fix is deployed:
1. Trigger a new Free tier scan from the UI
2. Verify `n8n-scan-progress` logs show successful updates without errors
3. Confirm `scan_progress.current_step` increments from 1 to 6
4. Validate the frontend progress UI updates in real-time

## Risk Assessment

- **Low Risk**: Single conditional logic change
- **No Breaking Changes**: Existing behavior preserved when status is provided
- **Backward Compatible**: n8n workflows don't need modification

