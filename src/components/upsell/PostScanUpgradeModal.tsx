/**
 * PostScanUpgradeModal Component
 * 
 * Post-results modal shown once per scan after results render.
 * 
 * Headline: "Want clarity on what this actually means?"
 * Body: "You're viewing a redacted summary of an advanced scan.
 *        Unlock Pro to see full sources, confidence scores, and connections."
 * 
 * Buttons:
 * - "Unlock full analysis" (primary)
 * - "Continue with free results" (text link)
 * 
 * Rules:
 * - Show modal only once per scan
 * - Never show during scan processing
 * - No urgency, discounts, or countdowns
 */

import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Lock, Mail, ArrowRight, RefreshCw, Shield } from 'lucide-react';
import { useProPreview } from '@/hooks/useProPreview';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useNavigate } from 'react-router-dom';

interface PostScanUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lockedSectionsCount: number;
  highRiskCount?: number;
  signalsFound?: number;
}

export function PostScanUpgradeModal({
  open,
  onOpenChange,
  lockedSectionsCount,
  highRiskCount = 0,
  signalsFound = 0,
}: PostScanUpgradeModalProps) {
  const navigate = useNavigate();
  const { isTrialEligible, isTrialActive, startTrialCheckout, loading: trialLoading } = useProPreview();
  const { 
    isVerified, 
    isLoading: verificationLoading, 
    isResending, 
    canResend, 
    cooldownSeconds,
    resendVerificationEmail 
  } = useEmailVerification();

  const handleStartTrial = async () => {
    await startTrialCheckout();
    onOpenChange(false);
  };

  const handleUpgrade = () => {
    navigate('/pricing');
    onOpenChange(false);
  };

  const handleDismiss = () => {
    onOpenChange(false);
  };

  const isLoading = trialLoading || verificationLoading;
  const showTrialCTA = isVerified && isTrialEligible && !isTrialActive;

  // Email verification gate content
  if (!verificationLoading && !isVerified) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-xl">Verify your email first</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              To unlock Pro Preview, please verify your email.
              Check your inbox for a verification link.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <Button
              onClick={resendVerificationEmail}
              disabled={isResending || !canResend}
              className="w-full"
              variant="default"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : !canResend ? (
                `Resend in ${cooldownSeconds}s`
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend verification email
                </>
              )}
            </Button>
            
            <button
              onClick={handleDismiss}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Continue with free results
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main upgrade modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-xl">
            Want clarity on what this actually means?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-3 space-y-2">
            <span className="block">
              You're viewing a redacted summary of an advanced scan.
            </span>
            <span className="block">
              Unlock Pro to see full sources, confidence scores, and connections.
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* CTA buttons */}
        <div className="mt-6 space-y-3">
          {showTrialCTA ? (
            <Button
              onClick={handleStartTrial}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              Unlock full analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleUpgrade}
              className="w-full"
              size="lg"
            >
              Unlock full analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          
          <button
            onClick={handleDismiss}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Continue with free results
          </button>
        </div>

        {/* Trust line */}
        <p className="mt-4 text-center text-[10px] text-muted-foreground/70 border-t border-border/50 pt-4 flex items-center justify-center gap-1.5">
          <Shield className="h-2.5 w-2.5" />
          Public sources only • Ethical OSINT • Cancel anytime
        </p>
      </DialogContent>
    </Dialog>
  );
}
