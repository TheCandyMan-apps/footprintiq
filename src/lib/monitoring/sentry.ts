/**
 * Sentry error tracking and performance monitoring
 * 
 * Setup Instructions:
 * 1. Create account at https://sentry.io
 * 2. Get your DSN from project settings
 * 3. Add VITE_SENTRY_DSN to environment variables
 * 4. Initialize in main.tsx
 */

export interface SentryConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

export interface SentryError {
  message: string;
  stack?: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
}

/**
 * Initialize Sentry monitoring
 * Call this in main.tsx before rendering the app
 */
export function initSentry(config: Partial<SentryConfig> = {}) {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('[Sentry] DSN not configured, monitoring disabled');
    return;
  }

  const defaultConfig: SentryConfig = {
    dsn,
    environment: (import.meta.env.MODE || 'development') as SentryConfig['environment'],
    tracesSampleRate: 0.1, // 10% of transactions
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of errors
    ...config,
  };

  console.log('[Sentry] Initialized for', defaultConfig.environment);
  
  // Sentry.init() would go here in production
  // For now, we're just setting up the interface
}

/**
 * Capture an exception with context
 */
export function captureException(error: Error, context?: Partial<SentryError>) {
  const sentryError: SentryError = {
    message: error.message,
    stack: error.stack,
    level: context?.level || 'error',
    tags: context?.tags,
    extra: context?.extra,
    user: context?.user,
  };

  console.error('[Sentry] Exception:', sentryError);
  
  // Sentry.captureException() would be called here
  // For now, just console.error
}

/**
 * Capture a message (not an exception)
 */
export function captureMessage(
  message: string,
  level: SentryError['level'] = 'info',
  context?: Partial<SentryError>
) {
  console.log(`[Sentry] ${level.toUpperCase()}:`, message, context);
  
  // Sentry.captureMessage() would be called here
}

/**
 * Set user context for error tracking
 */
export function setUser(user: SentryError['user'] | null) {
  console.log('[Sentry] User context:', user);
  
  // Sentry.setUser() would be called here
}

/**
 * Add breadcrumb for error context
 */
export function addBreadcrumb(
  category: string,
  message: string,
  level: SentryError['level'] = 'info',
  data?: Record<string, any>
) {
  console.log('[Sentry] Breadcrumb:', { category, message, level, data });
  
  // Sentry.addBreadcrumb() would be called here
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  const startTime = Date.now();
  
  return {
    name,
    op,
    finish: () => {
      const duration = Date.now() - startTime;
      console.log(`[Sentry] Transaction ${name} (${op}): ${duration}ms`);
      
      // transaction.finish() would be called here
    },
  };
}

/**
 * Track custom metrics
 */
export function trackMetric(name: string, value: number, tags?: Record<string, string>) {
  console.log('[Sentry] Metric:', { name, value, tags });
  
  // Sentry metrics API would be used here
}

/**
 * Error boundary integration helper
 */
export function withSentryErrorBoundary<T>(
  component: T,
  fallback?: React.ComponentType<{ error: Error }>
): T {
  // In production, wrap with Sentry.ErrorBoundary
  return component;
}

/**
 * Common error handlers
 */
export const ErrorHandlers = {
  /**
   * Handle scan errors
   */
  scanError(error: Error, scanId: string, scanType: string) {
    captureException(error, {
      level: 'error',
      tags: {
        scan_id: scanId,
        scan_type: scanType,
      },
      extra: {
        timestamp: new Date().toISOString(),
      },
    });
  },

  /**
   * Handle API errors
   */
  apiError(error: Error, endpoint: string, method: string) {
    captureException(error, {
      level: 'error',
      tags: {
        endpoint,
        method,
      },
    });
  },

  /**
   * Handle payment errors
   */
  paymentError(error: Error, amount: number, currency: string) {
    captureException(error, {
      level: 'error',
      tags: {
        payment: 'true',
        currency,
      },
      extra: {
        amount,
      },
    });
  },

  /**
   * Handle dark web alert errors
   */
  darkwebAlertError(error: Error, subscriptionId: string) {
    captureException(error, {
      level: 'warning',
      tags: {
        subscription_id: subscriptionId,
        alert_type: 'darkweb',
      },
    });
  },
};
