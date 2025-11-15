# WhatsMyName, Holehe & GoSearch Integration

This document outlines the integration of three powerful OSINT tools into FootprintIQ's Advanced Scan pipeline.

## Overview

The FootprintIQ platform now supports:
- **WhatsMyName**: Username enumeration across 300+ websites
- **Holehe**: Email presence detection across 120+ services  
- **GoSearch**: Digital footprint discovery with deep OSINT capabilities

These tools are integrated via a multi-tool OSINT worker that runs as a containerized service.

## Architecture

### Multi-Tool OSINT Worker

**Location**: `supabase/functions/whatsmyname-worker/`

The worker is built with:
- **Base**: Python 3.11 slim
- **Tools**:
  - `whatsmyname` (via pip)
  - `holehe` (via pip)
  - `gosearch` (via Go)

**API Endpoints**:
- `GET /health` - Health check
- `POST /scan` - Universal scan endpoint

**Request Format**:
```json
{
  "tool": "whatsmyname" | "holehe" | "gosearch",
  "username": "optional for username tools",
  "email": "optional for email tools",
  "filters": "optional filters",
  "token": "OSINT_WORKER_TOKEN for auth"
}
```

**Response Format**:
```json
{
  "tool": "whatsmyname",
  "username": "target",
  "results": [...],
  "raw_output": "string if parsing failed"
}
```

### Provider Proxy Integration

**File**: `supabase/functions/provider-proxy/index.ts`

Added three new provider cases:

1. **whatsmyname**: Username enumeration
   - Input: username
   - Output: UFM findings with site presence data

2. **holehe**: Email presence detection
   - Input: email  
   - Output: UFM findings with account existence data

3. **gosearch**: Username OSINT
   - Input: username
   - Output: UFM findings with digital footprint data

All providers map to the Unified Finding Model (UFM) for consistent data handling.

### Scan Orchestration

**File**: `supabase/functions/scan-orchestrate/index.ts`

Added providers to allowlist:
- `'whatsmyname'`
- `'holehe'`  
- `'gosearch'`

### Frontend Integration

**Advanced Scan Hook**: `src/hooks/useAdvancedScan.tsx`

Automatically includes providers based on scan type:
- **Username scans**: `['maigret', 'whatsmyname', 'gosearch']`
- **Email scans**: `['holehe']`

**Tool Selector**: `src/components/scan/ToolSelector.tsx`

Added four new tool definitions with:
- Tool metadata (name, description, icon)
- Tier requirements (Pro/Enterprise)
- Supported scan types
- Feature lists

## Environment Variables

Required environment variables:

```bash
# Multi-tool OSINT worker
OSINT_WORKER_URL=http://localhost:8080
OSINT_WORKER_TOKEN=secure_token_here

# Existing Maigret worker (unchanged)
MAIGRET_WORKER_URL=https://maigret-worker.com
MAIGRET_WORKER_SCAN_PATH=/scan
WORKER_TOKEN=legacy_token_here
```

## Deployment

### Building the Worker

```bash
cd supabase/functions/whatsmyname-worker
docker build -t osint-worker .
docker run -p 8080:8080 \
  -e OSINT_WORKER_TOKEN=your_token \
  osint-worker
```

### Health Check

```bash
curl http://localhost:8080/health
# Response: {"status":"healthy","service":"osint-worker","tools":["whatsmyname","holehe","gosearch"]}
```

### Example Scans

**WhatsMyName**:
```bash
curl -X POST http://localhost:8080/scan \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "whatsmyname",
    "username": "johndoe",
    "token": "your_token"
  }'
```

**Holehe**:
```bash
curl -X POST http://localhost:8080/scan \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "holehe",
    "email": "john@example.com",
    "token": "your_token"
  }'
```

**GoSearch**:
```bash
curl -X POST http://localhost:8080/scan \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "gosearch",
    "username": "johndoe",
    "token": "your_token"
  }'
```

## Tier Restrictions

Tools are gated by subscription tier:

- **Free**: No OSINT tools
- **Pro**: Maigret, WhatsMyName, Holehe
- **Enterprise**: All tools including GoSearch

UI automatically disables tools based on user's subscription tier.

## Data Flow

1. User initiates Advanced Scan (username or email)
2. `useAdvancedScan` hook builds providers list
3. `scan-orchestrate` validates and queues providers
4. `provider-proxy` calls OSINT worker for each tool
5. Worker executes CLI tools and returns results
6. Results normalized to UFM format
7. Findings deduplicated and stored in database
8. UI displays aggregated findings

## Security

- **Token Authentication**: All OSINT worker requests require `OSINT_WORKER_TOKEN`
- **RLS Policies**: Database access controlled via Row Level Security
- **Rate Limiting**: Handled by workspace credit system
- **Input Validation**: Scan inputs validated via Zod schemas

## Troubleshooting

### Worker Not Responding

Check worker health:
```bash
curl http://your-worker-url/health
```

Verify environment variables are set in edge functions.

### No Results

- Check worker logs for tool execution errors
- Verify CLI tools installed correctly in container
- Check target exists on services (some sites may not have profiles)

### Authentication Errors

- Verify `OSINT_WORKER_TOKEN` matches in both worker and edge functions
- Check token not expired or misconfigured

## Future Enhancements

Potential improvements:
- Batch scanning support
- Custom filter configuration per user
- Result caching to reduce duplicate scans
- Progress webhooks for long-running scans
- Additional OSINT tools (Sherlock, Social-Analyzer, etc.)

## References

- [WhatsMyName GitHub](https://github.com/webbreacher/whatsmyname)
- [Holehe GitHub](https://github.com/megadose/holehe)
- [GoSearch GitHub](https://github.com/ibnaleem/gosearch)
- [Unified Finding Model (UFM)](./README_UFM.md)
