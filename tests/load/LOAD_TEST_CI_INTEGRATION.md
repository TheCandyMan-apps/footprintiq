# Load Test CI/CD Integration Guide

## Overview
This document describes how load tests are integrated into the CI/CD pipeline and how to interpret results.

## Automatic Triggers

### 1. Manual Workflow Dispatch
Trigger load tests manually from GitHub Actions:

1. Go to **Actions** → **Load Tests**
2. Click **Run workflow**
3. Select options:
   - **Scenario**: all, light, medium, heavy, or stress
   - **Max Users**: (for stress tests only)

### 2. Scheduled Runs
Load tests run automatically:
- **Weekly**: Every Sunday at 2 AM UTC
- **Purpose**: Monitor performance trends over time

### 3. Branch-Based Triggers
Tests run automatically on branches matching:
- `load-test-*`
- Example: `load-test-new-feature`

## CI Workflow Steps

### 1. Setup
- Checkout code
- Install Node.js 20
- Install dependencies

### 2. Execute Tests
- Set environment variables (Supabase URL, Anon Key)
- Run selected scenario
- Generate performance reports

### 3. Artifact Upload
- Save JSON reports to GitHub artifacts
- Retention: 30 days
- Download via Actions → Workflow Run → Artifacts

### 4. Performance Check
- Parse latest report
- Check against thresholds:
  - ✅ Success rate ≥ 99%
  - ⚠️  P95 response time ≤ 500ms (warning)
  - ⚠️  Throughput ≥ 50 req/s (warning)

### 5. PR Comments (if applicable)
Automatically posts results to PR with:
- Requests per second
- Success rate
- Average response time
- P95 response time

## Environment Variables Required

Add these secrets to GitHub repository:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## Reading Test Results

### Success Metrics
```
✅ Successful Scenarios: 6/6
📊 PERFORMANCE COMPARISON:

Scenario                                 RPS            Avg RT (ms)    P95 RT (ms)
--------------------------------------------------------------------------------
Light Load - Scan Creation              45.23          234.56         456.78
Medium Load - Scan Creation             52.34          345.67         567.89
Heavy Load - Scan Creation              48.12          456.78         789.01
```

### Failure Indicators
- Success rate < 99%
- P95 response time > 500ms consistently
- Error rate > 1%
- System crashes or timeouts

## Performance Baselines

### Expected Performance (Healthy System)
| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Success Rate | ≥ 99% | 95-99% | < 95% |
| P95 Response Time | ≤ 500ms | 500-1000ms | > 1000ms |
| Throughput | ≥ 100 req/s | 50-100 req/s | < 50 req/s |
| Error Rate | ≤ 1% | 1-5% | > 5% |

### Scenario-Specific Targets
| Scenario | Users | Expected RPS | Expected P95 RT |
|----------|-------|--------------|-----------------|
| Light Load | 10 | 40-60 | < 300ms |
| Medium Load | 50 | 100-150 | < 500ms |
| Heavy Load | 100 | 150-200 | < 800ms |

## Interpreting Stress Test Results

### Breaking Point Analysis
```
💥 Breaking Point: 120 concurrent users
✅ Stable Capacity: 110 concurrent users

📈 LOAD PROGRESSION:
Users     RPS            Avg RT (ms)    Success Rate   Status
------------------------------------------------------------------------
10        42.50          234.12         100.00%        ✅ Stable
20        85.20          245.67         100.00%        ✅ Stable
...
110       187.34         498.45         99.12%         ✅ Stable
120       156.78         1234.56        93.45%         ❌ Degraded
```

### Key Indicators
1. **Breaking Point**: Where success rate drops below 95%
2. **Stable Capacity**: Last point before degradation
3. **Performance Degradation**: RT increase percentage
4. **Throughput Impact**: RPS change under load

## Using Results for Optimization

### High Response Times
**Symptoms**: P95 > 500ms consistently

**Investigate**:
- Edge function execution time
- Database query performance
- Network latency
- External API calls

**Actions**:
- Add caching layer
- Optimize database queries
- Increase function resources
- Implement connection pooling

### Low Throughput
**Symptoms**: RPS < 50

**Investigate**:
- CPU/Memory constraints
- Database connection limits
- Rate limiting configuration
- Worker availability

**Actions**:
- Scale edge functions
- Increase connection pool
- Optimize resource allocation
- Review rate limits

### High Error Rates
**Symptoms**: Success rate < 99%

**Investigate**:
- Error logs in reports
- Edge function failures
- Authentication issues
- Timeout configuration

**Actions**:
- Fix failing endpoints
- Increase timeouts
- Improve error handling
- Add retry mechanisms

## Historical Trend Analysis

### Tracking Performance Over Time
1. Download artifacts from past runs
2. Compare metrics week-over-week
3. Look for:
   - Response time trends (increasing = concerning)
   - Throughput degradation
   - New error patterns
   - Breaking point changes

### Example Analysis
```bash
# Compare this week vs last week
./scripts/compare-reports.sh \
  reports/load-test-2025-11-02.json \
  reports/load-test-2025-11-09.json
```

## Troubleshooting CI Failures

### Test Fails in CI but Passes Locally
- Check environment variables
- Verify Supabase connection
- Review CI resource limits
- Check network restrictions

### Timeout Issues
- Increase workflow timeout in `.yml`
- Reduce test duration
- Lower concurrent users
- Check edge function timeout settings

### Flaky Tests
- Review success rate variability
- Check for rate limiting
- Verify database capacity
- Look for external dependencies

## Best Practices

### Before Merging
1. Run load tests on feature branch
2. Compare against main branch baseline
3. Ensure no performance regression
4. Review and fix any new errors

### Regular Monitoring
1. Check weekly scheduled runs
2. Track performance trends
3. Update baselines as system improves
4. Document capacity changes

### When Scaling
1. Run stress tests to find new limits
2. Update capacity documentation
3. Adjust threshold alerts
4. Plan for growth

## Alert Configuration

### GitHub Actions
Currently notifies via:
- Workflow failure status
- PR comments (if applicable)

### Future Enhancements
Add integrations for:
- Slack notifications
- Email alerts
- PagerDuty incidents
- Custom webhooks

Example Slack webhook:
```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Load tests failed - Check workflow for details"
      }
```

## Maintenance

### Updating Thresholds
Edit in workflow file (`.github/workflows/load-tests.yml`):
```yaml
if (( $(echo "$SUCCESS_RATE < 99" | bc -l) )); then
  # Change 99 to new threshold
fi
```

### Adding New Scenarios
1. Add to `tests/load/run-load-test.ts`
2. Update workflow inputs
3. Document expected performance
4. Update this guide

### Reviewing Reports
Schedule regular reviews:
- **Weekly**: Check automated run results
- **Monthly**: Analyze trends and baselines
- **Quarterly**: Update capacity planning

## Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Load Testing Best Practices](https://k6.io/docs/testing-guides/load-testing/)
- [Performance Testing Guide](https://web.dev/performance-scoring/)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
