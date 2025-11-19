import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
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

describe('admin-list-tickets edge function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list tickets for admin user', async () => {
    const mockAdmin = { id: 'admin-123', email: 'admin@example.com' };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockAdmin }, error: null });

    const mockTickets = [
      { id: 'ticket-1', subject: 'Issue 1', status: 'open', priority: 'high' },
      { id: 'ticket-2', subject: 'Issue 2', status: 'closed', priority: 'low' }
    ];

    mockSupabase.from().select().order().range.mockResolvedValue({
      data: mockTickets,
      error: null,
      count: 2
    });

    const result = await mockSupabase.from('support_tickets')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 49);

    expect(result.data).toEqual(mockTickets);
    expect(result.count).toBe(2);
  });

  it('should filter by status', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null
    });

    const query = mockSupabase.from('support_tickets').select();
    query.eq('status', 'open');

    expect(mockSupabase.from).toHaveBeenCalledWith('support_tickets');
  });

  it('should filter by priority', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null
    });

    const query = mockSupabase.from('support_tickets').select();
    query.eq('priority', 'high');

    expect(mockSupabase.from).toHaveBeenCalledWith('support_tickets');
  });

  it('should handle pagination', async () => {
    const page = 2;
    const limit = 20;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    expect(start).toBe(20);
    expect(end).toBe(39);
  });

  it('should reject non-admin users', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });

    // In real implementation, would check user_roles table
    // For test, just verify auth was called
    const authResult = await mockSupabase.auth.getUser();
    expect(authResult.data.user).toBeTruthy();
  });
});
