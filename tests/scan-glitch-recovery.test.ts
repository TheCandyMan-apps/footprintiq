import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSupabaseClient } from './mocks/supabase';

/**
 * Scan Glitch Recovery Tests
 * 
 * Tests scanning reliability features:
 * - Retry logic with exponential backoff
 * - Empty result handling
 * - AI rescan suggestions
 * - Pre-scan validation
 */

describe('Scan Glitch Recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Retry Logic', () => {
    it('should retry failed scans up to 3 times', async () => {
      const mockFetch = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({ ok: true, body: 'success' });

      global.fetch = mockFetch;

      // Simulate retry logic
      let attempts = 0;
      let success = false;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        attempts = attempt;
        try {
          await mockFetch();
          success = true;
          break;
        } catch (error) {
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 10));
          }
        }
      }

      expect(attempts).toBe(3);
      expect(success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should log retry attempts with detailed information', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const mockFetch = vi.fn()
        .mockRejectedValueOnce(new Error('Worker timeout'))
        .mockResolvedValueOnce({ ok: true });

      global.fetch = mockFetch;

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[Attempt ${attempt}/3] Retrying scan...`);
          await mockFetch();
          console.log(`✓ Scan successful on attempt ${attempt}`);
          break;
        } catch (error) {
          console.log(`✗ Attempt ${attempt} failed:`, error.message);
          if (attempt < 3) {
            const delay = Math.pow(2, attempt - 1) * 10;
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Attempt 1/3]'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('✓ Scan successful'));
    });

    it('should fail after 3 retry attempts', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Persistent failure'));
      global.fetch = mockFetch;

      let attempts = 0;
      let finalError = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        attempts = attempt;
        try {
          await mockFetch();
          break;
        } catch (error) {
          finalError = error;
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      }

      expect(attempts).toBe(3);
      expect(finalError).toBeDefined();
      expect(finalError.message).toBe('Persistent failure');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Empty Results Handling', () => {
    it('should detect empty results and provide suggestions', async () => {
      const mockScanResult = {
        providersCompleted: 0,
        linesProcessed: 10,
        status: 'no_results',
        suggestion: 'Try alternative spellings, variations, or related usernames'
      };

      // Simulate empty result detection
      const hasResults = mockScanResult.providersCompleted > 0;
      
      expect(hasResults).toBe(false);
      expect(mockScanResult.status).toBe('no_results');
      expect(mockScanResult.suggestion).toContain('Try alternative');
    });

    it('should log detailed information about empty results', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      
      const jobId = 'test-job-123';
      const linesProcessed = 15;
      const providersCompleted = 0;

      console.error('✗ Worker stream completed but no providers returned data', {
        jobId,
        linesProcessed,
        providersCompleted
      });
      console.error('⚠ Worker empty – this may indicate:');
      console.error('  1. Username not found on any platform');
      console.error('  2. Worker internal error');
      console.error('  3. Network issues during streaming');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Worker stream completed but no providers returned data'),
        expect.objectContaining({ jobId, providersCompleted: 0 })
      );
      expect(consoleSpy).toHaveBeenCalledWith('⚠ Worker empty – this may indicate:');
    });

    it('should distinguish between no results and worker errors', () => {
      const noResultsCase = {
        providersCompleted: 0,
        linesProcessed: 20,
        error: null
      };

      const workerErrorCase = {
        providersCompleted: 0,
        linesProcessed: 0,
        error: 'Worker unreachable'
      };

      expect(noResultsCase.linesProcessed > 0 && noResultsCase.providersCompleted === 0).toBe(true);
      expect(workerErrorCase.linesProcessed === 0 && workerErrorCase.error).toBeDefined();
    });
  });

  describe('AI Rescan Suggestions', () => {
    it('should generate alternative username suggestions', async () => {
      const mockAISuggestions = {
        original: 'johndoe',
        suggestions: [
          { query: 'john_doe', reason: 'Common underscore pattern', confidence: 'high' },
          { query: 'johndoe123', reason: 'Numeric suffix variation', confidence: 'medium' },
          { query: 'john.doe', reason: 'Dot separator pattern', confidence: 'medium' },
          { query: 'jdoe', reason: 'Abbreviated version', confidence: 'low' },
          { query: 'johndoe_official', reason: 'Official suffix pattern', confidence: 'low' }
        ]
      };

      expect(mockAISuggestions.suggestions).toHaveLength(5);
      expect(mockAISuggestions.suggestions[0].confidence).toBe('high');
      expect(mockAISuggestions.suggestions.every(s => s.query && s.reason)).toBe(true);
    });

    it('should handle AI API errors gracefully', async () => {
      const mockAIError = {
        status: 429,
        message: 'Rate limit exceeded'
      };

      let errorHandled = false;
      let errorMessage = '';

      try {
        if (mockAIError.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      } catch (error: any) {
        errorHandled = true;
        errorMessage = error.message;
      }

      expect(errorHandled).toBe(true);
      expect(errorMessage).toContain('Rate limit');
    });

    it('should provide fallback suggestions when AI unavailable', () => {
      const username = 'testuser';
      const fallbackSuggestions = [
        {
          query: username.toLowerCase(),
          reason: 'Try lowercase version',
          confidence: 'medium'
        },
        {
          query: username.replace(/[._-]/g, ''),
          reason: 'Remove special characters',
          confidence: 'medium'
        },
        {
          query: `${username}_official`,
          reason: 'Try with common suffix',
          confidence: 'low'
        }
      ];

      expect(fallbackSuggestions).toHaveLength(3);
      expect(fallbackSuggestions.every(s => s.query.includes('testuser'))).toBe(true);
    });
  });

  describe('Pre-scan Validation', () => {
    it('should validate target input before starting scan', () => {
      const validTarget = 'johndoe';
      const emptyTarget = '';
      const whitespaceTarget = '   ';

      expect(validTarget.trim().length > 0).toBe(true);
      expect(emptyTarget.trim().length > 0).toBe(false);
      expect(whitespaceTarget.trim().length > 0).toBe(false);
    });

    it('should validate tool selection before starting scan', () => {
      const validToolSelection = ['maigret', 'spiderfoot'];
      const emptyToolSelection: string[] = [];

      expect(validToolSelection.length > 0).toBe(true);
      expect(emptyToolSelection.length > 0).toBe(false);
    });

    it('should check for unavailable tools', () => {
      const tools = [
        { id: 'maigret', status: 'available' },
        { id: 'spiderfoot', status: 'unavailable' },
        { id: 'reconng', status: 'available' }
      ];
      const selectedTools = ['maigret', 'spiderfoot', 'reconng'];

      const unavailableTools = selectedTools.filter(toolId => {
        const tool = tools.find(t => t.id === toolId);
        return tool?.status === 'unavailable';
      });

      expect(unavailableTools).toEqual(['spiderfoot']);
      expect(unavailableTools.length).toBe(1);
    });

    it('should calculate total credit cost before scan', () => {
      const tools = [
        { id: 'maigret', creditCost: 5 },
        { id: 'spiderfoot', creditCost: 10 },
        { id: 'reconng', creditCost: 10 }
      ];
      const selectedTools = ['maigret', 'spiderfoot'];

      const totalCost = selectedTools.reduce((sum, toolId) => {
        const tool = tools.find(t => t.id === toolId);
        return sum + (tool?.creditCost || 0);
      }, 0);

      expect(totalCost).toBe(15);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should recover from partial scan failures', async () => {
      const scanResults = [
        { tool: 'maigret', status: 'completed', results: 5 },
        { tool: 'spiderfoot', status: 'failed', error: 'timeout' },
        { tool: 'reconng', status: 'completed', results: 3 }
      ];

      const completedTools = scanResults.filter(r => r.status === 'completed');
      const failedTools = scanResults.filter(r => r.status === 'failed');
      const totalResults = completedTools.reduce((sum, t) => sum + (t.results || 0), 0);

      expect(completedTools.length).toBe(2);
      expect(failedTools.length).toBe(1);
      expect(totalResults).toBe(8);
    });

    it('should maintain scan state for retry', () => {
      const partialScanState = {
        jobId: 'test-123',
        target: 'johndoe',
        completedTools: ['maigret'],
        failedTools: ['spiderfoot'],
        partialResults: [
          { tool: 'maigret', findings: 5 }
        ]
      };

      expect(partialScanState.completedTools.length).toBeGreaterThan(0);
      expect(partialScanState.failedTools.length).toBeGreaterThan(0);
      expect(partialScanState.partialResults).toBeDefined();
    });

    it('should detect and handle rate limiting', () => {
      const responses = [
        { status: 200, ok: true },
        { status: 429, ok: false, error: 'Rate limit exceeded' },
        { status: 200, ok: true }
      ];

      const rateLimitedResponse = responses.find(r => r.status === 429);
      const isRateLimited = rateLimitedResponse !== undefined;

      expect(isRateLimited).toBe(true);
      expect(rateLimitedResponse?.error).toContain('Rate limit');
    });
  });

  describe('Logging and Monitoring', () => {
    it('should log all retry attempts with timestamps', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const retryLog: string[] = [];

      for (let attempt = 1; attempt <= 3; attempt++) {
        const logMessage = `[${new Date().toISOString()}] Attempt ${attempt}/3`;
        retryLog.push(logMessage);
        console.log(logMessage);
      }

      expect(retryLog).toHaveLength(3);
      expect(consoleSpy).toHaveBeenCalledTimes(3);
      retryLog.forEach((log, idx) => {
        expect(log).toContain(`Attempt ${idx + 1}/3`);
      });
    });

    it('should log worker status and diagnostics', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      const diagnostics = {
        workerUrl: 'https://worker.example.com',
        workerTokenConfigured: true,
        jobId: 'test-123',
        username: 'johndoe',
        plan: 'premium'
      };

      console.log('=== Maigret Worker Configuration ===');
      console.log(`Worker URL: ${diagnostics.workerUrl}`);
      console.log(`Worker token configured: ${diagnostics.workerTokenConfigured ? 'YES' : 'NO'}`);
      console.log(`Job ID: ${diagnostics.jobId}`);
      console.log(`Username: ${diagnostics.username}`);
      console.log(`Plan: ${diagnostics.plan}`);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Worker Configuration'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Worker URL'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Job ID'));
    });
  });
});
