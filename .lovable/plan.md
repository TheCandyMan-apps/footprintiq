
# Free Tier Quick Scan Implementation Plan

## Overview
This plan addresses two key business problems:
1. **Slow Free scans** - Currently takes 45-90+ seconds because Free users run the full OSINT suite (Sherlock, Maigret, GoSearch, Holehe)
2. **Low conversion rates** - Long wait times and lack of engaging progress feedback reduce user confidence before they see results

The solution creates a dedicated lightweight n8n workflow for Free users that completes in 5-15 seconds, combined with a SherlockEye-style step-by-step progress UI that keeps users engaged.

---

## Architecture Summary

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CURRENT FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  Free User → n8n-scan-trigger → Unified OSINT Workflow                      │
│                                 (Sherlock + Maigret + GoSearch + Holehe)    │
│                                 → 45-90+ seconds                             │
│                                 → Indeterminate spinner                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEW FLOW                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Free User → n8n-scan-trigger → NEW Quick Scan Workflow                     │
│                                 (WhatsMyName only)                           │
│                                 → 5-15 seconds                               │
│                                 → Step-by-step progress with descriptions   │
│                                                                              │
│  Pro+ User → n8n-scan-trigger → Unified OSINT Workflow (unchanged)          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Implementation

### Phase 1: n8n Workflow Creation (Manual Step)

You will create a new lightweight n8n workflow specifically for Free tier scans.

**Workflow Name:** `FootprintIQ - Quick Scan (Free Tier)`

**Workflow Structure:**

1. **Webhook Trigger** - Receives scan request with:
   - `scanId`, `username`, `email`, `scanType`, `tier: "free"`
   - `progressWebhookUrl`, `resultsWebhookUrl`, `callbackToken`

2. **Respond OK** - Immediate 200 response to acknowledge receipt

3. **Progress: Checking reputation** - POST to progressWebhookUrl:
   ```json
   {
     "scanId": "...",
     "provider": "reputation_check",
     "status": "started",
     "step": 1,
     "totalSteps": 6,
     "stepTitle": "Checking username reputation...",
     "stepDescription": "Evaluating public presence, uniqueness, and trust indicators across open sources..."
   }
   ```

4. **Progress: Searching platforms** - POST progress update:
   ```json
   {
     "scanId": "...",
     "provider": "platform_search",
     "status": "started",
     "step": 2,
     "totalSteps": 6,
     "stepTitle": "Searching social and public platforms...",
     "stepDescription": "Detecting the username across social networks, forums, marketplaces, and other public platforms..."
   }
   ```

5. **Run WhatsMyName** - HTTP POST to OSINT worker:
   - URL: `{{ workerUrl }}/scan`
   - Body: `{ "tool": "whatsmyname", "username": "..." }`
   - This is the single fast provider (covers 500+ sites in ~10 seconds)

6. **Progress: Cross-referencing** - POST progress (step 3/6)
7. **Progress: Mapping entities** - POST progress (step 4/6)
8. **Progress: Georeferencing** - POST progress (step 5/6)
9. **Progress: Building timeline** - POST progress (step 6/6)

10. **Send Results** - POST to resultsWebhookUrl with findings

11. **Progress: Complete** - Final broadcast

**Time Savings:**
- Current: Sherlock (~30s) + Maigret (~45s) + GoSearch (~20s) + Holehe (~15s) = ~90s
- New: WhatsMyName only (~10s) = **80+ seconds saved**

---

### Phase 2: Database Schema Update

Add columns to `scan_progress` table to support step-based progress:

```sql
-- Add step tracking columns to scan_progress
ALTER TABLE scan_progress 
ADD COLUMN IF NOT EXISTS current_step integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_steps integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS step_title text,
ADD COLUMN IF NOT EXISTS step_description text;
```

---

### Phase 3: Edge Function Updates

#### 3.1 Update `n8n-scan-trigger` to Route by Tier

Modify the edge function to:
1. Accept a `tier` parameter from the frontend
2. Route Free users to the new lightweight workflow webhook URL
3. Route Pro/Business users to the existing unified workflow

**Key changes:**
- Add new secret: `N8N_FREE_SCAN_WEBHOOK_URL`
- Accept `tier` in request body
- Conditionally select webhook URL based on tier
- Set `total_steps: 6` for Free scans in initial progress record

#### 3.2 Update `n8n-scan-progress` to Handle Steps

Modify to accept and store step-based progress:
- `step`, `totalSteps`, `stepTitle`, `stepDescription`
- Broadcast these values in the realtime event

---

### Phase 4: Frontend Updates

#### 4.1 Create `StepProgressUI` Component

A new component inspired by SherlockEye's progress display:

**Visual Design:**
```
┌──────────────────────────────────────────────────────────┐
│  ╭──────╮  Search progress                               │
│  │ 78%  │  Running...                                    │
│  ╰──────╯                                                │
│                                                          │
│  ✓ Checking username reputation...                       │
│    Evaluating public presence, uniqueness, and trust...  │
│                                                          │
│  ✓ Searching social and public platforms...              │
│    Detecting the username across social networks...      │
│                                                          │
│  ✓ Cross-referencing related data...                     │
│    Linking the username to emails, phone numbers...      │
│                                                          │
│  ✓ Mapping associated entities...                        │
│    Identifying connected domains, accounts...            │
│                                                          │
│  ✓ Georeferencing online activity...                     │
│    Analyzing posting times, language, and content...     │
│                                                          │
│  → Building activity timeline...                          │
│    Chronologically organizing public posts, updates...   │
│                                                          │
│ ────────────────────────────────────────────────────────│
│  Results                                                 │
│  ╭──────────────────────────────────────────────────╮   │
│  │  username123                                      │   │
│  ╰──────────────────────────────────────────────────╯   │
└──────────────────────────────────────────────────────────┘
```

**Component Props:**
```typescript
interface StepProgressUIProps {
  scanId: string;
  username: string;
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    title: string;
    description: string;
    status: 'pending' | 'active' | 'completed';
  }>;
  percentComplete: number;
  isComplete: boolean;
  isFailed: boolean;
}
```

#### 4.2 Create `useStepProgress` Hook

A new hook that:
1. Subscribes to `scan_progress:${scanId}` realtime channel
2. Listens for step-based progress broadcasts
3. Maintains ordered list of completed steps
4. Calculates percentage from `currentStep / totalSteps`

#### 4.3 Update `ScanProgress` Component

Modify to:
1. Pass `tier` to edge function
2. Render `StepProgressUI` for Free users
3. Continue using `UnifiedScanProgress` for Pro/Business users

#### 4.4 Define Step Definitions

Static step configuration for consistent display:

```typescript
const FREE_SCAN_STEPS = [
  {
    id: 'reputation_check',
    title: 'Checking username reputation...',
    description: 'Evaluating public presence, uniqueness, and trust indicators across open sources...'
  },
  {
    id: 'platform_search',
    title: 'Searching social and public platforms...',
    description: 'Detecting the username across social networks, forums, marketplaces, and other public platforms...'
  },
  {
    id: 'cross_reference',
    title: 'Cross-referencing related data...',
    description: 'Linking the username to emails, phone numbers, or profiles found in open sources...'
  },
  {
    id: 'entity_mapping',
    title: 'Mapping associated entities...',
    description: 'Identifying connected domains, accounts, and organizations linked to the username...'
  },
  {
    id: 'georeferencing',
    title: 'Georeferencing online activity...',
    description: 'Analyzing posting times, language, and content context to infer probable regions of activity...'
  },
  {
    id: 'timeline',
    title: 'Building activity timeline...',
    description: 'Chronologically organizing public posts, updates, and mentions to trace behavioral evolution...'
  }
];
```

---

### Phase 5: Integration Flow

**Complete Request Flow:**

1. User submits scan on Free tier
2. `ScanProgress` component calls `n8n-scan-trigger` with `tier: 'free'`
3. Edge function routes to lightweight workflow webhook
4. n8n workflow starts, immediately responds 200
5. n8n broadcasts step progress updates to `n8n-scan-progress`
6. Edge function stores in `scan_progress` table and broadcasts via realtime
7. `useStepProgress` hook receives updates, UI renders checkmarks
8. WhatsMyName completes (~10s), results sent to `n8n-scan-results`
9. Edge function stores findings, broadcasts `scan_complete`
10. UI navigates to `FreeResultsPage`

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/scan/StepProgressUI.tsx` | CREATE | SherlockEye-style step progress display |
| `src/hooks/useStepProgress.ts` | CREATE | Realtime step progress subscription |
| `src/lib/scan/freeScanSteps.ts` | CREATE | Step definitions and utilities |
| `supabase/functions/n8n-scan-trigger/index.ts` | MODIFY | Add tier routing logic |
| `supabase/functions/n8n-scan-progress/index.ts` | MODIFY | Handle step-based progress |
| `src/components/ScanProgress.tsx` | MODIFY | Pass tier, conditionally render step UI |
| Database migration | CREATE | Add step columns to scan_progress |

---

## Configuration Required

### New Secrets Needed
- `N8N_FREE_SCAN_WEBHOOK_URL` - Webhook URL for the new lightweight workflow

### n8n Workflow (Manual)
You will need to create the new workflow in n8n with:
1. Single Webhook trigger
2. Progress HTTP nodes for each step
3. Single WhatsMyName worker call
4. Results webhook call

---

## Success Metrics

| Metric | Before | After (Target) |
|--------|--------|----------------|
| Free scan duration | 45-90+ seconds | 5-15 seconds |
| User engagement during scan | Low (indeterminate spinner) | High (step-by-step feedback) |
| Perceived wait time | Long | Short (progress gives sense of activity) |
| Pro conversion rate | Baseline | Increase (faster time-to-value) |

---

## Rollback Plan

If issues arise:
1. Remove tier routing in `n8n-scan-trigger` (revert to single workflow)
2. The `StepProgressUI` will gracefully fall back to showing indeterminate progress if no step data arrives
3. All existing Pro/Business scan behavior remains unchanged

---

## Technical Notes

- The step progress is "synthetic" for the first 5 steps (timed intervals), while the actual WhatsMyName scan runs
- This creates the perception of detailed analysis while the single fast provider executes
- The approach mirrors how SherlockEye presents their scanning experience
- WhatsMyName is chosen because it's the fastest provider (10s for 500+ sites) while still providing meaningful results
