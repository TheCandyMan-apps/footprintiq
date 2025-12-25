-- Add status management columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'deleted')),
ADD COLUMN IF NOT EXISTS status_changed_at timestamptz,
ADD COLUMN IF NOT EXISTS status_reason text,
ADD COLUMN IF NOT EXISTS status_changed_by uuid;

-- Create flagged_users table for watchlist/suspicious user tracking
CREATE TABLE IF NOT EXISTS public.flagged_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  flag_type text NOT NULL CHECK (flag_type IN ('suspicious', 'watching', 'high_risk', 'abuse', 'spam')),
  flagged_by uuid NOT NULL,
  reason text NOT NULL,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid,
  resolution_notes text,
  CONSTRAINT unique_active_flag UNIQUE (user_id, flag_type, is_active)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_flagged_users_user_id ON public.flagged_users(user_id);
CREATE INDEX IF NOT EXISTS idx_flagged_users_is_active ON public.flagged_users(is_active) WHERE is_active = true;

-- Enable RLS on flagged_users
ALTER TABLE public.flagged_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view flagged users
CREATE POLICY "Admins can view flagged users"
ON public.flagged_users FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert flagged users
CREATE POLICY "Admins can flag users"
ON public.flagged_users FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update flagged users
CREATE POLICY "Admins can update flags"
ON public.flagged_users FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete flags
CREATE POLICY "Admins can delete flags"
ON public.flagged_users FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create user_status_history table for audit trail
CREATE TABLE IF NOT EXISTS public.user_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  reason text,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on user_status_history
ALTER TABLE public.user_status_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view status history
CREATE POLICY "Admins can view status history"
ON public.user_status_history FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert status history
CREATE POLICY "Admins can insert status history"
ON public.user_status_history FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create function to update user status with audit trail
CREATE OR REPLACE FUNCTION public.update_user_status(
  _user_id uuid,
  _new_status text,
  _reason text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_uid uuid;
  v_old_status text;
  v_result json;
BEGIN
  -- Get the calling user's ID
  v_caller_uid := auth.uid();
  
  -- Check if caller is admin
  IF NOT public.has_role(v_caller_uid, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Get current status
  SELECT status INTO v_old_status
  FROM public.profiles
  WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Update status
  UPDATE public.profiles
  SET 
    status = _new_status,
    status_changed_at = now(),
    status_reason = _reason,
    status_changed_by = v_caller_uid
  WHERE user_id = _user_id;
  
  -- Log to audit trail
  INSERT INTO public.user_status_history (user_id, previous_status, new_status, reason, changed_by)
  VALUES (_user_id, v_old_status, _new_status, _reason, v_caller_uid);
  
  -- Log to activity_logs
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, metadata)
  VALUES (v_caller_uid, 'user.status_changed', 'user', _user_id::text, 
    jsonb_build_object('previous_status', v_old_status, 'new_status', _new_status, 'reason', _reason));
  
  RETURN json_build_object('success', true, 'previous_status', v_old_status, 'new_status', _new_status);
END;
$$;

-- Create function to permanently delete a user
CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id uuid, _reason text DEFAULT 'Admin deletion')
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_uid uuid;
  v_user_email text;
BEGIN
  -- Get the calling user's ID
  v_caller_uid := auth.uid();
  
  -- Check if caller is admin
  IF NOT public.has_role(v_caller_uid, 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Get user email for logging
  SELECT email INTO v_user_email
  FROM public.profiles
  WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Log the deletion before removing
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, metadata)
  VALUES (v_caller_uid, 'user.deleted', 'user', _user_id::text, 
    jsonb_build_object('deleted_email', v_user_email, 'reason', _reason));
  
  -- Delete from auth.users (cascades to profiles via foreign key)
  DELETE FROM auth.users WHERE id = _user_id;
  
  RETURN json_build_object('success', true, 'deleted_email', v_user_email);
END;
$$;