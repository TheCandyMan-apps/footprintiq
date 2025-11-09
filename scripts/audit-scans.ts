#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface AuditResult {
  suite_run_id: string;
  total_tests: number;
  passed: number;
  failed: number;
  warnings: number;
  success_rate: number;
  duration_ms: number;
}

async function runAudit(): Promise<AuditResult> {
  console.log('🔍 Starting audit suite...\n');

  const startTime = Date.now();

  try {
    const { data, error } = await supabase.functions.invoke('audit-scans', {});

    if (error) {
      throw new Error(`Audit invocation failed: ${error.message}`);
    }

    const duration = Date.now() - startTime;

    console.log('\n📊 Audit Results:');
    console.log('─'.repeat(50));
    console.log(`Suite Run ID: ${data.suite_run_id}`);
    console.log(`Total Tests: ${data.total_tests}`);
    console.log(`✓ Passed: ${data.passed}`);
    console.log(`✗ Failed: ${data.failed}`);
    console.log(`⚠ Warnings: ${data.warnings}`);
    console.log(`Success Rate: ${data.success_rate}%`);
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log('─'.repeat(50));

    // Print individual test results
    if (data.results && data.results.length > 0) {
      console.log('\n📋 Test Details:');
      console.log('─'.repeat(50));
      
      for (const result of data.results) {
        const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠';
        const color = result.status === 'pass' ? '\x1b[32m' : result.status === 'fail' ? '\x1b[31m' : '\x1b[33m';
        const reset = '\x1b[0m';
        
        console.log(`${color}${icon}${reset} ${result.test_name} (${result.test_category})`);
        console.log(`  ${result.actual_behavior}`);
        if (result.error_message) {
          console.log(`  Error: ${result.error_message}`);
        }
        console.log(`  Duration: ${result.duration_ms}ms`);
        console.log();
      }
    }

    return data;
  } catch (error) {
    console.error(`\n❌ Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isCIMode = args.includes('--ci');
  const isWatchMode = args.includes('--watch');

  try {
    const result = await runAudit();

    // Success criteria
    const SUCCESS_THRESHOLD = 90;
    const isSuccess = result.success_rate >= SUCCESS_THRESHOLD;

    if (isSuccess) {
      console.log(`\n✅ Audit PASSED! Success rate: ${result.success_rate}%`);
      
      if (result.success_rate === 100) {
        console.log('🎉 Perfect score! All tests passed.');
      } else if (result.warnings > 0) {
        console.log(`⚠️  Note: ${result.warnings} warning(s) detected`);
      }
    } else {
      console.log(`\n❌ Audit FAILED! Success rate: ${result.success_rate}% (threshold: ${SUCCESS_THRESHOLD}%)`);
      console.log(`${result.failed} test(s) failed`);
      
      if (isCIMode) {
        console.log('\n🚫 CI mode: Exiting with error code 1');
        process.exit(1);
      }
    }

    // Watch mode
    if (isWatchMode && !isCIMode) {
      console.log('\n👀 Watch mode enabled. Running audit every 60 seconds...');
      console.log('Press Ctrl+C to stop.\n');
      
      setInterval(async () => {
        console.log('\n' + '='.repeat(60));
        console.log('🔄 Running scheduled audit...');
        console.log('='.repeat(60) + '\n');
        
        try {
          await runAudit();
        } catch (error) {
          console.error('Scheduled audit failed:', error);
        }
      }, 60000);
    }

  } catch (error) {
    console.error('\n💥 Fatal error during audit execution');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down audit system...');
  process.exit(0);
});

main();
