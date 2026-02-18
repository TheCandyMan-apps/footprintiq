
## Wiring Telegram Phone Presence into the Phone Scan Pipeline

### What's Already Built
The `handle_phone_presence` handler in the Telegram Cloud Run worker is **fully implemented** and wired into the worker's `ROUTES`. The `telegram-proxy` edge function already validates `phone_presence` requests and routes them correctly. Both pieces are production-ready.

### What's Missing: The Trigger

The `n8n-scan-trigger` edge function already builds a `telegramOptions` object for phone scans (with `action: 'phone_presence'`, `phoneE164`, and `consentConfirmed: true`), but it **only passes this data to the n8n workflow** — it never directly calls `telegram-proxy` for phone scans. The dedicated Telegram trigger block (lines 575–630 in `n8n-scan-trigger`) only activates for `scanType === 'username'`. There is no equivalent block for `scanType === 'phone'`.

Additionally, the `ARTIFACT_KEYS` array in `telegram-proxy/index.ts` does not include `phone_profile` — the artifact key returned by `handle_phone_presence` — so that data would never be persisted to `scan_artifacts`.

---

### Files to Change

| File | Change |
|---|---|
| `supabase/functions/n8n-scan-trigger/index.ts` | Add a parallel Telegram phone-presence trigger block (fire-and-forget) for `scanType === 'phone'` on Pro+ tiers |
| `supabase/functions/telegram-proxy/index.ts` | Add `phone_profile` to `ARTIFACT_KEYS` so `handle_phone_presence` results are persisted |

---

### Technical Detail

#### 1. `n8n-scan-trigger`: New Telegram Phone Block

After the existing `phone-intel` parallel call (lines ~539–573), add a new block that fires `telegram-proxy` directly (fire-and-forget) for Pro+ phone scans:

```typescript
// ==================== TELEGRAM PHONE PRESENCE (fire-and-forget, Pro+ only) ====================
// For phone scans on Pro+ tier, call telegram-proxy to check if the phone
// has a Telegram account. This runs in parallel with phone-intel and n8n.
if (scanType === 'phone' && targetValue && effectiveTier !== 'free') {
  console.log(`[n8n-scan-trigger] Triggering Telegram phone-presence for scan ${scan.id}`);
  
  fetch(`${supabaseUrl}/functions/v1/telegram-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,   // uses service role for internal call
      'x-n8n-key': Deno.env.get('N8N_GATEWAY_KEY') || '',
    },
    body: JSON.stringify({
      action: 'phone_presence',
      scanId: scan.id,
      workspaceId: workspaceId,
      userId: user.id,
      tier: effectiveTier,
      phoneE164: targetValue,
      consentConfirmed: true,
      lawfulBasis: 'legitimate_interest',
    }),
  })
    .then(res => console.log(`[n8n-scan-trigger] Telegram phone-presence responded: ${res.status}`))
    .catch(err => console.error(`[n8n-scan-trigger] Telegram phone-presence error: ${err.message}`));
    
  console.log(`[n8n-scan-trigger] Telegram phone-presence triggered (fire-and-forget)`);
}
```

**Why call `telegram-proxy` directly (not via n8n)?**
The phone scan n8n workflow's Telegram node would need `consentConfirmed` and E.164 formatting passed correctly. The existing pattern for Telegram username avoids this by having its own dedicated n8n workflow. For phone, calling `telegram-proxy` directly from `n8n-scan-trigger` mirrors the `email-intel` and `phone-intel` parallel call pattern — simpler, faster, no n8n dependency.

**Why use `N8N_GATEWAY_KEY` as the `x-n8n-key` header?**
`telegram-proxy` authenticates via `x-n8n-key` (matching `N8N_GATEWAY_KEY`). Since this is an internal service-to-service call, using the gateway key is the correct auth path without requiring a user JWT. The `N8N_GATEWAY_KEY` secret is already configured.

**What about `n8n-scan-results` finalization?**
`telegram-proxy` does NOT call `n8n-scan-results` — it stores findings directly in the `findings` table and artifacts in `scan_artifacts` via the service client inside `telegram-proxy/index.ts`. No scan finalization risk.

#### 2. `telegram-proxy`: Add `phone_profile` to `ARTIFACT_KEYS`

The existing `ARTIFACT_KEYS` array only covers channel-related artifacts. `handle_phone_presence` returns `artifacts: { phone_profile: {...} }`. Add `phone_profile` so it gets persisted:

```typescript
const ARTIFACT_KEYS: Array<{ key: string; type: string }> = [
  { key: "channel_metadata", type: "channel_metadata" },
  { key: "channel_messages", type: "channel_messages" },
  { key: "linked_channels", type: "linked_channels" },
  { key: "activity_analysis", type: "activity_analysis" },
  { key: "risk_indicators", type: "risk_indicators" },
  { key: "relationship_graph", type: "relationship_graph" },
  { key: "channel_profile", type: "channel_profile" },   // personal account profile (username lookup)
  { key: "phone_profile", type: "phone_profile" },       // ADD THIS — phone presence result
];
```

---

### Data Flow After the Fix

```text
User triggers phone scan (Pro+)
         │
         ▼
n8n-scan-trigger
    ├─ fire n8n workflow (PhoneInfoga)      → n8n-scan-results (finalises)
    ├─ fire phone-intel (parallel)          → writes findings directly
    └─ fire telegram-proxy (new, parallel)  → telegram-worker /telegram/phone-presence
                                                     │
                                                     ▼
                                            findings → findings table
                                            artifacts → scan_artifacts (phone_profile)
```

### What the UI Gets

The `phone_presence` finding kind is already handled in the existing phone results UI — it returns:
- `registered: true/false`
- `display_name`, `username` (if public)
- `photo_present`, `verified`, `bot`
- `last_seen` bucket (recently / within_week / within_month / offline / hidden)
- `profile_url` (if username is public)

No UI changes are required — the findings schema is already compatible with the phone results view.

### Tier Gating

The block only runs when `effectiveTier !== 'free'`. `telegram-proxy` enforces a secondary Pro+ gate on `phone_presence` (`ACTION_TIER_GATE.phone_presence = "pro"`), providing defense in depth.

### Privacy & Ethics

- The E.164 phone number is the target the user has already submitted for scanning
- `handle_phone_presence` uses ephemeral contact import (deleted immediately after lookup)
- Only public Telegram profile data is returned — no private messages, no contact lists
- The worker logs `phone[:6]***` to avoid storing full numbers in logs
