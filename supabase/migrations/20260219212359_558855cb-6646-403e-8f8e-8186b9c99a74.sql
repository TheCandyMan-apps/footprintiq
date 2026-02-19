
-- Schedule monitor-stuck-telegram to run every 5 minutes via pg_cron
SELECT cron.schedule(
  'monitor-stuck-telegram-every-5min',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/monitor-stuck-telegram',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dXpndmF1YWVsZGpxeGxyamNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTUwMTQsImV4cCI6MjA3NTc3MTAxNH0.eGgwpaj0ij28tqYhQdvqdeM1Eo_dXfGEJWfHXRrDK5o"}'::jsonb,
      body:=concat('{"time": "', now(), '"}')::jsonb
    ) AS request_id;
  $$
);
