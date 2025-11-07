-- Add persona column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS persona text DEFAULT 'standard' CHECK (persona IN ('standard', 'advanced', 'enterprise'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_persona ON public.profiles(persona);

COMMENT ON COLUMN public.profiles.persona IS 'User persona type: standard (simplified UI), advanced (all features), enterprise (custom features)';