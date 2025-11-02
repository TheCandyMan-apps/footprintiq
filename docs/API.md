# FootprintIQ API Documentation

Version: 1.0.0  
Base URL: `https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1`

## Authentication

All API requests require an API key in the Authorization header:

```bash
Authorization: Bearer YOUR_API_KEY
```

Get your API key from Settings → API Keys in the FootprintIQ dashboard.

## Rate Limits

Rate limits vary by subscription tier:

| Tier | Requests/Hour | Scans/Month |
|------|---------------|-------------|
| Trial | 10 | 5 |
| Free | 50 | 10 |
| Professional | 1000 | 100 |
| Enterprise | Unlimited | Unlimited |

## Endpoints

### POST /api/scan

Create a new OSINT scan.

**Request Body:**
```json
{
  "type": "email",
  "value": "target@example.com",
  "options": {
    "includeDarkweb": true,
    "includeDating": false,
    "includeNsfw": false,
    "providers": ["hibp", "intelx", "dehashed"]
  }
}
```

**Parameters:**
- `type` (required): `email`, `username`, `phone`, `domain`, `ip`
- `value` (required): Target value to scan
- `options` (optional):
  - `includeDarkweb` (boolean): Enable dark web scanning
  - `includeDating` (boolean): Scan dating sites
  - `includeNsfw` (boolean): Scan NSFW sites
  - `providers` (array): Specific providers to use

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending"
}
```

**Status Codes:**
- `202`: Scan accepted and queued
- `400`: Invalid request
- `401`: Unauthorized (invalid API key)
- `429`: Rate limit exceeded

---

### GET /api/scan/{job_id}

Get scan results by job ID.

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "created_at": "2025-01-15T10:30:00Z",
  "completed_at": "2025-01-15T10:31:45Z",
  "findings": [
    {
      "id": "finding-1",
      "type": "breach",
      "severity": "high",
      "provider": "hibp",
      "title": "Account compromised in data breach",
      "description": "Email found in LinkedIn breach (2021)",
      "evidence": [
        {
          "key": "breach_name",
          "value": "LinkedIn"
        },
        {
          "key": "breach_date",
          "value": "2021-06-15"
        }
      ],
      "confidence": 0.95,
      "observed_at": "2025-01-15T10:31:00Z"
    }
  ],
  "summary": {
    "total_findings": 12,
    "by_severity": {
      "critical": 2,
      "high": 5,
      "medium": 3,
      "low": 2
    },
    "providers_used": ["hibp", "intelx", "dehashed", "fullcontact"]
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Job not found
- `401`: Unauthorized

---

### GET /api/findings

List all findings for your workspace.

**Query Parameters:**
- `limit` (int, default: 50): Number of results
- `offset` (int, default: 0): Pagination offset
- `severity` (string): Filter by severity (critical, high, medium, low)
- `provider` (string): Filter by provider
- `from_date` (ISO 8601): Filter findings after date
- `to_date` (ISO 8601): Filter findings before date

**Response:**
```json
{
  "findings": [...],
  "pagination": {
    "total": 1234,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

---

### POST /api/dark-web/subscribe

Create a dark web monitoring subscription.

**Request Body:**
```json
{
  "keyword": "user@example.com",
  "severity_threshold": "medium",
  "notification_email": "alerts@company.com"
}
```

**Response:**
```json
{
  "subscription_id": "sub-123",
  "status": "active",
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

### DELETE /api/dark-web/subscribe/{subscription_id}

Cancel a dark web monitoring subscription.

**Response:**
```json
{
  "subscription_id": "sub-123",
  "status": "cancelled"
}
```

---

## Webhooks

FootprintIQ can send webhooks when scans complete or alerts trigger.

### Configuring Webhooks

1. Go to Settings → Webhooks
2. Add your webhook URL
3. Select events to receive
4. Save and test

### Webhook Events

**scan.completed**
```json
{
  "event": "scan.completed",
  "timestamp": "2025-01-15T10:31:45Z",
  "data": {
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "email",
    "value": "target@example.com",
    "findings_count": 12,
    "severity_summary": {
      "critical": 2,
      "high": 5
    }
  }
}
```

**darkweb.alert**
```json
{
  "event": "darkweb.alert",
  "timestamp": "2025-01-15T14:22:10Z",
  "data": {
    "subscription_id": "sub-123",
    "keyword": "user@example.com",
    "severity": "high",
    "url": "http://darkweb.onion/leak",
    "title": "Credential Database Leak",
    "snippet": "Email found in compromised database"
  }
}
```

### Webhook Security

All webhooks include an `X-Signature` header for verification:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

---

## Code Examples

### Python

```python
import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Create a scan
response = requests.post(
    f"{BASE_URL}/api/scan",
    headers=headers,
    json={
        "type": "email",
        "value": "target@example.com",
        "options": {
            "includeDarkweb": True
        }
    }
)

job_id = response.json()["job_id"]
print(f"Scan created: {job_id}")

# Get results
results = requests.get(
    f"{BASE_URL}/api/scan/{job_id}",
    headers=headers
)

print(f"Findings: {results.json()['summary']['total_findings']}")
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};

// Create scan
async function createScan() {
  const response = await axios.post(
    `${BASE_URL}/api/scan`,
    {
      type: 'email',
      value: 'target@example.com',
      options: { includeDarkweb: true }
    },
    { headers }
  );
  
  return response.data.job_id;
}

// Get results
async function getResults(jobId) {
  const response = await axios.get(
    `${BASE_URL}/api/scan/${jobId}`,
    { headers }
  );
  
  return response.data;
}

// Usage
(async () => {
  const jobId = await createScan();
  console.log('Scan created:', jobId);
  
  // Wait for completion
  await new Promise(resolve => setTimeout(resolve, 60000));
  
  const results = await getResults(jobId);
  console.log('Findings:', results.summary.total_findings);
})();
```

### cURL

```bash
# Create scan
curl -X POST https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/api/scan \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email",
    "value": "target@example.com",
    "options": {
      "includeDarkweb": true
    }
  }'

# Get results
curl https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/api/scan/JOB_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Temporary outage |

## Support

- Documentation: https://docs.footprintiq.com
- API Status: https://status.footprintiq.com
- Support Email: support@footprintiq.com
- Developer Portal: https://footprintiq.com/developers
