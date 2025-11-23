-- Fix Activity Logs: Add RLS policies for admin access

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Service role can insert activity logs" ON public.activity_logs;

-- Allow admins to view ALL activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Allow users to view their own activity logs
CREATE POLICY "Users can view their own activity logs"
ON public.activity_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own activity logs
CREATE POLICY "Users can insert their own activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow service role to insert activity logs (for system operations)
CREATE POLICY "Service role can manage activity logs"
ON public.activity_logs
FOR ALL
USING (auth.role() = 'service_role');