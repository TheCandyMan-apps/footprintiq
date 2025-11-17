-- Create subscriptions table for billing management
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  scan_limit_monthly INTEGER NOT NULL DEFAULT 5,
  scans_used_monthly INTEGER NOT NULL DEFAULT 0,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive', 'active', 'past_due', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique index on workspace_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_workspace_id ON public.subscriptions(workspace_id);

-- Create index on stripe_customer_id for lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- Create billing audit logs table
CREATE TABLE IF NOT EXISTS public.billing_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on workspace_id and created_at for efficient queries
CREATE INDEX IF NOT EXISTS idx_billing_audit_logs_workspace_created ON public.billing_audit_logs(workspace_id, created_at DESC);

-- Enable RLS on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Workspace members can read their workspace subscription
CREATE POLICY "Workspace members can read subscription"
  ON public.subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = subscriptions.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Policy: Only service role can insert/update subscriptions
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Enable RLS on billing_audit_logs
ALTER TABLE public.billing_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Workspace members can read their audit logs
CREATE POLICY "Workspace members can read audit logs"
  ON public.billing_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = billing_audit_logs.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Policy: Only service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON public.billing_audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Create function to reset monthly scans on period rollover
CREATE OR REPLACE FUNCTION public.reset_monthly_scans()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reset scans_used_monthly for subscriptions where period has ended
  UPDATE public.subscriptions
  SET 
    scans_used_monthly = 0,
    current_period_start = current_period_end,
    current_period_end = current_period_end + INTERVAL '1 month',
    updated_at = now()
  WHERE 
    status = 'active'
    AND current_period_end < now();
END;
$$;

-- Create trigger to update updated_at on subscriptions
CREATE OR REPLACE FUNCTION public.update_subscription_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_timestamp();