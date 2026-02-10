-- Tighten profiles INSERT policy to authenticated users only
-- Currently uses 'public' role which includes anon
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);