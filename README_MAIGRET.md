# Maigret Integration

This document outlines the integration of Maigret, a powerful OSINT username scanning tool, into FootprintIQ.

## Overview

Maigret checks 300+ social media platforms and websites for username presence, providing comprehensive profile discovery capabilities.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│                 │     │  providers-maigret   │     │ Maigret Worker  │
│  AdvancedScan   │────▶│   Edge Function      │────▶│  (Cloud Run)    │
│   (Frontend)    │     │                      │     │                 │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
                                  │
                                  ▼
                        ┌──────────────────────┐
                        │  scan-orchestrate    │
                        │   Edge Function      │
                        └──────────────────────┘
                                  │
                                  ▼
                        ┌──────────────────────┐
                        │   scan_findings      │
                        │      (Table)         │
                        └──────────────────────┘
```

## Components

### 1. Edge Function: providers-maigret

**Path**: `supabase/functions/providers-maigret/index.ts`

**Purpose**: Acts as a secure proxy between the frontend and the Maigret worker service.

**Request Format**:
```json
{
  "usernames": ["example_user"],
  "sites": ["twitter", "github"],  // optional
  "timeout": 60                     // optional, seconds
}
```

**Response Format**:
```json
{
  "findings": [
    {
      "type": "profile_presence",
      "title": "Profile found on Twitter",
      "severity": "info",
      "provider": "maigret",
      "confidence": 0.9,
      "evidence": {
        "site": "Twitter",
        "url": "https://twitter.com/example_user",
        "username": "example_user",
        "status": "found"
      },
      "remediation": "Review profile at https://twitter.com/example_user"
    }
  ]
}
```

**CORS Headers**:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: content-type, authorization`
- `Access-Control-Allow-Methods: POST, OPTIONS`

**Error Handling**:
- Always returns 200 status with `findings` array
- On error, returns empty findings array with `error` field
- Never throws or returns 5xx errors
- Gracefully handles worker timeouts, connection failures, and invalid responses

### 2. Orchestrator Integration

**File**: `supabase/functions/scan-orchestrate/index.ts`

**Default Providers**:
```typescript
username: ['maigret', 'dehashed']
```

**Special Handling**:
- Maigret calls `providers-maigret` edge function directly
- Other providers call through `provider-proxy`
- On error, returns informational finding instead of failing

**Example Call**:
```typescript
if (provider === 'maigret') {
  const { data, error } = await supabase.functions.invoke('providers-maigret', {
    body: { usernames: [value], timeout: 60 }
  });
}
```

### 3. Frontend Integration

**Component**: `src/pages/AdvancedScan.tsx`

**UI Element**: `MaigretToggle` component

**Features**:
- Toggle to enable/disable Maigret for username scans
- Tooltip explaining functionality
- Automatically updates provider list when toggled
- Shows "No Maigret matches found" card for empty results

**Environment Variable**:
```bash
VITE_MAIGRET_API_URL=${VITE_SUPABASE_URL}/functions/v1/providers-maigret
```

### 4. Data Persistence

**Table**: `scan_findings`

**Fields**:
- `provider`: "maigret"
- `site`: Platform name (e.g., "Twitter")
- `url`: Profile URL
- `status`: "found", "available", etc.
- `raw`: Complete JSON response

**Display**:
- Results page shows all findings
- Recent scans list includes Maigret results
- Export functionality includes Maigret data

## Environment Variables

### Backend (Edge Functions)

Set these as Supabase secrets:

```bash
MAIGRET_WORKER_URL=https://maigret-api-312297078337.europe-west1.run.app
MAIGRET_WORKER_TOKEN=<secret-token>
```

⚠️ **Security**: Never expose these tokens to the client side!

### Frontend

Add to `.env`:

```bash
VITE_MAIGRET_API_URL=${VITE_SUPABASE_URL}/functions/v1/providers-maigret
```

## Safety & Security

### Token Management
- Worker tokens stored as Supabase function secrets
- Never exposed in client-side code
- Edge function acts as secure proxy

### Request Validation
- Username format validation
- Timeout limits (max 90 seconds)
- Rate limiting via credit system

### Data Privacy
- No PII stored in Maigret findings
- Public profile URLs only
- GDPR-compliant data retention

## Usage

### Enable Maigret

1. Select "Username" scan type in Advanced Scan
2. Toggle "Use Maigret (OSINT username scan)" to ON
3. Enter username to search
4. Click "Start Scan"

### Results Display

**Found Profile**:
```
✓ Profile found on GitHub
  URL: https://github.com/username
  Confidence: 90%
```

**No Matches**:
```
ℹ No Maigret matches found
  Try a different username variant or check spelling
```

## Testing

### Unit Tests

```bash
npm test -- MaigretToggle
npm test -- providers-maigret
```

### Integration Tests

```typescript
// Mock worker returning 2 findings
const mockWorkerResponse = {
  results: [
    { site: "GitHub", url: "https://github.com/test", username: "test" },
    { site: "Twitter", url: "https://twitter.com/test", username: "test" }
  ]
};

// Expect orchestrator to persist both
// Expect UI to render both profile cards
```

### E2E Tests

**Happy Path**:
```typescript
test('should scan username with Maigret', async ({ page }) => {
  await page.goto('/advanced-scan');
  await page.selectOption('[name="scanType"]', 'username');
  await page.fill('[name="target"]', 'testuser');
  await page.click('text=Use Maigret');
  await page.click('button:has-text("Start Scan")');
  
  await expect(page.locator('text=Profile found')).toBeVisible();
});
```

**Empty Results**:
```typescript
test('should show friendly message for no results', async ({ page }) => {
  await page.goto('/advanced-scan');
  await page.selectOption('[name="scanType"]', 'username');
  await page.fill('[name="target"]', 'nonexistent_user_12345');
  await page.click('button:has-text("Start Scan")');
  
  await expect(page.locator('text=No Maigret matches found')).toBeVisible();
});
```

## Health Check System

### Fallback Mechanism

The `maigret-health` edge function implements a resilient health check:

1. **Primary**: Attempts `GET /health` endpoint (5s timeout)
2. **Fallback**: If 404 or timeout, performs `POST /run` probe with test username (8s timeout)
3. **Result**: Returns `{status: 'healthy'}` if either succeeds, `{status: 'unhealthy'}` otherwise

**Pre-Scan Checks**:
- AdvancedScan calls `maigret-health` before username scans
- If unhealthy: shows warning toast, disables Maigret, continues scan with other providers
- Scans never blocked by Maigret unavailability

**WorkerStatus Component**:
- Uses `supabase.functions.invoke('maigret-health')` instead of direct worker calls
- Displays "Unknown" instead of "Offline" for ambiguous states
- Refreshable badge with last check timestamp

## Monitoring

### Logs

Check edge function logs:
```bash
supabase functions logs providers-maigret
supabase functions logs maigret-health
```

### Metrics

Provider timing logged in orchestrator:
```
[orchestrate] Provider maigret returned 15 findings in 5.2s
```

Health check logs show fallback usage:
```
⚠️ Health endpoint returned 404, trying fallback probe...
✓ Fallback probe successful
```

### Alerts

Health checks monitor worker availability and send email alerts on repeated failures.

## Troubleshooting

### Worker Offline
- Check Cloud Run service status
- Verify MAIGRET_WORKER_URL is correct
- Check worker logs for errors
- Test with direct `curl` to worker

### No Results
- Verify username exists on platforms
- Check worker is returning data
- Review edge function logs
- Test with known username (e.g., "github")

### Timeout
- Reduce site count in request
- Increase timeout to 90s
- Check worker performance
- Use caching for repeated scans

## Future Enhancements

- [ ] Cached results for popular usernames
- [ ] Batch username scanning
- [ ] Site-specific filtering UI
- [ ] Confidence threshold controls
- [ ] Historical tracking of profile changes
- [ ] Integration with case management
- [ ] PDF report generation with Maigret results

## References

- [Maigret GitHub](https://github.com/soxoj/maigret)
- [Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [UFM (Unified Finding Model)](./README_UFM.md)
