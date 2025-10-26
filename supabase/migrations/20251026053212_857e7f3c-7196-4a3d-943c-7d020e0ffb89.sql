-- Security Fix: Enable RLS and add policies for tables missing RLS
-- Fix for: RLS Disabled in Public error

-- ============================================
-- 1) ENTITY_COOCCURRENCES - Enable RLS and Add Policies
-- ============================================
-- Enable RLS on entity_cooccurrences
ALTER TABLE public.entity_cooccurrences ENABLE ROW LEVEL SECURITY;

-- Policies already added in previous migration, confirming they exist
-- If not, they will be created here (these will fail silently if they exist)
DO $$ 
BEGIN
  -- Allow authenticated users to view all cooccurrences
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'entity_cooccurrences' 
    AND policyname = 'Users can view all entity cooccurrences'
  ) THEN
    CREATE POLICY "Users can view all entity cooccurrences"
      ON public.entity_cooccurrences
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Allow service role to manage cooccurrences
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'entity_cooccurrences' 
    AND policyname = 'System can manage entity cooccurrences'
  ) THEN
    CREATE POLICY "System can manage entity cooccurrences"
      ON public.entity_cooccurrences
      FOR ALL
      TO service_role
      USING (true);
  END IF;
END $$;

-- ============================================
-- 2) INTEGRATION_LOGS - Add RLS Policies
-- ============================================
-- Enable RLS if not already enabled
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- Add policies for integration_logs
CREATE POLICY "Users can view own integration logs"
  ON public.integration_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_integrations
      WHERE user_integrations.id = integration_logs.user_integration_id
      AND user_integrations.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage integration logs"
  ON public.integration_logs
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Admins can view all integration logs"
  ON public.integration_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));