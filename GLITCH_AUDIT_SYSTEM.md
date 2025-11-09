# Glitch Audit System

Comprehensive automated testing system for premium reliability and error-free operation.

## Overview

The Glitch Audit System automatically tests your application for edge cases, validates error handling, and ensures 95%+ reliability through continuous monitoring.

## Features

### ✅ Automated Test Suite
- 10+ comprehensive test scenarios
- Edge case validation (offline workers, invalid inputs, insufficient credits)
- Security testing (authentication, rate limiting)
- Infrastructure health checks
- Real-time progress tracking

### 📊 Admin Dashboard (`/admin/audit`)
- Visual test results with charts
- Historical audit tracking
- Success rate monitoring (target: >90%)
- Detailed test breakdowns by category
- One-click audit execution

### 🚀 CLI Testing
```bash
# Run audit suite once
npm run audit:scans

# Watch mode (runs every 60s)
npm run audit:watch

# CI mode (exits with error code if <90% success)
npm run audit:ci
```

### ⏰ Scheduled Audits
Automated hourly audits via `scheduled-audit` edge function:
- Runs comprehensive test suite
- Alerts admins if success rate < 90%
- Creates bug reports for critical failures
- Tracks trends over time

## Test Categories

### 1. Scanning Tests
- Valid username scan (happy path)
- Invalid username handling
- Concurrent scan limits
- Zero results scenarios

### 2. Infrastructure Tests
- Worker health checks
- Database connectivity
- Edge function availability
- Network resilience

### 3. Security Tests
- Authentication validation
- Rate limiting enforcement
- Authorization checks
- Token validation

### 4. Credit System Tests
- Balance queries
- Credit deduction
- Insufficient credits handling
- Transaction integrity

### 5. Resource Tests
- Concurrent request handling
- Timeout management
- Memory usage validation
- Connection pooling

### 6. Monitoring Tests
- Error logging verification
- Real-time updates
- Alert system functionality
- Metrics collection

## Database Schema

### `audit_suite_runs`
Tracks each full audit execution:
- `id`: UUID primary key
- `triggered_by`: User who initiated (or system)
- `total_tests`: Number of tests run
- `passed`: Number of successful tests
- `failed`: Number of failed tests
- `warnings`: Number of warnings
- `success_rate`: Percentage (0-100)
- `duration_ms`: Execution time
- `status`: 'running' | 'completed' | 'failed'
- `created_at`: Timestamp
- `completed_at`: Completion timestamp

### `audit_results`
Individual test results:
- `id`: UUID primary key
- `test_suite_run_id`: Foreign key to audit_suite_runs
- `test_name`: Descriptive test name
- `test_category`: Category (Scanning, Security, etc.)
- `status`: 'pass' | 'fail' | 'warning'
- `duration_ms`: Test execution time
- `error_message`: Error details (if failed)
- `expected_behavior`: What should happen
- `actual_behavior`: What actually happened
- `severity`: 'critical' | 'high' | 'medium' | 'low'
- `metadata`: Additional test data (JSON)

## Edge Functions

### `audit-scans`
Main audit orchestrator:
- Runs all test scenarios in sequence
- Creates audit suite run record
- Saves individual test results
- Calculates success rate
- Returns comprehensive report

**Authentication**: Admin role required

**Response**:
```json
{
  "suite_run_id": "uuid",
  "total_tests": 10,
  "passed": 9,
  "failed": 1,
  "warnings": 0,
  "success_rate": 90.0,
  "duration_ms": 5432,
  "results": [...]
}
```

### `scheduled-audit`
Automated audit runner:
- Runs on schedule (cron)
- Creates temporary admin session
- Invokes `audit-scans`
- Alerts on failures (<90% success)
- Creates bug reports for issues

## CI/CD Integration

GitHub Actions workflow (`.github/workflows/test.yml`):
```yaml
- name: Run Glitch Audit
  run: npm run audit:ci
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

Runs on every push to ensure no regressions are deployed.

## Success Criteria

| Metric | Threshold | Action |
|--------|-----------|--------|
| Success Rate | ≥ 90% | Pass ✅ |
| Success Rate | 80-89% | Warning ⚠️ |
| Success Rate | < 80% | Fail ❌ |
| Critical Test Failure | Any | Alert 🚨 |

## Alert Thresholds

- **Critical**: Any critical severity test fails
- **High**: Success rate < 80%
- **Medium**: Success rate < 90%
- **Low**: Warnings detected but >90% success

## Usage Examples

### Manual Audit from Dashboard
1. Navigate to `/admin/audit`
2. Click "Run Audit Suite"
3. View real-time results
4. Review detailed test breakdowns
5. Check historical trends

### CLI Audit
```bash
# Quick test
npm run audit:scans

# Output:
# 🔍 Starting audit suite...
# 
# 📊 Audit Results:
# ──────────────────────────────────────────────────
# Suite Run ID: abc123...
# Total Tests: 10
# ✓ Passed: 10
# ✗ Failed: 0
# ⚠ Warnings: 0
# Success Rate: 100%
# Duration: 5.43s
# ──────────────────────────────────────────────────
#
# ✅ Audit PASSED! Success rate: 100%
# 🎉 Perfect score! All tests passed.
```

### Scheduled Audit Setup
To enable automated audits, set up a cron job:

```sql
-- Run audit every hour
SELECT cron.schedule(
  'hourly-audit',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_post(
    url:='https://[your-project].supabase.co/functions/v1/scheduled-audit',
    headers:='{"Authorization": "Bearer [your-anon-key]"}'::jsonb
  );
  $$
);
```

## Monitoring Best Practices

1. **Daily Dashboard Review**: Check `/admin/audit` daily for trends
2. **Investigate Failures**: Review failed tests immediately
3. **Track Success Rate**: Maintain >95% for production confidence
4. **Review Warnings**: Address warnings before they become failures
5. **Historical Analysis**: Look for patterns in audit history

## Troubleshooting

### Low Success Rate
1. Check `/admin/health` for worker status
2. Review recent deployments
3. Check error logs in `/admin/glitches`
4. Verify API keys and secrets are valid

### Test Failures
1. Review `error_message` in audit results
2. Check `expected_behavior` vs `actual_behavior`
3. Verify environment configuration
4. Test manually to reproduce issue

### Audit Won't Run
1. Verify admin permissions
2. Check edge function deployment status
3. Review browser console for errors
4. Verify database connectivity

## Performance Impact

- **Audit Duration**: ~5-10 seconds
- **Database Load**: Minimal (10-15 queries)
- **API Calls**: ~10 edge function invocations
- **Resource Usage**: Low (parallel test execution)

## Security Considerations

- ✅ Admin-only access to audit functions
- ✅ RLS policies on audit tables
- ✅ No sensitive data in test results
- ✅ Secure token handling
- ✅ Rate limiting on audit endpoints

## Future Enhancements

### Phase 2
- Email notifications for failed audits
- Slack/Discord webhook alerts
- Custom test scenarios via UI
- Performance benchmarking
- Load testing integration

### Phase 3
- ML-based anomaly detection
- Predictive failure analysis
- Auto-fix recommendations
- Self-healing capabilities
- Multi-region testing

## Support

For issues or questions about the Glitch Audit System:
1. Review audit results in `/admin/audit`
2. Check error logs in `/admin/glitches`
3. Run manual CLI audit for detailed output
4. Review this documentation

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: 2025-01-09
