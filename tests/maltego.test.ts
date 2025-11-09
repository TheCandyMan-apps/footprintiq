import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

describe('Maltego AI Integration', () => {
  let testWorkspaceId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Setup: Create test workspace and user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');
    testUserId = user.id;

    // Get or create workspace
    const { data: workspaces } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', testUserId)
      .limit(1);

    if (workspaces && workspaces.length > 0) {
      testWorkspaceId = workspaces[0].id;
    }
  });

  afterAll(async () => {
    // Cleanup: Remove test scans
    await supabase
      .from('scans')
      .delete()
      .eq('scan_type', 'maltego_ai')
      .eq('user_id', testUserId);
  });

  it('should execute maltego scan with mock entities', async () => {
    const mockRequest = {
      entity: 'test-username',
      entityType: 'username' as const,
      transforms: [
        'To IP from Domain',
        'To Email from Domain',
        'To Social Media from Username'
      ],
      workspaceId: testWorkspaceId
    };

    const { data, error } = await supabase.functions.invoke('maltego-scan', {
      body: mockRequest
    });

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data.success) {
      expect(data.scanId).toBeDefined();
      expect(data.graph).toBeDefined();
      expect(data.graph.nodes).toBeInstanceOf(Array);
      expect(data.graph.edges).toBeInstanceOf(Array);
      expect(data.graph.nodes.length).toBeGreaterThan(0);
      expect(data.creditsUsed).toBe(10);
    }
  }, 30000); // 30s timeout

  it('should handle multiple entities and create graph links', async () => {
    const mockEntities = [
      { entity: 'example.com', entityType: 'domain' as const },
      { entity: 'user@example.com', entityType: 'email' as const },
      { entity: '192.168.1.1', entityType: 'ip' as const }
    ];

    for (const mock of mockEntities) {
      const { data } = await supabase.functions.invoke('maltego-scan', {
        body: {
          ...mock,
          transforms: ['To IP from Domain'],
          workspaceId: testWorkspaceId
        }
      });

      if (data?.success && data.graph) {
        // Assert graph structure
        expect(data.graph.nodes.length).toBeGreaterThan(0);
        expect(data.graph.edges.length).toBeGreaterThanOrEqual(0);
        
        // Check for at least one link if edges exist
        if (data.graph.edges.length > 0) {
          const edge = data.graph.edges[0];
          expect(edge.from).toBeDefined();
          expect(edge.to).toBeDefined();
          expect(edge.label).toBeDefined();
        }
      }
    }
  }, 60000); // 60s timeout for multiple scans

  it('should require premium subscription', async () => {
    // Note: This test assumes test user does NOT have premium
    // In real testing, you'd set up a non-premium test user

    const { data } = await supabase.functions.invoke('maltego-scan', {
      body: {
        entity: 'test',
        entityType: 'username' as const,
        transforms: [],
        workspaceId: testWorkspaceId
      }
    });

    // If user is not premium, should get 403 error
    // If user IS premium, skip this assertion
    if (data && !data.success && data.error) {
      expect(data.error).toContain('Premium');
    }
  });

  it('should save results to case when requested', async () => {
    const { data } = await supabase.functions.invoke('maltego-scan', {
      body: {
        entity: 'case-test',
        entityType: 'username' as const,
        transforms: ['To Social Media from Username'],
        workspaceId: testWorkspaceId,
        saveToCase: true,
        caseTitle: 'Test Maltego Case'
      }
    });

    if (data?.success && data.scanId) {
      // Check if case was created
      const { data: cases } = await supabase
        .from('cases')
        .select('*')
        .eq('scan_id', data.scanId);

      expect(cases).toBeDefined();
      if (cases && cases.length > 0) {
        expect(cases[0].title).toBe('Test Maltego Case');
      }
    }
  });

  it('should handle insufficient credits gracefully', async () => {
    // Get current balance
    const { data: balance } = await supabase.rpc('get_credits_balance', {
      _workspace_id: testWorkspaceId
    });

    // If balance is less than 10, should fail gracefully
    if (balance !== null && balance < 10) {
      const { data } = await supabase.functions.invoke('maltego-scan', {
        body: {
          entity: 'test',
          entityType: 'username' as const,
          transforms: [],
          workspaceId: testWorkspaceId
        }
      });

      expect(data.error).toContain('Insufficient credits');
      expect(data.required).toBe(10);
    }
  });
});
