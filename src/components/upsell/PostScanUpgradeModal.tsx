import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Lock, Mail, CheckCircle, Sparkles, ArrowRight, RefreshCw, Shield, Eye, TrendingUp, FileText } from 'lucide-react';
import { useProPreview } from '@/hooks/useProPreview';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PostScanUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lockedSectionsCount: number;
  highRiskCount?: number;
  signalsFound?: number;
}

const BENEFITS = [
  { icon: Eye, text: 'See why each finding exists' },
  { icon: TrendingUp, text: 'Confidence scores on all signals' },
  { icon: Shield, text: 'Full connection graph' },
  { icon: FileText, text: 'Export reports & evidence packs' },
];

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

  // Main upgrade modal - New narrative copy
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
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            Free shows what exists. Pro explains what it means.
          </DialogDescription>
        </DialogHeader>

        {/* Locked content indicator */}
        {signalsFound > 0 && (
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">
              {signalsFound} signal{signalsFound !== 1 ? 's' : ''} found
              {lockedSectionsCount > 0 && (
                <> · {lockedSectionsCount} insight{lockedSectionsCount !== 1 ? 's' : ''} locked</>
              )}
            </p>
          </div>
        )}

        {/* Benefits list */}
        <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-4">
          <ul className="space-y-2.5">
            {BENEFITS.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <li key={i} className="flex items-center gap-2.5 text-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-3 w-3 text-primary" />
                  </div>
                  <span>{benefit.text}</span>
                </li>
              );
            })}
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
                Unlock full analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={handleUpgrade}
                variant="outline"
                className="w-full"
              >
                See Pro plans
              </Button>
            </>
          ) : (
            <Button
              onClick={handleUpgrade}
              className="w-full"
              size="lg"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Unlock full analysis
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
        <p className="mt-3 text-center text-[10px] text-muted-foreground/70 border-t border-border/50 pt-3 flex items-center justify-center gap-1.5">
          <Shield className="h-2.5 w-2.5" />
          Public sources only • Ethical OSINT • Cancel anytime
        </p>
      </DialogContent>
    </Dialog>
  );
}
