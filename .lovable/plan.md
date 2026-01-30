
# Fix Plan: n8n Free Tier Quick Scan Workflow

## Issue Summary

The StepProgressUI displayed correctly for 1-2 minutes, confirming:
- Tier routing works (Free → quick scan workflow)
- UI component renders properly for Free users
- Webhook trigger was received by n8n

But then it reverted because the n8n workflow **silently failed** after the webhook trigger. No progress updates were ever sent back.

## Root Cause Analysis

The workflow has **three critical bugs** preventing it from completing:

### Bug 1: Data Context Lost After WhatsMyName Request

The workflow uses `$json` to reference webhook data throughout. But after the "Run WhatsMyName" HTTP request executes, `$json` gets **overwritten** with the WhatsMyName response.

**Before WhatsMyName:**
```
$json = { scanId, username, progressWebhookUrl, callbackToken, workerToken, ... }
```

**After WhatsMyName:**
```
$json = { sites: [...], status: "success", ... }  // WhatsMyName response
```

All subsequent progress nodes fail because:
- `$json.progressWebhookUrl` → undefined
- `$json.scanId` → undefined
- `$json.callbackToken` → undefined

### Bug 2: Missing Authorization on Worker Request

The "Run WhatsMyName" node calls the OSINT worker but has **no Authorization header**:

```text
Current Configuration:
┌──────────────────────────────────┐
│ Run WhatsMyName                  │
│ URL: {{ workerUrl }}/scan        │
│ Body: { tool, username }         │
│ Headers: (none)          ← BUG   │
└──────────────────────────────────┘
```

The worker returns 401 Unauthorized, causing silent failure.

### Bug 3: Expression Syntax Issues

The JSON body uses partial expression syntax:
```
jsonBody: "={ \"scanId\": $json.scanId, ... }"
```

Should be:
```
jsonBody: "={{ JSON.stringify({ scanId: $json.scanId, ... }) }}"
```

Or use n8n's structured JSON body mode instead of raw string.

---

## Fix Instructions (Manual in n8n)

### Step 1: Update Workflow Configuration Node

Change the "Workflow Configuration" Set node to explicitly store ALL incoming data:

| Assignment | Value |
|------------|-------|
| workerUrl | `https://osint-multitool-worker-iikvulknua-ew.a.run.app` |
| scanId | `={{ $json.body.scanId }}` |
| username | `={{ $json.body.username }}` |
| progressWebhookUrl | `={{ $json.body.progressWebhookUrl }}` |
| resultsWebhookUrl | `={{ $json.body.resultsWebhookUrl }}` |
| callbackToken | `={{ $json.body.callbackToken }}` |
| workerToken | `={{ $json.body.workerToken }}` |

Keep `includeOtherFields: false` (we're explicitly mapping everything).

### Step 2: Update Run WhatsMyName Node

Add Authorization header:
- Enable "Send Headers"
- Add header: `Authorization` = `Bearer {{ $('Workflow Configuration').first().json.workerToken }}`
- Update JSON body to use stored config:
  ```json
  {
    "tool": "whatsmyname",
    "username": "={{ $('Workflow Configuration').first().json.username }}"
  }
  ```

### Step 3: Update All Progress Nodes After WhatsMyName

For each of these nodes:
- Progress: Cross-referencing
- Progress: Mapping entities
- Progress: Georeferencing
- Progress: Building timeline
- Send Results
- Progress: Complete

Change URL from:
```
={{ $json.progressWebhookUrl }}
```
To:
```
={{ $('Workflow Configuration').first().json.progressWebhookUrl }}
```

Change Authorization header from:
```
={{ $json.callbackToken }}
```
To:
```
={{ $('Workflow Configuration').first().json.callbackToken }}
```

Change JSON body scanId references from:
```
$json.scanId
```
To:
```
$('Workflow Configuration').first().json.scanId
```

### Step 4: Fix First Two Progress Nodes Too

For consistency, update "Progress: Checking reputation" and "Progress: Searching platforms" to also use the stored config instead of `$json`:

```
URL: {{ $('Workflow Configuration').first().json.progressWebhookUrl }}
Header: {{ $('Workflow Configuration').first().json.callbackToken }}
Body.scanId: {{ $('Workflow Configuration').first().json.scanId }}
```

This ensures the entire workflow uses consistent data references.

### Step 5: Verify Send Results Node

Ensure it:
- Uses `{{ $('Workflow Configuration').first().json.resultsWebhookUrl }}`
- Sends `x-callback-token` header (or `Authorization`)
- Includes WhatsMyName results from `$json` (this is correct since it follows Run WhatsMyName)
- Includes `scanId` from stored config

---

## Summary of Required n8n Changes

| Node | Change Required |
|------|-----------------|
| **Workflow Configuration** | Add explicit assignments for scanId, username, progressWebhookUrl, resultsWebhookUrl, callbackToken, workerToken (from `$json.body`) |
| **Run WhatsMyName** | Add `Authorization: Bearer {{ config.workerToken }}` header |
| **Progress: Cross-referencing** | Change all references from `$json.*` to `$('Workflow Configuration').first().json.*` |
| **Progress: Mapping entities** | Same as above |
| **Progress: Georeferencing** | Same as above |
| **Progress: Building timeline** | Same as above |
| **Send Results** | Same as above |
| **Progress: Complete** | Same as above |

---

## Verification

After applying fixes, test by:

1. Run a Free tier username scan in the preview
2. Watch the StepProgressUI - should see checkmarks progressing 1 through 6
3. Scan should complete in approximately 10-15 seconds
4. Results should appear on FreeResultsPage

You can also check the n8n execution history for the workflow to see if any nodes are failing.

---

## Why the UI Reverted

The StepProgressUI showed for 1-2 minutes because:
1. Initial state renders correctly (all steps pending, 0%)
2. Polling every 1 second finds `current_step: 0` (no updates from n8n)
3. User waited, eventually navigated away or the 3-minute safety timeout triggered
4. On the results page, a different component renders (not ScanProgress)

The UI itself is correct - the issue is purely in the n8n workflow not sending progress callbacks.
