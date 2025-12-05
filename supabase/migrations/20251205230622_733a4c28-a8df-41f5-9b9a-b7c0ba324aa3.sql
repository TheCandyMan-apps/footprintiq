-- Fix infinite recursion in organization_members RLS policies
-- Drop existing self-referencing policies
DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Members can view their organization members" ON organization_members;
DROP POLICY IF EXISTS "org_members_select" ON organization_members;
DROP POLICY IF EXISTS "org_members_insert" ON organization_members;
DROP POLICY IF EXISTS "org_members_update" ON organization_members;
DROP POLICY IF EXISTS "org_members_delete" ON organization_members;

-- Create SECURITY DEFINER helper function to check org admin status
CREATE OR REPLACE FUNCTION public.is_org_admin(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = _org_id 
    AND user_id = _user_id 
    AND role IN ('admin', 'owner')
  );
$$;

-- Create non-recursive RLS policies for organization_members
CREATE POLICY "Users can view own org membership" ON organization_members
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Org admins can manage members" ON organization_members
FOR ALL USING (public.is_org_admin(organization_id, auth.uid()));

-- Fix infinite recursion in client_users RLS policies
DROP POLICY IF EXISTS "Client admins can manage members" ON client_users;
DROP POLICY IF EXISTS "Users can view own client membership" ON client_users;
DROP POLICY IF EXISTS "client_users_select" ON client_users;
DROP POLICY IF EXISTS "client_users_insert" ON client_users;
DROP POLICY IF EXISTS "client_users_update" ON client_users;
DROP POLICY IF EXISTS "client_users_delete" ON client_users;

-- Create SECURITY DEFINER helper function to check client admin status
CREATE OR REPLACE FUNCTION public.is_client_admin(_client_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_users 
    WHERE client_id = _client_id 
    AND user_id = _user_id 
    AND role = 'admin'
  );
$$;

-- Create non-recursive RLS policies for client_users
CREATE POLICY "Users can view own client membership" ON client_users
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Client admins can manage users" ON client_users
FOR ALL USING (public.is_client_admin(client_id, auth.uid()));