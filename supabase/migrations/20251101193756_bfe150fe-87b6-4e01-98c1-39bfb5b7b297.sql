-- Sensitive consent tracking
CREATE TABLE IF NOT EXISTS public.sensitive_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  categories TEXT[] NOT NULL,
  noted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS sensitive_consents_workspace_idx ON public.sensitive_consents(workspace_id);
ALTER TABLE public.sensitive_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view consent"
  ON public.sensitive_consents FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Workspace admins can manage consent"
  ON public.sensitive_consents FOR ALL
  USING (has_workspace_permission(auth.uid(), workspace_id, 'admin'::workspace_role));

-- Credits ledger for premium features
CREATE TABLE IF NOT EXISTS public.credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  delta INT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('purchase', 'reveal', 'export', 'darkweb_scan', 'refund')),
  ref_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS credits_ledger_ws_idx ON public.credits_ledger(workspace_id, created_at DESC);
ALTER TABLE public.credits_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view credits"
  ON public.credits_ledger FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can manage credits"
  ON public.credits_ledger FOR ALL
  USING (true);

-- Dark web monitoring targets
CREATE TABLE IF NOT EXISTS public.darkweb_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'username', 'domain', 'wallet', 'keyword')),
  value TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  last_checked TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, type, value)
);

CREATE INDEX IF NOT EXISTS darkweb_targets_ws_active_idx ON public.darkweb_targets(workspace_id, active, last_checked);
ALTER TABLE public.darkweb_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view targets"
  ON public.darkweb_targets FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Workspace admins can manage targets"
  ON public.darkweb_targets FOR ALL
  USING (has_workspace_permission(auth.uid(), workspace_id, 'admin'::workspace_role));

-- Update existing darkweb_findings table to support new monitoring system
ALTER TABLE public.darkweb_findings 
  ADD COLUMN IF NOT EXISTS target_id UUID,
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS observed_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS darkweb_findings_target_idx ON public.darkweb_findings(target_id, observed_at DESC) WHERE target_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS darkweb_findings_new_idx ON public.darkweb_findings(is_new, observed_at DESC) WHERE is_new = TRUE;

-- Function to get workspace credits balance
CREATE OR REPLACE FUNCTION public.get_credits_balance(_workspace_id UUID)
RETURNS INT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(delta), 0)::INT
  FROM public.credits_ledger
  WHERE workspace_id = _workspace_id;
$$;