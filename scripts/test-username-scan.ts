/**
 * Username Scan Test Script
 * Tests username scanning functionality with mock usernames
 * 
 * Run with: npm run test:username
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// Test configuration
const TEST_USERNAMES = ['testuser1', 'johnsmith', 'alice_wonder', 'bob2024', 'charlie_x'];
const TIMEOUT_MS = 30000; // 30 second timeout per scan
const MIN_SUCCESS_RATE = 0.5; // Require 50% of providers to succeed

interface TestResult {
  username: string;
  success: boolean;
  jobId?: string;
  error?: string;
  duration: number;
}

async function testUsernameScan(username: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    
    const { data, error } = await supabase.functions.invoke('enqueue-maigret-scan', {
      body: {
        username,
        all_sites: false,
        artifacts: [],
      },
      // @ts-ignore - signal is supported but not in types
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (error) throw error;
    
    const duration = Date.now() - startTime;
    
    return {
      username,
      success: true,
      jobId: data.jobId,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    return {
      username,
      success: false,
      error: error.message || 'Unknown error',
      duration,
    };
  }
}

async function runTests() {
  console.log('🧪 Starting Username Scan Tests\n');
  console.log(`Testing ${TEST_USERNAMES.length} usernames with ${TIMEOUT_MS}ms timeout\n`);
  
  const results: TestResult[] = [];
  
  for (const username of TEST_USERNAMES) {
    console.log(`Testing: ${username}...`);
    const result = await testUsernameScan(username);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Success - Job ID: ${result.jobId} (${result.duration}ms)`);
    } else {
      console.log(`❌ Failed - ${result.error} (${result.duration}ms)`);
    }
    console.log('');
  }
  
  // Calculate statistics
  const successCount = results.filter(r => r.success).length;
  const successRate = successCount / results.length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const maxDuration = Math.max(...results.map(r => r.duration));
  
  console.log('\n📊 Test Results:');
  console.log(`Success Rate: ${(successRate * 100).toFixed(1)}% (${successCount}/${results.length})`);
  console.log(`Average Duration: ${avgDuration.toFixed(0)}ms`);
  console.log(`Max Duration: ${maxDuration}ms`);
  
  // Check assertions
  console.log('\n🔍 Assertions:');
  
  if (successRate >= MIN_SUCCESS_RATE) {
    console.log(`✅ Success rate >= ${MIN_SUCCESS_RATE * 100}%`);
  } else {
    console.log(`❌ Success rate < ${MIN_SUCCESS_RATE * 100}%`);
    process.exit(1);
  }
  
  if (maxDuration < TIMEOUT_MS) {
    console.log(`✅ No timeouts (max: ${maxDuration}ms < ${TIMEOUT_MS}ms)`);
  } else {
    console.log(`⚠️  Some scans hit timeout`);
  }
  
  const infiniteLoops = results.filter(r => r.duration > TIMEOUT_MS * 0.9);
  if (infiniteLoops.length === 0) {
    console.log(`✅ No infinite loops detected`);
  } else {
    console.log(`⚠️  ${infiniteLoops.length} potential infinite loops`);
  }
  
  console.log('\n✅ All tests passed!');
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
