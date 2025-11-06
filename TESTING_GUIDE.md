# Advanced Scanning & Stripe Payment Testing Guide

## Overview
This guide provides a comprehensive walkthrough to test the Advanced Scanning functionality and Stripe payment integration before going to production.

## Prerequisites
- [ ] Lovable Cloud enabled
- [ ] All API secrets configured (check Settings → Cloud → Secrets)
- [ ] Stripe integration enabled
- [ ] Stripe webhook configured (if using webhooks)

---

## Part 1: Advanced Scanning Testing

### 1.1 Basic Scan Flow Test

**Objective**: Verify the complete scan workflow from initiation to results display.

#### Steps:
1. **Start a Scan**:
   - Navigate to Dashboard
   - Click "Advanced Scan" button
   - Fill in scan targets (email, phone, username, or name)
   - Select advanced options (optional):
     - Deep Web Monitoring
     - Social Media Deep Scan
     - Face Recognition
     - Behavioral Pattern Analysis
     - Data Correlation Engine
     - Threat Forecasting
   - Click "Start Advanced Scan"

2. **Verify Scan Creation**:
   - Check that a success toast appears
   - Navigate to the Scans tab in Dashboard
   - Confirm the new scan appears in the list with status "pending" or "processing"

3. **Monitor Scan Progress**:
   - Click "View" on the scan
   - Verify you're redirected to `/results/:scanId`
   - Observe the scan progress indicators
   - The page should poll every 5 seconds for updates

4. **Verify Results Display**:
   - Once scan completes, verify the following sections appear:
     - Privacy Score
     - Scan Summary
     - Data Sources Found
     - Social Profiles
     - Findings (if any)
     - Timeline Chart
     - Graph Explorer (entity relationships)
   - Check that all data is displayed correctly

#### Expected Behavior:
- ✅ Scan creates successfully
- ✅ Scan appears in dashboard list
- ✅ Results page loads without errors
- ✅ Data populates within 30 seconds to 2 minutes
- ✅ All sections display relevant information

#### Common Issues:
- **Scan stuck in "pending"**: Check edge function logs for errors
- **No results appearing**: Verify API keys are configured for providers
- **Page keeps loading**: Check browser console for errors

---

### 1.2 Provider Integration Test

**Objective**: Verify that external API providers are working correctly.

#### Required Secrets:
Check that these are configured in Cloud → Secrets:
- `HIBP_API_KEY` (Have I Been Pwned)
- `DEHASHED_API_KEY` and `DEHASHED_API_KEY_USERNAME` (DeHashed)
- `INTELX_API_KEY` (Intelligence X)
- `APIFY_API_TOKEN` (Apify actors for premium features)
- `GOOGLE_API_KEY` and `GOOGLE_SEARCH_API_KEY` (if using Google features)
- Other provider keys as needed

#### Testing Steps:
1. **Check Edge Function Logs**:
   - Go to Cloud → Functions
   - Click on "scan-orchestrate" function
   - View recent logs
   - Look for provider invocation logs
   - Check for any API errors or rate limits

2. **Test Individual Providers**:
   - Start a scan with a known test email (e.g., test@example.com)
   - Check logs to see which providers responded
   - Verify findings appear for each provider

3. **Test Premium Features** (if enabled):
   - Enable "Social Media Deep Scan" option
   - Verify Apify actors are called
   - Check for social profile results

#### Expected Logs:
```
[scan-orchestrate] Provider hibp: success (3 findings)
[scan-orchestrate] Provider dehashed: success (1 finding)
[scan-orchestrate] Provider intelx: success (0 findings)
[scan-orchestrate] Scan completed: 4 total findings
```

#### Troubleshooting:
- **Provider timeouts**: Some providers may be slow; scans can take 1-3 minutes
- **Rate limits**: Check provider documentation for rate limits
- **Invalid API keys**: Verify all secrets are correctly entered

---

### 1.3 Advanced Features Test

#### Face Recognition Test:
1. Start scan with Face Recognition enabled
2. Verify the `reverse-image-search` edge function is called
3. Check for image search results in findings

#### Behavioral Analysis Test:
1. Enable "Behavioral Pattern Analysis"
2. Verify the `behavioral-analysis` edge function is invoked
3. Check for behavioral insights in results

#### Correlation Engine Test:
1. Enable "Data Correlation Engine"
2. Verify the `correlation-engine` edge function runs
3. Check for correlated data in the Graph Explorer view

#### Threat Forecasting Test:
1. Enable "Threat Forecasting"
2. Verify the `threat-forecast-generator` function is called
3. Check for threat predictions in the AI Analysis section

---

## Part 2: Stripe Payment Testing

### 2.1 Initial Setup Verification

**Objective**: Ensure Stripe is properly configured.

#### Check Configuration:
1. **Verify Secrets**:
   - Go to Cloud → Secrets
   - Confirm these exist:
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET` (if using webhooks)

2. **Verify Price IDs**:
   - Check if Stripe price IDs are configured:
     - `STRIPE_PRICE_ANALYST`
     - `STRIPE_PRICE_PRO`
     - `STRIPE_PRICE_ENTERPRISE`
   - These should be actual Stripe price IDs (format: `price_xxxxx`)

3. **Test Edge Functions**:
   - Go to Cloud → Functions
   - Check these functions exist and deploy successfully:
     - `billing/checkout`
     - `billing/check-subscription`
     - `billing/create-portal`

---

### 2.2 Subscription Checkout Test

**Objective**: Verify the complete subscription purchase flow.

#### Testing Steps:

1. **From Pricing Page**:
   - Navigate to `/pricing` (or the Pricing section)
   - Click "Get Started" on any paid tier (Pro, Analyst, Enterprise)
   - Verify checkout session is created
   - Check that a Stripe Checkout page opens in a new tab

2. **From Settings/Billing**:
   - Go to Settings → Billing
   - Click "Upgrade" button
   - Select a plan
   - Verify checkout session is created

3. **Complete Test Purchase**:
   - In the Stripe Checkout page:
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC
   - Any billing ZIP code
   - Complete the purchase

4. **Verify Subscription Activation**:
   - After successful payment, you should be redirected back
   - Check Settings → Billing for updated subscription status
   - Verify your tier is now showing as "Pro", "Analyst", or "Enterprise"

#### Expected Behavior:
- ✅ Checkout session URL is returned from edge function
- ✅ Stripe Checkout page opens successfully
- ✅ Test payment completes without errors
- ✅ User is redirected back to the app
- ✅ Subscription status updates in Settings

---

### 2.3 Billing Portal Test

**Objective**: Verify users can manage their subscriptions.

#### Testing Steps:
1. Go to Settings → Billing
2. Click "Manage Subscription" or "Update Payment Method"
3. Verify Stripe Customer Portal opens
4. Test the following in the portal:
   - View subscription details
   - Update payment method
   - Cancel subscription (use test mode)
   - Download invoices

#### Expected Behavior:
- ✅ Portal session is created
- ✅ Stripe portal opens in new tab
- ✅ All management options are available
- ✅ Changes sync back to the app

---

### 2.4 Credits Purchase Test (if applicable)

**Objective**: Test one-time credit purchases.

#### Testing Steps:
1. Navigate to Credits section
2. Click "Buy Credits"
3. Select credit package
4. Complete checkout with test card
5. Verify credits are added to account

---

## Part 3: Integration Testing

### 3.1 End-to-End User Flow

**Objective**: Test the complete user journey from signup to scan results.

#### Full Flow Test:
1. **Sign Up**: Create a new test account
2. **Dashboard**: Navigate to dashboard
3. **Start Scan**: Initiate an advanced scan
4. **View Results**: Wait for scan completion and view results
5. **Upgrade**: Attempt to upgrade to a paid plan
6. **Complete Payment**: Finish Stripe checkout
7. **Advanced Features**: Test premium scan options
8. **Export**: Export scan results (JSON, CSV, PDF)

---

## Part 4: Error Handling Test

### 4.1 Test Error Scenarios

1. **Invalid API Keys**:
   - Temporarily set an invalid API key
   - Run a scan
   - Verify graceful error handling
   - Check that partial results still display

2. **Network Failures**:
   - Disable network briefly during scan
   - Verify proper timeout handling

3. **Stripe Errors**:
   - Use Stripe test cards for declined payments
   - Test card: `4000 0000 0000 0002` (declined)
   - Verify proper error messages display

---

## Part 5: Production Readiness Checklist

### Before Going Live:

#### Configuration:
- [ ] All API keys are production keys (not test/sandbox)
- [ ] Stripe is in live mode (not test mode)
- [ ] Webhook endpoints are configured for production URLs
- [ ] Rate limiting is configured appropriately
- [ ] Monitoring and alerts are set up

#### Security:
- [ ] All secrets are properly secured
- [ ] RLS policies are correctly configured
- [ ] Input validation is in place
- [ ] CORS settings are production-ready

#### Testing:
- [ ] All test scenarios pass
- [ ] Load testing completed (if expecting high traffic)
- [ ] Error handling is robust
- [ ] Logs are properly configured

#### User Experience:
- [ ] Loading states are clear
- [ ] Error messages are user-friendly
- [ ] Success feedback is provided
- [ ] Help documentation is available

---

## Troubleshooting Common Issues

### Advanced Scanning Issues

#### Issue: Scan stuck in pending
**Solution**:
- Check edge function logs for errors
- Verify all provider API keys are valid
- Check for rate limiting
- Ensure workspace has sufficient credits

#### Issue: No results appearing
**Solution**:
- Verify scan completed successfully (check `scans` table)
- Check `findings`, `data_sources`, and `social_profiles` tables for data
- Review edge function logs for errors
- Confirm API providers returned data

#### Issue: Slow scan performance
**Solution**:
- Some providers have rate limits
- Consider optimizing provider selection
- Check network connectivity to external APIs
- Review timeout settings in edge functions

---

### Stripe Payment Issues

#### Issue: Checkout not opening
**Solution**:
- Check browser console for errors
- Verify `billing/checkout` function logs
- Confirm STRIPE_SECRET_KEY is valid
- Ensure Stripe price IDs are correctly configured

#### Issue: Subscription not activating
**Solution**:
- Check webhook delivery in Stripe dashboard
- Verify `billing/webhook` function logs
- Confirm webhook secret is correct
- Check `billing_customers` table for subscription data

#### Issue: "Price ID not found" error
**Solution**:
- Verify Stripe price IDs are set as secrets:
  - STRIPE_PRICE_ANALYST
  - STRIPE_PRICE_PRO
  - STRIPE_PRICE_ENTERPRISE
- These must be actual Stripe price IDs from your Stripe account

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check Logs**:
   - Cloud → Functions → View logs for each function
   - Browser console for frontend errors

2. **Review Database**:
   - Cloud → Database → Check tables for data
   - Verify RLS policies aren't blocking access

3. **Test Individual Components**:
   - Test edge functions independently
   - Verify API provider access
   - Check Stripe dashboard for payment logs

4. **Contact Support**:
   - Include error messages
   - Share edge function logs
   - Describe steps to reproduce

---

## Next Steps After Testing

Once all tests pass:
1. Switch Stripe to live mode
2. Update all API keys to production keys
3. Configure production webhooks
4. Enable monitoring and alerts
5. Document any custom configurations
6. Create backup and rollback plan
7. Launch! 🚀
