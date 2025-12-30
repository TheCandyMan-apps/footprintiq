import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useState } from "react";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { VerificationBlockedMessage } from "@/components/auth/EmailVerificationBanner";
import { useProPreview } from "@/hooks/useProPreview";

interface ProUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * ProUpgradeModal - Modal shown when free users try to access locked sections.
 * Shows trial option if eligible, otherwise upgrade to Pro.
 */
export function ProUpgradeModal({ open, onOpenChange }: ProUpgradeModalProps) {
  const { toast } = useToast();
  const { workspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const { isVerified, isLoading: verificationLoading } = useEmailVerification();
  const { isTrialEligible, isTrialActive, startTrialCheckout, loading: trialLoading } = useProPreview();

  // Show verification prompt if not verified
  const shouldShowVerification = !verificationLoading && !isVerified;

  const handleUpgrade = async () => {
    if (!workspace?.id) {
      toast({
        title: "Error",
        description: "No workspace selected",
        variant: "destructive",
      });
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upgrade your plan.",
        variant: "destructive",
      });
      window.location.href = "/auth";
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: { plan: "pro", workspaceId: workspace.id },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({
        title: "Checkout error",
        description: err?.message || "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      await startTrialCheckout();
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Reduce false positives with source context",
    "See how usernames and profiles connect",
    "Access deeper evidence and confidence signals",
    "Reveal hidden exposure you can't see on the free plan",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {shouldShowVerification ? (
          <>
            <DialogHeader className="text-center pb-2">
              <DialogTitle className="text-xl font-semibold leading-tight">
                Verify your email first
              </DialogTitle>
            </DialogHeader>
            <VerificationBlockedMessage />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Close
            </Button>
          </>
        ) : (
          <>
            <DialogHeader className="text-center pb-2">
              {/* Lock icon header */}
              <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-7 w-7 text-primary" />
              </div>

              <DialogTitle className="text-xl font-semibold leading-tight">
                Unlock the full picture of your digital footprint
              </DialogTitle>

              <DialogDescription className="pt-4 text-base text-muted-foreground">
                <span className="block mb-1">Free scans show what exists.</span>
                <span className="block font-medium text-foreground">
                  Pro explains what it means.
                </span>
              </DialogDescription>
            </DialogHeader>

            {/* Benefits list */}
            <div className="py-4">
              <p className="text-sm font-medium mb-3">
                Upgrade to FootprintIQ Pro to:
              </p>
              <ul className="space-y-2.5">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-2 pt-2">
              {isTrialEligible && !isTrialActive ? (
                <>
                  <Button
                    onClick={handleStartTrial}
                    disabled={loading || trialLoading}
                    size="lg"
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {loading ? "Processing..." : "Start Pro Preview"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleUpgrade}
                    disabled={loading}
                    size="sm"
                    className="w-full"
                  >
                    {loading ? "Processing..." : "Upgrade to Pro"}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleUpgrade}
                  disabled={loading}
                  size="lg"
                  className="w-full"
                >
                  {loading ? "Processing..." : "Upgrade to Pro"}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Continue with limited results
              </Button>
            </div>

            {/* Trust line */}
            <p className="text-[11px] text-muted-foreground/60 text-center pt-2">
              Ethical OSINT only • Public data sources • No monitoring • Cancel anytime
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
