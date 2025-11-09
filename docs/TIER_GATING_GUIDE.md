# Tier Gating System Guide

## Overview

FootprintIQ implements a comprehensive subscription tier system with three tiers:
- **Free**: Basic features for getting started
- **Pro**: Advanced OSINT capabilities with premium features
- **Enterprise**: Unlimited access with all features

## Subscription Tiers

### Free Tier
- 10 scans per month
- 2 dark web monitors
- 100 API calls per hour
- 1 team member
- 30 days data retention
- 5 AI queries per month
- Basic features only

### Pro Tier
- 100 scans per month
- 10 dark web monitors
- 1,000 API calls per hour
- 5 team members
- 90 days data retention
- 50 AI queries per month
- Maigret username scanning
- Dark web monitoring
- Advanced scan features

### Enterprise Tier
- Unlimited scans
- Unlimited monitors
- 10,000 API calls per hour
- Unlimited team members
- 730 days data retention
- Unlimited AI queries
- All Pro features
- Batch scanning
- SSO authentication
- Priority support

## Feature Gating

### Using the Feature Gate Component

```tsx
import { FeatureGate } from '@/components/tier-gating/FeatureGate';

function MyComponent() {
  return (
    <FeatureGate feature="maigret">
      {/* This content only shows for Pro+ users */}
      <MaigretScanner />
    </FeatureGate>
  );
}
```

### Using the Tier Gating Hook

```tsx
import { useTierGating } from '@/hooks/useTierGating';

function MyComponent() {
  const { checkFeatureAccess, isFree, isPro, isEnterprise } = useTierGating();
  
  const maigretAccess = checkFeatureAccess('maigret');
  
  if (!maigretAccess.hasAccess) {
    return <div>Requires {maigretAccess.requiresTier} tier</div>;
  }
  
  return <MaigretScanner />;
}
```

## Credit System

### Scan Costs

| Scan Type | Credits | Available To |
|-----------|---------|--------------|
| Basic | 1 | All tiers |
| Advanced | 5 | Pro+ |
| Maigret | 3 | Pro+ |
| Dark Web | 10 | Pro+ |
| Batch | 2 per scan | Enterprise only |

Enterprise tier: **All scans are free** (0 credits)

### Checking Credit Cost

```tsx
import { getScanCost } from '@/lib/workspace/quotas';

const cost = getScanCost(tier, 'advanced');
// Returns 5 for free/pro, 0 for enterprise
```

## Gated Features

### Feature Access Matrix

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Basic Scan | ✅ | ✅ | ✅ |
| Advanced Scan | ❌ | ✅ | ✅ |
| Maigret Username | ❌ | ✅ | ✅ |
| Dark Web Monitoring | ❌ | ✅ | ✅ |
| Batch Scanning | ❌ | ❌ | ✅ |
| AI Analyst | Limited (5/mo) | ✅ (50/mo) | ✅ (Unlimited) |
| Priority Support | ❌ | ❌ | ✅ |
| SSO | ❌ | ❌ | ✅ |

### Programmatic Access Check

```tsx
import { hasFeatureAccess } from '@/lib/workspace/quotas';

if (!hasFeatureAccess(tier, 'maigret')) {
  // Show upgrade prompt
  return <UpgradePrompt requiresTier="pro" />;
}

// Proceed with feature
```

## UI Components

### Tier Badge

Display the user's current tier:

```tsx
import { TierBadge } from '@/components/tier-gating/FeatureGate';

<TierBadge tier={subscriptionTier} />
```

### Tier Comparison Table

Show all tiers and their features:

```tsx
import { TierComparisonTable } from '@/components/tier-gating/TierComparisonTable';

<TierComparisonTable />
```

## Backend Integration

### Edge Function Example

```typescript
import { createClient } from '@supabase/supabase-js';
import { hasFeatureAccess } from '../_shared/tier-gating.ts';

export async function handler(req: Request) {
  const supabase = createClient(/* ... */);
  
  // Get user tier
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('subscription_tier')
    .eq('user_id', user.id)
    .single();
  
  const tier = userRole?.subscription_tier || 'free';
  
  // Check access
  if (!hasFeatureAccess(tier, 'maigret')) {
    return new Response(
      JSON.stringify({ error: 'Requires Pro or Enterprise tier' }), 
      { status: 403 }
    );
  }
  
  // Proceed with operation
}
```

### Credit Deduction

```typescript
import { getScanCost } from '../_shared/tier-gating.ts';
import { supabase } from './supabase.ts';

async function performScan(tier: string, scanType: string, workspaceId: string) {
  const cost = getScanCost(tier, scanType);
  
  if (cost > 0) {
    // Deduct credits
    const { data: spent } = await supabase.rpc('spend_credits', {
      _workspace_id: workspaceId,
      _cost: cost,
      _reason: `${scanType} scan`,
      _meta: { scan_type: scanType }
    });
    
    if (!spent) {
      throw new Error('Insufficient credits');
    }
  }
  
  // Proceed with scan
}
```

## Testing

Run tier gating tests:

```bash
npm run test tests/tier-gating.test.ts
```

### Test Coverage

- ✅ Feature access control for all tiers
- ✅ Credit cost calculations
- ✅ Quota enforcement
- ✅ Legacy tier migration (analyst → pro)
- ✅ Access scenario validation

## Upgrade Flow

Users are prompted to upgrade when accessing gated features:

1. User attempts to access premium feature
2. `FeatureGate` component shows upgrade prompt
3. User clicks "Upgrade to Pro/Enterprise"
4. Redirected to `/settings/billing`
5. Complete Stripe checkout
6. Tier updated automatically via webhook

## Migration Notes

### Legacy Analyst Tier

The `analyst` tier has been consolidated into `pro`:

```typescript
// Automatically handled in getQuotas()
const quotas = getQuotas('analyst'); // Returns pro quotas
```

### Database Schema

The `user_roles` table supports these values:
- `free`
- `pro`
- `enterprise`

Legacy `analyst` values are mapped to `pro` in application code.

## Best Practices

1. **Always use tier gating for premium features**
   - Don't rely on UI hiding alone
   - Enforce on backend edge functions

2. **Provide clear upgrade paths**
   - Show specific tier required
   - Link to billing page

3. **Handle edge cases**
   - Loading states
   - Expired subscriptions
   - Trial periods

4. **Test thoroughly**
   - Mock all tier levels
   - Test access and denials
   - Verify credit deductions

## Support

For questions or issues with tier gating:
- Check test suite: `tests/tier-gating.test.ts`
- Review implementation: `src/lib/workspace/quotas.ts`
- See components: `src/components/tier-gating/`
