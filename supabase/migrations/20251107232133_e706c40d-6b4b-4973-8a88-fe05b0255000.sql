-- Security Audit Fix: Stricter RLS policies and function security

-- 1. Fix overly permissive credits_ledger policy
DROP POLICY IF EXISTS "System can manage credits" ON public.credits_ledger;

-- Create granular policies for credits_ledger
CREATE POLICY "Workspace members can view credits ledger"
ON public.credits_ledger
FOR SELECT
TO public
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage credits"
ON public.credits_ledger
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Fix function search paths for security
-- Update spend_credits function
CREATE OR REPLACE FUNCTION public.spend_credits(_workspace_id uuid, _cost integer, _reason text, _meta jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE current_balance INT;
BEGIN
  SELECT COALESCE(SUM(delta), 0) INTO current_balance
  FROM public.credits_ledger
  WHERE workspace_id = _workspace_id;

  IF current_balance < _cost THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.credits_ledger (workspace_id, delta, reason, meta)
  VALUES (_workspace_id, -_cost, _reason, _meta);

  RETURN TRUE;
END;
$function$;

-- Update update_api_keys_updated_at function
CREATE OR REPLACE FUNCTION public.update_api_keys_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_darkweb_subs_timestamp function
CREATE OR REPLACE FUNCTION public.update_darkweb_subs_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_payment_errors_updated_at function
CREATE OR REPLACE FUNCTION public.update_payment_errors_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 3. Add security audit logging table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warn', 'error', 'critical')),
  message TEXT NOT NULL,
  details JSONB,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for security audit log (admin only)
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security audit log"
ON public.security_audit_log
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Service role can manage security audit log"
ON public.security_audit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON TABLE public.security_audit_log IS 'Stores security audit checks and findings for admin review';