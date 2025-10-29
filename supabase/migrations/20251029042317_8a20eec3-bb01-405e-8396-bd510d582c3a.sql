-- Phase 22: Commercial Intelligence & Report Monetization Tables

-- 1) Clients & Subscriptions
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  logo_url TEXT,
  custom_domain TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.client_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'full',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, case_id)
);

CREATE TABLE IF NOT EXISTS public.client_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  file_url TEXT,
  hash_manifest TEXT,
  schedule TEXT,
  last_generated_at TIMESTAMPTZ,
  next_generation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.client_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'trial',
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  features JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) AI Briefings
CREATE TABLE IF NOT EXISTS public.briefing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  content JSONB NOT NULL,
  recipients TEXT[],
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Intelligence Feed Cache
CREATE TABLE IF NOT EXISTS public.intel_feed_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_type TEXT NOT NULL,
  data JSONB NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL
);

-- 4) Risk Valuations
CREATE TABLE IF NOT EXISTS public.risk_valuations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  risk_type TEXT NOT NULL,
  probability NUMERIC(5,2) NOT NULL,
  impact_value NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  confidence NUMERIC(3,2) NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 5) Report Templates
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_users_client ON public.client_users(client_id);
CREATE INDEX IF NOT EXISTS idx_client_users_user ON public.client_users(user_id);
CREATE INDEX IF NOT EXISTS idx_client_cases_client ON public.client_cases(client_id);
CREATE INDEX IF NOT EXISTS idx_client_reports_client ON public.client_reports(client_id);
CREATE INDEX IF NOT EXISTS idx_briefing_logs_client ON public.briefing_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_intel_cache_expires ON public.intel_feed_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_risk_valuations_entity ON public.risk_valuations(entity_id);

-- RLS Policies
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_feed_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- Clients
CREATE POLICY "Users can view clients they belong to" ON public.clients
  FOR SELECT USING (
    id IN (SELECT client_id FROM public.client_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage clients" ON public.clients
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Client Users
CREATE POLICY "Users can view their client memberships" ON public.client_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Client admins can manage members" ON public.client_users
  FOR ALL USING (
    client_id IN (
      SELECT client_id FROM public.client_users 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Client Cases
CREATE POLICY "Client members can view their cases" ON public.client_cases
  FOR SELECT USING (
    client_id IN (SELECT client_id FROM public.client_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Client admins can manage cases" ON public.client_cases
  FOR ALL USING (
    client_id IN (
      SELECT client_id FROM public.client_users 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Client Reports
CREATE POLICY "Client members can view reports" ON public.client_reports
  FOR SELECT USING (
    client_id IN (SELECT client_id FROM public.client_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Client admins can manage reports" ON public.client_reports
  FOR ALL USING (
    client_id IN (
      SELECT client_id FROM public.client_users 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Subscriptions
CREATE POLICY "Client members can view subscriptions" ON public.client_subscriptions
  FOR SELECT USING (
    client_id IN (SELECT client_id FROM public.client_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage subscriptions" ON public.client_subscriptions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Briefing Logs
CREATE POLICY "Client members can view briefings" ON public.briefing_logs
  FOR SELECT USING (
    client_id IN (SELECT client_id FROM public.client_users WHERE user_id = auth.uid())
  );

CREATE POLICY "System can insert briefings" ON public.briefing_logs
  FOR INSERT WITH CHECK (true);

-- Intel Feed Cache
CREATE POLICY "Authenticated users can view intel cache" ON public.intel_feed_cache
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage intel cache" ON public.intel_feed_cache
  FOR ALL USING (true);

-- Risk Valuations
CREATE POLICY "Users can view risk valuations for their clients" ON public.risk_valuations
  FOR SELECT USING (
    client_id IN (SELECT client_id FROM public.client_users WHERE user_id = auth.uid())
    OR client_id IS NULL
  );

CREATE POLICY "System can insert risk valuations" ON public.risk_valuations
  FOR INSERT WITH CHECK (true);

-- Report Templates
CREATE POLICY "Users can view public templates" ON public.report_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create own templates" ON public.report_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can manage own templates" ON public.report_templates
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all templates" ON public.report_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'));