import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TrialMetrics {
  totalTrialsStarted: number;
  activeTrials: number;
  convertedTrials: number;
  cancelledTrials: number;
  expiredTrials: number;
  conversionRate: number;
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
      // Build date filter — null means "all time"
      const isAllTime = !dateRange;
      const startDate = dateRange?.start || new Date('2020-01-01');
      const endDate = dateRange?.end || new Date();

      // Fetch trial metrics from workspaces (with graceful RLS error handling)
      const { data: workspaces, error: workspacesError } = await supabase
        .from('workspaces')
        .select('trial_status, trial_scans_used, trial_started_at')
        .not('trial_started_at', 'is', null);

      // Gracefully handle RLS errors - continue with empty data instead of throwing
      if (workspacesError) {
        console.warn('Admin trial metrics workspace query failed (RLS?):', workspacesError);
      }

      // Filter by date range if trial_started_at is within range
      const filteredWorkspaces = (workspaces || []).filter(w => {
        if (!w.trial_started_at) return false;
        const trialStart = new Date(w.trial_started_at);
        return trialStart >= startDate && trialStart <= endDate;
      });

      const totalTrialsStarted = filteredWorkspaces.length;
      const activeTrials = filteredWorkspaces.filter(w => w.trial_status === 'active').length;
      const convertedTrials = filteredWorkspaces.filter(w => w.trial_status === 'converted').length;
      const cancelledTrials = filteredWorkspaces.filter(w => w.trial_status === 'cancelled').length;
      const expiredTrials = filteredWorkspaces.filter(w => w.trial_status === 'expired').length;
      
      const conversionRate = totalTrialsStarted > 0 
        ? (convertedTrials / totalTrialsStarted) * 100 
        : 0;
      
      const totalScans = filteredWorkspaces.reduce((sum, w) => sum + (w.trial_scans_used || 0), 0);
      const avgScansUsed = totalTrialsStarted > 0 ? totalScans / totalTrialsStarted : 0;

      // Fetch email metrics (with graceful RLS error handling)
      const { data: emails, error: emailsError } = await supabase
        .from('email_notifications')
        .select('type, sent_at, delivered_at, opened_at, clicked_at, bounced_at')
        .gte('sent_at', startDate.toISOString())
        .lte('sent_at', endDate.toISOString());

      // Gracefully handle RLS errors - continue with empty data instead of throwing
      if (emailsError) {
        console.warn('Admin email metrics query failed (RLS?):', emailsError);
      }

      // Calculate overall email metrics
      const allEmails = emails || [];
      const totalSent = allEmails.length;
      const totalDelivered = allEmails.filter(e => e.delivered_at).length;
      const totalOpened = allEmails.filter(e => e.opened_at).length;
      const totalClicked = allEmails.filter(e => e.clicked_at).length;
      const totalBounced = allEmails.filter(e => e.bounced_at).length;

      const overallOpenRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
      const overallClickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;
      const overallBounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;

      // Group by email type
      const emailTypes = ['trial_started', 'trial_ending', 'trial_converted', 'low_credit_warning'];
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
      }).filter(m => m.sent > 0); // Only include types with sent emails

      return {
        trialMetrics: {
          totalTrialsStarted,
          activeTrials,
          convertedTrials,
          cancelledTrials,
          expiredTrials,
          conversionRate,
          avgScansUsed,
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
    refetchInterval: 60000, // Refresh every minute
  });
}
