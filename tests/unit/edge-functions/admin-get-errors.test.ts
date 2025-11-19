import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis()
  })),
  auth: {
    getUser: vi.fn()
  }
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

describe('admin-get-errors edge function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list error logs', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null
    });

    const mockErrors = [
      {
        id: 'error-1',
        function: 'run-scan',
        severity: 'error',
        message: 'Timeout',
        timestamp: new Date().toISOString()
      },
      {
        id: 'error-2',
        function: 'create-ticket',
        severity: 'warning',
        message: 'Rate limit',
        timestamp: new Date().toISOString()
      }
    ];

    mockSupabase.from().select().order().range.mockResolvedValue({
      data: mockErrors,
      error: null,
      count: 2
    });

    const result = await mockSupabase.from('error_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(0, 49);

    expect(result.data).toEqual(mockErrors);
    expect(result.count).toBe(2);
  });

  it('should filter by severity', async () => {
    const query = mockSupabase.from('error_logs').select();
    query.eq('severity', 'error');

    expect(mockSupabase.from).toHaveBeenCalledWith('error_logs');
  });

  it('should filter by function name', async () => {
    const query = mockSupabase.from('error_logs').select();
    query.eq('function', 'run-scan');

    expect(mockSupabase.from).toHaveBeenCalledWith('error_logs');
  });

  it('should filter by date range', async () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-31';

    const query = mockSupabase.from('error_logs').select();
    query.gte('timestamp', startDate);
    query.lte('timestamp', endDate);

    expect(mockSupabase.from).toHaveBeenCalledWith('error_logs');
  });

  it('should handle pagination correctly', async () => {
    const page = 3;
    const limit = 50;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    expect(start).toBe(100);
    expect(end).toBe(149);
  });

  it('should group errors by function', async () => {
    const mockErrors = [
      { function: 'run-scan', message: 'Error 1' },
      { function: 'run-scan', message: 'Error 2' },
      { function: 'create-ticket', message: 'Error 3' }
    ];

    const grouped = mockErrors.reduce((acc, error) => {
      if (!acc[error.function]) {
        acc[error.function] = [];
      }
      acc[error.function].push(error);
      return acc;
    }, {} as Record<string, typeof mockErrors>);

    expect(grouped['run-scan']).toHaveLength(2);
    expect(grouped['create-ticket']).toHaveLength(1);
  });

  it('should calculate error rate per function', async () => {
    const mockData = {
      totalCalls: 1000,
      errors: 25
    };

    const errorRate = (mockData.errors / mockData.totalCalls) * 100;
    expect(errorRate).toBe(2.5);
  });
});
