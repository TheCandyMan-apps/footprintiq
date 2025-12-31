import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Lock, Mail, CheckCircle, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { useProPreview } from '@/hooks/useProPreview';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PostScanUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lockedSectionsCount: number;
  highRiskCount?: number;
}

const BENEFITS = [
  'See why this result exists',
  'Reduce false positives with context',
  'View correlation between findings',
  'Access deeper evidence signals',
];

export function PostScanUpgradeModal({
  open,
  onOpenChange,
  lockedSectionsCount,
  highRiskCount = 0,
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
          <DialogTitle className="text-xl">Want the full picture?</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Free scans show what exists.
            <br />
            Pro explains what it means.
          </DialogDescription>
        </DialogHeader>

        {/* Locked content indicator */}
        {(lockedSectionsCount > 0 || highRiskCount > 0) && (
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">
              {highRiskCount > 0 
                ? `${highRiskCount} high-risk findings need deeper analysis`
                : `${lockedSectionsCount} insights locked on your results`
              }
            </p>
          </div>
        )}

        {/* Benefits list */}
        <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-4">
          <ul className="space-y-2.5">
            {BENEFITS.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA buttons */}
        <div className="mt-4 space-y-3">
          {showTrialCTA ? (
            <>
              <Button
                onClick={handleStartTrial}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start Pro Preview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={handleUpgrade}
                variant="outline"
                className="w-full"
              >
                Upgrade to Pro
              </Button>
            </>
          ) : (
            <Button
              onClick={handleUpgrade}
              className="w-full"
              size="lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Pro
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          
          <button
            onClick={handleDismiss}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Continue with limited results
          </button>
        </div>

        {/* Trust line */}
        <p className="mt-3 text-center text-[10px] text-muted-foreground/70 border-t border-border/50 pt-3">
          Ethical OSINT only • Cancel anytime
        </p>
      </DialogContent>
    </Dialog>
  );
}
