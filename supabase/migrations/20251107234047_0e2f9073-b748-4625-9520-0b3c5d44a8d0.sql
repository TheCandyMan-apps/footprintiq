-- Add user_id to case_templates to support custom templates
ALTER TABLE public.case_templates
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for custom templates
DROP POLICY IF EXISTS "Templates are viewable by everyone" ON public.case_templates;

-- Public templates (no user_id) are viewable by everyone
CREATE POLICY "Public templates are viewable by everyone"
  ON public.case_templates
  FOR SELECT
  USING (is_active = true AND user_id IS NULL);

-- Users can view their own templates
CREATE POLICY "Users can view their own templates"
  ON public.case_templates
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own templates
CREATE POLICY "Users can create their own templates"
  ON public.case_templates
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own templates
CREATE POLICY "Users can update their own templates"
  ON public.case_templates
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own templates
CREATE POLICY "Users can delete their own templates"
  ON public.case_templates
  FOR DELETE
  USING (user_id = auth.uid());