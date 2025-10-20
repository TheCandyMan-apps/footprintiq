-- Phase 14: Integration Marketplace

-- Integration catalog
CREATE TABLE public.integration_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'siem', 'ticketing', 'communication', 'other'
  description TEXT,
  logo_url TEXT,
  provider TEXT NOT NULL,
  config_schema JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User integrations
CREATE TABLE public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.integration_catalog(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  credentials_encrypted TEXT, -- Encrypted credentials
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integration sync logs
CREATE TABLE public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_integration_id UUID NOT NULL REFERENCES public.user_integrations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'manual', 'scheduled', 'webhook'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook delivery logs
CREATE TABLE public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt_count INTEGER DEFAULT 1,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SIEM events
CREATE TABLE public.siem_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.user_integrations(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  raw_data JSONB DEFAULT '{}',
  is_exported BOOLEAN DEFAULT false,
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticketing system issues
CREATE TABLE public.ticket_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.user_integrations(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  external_ticket_id TEXT NOT NULL,
  ticket_url TEXT,
  status TEXT NOT NULL,
  priority TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.integration_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siem_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integration_catalog (public read)
CREATE POLICY "Integration catalog is public"
  ON public.integration_catalog FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_integrations
CREATE POLICY "Users can manage own integrations"
  ON public.user_integrations FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for integration_logs
CREATE POLICY "Users can view own integration logs"
  ON public.integration_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_integrations
    WHERE user_integrations.id = integration_logs.user_integration_id
    AND user_integrations.user_id = auth.uid()
  ));

-- RLS Policies for webhook_deliveries
CREATE POLICY "Users can view own webhook deliveries"
  ON public.webhook_deliveries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.webhooks
    WHERE webhooks.id = webhook_deliveries.webhook_id
    AND webhooks.user_id = auth.uid()
  ));

-- RLS Policies for siem_events
CREATE POLICY "Users can manage own SIEM events"
  ON public.siem_events FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for ticket_integrations
CREATE POLICY "Users can manage own ticket integrations"
  ON public.ticket_integrations FOR ALL
  USING (auth.uid() = user_id);

-- Insert sample integrations into catalog
INSERT INTO public.integration_catalog (name, category, description, provider, config_schema) VALUES
('Splunk', 'siem', 'Export security events to Splunk SIEM', 'Splunk Inc.', '{"host": "", "port": 8088, "token": ""}'),
('QRadar', 'siem', 'IBM QRadar SIEM integration', 'IBM', '{"endpoint": "", "api_key": ""}'),
('Jira', 'ticketing', 'Create and sync tickets with Jira', 'Atlassian', '{"url": "", "username": "", "api_token": ""}'),
('ServiceNow', 'ticketing', 'ServiceNow incident management', 'ServiceNow', '{"instance": "", "username": "", "password": ""}'),
('Slack', 'communication', 'Send alerts to Slack channels', 'Slack', '{"webhook_url": "", "channel": ""}'),
('Microsoft Teams', 'communication', 'Post alerts to Teams channels', 'Microsoft', '{"webhook_url": ""}'),
('PagerDuty', 'communication', 'Create PagerDuty incidents', 'PagerDuty', '{"integration_key": ""}'),
('Elastic SIEM', 'siem', 'Elasticsearch SIEM integration', 'Elastic', '{"endpoint": "", "api_key": ""}')