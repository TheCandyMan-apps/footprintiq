-- Allow admins to view all scans (needed for admin user management panel)
CREATE POLICY "Admins can view all scans"
ON public.scans
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to view all credit transactions (needed for admin user management panel)
CREATE POLICY "Admins can view all credits"
ON public.credits_ledger
FOR SELECT
USING (has_role(auth.uid(), 'admin'));