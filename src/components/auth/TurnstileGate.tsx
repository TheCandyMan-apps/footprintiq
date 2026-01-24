import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useTurnstile } from '@/hooks/useTurnstile';
import { AlertCircle, Shield, Loader2 } from 'lucide-react';

export interface TurnstileGateRef {
  reset: () => void;
  getToken: () => string | null;
}

export interface TurnstileGateProps {
  /** Callback when token is obtained */
  onToken?: (token: string) => void;
  /** Callback when token expires or error occurs */
  onError?: (error: string) => void;
  /** Theme override */
  theme?: 'light' | 'dark' | 'auto';
  /** Size variant */
  size?: 'normal' | 'compact';
  /** Action label for analytics */
  action?: string;
  /** Show inline with minimal UI */
  inline?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Reusable Turnstile verification component
 * Renders Cloudflare Turnstile in managed mode with explicit rendering
 */
export const TurnstileGate = forwardRef<TurnstileGateRef, TurnstileGateProps>(
  ({ onToken, onError, theme = 'auto', size = 'normal', action, inline = false, className = '' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { token, isReady, error, initialize, reset, siteKeyConfigured } = useTurnstile({
      theme,
      size,
      action,
    });

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      reset,
      getToken: () => token,
    }), [reset, token]);

    // Initialize widget when container is available
    useEffect(() => {
      if (containerRef.current && siteKeyConfigured) {
        initialize(containerRef.current);
      }
    }, [initialize, siteKeyConfigured]);

    // Notify parent when token changes
    useEffect(() => {
      if (token) {
        onToken?.(token);
      }
    }, [token, onToken]);

    // Notify parent on error
    useEffect(() => {
      if (error) {
        onError?.(error);
      }
    }, [error, onError]);

    // If no site key configured, render nothing (bypass)
    if (!siteKeyConfigured) {
      return null;
    }

    if (inline) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <div ref={containerRef} className="turnstile-container" />
          {!isReady && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading verification...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-1 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Security verification</span>
        </div>
        
        <div ref={containerRef} className="turnstile-container" />
        
        {!isReady && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading verification...</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center gap-1 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        {token && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
            <Shield className="h-4 w-4" />
            <span>Verified</span>
          </div>
        )}
      </div>
    );
  }
);

TurnstileGate.displayName = 'TurnstileGate';
