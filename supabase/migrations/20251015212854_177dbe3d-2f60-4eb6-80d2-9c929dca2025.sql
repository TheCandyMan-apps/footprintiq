-- Fix support ticket RLS policies to prevent email-based access bypass
-- Drop the overly permissive email-based access policies
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;

-- Recreate with strict user_id-only access for authenticated users
CREATE POLICY "Authenticated users view own tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users update own tickets"
ON public.support_tickets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Add admin access to view and manage all tickets
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update all tickets"
ON public.support_tickets FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add storage policies for scan-images bucket with proper user scoping
-- Drop the overly broad public access policy
DROP POLICY IF EXISTS "Public access to scan images" ON storage.objects;

-- Add DELETE policy so users can manage their own files
CREATE POLICY "Users can delete own scan images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'scan-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update existing policies to be more explicit
DROP POLICY IF EXISTS "Users can view their own scan images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own scan images" ON storage.objects;

CREATE POLICY "Users can upload to own folder in scan-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'scan-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own files in scan-images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'scan-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add UPDATE policy for completeness
CREATE POLICY "Users can update own files in scan-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'scan-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);