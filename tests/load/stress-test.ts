#!/usr/bin/env tsx

/**
 * Stress Test - Push system to breaking point
 * 
 * This test gradually increases load until system fails or reaches max capacity
 */

import { LoadTestRunner } from './load-test-suite';

interface StressTestConfig {
  startUsers: number;
  maxUsers: number;
  incrementStep: number;
  stepDuration: number; // seconds
  target: 'scan-create' | 'job-process' | 'full-scan' | 'batch-scan';
  successThreshold: number; // minimum success rate (0-1)
}

class StressTestRunner {
  private config: StressTestConfig;
  private breakingPoint: number | null = null;

  constructor(config: StressTestConfig) {
    this.config = config;
  }

  async run() {
    console.log('💥 STRESS TEST - Finding System Breaking Point\n');
    console.log(`Starting with ${this.config.startUsers} users`);
    console.log(`Incrementing by ${this.config.incrementStep} users every ${this.config.stepDuration}s`);
    console.log(`Maximum users: ${this.config.maxUsers}`);
    console.log(`Success threshold: ${(this.config.successThreshold * 100).toFixed(0)}%\n`);

    let currentUsers = this.config.startUsers;
    const results = [];

    while (currentUsers <= this.config.maxUsers) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔥 Testing with ${currentUsers} concurrent users...`);
      console.log('='.repeat(80) + '\n');

      const runner = new LoadTestRunner({
        concurrentUsers: currentUsers,
        duration: this.config.stepDuration,
        rampUpTime: Math.min(this.config.stepDuration / 4, 5),
        target: this.config.target,
      });

      try {
        await runner.authenticate();
        const metrics = await runner.run();
        
        const successRate = metrics.successfulRequests / metrics.totalRequests;
        results.push({
          users: currentUsers,
          metrics,
          successRate,
        });

        // Check if we've reached breaking point
        if (successRate < this.config.successThreshold) {
          this.breakingPoint = currentUsers;
          console.log(`\n⚠️  BREAKING POINT REACHED at ${currentUsers} concurrent users`);
          console.log(`   Success rate dropped to ${(successRate * 100).toFixed(2)}%`);
          break;
        }

        console.log(`✅ System stable at ${currentUsers} users (${(successRate * 100).toFixed(2)}% success rate)`);

      } catch (error: any) {
        console.error(`❌ System failed at ${currentUsers} users: ${error.message}`);
        this.breakingPoint = currentUsers;
        break;
      }

      currentUsers += this.config.incrementStep;

      // Cool down
      if (currentUsers <= this.config.maxUsers) {
        console.log('\n⏸️  Cooling down for 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    this.printStressTestReport(results);
  }

  printStressTestReport(results: any[]) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 STRESS TEST REPORT');
    console.log('='.repeat(80) + '\n');

    if (this.breakingPoint) {
      console.log(`💥 Breaking Point: ${this.breakingPoint} concurrent users`);
      console.log(`✅ Stable Capacity: ${this.breakingPoint - this.config.incrementStep} concurrent users\n`);
    } else {
      console.log(`✅ System handled maximum load of ${this.config.maxUsers} concurrent users\n`);
    }

    console.log('📈 LOAD PROGRESSION:\n');
    console.log('Users'.padEnd(10) + 'RPS'.padEnd(15) + 'Avg RT (ms)'.padEnd(15) + 'Success Rate'.padEnd(15) + 'Status');
    console.log('-'.repeat(80));

    results.forEach(result => {
      const users = result.users.toString().padEnd(10);
      const rps = result.metrics.requestsPerSecond.toFixed(2).padEnd(15);
      const avgRt = result.metrics.averageResponseTime.toFixed(2).padEnd(15);
      const successRate = `${(result.successRate * 100).toFixed(2)}%`.padEnd(15);
      const status = result.successRate >= this.config.successThreshold ? '✅ Stable' : '❌ Degraded';
      
      console.log(users + rps + avgRt + successRate + status);
    });

    console.log('\n' + '='.repeat(80));

    // Performance degradation analysis
    if (results.length > 1) {
      console.log('\n📉 PERFORMANCE DEGRADATION ANALYSIS:\n');
      
      const firstResult = results[0];
      const lastStableResult = results.find(r => r.successRate >= this.config.successThreshold) || results[results.length - 1];
      
      const rtIncrease = ((lastStableResult.metrics.averageResponseTime - firstResult.metrics.averageResponseTime) / firstResult.metrics.averageResponseTime * 100);
      const throughputIncrease = ((lastStableResult.metrics.requestsPerSecond - firstResult.metrics.requestsPerSecond) / firstResult.metrics.requestsPerSecond * 100);
      
      console.log(`Response Time Increase: ${rtIncrease.toFixed(2)}%`);
      console.log(`Throughput Change: ${throughputIncrease >= 0 ? '+' : ''}${throughputIncrease.toFixed(2)}%`);
      
      if (rtIncrease > 100) {
        console.log('\n⚠️  WARNING: Response times more than doubled under load');
      }
      if (throughputIncrease < 0) {
        console.log('\n⚠️  WARNING: Throughput decreased under load');
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');
  }
}

// Default configuration
const defaultConfig: StressTestConfig = {
  startUsers: 10,
  maxUsers: 200,
  incrementStep: 10,
  stepDuration: 30,
  target: 'scan-create',
  successThreshold: 0.95, // 95% success rate
};

// CLI handling
const args = process.argv.slice(2);
const config = { ...defaultConfig };

// Parse CLI arguments
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace('--', '');
  const value = args[i + 1];
  
  if (key === 'start-users') config.startUsers = parseInt(value);
  if (key === 'max-users') config.maxUsers = parseInt(value);
  if (key === 'step') config.incrementStep = parseInt(value);
  if (key === 'duration') config.stepDuration = parseInt(value);
  if (key === 'target') config.target = value as any;
  if (key === 'threshold') config.successThreshold = parseFloat(value);
}

if (args.includes('--help')) {
  console.log('Stress Test - Find system breaking point\n');
  console.log('Usage: npm run test:stress -- [options]\n');
  console.log('Options:');
  console.log('  --start-users <n>   Starting number of users (default: 10)');
  console.log('  --max-users <n>     Maximum number of users (default: 200)');
  console.log('  --step <n>          Increment step (default: 10)');
  console.log('  --duration <n>      Duration per step in seconds (default: 30)');
  console.log('  --target <type>     Target type: scan-create|job-process|full-scan|batch-scan (default: scan-create)');
  console.log('  --threshold <n>     Success rate threshold 0-1 (default: 0.95)');
  process.exit(0);
}

const runner = new StressTestRunner(config);
runner.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
