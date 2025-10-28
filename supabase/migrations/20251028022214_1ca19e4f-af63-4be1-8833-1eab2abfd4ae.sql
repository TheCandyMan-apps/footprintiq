-- Phase 26b: Advanced Integrations & Extensibility

-- OAuth connections table
CREATE TABLE public.oauth_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id, provider)
);

-- Integration configs table
CREATE TABLE public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  credentials_encrypted TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plugin manifests table
CREATE TABLE public.plugin_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  version TEXT NOT NULL,
  author_id UUID NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon_url TEXT,
  repository_url TEXT,
  documentation_url TEXT,
  manifest JSONB NOT NULL,
  permissions TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deprecated')),
  download_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Plugin installations table
CREATE TABLE public.plugin_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plugin_id UUID NOT NULL REFERENCES public.plugin_manifests(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id, plugin_id)
);

-- API marketplace listings table
CREATE TABLE public.api_marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  pricing_model TEXT NOT NULL,
  base_cost NUMERIC(10,4),
  endpoints JSONB NOT NULL DEFAULT '[]'::jsonb,
  rate_limits JSONB DEFAULT '{}'::jsonb,
  documentation_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'maintenance')),
  popularity_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_oauth_connections_user_id ON public.oauth_connections(user_id);
CREATE INDEX idx_integration_configs_user_id ON public.integration_configs(user_id);
CREATE INDEX idx_plugin_manifests_status ON public.plugin_manifests(status);
CREATE INDEX idx_plugin_installations_user_id ON public.plugin_installations(user_id);
CREATE INDEX idx_api_marketplace_category ON public.api_marketplace_listings(category);

-- RLS Policies
ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_marketplace_listings ENABLE ROW LEVEL SECURITY;

-- oauth_connections policies
CREATE POLICY "Users can manage own OAuth connections"
  ON public.oauth_connections
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- integration_configs policies
CREATE POLICY "Users can manage own integrations"
  ON public.integration_configs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- plugin_manifests policies
CREATE POLICY "Anyone can view approved plugins"
  ON public.plugin_manifests
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Authors can view own plugins"
  ON public.plugin_manifests
  FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Users can create plugins"
  ON public.plugin_manifests
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update own plugins"
  ON public.plugin_manifests
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

-- plugin_installations policies
CREATE POLICY "Users can manage own plugin installations"
  ON public.plugin_installations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- api_marketplace_listings policies
CREATE POLICY "Anyone can view active marketplace listings"
  ON public.api_marketplace_listings
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integration_configs_updated_at
  BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_manifests_updated_at
  BEFORE UPDATE ON public.plugin_manifests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();