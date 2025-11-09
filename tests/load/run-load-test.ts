#!/usr/bin/env tsx

import { LoadTestRunner } from './load-test-suite';
import * as fs from 'fs';
import * as path from 'path';

interface TestScenario {
  name: string;
  concurrentUsers: number;
  duration: number;
  rampUpTime: number;
  target: 'scan-create' | 'job-process' | 'full-scan' | 'batch-scan';
}

const SCENARIOS: TestScenario[] = [
  {
    name: 'Light Load - Scan Creation',
    concurrentUsers: 10,
    duration: 30,
    rampUpTime: 5,
    target: 'scan-create',
  },
  {
    name: 'Medium Load - Scan Creation',
    concurrentUsers: 50,
    duration: 60,
    rampUpTime: 10,
    target: 'scan-create',
  },
  {
    name: 'Heavy Load - Scan Creation',
    concurrentUsers: 100,
    duration: 60,
    rampUpTime: 15,
    target: 'scan-create',
  },
  {
    name: 'Job Processing Load',
    concurrentUsers: 50,
    duration: 45,
    rampUpTime: 10,
    target: 'job-process',
  },
  {
    name: 'Full Scan Workflow',
    concurrentUsers: 25,
    duration: 90,
    rampUpTime: 15,
    target: 'full-scan',
  },
  {
    name: 'Batch Scan Stress Test',
    concurrentUsers: 20,
    duration: 60,
    rampUpTime: 10,
    target: 'batch-scan',
  },
];

async function runAllScenarios() {
  console.log('🔥 LOAD TESTING SUITE - FootprintIQ\n');
  console.log(`Running ${SCENARIOS.length} test scenarios...\n`);

  const results = [];

  for (const scenario of SCENARIOS) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎬 SCENARIO: ${scenario.name}`);
    console.log('='.repeat(80) + '\n');

    const runner = new LoadTestRunner({
      concurrentUsers: scenario.concurrentUsers,
      duration: scenario.duration,
      rampUpTime: scenario.rampUpTime,
      target: scenario.target,
    });

    try {
      const metrics = await runner.run();
      results.push({
        scenario: scenario.name,
        metrics,
        success: true,
      });
    } catch (error: any) {
      console.error(`❌ Scenario failed: ${error.message}`);
      results.push({
        scenario: scenario.name,
        error: error.message,
        success: false,
      });
    }

    // Cool down between scenarios
    console.log('\n⏸️  Cooling down for 10 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  // Generate summary report
  generateSummaryReport(results);
}

function generateSummaryReport(results: any[]) {
  console.log('\n' + '='.repeat(80));
  console.log('📋 SUMMARY REPORT');
  console.log('='.repeat(80) + '\n');

  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);

  console.log(`✅ Successful Scenarios: ${successfulTests.length}/${results.length}`);
  console.log(`❌ Failed Scenarios: ${failedTests.length}/${results.length}\n`);

  if (successfulTests.length > 0) {
    console.log('📊 PERFORMANCE COMPARISON:\n');
    console.log('Scenario'.padEnd(40) + 'RPS'.padEnd(15) + 'Avg RT (ms)'.padEnd(15) + 'P95 RT (ms)');
    console.log('-'.repeat(80));

    successfulTests.forEach(result => {
      const name = result.scenario.slice(0, 38);
      const rps = result.metrics.requestsPerSecond.toFixed(2);
      const avgRt = result.metrics.averageResponseTime.toFixed(2);
      const p95Rt = result.metrics.p95ResponseTime.toFixed(2);
      
      console.log(
        name.padEnd(40) +
        rps.padEnd(15) +
        avgRt.padEnd(15) +
        p95Rt
      );
    });
  }

  if (failedTests.length > 0) {
    console.log('\n❌ FAILED SCENARIOS:\n');
    failedTests.forEach(result => {
      console.log(`  • ${result.scenario}`);
      console.log(`    Error: ${result.error}\n`);
    });
  }

  // Save results to file
  const reportDir = path.join(process.cwd(), 'tests', 'load', 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `load-test-${timestamp}.json`);
  
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\n💾 Full report saved to: ${reportPath}`);
  console.log('\n' + '='.repeat(80) + '\n');
}

async function runSingleScenario(scenarioName: string) {
  const scenario = SCENARIOS.find(s => s.name.toLowerCase().includes(scenarioName.toLowerCase()));
  
  if (!scenario) {
    console.error(`❌ Scenario not found: ${scenarioName}`);
    console.log('\n📋 Available scenarios:');
    SCENARIOS.forEach(s => console.log(`  • ${s.name}`));
    process.exit(1);
  }

  console.log(`🎬 Running scenario: ${scenario.name}\n`);

  const runner = new LoadTestRunner({
    concurrentUsers: scenario.concurrentUsers,
    duration: scenario.duration,
    rampUpTime: scenario.rampUpTime,
    target: scenario.target,
  });

  await runner.run();
}

// CLI handling
const args = process.argv.slice(2);

if (args.length === 0) {
  runAllScenarios().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} else if (args[0] === '--scenario' && args[1]) {
  runSingleScenario(args[1]).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
} else if (args[0] === '--list') {
  console.log('📋 Available test scenarios:\n');
  SCENARIOS.forEach((s, i) => {
    console.log(`${i + 1}. ${s.name}`);
    console.log(`   Users: ${s.concurrentUsers}, Duration: ${s.duration}s, Target: ${s.target}\n`);
  });
} else {
  console.log('Usage:');
  console.log('  npm run test:load              # Run all scenarios');
  console.log('  npm run test:load -- --list    # List available scenarios');
  console.log('  npm run test:load -- --scenario "Medium Load"  # Run specific scenario');
  process.exit(1);
}
