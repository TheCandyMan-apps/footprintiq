-- Add source column to social_profiles to track which provider found each profile
ALTER TABLE public.social_profiles 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';