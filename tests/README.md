# FootprintIQ Test Suite

Comprehensive test coverage for scan APIs, results parsing, and removal submissions using Vitest.

## 🚀 Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Generate coverage report
npm run test:coverage
```

## 📁 Test Structure

```
tests/
├── setup.ts                  # Test environment setup & Supabase mocks
├── scan-api.test.ts          # Scan creation, retrieval, edge functions
├── results-parsing.test.ts   # HIBP, Hunter, AbuseIPDB normalization
├── removal-submission.test.ts # Removal request flows
└── edge-cases.test.ts        # Rate limits, empty results, errors
```

## 🧪 Test Coverage

### Scan API (`scan-api.test.ts`)
- ✅ Scan creation with valid/invalid emails
- ✅ Workspace context handling
- ✅ Scan retrieval by ID
- ✅ Edge function invocation (scan-orchestrate)
- ✅ Findings retrieval
- ✅ Empty results handling
- ✅ Rate limit errors
- ✅ Function timeouts

### Results Parsing (`results-parsing.test.ts`)
- ✅ HIBP breach data normalization
- ✅ Hunter.io domain search results
- ✅ AbuseIPDB IP reputation data
- ✅ Empty result sets
- ✅ Malformed JSON handling
- ✅ Special character sanitization
- ✅ Severity calculation

### Removal Submission (`removal-submission.test.ts`)
- ✅ Removal request creation
- ✅ Status tracking
- ✅ Duplicate prevention
- ✅ Automated removal execution
- ✅ Partial success handling
- ✅ Provider API errors
- ✅ Concurrent requests

### Edge Cases (`edge-cases.test.ts`)
- ✅ Rate limiting (429 errors)
- ✅ Exponential backoff
- ✅ Empty results
- ✅ Network timeouts
- ✅ Connection refused
- ✅ DNS resolution failures
- ✅ SQL injection prevention
- ✅ Input validation
- ✅ Concurrent operations
- ✅ Resource exhaustion

## 🔧 Mocking Strategy

All Supabase interactions are mocked using Vitest:

```typescript
import { supabase } from '@/integrations/supabase/client';
import { vi } from 'vitest';

// Mock is automatically set up in tests/setup.ts
vi.mocked(supabase.from).mockReturnValue({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  // ...
});
```

## 🎯 Pre-commit Hook

Tests run automatically before each commit:
1. Secret pattern detection
2. Test suite execution
3. Auto-commit test results to `tests` branch

Disable with: `git commit --no-verify`

## 📊 CI/CD

GitHub Actions workflow (`.github/workflows/test.yml`):
- Runs on push to `main`, `develop`, `tests` branches
- Runs on pull requests
- Generates coverage reports
- Uploads to Codecov

## 🛠️ Writing New Tests

### Example Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('My Feature', () => {
  it('should do something', async () => {
    // Arrange
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    } as any);

    // Act
    const result = await myFunction();

    // Assert
    expect(result).toBeDefined();
  });
});
```

## 📈 Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

View coverage: `npm run test:coverage` → open `coverage/index.html`

## 🐛 Debugging Tests

```bash
# Run specific test file
npx vitest scan-api.test.ts

# Run tests matching pattern
npx vitest -t "should create scan"

# Debug with inspector
node --inspect-brk ./node_modules/.bin/vitest
```

## 📝 Best Practices

1. **Isolate tests**: Each test should be independent
2. **Mock external dependencies**: Use Vitest mocks
3. **Test edge cases**: Empty data, errors, rate limits
4. **Clear assertions**: Use descriptive expect messages
5. **Clean up**: Clear mocks in `beforeEach`
6. **Follow AAA**: Arrange, Act, Assert pattern

## 🔗 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
