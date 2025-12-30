import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

interface EmailVerificationBannerProps {
  /** Placement for analytics tracking */
  placement?: 'scan_page' | 'results' | 'upgrade_modal' | 'locked_section';
  /** Compact mode for inline display */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * EmailVerificationBanner - Calm, professional inline banner prompting email verification.
 * Copy follows exact specification - no scary warnings or aggressive CTAs.
 */
export function EmailVerificationBanner({ 
  placement = 'results', 
  compact = false,
  className 
}: EmailVerificationBannerProps) {
  const { 
    isVerified, 
    isLoading, 
    isResending, 
    canResend, 
    cooldownSeconds,
    resendVerificationEmail 
  } = useEmailVerification();

  // Track banner shown
  useEffect(() => {
    if (!isLoading && !isVerified) {
      analytics.trackEvent('email_verification_banner_shown', { placement });
    }
  }, [isLoading, isVerified, placement]);

  // Don't render if verified or still loading
  if (isLoading || isVerified) {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 ${className}`}>
        <Mail className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Verify your email to continue</p>
        </div>
        <Button
          size="sm"
          onClick={resendVerificationEmail}
          disabled={isResending || !canResend}
        >
          {isResending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : canResend ? (
            'Verify email'
          ) : (
            `${cooldownSeconds}s`
          )}
        </Button>
      </div>
    );
  }

  return (
    <Alert className={`border-primary/20 bg-primary/5 ${className}`}>
      <Mail className="h-5 w-5 text-primary" />
      <AlertDescription className="ml-2">
        <div className="space-y-3">
          {/* Headline */}
          <p className="font-semibold text-foreground">
            Please verify your email to continue
          </p>
          
          {/* Body */}
          <p className="text-sm text-muted-foreground">
            We require email verification to protect the platform from abuse and ensure responsible OSINT usage.
          </p>
          
          {/* CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={resendVerificationEmail}
              disabled={isResending || !canResend}
              size="sm"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : canResend ? (
                'Verify email'
              ) : (
                `Wait ${cooldownSeconds}s`
              )}
            </Button>
            
            {/* Secondary text */}
            <span className="text-xs text-muted-foreground">
              Already sent — check your inbox or spam folder
            </span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * VerificationBlockedMessage - Simple message shown when action is blocked.
 */
export function VerificationBlockedMessage({ className }: { className?: string }) {
  const { resendVerificationEmail, isResending, canResend, cooldownSeconds } = useEmailVerification();

  return (
    <div className={`text-center space-y-4 p-6 ${className}`}>
      <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Mail className="h-6 w-6 text-primary" />
      </div>
      
      <div>
        <p className="font-medium text-foreground mb-1">
          Verify your email to unlock full results and continue scanning.
        </p>
        <p className="text-sm text-muted-foreground">
          We require email verification to protect the platform from abuse.
        </p>
      </div>
      
      <Button
        onClick={resendVerificationEmail}
        disabled={isResending || !canResend}
      >
        {isResending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : canResend ? (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Verify email
          </>
        ) : (
          `Wait ${cooldownSeconds}s`
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground">
        Already sent — check your inbox or spam folder
      </p>
    </div>
  );
}
