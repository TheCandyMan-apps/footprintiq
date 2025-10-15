# Unified Finding Model (UFM) Documentation

## Overview

The UFM standardizes OSINT findings from multiple providers into a consistent format for analysis, correlation, and display.

## Architecture

```
Provider APIs → Normalizers → UFM Findings → Orchestrator → UI
```

## Finding Schema

```typescript
{
  id: string;              // Unique: "provider_type_unique"
  type: FindingType;       // breach | identity | domain_reputation | etc.
  title: string;           // User-facing title
  description: string;     // Detailed explanation
  severity: Severity;      // critical | high | medium | low | info
  confidence: number;      // 0.0 - 1.0
  provider: string;        // "Have I Been Pwned"
  providerCategory: string; // "Breach Detection"
  evidence: Evidence[];    // Key-value pairs
  impact: string;          // Business impact
  remediation: string[];   // Action steps
  tags: string[];          // Filterable tags
  relatedTo?: string[];    // Correlated finding IDs
  observedAt: string;      // ISO timestamp
  url?: string;            // Provider link
  raw?: any;               // Original response
}
```

## Default Confidence Scores

- HIBP: 0.95 (verified breaches)
- Shodan: 0.9 (direct observation)
- VirusTotal: 0.8 (aggregated)
- SecurityTrails: 0.8 (DNS records)
- BuiltWith: 0.75 (fingerprinting)
- People Data Labs: 0.7 (enrichment)
- IPQualityScore: 0.75 (reputation)

## Adding a Provider

1. **Create Normalizer** (`src/lib/normalize/[provider].ts`):
```typescript
export interface ProviderResult { /* ... */ }

export function normalizeProvider(result: ProviderResult, query: string): Finding[] {
  return [{
    id: generateFindingId("provider", "type", unique),
    type: "breach",
    title: "...",
    // ... map all required fields
  }];
}
```

2. **Update Orchestrator** (`src/lib/orchestrate.ts`):
```typescript
if (results.newProvider && input.email) {
  findings.push(...normalizeNewProvider(results.newProvider, input.email));
}
```

3. **Add to ProviderResults interface**

## Correlation Rules

- **Breaches ↔ Identity**: Breaches may have exposed enrichment data
- **Domain Reputation ↔ Tech Stack**: Vulnerable technologies contribute to security issues
- **IP Exposure ↔ Domain**: Infrastructure linkage

## Risk Score Calculation

```
Score = 100 - (Σ(severity_weight × confidence) / max_possible_risk × 100)
```

Weights: critical=25, high=15, medium=8, low=3, info=1

Lower scores = higher risk (0 = critical, 100 = perfect)
