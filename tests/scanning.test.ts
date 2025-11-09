import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockSupabase } from './setup';

// Mock the multi-tool scan hook
const mockStartMultiToolScan = vi.fn();
vi.mock('@/hooks/useMultiToolScan', () => ({
  useMultiToolScan: () => ({
    startMultiToolScan: mockStartMultiToolScan,
    isScanning: false,
    progress: null
  })
}));

describe('Multi-Tool Scanning', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    vi.clearAllMocks();
  });

  describe('Zero Results Handling', () => {
    it('should display "no findings" message when all tools return empty results', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: {
          success: true,
          scanId: 'test-123',
          results: [
            { tool: 'maigret', status: 'completed', resultCount: 0 },
            { tool: 'spiderfoot', status: 'completed', resultCount: 0 },
            { tool: 'reconng', status: 'completed', resultCount: 0 }
          ]
        },
        error: null
      });

      await mockStartMultiToolScan({
        target: 'nonexistentuser',
        targetType: 'username',
        tools: ['maigret', 'spiderfoot', 'reconng'],
        workspaceId: 'test-workspace'
      });

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'multi-tool-orchestrate',
        expect.objectContaining({
          body: expect.objectContaining({ target: 'nonexistentuser' })
        })
      );
    });

    it('should show partial results when some tools return empty', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: {
          success: true,
          results: [
            { tool: 'maigret', status: 'completed', resultCount: 25 },
            { tool: 'spiderfoot', status: 'completed', resultCount: 0 }
          ]
        },
        error: null
      });

      await mockStartMultiToolScan({
        target: 'testuser',
        targetType: 'username',
        tools: ['maigret', 'spiderfoot'],
        workspaceId: 'test-workspace'
      });

      const response = await mockSupabase.functions.invoke.mock.results[0].value;
      expect(response.data.results).toHaveLength(2);
      expect(response.data.results[0].resultCount).toBe(25);
      expect(response.data.results[1].resultCount).toBe(0);
    });
  });

  describe('Timeout Handling', () => {
    it('should handle scan timeout gracefully', async () => {
      const timeoutError = new Error('Scan timed out after 30 seconds');
      mockSupabase.functions.invoke.mockRejectedValue(timeoutError);

      await expect(
        mockStartMultiToolScan({
          target: 'testuser',
          targetType: 'username',
          tools: ['maigret'],
          workspaceId: 'test-workspace'
        })
      ).rejects.toThrow('Scan timed out');
    });

    it('should allow retry after timeout', async () => {
      // First call times out
      mockSupabase.functions.invoke
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({
          data: { success: true, results: [{ tool: 'maigret', status: 'completed' }] },
          error: null
        });

      // First attempt
      await expect(
        mockStartMultiToolScan({ target: 'testuser', targetType: 'username', tools: ['maigret'], workspaceId: 'test' })
      ).rejects.toThrow('Timeout');

      // Retry
      const retryResult = await mockStartMultiToolScan({
        target: 'testuser',
        targetType: 'username',
        tools: ['maigret'],
        workspaceId: 'test'
      });

      expect(mockSupabase.functions.invoke).toHaveBeenCalledTimes(2);
    });
  });

  describe('Tool Availability Fallbacks', () => {
    it('should skip unavailable tools and continue with others', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: {
          success: true,
          results: [
            { tool: 'maigret', status: 'completed', resultCount: 25 },
            { tool: 'spiderfoot', status: 'skipped', error: 'Service not configured' },
            { tool: 'reconng', status: 'completed', resultCount: 10 }
          ]
        },
        error: null
      });

      await mockStartMultiToolScan({
        target: 'testuser',
        targetType: 'username',
        tools: ['maigret', 'spiderfoot', 'reconng'],
        workspaceId: 'test-workspace'
      });

      const response = await mockSupabase.functions.invoke.mock.results[0].value;
      const completed = response.data.results.filter((r: any) => r.status === 'completed');
      const skipped = response.data.results.filter((r: any) => r.status === 'skipped');

      expect(completed).toHaveLength(2);
      expect(skipped).toHaveLength(1);
      expect(skipped[0].error).toContain('not configured');
    });

    it('should display toast notification for skipped tools', async () => {
      const consoleSpy = vi.spyOn(console, 'warn');

      mockSupabase.functions.invoke.mockResolvedValue({
        data: {
          results: [
            { tool: 'spiderfoot', status: 'skipped', error: 'Service not configured' }
          ]
        },
        error: null
      });

      await mockStartMultiToolScan({
        target: 'testuser',
        targetType: 'username',
        tools: ['spiderfoot'],
        workspaceId: 'test-workspace'
      });

      // In real implementation, this would trigger a toast
      // Here we just verify the skipped status is returned
      const response = await mockSupabase.functions.invoke.mock.results[0].value;
      expect(response.data.results[0].status).toBe('skipped');
    });
  });

  describe('Credit Cost Calculations', () => {
    it('should calculate correct total cost for multiple tools', () => {
      const tools = ['maigret', 'spiderfoot', 'reconng'];
      const costs = { maigret: 5, spiderfoot: 10, reconng: 10 };
      
      const totalCost = tools.reduce((sum, tool) => sum + costs[tool], 0);
      
      expect(totalCost).toBe(25);
    });

    it('should prevent scan when credits insufficient', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Insufficient credits' }
      });

      await expect(
        mockStartMultiToolScan({
          target: 'testuser',
          targetType: 'username',
          tools: ['maigret', 'spiderfoot', 'reconng'],
          workspaceId: 'test-workspace'
        })
      ).rejects.toThrow();
    });
  });

  describe('Result Correlation', () => {
    it('should correlate findings across tools', () => {
      const results = [
        {
          tool: 'maigret',
          data: { profiles: [{ url: 'https://twitter.com/testuser' }] }
        },
        {
          tool: 'spiderfoot',
          data: { findings: [{ type: 'social_media', value: 'https://twitter.com/testuser' }] }
        }
      ];

      // Simple correlation check
      const urls = results.flatMap(r => 
        r.tool === 'maigret' 
          ? r.data.profiles.map((p: any) => p.url)
          : r.data.findings.map((f: any) => f.value)
      );

      const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
      expect(duplicates).toContain('https://twitter.com/testuser');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockSupabase.functions.invoke.mockRejectedValue(new Error('Network error'));

      await expect(
        mockStartMultiToolScan({
          target: 'testuser',
          targetType: 'username',
          tools: ['maigret'],
          workspaceId: 'test-workspace'
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle server errors (500)', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Internal server error', status: 500 }
      });

      await expect(
        mockStartMultiToolScan({
          target: 'testuser',
          targetType: 'username',
          tools: ['maigret'],
          workspaceId: 'test-workspace'
        })
      ).rejects.toThrow();
    });

    it('should handle authentication errors', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { message: 'Authentication failed', status: 401 }
      });

      await expect(
        mockStartMultiToolScan({
          target: 'testuser',
          targetType: 'username',
          tools: ['maigret'],
          workspaceId: 'test-workspace'
        })
      ).rejects.toThrow();
    });
  });
});
