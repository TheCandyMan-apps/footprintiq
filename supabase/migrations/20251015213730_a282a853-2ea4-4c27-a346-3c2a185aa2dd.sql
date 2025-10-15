-- Add INSERT policy for user_roles table to allow service role inserts
-- This ensures the handle_new_user trigger can create new user roles
CREATE POLICY "Service can insert new user roles"
ON public.user_roles FOR INSERT
TO service_role
WITH CHECK (true);

-- Add policy to allow anonymous users to upload to anonymous folder in scan-images bucket
CREATE POLICY "Anonymous users can upload to anonymous folder"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'scan-images' AND
  (storage.foldername(name))[1] = 'anonymous'
);

-- Add comment to document the user_roles INSERT behavior
COMMENT ON TABLE public.user_roles IS 'INSERT policy allows service_role to create new user roles via handle_new_user trigger during signup';

-- Set file size limit on scan-images bucket (10MB)
UPDATE storage.buckets
SET file_size_limit = 10485760
WHERE id = 'scan-images';