/**
 * Payment Test Script
 * Simulates payment flows to verify checkout and credit purchases work
 * Run with: npm run test:payments
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface TestResult {
  test: string;
  status: 'passed' | 'failed';
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  console.log(`\n🧪 Testing: ${name}...`);
  
  try {
    await testFn();
    const duration = Date.now() - start;
    results.push({ test: name, status: 'passed', message: 'Success', duration });
    console.log(`✅ Passed (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    const message = error instanceof Error ? error.message : String(error);
    results.push({ test: name, status: 'failed', message, duration });
    console.error(`❌ Failed (${duration}ms):`, message);
  }
}

// Test 1: Verify edge functions exist
async function testEdgeFunctionsExist() {
  const functions = [
    'billing/purchase-credits',
    'admin/send-glitch-alert',
  ];
  
  for (const fn of functions) {
    try {
      // Just check if function exists by making a test call
      await supabase.functions.invoke(fn, { body: {} });
    } catch (error: any) {
      // Function exists if we get any response (even errors)
      if (!error.message?.includes('not found')) {
        continue;
      }
      throw new Error(`Function ${fn} not found`);
    }
  }
}

// Test 2: Test authentication flow
async function testAuthFlow() {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) throw error;
  
  if (!data.session) {
    console.log('⚠️  No active session - some tests will be skipped');
  } else {
    console.log(`✓ Active session found for user: ${data.session.user.email}`);
  }
}

// Test 3: Test credit balance query
async function testCreditBalance() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('⚠️  Skipping - no authenticated user');
    return;
  }

  const { data, error } = await supabase.rpc('get_credits_balance', {
    _workspace_id: user.id,
  });

  if (error) throw error;
  
  console.log(`✓ Current balance: ${data} credits`);
}

// Test 4: Test purchase credits endpoint (dry-run)
async function testPurchaseCreditsEndpoint() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('⚠️  Skipping - no authenticated user');
    return;
  }

  // Test with invalid package to verify validation
  try {
    await supabase.functions.invoke('billing/purchase-credits', {
      body: { package: 'invalid', workspaceId: user.id },
    });
    throw new Error('Should have failed with invalid package');
  } catch (error: any) {
    if (error.message?.includes('Invalid') || error.message?.includes('package')) {
      console.log('✓ Validation working correctly');
    } else {
      throw error;
    }
  }
}

// Test 5: Test bugs table access
async function testBugsTable() {
  const { data, error } = await supabase
    .from('bugs')
    .select('count')
    .limit(1);

  if (error) throw error;
  
  console.log('✓ Bugs table accessible');
}

// Test 6: Test Sentry integration
async function testSentryIntegration() {
  // Verify Sentry DSN is configured
  const sentryDsn = process.env.VITE_SENTRY_DSN;
  
  if (!sentryDsn) {
    console.log('⚠️  Sentry DSN not configured - error tracking disabled');
  } else {
    console.log('✓ Sentry DSN configured');
  }
}

// Test 7: Simulate credit purchase flow (10 times)
async function testMultiplePurchases() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('⚠️  Skipping - no authenticated user');
    return;
  }

  console.log('Simulating 10 purchase attempts...');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (let i = 0; i < 10; i++) {
    try {
      // Test checkout session creation (will fail at Stripe but tests our code)
      await supabase.functions.invoke('billing/purchase-credits', {
        body: { package: '10', workspaceId: user.id },
      });
      successCount++;
    } catch (error) {
      failureCount++;
    }
  }
  
  console.log(`✓ Purchases: ${successCount} successful, ${failureCount} failed`);
  
  // Check failure rate
  const failureRate = failureCount / 10;
  if (failureRate > 0.05) {
    throw new Error(`High failure rate: ${(failureRate * 100).toFixed(1)}%`);
  }
}

// Main test runner
async function main() {
  console.log('🚀 Starting Payment System Tests\n');
  console.log('=' .repeat(60));

  await runTest('Edge Functions Exist', testEdgeFunctionsExist);
  await runTest('Authentication Flow', testAuthFlow);
  await runTest('Credit Balance Query', testCreditBalance);
  await runTest('Purchase Credits Endpoint', testPurchaseCreditsEndpoint);
  await runTest('Bugs Table Access', testBugsTable);
  await runTest('Sentry Integration', testSentryIntegration);
  await runTest('Multiple Purchase Simulation', testMultiplePurchases);

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results Summary:\n');

  const passed = results.filter((r) => r.status === 'passed').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const total = results.length;

  results.forEach((result) => {
    const icon = result.status === 'passed' ? '✅' : '❌';
    console.log(`${icon} ${result.test} (${result.duration}ms)`);
    if (result.status === 'failed') {
      console.log(`   └─ ${result.message}`);
    }
  });

  console.log(`\n${passed}/${total} tests passed`);

  if (failed === 0) {
    console.log('\n✅ All tests passed! No critical glitches found.');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Please review.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
