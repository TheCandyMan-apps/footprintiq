-- Fix INFO_LEAKAGE: Restrict template metadata to authenticated users only
-- This prevents competitors from passively monitoring template categories and tags

-- Drop the overly permissive public policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.template_categories;
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.template_tags;

-- Create new policies requiring authentication
CREATE POLICY "Authenticated users can view template categories"
  ON public.template_categories
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view template tags"
  ON public.template_tags
  FOR SELECT
  USING (auth.uid() IS NOT NULL);