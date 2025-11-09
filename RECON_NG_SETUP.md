# Recon-ng Worker Automation Setup

## ✅ Completed Tasks

### 1. Environment Configuration
Updated the Recon-ng edge function to use `RECON_NG_WORKER_URL` from environment variables:
```typescript
const WORKER_URL = Deno.env.get('RECON_NG_WORKER_URL') || 'http://localhost:8080';
```

### 2. Auto-Retry Logic (Premium Reliability)
Implemented 3x retry mechanism with progressive backoff:
- **Max Retries:** 3 attempts before failing
- **Backoff Delay:** 2s, 4s, 6s (progressively increasing)
- **Real-time Updates:** Users see retry progress notifications
- **Logging:** Each attempt is logged for debugging

### 3. Test Suite
Created comprehensive test suite at `tests/recon-ng-worker.test.ts`:
- ✓ Basic Vercel endpoint connectivity
- ✓ Retry logic (3x on failures)
- ✓ Success on second attempt
- ✓ Error handling (500, network errors)
- ✓ Response parsing validation
- ✓ Environment variable validation

### 4. Test Script
Add this to your `package.json` (file is read-only, so manual addition required):
```json
{
  "scripts": {
    "test": "vitest",
    "test:recon-ng": "vitest run tests/recon-ng-worker.test.ts"
  }
}
```

Then run: `npm run test:recon-ng`

## 🚀 Deployment Instructions

### Set Environment Variables
Configure these in your Lovable Cloud backend:

1. **RECON_NG_WORKER_URL** - Your Vercel deployment URL
   ```
   https://your-recon-ng-worker.vercel.app
   ```

2. **WORKER_TOKEN** - Authentication token for the worker
   ```
   your-secure-worker-token
   ```

### Deploy to Branch
The changes are ready for deployment to `recon-vercel-auto` branch:

1. Code is auto-deployed with edge functions
2. Tests validate retry logic and connectivity
3. Monitor logs for retry patterns

## 📊 Retry Logic Flow

```
Attempt 1 → Fail → Wait 2s
Attempt 2 → Fail → Wait 4s  
Attempt 3 → Fail → Throw Error

OR

Attempt 1 → Fail → Wait 2s
Attempt 2 → Success ✓
```

Users see progress updates:
- "Connecting to Recon-ng worker..."
- "Retrying... (Attempt 2/3)" 
- "Retrying... (Attempt 3/3)"
- Success or final error message

## 🧪 Testing

Run the test suite:
```bash
# All tests
npm test

# Recon-ng only
npm run test:recon-ng
```

Tests validate:
- ✅ Mock Vercel API calls
- ✅ 3x retry behavior
- ✅ Error handling
- ✅ Response parsing

## 📝 Monitoring

Check edge function logs:
```bash
# View Recon-ng function logs
supabase functions logs recon-ng-scan --follow
```

Look for:
- `[ReconNG] Attempt 1/3 for scan...`
- `[ReconNG] Scan succeeded on attempt 2`
- `All 3 attempts failed...`

## 🔧 Key Files Modified

1. **supabase/functions/recon-ng-scan/index.ts**
   - Added retry logic with 3 attempts
   - Progressive backoff delays
   - Real-time progress updates
   - Uses `RECON_NG_WORKER_URL` env var

2. **tests/recon-ng-worker.test.ts**
   - Comprehensive test coverage
   - Mock Vercel API calls
   - Validates retry behavior

## ⚠️ Important Notes

- Edge functions auto-deploy with code changes
- Set environment variables before testing
- Monitor worker health at `/health` endpoint
- Retry logic only activates on failures
- Successful first attempts skip retries

## 🎯 Next Steps

1. ✅ Code updated with retry logic
2. ✅ Tests created and documented
3. 🔲 Add test script to package.json manually
4. 🔲 Set RECON_NG_WORKER_URL in environment
5. 🔲 Set WORKER_TOKEN in environment
6. 🔲 Run tests: `npm run test:recon-ng`
7. 🔲 Deploy and monitor logs
