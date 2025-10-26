-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.user_integrations CASCADE;
DROP TABLE IF EXISTS public.integration_catalog CASCADE;
DROP TABLE IF EXISTS public.ai_generated_reports CASCADE;

-- Integration catalog and user integrations
CREATE TABLE public.integration_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  configuration_schema JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id TEXT NOT NULL REFERENCES public.integration_catalog(id),
  configuration JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, integration_id)
);

-- AI generated reports
CREATE TABLE public.ai_generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.integration_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_reports ENABLE ROW LEVEL SECURITY;

-- Integration catalog policies (public read)
CREATE POLICY "Anyone can view integration catalog"
  ON public.integration_catalog FOR SELECT
  USING (true);

-- User integrations policies
CREATE POLICY "Users can view their own integrations"
  ON public.user_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations"
  ON public.user_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON public.user_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
  ON public.user_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- AI reports policies
CREATE POLICY "Users can view their own AI reports"
  ON public.ai_generated_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI reports"
  ON public.ai_generated_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert default integrations
INSERT INTO public.integration_catalog (id, name, description, category, configuration_schema) VALUES
  ('slack-webhook', 'Slack', 'Send monitoring alerts to Slack channels', 'messaging', '[{"name":"webhook_url","label":"Webhook URL","type":"url","required":true}]'::jsonb),
  ('teams-webhook', 'Microsoft Teams', 'Send monitoring alerts to Teams channels', 'messaging', '[{"name":"webhook_url","label":"Webhook URL","type":"url","required":true}]'::jsonb),
  ('discord-webhook', 'Discord', 'Send monitoring alerts to Discord channels', 'messaging', '[{"name":"webhook_url","label":"Webhook URL","type":"url","required":true}]'::jsonb),
  ('generic-webhook', 'Custom Webhook', 'Send data to any webhook endpoint', 'webhook', '[{"name":"webhook_url","label":"Webhook URL","type":"url","required":true}]'::jsonb),
  ('splunk-export', 'Splunk', 'Export findings to Splunk SIEM', 'siem', '[{"name":"hec_url","label":"HEC URL","type":"url","required":true},{"name":"token","label":"HEC Token","type":"password","required":true}]'::jsonb),
  ('salesforce-export', 'Salesforce', 'Export cases to Salesforce CRM', 'crm', '[{"name":"instance_url","label":"Instance URL","type":"url","required":true},{"name":"access_token","label":"Access Token","type":"password","required":true}]'::jsonb);
