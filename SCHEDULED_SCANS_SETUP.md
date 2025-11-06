# Scheduled Scans Setup Guide

## Overview
Automated scheduled scans allow you to run periodic OSINT scans (daily, weekly, monthly) and receive email notifications when new findings are detected.

## Components

### 1. Database Tables
- `scheduled_scans`: Stores scan schedules and configuration
- `scheduled_scan_findings`: Tracks findings history for comparison

### 2. Edge Functions
- `scheduled-scan-runner`: Cron job that executes scheduled scans
- `send-scan-notification`: Sends email notifications via Resend

### 3. UI Component
- `ScheduledScansManager`: Dashboard interface for managing scheduled scans

## Setup Instructions

### Step 1: Configure Resend (Email Notifications)

1. Sign up for a free account at [https://resend.com](https://resend.com)
2. Verify your sending domain at [https://resend.com/domains](https://resend.com/domains)
3. Create an API key at [https://resend.com/api-keys](https://resend.com/api-keys)
4. Add the API key as a secret in your Lovable project:
   - Go to Settings → Secrets in Lovable
   - Add secret: `RESEND_API_KEY` with your API key value

**Note:** Update the email sender in `send-scan-notification/index.ts`:
```typescript
from: 'FootprintIQ <notifications@yourdomain.com>',  // Change to your verified domain
```

### Step 2: Set Up Cron Job

The cron job needs to be configured to run the `scheduled-scan-runner` function periodically.

#### Option A: Using Supabase SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run the following SQL:

```sql
-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cron job to run every 10 minutes
SELECT cron.schedule(
  'run-scheduled-scans',
  '*/10 * * * *',  -- Every 10 minutes
  $$
  SELECT
    net.http_post(
        url:='https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/scheduled-scan-runner',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5dXpndmF1YWVsZGpxeGxyamNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTUwMTQsImV4cCI6MjA3NTc3MTAxNH0.eGgwpaj0ij28tqYhQdvqdeM1Eo_dXfGEJWfHXRrDK5o"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

#### Cron Schedule Options:
- `*/10 * * * *` - Every 10 minutes (recommended)
- `*/5 * * * *` - Every 5 minutes (more frequent)
- `0 * * * *` - Every hour on the hour
- `0 0 * * *` - Every day at midnight
- `0 */6 * * *` - Every 6 hours

### Step 3: Verify Setup

1. Create a test scheduled scan:
   - Go to Dashboard → Scheduled tab
   - Click "New Schedule"
   - Set up a daily scan
   - Enable email notifications

2. Check edge function logs:
   ```bash
   # View scheduler logs
   supabase functions logs scheduled-scan-runner
   
   # View notification logs
   supabase functions logs send-scan-notification
   ```

3. Test the cron job manually:
   ```bash
   # Invoke the function directly for testing
   curl -X POST \
     'https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/scheduled-scan-runner' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'Content-Type: application/json'
   ```

### Step 4: Monitor Scheduled Scans

Check the `scheduled_scans` table to see active schedules:
```sql
SELECT 
  id,
  scan_type,
  target_value,
  frequency,
  next_run_at,
  last_run_at,
  is_active
FROM scheduled_scans
WHERE is_active = true
ORDER BY next_run_at;
```

Check scan history:
```sql
SELECT 
  ssf.created_at,
  ss.target_value,
  ss.frequency,
  ssf.new_findings_count,
  ssf.findings_count
FROM scheduled_scan_findings ssf
JOIN scheduled_scans ss ON ss.id = ssf.scheduled_scan_id
ORDER BY ssf.created_at DESC
LIMIT 20;
```

## Usage

### Creating a Scheduled Scan

1. Navigate to Dashboard → Scheduled tab
2. Click "New Schedule"
3. Configure:
   - **Scan Type**: Email, username, domain, or phone
   - **Target Value**: The value to scan
   - **Frequency**: Daily, weekly, or monthly
   - **Email Notifications**: Toggle to receive alerts

### Managing Scheduled Scans

- **Pause/Resume**: Click the pause/play button
- **Delete**: Click the trash icon
- **View History**: Check the findings count in the scan list

### Email Notifications

Users receive emails when:
- New findings are detected (compared to previous scan)
- Email includes:
  - Number of new findings
  - Total findings count
  - Direct link to view results
  - Scan type and target information

## Troubleshooting

### Cron Job Not Running

1. Check if pg_cron is enabled:
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

2. Check cron job status:
```sql
SELECT * FROM cron.job WHERE jobname = 'run-scheduled-scans';
```

3. View cron job logs:
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'run-scheduled-scans')
ORDER BY start_time DESC
LIMIT 10;
```

### Email Not Sending

1. Verify RESEND_API_KEY is set correctly
2. Check that your domain is verified in Resend
3. Review `send-scan-notification` function logs
4. Ensure the 'from' email uses your verified domain

### No New Findings Detected

This is normal! It means:
- No new sources found since last scan
- The scan ran successfully but found no changes
- Users won't receive an email (by design)

## Cost Considerations

- **Scans**: Each scheduled scan consumes credits based on providers used
- **Email**: Resend offers 3,000 emails/month free tier
- **Cron Jobs**: Supabase pg_cron is included in all plans

## Best Practices

1. **Frequency Selection**:
   - Daily: For high-priority targets
   - Weekly: For regular monitoring
   - Monthly: For broad surveillance

2. **Credit Management**:
   - Monitor workspace credit balance
   - Pause unnecessary schedules
   - Use selective providers for cost control

3. **Notification Management**:
   - Enable notifications for important targets only
   - Check spam folder if emails not arriving
   - Whitelist notifications@yourdomain.com

## Security Notes

- RLS policies ensure users can only access their workspace schedules
- Cron job uses service role key for unrestricted access
- Email notifications include masked PII per privacy settings
- All scan data encrypted at rest in Supabase

## Support

For issues or questions:
- Check edge function logs
- Review database tables for data integrity
- Verify cron job is scheduled correctly
- Test functions manually before relying on automation
