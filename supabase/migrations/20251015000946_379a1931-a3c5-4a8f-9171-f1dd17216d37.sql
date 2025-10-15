-- Make scan-images bucket private (update if not already done)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'scan-images' AND public = true;

-- Remove anonymous access to support tickets without user_id
DROP POLICY IF EXISTS "Anyone can create tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;

-- Recreate with stricter policies
CREATE POLICY "Authenticated users can create tickets"
ON public.support_tickets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Unauthenticated users can create tickets"
ON public.support_tickets FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "Users can view own tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Unauthenticated users cannot view tickets"
ON public.support_tickets FOR SELECT
TO anon
USING (false);

CREATE POLICY "Users can update own tickets"
ON public.support_tickets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));