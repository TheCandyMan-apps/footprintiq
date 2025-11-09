import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

describe('AI Glitch Detection', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    supabase = createClient(supabaseUrl, supabaseKey);
  });

  it('should analyze logs with mock failures', async () => {
    const mockLogs = [
      {
        id: 'test-1',
        test_name: 'Database Connection Test',
        status: 'fail',
        error_message: 'Connection timeout after 5000ms',
        actual_behavior: 'Connection failed to establish',
        duration_ms: 5500,
        created_at: new Date().toISOString(),
      },
      {
        id: 'test-2',
        test_name: 'API Rate Limit Test',
        status: 'fail',
        error_message: 'Rate limit exceeded',
        actual_behavior: 'Received 429 status code',
        duration_ms: 150,
        created_at: new Date().toISOString(),
      },
      {
        id: 'test-3',
        test_name: 'Authentication Test',
        status: 'pass',
        actual_behavior: 'Successfully authenticated',
        duration_ms: 200,
        created_at: new Date().toISOString(),
      },
      {
        id: 'test-4',
        test_name: 'Worker Health Check',
        status: 'warning',
        actual_behavior: 'Worker responded slowly (2.5s)',
        duration_ms: 2500,
        created_at: new Date().toISOString(),
      },
    ];

    const mockAuditRun = {
      id: 'mock-audit-run',
      success_rate: 50,
      failed: 2,
      total_tests: 4,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.functions.invoke('ai-glitch-detection', {
      body: {
        logs: mockLogs,
        auditRun: mockAuditRun,
      },
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.analysis).toBeDefined();
    expect(data.metadata).toBeDefined();
    expect(data.metadata.failure_rate).toBeGreaterThan(0);
    expect(data.metadata.should_alert).toBe(true); // 50% failure rate should trigger alert
  }, 30000);

  it('should detect patterns in recurring failures', async () => {
    const mockLogs = Array.from({ length: 5 }, (_, i) => ({
      id: `test-${i}`,
      test_name: 'API Call Test',
      status: 'fail',
      error_message: 'Connection timeout',
      actual_behavior: 'Request timed out',
      duration_ms: 5000,
      created_at: new Date().toISOString(),
    }));

    const mockAuditRun = {
      id: 'pattern-audit-run',
      success_rate: 0,
      failed: 5,
      total_tests: 5,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.functions.invoke('ai-glitch-detection', {
      body: {
        logs: mockLogs,
        auditRun: mockAuditRun,
      },
    });

    expect(error).toBeNull();
    expect(data.analysis).toBeDefined();
    expect(data.metadata.should_alert).toBe(true);
    
    // AI should detect the pattern of recurring timeouts
    if (data.analysis.patterns) {
      expect(data.analysis.patterns.length).toBeGreaterThan(0);
    }
  }, 30000);

  it('should not alert on low failure rates', async () => {
    const mockLogs = [
      {
        id: 'test-1',
        test_name: 'Test 1',
        status: 'pass',
        actual_behavior: 'Test passed',
        duration_ms: 100,
        created_at: new Date().toISOString(),
      },
      {
        id: 'test-2',
        test_name: 'Test 2',
        status: 'pass',
        actual_behavior: 'Test passed',
        duration_ms: 120,
        created_at: new Date().toISOString(),
      },
      {
        id: 'test-3',
        test_name: 'Test 3',
        status: 'fail',
        error_message: 'Minor issue',
        actual_behavior: 'Small failure',
        duration_ms: 150,
        created_at: new Date().toISOString(),
      },
    ];

    const mockAuditRun = {
      id: 'low-failure-audit',
      success_rate: 96.67,
      failed: 1,
      total_tests: 30,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.functions.invoke('ai-glitch-detection', {
      body: {
        logs: mockLogs,
        auditRun: mockAuditRun,
      },
    });

    expect(error).toBeNull();
    expect(data.metadata.should_alert).toBe(false); // <5% failure rate shouldn't alert
  }, 30000);

  it('should provide actionable fixes in analysis', async () => {
    const mockLogs = [
      {
        id: 'test-1',
        test_name: 'Memory Leak Test',
        status: 'fail',
        error_message: 'Memory usage exceeded 90%',
        actual_behavior: 'System running out of memory',
        duration_ms: 1000,
        created_at: new Date().toISOString(),
      },
    ];

    const mockAuditRun = {
      id: 'fixes-audit',
      success_rate: 80,
      failed: 2,
      total_tests: 10,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.functions.invoke('ai-glitch-detection', {
      body: {
        logs: mockLogs,
        auditRun: mockAuditRun,
      },
    });

    expect(error).toBeNull();
    expect(data.analysis).toBeDefined();
    
    // Check that AI provides some form of analysis or fixes
    const hasAnalysis = data.analysis.fixes?.length > 0 || 
                       data.analysis.patterns?.length > 0 ||
                       data.analysis.raw_analysis;
    expect(hasAnalysis).toBe(true);
  }, 30000);
});
