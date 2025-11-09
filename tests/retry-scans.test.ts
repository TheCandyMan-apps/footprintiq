import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock environment variables
const MOCK_SUPABASE_URL = 'https://test.supabase.co';
const MOCK_SUPABASE_KEY = 'test-key';

// Mock fetch for testing
global.fetch = vi.fn();

describe('Scan Retry Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retry 3 times on 500 errors with exponential backoff', async () => {
    const mockFetch = global.fetch as any;
    
    // First 2 calls fail with 500, third succeeds
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Internal Error' })
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Internal Error' })
      .mockResolvedValueOnce({ 
        ok: true, 
        status: 200, 
        json: async () => ({ success: true, results: [] })
      });

    const startTime = Date.now();
    
    // Simulate calling a scan function that uses retry logic
    const result = await mockScanWithRetry();
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Should have made 3 calls
    expect(mockFetch).toHaveBeenCalledTimes(3);
    
    // Should succeed after retries
    expect(result.success).toBe(true);
    
    // Should have waited approximately 2s + 4s = 6s (with some tolerance)
    expect(totalTime).toBeGreaterThanOrEqual(6000);
    expect(totalTime).toBeLessThan(7000); // Allow 1s tolerance
  });

  it('should not retry on 400 client errors', async () => {
    const mockFetch = global.fetch as any;
    
    // Client error should not be retried
    mockFetch.mockResolvedValueOnce({ 
      ok: false, 
      status: 400, 
      text: async () => 'Bad Request' 
    });

    await expect(mockScanWithRetry()).rejects.toThrow();
    
    // Should only have made 1 call (no retries)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on 429 rate limit errors', async () => {
    const mockFetch = global.fetch as any;
    
    // Rate limit, then success
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 429, text: async () => 'Too Many Requests' })
      .mockResolvedValueOnce({ 
        ok: true, 
        status: 200, 
        json: async () => ({ success: true, results: [] })
      });

    const result = await mockScanWithRetry();
    
    // Should have made 2 calls (1 retry)
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
  });

  it('should fail after exhausting all 3 retry attempts', async () => {
    const mockFetch = global.fetch as any;
    
    // All 3 attempts fail
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Error 1' })
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => 'Error 2' })
      .mockResolvedValueOnce({ ok: false, status: 502, text: async () => 'Error 3' });

    await expect(mockScanWithRetry()).rejects.toThrow();
    
    // Should have made all 3 attempts
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should log retry attempts with scan context', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    const mockFetch = global.fetch as any;
    
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Error' })
      .mockResolvedValueOnce({ 
        ok: true, 
        status: 200, 
        json: async () => ({ success: true })
      });

    await mockScanWithRetry('test-scan-123', 'test-provider');
    
    // Should have logged retry attempt with context
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Retry')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('test-scan-123')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('test-provider')
    );
    
    consoleSpy.mockRestore();
  });
});

// Mock scan function that simulates retry logic
async function mockScanWithRetry(scanId?: string, providerId?: string) {
  const maxAttempts = 3;
  const delays = [2000, 4000, 6000];
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch('https://mock-worker.com/scan', {
        method: 'POST',
        body: JSON.stringify({ test: true })
      });

      if (!response.ok) {
        const error: any = new Error(`Request failed with status ${response.status}`);
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error: any) {
      lastError = error;
      
      // Check if retryable
      const isRetryable = error.status >= 500 || error.status === 429;
      
      if (!isRetryable || attempt >= maxAttempts) {
        throw error;
      }

      // Log retry
      console.log(
        `[Retry Attempt ${attempt}/${maxAttempts}]` +
        `${scanId ? ` Scan ${scanId}:` : ''}` +
        `${providerId ? ` Provider ${providerId}` : ''} failed`
      );

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));
    }
  }

  throw lastError;
}
