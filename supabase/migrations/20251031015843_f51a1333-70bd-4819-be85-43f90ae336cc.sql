-- Create workspace_role enum
CREATE TYPE workspace_role AS ENUM ('viewer', 'analyst', 'admin');

-- Create billing_plan enum
CREATE TYPE billing_plan AS ENUM ('analyst', 'pro', 'enterprise');

-- Create billing_status enum
CREATE TYPE billing_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');

-- Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create workspace_members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Create audit_log table (separate from audit_logs for workspace-scoped events)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target TEXT,
  meta JSONB DEFAULT '{}',
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create billing_customers table
CREATE TABLE IF NOT EXISTS public.billing_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  plan billing_plan NOT NULL DEFAULT 'analyst',
  status billing_status NOT NULL DEFAULT 'trialing',
  seats INTEGER NOT NULL DEFAULT 1,
  metered_scans_month INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update api_keys table to reference workspace
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS scopes TEXT[] DEFAULT ARRAY['scan:write', 'findings:read'];
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

-- Create branding_profiles table
CREATE TABLE IF NOT EXISTS public.branding_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366F1',
  secondary_color TEXT DEFAULT '#8B5CF6',
  custom_footer TEXT,
  remove_branding BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create saved_reports table
CREATE TABLE IF NOT EXISTS public.saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  widgets JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper functions
CREATE OR REPLACE FUNCTION public.get_workspace_role(_user_id UUID, _workspace_id UUID)
RETURNS workspace_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.workspace_members 
  WHERE user_id = _user_id AND workspace_id = _workspace_id;
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_permission(_user_id UUID, _workspace_id UUID, _required_role workspace_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE user_id = _user_id 
      AND workspace_id = _workspace_id
      AND (
        CASE _required_role
          WHEN 'viewer' THEN role IN ('viewer', 'analyst', 'admin')
          WHEN 'analyst' THEN role IN ('analyst', 'admin')
          WHEN 'admin' THEN role = 'admin'
        END
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.log_audit_event(
  _workspace_id UUID,
  _user_id UUID,
  _action TEXT,
  _target TEXT DEFAULT NULL,
  _meta JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.audit_log (workspace_id, user_id, action, target, meta)
  VALUES (_workspace_id, _user_id, _action, _target, _meta)
  RETURNING id;
$$;

CREATE OR REPLACE FUNCTION public.update_workspace_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER update_workspaces_timestamp
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workspace_timestamp();

CREATE TRIGGER update_billing_customers_timestamp
  BEFORE UPDATE ON public.billing_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workspace_timestamp();

CREATE TRIGGER update_branding_profiles_timestamp
  BEFORE UPDATE ON public.branding_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workspace_timestamp();

CREATE TRIGGER update_saved_reports_timestamp
  BEFORE UPDATE ON public.saved_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workspace_timestamp();

-- Enable RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they belong to"
  ON public.workspaces FOR SELECT
  USING (
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace admins can update"
  ON public.workspaces FOR UPDATE
  USING (has_workspace_permission(auth.uid(), id, 'admin'));

CREATE POLICY "Workspace owners can delete"
  ON public.workspaces FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for workspace_members
CREATE POLICY "Members can view workspace members"
  ON public.workspace_members FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage members"
  ON public.workspace_members FOR ALL
  USING (has_workspace_permission(auth.uid(), workspace_id, 'admin'));

-- RLS Policies for audit_log
CREATE POLICY "Members can view workspace audit logs"
  ON public.audit_log FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

-- RLS Policies for billing_customers
CREATE POLICY "Admins can view billing"
  ON public.billing_customers FOR SELECT
  USING (has_workspace_permission(auth.uid(), workspace_id, 'admin'));

CREATE POLICY "System can manage billing"
  ON public.billing_customers FOR ALL
  USING (true);

-- RLS Policies for branding_profiles
CREATE POLICY "Members can view branding"
  ON public.branding_profiles FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage branding"
  ON public.branding_profiles FOR ALL
  USING (has_workspace_permission(auth.uid(), workspace_id, 'admin'));

-- RLS Policies for saved_reports
CREATE POLICY "Members can view workspace reports"
  ON public.saved_reports FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own reports"
  ON public.saved_reports FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_workspace ON public.audit_log(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_at ON public.audit_log(at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_customers_workspace ON public.billing_customers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_billing_customers_stripe ON public.billing_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_workspace ON public.saved_reports(workspace_id);