-- Create provider_costs table for tracking provider usage costs
CREATE TABLE IF NOT EXISTS public.provider_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id TEXT NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_calls INTEGER DEFAULT 0,
  success_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  total_cost_gbp DECIMAL(10, 4) DEFAULT 0,
  api_cost_gbp DECIMAL(10, 4) DEFAULT 0,
  avg_latency_ms INTEGER DEFAULT 0,
  total_data_mb DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (provider_id, workspace_id, period_type, period_start)
);

-- Create provider_budgets table for budget management
CREATE TABLE IF NOT EXISTS public.provider_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  daily_quota INTEGER DEFAULT 1000,
  monthly_budget_gbp DECIMAL(10, 2) DEFAULT 100.00,
  warn_threshold_pct INTEGER DEFAULT 80,
  critical_threshold_pct INTEGER DEFAULT 95,
  block_on_quota_exceeded BOOLEAN DEFAULT false,
  block_on_budget_exceeded BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (workspace_id, provider_id)
);

-- Create budget_alerts table for storing alerts
CREATE TABLE IF NOT EXISTS public.budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  threshold_pct INTEGER,
  current_usage DECIMAL(10, 2),
  limit_value DECIMAL(10, 2),
  message TEXT,
  metadata JSONB DEFAULT '{}',
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create cost_recommendations table
CREATE TABLE IF NOT EXISTS public.cost_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL,
  recommendation_type TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  estimated_savings_gbp DECIMAL(10, 2),
  is_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,
  applied_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_costs_lookup ON public.provider_costs(provider_id, workspace_id, period_type, period_start);
CREATE INDEX IF NOT EXISTS idx_provider_costs_workspace ON public.provider_costs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_workspace ON public.budget_alerts(workspace_id, provider_id, created_at);
CREATE INDEX IF NOT EXISTS idx_cost_recommendations_workspace ON public.cost_recommendations(workspace_id);

-- Enable RLS
ALTER TABLE public.provider_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for provider_costs (admin only)
CREATE POLICY "Admins can view all provider costs" ON public.provider_costs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage provider costs" ON public.provider_costs
  FOR ALL USING (true) WITH CHECK (true);

-- RLS policies for provider_budgets (workspace admins)
CREATE POLICY "Workspace members can view budgets" ON public.provider_budgets
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage budgets" ON public.provider_budgets
  FOR ALL USING (true) WITH CHECK (true);

-- RLS policies for budget_alerts
CREATE POLICY "Workspace members can view alerts" ON public.budget_alerts
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage alerts" ON public.budget_alerts
  FOR ALL USING (true) WITH CHECK (true);

-- RLS policies for cost_recommendations
CREATE POLICY "Workspace members can view recommendations" ON public.cost_recommendations
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can manage recommendations" ON public.cost_recommendations
  FOR ALL USING (true) WITH CHECK (true);