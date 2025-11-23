-- Create security definer function to check organization membership
CREATE OR REPLACE FUNCTION public.is_organization_member(_org_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE organization_id = _org_id
      AND user_id = _user_id
  );
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Members can view organization activity" ON activity_logs;

-- Recreate it using the security definer function
CREATE POLICY "Members can view organization activity" 
ON activity_logs 
FOR SELECT 
USING (
  (organization_id IS NOT NULL AND public.is_organization_member(organization_id, auth.uid()))
  OR user_id = auth.uid()
);