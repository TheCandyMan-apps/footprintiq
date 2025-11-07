-- Create credit alert settings table
CREATE TABLE IF NOT EXISTS public.credit_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  threshold INTEGER NOT NULL DEFAULT 100,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id)
);

-- Create credit alerts log to track sent alerts
CREATE TABLE IF NOT EXISTS public.credit_alerts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  alerted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_alerts_log ENABLE ROW LEVEL SECURITY;

-- Policies for credit_alert_settings
CREATE POLICY "Users can view alert settings for their workspaces"
  ON public.credit_alert_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = credit_alert_settings.workspace_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace admins can update alert settings"
  ON public.credit_alert_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = credit_alert_settings.workspace_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "Workspace admins can insert alert settings"
  ON public.credit_alert_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = credit_alert_settings.workspace_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Policies for credit_alerts_log
CREATE POLICY "Users can view alert logs for their workspaces"
  ON public.credit_alerts_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = credit_alerts_log.workspace_id
        AND user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_credit_alert_settings_workspace ON public.credit_alert_settings(workspace_id);
CREATE INDEX idx_credit_alerts_log_workspace ON public.credit_alerts_log(workspace_id);
CREATE INDEX idx_credit_alerts_log_alerted_at ON public.credit_alerts_log(alerted_at);

-- Trigger for updated_at
CREATE TRIGGER update_credit_alert_settings_updated_at
  BEFORE UPDATE ON public.credit_alert_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();