# E2E Testing Automation Guide

## Overview

Comprehensive end-to-end testing suite for FootprintIQ using Playwright with full CI/CD integration.

## Test Coverage

### Authentication Flow
- ✅ Redirect unauthenticated users
- ✅ Complete sign-in process
- ✅ Session persistence

### Username Scan Flow
- ✅ Full scan workflow (input → processing → results)
- ✅ Empty results handling
- ✅ Timeout errors
- ✅ Rate limiting
- ✅ Network failures

### Advanced Scan Options
- ✅ Configure advanced features
- ✅ Premium feature gating
- ✅ Multiple scan targets

### Results Page
- ✅ Display findings
- ✅ Export to PDF
- ✅ Navigation controls
- ✅ Severity indicators

### Credit System
- ✅ Display balance
- ✅ Low balance warnings
- ✅ Insufficient credits handling

### Error Boundaries
- ✅ Component error recovery
- ✅ Network failure handling
- ✅ Invalid data handling

## Running Tests

### Local Development

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npm run test:e2e:scan

# Debug specific test
npx playwright test tests/e2e/scan-flow.spec.ts --debug
```

### CI/CD Pipeline

Tests run automatically on:
- Push to `main`, `develop`, `tests`, or `test-auto-thrive` branches
- Pull requests to `main` or `develop`

#### Pipeline Stages

1. **Unit Tests** - Vitest tests for components and utilities
2. **E2E Tests** - Playwright tests for full user flows
3. **Coverage** - Upload to Codecov
4. **Deploy** - Auto-deploy on `test-auto-thrive` branch after all tests pass

## Mock System

### Supabase Mocks

```typescript
import { mockAuth, mockDatabase, mockEdgeFunction } from './tests/setup/playwright-mocks';

// Mock authenticated user
await mockAuth(page, true);

// Mock database response
await mockDatabase(page, 'profiles', {
  body: [{ credits_balance: 100 }]
});

// Mock edge function
await mockEdgeFunction(page, 'username-scan', {
  body: { findings: [...] }
});
```

### Apify Mocks

```typescript
import { mockApifyClient, mockApifyEmpty, mockApifyTimeout } from './tests/mocks/apify';

// Mock successful Apify response
test('should handle Apify results', async () => {
  // Apify mocks are set up in the edge function tests
});
```

### Common Scenarios

```typescript
// Empty results
await mockEmptyScan(page);

// Timeout
await mockScanTimeout(page);

// Rate limiting
await mockRateLimiting(page);

// Network failure
await mockNetworkFailure(page);

// Low credits
await mockUserProfile(page, 25, false);
```

## Test Structure

```
tests/
├── e2e/
│   ├── scan-flow.spec.ts       # Main scan flow tests
│   ├── credit-purchase.spec.ts # Credit purchase flow
│   └── subscription-upgrade.spec.ts # Subscription tests
├── mocks/
│   ├── apify.ts               # Apify mocks for unit tests
│   └── supabase.ts            # Supabase mocks for unit tests
└── setup/
    └── playwright-mocks.ts    # Playwright mock utilities
```

## Edge Cases Covered

### Authentication
- ❌ No session - Redirect to auth
- ❌ Expired token - Auto-refresh
- ❌ Invalid credentials - Show error

### Scanning
- ⚠️ Empty results - Show "no findings" message
- ⚠️ Timeout (>30s) - Show timeout error with retry
- ⚠️ Rate limit - Show rate limit message
- ⚠️ Network failure - Show network error with retry

### Credits
- ⚠️ Low balance (<50) - Show warning toast
- ❌ Zero balance - Prevent scan, prompt to purchase
- ❌ Premium feature - Show upgrade prompt

### Results
- ⚠️ Invalid scan ID - Show error boundary
- ✅ Multiple findings - Display all with proper severity
- ✅ Export - Generate PDF with all data

## CI/CD Configuration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
on:
  push:
    branches: [main, develop, tests, test-auto-thrive]

jobs:
  test:
    - Install dependencies
    - Install Playwright browsers
    - Run unit tests
    - Run E2E tests
    - Upload results
    
  deploy:
    needs: test
    if: branch == test-auto-thrive
    - Auto-deploy to production
```

## Auto-Deploy Branch

### test-auto-thrive

This branch triggers automatic deployment after all tests pass:

1. Push to `test-auto-thrive`
2. CI runs all tests (unit + E2E)
3. If all tests pass ✅
4. Auto-deploy to production 🚀

```bash
# Create and push to auto-deploy branch
git checkout -b test-auto-thrive
git push origin test-auto-thrive
```

## Test Artifacts

### Playwright Report

After each CI run:
- HTML report generated
- Screenshots on failure
- Video recordings (on first retry)
- Trace files for debugging

Access artifacts in GitHub Actions → Run → Artifacts → `playwright-report`

## Best Practices

### Writing Tests

1. **Use descriptive test names**
   ```typescript
   test('should display low credit warning when balance < 50', ...)
   ```

2. **Setup consistent mocks**
   ```typescript
   test.beforeEach(async () => {
     await setupTestEnvironment(page, { credits: 100 });
   });
   ```

3. **Wait for actual conditions**
   ```typescript
   await expect(page.locator('text=Results')).toBeVisible();
   // Not: await page.waitForTimeout(5000);
   ```

4. **Test user flows, not implementation**
   ```typescript
   // Good: Test what user sees
   await expect(page.locator('text=Profile Found')).toBeVisible();
   
   // Bad: Test internal state
   expect(window.__scanState).toBe('complete');
   ```

### Debugging Failed Tests

```bash
# Run with UI mode
npm run test:e2e:ui

# Run in headed mode with slow motion
npx playwright test --headed --slow-mo=1000

# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Monitoring

### Test Metrics

Track in CI dashboard:
- ✅ Test pass rate
- ⏱️ Execution time
- 📊 Coverage percentage
- 🐛 Flaky test detection

### Notifications

Tests failures trigger:
- GitHub Actions notification
- Codecov report
- Artifact upload for debugging

## Maintenance

### Updating Tests

When adding new features:
1. Add E2E test in `tests/e2e/scan-flow.spec.ts`
2. Add mocks if needed in `tests/mocks/` or `tests/setup/`
3. Update this README with new coverage
4. Test locally before pushing

### Mock Updates

When APIs change:
1. Update mock responses in `tests/setup/playwright-mocks.ts`
2. Update Apify mocks in `tests/mocks/apify.ts`
3. Update Supabase mocks in `tests/mocks/supabase.ts`
4. Verify all tests still pass

## Troubleshooting

### Tests Failing Locally

```bash
# Clear Playwright cache
npx playwright install --force

# Update browsers
npx playwright install chromium --with-deps

# Check config
cat playwright.config.ts
```

### Tests Failing in CI

1. Check GitHub Actions logs
2. Download playwright-report artifact
3. Review screenshots/videos
4. Check for timing issues (increase timeouts if needed)

## Resources

- [Playwright Documentation](https://playwright.dev)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Vitest Documentation](https://vitest.dev)
- [Project Testing Guide](./TESTING_GUIDE.md)

## Support

For issues or questions:
1. Check this README
2. Review test logs in CI
3. Check Playwright docs
4. Open issue with test output
