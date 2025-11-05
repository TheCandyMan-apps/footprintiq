-- Credits ledger for gating premium usage
CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Track Apify jobs and results
CREATE TABLE IF NOT EXISTS public.apify_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  actor_slug TEXT NOT NULL,
  input JSONB NOT NULL,
  task_id TEXT,
  status TEXT DEFAULT 'queued',
  cost_credits INTEGER NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.apify_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.apify_tasks(id) ON DELETE CASCADE,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Atomic credit spend function
CREATE OR REPLACE FUNCTION public.spend_credits(
  _workspace_id UUID,
  _cost INT,
  _reason TEXT,
  _meta JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE current_balance INT;
BEGIN
  SELECT COALESCE(SUM(delta), 0) INTO current_balance
  FROM public.credit_ledger
  WHERE workspace_id = _workspace_id;

  IF current_balance < _cost THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.credit_ledger (workspace_id, delta, reason, meta)
  VALUES (_workspace_id, -_cost, _reason, _meta);

  RETURN TRUE;
END;
$$;

-- RLS policies
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apify_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apify_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY cl_select ON public.credit_ledger FOR SELECT
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY cl_insert ON public.credit_ledger FOR INSERT
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY at_select ON public.apify_tasks FOR SELECT
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY at_insert ON public.apify_tasks FOR INSERT
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY at_update ON public.apify_tasks FOR UPDATE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY ar_select ON public.apify_results FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.apify_tasks t
  WHERE t.id = apify_results.task_id
    AND t.workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
));