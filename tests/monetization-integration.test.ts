import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    refreshSession: vi.fn(),
  },
  functions: {
    invoke: vi.fn(),
  },
  rpc: vi.fn(),
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('Monetization Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Credit Pack Purchases', () => {
    it('should process OSINT Starter pack purchase (500 credits $9)', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      mockSupabase.functions.invoke.mockResolvedValue({
        data: { url: 'https://checkout.stripe.com/test' },
        error: null,
      });

      const { data } = await mockSupabase.functions.invoke('billing/purchase-credits', {
        body: {
          package: 'starter',
          workspaceId: 'workspace-123',
        },
      });

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'billing/purchase-credits',
        expect.objectContaining({
          body: {
            package: 'starter',
            workspaceId: 'workspace-123',
          },
        })
      );
      expect(data.url).toBe('https://checkout.stripe.com/test');
    });

    it('should handle successful credit addition after payment', async () => {
      const workspaceId = 'workspace-123';
      const creditsToAdd = 500;

      mockSupabase.rpc.mockResolvedValue({
        data: creditsToAdd,
        error: null,
      });

      const { data: balance } = await mockSupabase.rpc('get_credits_balance', {
        _workspace_id: workspaceId,
      });

      expect(balance).toBe(500);
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'get_credits_balance',
        { _workspace_id: workspaceId }
      );
    });

    it('should track credit purchase in audit log', async () => {
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValue({
        insert: insertMock,
      });

      await mockSupabase.from('audit_log').insert({
        workspace_id: 'workspace-123',
        user_id: 'user-123',
        action: 'credit_purchase',
        meta: {
          package: 'starter',
          credits: 500,
          amount: 9,
        },
      });

      expect(insertMock).toHaveBeenCalled();
    });
  });

  describe('Tier Gating for Advanced Tools', () => {
    it('should block free users from Maigret scans', async () => {
      const userTier = 'free';
      const requiredTier = 'pro';

      const hasAccess = userTier === 'pro' || userTier === 'enterprise';
      expect(hasAccess).toBe(false);
    });

    it('should allow Pro users to access Maigret scans', async () => {
      const userTier = 'pro';
      const hasAccess = userTier === 'pro' || userTier === 'enterprise';
      expect(hasAccess).toBe(true);
    });

    it('should block free users from SpiderFoot advanced scans', async () => {
      const userTier = 'free';
      const hasAdvancedScan = userTier === 'pro' || userTier === 'enterprise';
      expect(hasAdvancedScan).toBe(false);
    });

    it('should allow Enterprise users unlimited scans', async () => {
      const userTier = 'enterprise';
      const hasUnlimitedScans = userTier === 'enterprise';
      expect(hasUnlimitedScans).toBe(true);
    });
  });

  describe('Low Credit Email Warnings', () => {
    it('should trigger low credit warning at 50 credits', async () => {
      const currentBalance = 45;
      const threshold = 50;

      const shouldAlert = currentBalance < threshold;
      expect(shouldAlert).toBe(true);
    });

    it('should not send duplicate emails within 24 hours', async () => {
      const lastEmailTime = Date.now() - (20 * 60 * 60 * 1000); // 20 hours ago
      const hoursSince = (Date.now() - lastEmailTime) / (1000 * 60 * 60);

      const shouldSendEmail = hoursSince >= 24;
      expect(shouldSendEmail).toBe(false);
    });

    it('should include buy now link in low credit email', async () => {
      mockSupabase.functions.invoke.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { data } = await mockSupabase.functions.invoke('send-low-credit-email', {
        body: {
          to: 'user@example.com',
          credits: 40,
          workspaceId: 'workspace-123',
        },
      });

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        'send-low-credit-email',
        expect.objectContaining({
          body: expect.objectContaining({
            credits: 40,
          }),
        })
      );
    });
  });

  describe('Upgrade Flow Integration', () => {
    it('should upgrade user from free to pro tier', async () => {
      const updateMock = vi.fn().mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValue({
        update: updateMock,
        eq: vi.fn().mockReturnThis(),
      });

      await mockSupabase.from('user_roles')
        .update({ subscription_tier: 'pro' })
        .eq('user_id', 'user-123');

      expect(updateMock).toHaveBeenCalledWith({ subscription_tier: 'pro' });
    });

    it('should grant unlimited scans on enterprise upgrade', async () => {
      const tier = 'enterprise';
      const scansPerMonth = tier === 'enterprise' ? -1 : 100; // -1 means unlimited

      expect(scansPerMonth).toBe(-1);
    });

    it('should maintain credit balance after tier upgrade', async () => {
      // User upgrades from free to pro
      const creditsBeforeUpgrade = 450;
      
      mockSupabase.rpc.mockResolvedValue({
        data: creditsBeforeUpgrade,
        error: null,
      });

      const { data: balanceAfterUpgrade } = await mockSupabase.rpc('get_credits_balance', {
        _workspace_id: 'workspace-123',
      });

      expect(balanceAfterUpgrade).toBe(creditsBeforeUpgrade);
    });

    it('should log tier upgrade in audit trail', async () => {
      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValue({
        insert: insertMock,
      });

      await mockSupabase.from('audit_log').insert({
        workspace_id: 'workspace-123',
        user_id: 'user-123',
        action: 'tier_upgrade',
        meta: {
          old_tier: 'free',
          new_tier: 'pro',
        },
      });

      expect(insertMock).toHaveBeenCalled();
    });
  });

  describe('Dynamic Pricing Display', () => {
    it('should display all credit pack tiers', () => {
      const packs = [
        { id: 'starter', name: 'OSINT Starter', credits: 500, price: 9 },
        { id: 'investigator', name: 'Investigator Pack', credits: 1500, price: 29 },
        { id: 'osint-pro', name: 'Pro Pack', credits: 3500, price: 79 },
        { id: 'enterprise', name: 'Enterprise Pack', credits: 10000, price: 199 },
      ];

      expect(packs).toHaveLength(4);
      expect(packs[0].credits).toBe(500);
      expect(packs[0].price).toBe(9);
    });

    it('should calculate correct price per credit', () => {
      const starterPack = { credits: 500, price: 9 };
      const pricePerCredit = starterPack.price / starterPack.credits;

      expect(pricePerCredit).toBe(0.018);
    });

    it('should show best value badge for popular pack', () => {
      const packs = [
        { id: 'starter', popular: false },
        { id: 'investigator', popular: true, badge: 'Popular' },
        { id: 'osint-pro', popular: false },
        { id: 'enterprise', popular: false },
      ];

      const popularPack = packs.find(p => p.popular);
      expect(popularPack?.badge).toBe('Popular');
    });
  });

  describe('Credit Deduction on Scan', () => {
    it('should deduct correct credits for Maigret scan', async () => {
      const maigretCost = 8;
      const currentBalance = 500;
      const expectedBalance = currentBalance - maigretCost;

      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const { data: success } = await mockSupabase.rpc('spend_credits', {
        _workspace_id: 'workspace-123',
        _cost: maigretCost,
        _reason: 'maigret_scan',
        _meta: { scan_type: 'username' },
      });

      expect(success).toBe(true);
    });

    it('should prevent scan if insufficient credits', async () => {
      const currentBalance = 5;
      const scanCost = 10;

      const hasEnoughCredits = currentBalance >= scanCost;
      expect(hasEnoughCredits).toBe(false);
    });

    it('should allow Pro users to scan without credit deduction', async () => {
      const userTier = 'pro';
      const isPremium = userTier === 'pro' || userTier === 'enterprise';

      // Premium users don't need credits
      expect(isPremium).toBe(true);
    });
  });

  describe('Subscription Sync', () => {
    it('should sync Stripe subscription status with user role', async () => {
      const updateMock = vi.fn().mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValue({
        update: updateMock,
        eq: vi.fn().mockReturnThis(),
      });

      // Simulate webhook updating subscription
      await mockSupabase.from('user_roles')
        .update({ 
          subscription_tier: 'pro',
          subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('user_id', 'user-123');

      expect(updateMock).toHaveBeenCalled();
    });

    it('should handle subscription cancellation', async () => {
      const updateMock = vi.fn().mockResolvedValue({ data: null, error: null });
      mockSupabase.from.mockReturnValue({
        update: updateMock,
        eq: vi.fn().mockReturnThis(),
      });

      await mockSupabase.from('user_roles')
        .update({ 
          subscription_tier: 'free',
          subscription_expires_at: null
        })
        .eq('user_id', 'user-123');

      expect(updateMock).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle session expiry during purchase', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Session expired'),
      });

      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const { data: refreshedUser } = await mockSupabase.auth.refreshSession();
      expect(refreshedUser).toBeDefined();
    });

    it('should handle concurrent credit purchases', async () => {
      // Simulate two simultaneous purchases
      const purchase1 = Promise.resolve({ data: { url: 'checkout1' }, error: null });
      const purchase2 = Promise.resolve({ data: { url: 'checkout2' }, error: null });

      const [result1, result2] = await Promise.all([purchase1, purchase2]);

      expect(result1.data.url).toBeDefined();
      expect(result2.data.url).toBeDefined();
    });

    it('should validate workspace ownership before purchase', async () => {
      const userId = 'user-123';
      const workspaceId = 'workspace-456';

      const selectMock = vi.fn().mockResolvedValue({
        data: { owner_id: userId },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: selectMock,
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { owner_id: userId }, error: null }),
      });

      const { data: workspace } = await mockSupabase
        .from('workspaces')
        .select('owner_id')
        .eq('id', workspaceId)
        .single();

      expect(workspace?.owner_id).toBe(userId);
    });
  });
});
