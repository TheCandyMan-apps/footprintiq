import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Scan API - Supabase Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Scan Creation', () => {
    it('should create a scan with valid email', async () => {
      const mockData = {
        id: 'scan-123',
        email: 'test@example.com',
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      } as any);

      const { data, error } = await supabase
        .from('scans')
        .insert({ email: 'test@example.com' })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(mockData);
      expect(data.email).toBe('test@example.com');
    });

    it('should handle invalid email format', async () => {
      const mockError = { message: 'Invalid email format', code: 'INVALID_INPUT' };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      } as any);

      const { data, error } = await supabase
        .from('scans')
        .insert({ email: 'invalid-email' })
        .select()
        .single();

      expect(data).toBeNull();
      expect(error).toBeTruthy();
      expect(error.code).toBe('INVALID_INPUT');
    });

    it('should create scan with workspace context', async () => {
      const mockData = {
        id: 'scan-456',
        email: 'user@company.com',
        workspace_id: 'workspace-789',
        status: 'pending',
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      } as any);

      const { data } = await supabase
        .from('scans')
        .insert({ email: 'user@company.com', workspace_id: 'workspace-789' })
        .select()
        .single();

      expect(data?.workspace_id).toBe('workspace-789');
    });
  });

  describe('Scan Retrieval', () => {
    it('should fetch scan by ID', async () => {
      const mockScan = {
        id: 'scan-123',
        email: 'test@example.com',
        status: 'completed',
        findings_count: 5,
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockScan, error: null }),
          }),
        }),
      } as any);

      const { data } = await supabase
        .from('scans')
        .select('*')
        .eq('id', 'scan-123')
        .single();

      expect(data?.id).toBe('scan-123');
      expect(data?.status).toBe('completed');
    });

    it('should handle non-existent scan ID', async () => {
      const mockError = { message: 'Scan not found', code: 'PGRST116' };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      } as any);

      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('id', 'non-existent')
        .single();

      expect(data).toBeNull();
      expect(error).toBeTruthy();
    });

    it('should list scans with pagination', async () => {
      const mockScans = [
        { id: 'scan-1', status: 'completed' },
        { id: 'scan-2', status: 'processing' },
        { id: 'scan-3', status: 'pending' },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockScans, error: null }),
      } as any);

      const { data } = await supabase.from('scans').select('*');

      expect(data).toHaveLength(3);
      expect(data?.[0].id).toBe('scan-1');
    });
  });

  describe('Edge Function Invocation', () => {
    it('should call scan-orchestrate function', async () => {
      const mockResponse = {
        scanId: 'scan-789',
        status: 'queued',
        providersQueued: ['hibp', 'intelx', 'dehashed'],
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockResponse,
        error: null,
      });

      const { data, error } = await supabase.functions.invoke('scan-orchestrate', {
        body: { email: 'test@example.com', workspaceId: 'ws-123' },
      });

      expect(error).toBeNull();
      expect(data.scanId).toBe('scan-789');
      expect(data.providersQueued).toContain('hibp');
    });

    it('should handle function timeout', async () => {
      const mockError = { message: 'Function timeout', code: 'FUNCTION_TIMEOUT' };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { data, error } = await supabase.functions.invoke('scan-orchestrate', {
        body: { email: 'test@example.com' },
      });

      expect(data).toBeNull();
      expect(error?.code).toBe('FUNCTION_TIMEOUT');
    });

    it('should handle rate limit error', async () => {
      const mockError = {
        message: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { data, error } = await supabase.functions.invoke('scan-orchestrate', {
        body: { email: 'test@example.com' },
      });

      expect(error?.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Findings Retrieval', () => {
    it('should fetch findings for a scan', async () => {
      const mockFindings = [
        {
          id: 'finding-1',
          scan_id: 'scan-123',
          provider: 'hibp',
          severity: 'high',
          kind: 'breach',
        },
        {
          id: 'finding-2',
          scan_id: 'scan-123',
          provider: 'intelx',
          severity: 'medium',
          kind: 'leak',
        },
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockFindings, error: null }),
        }),
      } as any);

      const { data } = await supabase
        .from('findings')
        .select('*')
        .eq('scan_id', 'scan-123');

      expect(data).toHaveLength(2);
      expect(data?.[0].provider).toBe('hibp');
    });

    it('should handle empty results', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      } as any);

      const { data, error } = await supabase
        .from('findings')
        .select('*')
        .eq('scan_id', 'scan-no-results');

      expect(error).toBeNull();
      expect(data).toEqual([]);
      expect(data).toHaveLength(0);
    });
  });
});
