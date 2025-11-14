
-- Add admin view policy for profiles table
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO public
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Add admin view policy for user_roles table
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO public
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Add admin update policy for user_roles (for subscription management)
CREATE POLICY "Admins can update all user roles"
ON public.user_roles
FOR UPDATE
TO public
USING (
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
);
