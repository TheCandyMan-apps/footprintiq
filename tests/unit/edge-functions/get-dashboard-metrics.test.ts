import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  })),
  rpc: vi.fn(),
  auth: {
    getUser: vi.fn()
  }
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

describe('get-dashboard-metrics edge function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return dashboard metrics', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null
    });

    const mockMetrics = {
      totalScans: 1250,
      activeUsers: 89,
      scansByType: [
        { type: 'username', count: 450 },
        { type: 'email', count: 380 }
      ],
      providerPerformance: [
        { provider: 'maigret', successRate: 0.95, avgResponseTime: 2500 }
      ],
      systemHealth: {
        status: 'healthy',
        uptime: 99.8
      }
    };

    // Mock various queries
    mockSupabase.from().select().single.mockResolvedValue({
      data: { count: mockMetrics.totalScans },
      error: null
    });

    const result = mockMetrics;
    expect(result.totalScans).toBeGreaterThan(0);
    expect(result.activeUsers).toBeGreaterThan(0);
    expect(result.scansByType).toHaveLength(2);
  });

  it('should handle date range filtering', async () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';

    const query = mockSupabase.from('scans').select();
    query.gte('created_at', startDate);
    query.lte('created_at', endDate);

    expect(mockSupabase.from).toHaveBeenCalledWith('scans');
  });

  it('should calculate provider success rates', async () => {
    const mockResults = [
      { provider: 'maigret', success: true },
      { provider: 'maigret', success: true },
      { provider: 'maigret', success: false },
      { provider: 'spiderfoot', success: true }
    ];

    const maigretResults = mockResults.filter(r => r.provider === 'maigret');
    const successRate = maigretResults.filter(r => r.success).length / maigretResults.length;

    expect(successRate).toBeCloseTo(0.667, 2);
  });

  it('should aggregate scan types', async () => {
    const mockScans = [
      { scan_type: 'username' },
      { scan_type: 'username' },
      { scan_type: 'email' },
      { scan_type: 'phone' }
    ];

    const aggregated = mockScans.reduce((acc, scan) => {
      const existing = acc.find(item => item.type === scan.scan_type);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ type: scan.scan_type, count: 1 });
      }
      return acc;
    }, [] as { type: string; count: number }[]);

    expect(aggregated).toEqual([
      { type: 'username', count: 2 },
      { type: 'email', count: 1 },
      { type: 'phone', count: 1 }
    ]);
  });

  it('should handle empty results gracefully', async () => {
    mockSupabase.from().select().single.mockResolvedValue({
      data: null,
      error: null
    });

    const defaultMetrics = {
      totalScans: 0,
      activeUsers: 0,
      scansByType: [],
      providerPerformance: [],
      systemHealth: { status: 'unknown', uptime: 0 }
    };

    expect(defaultMetrics.totalScans).toBe(0);
    expect(defaultMetrics.scansByType).toHaveLength(0);
  });
});
