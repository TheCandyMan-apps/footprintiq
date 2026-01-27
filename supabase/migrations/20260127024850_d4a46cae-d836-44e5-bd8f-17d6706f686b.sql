-- Add lens_preview_used flag to profiles table for tracking one-time LENS verification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS lens_preview_used boolean DEFAULT false;

-- Add lens_preview_used_at timestamp to track when the preview was used
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS lens_preview_used_at timestamp with time zone DEFAULT NULL;

-- Comment for documentation
COMMENT ON COLUMN public.profiles.lens_preview_used IS 'True if the user has used their one-time free LENS verification preview';
COMMENT ON COLUMN public.profiles.lens_preview_used_at IS 'Timestamp when the free LENS preview was used';