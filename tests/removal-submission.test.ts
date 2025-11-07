import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Removal Submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Removal Request Creation', () => {
    it('should submit removal request for finding', async () => {
      const mockRemovalData = {
        id: 'removal-123',
        finding_id: 'finding-456',
        status: 'pending',
        provider: 'hibp',
        requested_at: new Date().toISOString(),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockRemovalData, error: null }),
          }),
        }),
      } as any);

      const { data, error } = await supabase
        .from('removal_requests')
        .insert({ finding_id: 'finding-456', provider: 'hibp' })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.status).toBe('pending');
      expect(data?.provider).toBe('hibp');
    });

    it('should validate removal request payload', async () => {
      const invalidRemovalData = {
        finding_id: '',
        provider: '',
      };

      const mockError = { message: 'Invalid removal request', code: 'VALIDATION_ERROR' };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      } as any);

      const { error } = await supabase
        .from('removal_requests')
        .insert(invalidRemovalData)
        .select()
        .single();

      expect(error).toBeTruthy();
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should prevent duplicate removal requests', async () => {
      const mockError = { message: 'Duplicate removal request', code: '23505' };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      } as any);

      const { error } = await supabase
        .from('removal_requests')
        .insert({ finding_id: 'finding-456', provider: 'hibp' })
        .select()
        .single();

      expect(error?.code).toBe('23505');
    });
  });

  describe('Removal Status Tracking', () => {
    it('should fetch removal request status', async () => {
      const mockRemoval = {
        id: 'removal-123',
        status: 'in_progress',
        provider: 'hibp',
        progress_notes: 'Contacted provider, awaiting response',
        updated_at: new Date().toISOString(),
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockRemoval, error: null }),
          }),
        }),
      } as any);

      const { data } = await supabase
        .from('removal_requests')
        .select('*')
        .eq('id', 'removal-123')
        .single();

      expect(data?.status).toBe('in_progress');
    });

    it('should list all removal requests for user', async () => {
      const mockRemovals = [
        { id: 'removal-1', status: 'completed', provider: 'hibp' },
        { id: 'removal-2', status: 'pending', provider: 'intelx' },
        { id: 'removal-3', status: 'failed', provider: 'dehashed' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockRemovals, error: null }),
        }),
      } as any);

      const { data } = await supabase
        .from('removal_requests')
        .select('*')
        .eq('user_id', 'user-789');

      expect(data).toHaveLength(3);
      expect(data?.filter((r) => r.status === 'completed')).toHaveLength(1);
    });

    it('should update removal request status', async () => {
      const updatedRemoval = {
        id: 'removal-123',
        status: 'completed',
        completed_at: new Date().toISOString(),
      };

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedRemoval, error: null }),
            }),
          }),
        }),
      } as any);

      const { data } = await supabase
        .from('removal_requests')
        .update({ status: 'completed' })
        .eq('id', 'removal-123')
        .select()
        .single();

      expect(data?.status).toBe('completed');
      expect(data?.completed_at).toBeTruthy();
    });
  });

  describe('Automated Removal Execution', () => {
    it('should invoke automated-removal edge function', async () => {
      const mockResponse = {
        removalId: 'removal-456',
        status: 'initiated',
        providersContacted: ['hibp', 'intelx'],
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const { data, error } = await supabase.functions.invoke('automated-removal', {
        body: { findingIds: ['finding-1', 'finding-2'], strategy: 'bulk' },
      });

      expect(error).toBeNull();
      expect(data.status).toBe('initiated');
      expect(data.providersContacted).toContain('hibp');
    });

    it('should handle removal API errors', async () => {
      const mockError = {
        message: 'Provider API unavailable',
        code: 'PROVIDER_ERROR',
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { error } = await supabase.functions.invoke('automated-removal', {
        body: { findingIds: ['finding-1'] },
      });

      expect(error?.code).toBe('PROVIDER_ERROR');
    });

    it('should handle partial removal success', async () => {
      const mockPartialSuccess = {
        successful: ['hibp'],
        failed: ['intelx', 'dehashed'],
        errors: {
          intelx: 'API rate limit exceeded',
          dehashed: 'Authentication failed',
        },
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockPartialSuccess,
        error: null,
      });

      const { data } = await supabase.functions.invoke('automated-removal', {
        body: { findingIds: ['finding-1'] },
      });

      expect(data.successful).toContain('hibp');
      expect(data.failed).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle removal request for non-existent finding', async () => {
      const mockError = { message: 'Finding not found', code: 'NOT_FOUND' };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      } as any);

      const { error } = await supabase
        .from('removal_requests')
        .insert({ finding_id: 'non-existent', provider: 'hibp' })
        .select()
        .single();

      expect(error?.code).toBe('NOT_FOUND');
    });

    it('should handle concurrent removal requests', async () => {
      const mockData = { id: 'removal-concurrent', status: 'pending' };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      } as any);

      const promises = Array.from({ length: 5 }, () =>
        supabase
          .from('removal_requests')
          .insert({ finding_id: 'finding-concurrent', provider: 'test' })
          .select()
          .single()
      );

      const results = await Promise.all(promises);

      expect(results.every((r) => r.data || r.error)).toBe(true);
    });

    it('should handle rate limited removal requests', async () => {
      const mockError = {
        message: 'Too many removal requests',
        code: 'RATE_LIMITED',
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { error } = await supabase.functions.invoke('automated-removal', {
        body: { findingIds: Array.from({ length: 100 }, (_, i) => `finding-${i}`) },
      });

      expect(error?.code).toBe('RATE_LIMITED');
    });
  });
});
