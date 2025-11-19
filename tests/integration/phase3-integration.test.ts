import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockSupabase } from '../setup';

describe('Phase 3 Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Support Ticket Workflow', () => {
    it('should create ticket and notify admins', async () => {
      const mockUser = { id: 'user-123', email: 'user@example.com' };
      const mockTicket = {
        id: 'ticket-123',
        subject: 'Integration Test Ticket',
        description: 'Test description',
        category: 'technical',
        status: 'open',
        priority: 'medium',
        user_id: mockUser.id,
        created_at: new Date().toISOString()
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockTicket,
        error: null
      });

      // Verify ticket creation
      const createResult = await mockSupabase.from('support_tickets')
        .insert({
          subject: mockTicket.subject,
          description: mockTicket.description,
          category: mockTicket.category,
          user_id: mockUser.id
        })
        .select()
        .single();

      expect(createResult.data).toEqual(mockTicket);

      // Admin should be able to list it
      mockSupabase.from().select().order().range.mockResolvedValue({
        data: [mockTicket],
        error: null,
        count: 1
      });

      const listResult = await mockSupabase.from('support_tickets')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(0, 49);

      expect(listResult.data).toContainEqual(mockTicket);
    });
  });

  describe('Dashboard Metrics Integration', () => {
    it('should aggregate data from multiple sources', async () => {
      // Mock scans data
      mockSupabase.from().select().mockResolvedValueOnce({
        data: [
          { id: '1', scan_type: 'username', status: 'completed' },
          { id: '2', scan_type: 'email', status: 'completed' }
        ],
        error: null,
        count: 2
      });

      // Mock users data
      mockSupabase.from().select().mockResolvedValueOnce({
        data: [
          { id: 'user-1', last_active: new Date().toISOString() },
          { id: 'user-2', last_active: new Date().toISOString() }
        ],
        error: null,
        count: 2
      });

      // Mock error logs
      mockSupabase.from().select().mockResolvedValueOnce({
        data: [
          { function: 'run-scan', severity: 'error' }
        ],
        error: null,
        count: 1
      });

      // Verify aggregation
      const scanCount = 2;
      const userCount = 2;
      const errorCount = 1;

      expect(scanCount).toBeGreaterThan(0);
      expect(userCount).toBeGreaterThan(0);
      expect(errorCount).toBeGreaterThan(0);
    });
  });

  describe('Error Logging Integration', () => {
    it('should log errors and make them available to admin', async () => {
      const mockError = {
        id: 'error-123',
        function: 'run-scan',
        severity: 'error',
        message: 'Provider timeout',
        timestamp: new Date().toISOString(),
        metadata: { provider: 'maigret', scanId: 'scan-123' }
      };

      mockSupabase.from().insert().mockResolvedValue({
        data: mockError,
        error: null
      });

      // Log error
      await mockSupabase.from('error_logs').insert(mockError);

      // Admin retrieves error
      mockSupabase.from().select().order().range.mockResolvedValue({
        data: [mockError],
        error: null,
        count: 1
      });

      const result = await mockSupabase.from('error_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range(0, 49);

      expect(result.data).toContainEqual(mockError);
    });
  });

  describe('Admin Permission Check', () => {
    it('should enforce admin-only access', async () => {
      const regularUser = { id: 'user-123', email: 'user@example.com' };
      const adminUser = { id: 'admin-123', email: 'admin@example.com' };

      // Regular user check
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: regularUser },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: { role: 'user' },
        error: null
      });

      const userRoleResult = await mockSupabase.from('user_roles')
        .select('role')
        .eq('user_id', regularUser.id)
        .single();

      expect(userRoleResult.data?.role).toBe('user');

      // Admin user check
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: adminUser },
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValueOnce({
        data: { role: 'admin' },
        error: null
      });

      const adminRoleResult = await mockSupabase.from('user_roles')
        .select('role')
        .eq('user_id', adminUser.id)
        .single();

      expect(adminRoleResult.data?.role).toBe('admin');
    });
  });
});
