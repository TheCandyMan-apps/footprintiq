-- Add flow_type column to oauth_states to distinguish sign-in vs account linking
ALTER TABLE public.oauth_states 
ADD COLUMN IF NOT EXISTS flow_type TEXT DEFAULT 'link' CHECK (flow_type IN ('sign_in', 'link'));