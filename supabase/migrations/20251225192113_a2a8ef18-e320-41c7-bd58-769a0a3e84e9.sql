-- Fix PUBLIC_DATA_EXPOSURE: Remove permissive policy on share_links
-- This policy allowed anonymous users to read all non-expired share links, exposing tokens

-- Drop the overly permissive policy that exposes share tokens
DROP POLICY IF EXISTS "Anyone can access valid share links" ON public.share_links;

-- Keep existing policies for authenticated owners
-- "Users can create share links for own scans" - already exists
-- "Users can view own share links" - already exists

-- Add policy for updating access count (used by edge function with service role)
-- Note: Service role bypasses RLS, so no additional policy needed for that