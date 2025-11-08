# Payment Testing Scripts

## Overview
This directory contains scripts for testing and monitoring payment flows.

## Available Scripts

### `test-payments.ts`
Comprehensive payment system test suite that validates:
- Edge function availability
- Authentication flows
- Credit balance queries
- Purchase endpoints
- Bugs table access
- Sentry integration
- Multiple purchase simulations (10x)

#### Running the Tests

```bash
# Install dependencies first
npm install tsx --save-dev

# Run the test suite
npx tsx scripts/test-payments.ts
```

#### Environment Requirements
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase publishable key
- `VITE_SENTRY_DSN` (optional) - Sentry DSN for error tracking

#### What it Tests

1. **Edge Functions Exist** - Verifies all payment-related functions are deployed
2. **Authentication Flow** - Validates user session management
3. **Credit Balance Query** - Tests credit balance retrieval
4. **Purchase Credits Endpoint** - Validates payment endpoint with error handling
5. **Bugs Table Access** - Ensures bug reporting system is functional
6. **Sentry Integration** - Confirms error tracking is configured
7. **Multiple Purchase Simulation** - Stress tests with 10 sequential purchases

#### Success Criteria
- All tests must pass
- Failure rate must be < 5%
- Exit code 0 on success, 1 on failure

#### Output Example
```
🚀 Starting Payment System Tests

============================================================
🧪 Testing: Edge Functions Exist...
✅ Passed (245ms)

🧪 Testing: Authentication Flow...
✅ Passed (89ms)

🧪 Testing: Credit Balance Query...
✅ Passed (156ms)

...

📊 Test Results Summary:

✅ Edge Functions Exist (245ms)
✅ Authentication Flow (89ms)
✅ Credit Balance Query (156ms)
✅ Purchase Credits Endpoint (312ms)
✅ Bugs Table Access (98ms)
✅ Sentry Integration (12ms)
✅ Multiple Purchase Simulation (2401ms)

7/7 tests passed

✅ All tests passed! No critical glitches found.
```

## CI/CD Integration

Add to your deployment pipeline:

```yaml
# Example GitHub Actions workflow
- name: Test Payment System
  run: npx tsx scripts/test-payments.ts
  env:
    VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.SUPABASE_KEY }}
    VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
```

## Adding to package.json

To run via npm scripts, add this to your `package.json`:

```json
{
  "scripts": {
    "test:payments": "tsx scripts/test-payments.ts",
    "predeploy": "npm run test:payments"
  }
}
```

Note: Since `package.json` is read-only in this project, you'll need to manually add these scripts or use the npx command directly.

## Monitoring Integration

The test suite integrates with:
- **Sentry** - Automatic error tracking for failed tests
- **Console Logs** - Detailed logging for debugging
- **Exit Codes** - CI/CD-friendly success/failure reporting

## Troubleshooting

### Tests Fail with "No authorization header"
- Ensure you're logged in to the application
- The test suite requires an active session

### High Failure Rate Detected
- Check Stripe integration configuration
- Verify edge functions are deployed
- Review Lovable Cloud backend logs

### "Function not found" Errors
- Ensure all edge functions are deployed
- Check `supabase/config.toml` configuration
- Verify function names match exactly

## Support

For issues or questions:
- Check `/admin/glitches` dashboard for system errors
- Review Sentry error logs
- Contact: admin@footprintiq.app
