

# Fix Email and Phone Provider Scans

## Problem Identified

Two critical issues are preventing findings from being stored:

### Issue 1: Database Schema Mismatch

The `email-intel` and `phone-intel` edge functions are trying to insert columns that **don't exist** in the `findings` table.

**Error from logs:**
```
Failed to store findings: {
  code: "PGRST204",
  message: "Could not find the 'description' column of 'findings' in the schema cache"
}
```

| Column Used in Code | Exists in Table? |
|---------------------|------------------|
| `id` | Yes |
| `scan_id` | Yes |
| `workspace_id` | Yes |
| `provider` | Yes |
| `kind` | Yes |
| `severity` | Yes |
| `confidence` | Yes |
| `evidence` | Yes |
| `observed_at` | Yes |
| `meta` | Yes |
| `type` | No |
| `title` | No |
| `description` | No |
| `raw_data` | No |
| `impact` | No |
| `remediation` | No |
| `tags` | No |
| `finding_id` | No |

### Issue 2: Missing phone-intel Trigger

The `n8n-scan-trigger` function calls `email-intel` for email scans but does **not** call `phone-intel` for phone scans. This means phone API providers (Abstract Phone, IPQS Phone, NumVerify) are never invoked.

---

## Solution

### Part 1: Fix email-intel Schema Mapping

Update `supabase/functions/email-intel/index.ts` to only insert columns that exist:

**Current (broken):**
```typescript
findings.push({
  id: generateFindingId(...),
  scan_id: scanId,
  workspace_id: workspaceId,
  provider: 'hibp',
  kind: 'breach.hit',
  type: 'breach_check',         // NOT IN TABLE
  title: 'Breach: ...',         // NOT IN TABLE
  description: '...',           // NOT IN TABLE
  severity: 'high',
  confidence: 0.95,
  evidence: [...],
  observed_at: new Date().toISOString(),
  raw_data: breach,             // NOT IN TABLE
});
```

**Fixed:**
```typescript
findings.push({
  id: generateFindingId(...),
  scan_id: scanId,
  workspace_id: workspaceId,
  provider: 'hibp',
  kind: 'breach.hit',
  severity: 'high',
  confidence: 0.95,
  evidence: [...],
  observed_at: new Date().toISOString(),
  meta: {                       // Store extra data in 'meta' column
    type: 'breach_check',
    title: 'Breach: ...',
    description: '...',
    raw_data: breach,
  },
});
```

### Part 2: Fix phone-intel Schema Mapping

Update `supabase/functions/phone-intel/index.ts` to only insert columns that exist:

**Current (broken):**
```typescript
.insert(findings.map(f => ({
  scan_id: scanId,
  finding_id: f.id,             // NOT IN TABLE
  provider: f.provider,
  kind: ...,
  severity: f.severity,
  confidence: f.confidence,
  title: f.title,               // NOT IN TABLE
  description: f.description,   // NOT IN TABLE
  evidence: f.evidence,
  impact: f.impact,             // NOT IN TABLE
  remediation: f.remediation,   // NOT IN TABLE
  tags: f.tags,                 // NOT IN TABLE
  observed_at: f.observedAt,
  meta: {...},
})))
```

**Fixed:**
```typescript
.insert(findings.map(f => ({
  id: f.id,                     // Use 'id' not 'finding_id'
  scan_id: scanId,
  workspace_id: workspaceId,    // Add workspace_id
  provider: f.provider,
  kind: ...,
  severity: f.severity,
  confidence: f.confidence,
  evidence: f.evidence,
  observed_at: f.observedAt,
  meta: {
    type: f.type,
    title: f.title,
    description: f.description,
    impact: f.impact,
    remediation: f.remediation,
    tags: f.tags,
    providerCategory: f.providerCategory,
  },
})))
```

### Part 3: Add phone-intel Trigger

Update `supabase/functions/n8n-scan-trigger/index.ts` to call `phone-intel` for phone scans (same pattern as email-intel):

```typescript
// For phone scans, also call phone-intel to run API providers
if (scanType === 'phone' && targetValue) {
  console.log(`[n8n-scan-trigger] Triggering phone-intel for ${targetValue.slice(0, 5)}***`);
  
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  try {
    fetch(`${supabaseUrl}/functions/v1/phone-intel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        scanId: scan.id,
        phone: targetValue,
        workspaceId: workspaceId,
        providers: ['abstract_phone', 'ipqs_phone', 'numverify'],
        userPlan: tier,
      }),
    }).then(res => {
      console.log(`[n8n-scan-trigger] phone-intel responded: ${res.status}`);
    }).catch(err => {
      console.error(`[n8n-scan-trigger] phone-intel error: ${err.message}`);
    });
  } catch (phoneIntelError) {
    console.error('[n8n-scan-trigger] Failed to trigger phone-intel:', phoneIntelError);
  }
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/email-intel/index.ts` | Fix schema mapping - move extra fields to `meta` column |
| `supabase/functions/phone-intel/index.ts` | Fix schema mapping - move extra fields to `meta` column |
| `supabase/functions/n8n-scan-trigger/index.ts` | Add phone-intel parallel call for phone scans |

---

## Expected Results After Fix

### Email Scans
- HIBP breach data stored correctly in findings table
- Abstract Email validation data stored
- IPQS Email fraud score data stored

### Phone Scans  
- Abstract Phone carrier intelligence stored
- IPQS Phone risk data stored
- NumVerify validation data stored

---

## Testing Steps

1. Run email scan for `katherinegrapsas@hotmail.com`
2. Verify findings appear in database
3. Run phone scan for `+447951925681`
4. Verify phone findings appear in database
5. Check edge function logs for successful storage

