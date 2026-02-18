import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Renamed from TrialMetrics — now tracks subscription conversion (free vs pro)
export interface TrialMetrics {
  totalFreeUsers: number;
  totalProUsers: number;
  conversionRate: number;
  // Legacy fields kept to avoid breaking component consumers
  totalTrialsStarted: number;
  activeTrials: number;
  convertedTrials: number;
  cancelledTrials: number;
  expiredTrials: number;
  avgScansUsed: number;
}

export interface EmailTypeMetrics {
  type: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
}

export interface EmailMetrics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  overallOpenRate: number;
  overallClickRate: number;
  overallBounceRate: number;
  byType: EmailTypeMetrics[];
}

export interface TrialEmailAnalytics {
  trialMetrics: TrialMetrics;
  emailMetrics: EmailMetrics;
}

export function useTrialEmailAnalytics(dateRange: { start: Date; end: Date } | null = null) {
  return useQuery({
    queryKey: ['trial-email-analytics', dateRange?.start?.toISOString(), dateRange?.end?.toISOString()],
    queryFn: async (): Promise<TrialEmailAnalytics> => {
      const startDate = dateRange?.start || new Date('2020-01-01');
      const endDate = dateRange?.end || new Date();

      // Fetch subscription conversion metrics (free vs pro workspaces)
      const { data: workspaces, error: workspacesError } = await supabase
        .from('workspaces')
        .select('subscription_tier, created_at');

      if (workspacesError) {
        console.warn('Admin conversion metrics query failed (RLS?):', workspacesError);
      }

      const allWorkspaces = (workspaces || []).filter(w => {
        if (!w.created_at) return false;
        const created = new Date(w.created_at);
        return created >= startDate && created <= endDate;
      });

      const totalFreeUsers = allWorkspaces.filter(w =>
        !w.subscription_tier || w.subscription_tier === 'free'
      ).length;

      const totalProUsers = allWorkspaces.filter(w =>
        w.subscription_tier === 'pro' ||
        w.subscription_tier === 'premium' ||
        w.subscription_tier === 'enterprise'
      ).length;

      const totalUsers = totalFreeUsers + totalProUsers;
      const conversionRate = totalUsers > 0 ? (totalProUsers / totalUsers) * 100 : 0;

      // Fetch email metrics (with graceful RLS error handling)
      const { data: emails, error: emailsError } = await supabase
        .from('email_notifications')
        .select('type, sent_at, delivered_at, opened_at, clicked_at, bounced_at')
        .gte('sent_at', startDate.toISOString())
        .lte('sent_at', endDate.toISOString());

      if (emailsError) {
        console.warn('Admin email metrics query failed (RLS?):', emailsError);
      }

      const allEmails = emails || [];
      const totalSent = allEmails.length;
      const totalDelivered = allEmails.filter(e => e.delivered_at).length;
      const totalOpened = allEmails.filter(e => e.opened_at).length;
      const totalClicked = allEmails.filter(e => e.clicked_at).length;
      const totalBounced = allEmails.filter(e => e.bounced_at).length;

      const overallOpenRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
      const overallClickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;
      const overallBounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;

      const emailTypes = ['welcome', 'scan_complete', 'low_credit_warning', 'subscription_created', 'subscription_cancelled'];
      const byType: EmailTypeMetrics[] = emailTypes.map(type => {
        const typeEmails = allEmails.filter(e => e.type === type);
        const sent = typeEmails.length;
        const delivered = typeEmails.filter(e => e.delivered_at).length;
        const opened = typeEmails.filter(e => e.opened_at).length;
        const clicked = typeEmails.filter(e => e.clicked_at).length;
        const bounced = typeEmails.filter(e => e.bounced_at).length;

        return {
          type,
          sent,
          delivered,
          opened,
          clicked,
          bounced,
          openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
          clickRate: delivered > 0 ? (clicked / delivered) * 100 : 0,
          clickToOpenRate: opened > 0 ? (clicked / opened) * 100 : 0,
        };
      }).filter(m => m.sent > 0);

      return {
        trialMetrics: {
          totalFreeUsers,
          totalProUsers,
          conversionRate,
          // Legacy fields set to 0 — trials removed
          totalTrialsStarted: 0,
          activeTrials: 0,
          convertedTrials: totalProUsers,
          cancelledTrials: 0,
          expiredTrials: 0,
          avgScansUsed: 0,
        },
        emailMetrics: {
          totalSent,
          totalDelivered,
          totalOpened,
          totalClicked,
          totalBounced,
          overallOpenRate,
          overallClickRate,
          overallBounceRate,
          byType,
        },
      };
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
  });
}
