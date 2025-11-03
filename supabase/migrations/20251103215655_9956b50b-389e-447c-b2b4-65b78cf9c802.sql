-- Dark Web Monitoring Tables and Enhancements

-- Create darkweb_findings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.darkweb_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID NOT NULL REFERENCES public.darkweb_targets(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'intelx', 'dehashed', 'darksearch', 'apify-social', 'apify-osint', 'apify-darkweb'
  url TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_new BOOLEAN DEFAULT true,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(target_id, provider, url)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_darkweb_findings_target ON public.darkweb_findings(target_id);
CREATE INDEX IF NOT EXISTS idx_darkweb_findings_new ON public.darkweb_findings(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_darkweb_findings_severity ON public.darkweb_findings(severity);

-- Create darkweb_alert_history table for tracking sent alerts
CREATE TABLE IF NOT EXISTS public.darkweb_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID NOT NULL REFERENCES public.darkweb_targets(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  finding_count INTEGER DEFAULT 0,
  severity TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  alert_type TEXT DEFAULT 'email', -- 'email', 'webhook', 'sms'
  meta JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_darkweb_alert_history_target ON public.darkweb_alert_history(target_id);
CREATE INDEX IF NOT EXISTS idx_darkweb_alert_history_workspace ON public.darkweb_alert_history(workspace_id);

-- Create darkweb_subscriptions table for real-time monitoring
CREATE TABLE IF NOT EXISTS public.darkweb_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID NOT NULL REFERENCES public.darkweb_targets(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  severity_threshold TEXT DEFAULT 'medium', -- minimum severity to alert
  alert_methods TEXT[] DEFAULT ARRAY['email']::TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_alerted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(target_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_darkweb_subs_target ON public.darkweb_subscriptions(target_id);
CREATE INDEX IF NOT EXISTS idx_darkweb_subs_workspace ON public.darkweb_subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_darkweb_subs_active ON public.darkweb_subscriptions(is_active) WHERE is_active = true;

-- Add RLS policies for darkweb_findings
ALTER TABLE public.darkweb_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "darkweb_findings_select"
  ON public.darkweb_findings FOR SELECT
  USING (
    target_id IN (
      SELECT id FROM public.darkweb_targets
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "darkweb_findings_insert_service"
  ON public.darkweb_findings FOR INSERT
  WITH CHECK (true); -- Service role only

-- Add RLS policies for darkweb_alert_history
ALTER TABLE public.darkweb_alert_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "darkweb_alert_history_select"
  ON public.darkweb_alert_history FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

-- Add RLS policies for darkweb_subscriptions
ALTER TABLE public.darkweb_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "darkweb_subs_select"
  ON public.darkweb_subscriptions FOR SELECT
  USING (
    user_id = auth.uid() OR
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "darkweb_subs_insert"
  ON public.darkweb_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "darkweb_subs_update"
  ON public.darkweb_subscriptions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "darkweb_subs_delete"
  ON public.darkweb_subscriptions FOR DELETE
  USING (user_id = auth.uid());

-- Update trigger for darkweb_subscriptions
CREATE OR REPLACE FUNCTION update_darkweb_subs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_darkweb_subs_updated
  BEFORE UPDATE ON public.darkweb_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_darkweb_subs_timestamp();