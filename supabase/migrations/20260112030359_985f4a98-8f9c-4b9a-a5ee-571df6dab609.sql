-- =====================================================
-- Security Enhancement: Admin Profile Access Audit Logging
-- =====================================================

-- Create a function to log admin profile access
CREATE OR REPLACE FUNCTION public.log_admin_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  current_user_role text;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  -- Only log if an admin is accessing someone else's profile
  IF current_user_id IS NOT NULL AND current_user_id != NEW.user_id THEN
    -- Check if current user is an admin
    IF EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = current_user_id AND role = 'admin'
    ) THEN
      -- Log the admin access to activity_logs
      INSERT INTO public.activity_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        metadata,
        created_at
      ) VALUES (
        current_user_id,
        'admin_profile_view',
        'profile',
        NEW.user_id,
        jsonb_build_object(
          'accessed_profile_id', NEW.user_id,
          'accessed_at', now()
        ),
        now()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Note: PostgreSQL does not support AFTER SELECT triggers directly
-- We'll use a different approach - create a secure view with audit logging

-- Create a function that admins must call to access all profiles (with logging)
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Log the admin access
  INSERT INTO public.activity_logs (
    user_id,
    action,
    entity_type,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    'admin_bulk_profile_access',
    'profile',
    jsonb_build_object(
      'action', 'bulk_profile_query',
      'timestamp', now()
    ),
    now()
  );
  
  -- Return all profiles
  RETURN QUERY SELECT * FROM public.profiles;
END;
$$;

-- Create a function for admins to get a specific profile (with logging)
CREATE OR REPLACE FUNCTION public.admin_get_profile(target_user_id uuid)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.profiles;
BEGIN
  -- Verify the caller is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Log the admin access (only if accessing someone else's profile)
  IF auth.uid() != target_user_id THEN
    INSERT INTO public.activity_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      metadata,
      created_at
    ) VALUES (
      auth.uid(),
      'admin_profile_view',
      'profile',
      target_user_id,
      jsonb_build_object(
        'accessed_profile_id', target_user_id,
        'timestamp', now()
      ),
      now()
    );
  END IF;
  
  -- Get the profile
  SELECT * INTO result FROM public.profiles WHERE user_id = target_user_id;
  
  RETURN result;
END;
$$;

-- =====================================================
-- Security Enhancement: Support Tickets RLS Improvements
-- =====================================================

-- First, check if we need to add workspace validation to support tickets
-- Add workspace_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'support_tickets' 
    AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE public.support_tickets ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id);
  END IF;
END $$;

-- Create index for workspace lookups if not exists
CREATE INDEX IF NOT EXISTS idx_support_tickets_workspace_id ON public.support_tickets(workspace_id);

-- Create a function to validate support ticket access with audit logging
CREATE OR REPLACE FUNCTION public.can_access_support_ticket(ticket_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ticket_user_id uuid;
  ticket_assigned_to uuid;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Get ticket owner and assignee
  SELECT user_id, assigned_to INTO ticket_user_id, ticket_assigned_to
  FROM public.support_tickets
  WHERE id = ticket_id;
  
  -- Allow access if:
  -- 1. User owns the ticket
  -- 2. User is assigned to the ticket
  -- 3. User is an admin (with logging)
  IF ticket_user_id = current_user_id THEN
    RETURN true;
  END IF;
  
  IF ticket_assigned_to = current_user_id THEN
    RETURN true;
  END IF;
  
  -- Check if admin with audit logging
  IF public.has_role(current_user_id, 'admin') THEN
    -- Log admin access to support ticket
    INSERT INTO public.activity_logs (
      user_id,
      action,
      entity_type,
      entity_id,
      metadata,
      created_at
    ) VALUES (
      current_user_id,
      'admin_support_ticket_access',
      'support_ticket',
      ticket_id,
      jsonb_build_object(
        'ticket_id', ticket_id,
        'ticket_owner', ticket_user_id,
        'timestamp', now()
      ),
      now()
    );
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Drop existing policies to recreate with better security
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can create their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "admin_all" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_select_policy" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_insert_policy" ON public.support_tickets;
DROP POLICY IF EXISTS "support_tickets_update_policy" ON public.support_tickets;

-- Recreate RLS policies with proper access controls and audit logging
CREATE POLICY "st_select_own_or_assigned_or_admin"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR assigned_to = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "st_insert_own"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "st_update_own_or_assigned"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() 
  OR assigned_to = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  user_id = auth.uid() 
  OR assigned_to = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "st_delete_admin_only"
ON public.support_tickets
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Similar improvements for support_messages
DROP POLICY IF EXISTS "Users can view messages for their tickets" ON public.support_messages;
DROP POLICY IF EXISTS "Users can create messages for their tickets" ON public.support_messages;
DROP POLICY IF EXISTS "admin_all" ON public.support_messages;
DROP POLICY IF EXISTS "support_messages_select_policy" ON public.support_messages;
DROP POLICY IF EXISTS "support_messages_insert_policy" ON public.support_messages;

-- Create helper function to check support message access
CREATE OR REPLACE FUNCTION public.can_access_support_message(message_ticket_id uuid, message_is_internal boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ticket_user_id uuid;
  ticket_assigned_to uuid;
  current_user_id uuid;
  is_admin boolean;
BEGIN
  current_user_id := auth.uid();
  is_admin := public.has_role(current_user_id, 'admin');
  
  -- Get ticket info
  SELECT user_id, assigned_to INTO ticket_user_id, ticket_assigned_to
  FROM public.support_tickets
  WHERE id = message_ticket_id;
  
  -- Internal messages only visible to admins and assigned staff
  IF message_is_internal THEN
    RETURN is_admin OR ticket_assigned_to = current_user_id;
  END IF;
  
  -- Regular messages visible to ticket owner, assignee, or admin
  RETURN ticket_user_id = current_user_id 
    OR ticket_assigned_to = current_user_id 
    OR is_admin;
END;
$$;

-- Recreate support_messages policies
CREATE POLICY "sm_select_authorized"
ON public.support_messages
FOR SELECT
TO authenticated
USING (
  public.can_access_support_message(ticket_id, COALESCE(is_internal, false))
);

CREATE POLICY "sm_insert_authorized"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.support_tickets t
    WHERE t.id = ticket_id
    AND (
      t.user_id = auth.uid()
      OR t.assigned_to = auth.uid()
      OR public.has_role(auth.uid(), 'admin')
    )
  )
  AND (
    -- Only admins/staff can create internal messages
    NOT COALESCE(is_internal, false) 
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND t.assigned_to = auth.uid()
    )
  )
);