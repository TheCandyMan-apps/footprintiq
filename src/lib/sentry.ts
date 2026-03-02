import * as Sentry from '@sentry/react';

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn('[Sentry] DSN not configured – error tracking disabled');
    return;
  }

  const environment =
    import.meta.env.MODE === 'production' ? 'prod' : 'staging';

  Sentry.init({
    dsn,
    environment,
    release: import.meta.env.VITE_APP_RELEASE || undefined,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: environment === 'prod' ? 0.2 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // ---- PII scrubbing ----
    beforeSend(event) {
      // Strip cookies
      if (event.request) {
        delete event.request.cookies;
        // Remove raw query strings that might contain scan inputs
        delete event.request.query_string;
      }

      // Remove any "scanInput" / "scanResults" from extra context
      if (event.contexts) {
        delete (event.contexts as Record<string, unknown>).scanInput;
        delete (event.contexts as Record<string, unknown>).scanResults;
      }

      // Promote payment errors
      if (event.tags?.category === 'payment') {
        event.level = 'error';
      }

      return event;
    },

    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'fetch' && breadcrumb.data?.url?.includes('supabase')) {
        return breadcrumb;
      }
      return breadcrumb;
    },
  });

  console.log(`[Sentry] Initialised – env=${environment}, release=${import.meta.env.VITE_APP_RELEASE ?? 'dev'}`);
};

// ---------------------------------------------------------------------------
// Context helper – call from scan flow, auth, workspace switch, etc.
// ---------------------------------------------------------------------------

export interface SentryContextParams {
  workspaceId?: string;
  plan?: string;
  scanId?: string;
  route?: string;
}

/**
 * Set tags + context used across all subsequent Sentry events.
 * Safe to call repeatedly – values overwrite previous ones.
 * Does NOT attach raw scan inputs/results (PII-safe).
 */
export const setSentryContext = ({
  workspaceId,
  plan,
  scanId,
  route,
}: SentryContextParams) => {
  if (workspaceId) Sentry.setTag('workspace_id', workspaceId);
  if (plan) Sentry.setTag('plan', plan);
  if (scanId) Sentry.setTag('scan_id', scanId);
  if (route) Sentry.setTag('route', route);

  Sentry.setContext('footprintiq', {
    workspace_id: workspaceId,
    plan,
    scan_id: scanId,
    route,
  });
};

// ---------------------------------------------------------------------------
// Payment-specific helpers (kept for existing imports)
// ---------------------------------------------------------------------------

export const trackPaymentError = (
  error: Error | string,
  context: {
    paymentIntentId?: string;
    customerId?: string;
    amount?: number;
    priceId?: string;
    errorCode?: string;
    errorType?: string;
  },
) => {
  const err = error instanceof Error ? error : new Error(String(error));

  Sentry.captureException(err, {
    tags: {
      category: 'payment',
      error_type: context.errorType || 'unknown',
      error_code: context.errorCode || 'unknown',
    },
    contexts: {
      payment: {
        intent_id: context.paymentIntentId,
        customer_id: context.customerId,
        amount: context.amount,
        price_id: context.priceId,
      },
    },
    level: 'error',
  });
};

export const trackCheckoutEvent = (
  eventName: string,
  data: {
    step?: string;
    priceId?: string;
    planName?: string;
    amount?: number;
    success?: boolean;
    errorCode?: string;
  },
) => {
  Sentry.addBreadcrumb({
    category: 'checkout',
    message: eventName,
    level: 'info',
    data,
  });
};

export const trackStripeError = (
  stripeError: {
    type: string;
    code?: string;
    decline_code?: string;
    message?: string;
    payment_intent?: { id: string };
  },
  context: {
    amount?: number;
    currency?: string;
    priceId?: string;
  },
) => {
  trackPaymentError(stripeError.message || 'Stripe error occurred', {
    paymentIntentId: stripeError.payment_intent?.id,
    amount: context.amount,
    priceId: context.priceId,
    errorCode: stripeError.code || stripeError.decline_code || 'unknown',
    errorType: stripeError.type,
  });
};

// ---------------------------------------------------------------------------
// Credit-purchase monitoring (moved from sentry-monitoring.ts)
// ---------------------------------------------------------------------------

interface PaymentMetrics {
  successes: number;
  failures: number;
  windowStart: number;
}

const metrics: PaymentMetrics = { successes: 0, failures: 0, windowStart: Date.now() };
const WINDOW_DURATION = 60_000;
const FAILURE_THRESHOLD = 0.05;

export function trackCreditPurchase(success: boolean, error?: Error | string) {
  const now = Date.now();
  if (now - metrics.windowStart > WINDOW_DURATION) {
    metrics.successes = 0;
    metrics.failures = 0;
    metrics.windowStart = now;
  }

  if (success) {
    metrics.successes++;
  } else {
    metrics.failures++;
    if (error) {
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
        tags: { component: 'credit_purchase', category: 'payment' },
      });
    }
  }

  const total = metrics.successes + metrics.failures;
  if (total >= 10 && metrics.failures / total > FAILURE_THRESHOLD) {
    Sentry.captureMessage(
      `High credit purchase failure rate: ${((metrics.failures / total) * 100).toFixed(1)}%`,
      { level: 'error', tags: { alert_type: 'payment_failure_rate' } },
    );
  }
}

export function getPaymentMetrics() {
  const total = metrics.successes + metrics.failures;
  return { ...metrics, total, failureRate: total > 0 ? metrics.failures / total : 0 };
}
