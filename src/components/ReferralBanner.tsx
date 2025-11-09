import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';

export function ReferralBanner() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [hasReferralCode, setHasReferralCode] = useState(false);

  useEffect(() => {
    checkReferralStatus();
  }, []);

  const checkReferralStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user has created a referral code
      const { data: code } = await supabase
        .from('referral_codes')
        .select('id')
        .eq('user_id', user.id)
        .single();

      setHasReferralCode(!!code);

      // Show banner if user doesn't have a code and hasn't dismissed it recently
      const dismissed = localStorage.getItem('referral-banner-dismissed');
      if (!code && !dismissed) {
        setVisible(true);
      }
    } catch (error) {
      console.error('Error checking referral status:', error);
    }
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('referral-banner-dismissed', Date.now().toString());
  };

  const goToReferrals = () => {
    navigate('/referrals');
    dismiss();
  };

  if (!visible || hasReferralCode) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">
                Earn 100 credits per referral! 🎉
              </p>
              <p className="text-xs text-muted-foreground">
                Create your referral code and start earning today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={goToReferrals}>
              Get Started
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={dismiss}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
