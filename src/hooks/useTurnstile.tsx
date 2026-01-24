import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Turnstile configuration and types
 */
export interface TurnstileOptions {
  siteKey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  action?: string;
}

export interface TurnstileWidgetAPI {
  render: (container: HTMLElement | string, options: TurnstileRenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
  getResponse: (widgetId: string) => string | undefined;
}

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: (error: Error) => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  action?: string;
}

// Extend window for Turnstile
declare global {
  interface Window {
    turnstile?: TurnstileWidgetAPI;
    onloadTurnstileCallback?: () => void;
  }
}

// Script loading state - module-level singleton
let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks: (() => void)[] = [];

/**
 * Load the Turnstile script globally (once)
 * Includes guard against duplicate script injection
 */
function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded and available
    if (scriptLoaded && window.turnstile) {
      resolve();
      return;
    }

    // Check if script tag already exists (handles page reloads/HMR)
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
    if (existingScript && window.turnstile) {
      scriptLoaded = true;
      resolve();
      return;
    }

    // Currently loading - queue callback
    if (scriptLoading) {
      loadCallbacks.push(resolve);
      return;
    }

    scriptLoading = true;

    // Define callback before loading script
    window.onloadTurnstileCallback = () => {
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };

    // Only inject if not already present
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback';
      script.async = true;
      script.defer = true;

      script.onerror = () => {
        scriptLoading = false;
        reject(new Error('Failed to load Turnstile script'));
      };

      document.head.appendChild(script);
    } else {
      // Script exists but turnstile not ready - wait for it
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          scriptLoaded = true;
          scriptLoading = false;
          resolve();
        }
      }, 100);
    }
  });
}

/**
 * Custom hook for Turnstile integration
 */
export function useTurnstile(options?: Partial<TurnstileOptions>) {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Turnstile site key - public/publishable key (safe to embed in frontend)
  const siteKey = options?.siteKey || import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACOjjSKdXrRWkTa-';

  // Initialize Turnstile
  const initialize = useCallback(async (container: HTMLDivElement) => {
    if (!siteKey) {
      console.warn('[Turnstile] No site key configured - bypassing verification');
      setIsReady(true);
      return;
    }

    containerRef.current = container;

    try {
      await loadTurnstileScript();

      if (!window.turnstile) {
        throw new Error('Turnstile API not available');
      }

      // Remove existing widget if any
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore removal errors
        }
      }

      // Render new widget
      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: siteKey,
        theme: options?.theme || 'auto',
        size: options?.size || 'normal',
        action: options?.action,
        callback: (newToken: string) => {
          setToken(newToken);
          setError(null);
        },
        'error-callback': (err: Error) => {
          setError(err.message || 'Verification failed');
          setToken(null);
        },
        'expired-callback': () => {
          setToken(null);
          setError('Verification expired - please try again');
        },
      });

      setIsReady(true);
    } catch (err) {
      console.error('[Turnstile] Initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize verification');
      setIsReady(true); // Allow form to proceed on initialization failure
    }
  }, [siteKey, options?.theme, options?.size, options?.action]);

  // Reset the widget to get a new token
  const reset = useCallback(() => {
    setToken(null);
    setError(null);

    if (window.turnstile && widgetIdRef.current) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (err) {
        console.warn('[Turnstile] Reset error:', err);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return {
    token,
    isReady,
    error,
    initialize,
    reset,
    hasToken: !!token,
    siteKeyConfigured: !!siteKey,
  };
}
