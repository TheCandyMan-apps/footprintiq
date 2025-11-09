# WhatsMyName Integration

## Overview

WhatsMyName is a premium username SOCMINT (Social Media Intelligence) provider that searches for usernames across 500+ social media sites and platforms.

## Setup

### Docker Worker

The WhatsMyName worker runs in a Docker container with the following components:

- **Dockerfile**: `supabase/functions/whatsmyname-worker/Dockerfile`
- **Server**: Python 3.11-based REST API (`server.py`)
- **Port**: 8080
- **Health Endpoint**: `/health`
- **Scan Endpoint**: `/scan` (POST)

### Building and Running

```bash
cd supabase/functions/whatsmyname-worker
docker build -t whatsmyname-worker .
docker run -p 8080:8080 whatsmyname-worker
```

## Features

### 1. Premium Gating

- **Free Users**: See teaser message "Upgrade for 500+ site username checks!"
- **Premium Users**: Full access to WhatsMyName scans
- **Admin Users**: Full access

### 2. Scan Options

- **Username**: Required field
- **Filters**: Optional category filters (e.g., "category:social", "category:gaming")
- **Credit Cost**: 10 credits per scan

### 3. Results

Each match includes:
- Site name
- Profile URL
- Category
- Confidence score (0-1)
- Found status

### 4. Save to Cases

Results can be saved to cases with the following structure:
```json
{
  "user_id": "uuid",
  "title": "WhatsMyName: username",
  "description": "Username scan for username",
  "results": [
    {
      "site": "Twitter",
      "url": "https://twitter.com/username",
      "category": "social",
      "confidence": 0.95
    }
  ],
  "status": "open"
}
```

### 5. Ethical Use Policy

Users must accept an ethical use consent modal before scanning:
- Only for legitimate OSINT investigations
- Respect privacy and ToS of all platforms
- No harassment, stalking, or malicious purposes
- Comply with applicable laws
- No unauthorized access attempts

## API

### Edge Function: `whatsmyname-scan`

**Endpoint**: `supabase.functions.invoke('whatsmyname-scan')`

**Request**:
```json
{
  "username": "johndoe",
  "filters": "category:social",
  "workspaceId": "workspace-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "username": "johndoe",
  "results": {
    "sites": {
      "Twitter": {
        "url": "https://twitter.com/johndoe",
        "category": "social",
        "confidence": 0.95,
        "found": true
      }
    }
  },
  "credits_used": 10,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Errors**:
- `401`: Unauthorized
- `402`: Insufficient credits
- `403`: Premium subscription required
- `500`: Internal server error / worker error
- `504`: Scan timeout

## Testing

Run the test suite:

```bash
npm run test:whatsmyname
```

Test scenarios include:
- Successful scans for 5 different usernames
- Category filtering
- Premium subscription requirement
- Credit deduction (10 credits)
- Save to cases functionality
- Zero results handling
- Worker timeout handling
- Insufficient credits handling

## Integration Points

### 1. AdvancedScan.tsx

WhatsMyName tab appears under the Username scan type:
- Located after the Maigret scanner alert
- Premium-gated with teaser for free users
- Integrated with workspace credits system

### 2. Progress Updates

Uses `ScanProgressDialog` for real-time scan progress:
- Shows "Scanning 500+ Sites..." during execution
- Displays results count on completion

### 3. Workspace Linking

- All scans are automatically linked to the active workspace
- Results are shareable within workspace teams
- Credit usage tracked per workspace

## Environment Variables

```env
WHATSMYNAME_WORKER_URL=http://whatsmyname-worker:8080
```

## CLI Usage (Worker)

The WhatsMyName CLI supports the following options:

```bash
whatsmyname -u <username> -j                    # JSON output
whatsmyname -u <username> -j --filter category:social   # Filter by category
```

## Rate Limiting

- No specific rate limits enforced
- Credit system controls usage (10 credits/scan)
- Worker timeout: 5 minutes per scan

## Monitoring

Health check endpoint:
```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "healthy",
  "service": "whatsmyname-worker"
}
```

## Troubleshooting

### Worker Offline

If the worker is offline, users see:
- Toast notification: "Worker offline—retry soon"
- Fallback message to try again later

### Scan Timeout

5-minute timeout on scans. If exceeded:
- Returns 504 error
- User can retry the scan

### Zero Results

If no matches found:
- Returns success with empty results
- Credits still deducted

## Security Considerations

1. **Ethical Use**: Consent modal enforces ethical use policy
2. **Premium Only**: Feature gated to premium users
3. **Credit Control**: 10 credits per scan prevents abuse
4. **Workspace Isolation**: Results scoped to workspace
5. **Input Validation**: Username and filters validated on backend

## Future Enhancements

- Batch username scanning
- Historical result caching
- Advanced filtering options
- Export results to CSV/PDF
- Confidence threshold settings
- Real-time result streaming
