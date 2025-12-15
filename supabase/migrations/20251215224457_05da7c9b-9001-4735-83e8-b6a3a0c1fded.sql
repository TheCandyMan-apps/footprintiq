-- Fix overly permissive RLS policies on 6 tables

-- 1. CIRCUIT_BREAKER_STATES - Remove public "System can manage" policy
DROP POLICY IF EXISTS "System can manage circuit breaker states" ON public.circuit_breaker_states;

-- 2. PROVIDER_HEALTH - Remove public "System can manage" policy
DROP POLICY IF EXISTS "System can manage provider health" ON public.provider_health;

-- 3. PROVIDER_QUALITY_SCORES - Remove public "System can update" policy
DROP POLICY IF EXISTS "System can update quality scores" ON public.provider_quality_scores;

-- 4. THREAT_FORECASTS - Remove public "System can manage" policy
DROP POLICY IF EXISTS "System can manage forecasts" ON public.threat_forecasts;

-- 5. CASE_TEMPLATES - Remove public template visibility, add admin-only view
DROP POLICY IF EXISTS "Public templates are viewable by everyone" ON public.case_templates;
CREATE POLICY "Admins can view all templates"
  ON public.case_templates FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. INTEGRATION_CATALOG - Replace public access with authenticated-only
DROP POLICY IF EXISTS "Anyone can view integration catalog" ON public.integration_catalog;
CREATE POLICY "Authenticated users can view integration catalog"
  ON public.integration_catalog FOR SELECT
  USING (auth.uid() IS NOT NULL);