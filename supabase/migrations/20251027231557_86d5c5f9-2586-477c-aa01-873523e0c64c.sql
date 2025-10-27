-- Phase 18: Plugin Marketplace GA - Database Schema

-- Plugin status enum
CREATE TYPE plugin_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'suspended');

-- Main plugins table
CREATE TABLE public.plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  entry_url TEXT NOT NULL,
  manifest JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  status plugin_status NOT NULL DEFAULT 'draft',
  revenue_share_pct INTEGER NOT NULL DEFAULT 15 CHECK (revenue_share_pct >= 0 AND revenue_share_pct <= 100),
  stripe_account_id TEXT,
  icon_url TEXT,
  documentation_url TEXT,
  support_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  suspended_reason TEXT
);

-- Plugin reviews table
CREATE TABLE public.plugin_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES public.plugins(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision plugin_status NOT NULL CHECK (decision IN ('approved', 'rejected')),
  notes TEXT,
  test_results JSONB,
  security_scan JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Plugin installations per workspace
CREATE TABLE public.plugin_installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  plugin_id UUID NOT NULL REFERENCES public.plugins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  installed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, plugin_id)
);

-- Plugin usage metrics for monetization
CREATE TABLE public.plugin_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES public.plugins(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  calls INTEGER NOT NULL DEFAULT 0,
  errors INTEGER NOT NULL DEFAULT 0,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  revenue_cents INTEGER NOT NULL DEFAULT 0,
  UNIQUE(plugin_id, day)
);

-- Enable RLS
ALTER TABLE public.plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plugins table
CREATE POLICY "Anyone can view approved plugins"
  ON public.plugins FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authors can view own plugins"
  ON public.plugins FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all plugins"
  ON public.plugins FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create plugins"
  ON public.plugins FOR INSERT
  WITH CHECK (auth.uid() = author_id AND status = 'draft');

CREATE POLICY "Authors can update own draft plugins"
  ON public.plugins FOR UPDATE
  USING (auth.uid() = author_id AND status = 'draft');

CREATE POLICY "Admins can update any plugin"
  ON public.plugins FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authors can delete own draft plugins"
  ON public.plugins FOR DELETE
  USING (auth.uid() = author_id AND status = 'draft');

-- RLS Policies for plugin_reviews
CREATE POLICY "Reviewers can view all reviews"
  ON public.plugin_reviews FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authors can view reviews of their plugins"
  ON public.plugin_reviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.plugins 
    WHERE plugins.id = plugin_reviews.plugin_id 
    AND plugins.author_id = auth.uid()
  ));

CREATE POLICY "Reviewers can create reviews"
  ON public.plugin_reviews FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') AND auth.uid() = reviewer_id);

-- RLS Policies for plugin_installs
CREATE POLICY "Users can view own installs"
  ON public.plugin_installs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can install plugins"
  ON public.plugin_installs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own installs"
  ON public.plugin_installs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can uninstall plugins"
  ON public.plugin_installs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for plugin_usage
CREATE POLICY "Authors can view own plugin usage"
  ON public.plugin_usage FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.plugins 
    WHERE plugins.id = plugin_usage.plugin_id 
    AND plugins.author_id = auth.uid()
  ));

CREATE POLICY "Admins can view all plugin usage"
  ON public.plugin_usage FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- System can insert/update usage metrics
CREATE POLICY "System can manage plugin usage"
  ON public.plugin_usage FOR ALL
  USING (true);

-- Indexes for performance
CREATE INDEX idx_plugins_status ON public.plugins(status);
CREATE INDEX idx_plugins_author ON public.plugins(author_id);
CREATE INDEX idx_plugins_tags ON public.plugins USING GIN(tags);
CREATE INDEX idx_plugin_reviews_plugin ON public.plugin_reviews(plugin_id);
CREATE INDEX idx_plugin_installs_workspace ON public.plugin_installs(workspace_id);
CREATE INDEX idx_plugin_installs_plugin ON public.plugin_installs(plugin_id);
CREATE INDEX idx_plugin_usage_plugin_day ON public.plugin_usage(plugin_id, day);

-- Trigger to update updated_at
CREATE TRIGGER update_plugins_updated_at
  BEFORE UPDATE ON public.plugins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_plugin_installs_updated_at
  BEFORE UPDATE ON public.plugin_installs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();