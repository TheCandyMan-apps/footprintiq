# System Audit Documentation

Comprehensive system health monitoring and audit infrastructure for premium launch confidence.

## Overview

The System Audit feature provides automated health checks, AI-powered analysis, and proactive alerting to ensure system reliability before and after premium launch.

## Components

### 1. Admin Dashboard (`/admin/system-audit`)

Web-based interface for:
- Viewing real-time system health metrics
- Running on-demand audit checks
- Reviewing AI-generated failure analysis
- Monitoring failure rates and trends

**Features:**
- **Live Stats**: Total checks, pass/fail counts, failure rate percentage
- **Audit Types**: Full system, RLS, provider health, tier sync, scan flow
- **AI Analysis**: Grok-powered priority assessment and recommendations
- **Alert Threshold**: Automatic email alerts when failure rate > 2%

### 2. Edge Functions

#### `system-audit/run`
Executes comprehensive system health checks:

**RLS Checks:**
- Verifies Row Level Security policies on critical tables
- Ensures `scans`, `findings`, `workspaces`, `credits_ledger`, `user_roles` have active policies
- Detects missing or improperly configured RLS

**Provider Health:**
- Pings Maigret API for username scanning
- Tests SpiderFoot connectivity
- Validates API response times and status codes

**Tier Sync:**
- Checks for expired subscriptions not reverted to free tier
- Detects credit balance mismatches
- Validates Stripe subscription synchronization

**Scan Flow:**
- Identifies scans stuck in pending/processing >30 minutes
- Calculates 24-hour scan success rate
- Flags high failure rates (>10%)

#### `system-audit/alert`
Sends email alerts to `admin@footprintiq.app` when:
- System failure rate exceeds 2%
- Critical components are down
- Manual audit triggers alert condition

**Email includes:**
- Current failure rate vs threshold
- System health metrics
- Recommended actions
- Direct link to audit dashboard

### 3. Automated Testing Script

**Command:** `npm run audit:full`

Simulates 10 scan scenarios with expected pass/fail outcomes:
```bash
npm run audit:full
```

**Workflow:**
1. Executes 10 mock scans (email, username, domain, phone)
2. Simulates realistic failures (API timeouts, RLS denials, provider errors)
3. Logs failures to `system_audit_results` table
4. Calculates failure rate percentage
5. Requests AI analysis via Grok API
6. Sends admin alert if failure rate > 2%

**Output:**
```
🚀 Starting Full System Audit Simulation

Testing 10 scan scenarios...

  ✅ Scan 1: SUCCESS
  ✅ Scan 2: SUCCESS
  ❌ Scan 3: FAILED - Maigret worker offline
  ...

📈 Audit Results:
  Total Scans: 10
  Successful: 7
  Failed: 3
  Failure Rate: 30.0%

📝 Logging failures to database...
  ✅ Logged 3 failures to system_audit_results

🤖 Requesting AI analysis...
  ✅ AI Analysis:
     Priority: high
     Summary: Multiple provider failures detected...
     Recommendations:
       1. Check Maigret API configuration
       2. Review RLS policies
       3. Set up health monitoring

📧 Failure rate (30.0%) exceeds 2% threshold
   Sending alert to admin@footprintiq.app...
   ✅ Alert sent successfully

✨ Audit simulation complete!
```

## Database Schema

### `system_audit_results`

```sql
CREATE TABLE system_audit_results (
  id UUID PRIMARY KEY,
  audit_type TEXT NOT NULL,          -- 'rls_check', 'provider_health', etc.
  status TEXT CHECK (status IN ('success', 'failure', 'warning')),
  component TEXT,                     -- 'maigret', 'rls_scans', etc.
  details JSONB,                      -- Detailed check results
  failure_rate NUMERIC,               -- Percentage (0-100)
  ai_summary TEXT,                    -- Grok-generated analysis
  ai_priority TEXT,                   -- 'low', 'medium', 'high', 'critical'
  recommendations TEXT[],             -- Array of fix suggestions
  created_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  metadata JSONB
);
```

**Indexes:**
- `idx_system_audit_type_status` - Fast filtering by type and status
- `idx_system_audit_created_at` - Chronological queries
- `idx_system_audit_priority` - Critical failure lookup
- `idx_system_audit_unresolved` - Pending issues tracking

## AI Analysis (Grok Integration)

The system uses Grok API for intelligent failure analysis:

**Input:** Array of failed audit checks with details
**Output:**
- `summary`: Concise problem description
- `priority`: Risk level (low/medium/high/critical)
- `recommendations`: Top 3 actionable fixes

**Example Request:**
```json
{
  "model": "grok-beta",
  "messages": [{
    "role": "user",
    "content": "Analyze these failures and prioritize fixes: [...]"
  }],
  "temperature": 0.3
}
```

**Fallback:** If Grok unavailable, returns structured default analysis based on failure count and component severity.

## Alert Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Overall Failure Rate | >2% | Email admin |
| RLS Policy Missing | Any | Immediate alert |
| Provider Down | >5 min | Warning alert |
| Stuck Scans | >30 min | Investigation flag |
| Scan Failure Rate | >10% | Critical alert |

## Usage Examples

### Running Manual Audits

```typescript
// Full system audit
const { data } = await supabase.functions.invoke('system-audit/run', {
  body: { auditType: 'full_system' }
});

// Specific check
await supabase.functions.invoke('system-audit/run', {
  body: { auditType: 'provider_health' }
});
```

### Querying Audit Results

```typescript
// Recent failures
const { data } = await supabase
  .from('system_audit_results')
  .select('*')
  .eq('status', 'failure')
  .order('created_at', { ascending: false })
  .limit(20);

// Calculate failure rate
const { data: rate } = await supabase.rpc('get_system_audit_failure_rate', {
  _audit_type: 'scan_flow',
  _hours_back: 24
});
```

### Automated Scheduling

Add to CI/CD or cron:

```yaml
# GitHub Actions example
name: System Audit
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run audit:full
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

## Testing Mock Glitches

The test suite includes scenarios for:

✅ **RLS Bypass Attempt**: Ensures policies block unauthorized access  
✅ **Provider Timeout**: Validates graceful degradation  
✅ **Tier Expiration**: Checks subscription downgrade logic  
✅ **Stuck Scans**: Detects and reports long-running jobs  
✅ **High Failure Rate**: Triggers alert workflow  

Run tests:
```bash
npm test tests/system-audit.test.ts
```

## Monitoring & Observability

**Key Metrics to Track:**
- Daily failure rate trend
- Provider uptime percentage
- Mean time to resolve (MTTR)
- Alert response time
- Scan throughput and latency

**Integration Points:**
- Sentry for error tracking
- Supabase Analytics for usage metrics
- Email alerts for critical incidents
- Admin dashboard for real-time monitoring

## Best Practices

1. **Run full audits before major deployments**
2. **Schedule automated audits every 6 hours**
3. **Review AI recommendations within 24 hours**
4. **Maintain <2% failure rate for production stability**
5. **Document and resolve critical issues immediately**
6. **Update audit checks as new features are added**

## Troubleshooting

### High Failure Rate

1. Check provider status pages (Maigret, SpiderFoot)
2. Review recent RLS policy changes
3. Verify Stripe webhook configuration
4. Inspect scan logs for patterns
5. Run targeted audit for specific component

### AI Analysis Unavailable

- Verify `GROK_API_KEY` is set
- Check Grok API rate limits
- Review edge function logs
- Fallback to manual analysis

### Alerts Not Sending

- Confirm `RESEND_API_KEY` configured
- Check email deliverability
- Verify `admin@footprintiq.app` exists
- Review Resend dashboard for errors

## Security Considerations

- Audit results accessible only to admin users (RLS enforced)
- Service role key required for automation scripts
- AI summaries sanitized to prevent data leakage
- Email alerts contain no PII
- Audit logs retained for 90 days maximum

## Roadmap

- [ ] Slack integration for real-time alerts
- [ ] Predictive failure detection with ML
- [ ] Automated remediation for common issues
- [ ] Historical trend analysis and reporting
- [ ] Integration with PagerDuty for on-call rotation
- [ ] Custom alert rules and thresholds per environment
