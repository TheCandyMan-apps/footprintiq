# Unified Finding Model (UFM) - Technical Documentation

## Overview

The Unified Finding Model (UFM) standardizes security and privacy findings from diverse OSINT data providers into a single, consistent schema. This enables cross-provider correlation, severity normalization, and unified reporting across all scan types.

## Architecture

```
┌─────────────────┐
│  Provider APIs  │ (HIBP, Shodan, VirusTotal, BuiltWith, etc.)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Normalizers   │ (src/lib/normalize/*.ts)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  UFM Findings   │ (src/lib/ufm.ts)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Orchestrator   │ (src/lib/orchestrate.ts)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   UI Layer      │ (FindingCard, ScanSummary, etc.)
└─────────────────┘
```

## UFM Finding Schema

```typescript
interface Finding {
  id: string;                    // Unique identifier: "provider_type_unique"
  type: FindingType;             // breach, identity, domain_reputation, etc.
  title: string;                 // Human-readable title
  description: string;           // Detailed description of the finding
  severity: Severity;            // critical, high, medium, low, info
  confidence: number;            // 0.0 to 1.0
  provider: string;              // "hibp", "shodan", "virustotal", etc.
  providerCategory: string;      // "breach", "infrastructure", "threat_intel"
  evidence: Evidence[];          // Key-value pairs with metadata
  impact: string;                // Real-world impact description
  remediation: string[];         // Step-by-step remediation actions
  tags: string[];                // Searchable tags
  relatedTo?: string[];          // IDs of related findings
  observedAt: string;            // ISO 8601 timestamp
  expiresAt?: string;            // Optional expiration
  url?: string;                  // Provider reference URL
  raw?: any;                     // Original provider response
}
```

## Severity Levels

| Severity | Description | Use Cases |
|----------|-------------|-----------|
| `critical` | Immediate action required | Active breach, exposed credentials, critical vulns |
| `high` | Significant risk | Data broker presence, open sensitive ports |
| `medium` | Moderate concern | Outdated software, weak configs |
| `low` | Minor issue | Info disclosure, old DNS records |
| `info` | Informational | Tech stack detection, historical data |

## Provider Normalizers

Each provider has a dedicated normalizer in `src/lib/normalize/[provider].ts`:

### Example: HIBP Normalizer

```typescript
// src/lib/normalize/hibp.ts
import { Finding, generateFindingId } from "@/lib/ufm";

export function normalizeHibp(data: any, email: string): Finding[] {
  return data.map((breach: any) => ({
    id: generateFindingId("hibp", "breach", breach.Name),
    type: "breach",
    title: `Data breach: ${breach.Name}`,
    description: breach.Description,
    severity: breach.IsSensitive ? "critical" : "high",
    confidence: 1.0,
    provider: "hibp",
    providerCategory: "breach",
    evidence: [
      { key: "email", value: email },
      { key: "breach_date", value: breach.BreachDate },
      { key: "compromised_data", value: breach.DataClasses }
    ],
    impact: `Your email was exposed in the ${breach.Name} breach.`,
    remediation: [
      "Change passwords for affected accounts",
      "Enable 2FA where possible",
      "Monitor for suspicious activity"
    ],
    tags: ["breach", "email", ...breach.DataClasses],
    observedAt: new Date().toISOString(),
    url: `https://haveibeenpwned.com/breach/${breach.Name}`
  }));
}
```

### Existing Normalizers

- **HIBP** (`hibp.ts`): Email breach detection
- **Shodan** (`shodan.ts`): IP/port exposure, device fingerprinting
- **VirusTotal** (`virustotal.ts`): Domain/file reputation
- **BuiltWith** (`builtwith.ts`): Tech stack detection
- **PDL** (`pdl.ts`): Identity enrichment
- **IPQS** (`ipqs.ts`): Phone/IP fraud scores
- **SecurityTrails** (planned): DNS history

## Orchestration Layer

The orchestrator (`src/lib/orchestrate.ts`) performs:

1. **Normalization**: Calls all provider normalizers
2. **Deduplication**: Removes duplicate findings by ID
3. **Sorting**: Orders by severity → confidence
4. **Correlation**: Links related findings across providers
5. **Scoring**: Calculates overall risk score

```typescript
// src/lib/orchestrate.ts
export function orchestrateScan(input: ScanInput, results: ProviderResults): OrchestratedResults {
  const findings: Finding[] = [
    ...normalizeHibp(results.hibp, input.email),
    ...normalizeShodan(results.shodan, input.ip),
    ...normalizeVirusTotal(results.virustotal, input.domain),
    // ... other providers
  ];

  const dedupedFindings = deduplicateFindings(findings);
  const sortedFindings = sortFindings(dedupedFindings);
  const correlations = correlateFindings(sortedFindings);

  return {
    findings: sortedFindings,
    summary: calculateSummary(sortedFindings),
    correlations
  };
}
```

## Adding a New Provider

1. **Create Normalizer**: Add `src/lib/normalize/[provider].ts`
   ```typescript
   export function normalizeMyProvider(data: any, input: string): Finding[] {
     // Transform provider data into UFM findings
   }
   ```

2. **Update Orchestrator**: Import and call in `orchestrateScan()`
   ```typescript
   import { normalizeMyProvider } from "./normalize/myprovider";
   // ...
   ...normalizeMyProvider(results.myprovider, input.domain)
   ```

3. **Add to Types**: Update `ProviderResults` interface
   ```typescript
   interface ProviderResults {
     // ... existing
     myprovider?: any;
   }
   ```

## UI Components

### FindingCard
Displays individual findings with:
- Severity badge and confidence %
- Evidence list (copyable)
- Remediation checklist
- Provider attribution
- Timestamp

### ScanSummary
Shows aggregate view:
- Overall risk score (0-100)
- Severity breakdown chart
- Top 3 priority actions
- Finding counts by type

### ExportControls
Export functionality:
- JSON (raw findings)
- CSV (flattened table)
- PDF (formatted report)
- PII redaction toggle

## PII Redaction

All exports support PII masking (`src/lib/redact.ts`):

```typescript
redactEmail("user@example.com")    // → "u***@e***.com"
redactPhone("+1234567890")         // → "+1******7890"
redactIP("192.168.1.100")          // → "192.168.*.*"
```

## Username Intelligence

The username module (`src/lib/usernameSources.ts`) extends UFM:

```typescript
// Username findings are normalized as:
{
  type: "social_media",
  provider: "username_check",
  evidence: [
    { key: "platform", value: "Instagram" },
    { key: "profile_url", value: "https://..." },
    { key: "status", value: "found" }
  ]
}
```

## Best Practices

1. **Consistent Severity**: Use severity guidelines strictly
2. **Actionable Remediation**: Provide concrete steps, not vague advice
3. **Evidence Preservation**: Include raw data in `evidence` array
4. **Correlation IDs**: Link related findings via `relatedTo`
5. **Expiration Dates**: Set `expiresAt` for time-sensitive findings
6. **Provider Attribution**: Always credit original source

## Performance Considerations

- **Concurrency**: Username checks use 10 concurrent requests
- **Timeouts**: 7s per external API call
- **Caching**: Consider Redis for repeated scans
- **Rate Limiting**: Respect provider limits (30 req/min default)

## Security Notes

- Never log PII in plaintext
- Hash identifiers in logs (use request IDs)
- Validate all external data before normalization
- Sanitize HTML in `description` fields
- Use circuit breakers for flaky providers

---

**For questions or contributions**, see main README.md or contact security@footprintiq.app
