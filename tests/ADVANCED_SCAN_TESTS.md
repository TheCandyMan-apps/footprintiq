# Advanced Scan E2E Test Suite

## Overview
Comprehensive end-to-end testing for advanced scanning features, including edge cases, error handling, and progress monitoring.

## Test Coverage

### 1. Batch Upload & Geocoding
- ✅ Batch mode toggle for email scans
- ✅ CSV file upload with item display
- ✅ Map preview for IP batch scans
- ✅ Dark web policy warnings
- ✅ CSV format validation and invalid entry rejection
- ✅ Premium subscription enforcement
- ✅ Geocoding error handling
- ✅ Dynamic scan button text

### 2. Error Handling
- ✅ Error toast display for failed scans
- ✅ Authentication requirement enforcement

### 3. Edge Cases: Offline Worker (NEW)
- ✅ **Offline Maigret worker** - Graceful handling with retry suggestions
- ✅ **Offline SpiderFoot worker** - Fallback to partial results
- ✅ **Progress popup display** - Real-time scan progress updates
- ✅ **Retry with exponential backoff** - Automatic retry on worker failure

### 4. Edge Cases: Zero Results (NEW)
- ✅ **Zero results from Maigret** - User-friendly empty state
- ✅ **AI-powered rescan suggestions** - Smart alternative queries
- ✅ **Partial zero results** - Mixed success/failure across tools
- ✅ **Empty state with actions** - Helpful CTAs for users

### 5. Progress & Results Display (NEW)
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

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Advanced Scan Tests Only
```bash
npx playwright test tests/advanced-scan.spec.ts
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
- All pushes to main branches
- Pull requests
- Manual workflow dispatch

### CI Configuration
Tests are configured in `playwright.config.ts`:
- **Test Directory**: `./tests/e2e`
- **Parallel Execution**: Enabled
- **Retries**: 2 (in CI), 0 (locally)
- **Workers**: 1 (CI), unlimited (local)
- **Base URL**: `http://localhost:5173`
- **Browsers**: Chromium, Firefox, WebKit

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

## Future Enhancements

- [ ] Add performance benchmarks
- [ ] Test batch scans with 100+ items
- [ ] Simulate network throttling
- [ ] Add visual regression testing
- [ ] Test real-time updates with WebSockets
- [ ] Add load testing for concurrent scans

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Use descriptive test names
3. Add comments for complex mocks
4. Update this README with new coverage
5. Ensure tests run in CI environment
6. Keep tests independent and idempotent
