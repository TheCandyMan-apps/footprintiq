# Stripe Webhook Setup Guide for Production

## Overview
Webhooks are essential for handling subscription lifecycle events automatically. They ensure your application stays in sync with Stripe, even when users manage subscriptions directly through Stripe's customer portal or when automatic billing events occur.

---

## Why Webhooks Are Critical

Without webhooks, your application won't know about:
- ✅ Subscription renewals (users get charged but their access doesn't extend)
- ❌ Failed payments (users lose access but you don't know to follow up)
- 🔄 Subscription cancellations (users cancel in Stripe portal but still have access)
- 💳 Payment method updates
- 📧 Trial expiration reminders

**Webhooks solve all these problems automatically.**

---

## What Your Webhook Handles

The `billing/webhook` function automatically processes these events:

### Subscription Events
- **`checkout.session.completed`** - New subscription purchased
- **`customer.subscription.created`** - Subscription starts
- **`customer.subscription.updated`** - Plan changes, renewals, status updates
- **`customer.subscription.deleted`** - Subscription cancelled

### Payment Events
- **`invoice.payment_succeeded`** - Successful payment
- **`invoice.payment_failed`** - Payment failure (sends email notification)
- **`payment_intent.payment_failed`** - Payment intent failure

### Customer Communication
- **`customer.subscription.trial_will_end`** - Trial ending soon (sends email)

---

## Setup Instructions

### Step 1: Get Your Webhook Endpoint URL

Your webhook endpoint URL is:
```
https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/billing/webhook
```

This is automatically deployed and ready to receive webhooks.

---

### Step 2: Configure Webhook in Stripe Dashboard

#### For Test Mode (Development):

1. **Go to Stripe Dashboard**:
   - Navigate to: https://dashboard.stripe.com/test/webhooks

2. **Add Endpoint**:
   - Click "+ Add endpoint"
   - Endpoint URL: `https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/billing/webhook`
   - Description: "FootprintIQ Production Webhooks"

3. **Select Events to Listen To**:
   Click "Select events" and choose these:
   
   **Checkout Events:**
   - ✅ `checkout.session.completed`
   
   **Customer Events:**
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `customer.subscription.trial_will_end`
   
   **Invoice Events:**
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   
   **Payment Events:**
   - ✅ `payment_intent.payment_failed`

4. **Save the Endpoint**:
   - Click "Add endpoint"
   - **Copy the "Signing secret"** (starts with `whsec_`)
   - You'll need this for the next step

---

### Step 3: Configure Webhook Secret

The webhook secret ensures that only Stripe can send webhooks to your endpoint.

1. **Add Secret in Lovable Cloud**:
   - Go to Cloud → Secrets
   - Click "Add Secret"
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: Paste the signing secret from Stripe (starts with `whsec_`)
   - Click "Save"

2. **Verify Configuration**:
   ```bash
   # The secret should now be available to your edge function
   # Format: whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### Step 4: Test Your Webhook

#### Test via Stripe Dashboard:

1. **Go to Webhook Settings**:
   - Stripe Dashboard → Developers → Webhooks
   - Click on your newly created webhook

2. **Send Test Event**:
   - Click "Send test webhook"
   - Select `customer.subscription.created`
   - Click "Send test webhook"

3. **Verify Receipt**:
   - Check the webhook event log in Stripe
   - Should show "Success" with 200 response code

#### Test with Real Subscription:

1. **Create Test Subscription**:
   - Go to your app's pricing page
   - Sign in (or create test account)
   - Click "Get Started" on Pro plan
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout

2. **Verify Webhook Processing**:
   - Go to Cloud → Functions → `billing/webhook`
   - Click "View Logs"
   - You should see logs like:
   ```
   [TIMESTAMP] [SUCCESS] Webhook signature verified
   [TIMESTAMP] [SUBSCRIPTION_CREATED] New subscription created
   [TIMESTAMP] [SUBSCRIPTION_ACTIVATED] User subscription activated
   [TIMESTAMP] [SUCCESS] Webhook processed successfully
   ```

3. **Verify Database Updates**:
   - Go to Cloud → Database → Tables
   - Check `user_roles` table
   - Verify user's `subscription_tier` updated to "pro"

---

### Step 5: Monitor Webhook Health

#### View Webhook Logs in Stripe:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. View the "Events" tab to see all webhook deliveries
4. Check for:
   - ✅ Success rate (should be >99%)
   - ⏱️ Response time (should be <2 seconds)
   - ❌ Failed deliveries (investigate any failures)

#### View Edge Function Logs:

1. Go to Cloud → Functions
2. Click "billing/webhook"
3. Click "View Logs"
4. Monitor for errors or warnings

#### Stripe Retries Failed Webhooks:

Stripe automatically retries failed webhooks:
- Immediately
- 1 hour later
- 3 hours later
- 6 hours later
- 12 hours later
- 24 hours later

After 3 days, Stripe stops retrying.

---

### Step 6: Production Deployment

Once testing is complete, repeat the setup for **Live Mode**:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Create New Webhook Endpoint** (same URL):
   ```
   https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/billing/webhook
   ```
3. **Select Same Events** as test mode
4. **Update Webhook Secret**:
   - Copy the new signing secret (live mode has different secret)
   - Update `STRIPE_WEBHOOK_SECRET` in Cloud → Secrets
   - **Important**: Use the LIVE mode secret for production

5. **Update Stripe Keys**:
   - Replace `STRIPE_SECRET_KEY` with your live key (starts with `sk_live_`)
   - Test a real subscription purchase

---

## Troubleshooting

### Webhook Not Receiving Events

**Check 1: Verify Secret Configuration**
- Go to Cloud → Secrets
- Confirm `STRIPE_WEBHOOK_SECRET` exists
- Verify it matches the signing secret in Stripe dashboard

**Check 2: Check Edge Function Logs**
```bash
# Look for these error messages:
- "Missing webhook signature or secret"
- "Webhook signature verification failed"
```

**Check 3: Verify Endpoint URL**
- Must be exact: `https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/billing/webhook`
- No typos in the URL
- HTTPS (not HTTP)

### Webhook Returns Errors

**Error: "Webhook signature verification failed"**
- Wrong signing secret configured
- Using test mode secret in live mode (or vice versa)
- Secret not updated in Cloud → Secrets

**Error: "Missing webhook signature or secret"**
- `STRIPE_WEBHOOK_SECRET` not configured
- Check Cloud → Secrets

**Error: Database/RLS errors**
- Check edge function logs for SQL errors
- Verify RLS policies allow service role access
- Check that `update_user_subscription` RPC function exists

### Subscriptions Not Updating

**Symptom**: User pays but tier doesn't change

1. **Check Stripe Dashboard → Webhooks**:
   - Find the `checkout.session.completed` event
   - Click to view details
   - Check response code (should be 200)
   - View response body

2. **Check Edge Function Logs**:
   - Go to Cloud → Functions → billing/webhook
   - Look for the subscription event
   - Check for errors in processing

3. **Verify Price ID Mapping**:
   - Open `supabase/functions/billing/webhook/index.ts`
   - Check the `tierMap` object:
   ```typescript
   const tierMap = {
     'price_1SPXbHPNdM5SAyj7lPBHvjIi': 'analyst',
     'price_1SPXcEPNdM5SAyj7AbannmpP': 'pro',
   };
   ```
   - Make sure your price IDs are included

4. **Check User Profile**:
   - Verify user has a profile in `profiles` table
   - Email must match Stripe customer email

---

## Email Notifications

The webhook automatically sends emails for:
- 💳 **Payment failures** - Notifies user to update payment method
- ⏰ **Trial ending** - Reminds user trial is ending soon

### Email Configuration:

Emails require the `RESEND_API_KEY` secret:

1. **Sign up for Resend**:
   - Go to https://resend.com
   - Create account
   - Get API key

2. **Add Secret**:
   - Cloud → Secrets
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key

3. **Verify Domain**:
   - In Resend dashboard, add your domain
   - Update email `from` address in webhook function
   - Change from `billing@footprintiq.com` to your domain

4. **Test Email Sending**:
   - Trigger a payment failure (use test card `4000 0000 0000 0002`)
   - Check edge function logs for "EMAIL_SENT"
   - Check Resend dashboard for sent emails

### Email Templates:

You can customize email content by editing the `html` content in:
- `supabase/functions/billing/webhook/index.ts`
- Search for "Payment Failed" or "Trial Ends Soon"

---

## Security Best Practices

### 1. Always Verify Signatures
✅ The webhook function verifies Stripe signatures before processing
✅ Invalid signatures are rejected
✅ This prevents malicious webhook attacks

### 2. Use HTTPS Only
✅ Webhook URL uses HTTPS
✅ Stripe requires HTTPS for webhooks

### 3. Keep Secrets Secure
✅ Webhook secret stored in Cloud Secrets
✅ Never commit secrets to code
✅ Rotate secrets periodically

### 4. Monitor Webhook Health
✅ Check Stripe dashboard regularly
✅ Review edge function logs
✅ Set up alerts for failed webhooks

---

## Webhook Event Flow

Here's what happens when a user subscribes:

```
User completes checkout in Stripe
         ↓
Stripe sends checkout.session.completed webhook
         ↓
billing/webhook function receives event
         ↓
Verifies webhook signature
         ↓
Identifies subscription details (plan, customer)
         ↓
Updates user_roles table with new tier
         ↓
Grants monthly credits (if pro/enterprise)
         ↓
Returns success to Stripe
         ↓
User's subscription is now active!
```

---

## Testing Checklist

Before going live, test these scenarios:

### New Subscription
- [ ] User completes checkout
- [ ] Webhook receives `checkout.session.completed`
- [ ] User tier updates in database
- [ ] Monthly credits are granted
- [ ] User can access premium features

### Subscription Renewal
- [ ] Subscription renews (test with short billing cycle)
- [ ] Webhook receives `customer.subscription.updated`
- [ ] Expiry date extends
- [ ] Additional monthly credits granted

### Failed Payment
- [ ] Payment fails (use decline card `4000 0000 0000 0002`)
- [ ] Webhook receives `invoice.payment_failed`
- [ ] Email notification sent to user
- [ ] User prompted to update payment method

### Subscription Cancellation
- [ ] User cancels in Stripe portal
- [ ] Webhook receives `customer.subscription.deleted`
- [ ] User tier downgrades to free
- [ ] User loses access to premium features

### Trial Ending
- [ ] Trial about to end (3 days before)
- [ ] Webhook receives `customer.subscription.trial_will_end`
- [ ] Email notification sent to user

---

## Support and Monitoring

### Webhook Logs
Access detailed logs at:
- **Stripe Dashboard**: Developers → Webhooks → [Your endpoint] → Events
- **Edge Function Logs**: Cloud → Functions → billing/webhook → View Logs

### Common Log Messages

**Success Messages:**
```
[SUCCESS] Webhook signature verified
[SUBSCRIPTION_ACTIVATED] User subscription activated
[PAYMENT_SUCCESS] Invoice payment succeeded
[EMAIL_SENT] Payment failure notification sent
```

**Error Messages:**
```
[ERROR] Missing webhook signature or secret
[ERROR] Webhook signature verification failed
[EMAIL_ERROR] Failed to send payment failure email
```

### Getting Help

If you encounter issues:
1. Check Stripe Dashboard → Webhooks → Event logs
2. Check Cloud → Functions → billing/webhook logs
3. Verify all secrets are configured correctly
4. Test with Stripe test mode first
5. Contact Stripe support for webhook delivery issues

---

## Next Steps

After webhook setup:
1. ✅ Test all subscription scenarios
2. ✅ Monitor webhook health for first week
3. ✅ Set up email notifications (optional but recommended)
4. ✅ Document any custom configurations
5. ✅ Deploy to production (live mode)

Your webhook integration is now complete! 🎉
