-- Add free_any_scan_credits column to workspaces
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS free_any_scan_credits INTEGER DEFAULT 0;

-- Add used_free_any_credit column to scans for idempotency
ALTER TABLE public.scans 
ADD COLUMN IF NOT EXISTS used_free_any_credit BOOLEAN DEFAULT FALSE;

-- Create or replace the RPC function for atomic credit decrement
CREATE OR REPLACE FUNCTION public.use_free_any_scan_credit(
  _workspace_id UUID,
  _scan_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  already_used BOOLEAN;
  credits_available INTEGER;
BEGIN
  -- Check if this scan already used the credit (idempotency)
  SELECT used_free_any_credit INTO already_used
  FROM public.scans WHERE id = _scan_id;
  
  IF already_used = TRUE THEN
    RETURN FALSE; -- Already used, no-op
  END IF;
  
  -- Atomic decrement with check
  UPDATE public.workspaces
  SET free_any_scan_credits = free_any_scan_credits - 1
  WHERE id = _workspace_id
    AND free_any_scan_credits > 0
  RETURNING free_any_scan_credits INTO credits_available;
  
  IF credits_available IS NOT NULL THEN
    -- Mark scan as having used the credit
    UPDATE public.scans
    SET used_free_any_credit = TRUE
    WHERE id = _scan_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Update the workspace creation trigger to grant 1 credit to free workspaces
CREATE OR REPLACE FUNCTION public.add_owner_as_workspace_member()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = 'public'
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert owner as admin member
  INSERT INTO public.workspace_members (workspace_id, user_id, role, created_at)
  VALUES (NEW.id, NEW.owner_id, 'admin', NOW())
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  
  -- Grant 1 free any-scan credit to free tier workspaces
  IF COALESCE(NEW.subscription_tier, 'free') = 'free' THEN
    UPDATE public.workspaces 
    SET free_any_scan_credits = 1 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Backfill existing free workspaces that haven't done non-username scans
-- Only grant credit to workspaces that:
-- 1. Are on free tier (or null which defaults to free)
-- 2. Don't already have credits
-- 3. Haven't done any non-username scans yet
UPDATE public.workspaces w
SET free_any_scan_credits = 1
WHERE (subscription_tier = 'free' OR subscription_tier IS NULL)
  AND free_any_scan_credits = 0
  AND NOT EXISTS (
    SELECT 1 FROM public.scans s 
    WHERE s.workspace_id = w.id 
    AND s.scan_type IN ('personal_details', 'phone')
  );