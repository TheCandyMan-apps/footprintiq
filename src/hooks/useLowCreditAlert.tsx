import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const LOW_CREDIT_THRESHOLD = 50;
const ALERT_STORAGE_KEY = 'low_credit_alert_shown';

export function useLowCreditAlert(workspaceId: string | undefined) {
  const { data: credits } = useQuery({
    queryKey: ['credits-balance', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const { data } = await supabase.rpc('get_credits_balance', {
        _workspace_id: workspaceId,
      });
      return data;
    },
    enabled: !!workspaceId,
    refetchInterval: 60000, // Check every minute
  });

  useEffect(() => {
    if (credits === null || credits === undefined) return;
    if (credits >= LOW_CREDIT_THRESHOLD) {
      // Reset alert when credits are topped up
      localStorage.removeItem(ALERT_STORAGE_KEY);
      return;
    }

    // Check if alert was already shown in this session
    const alertShown = sessionStorage.getItem(ALERT_STORAGE_KEY);
    if (alertShown) return;

    // Show toast notification
    toast({
      title: '⚠️ Low Credits Alert',
      description: `You have ${credits} credits left. Buy more to continue using premium features.`,
      variant: 'destructive',
      duration: 10000,
    });

    // Mark alert as shown for this session
    sessionStorage.setItem(ALERT_STORAGE_KEY, 'true');

    // Send email notification (fire and forget)
    sendLowCreditEmail(workspaceId!, credits).catch(console.error);
  }, [credits, workspaceId]);

  return { credits, isLowCredit: credits !== null && credits < LOW_CREDIT_THRESHOLD };
}

async function sendLowCreditEmail(workspaceId: string, credits: number) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    // Check if email was sent recently (within 24 hours)
    const lastEmailKey = `low_credit_email_${workspaceId}`;
    const lastEmailTime = localStorage.getItem(lastEmailKey);
    
    if (lastEmailTime) {
      const hoursSince = (Date.now() - parseInt(lastEmailTime)) / (1000 * 60 * 60);
      if (hoursSince < 24) return; // Don't spam emails
    }

    await supabase.functions.invoke('send-low-credit-email', {
      body: {
        to: user.email,
        credits,
        workspaceId,
      },
    });

    // Store timestamp of email sent
    localStorage.setItem(lastEmailKey, Date.now().toString());
  } catch (error) {
    console.error('Failed to send low credit email:', error);
  }
}
