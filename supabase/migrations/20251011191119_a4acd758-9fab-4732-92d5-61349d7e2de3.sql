-- Create storage bucket for scan images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'scan-images',
  'scan-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for authenticated users to upload their own images
CREATE POLICY "Users can upload their own scan images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'scan-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy for authenticated users to view their own images
CREATE POLICY "Users can view their own scan images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'scan-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage policy for public access to scan images (for reverse image search)
CREATE POLICY "Public access to scan images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'scan-images');
