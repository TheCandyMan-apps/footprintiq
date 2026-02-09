
-- Track every Stripe checkout session initiated
CREATE TABLE public.checkout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, expired, abandoned
  amount_total INTEGER,
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

-- Admins can read all checkout sessions
CREATE POLICY "Admins can view all checkout sessions"
  ON public.checkout_sessions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own checkout sessions
CREATE POLICY "Users can view own checkout sessions"
  ON public.checkout_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role inserts (edge functions)
CREATE POLICY "Service role can insert checkout sessions"
  ON public.checkout_sessions FOR INSERT
  WITH CHECK (true);

-- Service role updates (edge functions)
CREATE POLICY "Service role can update checkout sessions"
  ON public.checkout_sessions FOR UPDATE
  USING (true);

-- Index for quick lookups
CREATE INDEX idx_checkout_sessions_status ON public.checkout_sessions(status);
CREATE INDEX idx_checkout_sessions_user ON public.checkout_sessions(user_id);
CREATE INDEX idx_checkout_sessions_created ON public.checkout_sessions(created_at DESC);
CREATE INDEX idx_checkout_sessions_stripe ON public.checkout_sessions(stripe_session_id);
