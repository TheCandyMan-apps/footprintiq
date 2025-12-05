-- Fix provider_health public exposure by restricting to authenticated users
DROP POLICY IF EXISTS "Anyone can view provider health" ON provider_health;

CREATE POLICY "Authenticated users can view provider health" ON provider_health
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Also fix provider_quality_scores which has the same issue
DROP POLICY IF EXISTS "Anyone can view quality scores" ON provider_quality_scores;

CREATE POLICY "Authenticated users can view quality scores" ON provider_quality_scores
FOR SELECT USING (auth.uid() IS NOT NULL);