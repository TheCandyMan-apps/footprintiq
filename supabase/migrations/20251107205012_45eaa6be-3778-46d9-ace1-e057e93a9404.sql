-- Create payment_errors table for tracking Stripe payment failures
CREATE TABLE IF NOT EXISTS public.payment_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  error_code TEXT NOT NULL,
  error_message TEXT NOT NULL,
  payment_intent_id TEXT,
  customer_id TEXT,
  amount INTEGER,
  price_id TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_errors ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_errors_created_at ON public.payment_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_errors_resolved ON public.payment_errors(resolved);
CREATE INDEX IF NOT EXISTS idx_payment_errors_type ON public.payment_errors(error_type);

-- Admin policy: Allow admins to view all errors
CREATE POLICY "Admins can view all payment errors"
ON public.payment_errors
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Admin policy: Allow admins to update errors (mark as resolved)
CREATE POLICY "Admins can update payment errors"
ON public.payment_errors
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Service role can insert errors (from edge functions)
CREATE POLICY "Service role can insert payment errors"
ON public.payment_errors
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_payment_errors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_errors_updated_at
BEFORE UPDATE ON public.payment_errors
FOR EACH ROW
EXECUTE FUNCTION public.update_payment_errors_updated_at();