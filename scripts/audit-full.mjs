#!/usr/bin/env node

/**
 * Full System Audit Script
 * Simulates 10 scans and logs failures to audit_logs with AI summaries
 * 
 * Usage: npm run audit:full
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const testScans = [
  { id: 1, type: 'email', target: 'test1@example.com', expectedResult: 'success' },
  { id: 2, type: 'email', target: 'test2@example.com', expectedResult: 'success' },
  { id: 3, type: 'username', target: 'testuser1', expectedResult: 'failure' }, // Maigret down
  { id: 4, type: 'domain', target: 'example.com', expectedResult: 'success' },
  { id: 5, type: 'email', target: 'test3@example.com', expectedResult: 'success' },
  { id: 6, type: 'phone', target: '+1234567890', expectedResult: 'failure' }, // Provider error
  { id: 7, type: 'email', target: 'test4@example.com', expectedResult: 'success' },
  { id: 8, type: 'username', target: 'testuser2', expectedResult: 'success' },
  { id: 9, type: 'domain', target: 'test.com', expectedResult: 'failure' }, // RLS policy issue
  { id: 10, type: 'email', target: 'test5@example.com', expectedResult: 'success' },
];

async function simulateScan(scan) {
  console.log(`📊 Simulating scan ${scan.id}: ${scan.type} - ${scan.target}`);

  // Simulate scan execution time
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

  if (scan.expectedResult === 'failure') {
    const errors = [
      'Maigret worker offline',
      'Provider API rate limit exceeded',
      'RLS policy denied access',
      'Network timeout',
      'Invalid credentials',
    ];
    return {
      success: false,
      error: errors[Math.floor(Math.random() * errors.length)],
    };
  }

  return { success: true };
}

async function runAuditSimulation() {
  console.log('🚀 Starting Full System Audit Simulation\n');
  console.log(`Testing ${testScans.length} scan scenarios...\n`);

  const results = [];

  // Run all scans
  for (const scan of testScans) {
    const result = await simulateScan(scan);
    results.push({ scan, result });

    if (result.success) {
      console.log(`  ✅ Scan ${scan.id}: SUCCESS`);
    } else {
      console.log(`  ❌ Scan ${scan.id}: FAILED - ${result.error}`);
    }
  }

  // Calculate statistics
  const failures = results.filter(r => !r.result.success);
  const failureRate = (failures.length / results.length) * 100;

  console.log('\n📈 Audit Results:');
  console.log(`  Total Scans: ${results.length}`);
  console.log(`  Successful: ${results.length - failures.length}`);
  console.log(`  Failed: ${failures.length}`);
  console.log(`  Failure Rate: ${failureRate.toFixed(1)}%`);

  // Log failures to database
  if (failures.length > 0) {
    console.log('\n📝 Logging failures to database...');

    const failureLogs = failures.map(({ scan, result }) => ({
      audit_type: 'scan_flow',
      status: 'failure',
      component: scan.type,
      details: {
        scan_id: scan.id,
        target: scan.target,
        error: result.error,
        timestamp: new Date().toISOString(),
      },
    }));

    const { error } = await supabase
      .from('system_audit_results')
      .insert(failureLogs);

    if (error) {
      console.error('  ❌ Failed to log to database:', error.message);
    } else {
      console.log(`  ✅ Logged ${failures.length} failures to system_audit_results`);
    }

    // Get AI analysis
    console.log('\n🤖 Requesting AI analysis...');

    try {
      const { data, error: aiError } = await supabase.functions.invoke('system-audit/run', {
        body: { auditType: 'full_system' },
      });

      if (aiError) {
        console.error('  ❌ AI analysis failed:', aiError.message);
      } else {
        console.log('  ✅ AI Analysis:');
        console.log(`     Priority: ${data.aiPriority}`);
        console.log(`     Summary: ${data.aiSummary}`);
        if (data.recommendations && data.recommendations.length > 0) {
          console.log('     Recommendations:');
          data.recommendations.forEach((rec, idx) => {
            console.log(`       ${idx + 1}. ${rec}`);
          });
        }
      }
    } catch (error) {
      console.error('  ❌ AI analysis error:', error);
    }
  }

  // Send alert if failure rate > 2%
  if (failureRate > 2) {
    console.log(`\n📧 Failure rate (${failureRate.toFixed(1)}%) exceeds 2% threshold`);
    console.log('   Sending alert to admin@footprintiq.app...');

    try {
      const { error } = await supabase.functions.invoke('system-audit/alert', {
        body: { failureRate },
      });

      if (error) {
        console.error('   ❌ Failed to send alert:', error.message);
      } else {
        console.log('   ✅ Alert sent successfully');
      }
    } catch (error) {
      console.error('   ❌ Alert error:', error);
    }
  } else {
    console.log('\n✅ Failure rate within acceptable threshold (≤2%)');
  }

  console.log('\n✨ Audit simulation complete!\n');
  process.exit(failures.length > 0 ? 1 : 0);
}

// Run the audit
runAuditSimulation().catch(error => {
  console.error('\n💥 Audit simulation failed:', error);
  process.exit(1);
});
