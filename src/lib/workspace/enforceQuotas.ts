import type { SubscriptionTier } from '@/hooks/useSubscription';
import { PLAN_QUOTAS } from './quotas';

export class QuotaExceededError extends Error {
  constructor(
    public quota: string,
    public limit: number,
    public current: number,
    public tier: SubscriptionTier
  ) {
    super(`Quota exceeded: ${quota}. Limit: ${limit}, Current: ${current}. Upgrade to continue.`);
    this.name = 'QuotaExceededError';
  }
}

export function checkQuota(
  tier: SubscriptionTier,
  quota: keyof typeof PLAN_QUOTAS.free,
  currentUsage: number
): void {
  const quotas = PLAN_QUOTAS[tier];
  const limit = quotas[quota];

  if (typeof limit === 'boolean') {
    if (!limit) {
      throw new QuotaExceededError(quota, 0, 1, tier);
    }
    return;
  }

  if (typeof limit === 'number') {
    if (limit === -1) return; // unlimited
    if (currentUsage >= limit) {
      throw new QuotaExceededError(quota, limit, currentUsage, tier);
    }
  }
}

export async function enforceMonthlyScans(
  tier: SubscriptionTier,
  workspaceId: string,
  supabase: any
): Promise<void> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('scans')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .gte('created_at', startOfMonth.toISOString());

  if (error) throw error;

  checkQuota(tier, 'scansPerMonth', count || 0);
}

export async function enforceMonitors(
  tier: SubscriptionTier,
  workspaceId: string,
  supabase: any
): Promise<void> {
  const { count, error } = await supabase
    .from('dark_web_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);

  if (error) throw error;

  checkQuota(tier, 'monitorsPerWorkspace', count || 0);
}

export async function enforceAIQueries(
  tier: SubscriptionTier,
  workspaceId: string,
  supabase: any
): Promise<void> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Count AI queries from audit log this month
  const { count, error } = await supabase
    .from('audit_log')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('action', 'ai_analyst_query')
    .gte('created_at', startOfMonth.toISOString());

  if (error) throw error;

  checkQuota(tier, 'aiAnalystQueries', count || 0);
}
