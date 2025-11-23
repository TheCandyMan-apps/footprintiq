import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';

const SUGGESTION_KEYS = {
  API_KEYS: 'feature_suggestion_api_keys_shown',
  REFERRALS: 'feature_suggestion_referrals_shown',
  DARK_WEB: 'feature_suggestion_dark_web_shown',
  ANALYTICS: 'feature_suggestion_analytics_shown',
  WORKFLOWS: 'feature_suggestion_workflows_shown',
} as const;

interface FeatureSuggestion {
  title: string;
  description: string;
  action: string;
  link: string;
}

export function useFeatureSuggestions(userId?: string) {
  const { toast } = useToast();
  const { workspace } = useWorkspace();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!userId || hasChecked) return;

    checkAndShowSuggestions();
    setHasChecked(true);
  }, [userId, hasChecked]);

  const checkAndShowSuggestions = async () => {
    if (!userId) return;

    try {
      // Check scan count for API automation suggestion
      const { count: scanCount } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (scanCount && scanCount >= 3) {
        showSuggestion(SUGGESTION_KEYS.API_KEYS, {
          title: '🚀 Automate Your Scans',
          description: 'You\'ve run 3+ scans! Use API Keys to automate your workflow.',
          action: 'Set Up API Keys',
          link: '/api-keys',
        });
      }

      // Check credit balance for referrals suggestion
      if (workspace?.id) {
        const { data: creditData } = await supabase
          .from('credits_ledger')
          .select('delta')
          .eq('workspace_id', workspace.id)
          .order('created_at', { ascending: false })
          .limit(50);

        const balance = creditData?.reduce((sum, entry) => sum + (entry.delta || 0), 0) || 0;

        if (balance >= 100) {
          showSuggestion(SUGGESTION_KEYS.REFERRALS, {
            title: '💰 Earn More Credits',
            description: 'You have 100+ credits! Invite friends to earn even more.',
            action: 'View Referral Program',
            link: '/referrals',
          });
        }
      }

      // Check for high-risk findings for dark web monitoring
      const { data: highRiskScans } = await supabase
        .from('scans')
        .select('high_risk_count')
        .eq('user_id', userId)
        .gt('high_risk_count', 0)
        .limit(1);

      if (highRiskScans && highRiskScans.length > 0) {
        showSuggestion(SUGGESTION_KEYS.DARK_WEB, {
          title: '🔒 High Risk Detected',
          description: 'Dark Web Monitoring can track leaked credentials in real-time.',
          action: 'Enable Monitoring',
          link: '/settings?tab=dark-web',
        });
      }

      // Check for multiple scans to suggest analytics
      if (scanCount && scanCount >= 5) {
        showSuggestion(SUGGESTION_KEYS.ANALYTICS, {
          title: '📊 Track Your Progress',
          description: 'You have 5+ scans! View detailed analytics and trends.',
          action: 'View Analytics',
          link: '/analytics/ai',
        });
      }

      // Check for frequent scanning to suggest workflows
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const { count: recentScans } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (recentScans && recentScans >= 3) {
        showSuggestion(SUGGESTION_KEYS.WORKFLOWS, {
          title: '⚡ Automate Repetitive Tasks',
          description: 'Create workflows to automate your investigation process.',
          action: 'Explore Workflows',
          link: '/workflows',
        });
      }
    } catch (error) {
      console.error('Error checking feature suggestions:', error);
    }
  };

  const showSuggestion = (key: string, suggestion: FeatureSuggestion) => {
    // Check if we've already shown this suggestion
    const hasShown = localStorage.getItem(key);
    if (hasShown) return;

    // Mark as shown
    localStorage.setItem(key, 'true');

    // Show toast with suggestion
    toast({
      title: suggestion.title,
      description: `${suggestion.description} Click to ${suggestion.action.toLowerCase()}.`,
      duration: 10000, // Show for 10 seconds
      onClick: () => {
        window.location.href = suggestion.link;
      },
    });
  };

  return { checkAndShowSuggestions };
}
