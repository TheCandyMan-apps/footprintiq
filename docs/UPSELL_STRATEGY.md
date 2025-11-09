# Upsell & Revenue Strategy Documentation

## Overview
This document outlines the upsell and revenue generation strategies implemented in FootprintIQ to maximize conversions and lifetime value.

## 1. Upgrade Teaser CTAs

### Component: `UpgradeTeaser.tsx`
Location: `src/components/upsell/UpgradeTeaser.tsx`

**Purpose:** Display compelling upgrade prompts for free users when they encounter premium features.

**Usage:**
```tsx
<UpgradeTeaser
  feature="maigret"
  title="Unlock Maigret Username Scanning"
  description="Scan 500+ websites and platforms for username presence"
  benefits={[
    "Search across 500+ platforms",
    "Dating sites, forums, social media",
    "Real-time availability checking",
    "Automated report generation"
  ]}
  plan="pro"
/>
```

**Key Features:**
- Contextual presentation based on user tier
- Direct Stripe checkout integration
- Clear value proposition with benefits list
- Pricing transparency ($15/mo for Pro)
- Visual hierarchy with gradient backgrounds

## 2. Annual Bundle Pricing

### Location: `src/pages/Settings/Billing.tsx`

**Implementation:**
- **Pro Monthly:** $15/month
- **Pro Annual:** $150/year (Save $30)
- **Analyst:** $29/month
- **Enterprise:** $299/month

**Benefits Display:**
```typescript
{
  name: 'Pro Annual',
  price: 150,
  period: 'year',
  savings: 30, // Highlighted savings
}
```

**UI Elements:**
- Badge showing "$30 savings"
- Prominent annual option placement
- Clear comparison: $180/year (monthly) vs $150/year (annual)

## 3. Low Credit Email Notifications

### Edge Function: `send-low-credit-email`
Location: `supabase/functions/send-low-credit-email/index.ts`

**Trigger:** When user credits drop below 50

**Email Content:**
- Subject: "⚠️ Low Credits Alert – Top Up Now!"
- Credits remaining count
- Feature benefits reminder
- Credit pack options with pricing
- Direct CTA to billing page

**Throttling:**
- Max 1 email per 24 hours per workspace
- Logged in `email_notifications` table

**Credit Packages Promoted:**
- OSINT Starter: $9 for 500 credits
- Pro Pack: $29 for 2,000 credits (best value)

### Hook: `useLowCreditAlert`
Location: `src/hooks/useLowCreditAlert.tsx`

**Features:**
- Real-time credit monitoring (checks every 60 seconds)
- Toast notification when credits < 50
- Automated email trigger
- Session-based alert deduplication

## 4. Credit Pack Purchasing

### Implementation in Billing.tsx

**Starter Pack:**
- 500 credits for $9
- ~56 advanced scans
- Price per credit: $0.018

**Pro Pack:**
- 2,000 credits for $29
- ~138 advanced scans
- Price per credit: $0.0145
- Marked as "Popular"

**Integration:**
```typescript
const { data, error } = await supabase.functions.invoke('purchase-credit-pack', {
  body: { packType: 'starter', workspaceId: workspace.id },
});

if (data?.url) {
  window.open(data.url, '_blank');
}
```

## 5. Tier-Based Feature Gating

### Credit Costs per Scan Type
```typescript
const SCAN_CREDITS = {
  basic: 1,
  advanced: 5,
  maigret: 3,
  darkweb: 10,
  batch: 2,
};
```

### Access Control
- **Free:** 10 scans/month, basic features only
- **Pro:** Unlimited scans, all features except SSO
- **Enterprise:** Unlimited everything, API access, SSO

## 6. Testing & Validation

### Test File: `tests/upsell-upgrade.test.ts`

**Test Coverage:**
1. ✅ Display upgrade CTAs for free users
2. ✅ Stripe checkout session creation
3. ✅ User role upgrade after payment
4. ✅ Annual bundle savings calculation
5. ✅ Low credit email triggering
6. ✅ Credit ledger updates via webhook
7. ✅ Credit cost calculations
8. ✅ Feature access prevention for free users
9. ✅ Unlimited scans for Enterprise
10. ✅ Pricing tier validation

**Run Tests:**
```bash
npm run test tests/upsell-upgrade.test.ts
```

## 7. Revenue Optimization Metrics

### Key Conversion Points
1. **Feature Gate Encounters:** Free users hitting premium features
2. **Low Credit Alerts:** Email open rates and click-through rates
3. **Annual Bundle Uptake:** Percentage choosing annual vs monthly
4. **Credit Pack Purchases:** Distribution between Starter and Pro packs

### Success Indicators
- Conversion rate from free to paid
- Average revenue per user (ARPU)
- Customer lifetime value (LTV)
- Churn rate by plan type
- Email campaign ROI

## 8. Implementation Checklist

- [x] Create UpgradeTeaser component
- [x] Add annual bundle pricing to Billing.tsx
- [x] Implement send-low-credit-email edge function
- [x] Create useLowCreditAlert hook
- [x] Add comprehensive tests
- [x] Document strategy and usage

## 9. Future Enhancements

### Planned Improvements
1. **Dynamic Pricing:** Location-based pricing (PPP)
2. **Referral Bonuses:** Credits for successful referrals
3. **Usage Analytics:** Track which features drive upgrades
4. **A/B Testing:** Test different CTA copy and placement
5. **Trial Periods:** 7-day Pro trial for free users
6. **Bulk Discounts:** Enterprise volume pricing

### Monitoring
- Track upgrade funnel drop-off points
- Monitor email engagement metrics
- Analyze credit consumption patterns
- Survey users about pricing perception

## 10. Support & Maintenance

### Email Configuration
Requires `RESEND_API_KEY` secret in Supabase.

**Setup:**
1. Create Resend account: https://resend.com
2. Generate API key
3. Add to Supabase secrets
4. Verify domain for production emails

### Database Requirements
Table: `email_notifications`
```sql
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  metadata JSONB
);
```

## Contact
For questions or issues with the upsell system:
- Email: support@footprintiq.app
- Docs: https://docs.footprintiq.app/upsell
