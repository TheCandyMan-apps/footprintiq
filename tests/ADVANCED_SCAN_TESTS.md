# Advanced Scan E2E Test Suite

## Overview
Comprehensive end-to-end testing for advanced scanning features, including edge cases, error handling, and progress monitoring. Target: **>95% pass rate** for premium launch confidence.

## Test Coverage

### 1. Full Premium Scan Flow (NEW)
- ✅ **Complete sign-in → multi-tool → results flow**
- ✅ **Multi-provider orchestration** (HIBP, Maigret, SpiderFoot)
- ✅ **Real-time progress tracking** with stage updates
- ✅ **Results aggregation** with provider breakdown
- ✅ **Credit usage and duration metrics** display

### 2. Batch Upload & Geocoding
- ✅ Batch mode toggle for email scans
- ✅ CSV file upload with item display
- ✅ Map preview for IP batch scans
- ✅ Dark web policy warnings
- ✅ CSV format validation and invalid entry rejection
- ✅ Premium subscription enforcement
- ✅ Geocoding error handling
- ✅ Dynamic scan button text

### 3. Premium Subscription Enforcement (NEW)
- ✅ **Free user restrictions** - Dark web, face recognition blocked
- ✅ **Upgrade CTAs** - Direct navigation to pricing
- ✅ **Feature gating** - Premium-only capabilities disabled

### 4. Error Handling
- ✅ Error toast display for failed scans
- ✅ Authentication requirement enforcement

### 5. Edge Cases: Offline Worker (ENHANCED)
- ✅ **Offline Maigret worker** - Graceful handling with retry suggestions
- ✅ **Offline SpiderFoot worker** - Fallback to partial results
- ✅ **Progress popup display** - Real-time scan progress updates
- ✅ **Retry with exponential backoff** - Automatic retry on worker failure

### 6. Edge Cases: Zero Results (ENHANCED)
- ✅ **Zero results from Maigret** - User-friendly empty state
- ✅ **AI-powered rescan suggestions** - Smart alternative queries
- ✅ **Partial zero results** - Mixed success/failure across tools
- ✅ **Empty state with actions** - Helpful CTAs for users

### 7. Progress & Results Display (ENHANCED)
- ✅ **Real-time progress updates** - Multiple stages with messages
- ✅ **Findings count and summary** - Category breakdown in results
- ✅ **Scan duration and credits** - Performance metrics display

## Mock Implementations

### Maigret Worker Mocks
```typescript
// Offline worker
route.fulfill({
  status: 503,
  body: JSON.stringify({ 
    error: 'Worker unavailable',
    message: 'Maigret scan worker is currently offline'
  })
});

// Zero results
route.fulfill({
  status: 200,
  body: JSON.stringify({
    scanId: 'test-scan-empty',
    status: 'completed',
    results: []
  })
});
```

### SpiderFoot Worker Mocks
```typescript
// Timeout scenario
route.fulfill({
  status: 503,
  body: JSON.stringify({ 
    error: 'Service unavailable',
    message: 'SpiderFoot worker timeout'
  })
});
```

### Progress Tracking Mocks
```typescript
// Multi-stage progress
const progressStages = [
  { progress: 10, message: 'Initializing scan...' },
  { progress: 30, message: 'Querying Maigret...' },
  { progress: 60, message: 'Processing social media...' },
  { progress: 85, message: 'Analyzing results...' },
  { progress: 100, message: 'Scan complete!' }
];
```

## Unit Tests - Edge Cases

### Zero Results (`tests/edge-cases/zero-results.test.ts`)
- ✅ Graceful zero result handling from Maigret
- ✅ AI-powered rescan suggestions with alternative queries
- ✅ Partial zero results across multiple providers
- ✅ Empty state with helpful user actions
- ✅ Zero-result rate tracking for quality monitoring

### Provider Timeouts (`tests/edge-cases/provider-timeouts.test.ts`)
- ✅ SpiderFoot timeout handling (30s limit)
- ✅ Exponential backoff retry logic
- ✅ Partial results when one provider times out
- ✅ Timeout rate monitoring for health checks
- ✅ Result caching to prevent redundant API calls

## Running Tests

### All Tests
```bash
npm run test:e2e              # All E2E tests
npm run test:run              # All unit tests
```

### Advanced Scan Tests Only
```bash
# E2E tests
npx playwright test tests/e2e/advanced-scan.spec.ts --project=chromium

# Unit tests - Edge cases
npm run test -- tests/edge-cases/zero-results.test.ts
npm run test -- tests/edge-cases/provider-timeouts.test.ts
```

### Specific Test Suite
```bash
npx playwright test tests/advanced-scan.spec.ts -g "Edge Cases: Offline Worker"
```

### Watch Mode (Development)
```bash
npx playwright test tests/advanced-scan.spec.ts --ui
```

### Debug Mode
```bash
npx playwright test tests/advanced-scan.spec.ts --debug
```

## CI/CD Integration

Tests run automatically on:
- All pushes to main, develop, tests, test-auto-thrive branches
- Pull requests to main and develop
- Manual workflow dispatch

### CI Configuration
Tests are configured in `playwright.config.ts` and `.github/workflows/test.yml`:
- **Test Directory**: `./tests/e2e`
- **Parallel Execution**: Enabled
- **Retries**: 2 (in CI), 0 (locally)
- **Workers**: 1 (CI), unlimited (local)
- **Base URL**: `http://localhost:5173`
- **Browsers**: Chromium, Firefox, WebKit

### Pass Rate Requirement
**Target: >95%**

CI automatically calculates test pass rate:
```bash
PASS_RATE = (PASSED / TOTAL) × 100

if PASS_RATE < 95%:
  ❌ CI fails - blocks deployment
else:
  ✅ CI passes - deployment approved
```

### CI Artifacts
On test failure, the following artifacts are saved:
- HTML test report
- Screenshots (only on failure)
- Video recordings
- Trace files (on first retry)

## Test Assertions

### Progress Assertions
```typescript
// Progress bar visibility
await expect(page.locator('[role="progressbar"]')).toBeVisible();

// Progress messages
await expect(page.getByText(/initializing/i)).toBeVisible();
await expect(page.getByText(/complete/i)).toBeVisible();
```

### Results Assertions
```typescript
// Findings count
await expect(page.getByText(/3.*findings/i)).toBeVisible();

// Category breakdown
await expect(page.getByText(/social media.*2/i)).toBeVisible();

// Scan metrics
await expect(page.getByText(/45.*seconds/i)).toBeVisible();
await expect(page.getByText(/15.*credits/i)).toBeVisible();
```

### Error Assertions
```typescript
// Worker offline
await expect(page.getByText(/worker.*offline/i)).toBeVisible();

// Zero results
await expect(page.getByText(/no results found/i)).toBeVisible();

// Retry indicator
await expect(page.getByText(/retrying|attempt/i)).toBeVisible();
```

## Edge Cases Covered

### Worker Failures
1. **Complete Offline** - Worker returns 503 error
2. **Timeout** - Worker takes too long to respond
3. **Intermittent Failure** - Succeeds after retries
4. **Partial Failure** - Some tools succeed, others fail

### Zero Results Scenarios
1. **Complete Empty** - All tools return no results
2. **Partial Empty** - Some tools return results, others don't
3. **Invalid Target** - Target doesn't exist anywhere
4. **AI Suggestions** - Smart alternatives offered

### Progress Tracking
1. **Multi-stage Updates** - Progress bar moves through stages
2. **Status Messages** - Clear user communication
3. **Completion States** - Success, failure, partial
4. **Duration Tracking** - Scan timing displayed

## Troubleshooting

### Tests Failing Locally
```bash
# Clear Playwright cache
npx playwright install --force

# Update browsers
npx playwright install

# Check dev server
npm run dev
```

### Tests Passing Locally but Failing in CI
- Check CI environment variables
- Verify base URL configuration
- Review CI logs for timeout issues
- Increase timeout values if needed

### Mock Not Working
- Verify route pattern matches actual endpoint
- Check request method (GET/POST)
- Ensure mock is registered before action
- Use `page.route` not `page.context().route()`

## Quality Metrics

### Current Status
- **Pass Rate Target**: >95%
- **E2E Test Coverage**: 10+ scenarios
- **Unit Test Coverage**: 10+ edge cases
- **CI Integration**: ✅ Automated
- **Auto-Deploy**: ✅ On test-auto-thrive branch

### Monitoring
- Track pass rates over time in CI logs
- Monitor timeout patterns for provider health
- Analyze zero-result frequencies
- Review flaky test trends

## Future Enhancements

- [ ] Add performance benchmarks (response times)
- [ ] Test batch scans with 100+ items
- [ ] Simulate network throttling scenarios
- [ ] Add visual regression testing
- [ ] Test real-time updates with WebSockets
- [ ] Add load testing for concurrent scans
- [ ] Implement chaos engineering tests

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Use descriptive test names
3. Add comments for complex mocks
4. Update this README with new coverage
5. Ensure tests run in CI environment
6. Keep tests independent and idempotent
