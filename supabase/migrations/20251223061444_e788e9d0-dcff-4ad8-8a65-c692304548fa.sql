-- Add code_verifier column to oauth_states for PKCE support
ALTER TABLE public.oauth_states ADD COLUMN IF NOT EXISTS code_verifier TEXT;