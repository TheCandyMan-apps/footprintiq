import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

interface LoadTestConfig {
  concurrentUsers: number;
  duration: number; // seconds
  rampUpTime: number; // seconds
  target: 'scan-create' | 'job-process' | 'full-scan' | 'batch-scan';
}

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errors: Array<{ code: string; count: number; message: string }>;
  startTime: number;
  endTime: number;
  duration: number;
}

interface RequestResult {
  success: boolean;
  responseTime: number;
  statusCode?: number;
  error?: string;
  errorCode?: string;
}

export class LoadTestRunner {
  private supabase;
  private config: LoadTestConfig;
  private results: RequestResult[] = [];
  private authToken: string | null = null;

  constructor(config: LoadTestConfig) {
    this.config = config;
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  async authenticate(): Promise<void> {
    console.log('🔐 Authenticating test user...');
    
    // Create or sign in test user
    const testEmail = `loadtest-${Date.now()}@test.com`;
    const testPassword = 'LoadTest123!@#';

    const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      // Try to sign in if user exists
      const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        throw new Error(`Authentication failed: ${signInError.message}`);
      }

      this.authToken = signInData.session?.access_token || null;
    } else {
      this.authToken = signUpData.session?.access_token || null;
    }

    console.log('✅ Authenticated successfully');
  }

  async simulateScanCreation(): Promise<RequestResult> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.supabase.functions.invoke('multi-tool-orchestrate', {
        body: {
          target: `loadtest-user-${Math.floor(Math.random() * 10000)}`,
          scanType: 'username',
          tools: ['maigret', 'sherlock'],
          workspaceId: 'test-workspace-id',
        },
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          success: false,
          responseTime,
          error: error.message,
          errorCode: 'EDGE_FUNCTION_ERROR',
        };
      }

      return {
        success: true,
        responseTime,
        statusCode: 200,
      };
    } catch (error: any) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message,
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  async simulateJobProcessing(): Promise<RequestResult> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.supabase.functions.invoke('job-processor', {
        body: {
          workerId: `worker-${Math.floor(Math.random() * 100)}`,
          maxJobs: 1,
        },
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          success: false,
          responseTime,
          error: error.message,
          errorCode: 'JOB_PROCESSOR_ERROR',
        };
      }

      return {
        success: true,
        responseTime,
        statusCode: 200,
      };
    } catch (error: any) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message,
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  async simulateFullScan(): Promise<RequestResult> {
    const startTime = Date.now();
    
    try {
      // Create scan job
      const { data: scanData, error: scanError } = await this.supabase
        .from('scan_jobs')
        .insert({
          target: `loadtest-${Date.now()}`,
          scan_type: 'username',
          status: 'pending',
          workspace_id: 'test-workspace',
        })
        .select()
        .single();

      if (scanError) {
        return {
          success: false,
          responseTime: Date.now() - startTime,
          error: scanError.message,
          errorCode: 'DB_ERROR',
        };
      }

      // Enqueue Maigret scan
      const { error: maigretError } = await this.supabase.functions.invoke('enqueue-maigret-scan', {
        body: {
          scanId: scanData.id,
          target: scanData.target,
        },
      });

      const responseTime = Date.now() - startTime;

      if (maigretError) {
        return {
          success: false,
          responseTime,
          error: maigretError.message,
          errorCode: 'MAIGRET_ERROR',
        };
      }

      return {
        success: true,
        responseTime,
        statusCode: 200,
      };
    } catch (error: any) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message,
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  async simulateBatchScan(): Promise<RequestResult> {
    const startTime = Date.now();
    
    try {
      const targets = Array.from({ length: 10 }, (_, i) => ({
        target: `batch-user-${i}-${Date.now()}`,
        scanType: 'username',
      }));

      const { error } = await this.supabase.functions.invoke('bulk-enqueue-maigret', {
        body: {
          targets,
          workspaceId: 'test-workspace',
        },
      });

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          success: false,
          responseTime,
          error: error.message,
          errorCode: 'BULK_ENQUEUE_ERROR',
        };
      }

      return {
        success: true,
        responseTime,
        statusCode: 200,
      };
    } catch (error: any) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message,
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  async runSingleRequest(): Promise<RequestResult> {
    switch (this.config.target) {
      case 'scan-create':
        return this.simulateScanCreation();
      case 'job-process':
        return this.simulateJobProcessing();
      case 'full-scan':
        return this.simulateFullScan();
      case 'batch-scan':
        return this.simulateBatchScan();
      default:
        throw new Error(`Unknown target: ${this.config.target}`);
    }
  }

  async runConcurrentRequests(count: number): Promise<RequestResult[]> {
    const promises = Array.from({ length: count }, () => this.runSingleRequest());
    return Promise.all(promises);
  }

  calculateMetrics(): PerformanceMetrics {
    const responseTimes = this.results.map(r => r.responseTime).sort((a, b) => a - b);
    const successfulRequests = this.results.filter(r => r.success).length;
    const failedRequests = this.results.filter(r => !r.success).length;

    // Calculate percentiles
    const p50Index = Math.floor(responseTimes.length * 0.5);
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p99Index = Math.floor(responseTimes.length * 0.99);

    // Group errors
    const errorMap = new Map<string, { count: number; message: string }>();
    this.results
      .filter(r => !r.success)
      .forEach(r => {
        const code = r.errorCode || 'UNKNOWN_ERROR';
        const existing = errorMap.get(code) || { count: 0, message: r.error || 'Unknown error' };
        errorMap.set(code, { count: existing.count + 1, message: existing.message });
      });

    const startTime = Math.min(...this.results.map((_, i) => Date.now() - this.results.length * 100 + i * 100));
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // seconds

    return {
      totalRequests: this.results.length,
      successfulRequests,
      failedRequests,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      p50ResponseTime: responseTimes[p50Index],
      p95ResponseTime: responseTimes[p95Index],
      p99ResponseTime: responseTimes[p99Index],
      requestsPerSecond: this.results.length / duration,
      errors: Array.from(errorMap.entries()).map(([code, data]) => ({
        code,
        count: data.count,
        message: data.message,
      })),
      startTime,
      endTime,
      duration,
    };
  }

  printReport(metrics: PerformanceMetrics): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 LOAD TEST REPORT');
    console.log('='.repeat(80));
    console.log(`\n🎯 Target: ${this.config.target}`);
    console.log(`👥 Concurrent Users: ${this.config.concurrentUsers}`);
    console.log(`⏱️  Duration: ${metrics.duration.toFixed(2)}s`);
    console.log('\n📈 REQUEST STATISTICS:');
    console.log(`  Total Requests:      ${metrics.totalRequests}`);
    console.log(`  ✅ Successful:        ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%)`);
    console.log(`  ❌ Failed:            ${metrics.failedRequests} (${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(2)}%)`);
    console.log(`  🚀 Requests/Second:   ${metrics.requestsPerSecond.toFixed(2)}`);
    console.log('\n⚡ RESPONSE TIME METRICS (ms):');
    console.log(`  Average:             ${metrics.averageResponseTime.toFixed(2)}`);
    console.log(`  Min:                 ${metrics.minResponseTime.toFixed(2)}`);
    console.log(`  Max:                 ${metrics.maxResponseTime.toFixed(2)}`);
    console.log(`  P50 (Median):        ${metrics.p50ResponseTime.toFixed(2)}`);
    console.log(`  P95:                 ${metrics.p95ResponseTime.toFixed(2)}`);
    console.log(`  P99:                 ${metrics.p99ResponseTime.toFixed(2)}`);

    if (metrics.errors.length > 0) {
      console.log('\n❌ ERROR BREAKDOWN:');
      metrics.errors.forEach(err => {
        console.log(`  ${err.code}: ${err.count} occurrences`);
        console.log(`    └─ ${err.message}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n');
  }

  async run(): Promise<PerformanceMetrics> {
    console.log('🚀 Starting load test...');
    console.log(`   Target: ${this.config.target}`);
    console.log(`   Concurrent users: ${this.config.concurrentUsers}`);
    console.log(`   Duration: ${this.config.duration}s`);
    console.log(`   Ramp-up time: ${this.config.rampUpTime}s\n`);

    await this.authenticate();

    const startTime = Date.now();
    const endTime = startTime + this.config.duration * 1000;
    const rampUpEnd = startTime + this.config.rampUpTime * 1000;

    while (Date.now() < endTime) {
      const elapsed = Date.now() - startTime;
      const rampUpProgress = Math.min(elapsed / (this.config.rampUpTime * 1000), 1);
      const currentUsers = Math.floor(this.config.concurrentUsers * rampUpProgress);

      console.log(`⏳ ${elapsed / 1000}s - Running ${currentUsers} concurrent requests...`);

      const batchResults = await this.runConcurrentRequests(currentUsers || 1);
      this.results.push(...batchResults);

      // Wait 1 second before next batch
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const metrics = this.calculateMetrics();
    this.printReport(metrics);

    return metrics;
  }
}

// Export for testing
export { LoadTestConfig, PerformanceMetrics };
