import { vi } from 'vitest';

/**
 * Mock Supabase client for testing
 * Covers auth, database queries, and edge function calls
 */

export const mockSupabaseAuth = {
  getSession: vi.fn().mockResolvedValue({
    data: {
      session: {
        access_token: 'mock-access-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: {},
        },
      },
    },
    error: null,
  }),
  
  getUser: vi.fn().mockResolvedValue({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {},
      },
    },
    error: null,
  }),
  
  signInWithPassword: vi.fn().mockResolvedValue({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
      session: {
        access_token: 'mock-access-token',
      },
    },
    error: null,
  }),
  
  signOut: vi.fn().mockResolvedValue({
    error: null,
  }),
  
  onAuthStateChange: vi.fn().mockReturnValue({
    data: {
      subscription: {
        unsubscribe: vi.fn(),
      },
    },
  }),
  
  refreshSession: vi.fn().mockResolvedValue({
    data: {
      session: {
        access_token: 'mock-refreshed-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
    },
    error: null,
  }),
};

export const mockSupabaseDatabase = {
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: getMockData(table),
      error: null,
    }),
    maybeSingle: vi.fn().mockResolvedValue({
      data: getMockData(table),
      error: null,
    }),
  })),
};

export const mockSupabaseFunctions = {
  invoke: vi.fn().mockResolvedValue({
    data: {
      findings: [
        {
          id: 'mock-finding-1',
          type: 'social_media',
          title: 'Profile Found',
          severity: 'info',
          provider: 'Mock Provider',
          evidence: [{ key: 'username', value: 'test' }],
        },
      ],
    },
    error: null,
  }),
};

export const mockSupabaseClient = {
  auth: mockSupabaseAuth,
  from: mockSupabaseDatabase.from,
  functions: mockSupabaseFunctions,
};

// Helper to get mock data based on table
function getMockData(table: string) {
  const mockDataMap: Record<string, any> = {
    profiles: {
      id: 'test-user-id',
      credits_balance: 100,
      is_premium: false,
      workspace_id: 'test-workspace-id',
    },
    scan_results: {
      id: 'mock-scan-id',
      status: 'completed',
      findings: [
        {
          id: 'finding-1',
          type: 'breach',
          title: 'Mock Finding',
          severity: 'high',
        },
      ],
    },
    credits_ledger: {
      id: 'ledger-123',
      user_id: 'test-user-id',
      amount: 100,
      balance: 100,
      reason: 'test_credit',
    },
  };
  
  return mockDataMap[table] || null;
}

// Mock scenarios for edge cases
export const mockSupabaseScenarios = {
  noSession: {
    ...mockSupabaseClient,
    auth: {
      ...mockSupabaseAuth,
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'No user session' },
      }),
    },
  },
  
  networkError: {
    ...mockSupabaseClient,
    functions: {
      invoke: vi.fn().mockRejectedValue(new Error('Network error')),
    },
  },
  
  rateLimited: {
    ...mockSupabaseClient,
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: null,
        error: {
          message: 'Rate limit exceeded',
          status: 429,
        },
      }),
    },
  },
  
  timeout: {
    ...mockSupabaseClient,
    functions: {
      invoke: vi.fn().mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 30000)
        )
      ),
    },
  },
  
  emptyResults: {
    ...mockSupabaseClient,
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: { findings: [] },
        error: null,
      }),
    },
  },
  
  insufficientCredits: {
    ...mockSupabaseClient,
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: table === 'profiles' ? { credits_balance: 0 } : null,
        error: null,
      }),
    })),
  },
};

export default mockSupabaseClient;
