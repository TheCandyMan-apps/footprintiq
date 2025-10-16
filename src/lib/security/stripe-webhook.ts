/**
 * Stripe Webhook Signature Validation
 * 
 * CRITICAL: Always validate Stripe webhook signatures before processing events.
 * This prevents attackers from forging webhook events to manipulate subscriptions,
 * payments, or trigger unauthorized actions.
 * 
 * Usage in Edge Function:
 * ```typescript
 * import { validateStripeWebhook } from './security/stripe-webhook.ts';
 * import Stripe from 'https://esm.sh/stripe@18.5.0';
 * 
 * const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
 *   apiVersion: '2025-08-27.basil',
 * });
 * 
 * const payload = await req.text();
 * const signature = req.headers.get('stripe-signature');
 * const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
 * 
 * const { valid, event, error } = validateStripeWebhook({
 *   payload,
 *   signature,
 *   secret: webhookSecret,
 *   stripe,
 * });
 * 
 * if (!valid) {
 *   console.error('Webhook validation failed:', error);
 *   return new Response('Unauthorized', { status: 401 });
 * }
 * 
 * // Process verified event
 * switch (event.type) {
 *   case 'customer.subscription.created':
 *     // Handle subscription creation
 *     break;
 *   case 'customer.subscription.deleted':
 *     // Handle subscription cancellation
 *     break;
 * }
 * ```
 * 
 * Setup Instructions:
 * 1. Go to Stripe Dashboard → Developers → Webhooks
 * 2. Add endpoint: https://your-project.supabase.co/functions/v1/stripe-webhook
 * 3. Copy the webhook signing secret (starts with whsec_)
 * 4. Add to Supabase secrets: STRIPE_WEBHOOK_SECRET
 */

// Note: This type definition is for edge functions only
// Stripe type will be available when imported in Deno edge function context
type StripeInstance = any;
type StripeEvent = any;

export interface WebhookValidationParams {
  payload: string;
  signature: string | null;
  secret: string | undefined;
  stripe: StripeInstance;
}

export interface WebhookValidationResult {
  valid: boolean;
  event?: StripeEvent;
  error?: string;
}

/**
 * Validate Stripe webhook signature and construct event
 * 
 * SECURITY: This function prevents webhook forgery attacks by verifying
 * that the webhook actually came from Stripe using HMAC signature validation.
 * 
 * @param params - Webhook validation parameters
 * @returns Validation result with event if valid, error message if invalid
 */
export function validateStripeWebhook(
  params: WebhookValidationParams
): WebhookValidationResult {
  const { payload, signature, secret, stripe } = params;

  // Validate inputs
  if (!signature) {
    return {
      valid: false,
      error: 'Missing stripe-signature header',
    };
  }

  if (!secret) {
    return {
      valid: false,
      error: 'STRIPE_WEBHOOK_SECRET not configured',
    };
  }

  // Verify webhook signature
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      secret
    );

    return {
      valid: true,
      event,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    console.error('[STRIPE-WEBHOOK] Signature validation failed:', {
      error: errorMessage,
      signaturePrefix: signature.substring(0, 20) + '...',
    });

    return {
      valid: false,
      error: `Webhook signature verification failed: ${errorMessage}`,
    };
  }
}

/**
 * Common Stripe webhook event types for subscription management
 * Use these constants to ensure type safety when handling events
 */
export const StripeWebhookEvents = {
  // Subscription lifecycle
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  SUBSCRIPTION_TRIAL_WILL_END: 'customer.subscription.trial_will_end',
  
  // Payment events
  PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  PAYMENT_FAILED: 'invoice.payment_failed',
  PAYMENT_ACTION_REQUIRED: 'invoice.payment_action_required',
  
  // Checkout events
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  CHECKOUT_SESSION_EXPIRED: 'checkout.session.expired',
  
  // Customer events
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  CUSTOMER_DELETED: 'customer.deleted',
  
  // Dispute events
  CHARGE_DISPUTE_CREATED: 'charge.dispute.created',
  CHARGE_DISPUTE_CLOSED: 'charge.dispute.closed',
} as const;

/**
 * Extract subscription tier from Stripe price
 * Maps Stripe product IDs to application subscription tiers
 * 
 * Update this mapping when adding new subscription products
 */
export function getSubscriptionTierFromPrice(
  priceId: string,
  productId: string
): string {
  // Example tier mapping - update with your actual product IDs
  const tierMapping: Record<string, string> = {
    // Example format:
    // 'prod_abc123': 'basic',
    // 'prod_def456': 'premium',
    // 'prod_ghi789': 'enterprise',
  };

  return tierMapping[productId] || 'free';
}

/**
 * Idempotency key manager for webhook processing
 * Prevents duplicate processing of the same webhook event
 * 
 * Usage:
 * ```typescript
 * const idempotency = new WebhookIdempotency();
 * 
 * if (idempotency.isDuplicate(event.id)) {
 *   console.log('Event already processed');
 *   return new Response('OK', { status: 200 });
 * }
 * 
 * // Process event...
 * idempotency.markProcessed(event.id);
 * ```
 */
export class WebhookIdempotency {
  private processedEvents = new Map<string, number>();
  private readonly maxAge = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Check if event has already been processed
   */
  isDuplicate(eventId: string): boolean {
    this.cleanup();
    return this.processedEvents.has(eventId);
  }

  /**
   * Mark event as processed
   */
  markProcessed(eventId: string): void {
    this.processedEvents.set(eventId, Date.now());
  }

  /**
   * Remove old processed events to prevent memory leaks
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [eventId, timestamp] of this.processedEvents.entries()) {
      if (now - timestamp > this.maxAge) {
        this.processedEvents.delete(eventId);
      }
    }
  }
}

/**
 * Webhook response helpers
 */
export const WebhookResponses = {
  success: () => new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }),

  unauthorized: (message = 'Webhook signature verification failed') => 
    new Response(JSON.stringify({ error: message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }),

  duplicate: () => new Response(JSON.stringify({ 
    received: true, 
    message: 'Event already processed' 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }),

  error: (message: string) => new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  }),
};
