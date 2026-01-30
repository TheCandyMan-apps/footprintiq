

# Investigation Plan: n8n Progress Callbacks Not Reaching Edge Functions

## Current Status

The Free tier scan (`cf6eb731-60fb-42f8-898c-768a308269ef` for `TestUser2026`) was triggered successfully:
- `n8n-scan-trigger` logs confirm the workflow was called and accepted (HTTP 200)
- `scan_progress` record exists with `current_step: 0`, `total_steps: 6`
- But `n8n-scan-progress` and `n8n-scan-results` edge functions have **zero logs**

This means n8n is not successfully calling back to the progress endpoint.

## Possible Causes

1. **n8n Workflow Still Failing**: A node before or during progress updates is erroring
2. **Incorrect Webhook URL**: The `progressWebhookUrl` in the Workflow Configuration node is empty or malformed
3. **Network/Firewall**: n8n cannot reach the Supabase edge function URL
4. **Header Issues**: Even with Bearer prefix fix, there may be other header problems

## Next Steps

### Option 1: Check n8n Execution History (Manual)

Please share screenshots of the "FootprintIQ - Quick Scan" workflow's latest execution showing:
- The execution status (success/failed/running)
- Which node is currently executing or failed
- The output of the "Workflow Configuration" node (verify `progressWebhookUrl` is captured)
- The input/output of any "Progress: Checking reputation" node

### Option 2: Add Enhanced Logging to Edge Function

I can update `n8n-scan-progress` to log ALL incoming requests, even invalid ones, to confirm if n8n is attempting to call it at all.

### Option 3: Test Edge Function Directly

I can simulate an n8n callback by calling `n8n-scan-progress` directly with a test payload to verify:
- The endpoint is reachable
- Token authentication works
- Database updates succeed

## Recommended Action

**Option 3 is fastest** - let me test the edge function directly to confirm it's working, then we can narrow down whether the issue is in n8n.

### Test Payload for `n8n-scan-progress`

```json
{
  "scanId": "cf6eb731-60fb-42f8-898c-768a308269ef",
  "step": 1,
  "stepTitle": "Test Progress Update",
  "stepDescription": "Verifying edge function connectivity",
  "workspaceId": "aa9d6a0d-4e31-480d-bbdc-622301ad3ad0"
}
```

With the header:
```
Authorization: Bearer <N8N_CALLBACK_TOKEN>
```

## Expected Outcome

After testing:
- If direct call works: Issue is in n8n workflow (needs workflow debugging)
- If direct call fails: Issue is in edge function (needs code fix)

---

**Approval of this plan** will:
1. Directly test the `n8n-scan-progress` edge function using the actual callback token
2. Verify database update works
3. Provide clear next steps based on results

