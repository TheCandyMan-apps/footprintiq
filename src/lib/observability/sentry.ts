/**
 * Sentry Error Tracking Configuration
 * 
 * Initialize with:
 * import { initSentry, captureException, addBreadcrumb } from '@/lib/observability/sentry';
 * initSentry();
 */

interface SentryConfig {
  dsn?: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  enabled: boolean;
}

interface ErrorContext {
  user?: {
    id: string;
    email?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

class SentryClient {
  private config: SentryConfig;
  private initialized = false;

  constructor() {
    this.config = {
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION || 'development',
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      enabled: !!import.meta.env.VITE_SENTRY_DSN && import.meta.env.MODE !== 'development'
    };
  }

  init() {
    if (!this.config.enabled) {
      console.log('[Sentry] Disabled - no DSN configured or in development mode');
      return;
    }

    try {
      // In production, you would import and initialize @sentry/browser here
      // For now, this is a placeholder for the structure
      console.log('[Sentry] Initialized', {
        environment: this.config.environment,
        release: this.config.release
      });
      
      this.initialized = true;

      // Set up global error handlers
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    } catch (error) {
      console.error('[Sentry] Initialization failed:', error);
    }
  }

  private handleGlobalError(event: ErrorEvent) {
    this.captureException(event.error, {
      tags: { type: 'global-error' },
      extra: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    this.captureException(event.reason, {
      tags: { type: 'unhandled-rejection' }
    });
  }

  captureException(error: Error | unknown, context?: ErrorContext) {
    if (!this.config.enabled) return;

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Sentry] Captured exception:', {
      error: errorMessage,
      stack: errorStack,
      context
    });

    // In production, this would send to Sentry
    // Sentry.captureException(error, { ...context });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    if (!this.config.enabled) return;

    console.log(`[Sentry] ${level.toUpperCase()}:`, message, context);
    
    // In production: Sentry.captureMessage(message, { level, ...context });
  }

  addBreadcrumb(category: string, message: string, data?: Record<string, any>) {
    if (!this.config.enabled) return;

    console.debug('[Sentry] Breadcrumb:', { category, message, data });
    
    // In production: Sentry.addBreadcrumb({ category, message, data, level: 'info' });
  }

  setUser(user: { id: string; email?: string } | null) {
    if (!this.config.enabled) return;

    console.log('[Sentry] Set user:', user);
    
    // In production: Sentry.setUser(user);
  }

  setTag(key: string, value: string) {
    if (!this.config.enabled) return;
    
    // In production: Sentry.setTag(key, value);
  }
}

// Singleton instance
const sentryClient = new SentryClient();

export const initSentry = () => sentryClient.init();
export const captureException = (error: Error | unknown, context?: ErrorContext) => 
  sentryClient.captureException(error, context);
export const captureMessage = (message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext) => 
  sentryClient.captureMessage(message, level, context);
export const addBreadcrumb = (category: string, message: string, data?: Record<string, any>) => 
  sentryClient.addBreadcrumb(category, message, data);
export const setUser = (user: { id: string; email?: string } | null) => 
  sentryClient.setUser(user);
export const setTag = (key: string, value: string) => 
  sentryClient.setTag(key, value);
