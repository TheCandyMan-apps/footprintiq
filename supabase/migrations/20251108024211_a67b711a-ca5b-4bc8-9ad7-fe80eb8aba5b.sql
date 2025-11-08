-- Create storage bucket for bug screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bug-screenshots', 'bug-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for bug screenshots
CREATE POLICY "Users can upload their own bug screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'bug-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own bug screenshots"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'bug-screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all bug screenshots
CREATE POLICY "Admins can view all bug screenshots"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'bug-screenshots'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);