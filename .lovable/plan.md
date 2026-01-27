
# Fix n8n Workflow: Pass workspaceId to Canonical Results

## Problem Identified
The n8n error "workspaceId is missing or empty" occurs because the `workspaceId` field is being dropped during the n8n workflow execution. 

Looking at your screenshot:
- The **input** to "Fail-fast Validate Canonical Payload" shows `scanId` and `canonicalResults` but NO `workspaceId`
- The validation code expects `workspaceId` and fails at line 11

## Root Cause
The `n8n-scan-trigger` edge function correctly sends `workspaceId` in its payload to n8n:

```text
┌─────────────────────────────────────────────────────────────┐
│  n8n-scan-trigger sends:                                    │
│  {                                                          │
│    scanId: "fdcf3d3e-...",                                 │
│    username: "jer2020",                                     │
│    workspaceId: "abc123...",  ← This IS sent                │
│    userId: "...",                                           │
│    ...                                                      │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  n8n Workflow                                               │
│  ┌─────────┐    ┌─────────┐    ┌───────────────────────┐   │
│  │ Webhook │ → │ Process │ → │ Normalize Canonical   │   │
│  │ Trigger │    │  Nodes  │    │ Results               │   │
│  └─────────┘    └─────────┘    └───────────────────────┘   │
│                                          │                  │
│                         workspaceId gets DROPPED here       │
└─────────────────────────────────────────────────────────────┘
```

## Solution: n8n Workflow Fix

You need to update the n8n workflow to preserve `workspaceId` through all nodes. Here's what to do:

### Step 1: Locate the "Normalize Canonical Results" Node
In your n8n workflow editor, find the node that outputs to the "Fail-fast Validate Canonical Payload" node.

### Step 2: Update the JavaScript Code
In the "Normalize Canonical Results" node (or whichever node builds the canonical payload), ensure `workspaceId` is included:

**Current (broken):**
```javascript
const input = $input.first().json;
const { scanId, canonicalResults } = input;  // workspaceId not extracted!
```

**Fixed:**
```javascript
const input = $input.first().json;
const { scanId, workspaceId, canonicalResults } = input;

// Return with workspaceId included
return {
  json: {
    scanId,
    workspaceId,  // ← Add this
    canonicalResults
  }
};
```

### Step 3: Trace the workspaceId Through the Pipeline
Check each node between the webhook trigger and the canonical results node. The `workspaceId` must be passed through every transformation:

1. **Webhook Trigger** - receives `workspaceId` from edge function
2. **Any Merge/Set nodes** - must include `workspaceId` in output
3. **Normalize Canonical Results** - must pass `workspaceId` to output
4. **Fail-fast Validate** - expects `workspaceId`
5. **HTTP Request to n8n-canonical-results** - must include `workspaceId` in body

### Step 4: Verify the Fix
After updating, run a test scan and check:
1. The "Fail-fast Validate" node should pass
2. The `n8n-canonical-results` endpoint should receive all three fields:
   - `scanId`
   - `workspaceId`
   - `canonicalResults`

## Technical Details

The edge function `n8n-canonical-results` validates at line 161:
```typescript
if (!scanId || !workspaceId) {
  console.error("[n8n-canonical-results] Missing scanId or workspaceId");
  return new Response(
    JSON.stringify({ error: "Missing scanId or workspaceId" }),
    { status: 400 }
  );
}
```

All canonical results are stored with `workspace_id` for RLS (Row Level Security) enforcement, so this field is required.

## Summary
This is an **n8n workflow configuration issue**, not a code change in Lovable. You need to:

1. Open your n8n workflow: "FootprintIQ - Universal Scan" (or similar name)
2. Find where `workspaceId` is being dropped
3. Update the node(s) to preserve `workspaceId` through the pipeline
4. Test with a new scan

No code changes are needed in the edge functions - they're correctly sending and expecting `workspaceId`.
