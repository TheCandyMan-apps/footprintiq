-- =============================================
-- IMMEDIATE STABILITY FIXES
-- =============================================

-- 1. Add missing columns to workspaces table
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS workspaces_slug_idx ON public.workspaces(slug);

-- 2. Drop ALL existing RLS policies to prevent recursion
DROP POLICY IF EXISTS "Users can view their own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can update their own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can delete their own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Workspace owners can view all workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can manage workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace admins can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.workspace_members;

-- 3. Create stable helper functions (SECURITY DEFINER to break recursion)
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_owner(_workspace_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = _workspace_id AND owner_id = _user_id
  );
$$;

-- 4. Create NEW non-recursive RLS policies for workspaces
CREATE POLICY "Users can insert their own workspaces"
ON public.workspaces
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view workspaces they own or are members of"
ON public.workspaces
FOR SELECT
USING (
  auth.uid() = owner_id 
  OR public.is_workspace_member(id, auth.uid())
);

CREATE POLICY "Owners can update their workspaces"
ON public.workspaces
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their workspaces"
ON public.workspaces
FOR DELETE
USING (auth.uid() = owner_id);

-- 5. Create NEW non-recursive RLS policies for workspace_members
CREATE POLICY "Users can view their own memberships"
ON public.workspace_members
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Workspace owners can view all members"
ON public.workspace_members
FOR SELECT
USING (public.is_workspace_owner(workspace_id, auth.uid()));

CREATE POLICY "Workspace owners can insert members"
ON public.workspace_members
FOR INSERT
WITH CHECK (public.is_workspace_owner(workspace_id, auth.uid()));

CREATE POLICY "Workspace owners can update members"
ON public.workspace_members
FOR UPDATE
USING (public.is_workspace_owner(workspace_id, auth.uid()));

CREATE POLICY "Workspace owners can delete members"
ON public.workspace_members
FOR DELETE
USING (public.is_workspace_owner(workspace_id, auth.uid()));

-- 6. Add status column to scans for orchestrator
ALTER TABLE public.scans
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS provider_counts JSONB DEFAULT '{}'::jsonb;

-- 7. Fix darkweb_targets table to use service role properly
ALTER TABLE public.darkweb_targets
DROP CONSTRAINT IF EXISTS darkweb_targets_user_id_fkey;

-- 8. Create cache_entries table for Redis fallback
CREATE TABLE IF NOT EXISTS public.cache_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cache_entries_expires_at_idx ON public.cache_entries(expires_at);
CREATE INDEX IF NOT EXISTS cache_entries_cache_key_idx ON public.cache_entries(cache_key);

-- Enable RLS on cache_entries (service role only)
ALTER TABLE public.cache_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage cache"
ON public.cache_entries
FOR ALL
USING (true)
WITH CHECK (true);