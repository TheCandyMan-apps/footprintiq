# Load Testing Suite

Comprehensive load and stress testing for FootprintIQ to measure system performance under concurrent load.

## Features

- **Multiple Test Scenarios**: Light, medium, heavy load configurations
- **Stress Testing**: Find system breaking point automatically
- **Real-time Metrics**: Response times, throughput, error rates
- **Percentile Analysis**: P50, P95, P99 response time tracking
- **Error Categorization**: Detailed error breakdown by type
- **Report Generation**: JSON reports with historical tracking

## Quick Start

### Run All Scenarios
```bash
npm run test:load
```

### Run Specific Scenario
```bash
npm run test:load:light    # 10 concurrent users
npm run test:load:medium   # 50 concurrent users
npm run test:load:heavy    # 100 concurrent users
```

### Stress Test (Find Breaking Point)
```bash
npm run test:stress
```

### Custom Stress Test
```bash
npm run test:stress -- --start-users 20 --max-users 300 --step 20
```

## Test Scenarios

### 1. Light Load - Scan Creation
- **Users**: 10 concurrent
- **Duration**: 30 seconds
- **Ramp-up**: 5 seconds
- **Target**: Create scan jobs

### 2. Medium Load - Scan Creation
- **Users**: 50 concurrent
- **Duration**: 60 seconds
- **Ramp-up**: 10 seconds
- **Target**: Create scan jobs

### 3. Heavy Load - Scan Creation
- **Users**: 100 concurrent
- **Duration**: 60 seconds
- **Ramp-up**: 15 seconds
- **Target**: Create scan jobs

### 4. Job Processing Load
- **Users**: 50 concurrent
- **Duration**: 45 seconds
- **Ramp-up**: 10 seconds
- **Target**: Process queued jobs

### 5. Full Scan Workflow
- **Users**: 25 concurrent
- **Duration**: 90 seconds
- **Ramp-up**: 15 seconds
- **Target**: Complete scan workflow (DB + Edge Function)

### 6. Batch Scan Stress Test
- **Users**: 20 concurrent
- **Duration**: 60 seconds
- **Ramp-up**: 10 seconds
- **Target**: Bulk scan operations

## Metrics Collected

### Request Statistics
- Total requests
- Successful requests (count & percentage)
- Failed requests (count & percentage)
- Requests per second (throughput)

### Response Time Metrics
- Average response time
- Minimum response time
- Maximum response time
- P50 (Median)
- P95 (95th percentile)
- P99 (99th percentile)

### Error Analysis
- Error count by type
- Error messages and codes
- Failure patterns

## CLI Options

### Load Test
```bash
npm run test:load -- [options]

Options:
  --list                  List all available scenarios
  --scenario <name>       Run specific scenario by name
```

### Stress Test
```bash
npm run test:stress -- [options]

Options:
  --start-users <n>       Starting number of users (default: 10)
  --max-users <n>         Maximum number of users (default: 200)
  --step <n>              Increment step (default: 10)
  --duration <n>          Duration per step in seconds (default: 30)
  --target <type>         Target type (default: scan-create)
  --threshold <n>         Success rate threshold 0-1 (default: 0.95)
  --help                  Show help
```

## Target Types

- `scan-create`: Create new scan jobs via orchestrator
- `job-process`: Process jobs from queue
- `full-scan`: Complete workflow (DB insert + enqueue)
- `batch-scan`: Bulk scan operations

## Example Output

```
📊 LOAD TEST REPORT
================================================================================

🎯 Target: scan-create
👥 Concurrent Users: 50
⏱️  Duration: 60.23s

📈 REQUEST STATISTICS:
  Total Requests:      3012
  ✅ Successful:        2987 (99.17%)
  ❌ Failed:            25 (0.83%)
  🚀 Requests/Second:   50.03

⚡ RESPONSE TIME METRICS (ms):
  Average:             245.67
  Min:                 123.45
  Max:                 1234.56
  P50 (Median):        234.12
  P95:                 456.78
  P99:                 789.01

❌ ERROR BREAKDOWN:
  NETWORK_ERROR: 15 occurrences
    └─ Connection timeout
  EDGE_FUNCTION_ERROR: 10 occurrences
    └─ Function invocation failed
```

## Reports

All test results are saved to `tests/load/reports/` with timestamp:
```
tests/load/reports/load-test-2025-11-09T12-34-56-789Z.json
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Load Tests
  run: npm run test:load

- name: Run Stress Test
  run: npm run test:stress -- --max-users 100 --duration 20

- name: Upload Reports
  uses: actions/upload-artifact@v3
  with:
    name: load-test-reports
    path: tests/load/reports/
```

## Performance Targets

### Acceptable Performance
- **Response Time**: < 500ms (P95)
- **Throughput**: > 100 req/s
- **Success Rate**: > 99%

### Warning Thresholds
- **Response Time**: 500-1000ms (P95)
- **Throughput**: 50-100 req/s
- **Success Rate**: 95-99%

### Critical Thresholds
- **Response Time**: > 1000ms (P95)
- **Throughput**: < 50 req/s
- **Success Rate**: < 95%

## Troubleshooting

### Authentication Failures
- Ensure Supabase URL and Anon Key are set
- Check network connectivity to Supabase

### High Error Rates
- Review edge function logs
- Check database connection pool
- Verify rate limiting configuration

### Timeout Issues
- Increase step duration for stress tests
- Check edge function timeout settings
- Review database query performance

## Best Practices

1. **Baseline First**: Run light load to establish baseline
2. **Gradual Ramp-up**: Always use ramp-up time
3. **Cool Down**: Wait between test runs
4. **Monitor Resources**: Watch CPU, memory, database connections
5. **Analyze Trends**: Compare reports over time

## Advanced Usage

### Custom Scenario
Create a new scenario in `run-load-test.ts`:

```typescript
{
  name: 'Custom Heavy Load',
  concurrentUsers: 150,
  duration: 120,
  rampUpTime: 20,
  target: 'full-scan',
}
```

### Programmatic Use
```typescript
import { LoadTestRunner } from './load-test-suite';

const runner = new LoadTestRunner({
  concurrentUsers: 100,
  duration: 60,
  rampUpTime: 10,
  target: 'scan-create',
});

const metrics = await runner.run();
console.log(metrics);
```

## Contributing

When adding new test targets:
1. Add simulation method to `LoadTestRunner`
2. Update target type union
3. Document in this README
4. Add example scenario

## Resources

- [Playwright Load Testing](https://playwright.dev/docs/test-annotations#tag-tests)
- [Web Performance Best Practices](https://web.dev/fast/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
