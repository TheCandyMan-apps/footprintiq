import { ReactNode } from "react";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { VerificationBlockedMessage } from "./EmailVerificationBanner";
import { analytics } from "@/lib/analytics";
import { useEffect } from "react";

interface VerificationGatedActionProps {
  /** Content to show when verified */
  children: ReactNode;
  /** Fallback content when unverified (defaults to VerificationBlockedMessage) */
  fallback?: ReactNode;
  /** Action name for analytics tracking */
  action: 'second_scan' | 'locked_section' | 'upgrade' | 'pro_preview';
  /** Custom className */
  className?: string;
}

/**
 * VerificationGatedAction - Wrapper that shows verification prompt instead of children when unverified.
 * Used to gate actions like second scans, locked sections, upgrades, etc.
 */
export function VerificationGatedAction({ 
  children, 
  fallback,
  action,
  className 
}: VerificationGatedActionProps) {
  const { isVerified, isLoading } = useEmailVerification();

  // Track blocked action
  useEffect(() => {
    if (!isLoading && !isVerified) {
      analytics.trackEvent('email_verification_blocked_action', { action });
    }
  }, [isLoading, isVerified, action]);

  // Show loading state briefly
  if (isLoading) {
    return <div className={className}>{children}</div>;
  }

  // If verified, show the actual content
  if (isVerified) {
    return <div className={className}>{children}</div>;
  }

  // Show verification prompt
  return (
    <div className={className}>
      {fallback || <VerificationBlockedMessage />}
    </div>
  );
}
