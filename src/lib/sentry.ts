import * as Sentry from '@sentry/react';

// Initialize Sentry for error tracking
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      // Filter sensitive data
      if (event.request) {
        delete event.request.cookies;
      }
      return event;
    },
  });
};

// Track payment errors with context
export const trackPaymentError = (
  error: Error | string,
  context: {
    paymentIntentId?: string;
    customerId?: string;
    amount?: number;
    priceId?: string;
    errorCode?: string;
    errorType?: string;
  }
) => {
  const errorMessage = error instanceof Error ? error.message : error;
  
  Sentry.captureException(error instanceof Error ? error : new Error(errorMessage), {
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
  
  console.error('Payment error tracked:', errorMessage, context);
};

// Track checkout flow events
export const trackCheckoutEvent = (
  eventName: string,
  data: {
    step?: string;
    priceId?: string;
    planName?: string;
    amount?: number;
    success?: boolean;
    errorCode?: string;
  }
) => {
  Sentry.addBreadcrumb({
    category: 'checkout',
    message: eventName,
    level: 'info',
    data,
  });
};

// Track Stripe-specific errors
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
  }
) => {
  trackPaymentError(stripeError.message || 'Stripe error occurred', {
    paymentIntentId: stripeError.payment_intent?.id,
    amount: context.amount,
    priceId: context.priceId,
    errorCode: stripeError.code || stripeError.decline_code || 'unknown',
    errorType: stripeError.type,
  });
};
