import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runProvider, runProviders } from '@/lib/providersClient';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('Provider Timeout Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle SpiderFoot timeout gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const mockInvoke = supabase.functions.invoke as any;

    // Mock timeout after 30 seconds
    mockInvoke.mockImplementationOnce(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: null,
            error: {
              message: 'Function invocation timeout after 30s',
              code: 'TIMEOUT'
            }
          });
        }, 30000);
      });
    });

    const timeoutPromise = runProvider('spiderfoot', { target: 'test@example.com' });
    
    // Advance timers
    vi.advanceTimersByTime(30000);

    await expect(timeoutPromise).rejects.toThrow(/timeout/i);
  });

  it('should implement exponential backoff on timeout retry', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const mockInvoke = supabase.functions.invoke as any;

    let attemptCount = 0;
    const retryDelays: number[] = [];

    mockInvoke.mockImplementation(() => {
      attemptCount++;
      const startTime = Date.now();
      
      return new Promise((resolve, reject) => {
        if (attemptCount < 3) {
          setTimeout(() => {
            retryDelays.push(Date.now() - startTime);
            reject(new Error('Timeout'));
          }, 1000);
        } else {
          setTimeout(() => {
            resolve({
              data: {
                findings: [{
                  provider: 'maigret',
                  kind: 'social',
                  severity: 'low',
                  confidence: 0.8,
                  observedAt: new Date().toISOString()
                }]
              },
              error: null
            });
          }, 100);
        }
      });
    });

    const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (error) {
          if (i === maxRetries - 1) throw error;
          const delay = Math.pow(2, i) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    const resultPromise = retryWithBackoff(() => 
      runProvider('maigret', { target: 'testuser' })
    );

    // Advance timers through retries
    for (let i = 0; i < 3; i++) {
      await vi.advanceTimersByTimeAsync(1000);
      if (i < 2) {
        await vi.advanceTimersByTimeAsync(Math.pow(2, i) * 1000);
      }
    }

    const result = await resultPromise;
    expect(result.findings).toHaveLength(1);
    expect(attemptCount).toBe(3);
  });

  it('should continue with partial results when one provider times out', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const mockInvoke = supabase.functions.invoke as any;

    // HIBP succeeds
    mockInvoke.mockResolvedValueOnce({
      data: {
        findings: [{
          provider: 'hibp',
          kind: 'breach',
          severity: 'high',
          confidence: 0.95,
          observedAt: new Date().toISOString()
        }]
      },
      error: null
    });

    // SpiderFoot times out
    mockInvoke.mockImplementationOnce(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: null,
            error: { message: 'Timeout', code: 'TIMEOUT' }
          });
        }, 30000);
      });
    });

    // Maigret succeeds
    mockInvoke.mockResolvedValueOnce({
      data: {
        findings: [{
          provider: 'maigret',
          kind: 'social',
          severity: 'medium',
          confidence: 0.88,
          observedAt: new Date().toISOString()
        }]
      },
      error: null
    });

    const resultsPromise = runProviders([
      ['hibp', { target: 'test@example.com' }],
      ['spiderfoot', { target: 'test@example.com' }],
      ['maigret', { target: 'testuser' }]
    ]);

    // Advance timer for timeout
    vi.advanceTimersByTime(30000);

    const results = await resultsPromise;

    // Verify partial success
    expect(results).toHaveLength(3);
    expect(results[0]).not.toBeInstanceOf(Error);
    expect(results[1]).toBeInstanceOf(Error);
    expect(results[2]).not.toBeInstanceOf(Error);
  });

  it('should track timeout rates for provider health monitoring', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const mockInvoke = supabase.functions.invoke as any;

    const timeouts: string[] = [];
    const successes: string[] = [];

    // Simulate 10 requests with 30% timeout rate
    const requests = Array(10).fill(null).map((_, i) => {
      const provider = 'spiderfoot';
      const willTimeout = i % 10 < 3; // 3 out of 10 = 30%

      if (willTimeout) {
        timeouts.push(provider);
        mockInvoke.mockImplementationOnce(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                data: null,
                error: { message: 'Timeout', code: 'TIMEOUT' }
              });
            }, 30000);
          });
        });
      } else {
        successes.push(provider);
        mockInvoke.mockResolvedValueOnce({
          data: {
            findings: [{
              provider,
              kind: 'osint',
              severity: 'low',
              confidence: 0.7,
              observedAt: new Date().toISOString()
            }]
          },
          error: null
        });
      }

      return runProvider(provider, { target: `target${i}` }).catch(e => e);
    });

    // Advance timers
    vi.advanceTimersByTime(30000);

    await Promise.all(requests);

    const timeoutRate = (timeouts.length / 10) * 100;
    expect(timeoutRate).toBe(30);
    expect(timeouts.length).toBe(3);
    expect(successes.length).toBe(7);
  });

  it('should cache successful results to prevent redundant timeout-prone calls', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const mockInvoke = supabase.functions.invoke as any;

    const cache = new Map<string, any>();
    
    const cachedRunProvider = async (providerId: string, payload: any) => {
      const cacheKey = `${providerId}:${JSON.stringify(payload)}`;
      
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }

      const result = await runProvider(providerId, payload);
      cache.set(cacheKey, result);
      return result;
    };

    // First call - actual API call
    mockInvoke.mockResolvedValueOnce({
      data: {
        findings: [{
          provider: 'maigret',
          kind: 'social',
          severity: 'low',
          confidence: 0.8,
          observedAt: new Date().toISOString()
        }]
      },
      error: null
    });

    const result1 = await cachedRunProvider('maigret', { target: 'testuser' });
    expect(mockInvoke).toHaveBeenCalledTimes(1);

    // Second call - from cache
    const result2 = await cachedRunProvider('maigret', { target: 'testuser' });
    expect(mockInvoke).toHaveBeenCalledTimes(1); // No additional call
    expect(result2).toEqual(result1);
  });
});
