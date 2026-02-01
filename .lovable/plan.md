
# Unified Scan UI Implementation Plan

## Executive Summary

This plan consolidates the current dual-scan architecture (`/scan` + `/advanced`) into a single, tier-aware scan interface at `/scan`. The UI will progressively reveal "Enhance this scan" options based on detected input type, with Pro-only options appearing locked (greyed out with 🔒) for Free users.

**Estimated effort**: 4-6 hours

## Current State Analysis

### Existing Components
- `src/components/ScanForm.tsx` (443 lines) - Simple form with single input + refine options
- `src/pages/AdvancedScan.tsx` (1544 lines) - Complex form with tool selectors, providers, batch mode
- `src/components/ScanProgress.tsx` (459 lines) - Handles scan execution and tier-based routing
- `src/lib/scan/identifierDetection.ts` - Already detects email/phone/username/fullname
- `src/hooks/useTierGating.tsx` - Provides `isFree`, `isPro`, `checkFeatureAccess`
- `src/components/UpgradeDialog.tsx` - Existing upgrade modal

### Backend Routing (already tier-aware)
The `n8n-scan-trigger` edge function already:
- Routes Free tier username scans to `N8N_FREE_SCAN_WEBHOOK_URL` (quick WhatsMyName-only)
- Routes Pro/email/phone scans to `N8N_SCAN_WEBHOOK_URL` (full multi-provider)
- Blocks phone scans for Free tier with `scan_blocked_by_tier`
- Allows email scans for Free tier (Holehe provider available)

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UNIFIED SCAN FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  /scan (ScanPage.tsx)                                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     UnifiedScanForm.tsx                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  "Start Your Digital Footprint Scan"                            │  │  │
│  │  │  ┌───────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │ [Username, email, phone number, or full name]             │  │  │  │
│  │  │  └───────────────────────────────────────────────────────────┘  │  │  │
│  │  │  Phone format: include country code (+1, +44, etc.)             │  │  │
│  │  │                                                                 │  │  │
│  │  │  [ Run scan ]                                                   │  │  │
│  │  │                                                                 │  │  │
│  │  │  We only use public sources. Queries are discarded after...    │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  ProOptionsPanel (shown when input detected)                   │  │  │
│  │  │  "Enhance this scan"                                           │  │  │
│  │  │                                                                 │  │  │
│  │  │  [For username detected:]                                       │  │  │
│  │  │  ☐ Deep profile sweep               [PRO] 🔒                   │  │  │
│  │  │  ☐ Connections graph                [PRO] 🔒                   │  │  │
│  │  │  ☐ Higher confidence signals        [PRO] 🔒                   │  │  │
│  │  │                                                                 │  │  │
│  │  │  [For email detected:]                                          │  │  │
│  │  │  ☐ Breach context & verification    [PRO] 🔒                   │  │  │
│  │  │  ☐ Reputation / risk signals        [PRO] 🔒                   │  │  │
│  │  │                                                                 │  │  │
│  │  │  "Upgrade to Pro to unlock deeper sources..."                  │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│                               │                                             │
│                               ▼                                             │
│                    ScanProgress.tsx                                         │
│                    (passes scanMode + enhancers to backend)                 │
│                               │                                             │
│                               ▼                                             │
│                    n8n-scan-trigger                                         │
│                    (routes to correct workflow)                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Implementation Details

### Phase 1: Type Definitions and Utilities

**File: `src/lib/scan/unifiedScanTypes.ts` (NEW)**

Define the scan contract:

```typescript
export type ScanMode = "free_fast" | "standard" | "pro_deep";

export type EnhancerKey =
  | "deep_coverage"
  | "connections_graph"
  | "confidence_signals"
  | "breach_context"
  | "carrier_intel"
  | "risk_signals"
  | "expanded_sources"
  | "disambiguation";

export type DetectedType = "username" | "email" | "phone" | "name";

export interface UnifiedScanConfig {
  query: string;
  detectedType: DetectedType;
  scanMode: ScanMode;
  enhancers: EnhancerKey[];
  turnstile_token?: string;
}

// Enhancer definitions by detected type
export const ENHANCERS_BY_TYPE: Record<DetectedType, EnhancerConfig[]> = {
  username: [
    { key: "deep_coverage", label: "Deep profile sweep", description: "Search 500+ platforms including social media, forums, gaming sites" },
    { key: "connections_graph", label: "Connections graph", description: "Visualize relationships between discovered profiles" },
    { key: "confidence_signals", label: "Higher confidence signals", description: "Advanced verification to reduce false positives" },
  ],
  email: [
    { key: "breach_context", label: "Breach context & verification", description: "Full breach history with password exposure details" },
    { key: "risk_signals", label: "Reputation / risk signals", description: "Email deliverability, fraud scoring, and spam detection" },
  ],
  phone: [
    { key: "carrier_intel", label: "Carrier & line intelligence", description: "Carrier lookup, line type, and geographic data" },
    { key: "risk_signals", label: "Reputation / risk signals", description: "Fraud scoring and spam detection" },
  ],
  name: [
    { key: "expanded_sources", label: "Expanded sources", description: "Search across people databases and public records" },
    { key: "disambiguation", label: "Disambiguation signals", description: "Cross-reference to reduce false matches" },
  ],
};
```

### Phase 2: ProOptionsPanel Component

**File: `src/components/scan/ProOptionsPanel.tsx` (NEW)**

```typescript
interface ProOptionsPanelProps {
  detectedType: DetectedType;
  isFree: boolean;
  selectedEnhancers: EnhancerKey[];
  onChangeEnhancer: (key: EnhancerKey, enabled: boolean) => void;
  onRequestUpgrade: () => void;
}
```

Features:
- Renders only enhancers relevant to `detectedType`
- Each row shows:
  - Checkbox (disabled for Free)
  - Label + description
  - Lock icon + "Pro" badge for Free users
- Clicking a locked row triggers `onRequestUpgrade()` (does NOT toggle state)
- Footer text for Free: "Upgrade to Pro to unlock deeper sources, confidence signals, and connections."

### Phase 3: UnifiedScanForm Component

**File: `src/components/scan/UnifiedScanForm.tsx` (NEW)**

Merge the best of `ScanForm.tsx` with tier-aware enhancements:

1. **Header**: "Start Your Digital Footprint Scan"

2. **Single Input**:
   - Placeholder: "Username, email, phone number, or full name"
   - Helper text: "Phone format: include country code (+1, +44, etc.)"
   - Uses existing `detectIdentifierType()` from `identifierDetection.ts`

3. **Type Detection Badge**: Colored pill showing detected type (email=green, phone=blue, etc.)

4. **Turnstile Widget**: Existing component, shown when required

5. **Primary CTA**: "Run scan" button

6. **Trust Line**: "We only use public sources. Queries are discarded after processing."

7. **ProOptionsPanel**: Shown only when input is non-empty
   - Progressive disclosure: appears after user types something
   - Options filtered by `detectedType`
   - Locked state for Free tier

8. **Submit Logic**:
   ```typescript
   const handleSubmit = () => {
     // Derive scanMode
     let scanMode: ScanMode;
     let finalEnhancers = selectedEnhancers;
     
     if (isFree) {
       // HARD GUARDRAIL: Strip any Pro enhancers for Free users
       if (finalEnhancers.length > 0) {
         toast.info("Pro-only options removed. Upgrade to enable.");
         finalEnhancers = [];
       }
       scanMode = detectedType === "username" ? "free_fast" : "standard";
     } else {
       // Pro user
       scanMode = finalEnhancers.length > 0 ? "pro_deep" : "standard";
     }
     
     const config: UnifiedScanConfig = {
       query: identifier.trim(),
       detectedType,
       scanMode,
       enhancers: finalEnhancers,
       turnstile_token: turnstileToken,
     };
     
     onSubmit(config);
   };
   ```

### Phase 4: Update ScanPage

**File: `src/pages/ScanPage.tsx` (MODIFY)**

Changes:
1. Import `UnifiedScanForm` instead of `ScanForm`
2. Update `handleFormSubmit` to accept `UnifiedScanConfig`
3. Convert config to `ScanFormData` for `ScanProgress`:
   ```typescript
   const handleFormSubmit = (config: UnifiedScanConfig) => {
     // Existing quota check...
     
     // Convert to ScanFormData
     const scanData: ScanFormData = {
       turnstile_token: config.turnstile_token,
     };
     
     switch (config.detectedType) {
       case "email":
         scanData.email = config.query;
         break;
       case "phone":
         scanData.phone = config.query;
         break;
       case "name":
         const parts = config.query.split(/\s+/);
         scanData.firstName = parts[0];
         scanData.lastName = parts.slice(1).join(" ");
         break;
       case "username":
       default:
         scanData.username = config.query;
         break;
     }
     
     // Store scanMode and enhancers for ScanProgress
     setScanData({ ...scanData, scanMode: config.scanMode, enhancers: config.enhancers });
     setCurrentStep("scanning");
   };
   ```

### Phase 5: Update ScanProgress

**File: `src/components/ScanProgress.tsx` (MODIFY)**

Changes:
1. Extend `ScanFormData` interface to include optional `scanMode` and `enhancers`
2. Pass these to `n8n-scan-trigger` in the request body:
   ```typescript
   const requestBody = {
     ...existing,
     scanMode: scanData.scanMode || "standard",
     enhancers: scanData.enhancers || [],
   };
   ```

### Phase 6: Backend Enhancement (Optional - Future)

**File: `supabase/functions/n8n-scan-trigger/index.ts` (MODIFY)**

Add logging for transparency:
```typescript
const { scanMode = "standard", enhancers = [] } = body;

console.log(`[n8n-scan-trigger] scanMode: ${scanMode}, enhancers: ${enhancers.join(",")}`);

// Include in n8nPayload
const n8nPayload = {
  ...existing,
  scanMode,
  enhancers,
};
```

The n8n workflow can use these to conditionally enable/disable providers.

### Phase 7: Routing Redirect

**File: `src/App.tsx` (MODIFY)**

Add redirect from `/advanced` to `/scan`:
```typescript
<Route path="/advanced" element={<Navigate to="/scan" replace />} />
```

### Phase 8: Deprecate AdvancedScan

**File: `src/pages/AdvancedScan.tsx` (MODIFY - add deprecation notice)**

Add comment at top:
```typescript
/**
 * @deprecated This page is deprecated. All scan functionality has been
 * consolidated into /scan (UnifiedScanForm). This file is kept for reference
 * and will be removed in a future release.
 */
```

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/scan/unifiedScanTypes.ts` | **CREATE** | Type definitions and enhancer configs |
| `src/components/scan/ProOptionsPanel.tsx` | **CREATE** | Tier-gated enhancement options panel |
| `src/components/scan/UnifiedScanForm.tsx` | **CREATE** | Main unified form component (~300 lines) |
| `src/pages/ScanPage.tsx` | **MODIFY** | Switch to UnifiedScanForm |
| `src/components/ScanProgress.tsx` | **MODIFY** | Pass scanMode + enhancers |
| `src/App.tsx` | **MODIFY** | Add /advanced redirect |
| `src/pages/AdvancedScan.tsx` | **MODIFY** | Add deprecation comment |

## Safety Guardrails

1. **No wasted scans for Free users**:
   - Pro enhancers are visually disabled (cannot be toggled)
   - Even if UI state is stale, submit handler strips enhancers with toast
   - Backend already blocks restricted scans (phone for Free)

2. **No accidental form submits**:
   - Clicking locked option row triggers upgrade modal, NOT form submit
   - Button explicitly separated from option clicks

3. **Deterministic routing**:
   - `scanMode` is derived from tier + enhancers, sent to backend
   - Backend logs `scanMode` and `enhancers` for debugging

## UX Copy

| Element | Copy |
|---------|------|
| Title | "Start Your Digital Footprint Scan" |
| Input placeholder | "Username, email, phone number, or full name" |
| Phone hint | "Phone format: include country code (+1, +44, etc.)" |
| CTA button | "Run scan" |
| Enhancers header | "Enhance this scan" |
| Locked badge | "Pro" |
| Free footer | "Upgrade to Pro to unlock deeper sources, confidence signals, and connections." |
| Trust line | "We only use public sources. Queries are discarded after processing." |
| Toast (stripped enhancers) | "Pro-only options removed. Upgrade to enable." |

## Acceptance Criteria Checklist

- [ ] Single `/scan` entry point for all users
- [ ] Free user can complete username scan without losing allowance from locked options
- [ ] Free users see locked Pro enhancements with 🔒 icon
- [ ] Clicking locked option opens upgrade modal (not toggle)
- [ ] Pro users can enable enhancements and submit
- [ ] Requests include `scanMode` and `enhancers`
- [ ] `/advanced` redirects to `/scan`
- [ ] ScanProgress shows progress updates normally
- [ ] Phone scans blocked for Free tier with upgrade prompt

## Testing Plan

1. **Free user - username scan**: Should work with quick workflow
2. **Free user - click locked option**: Upgrade modal appears, option stays unchecked
3. **Free user - email scan**: Should work with Holehe provider
4. **Free user - phone scan**: Should show upgrade prompt (blocked by backend)
5. **Pro user - username with enhancers**: Full multi-tool scan
6. **Pro user - email with enhancers**: Full email intel scan
7. **Visit /advanced**: Redirects to /scan
