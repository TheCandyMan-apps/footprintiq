# Credit Pack Purchase System

## Overview
Dynamic credit pack purchase system integrated with Stripe for premium monetization.

## Credit Packs

### OSINT Starter Pack
- **Credits**: 500
- **Price**: $9 USD
- **Value**: $0.018 per credit
- **Best For**: Getting started with OSINT investigations
- **Stripe Product ID**: `prod_TOBP5MSoYtgefY`
- **Stripe Price ID**: `price_1SRP2KPNdM5SAyj7j99PagEP`

### Pro Pack (Most Popular)
- **Credits**: 2000
- **Price**: $29 USD
- **Value**: $0.0145 per credit (19% better value)
- **Best For**: Power users and professional investigators
- **Stripe Product ID**: `prod_TOBP6U1ZvowHE7`
- **Stripe Price ID**: `price_1SRP2WPNdM5SAyj7GLCvttAF`

## Features

### 1. Purchase Flow
- One-time payment via Stripe Checkout
- Supports both new and returning customers
- Secure authentication via Supabase
- Instant credit delivery via webhook

### 2. Webhook Integration
- Listens to `checkout.session.completed` events
- Automatically adds credits to user's workspace
- Creates audit log entries for all purchases
- Handles metadata extraction (user_id, workspace_id, credits, pack_type)

### 3. UI Components

#### CreditPackCard Component
Located in `src/components/CreditPackCard.tsx`
- Displays pack name, credits, and price
- Shows price per credit calculation
- Estimates number of scans possible
- Includes "Most Popular" badge for Pro Pack
- Loading states during purchase

#### Billing Page Integration
Located in `src/pages/Settings/Billing.tsx`
- Credit packs section above billing history
- Purchase success/cancel notifications
- Automatic workspace detection
- Error handling with user-friendly messages

#### Header Credits Display
Located in `src/components/Header.tsx`
- Shows current credit balance in navbar
- Only visible for non-premium users
- Clickable to navigate to billing page
- Real-time updates (refreshes every 30 seconds)

### 4. Low Balance Warning
- Toast notification when credits < 50
- Only shown once per session
- Includes "Buy Credits" action button
- Auto-navigates to billing page

## Backend Functions

### purchase-credit-pack
**Path**: `supabase/functions/purchase-credit-pack/index.ts`
**Method**: POST
**Auth**: Required
**Request**:
```json
{
  "packType": "starter" | "pro",
  "workspaceId": "uuid"
}
```
**Response**:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### stripe-credit-webhook
**Path**: `supabase/functions/stripe-credit-webhook/index.ts`
**Method**: POST
**Auth**: Stripe signature verification
**Handles**: `checkout.session.completed` events
**Actions**:
1. Validates webhook signature
2. Extracts metadata from session
3. Adds credits to workspace via `credits_ledger` table
4. Creates audit log entry

## Database Schema

### credits_ledger Table
```sql
- workspace_id (uuid, FK to workspaces)
- delta (integer) - positive for additions, negative for deductions
- reason (text)
- meta (jsonb) - stores stripe_session_id, pack_type, etc.
```

### audit_log Table
```sql
- workspace_id (uuid)
- user_id (uuid)
- action (text) - 'credit_purchase'
- target (text) - e.g., '500 credits'
- meta (jsonb)
```

## Setup Instructions

### 1. Configure Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-credit-webhook`
3. Select event: `checkout.session.completed`
4. Copy webhook signing secret
5. Set `STRIPE_WEBHOOK_SECRET` in Supabase secrets

### 2. Environment Variables
Required secrets (already configured):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Testing
```bash
# Test purchase flow
npm run test:credit-packs

# Mock purchase assertions:
# - Checkout session created
# - Credits added after webhook
# - Low balance warning triggered
# - Price per credit calculations
```

## Usage Example

```typescript
// In any component
import { supabase } from '@/integrations/supabase/client';

async function buyCredits(packType: 'starter' | 'pro') {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  // Create checkout session
  const { data, error } = await supabase.functions.invoke('purchase-credit-pack', {
    body: { packType, workspaceId: workspace.id },
  });

  if (data?.url) {
    window.open(data.url, '_blank');
  }
}
```

## Security Features
- Authentication required for all purchases
- Workspace ownership verified
- Stripe signature verification on webhooks
- Audit logging for compliance
- Service role key used for credit additions

## Future Enhancements
- Custom credit pack amounts
- Bulk discounts for enterprise
- Gift credits to other users
- Credit expiration dates
- Refund handling
