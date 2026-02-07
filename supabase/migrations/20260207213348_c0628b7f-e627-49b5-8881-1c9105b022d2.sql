-- Make scan-images bucket public so cached avatar thumbnails can be served without auth tokens
-- These are publicly-available profile photos from public social profiles
UPDATE storage.buckets 
SET public = true 
WHERE id = 'scan-images';

-- Ensure public SELECT policy exists for scan-images bucket
CREATE POLICY "Public read access for scan-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'scan-images');

-- Ensure authenticated users can upload to scan-images (for edge functions using service role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Service upload to scan-images'
  ) THEN
    CREATE POLICY "Service upload to scan-images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'scan-images');
  END IF;
END $$;