# Stripe Payment Setup Guide

## Current Issue
The Stripe payment functionality is not working because the price IDs in the code don't match the actual Stripe prices in your account.

## Solution

### Option 1: Use Existing Price (Recommended for Quick Fix)

You have one existing price in your Stripe account:
- **Price ID**: `price_1SPXcEPNdM5SAyj7AbannmpP`
- **Product**: FootprintIQ Professional
- **Amount**: $79.00/month

#### Quick Fix Steps:

1. **Update the Pricing Component**:
   - Edit `src/components/Pricing.tsx`
   - Update the `STRIPE_PRICES` object:
   ```typescript
   const STRIPE_PRICES = {
     free: null,
     pro: "price_1SPXcEPNdM5SAyj7AbannmpP", // Use your actual price ID
     analyst: null, // Not configured yet
     enterprise: null // Contact sales
   };
   ```

2. **Test the Payment Flow**:
   - Navigate to `/pricing`
   - Click "Get Started" on Pro plan
   - Verify Stripe Checkout opens
   - Use test card: `4242 4242 4242 4242`
   - Complete payment

---

### Option 2: Create Complete Price Structure (Recommended for Production)

To properly support all three tiers (Analyst, Pro, Enterprise), you need to create products and prices for each.

#### Step 1: Create Products and Prices in Stripe

You can use the Lovable Stripe tools to create these:

**For Analyst Tier** ($29/month):
```
Product Name: FootprintIQ Analyst
Description: Entry-level OSINT scanning with basic features and limited scans
Price: $29.00/month
```

**For Pro Tier** ($79/month):
```
Product Name: FootprintIQ Pro
Description: Advanced OSINT features with unlimited scans, dark web monitoring, and AI analysis
Price: $79.00/month
```

**For Enterprise Tier** ($299/month):
```
Product Name: FootprintIQ Enterprise
Description: Complete OSINT platform with API access, team collaboration, and priority support
Price: $299.00/month
```

#### Step 2: Configure Price IDs as Secrets

After creating the products and prices, add them as secrets:

1. Go to Cloud → Secrets
2. Click "Add Secret"
3. Add these three secrets:
   - `STRIPE_PRICE_ANALYST`: `price_xxxxx` (from Stripe)
   - `STRIPE_PRICE_PRO`: `price_xxxxx` (from Stripe)
   - `STRIPE_PRICE_ENTERPRISE`: `price_xxxxx` (from Stripe)

#### Step 3: Update Code to Use Secrets

The `billing/checkout` edge function already uses these environment variables, so once you add the secrets, the checkout flow will work automatically.

However, the `Pricing.tsx` component currently has hardcoded values. You have two options:

**Option A**: Keep hardcoded in frontend (simpler)
- Update `STRIPE_PRICES` in `src/components/Pricing.tsx` with your actual price IDs
- This is fine since price IDs are public information

**Option B**: Fetch from backend (more dynamic)
- Create an edge function to return available price IDs
- Update Pricing component to fetch from that function
- More flexible but adds complexity

---

## Current Code Issues

### 1. Multiple Edge Functions for Checkout

There are currently TWO different checkout functions:
- `billing/checkout` - Used by Settings/Billing page
- `billing/create-subscription` - Used by Pricing page

Both do similar things but have slight differences. 

**Recommendation**: Standardize on `billing/checkout` and update all components to use it.

### 2. Hardcoded Price IDs

The `Pricing.tsx` component has:
```typescript
const STRIPE_PRICES = {
  free: null,
  pro: "price_abc123", // This is a placeholder!
  analyst: "price_xyz789", // This is a placeholder!
  enterprise: null
};
```

These need to be replaced with your actual Stripe price IDs.

### 3. Missing Environment Variables

The `billing/checkout` function expects these environment variables:
- `STRIPE_PRICE_ANALYST`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_ENTERPRISE`

But these are currently not set. You need to add them as secrets.

---

## Testing Checklist

After setting up the prices:

- [ ] Price IDs are created in Stripe
- [ ] Price IDs are added as secrets (or hardcoded in frontend)
- [ ] Navigate to `/pricing` page
- [ ] Click "Get Started" on any paid tier
- [ ] Verify Stripe Checkout opens
- [ ] Complete test purchase with `4242 4242 4242 4242`
- [ ] Verify subscription activates
- [ ] Check Settings → Billing shows correct plan
- [ ] Test billing portal access
- [ ] Test subscription cancellation

---

## Webhook Setup (Optional but Recommended)

For production, you should set up webhooks to handle subscription events:

1. **In Stripe Dashboard**:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/billing/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Copy Webhook Secret**:
   - After creating the webhook, copy the signing secret
   - Add it as a secret: `STRIPE_WEBHOOK_SECRET`

3. **Test Webhook**:
   - Complete a test purchase
   - Check webhook logs in Stripe dashboard
   - Verify `billing/webhook` function logs in Cloud → Functions

---

## Quick Diagnostic

To diagnose Stripe issues, check:

1. **Browser Console**:
   - Open DevTools → Console
   - Look for errors when clicking "Get Started"
   - Check for failed API calls

2. **Edge Function Logs**:
   - Go to Cloud → Functions
   - Click on `billing/create-subscription` or `billing/checkout`
   - View recent logs
   - Look for errors like:
     - "Invalid price_id"
     - "Price not found"
     - "No such price"

3. **Stripe Dashboard**:
   - Go to Stripe Dashboard → Developers → Logs
   - Check API request logs
   - Look for failed requests
   - Verify price IDs are correct

4. **Test API Keys**:
   - Ensure you're using the correct Stripe API keys
   - Test mode keys start with `sk_test_`
   - Live mode keys start with `sk_live_`
   - Make sure STRIPE_SECRET_KEY is set correctly

---

## Immediate Action Required

**To fix Stripe payments NOW**:

1. **Create One Price** (if testing):
   ```bash
   # Use Stripe CLI or dashboard to create:
   Product: FootprintIQ Pro
   Price: $79/month (or your desired amount)
   ```

2. **Update Pricing Component**:
   - Edit `src/components/Pricing.tsx`
   - Replace `price_abc123` with your actual price ID

3. **Test**:
   - Go to `/pricing`
   - Click "Get Started" on Pro
   - Complete test purchase

---

## Support

If you continue to have issues:
1. Share the browser console errors
2. Share edge function logs from Cloud → Functions
3. Verify Stripe dashboard shows the checkout session attempt
4. Check if the price ID is correct in Stripe

The testing guide (`TESTING_GUIDE.md`) has more detailed troubleshooting steps.
