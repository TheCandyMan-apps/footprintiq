-- Phase 1: Add 'basic' and 'enterprise' to subscription_tier enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'basic' AND enumtypid = 'subscription_tier'::regtype) THEN
    ALTER TYPE subscription_tier ADD VALUE 'basic';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'enterprise' AND enumtypid = 'subscription_tier'::regtype) THEN
    ALTER TYPE subscription_tier ADD VALUE 'enterprise';
  END IF;
END $$;

-- Phase 2: Add RLS policies for activity_logs admin access
DROP POLICY IF EXISTS "Admins can view all activity logs" ON activity_logs;
CREATE POLICY "Admins can view all activity logs"
ON activity_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can view their own activity logs" ON activity_logs;
CREATE POLICY "Users can view their own activity logs"
ON activity_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());