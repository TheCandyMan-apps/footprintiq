-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant necessary permissions to cron scheduler
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule daily dark web monitoring (runs every day at 2 AM UTC)
SELECT cron.schedule(
  'daily-darkweb-monitoring',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url:='https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/darkweb/monitor',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dXpndmF1YWVsZGpxeGxyamNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTUwMTQsImV4cCI6MjA3NTc3MTAxNH0.eGgwpaj0ij28tqYhQdvqdeM1Eo_dXfGEJWfHXRrDK5o"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule weekly dark web summary (runs every Monday at 9 AM UTC)
SELECT cron.schedule(
  'weekly-darkweb-summary',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url:='https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/darkweb/weekly-summary',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dXpndmF1YWVsZGpxeGxyamNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTUwMTQsImV4cCI6MjA3NTc3MTAxNH0.eGgwpaj0ij28tqYhQdvqdeM1Eo_dXfGEJWfHXRrDK5o"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule monitoring job processor (runs every 15 minutes)
SELECT cron.schedule(
  'monitoring-job-processor',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url:='https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/job-processor',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dXpndmF1YWVsZGpxeGxyamNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTUwMTQsImV4cCI6MjA3NTc3MTAxNH0.eGgwpaj0ij28tqYhQdvqdeM1Eo_dXfGEJWfHXRrDK5o"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule threat forecast generation (runs every 6 hours)
SELECT cron.schedule(
  'threat-forecast-generation',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url:='https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/threat-forecast-generator',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dXpndmF1YWVsZGpxeGxyamNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTUwMTQsImV4cCI6MjA3NTc3MTAxNH0.eGgwpaj0ij28tqYhQdvqdeM1Eo_dXfGEJWfHXRrDK5o"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Schedule cleanup of expired cache (runs daily at 3 AM UTC)
SELECT cron.schedule(
  'cleanup-expired-cache',
  '0 3 * * *',
  $$SELECT cleanup_expired_cache();$$
);

-- Schedule cleanup of expired OAuth states (runs every hour)
SELECT cron.schedule(
  'cleanup-oauth-states',
  '0 * * * *',
  $$SELECT cleanup_expired_oauth_states();$$
);

-- Schedule cleanup of scan PII (runs daily at 4 AM UTC)
SELECT cron.schedule(
  'cleanup-scan-pii',
  '0 4 * * *',
  $$SELECT cleanup_scan_pii();$$
);

-- Schedule rate limit reset (runs every 5 minutes)
SELECT cron.schedule(
  'reset-rate-limits',
  '*/5 * * * *',
  $$SELECT reset_expired_rate_limits();$$
);