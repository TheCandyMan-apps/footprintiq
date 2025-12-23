import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { trackPaymentError, trackCheckoutEvent, trackStripeError } from '@/lib/sentry';

// Initialize Stripe - using the anon key which is safe for client-side
const stripePromise = loadStripe(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.replace('eyJ', 'pk_test_') || '');

interface PaymentFormProps {
  priceId: string;
  planName: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CheckoutForm = ({ priceId, planName, amount, onSuccess, onCancel }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    trackCheckoutEvent('payment_submit', { priceId, planName, amount, step: 'confirm' });

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/settings/billing?success=true`,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Track Stripe error in Sentry and log to database
        trackStripeError(error, { amount, priceId });
        
        // Log to database for admin dashboard
        await supabase.from('payment_errors').insert({
          error_type: error.type,
          error_code: error.code || error.decline_code || 'unknown',
          error_message: error.message,
          payment_intent_id: error.payment_intent?.id,
          amount,
          price_id: priceId,
          metadata: {
            plan_name: planName,
            decline_code: error.decline_code,
          },
        });

        // Handle specific error types with user-friendly messages
        let errorMessage = 'Payment failed. Please try again.';
        
        switch (error.type) {
          case 'card_error':
            if (error.code === 'card_declined') {
              errorMessage = error.decline_code === 'expired_card' 
                ? 'Card expired—try another card'
                : 'Card declined—please use a different payment method';
            } else if (error.code === 'insufficient_funds') {
              errorMessage = 'Insufficient funds—please use a different card';
            } else if (error.code === 'incorrect_cvc') {
              errorMessage = 'Incorrect CVC code—please check and try again';
            }
            break;
          case 'validation_error':
            errorMessage = 'Please check your payment details and try again';
            break;
          case 'api_error':
            errorMessage = 'Connection error—please check your internet and try again';
            break;
        }

        toast({
          title: 'Payment Failed',
          description: errorMessage,
          variant: 'destructive',
        });
        
        trackCheckoutEvent('stripe.checkout.failed', { 
          priceId, 
          planName, 
          amount, 
          success: false,
          errorCode: error.code 
        });
      } else {
        trackCheckoutEvent('payment_success', { 
          priceId, 
          planName, 
          amount, 
          success: true 
        });
        
        toast({
          title: 'Payment Successful!',
          description: `You've subscribed to ${planName}`,
        });
        onSuccess?.();
      }
    } catch (err) {
      console.error('Payment error:', err);
      
      // Track unexpected errors
      trackPaymentError(err instanceof Error ? err : 'Unknown error', {
        amount,
        priceId,
        errorType: 'unexpected',
      });
      
      toast({
        title: 'Payment Error',
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-semibold">{planName} Plan</p>
            <p className="text-sm text-muted-foreground">Billed monthly</p>
          </div>
          <p className="text-2xl font-bold">${amount.toFixed(2)}</p>
        </div>

        <PaymentElement />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="w-4 h-4" />
          <span>Secured by Stripe. Your payment details are encrypted.</span>
        </div>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Subscribe Now
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export const StripePaymentForm = ({ priceId, planName, amount, onSuccess, onCancel }: PaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    const initializePayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('billing-create-payment-intent', {
          body: { priceId, planName },
        });

        if (error) throw error;

        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No client secret returned');
        }
      } catch (err) {
        console.error('Payment initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
        toast({
          title: 'Payment Setup Failed',
          description: 'Could not initialize payment. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  });

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Setting up secure payment...</p>
        </div>
      </Card>
    );
  }

  if (error || !clientSecret) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || 'Failed to load payment form'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: 'hsl(var(--primary))',
              colorBackground: 'hsl(var(--background))',
              colorText: 'hsl(var(--foreground))',
              colorDanger: 'hsl(var(--destructive))',
              borderRadius: '0.5rem',
            },
          },
        }}
      >
        <CheckoutForm
          priceId={priceId}
          planName={planName}
          amount={amount}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </Card>
  );
};
