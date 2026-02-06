import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Copy, Mail, Share2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/analytics";

interface ReferralPromptProps {
  className?: string;
  variant?: "inline" | "card";
}

export function ReferralPrompt({ className, variant = "card" }: ReferralPromptProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReferralCode();
  }, []);

  const loadReferralCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get existing referral code
      const { data: existingCode } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingCode?.code) {
        setReferralCode(existingCode.code);
      } else {
        // Generate a simple code
        const code = `${user.email?.split('@')[0]?.slice(0, 8) || 'FIQ'}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        
        const { error } = await supabase
          .from('referral_codes')
          .insert({ user_id: user.id, code });
        
        if (!error) {
          setReferralCode(code);
        }
      }
    } catch (err) {
      console.error('Failed to load referral code:', err);
    } finally {
      setLoading(false);
    }
  };

  const referralUrl = referralCode 
    ? `https://footprintiq.app?ref=${referralCode}`
    : 'https://footprintiq.app';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      analytics.trackEvent('referral_link_copied', { code: referralCode });
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Check your digital footprint");
    const body = encodeURIComponent(
      `I just scanned my digital footprint on FootprintIQ and found some surprising results.\n\nCheck yours for free: ${referralUrl}`
    );
    analytics.trackEvent('referral_email_click', { code: referralCode });
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check your digital footprint',
          text: 'I just scanned my digital footprint on FootprintIQ.',
          url: referralUrl,
        });
        analytics.trackEvent('referral_native_share', { code: referralCode });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  if (loading) {
    return null;
  }

  if (variant === "inline") {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Know someone who should check their exposure?</span>
          <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={handleCopy}>
            Share referral link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-1">Know someone who should check their exposure?</h3>
            <p className="text-xs text-muted-foreground">
              Share your referral link and earn 100 credits when they complete their first scan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEmailShare}
            className="gap-2"
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNativeShare}
            className="gap-2"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
