# Maigret Profile Monitoring & Historical Tracking

This document describes the historical profile tracking system for Maigret username scans, which stores snapshots over time and detects changes with email alerts.

## Overview

The system automatically tracks username profiles across 300+ social media platforms, stores snapshots of each scan, compares results to detect changes (profiles created, deleted, or modified), and sends email alerts to users when changes occur.

## Architecture

```
┌──────────────────┐     ┌──────────────────────┐     ┌───────────────────┐
│ Maigret Scan     │────▶│ Store Snapshot       │────▶│ maigret_profile_  │
│ (providers-)     │     │ (Edge Function)      │     │ snapshots (Table) │
└──────────────────┘     └──────────────────────┘     └───────────────────┘
                                                                │
                                                                ▼
                         ┌──────────────────────┐     ┌───────────────────┐
                         │ Detect Changes       │────▶│ maigret_profile_  │
                         │ (Edge Function)      │     │ changes (Table)   │
                         └──────────────────────┘     └───────────────────┘
                                                                │
                                                                ▼
                         ┌──────────────────────┐     ┌───────────────────┐
                         │ Send Alert Email     │────▶│ Resend API        │
                         │ (Edge Function)      │     │ (Email Service)   │
                         └──────────────────────┘     └───────────────────┘
                                    ▲
                                    │
                         ┌──────────────────────┐
                         │ Monitor Check        │
                         │ (Cron: every hour)   │
                         └──────────────────────┘
```

## Database Tables

### 1. `maigret_profile_snapshots`

Stores historical snapshots of profile scan results.

**Columns**:
- `id` (UUID): Primary key
- `username` (TEXT): The username scanned
- `site` (TEXT): Platform/site name (e.g., "GitHub", "Twitter")
- `url` (TEXT): Profile URL
- `status` (TEXT): 'found', 'not_found', 'error'
- `confidence` (NUMERIC): Confidence score (0-1)
- `raw_data` (JSONB): Complete finding data
- `scan_id` (UUID): Reference to original scan
- `workspace_id` (UUID): Workspace reference
- `created_at` (TIMESTAMPTZ): Snapshot timestamp

**Indexes**:
- `(username, workspace_id)` - Fast username lookups
- `(site)` - Filter by platform
- `(created_at DESC)` - Recent snapshots first

### 2. `maigret_monitored_usernames`

Tracks which usernames users want to monitor.

**Columns**:
- `id` (UUID): Primary key
- `username` (TEXT): Username to monitor
- `workspace_id` (UUID): Workspace reference
- `user_id` (UUID): User who added monitoring
- `email_alerts_enabled` (BOOLEAN): Enable/disable alerts
- `alert_email` (TEXT): Optional custom email address
- `check_frequency_hours` (INTEGER): How often to check (default: 24)
- `last_checked_at` (TIMESTAMPTZ): Last check timestamp
- `sites_filter` (TEXT[]): Optional site filter
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Unique Constraint**: `(username, workspace_id)`

### 3. `maigret_profile_changes`

Records detected changes between snapshots.

**Columns**:
- `id` (UUID): Primary key
- `username` (TEXT): Username
- `site` (TEXT): Platform name
- `change_type` (TEXT): 'created', 'deleted', 'modified', 'status_changed'
- `old_snapshot_id` (UUID): Previous snapshot reference
- `new_snapshot_id` (UUID): New snapshot reference
- `change_details` (JSONB): What changed
- `workspace_id` (UUID): Workspace reference
- `detected_at` (TIMESTAMPTZ): When change was detected
- `email_sent` (BOOLEAN): Alert sent flag
- `email_sent_at` (TIMESTAMPTZ): When alert was sent

**Indexes**:
- `(username, workspace_id)` - User change history
- `(detected_at DESC)` - Recent changes first
- `(email_sent) WHERE email_sent = false` - Pending alerts

## Edge Functions

### 1. `maigret-store-snapshot`

Stores scan results as historical snapshots.

**Endpoint**: `POST /functions/v1/maigret-store-snapshot`

**Request**:
```json
{
  "username": "testuser",
  "workspaceId": "uuid",
  "scanId": "uuid",
  "findings": [
    {
      "site": "GitHub",
      "url": "https://github.com/testuser",
      "status": "found",
      "confidence": 0.9,
      "rawData": {...}
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "snapshotsStored": 15,
  "snapshots": [...]
}
```

### 2. `maigret-detect-changes`

Compares current scan to previous snapshots and detects changes.

**Endpoint**: `POST /functions/v1/maigret-detect-changes`

**Request**:
```json
{
  "username": "testuser",
  "workspaceId": "uuid",
  "currentFindings": [
    {
      "site": "GitHub",
      "url": "https://github.com/testuser",
      "status": "found",
      "confidence": 0.9
    }
  ]
}
```

**Response**:
```json
{
  "changes": [
    {
      "username": "testuser",
      "site": "Twitter",
      "change_type": "created",
      "change_details": {
        "url": "https://twitter.com/testuser",
        "status": "found"
      }
    }
  ],
  "changeCount": 1,
  "firstScan": false
}
```

**Change Types**:
- `created`: Profile newly found (wasn't there before)
- `deleted`: Profile removed (was there, now gone)
- `modified`: Profile URL or status changed
- `status_changed`: Profile availability changed

### 3. `maigret-send-change-alert`

Sends email alerts for detected changes.

**Endpoint**: `POST /functions/v1/maigret-send-change-alert`

**Request**:
```json
{
  "changeIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response**:
```json
{
  "success": true,
  "emailsSent": 1,
  "recipients": ["user@example.com"]
}
```

**Email Content**:
- Subject: "🔔 X Profile Change(s) Detected: username"
- Lists all changes with emoji indicators
- Links to dashboard for details
- Professionally styled HTML email

### 4. `maigret-monitor-check`

Scheduled function that checks all monitored usernames.

**Endpoint**: `POST /functions/v1/maigret-monitor-check`

**Scheduled**: Every hour via pg_cron

**Process**:
1. Fetch monitored usernames due for checking
2. For each username:
   - Call `providers-maigret` to get current state
   - Store snapshot via `maigret-store-snapshot`
   - Detect changes via `maigret-detect-changes`
   - Send alerts via `maigret-send-change-alert` if changes found
   - Update `last_checked_at` timestamp

**Response**:
```json
{
  "success": true,
  "checked": 5,
  "successful": 4,
  "results": [...]
}
```

## UI Components

### 1. `MonitoredUsernamesManager`

**Location**: `src/components/maigret/MonitoredUsernamesManager.tsx`

**Features**:
- Add new usernames to monitor
- Set custom alert email (optional)
- Toggle email alerts on/off per username
- View last check timestamp
- Delete monitored usernames

**Screenshot**:
```
┌─────────────────────────────────────────────────┐
│ Monitored Usernames                             │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Username]  [Alert Email]  [+ Add to Monitoring│
│                                                 │
│ testuser       [Alerts On]     [Toggle] [X]    │
│ └─ user@email.com                               │
│ └─ Last checked 2 hours ago                     │
│                                                 │
│ johndoe        [Alerts Off]    [Toggle] [X]    │
│ └─ Last checked 1 day ago                       │
└─────────────────────────────────────────────────┘
```

### 2. `ProfileChangesHistory`

**Location**: `src/components/maigret/ProfileChangesHistory.tsx`

**Features**:
- View all detected changes
- Filter by username
- Color-coded change types
- Links to profile URLs
- Email alert status indicator

**Screenshot**:
```
┌─────────────────────────────────────────────────┐
│ Profile Change History           [50 changes]   │
├─────────────────────────────────────────────────┤
│                                                 │
│ ✨ testuser on GitHub [CREATED]                │
│    New profile found: github.com/testuser      │
│    2 hours ago • 📧 Alert sent                  │
│                                                 │
│ 📝 johndoe on Twitter [MODIFIED]               │
│    URL changed from twitter.com/john_doe       │
│    to twitter.com/johndoe                      │
│    1 day ago                                    │
│                                                 │
│ 🗑️ olduser on LinkedIn [DELETED]              │
│    Profile removed: linkedin.com/in/olduser    │
│    3 days ago • 📧 Alert sent                   │
└─────────────────────────────────────────────────┘
```

### 3. `MaigretMonitoring` Page

**Location**: `src/pages/MaigretMonitoring.tsx`

**Route**: `/dashboard/maigret`

**Features**:
- Tabbed interface (Manage / History)
- Info alert explaining functionality
- Integration with workspace system
- Responsive design

## Setup Instructions

### 1. Enable pg_cron Extension

```sql
-- Run via Supabase dashboard SQL editor
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 2. Set Up Cron Job

```sql
-- Schedule hourly monitoring checks
SELECT cron.schedule(
  'maigret-monitor-check',
  '0 * * * *', -- Every hour at :00
  $$
  SELECT net.http_post(
    url:='https://YOUR_PROJECT.supabase.co/functions/v1/maigret-monitor-check',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

**Replace**:
- `YOUR_PROJECT` with your Supabase project ID
- `YOUR_ANON_KEY` with your anon key from `.env`

### 3. Verify RESEND_API_KEY

Ensure `RESEND_API_KEY` is configured as a Supabase secret:

```bash
# Check if key exists
supabase secrets list

# If not, add it
supabase secrets set RESEND_API_KEY=your_key_here
```

### 4. Configure Email Domain

1. Go to [resend.com/domains](https://resend.com/domains)
2. Add and verify your domain (e.g., `footprintiq.app`)
3. Update the `from` email in `maigret-send-change-alert/index.ts`

## Usage

### Add Username to Monitoring

1. Navigate to `/dashboard/maigret`
2. Enter username to monitor
3. Optionally set custom alert email
4. Click "Add to Monitoring"

### View Change History

1. Go to "Change History" tab
2. View all detected changes
3. Click profile URLs to investigate
4. Filter by username (optional)

### Toggle Alerts

1. In monitored usernames list
2. Use toggle switch to enable/disable alerts
3. Changes take effect immediately

## Email Alert Example

```
Subject: 🔔 2 Profile Changes Detected: testuser

─────────────────────────────────────
 Profile Changes Detected
─────────────────────────────────────

We detected 2 changes to the username testuser:

✨ GitHub - CREATED
   Found at: https://github.com/testuser

📝 Twitter - MODIFIED
   URL changed from https://twitter.com/test_user
   to https://twitter.com/testuser

What's next?
Review these changes in your FootprintIQ dashboard
to investigate any suspicious activity or track
profile updates.

[View Changes in Dashboard]

─────────────────────────────────────
FootprintIQ - Username Monitoring
To stop receiving alerts for this username,
disable monitoring in your dashboard.
```

## Monitoring & Troubleshooting

### View Cron Job Status

```sql
SELECT * FROM cron.job_run_details
WHERE jobname = 'maigret-monitor-check'
ORDER BY runid DESC
LIMIT 10;
```

### Check Edge Function Logs

```bash
# View monitoring check logs
supabase functions logs maigret-monitor-check

# View change detection logs
supabase functions logs maigret-detect-changes

# View email alert logs
supabase functions logs maigret-send-change-alert
```

### Common Issues

**No Alerts Received**:
1. Check `email_alerts_enabled` is `true`
2. Verify `alert_email` is set or user has valid email
3. Check `maigret_profile_changes` table for `email_sent = false`
4. Review Resend dashboard for delivery status

**Cron Not Running**:
1. Verify pg_cron extension is enabled
2. Check cron job exists: `SELECT * FROM cron.job;`
3. Review cron logs: `SELECT * FROM cron.job_run_details;`

**No Changes Detected**:
1. Confirm username has monitored profiles
2. Check snapshot timestamps in `maigret_profile_snapshots`
3. Verify `last_checked_at` is updating

## Performance Considerations

- **Snapshot Storage**: ~1KB per profile per scan
- **Retention**: Consider archiving old snapshots after 90 days
- **Monitoring Frequency**: Default 24 hours, adjustable per username
- **Concurrent Checks**: Cron processes monitored usernames sequentially

## Security & Privacy

- RLS policies restrict data to workspace members
- Email addresses encrypted in transit
- Snapshots contain only public profile data
- Users can delete monitoring anytime
- Alert emails sent via secure Resend API

## Future Enhancements

- [ ] SMS alerts via Twilio
- [ ] Webhook notifications
- [ ] Custom check frequencies per username
- [ ] Trend analysis and pattern detection
- [ ] Export change history to CSV/PDF
- [ ] Slack/Discord integrations
- [ ] Profile screenshot comparisons
- [ ] Batch monitoring operations

## References

- [pg_cron Documentation](https://github.com/citusdata/pg_cron)
- [Resend API](https://resend.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
