# Referral Program Guide

## Overview
The FootprintIQ Referral Program rewards users with credits for inviting others to the platform. Both the referrer and referee receive credits when the referee completes their first scan.

## How It Works

### For Referrers (People Sharing)

1. **Create Your Referral Code**
   - Navigate to `/referrals`
   - Click "Create Referral Code"
   - Get your unique code (e.g., `JOH3A2B4C`)

2. **Share Your Link**
   - **Referral URL**: `https://footprintiq.app/signup?ref=YOUR_CODE`
   - **Share via**:
     - Email
     - Twitter/X
     - Facebook
     - LinkedIn
     - Direct message

3. **Earn Credits**
   - **100 credits** when referee completes first scan
   - Unlimited referrals
   - No expiration on codes

### For Referees (People Joining)

1. **Sign Up with Referral Code**
   - Click referral link or enter code at signup
   - Code auto-applied from URL parameter

2. **Complete First Scan**
   - Run any scan (username, email, IP, phone)
   - Wait for scan to complete

3. **Receive Bonus Credits**
   - **50 credits** automatically added
   - Credits available immediately after first scan

---

## Reward Structure

| Event | Referrer Reward | Referee Reward |
|-------|----------------|----------------|
| Signup | 0 credits | 0 credits |
| First Scan Complete | +100 credits | +50 credits |

### Conditions
- ✅ One referral bonus per user (referee can only be referred once)
- ✅ Cannot use your own referral code
- ✅ Rewards distributed automatically
- ✅ Credits added to workspace balance
- ✅ No maximum number of referrals

---

## Referral Dashboard

### Stats Overview

**Total Referrals**: All users who signed up with your code

**Successful Referrals**: Users who completed their first scan

**Credits Earned**: Total credits received from referrals

**Conversion Rate**: Percentage of signups that complete a scan

### Recent Referrals Table

View your last 10 referrals with:
- Email (masked for privacy)
- Status (Pending, Completed, Rewarded)
- Credits earned
- Date referred

### Status Meanings

- **Pending**: User signed up but hasn't scanned yet
- **Completed**: User completed first scan, reward pending
- **Rewarded**: Credits distributed to both parties

---

## Technical Implementation

### Database Tables

#### `referral_codes`
Stores unique referral codes for each user.

```sql
- id: UUID
- user_id: UUID (referrer)
- code: TEXT (unique)
- uses: INTEGER (increments on each signup)
- max_uses: INTEGER (NULL = unlimited)
- is_active: BOOLEAN
- created_at: TIMESTAMP
- expires_at: TIMESTAMP (NULL = no expiration)
```

#### `referrals`
Tracks individual referral relationships.

```sql
- id: UUID
- referrer_id: UUID (person who shared)
- referee_id: UUID (person who joined)
- referral_code: TEXT
- status: TEXT (pending, completed, rewarded)
- referrer_reward_credits: INTEGER
- referee_reward_credits: INTEGER
- completed_at: TIMESTAMP
- rewarded_at: TIMESTAMP
- created_at: TIMESTAMP
```

#### `referral_stats`
Aggregated statistics per user.

```sql
- user_id: UUID
- total_referrals: INTEGER
- successful_referrals: INTEGER
- pending_referrals: INTEGER
- total_credits_earned: INTEGER
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Edge Functions

#### `referral-manage`
Handles all referral operations:

**Actions**:
- `create_code`: Generate unique referral code
- `apply_code`: Apply referral code to new user
- `get_stats`: Retrieve referral statistics

**Authentication**: Required (JWT token)

**Rate Limiting**: Standard API limits

### Automatic Reward Distribution

**Trigger**: When `scan_jobs.status` changes to 'completed'

**Process**:
1. Check if user has pending referral
2. Update referral status to 'completed'
3. Add 100 credits to referrer's workspace
4. Add 50 credits to referee's workspace
5. Update referral status to 'rewarded'
6. Update referrer's stats

**Database Function**: `check_referral_completion()`

---

## Security Features

### Row-Level Security (RLS)

**Referral Codes**:
- Users can only view/edit their own codes
- Codes validated server-side

**Referrals**:
- Users see only referrals they're involved in
- Referrer sees who they referred
- Referee sees who referred them

**Stats**:
- Users see only their own statistics
- No cross-user data exposure

### Validation

- ✅ Code uniqueness enforced at database level
- ✅ One referral per user (UNIQUE constraint)
- ✅ Cannot self-refer (validated in function)
- ✅ Active code check before applying
- ✅ Max uses enforcement
- ✅ Expiration date validation

---

## UI Components

### Pages

**`/referrals`** - Main referral dashboard
- Stats overview cards
- Referral code display
- Sharing options
- Recent referrals table
- How it works section

### Components

**`ReferralBanner`** - Promotional banner
- Shows at top of app
- Dismissible
- Only shown to users without codes
- localStorage to prevent repeat displays

**`ReferralCodeInput`** - Signup integration
- Input field for referral code
- Auto-fills from URL parameter (`?ref=CODE`)
- Validates and applies code
- Shows success/error feedback

---

## Marketing Integration

### URL Parameters

**Signup Link Format**:
```
https://footprintiq.app/signup?ref=CODE
```

**Parameter Handling**:
- Automatically extracted on signup page
- Pre-fills referral code input
- Removed from URL after application

### Social Sharing

**Pre-formatted Messages**:

**Email**:
```
Subject: Join FootprintIQ with my referral code!

I've been using FootprintIQ for OSINT investigations and thought 
you might find it useful!

Use my referral link to get 50 bonus credits when you sign up:
https://footprintiq.app/signup?ref=YOUR_CODE

FootprintIQ gives you access to 20+ OSINT providers in one platform.
```

**Twitter/X**:
```
Just found an amazing OSINT platform! Join me on FootprintIQ 
and get 50 bonus credits: https://footprintiq.app/signup?ref=YOUR_CODE
```

**LinkedIn**:
```
Sharing a powerful OSINT tool I've been using. FootprintIQ consolidates 
20+ data providers with AI-powered analysis. Get 50 bonus credits with 
my referral link: https://footprintiq.app/signup?ref=YOUR_CODE
```

---

## Analytics & Tracking

### Key Metrics

**Conversion Funnel**:
1. Referral link clicked
2. Account created with code
3. First scan initiated
4. First scan completed
5. Credits distributed

**Performance Indicators**:
- **Signup Rate**: Clicks → Signups
- **Activation Rate**: Signups → First Scan
- **Conversion Rate**: Signups → Rewarded
- **Average Time to Activation**: Signup → First Scan
- **Viral Coefficient**: Referrals per active user

### Tracking in Database

Query for overall program performance:

```sql
-- Total program stats
SELECT 
  COUNT(DISTINCT referrer_id) as total_referrers,
  COUNT(*) as total_referrals,
  COUNT(*) FILTER (WHERE status = 'rewarded') as successful_referrals,
  ROUND(COUNT(*) FILTER (WHERE status = 'rewarded')::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 2) as conversion_rate,
  SUM(referrer_reward_credits) as total_credits_distributed
FROM referrals;

-- Top referrers
SELECT 
  user_id,
  total_referrals,
  successful_referrals,
  total_credits_earned
FROM referral_stats
ORDER BY successful_referrals DESC
LIMIT 10;

-- Recent referral activity
SELECT 
  DATE(created_at) as date,
  COUNT(*) as signups,
  COUNT(*) FILTER (WHERE status = 'rewarded') as completions
FROM referrals
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## Troubleshooting

### Common Issues

**"Invalid or expired referral code"**
- Code may be deactivated
- Code may have reached max uses
- Code may be expired
- Check code spelling

**"You have already been referred"**
- Each user can only use one referral code
- Cannot change referral after applied
- Contact support if issue

**"You cannot use your own referral code"**
- Self-referrals not allowed
- Use a different account for testing

**Rewards not distributed**
- Check scan completed successfully
- Rewards trigger after first COMPLETED scan
- May take a few seconds to process
- Check credits ledger for transaction

### Debug Steps

1. **Check referral exists**:
```sql
SELECT * FROM referrals WHERE referee_id = 'USER_ID';
```

2. **Check referral status**:
```sql
SELECT status, completed_at, rewarded_at 
FROM referrals 
WHERE referee_id = 'USER_ID';
```

3. **Check credits ledger**:
```sql
SELECT * FROM credits_ledger 
WHERE meta->>'referral_id' = 'REFERRAL_ID';
```

4. **Manually trigger reward**:
```sql
SELECT process_referral_reward('REFERRAL_ID');
```

---

## Best Practices

### For Referrers

1. **Personalize your message** - Explain why you use FootprintIQ
2. **Share in relevant communities** - OSINT forums, security groups
3. **Include use case** - Show what you've accomplished
4. **Follow up** - Help referrals get started
5. **Track performance** - Monitor which channels work best

### For Platform

1. **Monitor abuse** - Watch for fake signups
2. **Adjust rewards** - Based on LTV and CAC
3. **A/B test messaging** - Optimize conversion
4. **Highlight top referrers** - Create leaderboard
5. **Seasonal bonuses** - Limited-time increased rewards

---

## Future Enhancements

### Planned Features

- **Tiered Rewards**: Higher rewards for more referrals
- **Leaderboard**: Public ranking of top referrers
- **Badges**: Achievement system for milestones
- **Team Referrals**: Share across workspace
- **Referral Challenges**: Limited-time bonus events
- **Affiliate Program**: Cash payouts for high-volume referrers

### Metrics to Add

- Click tracking on referral links
- Source attribution (email, social, direct)
- Time-to-activation analytics
- Referee lifetime value tracking
- Churn rate of referred users

---

## API Reference

### Create Referral Code

**Endpoint**: `POST /functions/v1/referral-manage`

**Request**:
```json
{
  "action": "create_code"
}
```

**Response**:
```json
{
  "code": {
    "id": "uuid",
    "code": "JOH3A2B4C",
    "uses": 0,
    "created_at": "2025-11-09T..."
  }
}
```

### Apply Referral Code

**Endpoint**: `POST /functions/v1/referral-manage`

**Request**:
```json
{
  "action": "apply_code",
  "code": "JOH3A2B4C"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Referral code applied! Complete your first scan to earn bonus credits.",
  "referral": {
    "id": "uuid",
    "status": "pending"
  }
}
```

### Get Referral Stats

**Endpoint**: `POST /functions/v1/referral-manage`

**Request**:
```json
{
  "action": "get_stats"
}
```

**Response**:
```json
{
  "code": {
    "code": "JOH3A2B4C",
    "uses": 5
  },
  "stats": {
    "total_referrals": 5,
    "successful_referrals": 3,
    "pending_referrals": 2,
    "total_credits_earned": 300
  },
  "recent_referrals": [
    {
      "id": "uuid",
      "status": "rewarded",
      "created_at": "2025-11-09T...",
      "referee": {
        "email": "user@example.com"
      }
    }
  ]
}
```

---

## Support

### For Users

**Help Center**: https://footprintiq.app/help/referrals
**Email**: referrals@footprintiq.app
**Discord**: #referral-program channel

### For Developers

**Documentation**: https://docs.footprintiq.app/referrals
**API Reference**: https://api.footprintiq.app/docs
**GitHub**: https://github.com/footprintiq/referrals

---

*Last Updated: 2025-11-09*
