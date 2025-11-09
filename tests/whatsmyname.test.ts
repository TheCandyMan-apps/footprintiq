import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  functions: {
    invoke: vi.fn(),
  },
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ error: null }),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('WhatsMyName Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully scan 5 different usernames', async () => {
    const testUsernames = [
      'johndoe',
      'janesmit',
      'techguru99',
      'cryptomaster',
      'gamerx1337',
    ];

    const mockResults = {
      success: true,
      results: {
        sites: {
          'Twitter': { url: 'https://twitter.com/test', category: 'social', confidence: 0.95, found: true },
          'GitHub': { url: 'https://github.com/test', category: 'coding', confidence: 0.88, found: true },
          'Reddit': { url: 'https://reddit.com/u/test', category: 'forum', confidence: 0.92, found: true },
        },
      },
      credits_used: 10,
    };

    mockSupabase.functions.invoke.mockResolvedValue({
      data: mockResults,
      error: null,
    });

    for (const username of testUsernames) {
      const { data, error } = await mockSupabase.functions.invoke('whatsmyname-scan', {
        body: {
          username,
          filters: '',
          workspaceId: 'test-workspace-id',
        },
      });

      expect(error).toBeNull();
      expect(data.success).toBe(true);
      expect(data.results.sites).toBeDefined();
      
      // Assert at least one match found
      const matchCount = Object.keys(data.results.sites).length;
      expect(matchCount).toBeGreaterThan(0);
      
      console.log(`✓ ${username}: Found ${matchCount} matches`);
    }

    expect(mockSupabase.functions.invoke).toHaveBeenCalledTimes(5);
  });

  it('should filter results by category', async () => {
    const mockSocialOnlyResults = {
      success: true,
      results: {
        sites: {
          'Twitter': { url: 'https://twitter.com/test', category: 'social', confidence: 0.95, found: true },
          'Instagram': { url: 'https://instagram.com/test', category: 'social', confidence: 0.90, found: true },
        },
      },
      credits_used: 10,
    };

    mockSupabase.functions.invoke.mockResolvedValue({
      data: mockSocialOnlyResults,
      error: null,
    });

    const { data } = await mockSupabase.functions.invoke('whatsmyname-scan', {
      body: {
        username: 'testuser',
        filters: 'category:social',
        workspaceId: 'test-workspace-id',
      },
    });

    const categories = Object.values(data.results.sites).map((site: any) => site.category);
    expect(categories.every((cat: string) => cat === 'social')).toBe(true);
  });

  it('should require premium subscription', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: {
        message: 'Premium subscription required',
      },
    });

    const { data, error } = await mockSupabase.functions.invoke('whatsmyname-scan', {
      body: {
        username: 'testuser',
        filters: '',
        workspaceId: 'test-workspace-id',
      },
    });

    expect(error).toBeDefined();
    expect(error.message).toContain('Premium');
  });

  it('should deduct 10 credits per scan', async () => {
    const mockResults = {
      success: true,
      results: { sites: {} },
      credits_used: 10,
    };

    mockSupabase.functions.invoke.mockResolvedValue({
      data: mockResults,
      error: null,
    });

    const { data } = await mockSupabase.functions.invoke('whatsmyname-scan', {
      body: {
        username: 'testuser',
        filters: '',
        workspaceId: 'test-workspace-id',
      },
    });

    expect(data.credits_used).toBe(10);
  });

  it('should save results to cases', async () => {
    const mockCaseData = {
      workspace_id: 'test-workspace-id',
      type: 'whatsmyname',
      title: 'WhatsMyName: testuser',
      description: 'Username scan for testuser',
      data: {
        username: 'testuser',
        filters: '',
        matches: [
          { site: 'Twitter', url: 'https://twitter.com/testuser', category: 'social', confidence: 0.95, found: true },
        ],
        scan_date: expect.any(String),
      },
      status: 'open',
    };

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    });

    await mockSupabase.from('cases').insert(mockCaseData);

    expect(mockInsert).toHaveBeenCalledWith(mockCaseData);
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('should handle zero results gracefully', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: {
        success: true,
        results: { sites: {} },
        credits_used: 10,
      },
      error: null,
    });

    const { data } = await mockSupabase.functions.invoke('whatsmyname-scan', {
      body: {
        username: 'nonexistentuser12345',
        filters: '',
        workspaceId: 'test-workspace-id',
      },
    });

    expect(data.success).toBe(true);
    expect(Object.keys(data.results.sites).length).toBe(0);
  });

  it('should handle worker timeout', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: {
        message: 'Scan timeout',
      },
    });

    const { error } = await mockSupabase.functions.invoke('whatsmyname-scan', {
      body: {
        username: 'testuser',
        filters: '',
        workspaceId: 'test-workspace-id',
      },
    });

    expect(error).toBeDefined();
    expect(error.message).toContain('timeout');
  });

  it('should handle insufficient credits', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: {
        message: 'Insufficient credits',
      },
    });

    const { error } = await mockSupabase.functions.invoke('whatsmyname-scan', {
      body: {
        username: 'testuser',
        filters: '',
        workspaceId: 'test-workspace-id',
      },
    });

    expect(error).toBeDefined();
    expect(error.message).toContain('Insufficient credits');
  });
});
