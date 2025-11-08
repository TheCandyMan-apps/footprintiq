import * as Sentry from '@sentry/react';

interface PaymentMetrics {
  successes: number;
  failures: number;
  windowStart: number;
}

const metrics: PaymentMetrics = {
  successes: 0,
  failures: 0,
  windowStart: Date.now(),
};

const WINDOW_DURATION = 60000; // 1 minute
const FAILURE_THRESHOLD = 0.05; // 5%

/**
 * Track credit purchase attempt and monitor failure rate
 */
export function trackCreditPurchase(success: boolean, error?: Error | string) {
  const now = Date.now();
  
  // Reset window if needed
  if (now - metrics.windowStart > WINDOW_DURATION) {
    metrics.successes = 0;
    metrics.failures = 0;
    metrics.windowStart = now;
  }

  if (success) {
    metrics.successes++;
  } else {
    metrics.failures++;
    
    // Capture error in Sentry
    if (error) {
      Sentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          tags: {
            component: 'credit_purchase',
            category: 'payment',
          },
          contexts: {
            payment: {
              success: false,
              timestamp: new Date().toISOString(),
            },
          },
        }
      );
    }
  }

  // Check failure rate
  const total = metrics.successes + metrics.failures;
  if (total >= 10) { // Only check after 10+ attempts
    const failureRate = metrics.failures / total;
    
    if (failureRate > FAILURE_THRESHOLD) {
      Sentry.captureMessage(
        `High credit purchase failure rate: ${(failureRate * 100).toFixed(1)}%`,
        {
          level: 'error',
          tags: {
            alert_type: 'payment_failure_rate',
            component: 'credit_purchase',
          },
          contexts: {
            metrics: {
              failures: metrics.failures,
              successes: metrics.successes,
              total,
              failure_rate: failureRate,
              threshold: FAILURE_THRESHOLD,
            },
          },
        }
      );
    }
  }
}

/**
 * Get current payment metrics
 */
export function getPaymentMetrics() {
  const total = metrics.successes + metrics.failures;
  return {
    ...metrics,
    total,
    failureRate: total > 0 ? metrics.failures / total : 0,
  };
}
