# AI Glitch Detection System

## Overview

AI-powered glitch detection system that analyzes audit logs using Grok to detect patterns, anomalies, and provide actionable fixes. Automatically alerts administrators when failure rates exceed thresholds.

## Features

### 1. **Intelligent Pattern Detection**
- Analyzes audit logs with Grok AI (via X.ai API)
- Detects recurring failure patterns
- Identifies systemic issues across test categories
- Provides severity-based prioritization

### 2. **Automated Alerting**
- Triggers email alerts when failure rate > 5%
- Sends to admin@footprintiq.app
- Includes AI analysis summary with fixes
- Beautiful HTML email formatting

### 3. **Risk Assessment**
- Calculates overall system health risk
- Categories: Low, Medium, High, Critical
- Based on failure patterns and impact

### 4. **Actionable Recommendations**
- Specific fix suggestions with implementation steps
- Prioritized list of critical issues
- Root cause analysis
- Preventive measures

## Architecture

### Edge Functions

#### `ai-glitch-detection`
Analyzes audit logs using Grok AI:
- **Input**: Audit logs and run metadata
- **Process**: Calls Grok API for pattern detection
- **Output**: JSON with patterns, anomalies, fixes, and risk assessment
- **Model**: `grok-beta`

#### `send-glitch-alert`
Sends email alerts via Resend:
- **Input**: Audit results and AI analysis
- **Process**: Formats HTML email with charts and recommendations
- **Output**: Email delivery confirmation
- **Recipient**: admin@footprintiq.app

### Frontend Integration

**Admin Audit Dashboard** (`/admin/audit`)
- "AI Analysis" button to trigger analysis on-demand
- Collapsible sections for:
  - Priority Issues (🚨)
  - Detected Patterns (📊)
  - Anomalies (⚠️)
  - Suggested Fixes (🔧)
- Risk assessment visualization
- Alert status badge

## Usage

### Manual Analysis

1. Navigate to `/admin/audit`
2. Run an audit suite
3. Click "AI Analysis" button
4. View AI-generated insights and recommendations

### Automatic Alerting

Alerts are sent automatically when:
- Failure rate exceeds 5%
- Success rate drops below 95%
- Critical tests fail

### Testing

```bash
# Run AI glitch detection tests
npm run test:ai-glitches

# Tests include:
# - Mock log analysis
# - Pattern detection
# - Alert threshold validation
# - Fix recommendation verification
```

## API Response Format

```typescript
{
  analysis: {
    patterns: [
      {
        description: string,
        severity: 'low' | 'medium' | 'high' | 'critical'
      }
    ],
    anomalies: [
      {
        description: string,
        impact: string
      }
    ],
    fixes: [
      {
        description: string,
        steps: string[]
      }
    ],
    priority_issues: [
      {
        description: string,
        severity: string
      }
    ],
    risk_assessment: 'low' | 'medium' | 'high' | 'critical'
  },
  metadata: {
    failure_rate: number,
    should_alert: boolean,
    analyzed_at: string,
    log_count: number
  }
}
```

## Alert Email Structure

### Header
- 🚨 Alert badge
- Timestamp
- Severity indicator

### Stats Grid
- Success Rate
- Failure Rate
- Failed Tests Count
- Total Tests Count

### AI Analysis Sections
1. **Risk Assessment** - Overall health status
2. **Priority Issues** - Critical items requiring immediate attention
3. **Detected Patterns** - Recurring problems
4. **Anomalies** - Unusual behaviors
5. **Suggested Fixes** - Step-by-step remediation

### Footer
- Audit ID for reference
- Link to admin dashboard

## Alert Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Failure Rate | > 5% | Send alert email |
| Success Rate | < 95% | Send alert email |
| Failed Tests | Any critical | Include in priority issues |
| Duration | > expected | Flag as anomaly |

## Configuration

### Required Secrets
- `GROK_API_KEY` - X.ai Grok API key
- `RESEND_API_KEY` - Resend email API key

### Email Settings
- **From**: alerts@footprintiq.app
- **To**: admin@footprintiq.app
- **Subject**: Includes failure rate
- **Format**: HTML with inline styles

## Best Practices

1. **Regular Analysis**: Run AI analysis after every audit
2. **Investigate Patterns**: Address recurring issues first
3. **Monitor Trends**: Track risk_assessment over time
4. **Act on Fixes**: Implement suggested fixes promptly
5. **Review Alerts**: Check email alerts within 15 minutes

## Troubleshooting

### AI Analysis Fails
```bash
# Check Grok API key
echo $GROK_API_KEY

# View edge function logs
supabase functions logs ai-glitch-detection

# Test with curl
curl -X POST https://your-project.supabase.co/functions/v1/ai-glitch-detection \
  -H "Content-Type: application/json" \
  -d '{"logs": [], "auditRun": {...}}'
```

### Email Not Received
```bash
# Check Resend API key
echo $RESEND_API_KEY

# Verify domain configuration in Resend dashboard
# Check spam folder
# View edge function logs
supabase functions logs send-glitch-alert
```

### No Patterns Detected
- Increase log sample size
- Ensure logs contain error_message fields
- Check that failures exist in dataset
- Review Grok API response format

## Integration with CI/CD

The AI analysis can be integrated into CI/CD pipelines:

```yaml
# .github/workflows/audit.yml
- name: Run Audit with AI Analysis
  run: |
    npm run audit:ci
    npm run test:ai-glitches
```

## Future Enhancements

- [ ] Historical trend analysis
- [ ] Predictive failure detection
- [ ] Automated fix deployment
- [ ] Slack/Discord integration
- [ ] Custom alert rules
- [ ] Dashboard for AI insights
- [ ] Root cause visualization
- [ ] A/B test recommendations

## Metrics Tracked

- Failure rate percentage
- Pattern detection accuracy
- Alert response time
- Fix implementation rate
- Risk level distribution
- Email delivery success

## Cost Optimization

- Use Grok beta (cost-effective)
- Batch log analysis
- Cache AI responses (1 hour)
- Limit email frequency (1 per hour max)
- Compress log data before sending

## Security Considerations

- API keys stored in Supabase secrets
- Email sent via authenticated channel
- No sensitive data in logs
- CORS enabled for admin dashboard only
- RLS policies on audit tables
