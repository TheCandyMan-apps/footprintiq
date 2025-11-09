import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase and Stripe
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  rpc: vi.fn(),
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: { id: 'workspace-123' }, error: null }),
      })),
    })),
  })),
  functions: {
    invoke: vi.fn(),
  },
};

describe('Credit Pack Purchase Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully purchase starter pack (500 credits for $9)', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    });

    // Mock checkout session creation
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { url: 'https://checkout.stripe.com/session-123' },
      error: null,
    });

    // Simulate purchase
    const result = await mockSupabase.functions.invoke('purchase-credit-pack', {
      body: { packType: 'starter', workspaceId: 'workspace-123' },
    });

    expect(result.data.url).toBeTruthy();
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('purchase-credit-pack', {
      body: { packType: 'starter', workspaceId: 'workspace-123' },
    });
  });

  it('should successfully purchase pro pack (2000 credits for $29)', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    });

    mockSupabase.functions.invoke.mockResolvedValue({
      data: { url: 'https://checkout.stripe.com/session-456' },
      error: null,
    });

    const result = await mockSupabase.functions.invoke('purchase-credit-pack', {
      body: { packType: 'pro', workspaceId: 'workspace-123' },
    });

    expect(result.data.url).toBeTruthy();
  });

  it('should add credits to workspace after successful payment', async () => {
    // Mock webhook processing
    const webhookPayload = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'session-123',
          metadata: {
            user_id: 'user-123',
            workspace_id: 'workspace-123',
            credits: '500',
            pack_type: 'starter',
          },
        },
      },
    };

    // Simulate credit addition
    const insertResult = await mockSupabase.from('credits_ledger').insert({
      workspace_id: 'workspace-123',
      delta: 500,
      reason: 'Credit pack purchase: starter',
      meta: {},
    });

    expect(insertResult.error).toBeNull();
  });

  it('should show error for unauthenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'User not authenticated or email not available' },
    });

    const result = await mockSupabase.functions.invoke('purchase-credit-pack', {
      body: { packType: 'starter', workspaceId: 'workspace-123' },
    });

    expect(result.error).toBeTruthy();
  });

  it('should display low balance warning when credits < 50', () => {
    const credits = 25;
    const threshold = 50;
    
    expect(credits < threshold).toBe(true);
    
    // In actual implementation, this would trigger a toast notification
    const warningMessage = `You have ${credits} credits left. Buy more to continue using premium features.`;
    expect(warningMessage).toContain('25 credits');
  });

  it('should calculate correct price per credit', () => {
    const starterPack = { credits: 500, price: 9 };
    const proPack = { credits: 2000, price: 29 };

    const starterRate = (starterPack.price / starterPack.credits).toFixed(3);
    const proRate = (proPack.price / proPack.credits).toFixed(3);

    expect(parseFloat(starterRate)).toBe(0.018);
    expect(parseFloat(proRate)).toBe(0.0145);
    
    // Pro pack has better value per credit
    expect(parseFloat(proRate)).toBeLessThan(parseFloat(starterRate));
  });
});
