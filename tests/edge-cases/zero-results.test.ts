import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runProvider } from '@/lib/providersClient';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('Zero Results Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle zero results from Maigret gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const mockInvoke = supabase.functions.invoke as any;

    // Mock Maigret returning zero results
    mockInvoke.mockResolvedValueOnce({
      data: {
        findings: [],
        message: 'No social media profiles found for this username',
        suggestions: [
          'Try variations of the username',
          'Check for common aliases',
          'Try with different capitalization'
        ]
      },
      error: null
    });

    const result = await runProvider('maigret', { target: 'nonexistentuser99999' });

    expect(result.findings).toHaveLength(0);
    expect(mockInvoke).toHaveBeenCalledWith('providers/maigret', {
      body: { target: 'nonexistentuser99999' }
    });
  });

  it('should provide AI-powered rescan suggestions on zero results', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const mockInvoke = supabase.functions.invoke as any;

    mockInvoke.mockResolvedValueOnce({
      data: {
        findings: [],
        aiSuggestions: {
          alternativeQueries: [
            'john_doe',
            'johndoe',
            'j.doe'
          ],
          reasoning: 'Original query may have special characters that limit results'
        }
      },
      error: null
    });

    const result = await runProvider('maigret', { target: 'john-doe-123' });

    expect(result.findings).toHaveLength(0);
    expect((result as any).aiSuggestions).toBeDefined();
    expect((result as any).aiSuggestions.alternativeQueries).toHaveLength(3);
  });

  it('should handle partial zero results across multiple providers', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const mockInvoke = supabase.functions.invoke as any;

    // HIBP returns results
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

    // Maigret returns zero results
    mockInvoke.mockResolvedValueOnce({
      data: {
        findings: []
      },
      error: null
    });

    const hibpResult = await runProvider('hibp', { target: 'test@example.com' });
    const maigretResult = await runProvider('maigret', { target: 'testuser' });

    expect(hibpResult.findings).toHaveLength(1);
    expect(maigretResult.findings).toHaveLength(0);
  });

  it('should display empty state with helpful actions when all providers return zero', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const mockInvoke = supabase.functions.invoke as any;

    const providers = ['hibp', 'maigret', 'spiderfoot'];
    
    providers.forEach(() => {
      mockInvoke.mockResolvedValueOnce({
        data: {
          findings: [],
          emptyStateActions: [
            'Try a different search target',
            'Expand your search criteria',
            'Check for typos in the input'
          ]
        },
        error: null
      });
    });

    const results = await Promise.all(
      providers.map(provider => runProvider(provider, { target: 'ghost_user' }))
    );

    expect(results.every(r => r.findings.length === 0)).toBe(true);
    expect((results[0] as any).emptyStateActions).toBeDefined();
  });

  it('should track zero-result rate for quality monitoring', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    const mockInvoke = supabase.functions.invoke as any;

    const scanResults = [
      { findings: [] },
      { findings: [] },
      { findings: [{ provider: 'hibp', kind: 'breach', severity: 'high', confidence: 0.9, observedAt: new Date().toISOString() }] },
      { findings: [] },
      { findings: [{ provider: 'maigret', kind: 'social', severity: 'low', confidence: 0.7, observedAt: new Date().toISOString() }] },
    ];

    scanResults.forEach(result => {
      mockInvoke.mockResolvedValueOnce({
        data: result,
        error: null
      });
    });

    const results = await Promise.all(
      Array(5).fill(null).map((_, i) => 
        runProvider('test-provider', { target: `user${i}` })
      )
    );

    const zeroResultCount = results.filter(r => r.findings.length === 0).length;
    const zeroResultRate = (zeroResultCount / results.length) * 100;

    expect(zeroResultRate).toBe(60); // 3 out of 5 = 60%
    expect(zeroResultCount).toBe(3);
  });
});
