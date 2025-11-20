
-- Create add_credits RPC function
CREATE OR REPLACE FUNCTION public.add_credits(
  _workspace_id UUID,
  _amount INTEGER,
  _description TEXT,
  _transaction_type TEXT DEFAULT 'purchase'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Add credit transaction (use 'purchase' as reason since it's allowed by constraint)
  INSERT INTO public.credits_ledger (workspace_id, delta, reason, meta)
  VALUES (_workspace_id, _amount, 'purchase', jsonb_build_object('type', _transaction_type, 'description', _description));
  
  -- Get new balance
  SELECT COALESCE(SUM(delta), 0)::INT INTO v_new_balance
  FROM public.credits_ledger
  WHERE workspace_id = _workspace_id;
  
  RETURN json_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- Create function to grant initial credits to new workspaces
CREATE OR REPLACE FUNCTION public.grant_initial_workspace_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Grant 100 starter credits to all new workspaces
  INSERT INTO public.credits_ledger (workspace_id, delta, reason, meta)
  VALUES (NEW.id, 100, 'purchase', jsonb_build_object('type', 'system_grant', 'description', 'Welcome credits - starter pack'));
  
  RETURN NEW;
END;
$$;

-- Create trigger on workspace creation
DROP TRIGGER IF EXISTS grant_credits_on_workspace_creation ON public.workspaces;
CREATE TRIGGER grant_credits_on_workspace_creation
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_initial_workspace_credits();

-- Grant 100 starter credits to all existing workspaces with 0 balance
INSERT INTO public.credits_ledger (workspace_id, delta, reason, meta)
SELECT 
  w.id,
  100,
  'purchase',
  jsonb_build_object('type', 'system_grant', 'description', 'Retroactive welcome credits')
FROM public.workspaces w
LEFT JOIN (
  SELECT workspace_id, SUM(delta) as balance
  FROM public.credits_ledger
  GROUP BY workspace_id
) cl ON cl.workspace_id = w.id
WHERE COALESCE(cl.balance, 0) = 0;
