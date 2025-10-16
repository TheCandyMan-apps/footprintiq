# FootprintIQ — Production Documentation

## Overview
FootprintIQ is a production-grade OSINT digital footprint scanner built with React/Vite, featuring comprehensive username intelligence, breach detection, and privacy protection capabilities.

## Architecture

### Unified Finding Model (UFM)
All OSINT data is normalized into a standardized `Finding` schema defined in `src/lib/ufm.ts`:

```typescript
interface Finding {
  id: string;                    // Unique identifier
  type: FindingType;             // breach | identity | domain_* | ip_exposure | phone_intelligence | social_media
  title: string;                 // Human-readable title
  description: string;           // Detailed description
  severity: Severity;            // critical | high | medium | low | info
  confidence: number;            // 0-1 confidence score
  provider: string;              // Data source name
  providerCategory: string;      // Source category
  evidence: Evidence[];          // Key-value evidence pairs
  impact: string;                // Business impact description
  remediation: string[];         // Step-by-step remediation
  tags: string[];                // Searchable tags
  observedAt: string;            // ISO timestamp
  url?: string;                  // Source URL
  raw?: any;                     // Original provider response
}
```

### Data Normalizers

Each OSINT provider has a dedicated normalizer in `src/lib/normalize/`:

- **hibp.ts** — Have I Been Pwned breach data (confidence: 0.95)
- **shodan.ts** — IP exposure and open ports (confidence: 0.9)
- **virustotal.ts** — Domain reputation (confidence: 0.8)
- **builtwith.ts** — Technology stack detection (confidence: 0.75)
- **pdl.ts** — People Data Labs identity enrichment (confidence: 0.7)
- **ipqs.ts** — Phone intelligence (confidence: 0.75)

**Adding a New Provider:**

1. Create `src/lib/normalize/newprovider.ts`:
```typescript
import { Finding, generateFindingId } from '../ufm';

export interface NewProviderResult {
  // Define provider API response shape
}

export function normalizeNewProvider(
  result: NewProviderResult,
  query: string
): Finding[] {
  return [
    {
      id: generateFindingId('newprovider', 'finding_type', result.id),
      type: 'breach', // or other type
      title: 'Finding Title',
      description: 'Detailed description',
      severity: 'high',
      confidence: 0.85,
      provider: 'NewProvider',
      providerCategory: 'Breach Intelligence',
      evidence: [
        { key: 'Field', value: result.value }
      ],
      impact: 'Security impact description',
      remediation: ['Step 1', 'Step 2'],
      tags: ['tag1', 'tag2'],
      observedAt: new Date().toISOString(),
      url: result.url,
      raw: result,
    }
  ];
}
```

2. Update `src/lib/orchestrate.ts`:
```typescript
import { normalizeNewProvider } from './normalize/newprovider';

export function orchestrateScan(input: ScanInput, results: ProviderResults) {
  const findings: Finding[] = [];
  
  // Add normalization
  if (results.newProvider) {
    findings.push(...normalizeNewProvider(results.newProvider, input.email || ''));
  }
  
  // ... rest of orchestration
}
```

### Username Intelligence Engine

The username scanner (`src/lib/usernameSources.ts`) checks 100+ platforms across:
- **Social Media** — Instagram, X/Twitter, TikTok, LinkedIn, Facebook, etc.
- **Developer Platforms** — GitHub, GitLab, StackOverflow, CodePen, etc.
- **Gaming** — Steam, Twitch, Roblox, Xbox, PlayStation, etc.
- **Forums** — Reddit, Discord, Quora, HackerNews, etc.
- **NSFW** — OnlyFans, Pornhub, FetLife, etc. (optional category filter)
- **Crypto** — CoinMarketCap, Binance, etc.

**Expanding Platform Coverage:**

Add platforms to the `usernameSources` array:
```typescript
{
  name: "NewPlatform",
  url: "https://example.com/{username}",
  category: "social",
  favicon: "https://example.com/favicon.ico",
  checkPattern: "Profile found" // Optional: text to verify account exists
}
```

**Custom Platform Import:**

Users can upload CSV/JSON files with custom platforms:
```csv
name,url,category,favicon
CustomSite,https://customsite.com/user/{username},forums,https://customsite.com/favicon.ico
```

### Demo Mode

Enable demo mode for marketing/testing without API keys:

**URL Parameter:**
```
https://footprintiq.app/scan?demo=true
```

**Programmatic:**
```typescript
import { useDemoMode } from '@/hooks/useDemoMode';

const { isDemoMode, demoFindings, enableDemoMode, disableDemoMode } = useDemoMode();

// demoFindings contains comprehensive mock data
```

Demo data is generated via `generateDemoFindings()` in `src/lib/demo.ts` covering all finding types.

### Privacy & Redaction

**PII Redaction** (`src/lib/redact.ts`):
- Masks emails: `j***@e******.com`
- Masks phones: `***-***-1234`
- Masks IPs: `192.168.***.***`
- Masks names: `John D***`

**Usage:**
```typescript
import { redactFindings } from '@/lib/redact';

const redacted = redactFindings(findings, true); // Enable redaction
```

All exports (JSON/CSV/PDF) respect the "Redact PII" toggle.

### Exports

**JSON Export:**
```typescript
import { exportAsJSON } from '@/lib/exports';
exportAsJSON(findings, redactPII);
// Outputs: footprintiq-scan-{timestamp}.json
```

**CSV Export:**
```typescript
import { exportAsCSV } from '@/lib/exports';
exportAsCSV(findings, redactPII);
// Outputs: footprintiq-scan-{timestamp}.csv
// Format: id, type, title, severity, confidence, provider, evidence_key, evidence_value, ...
```

**PDF Export:**
```typescript
import { exportAsPDF } from '@/lib/exports';
exportAsPDF(findings, redactPII);
// TODO: Implement with jspdf or pdfmake
// Currently shows "Coming soon" alert
```

### Components

**FindingCard** (`src/components/FindingCard.tsx`):
- Severity badge with icon
- Confidence percentage
- Evidence with copy-to-clipboard
- Interactive remediation checklist
- Provider attribution + timestamp
- Tags display

**ScanSummary** (`src/components/ScanSummary.tsx`):
- Risk score (0-100) with progress bar
- Severity breakdown (critical/high/medium/low/info counts)
- Top 3 priority actions based on finding types

**FindingFilters** (`src/components/FindingFilters.tsx`):
- Tabs: Overview | Breaches | Identity | Domain | IP | Phone | Social
- Badge counts per category
- Responsive mobile/desktop layout

**ExportControls** (`src/components/ExportControls.tsx`):
- Redact PII toggle (default: ON)
- JSON/CSV/PDF export buttons
- Analytics tracking on export

### Remediation Playbooks

Inline checklists for common threats:

**Email Breach:**
- ✅ Change password immediately
- ✅ Enable 2FA on all accounts
- ✅ Stop password reuse across sites
- ✅ Monitor for credential stuffing attempts

**Open Ports (23/3389/445/21):**
- ✅ Close unnecessary ports
- ✅ Disable UPnP on router
- ✅ Use VPN for remote access
- ✅ Update firmware and apply patches

**Domain Reputation:**
- ✅ Configure DMARC, SPF, DKIM
- ✅ Remove malicious scripts
- ✅ Enable WAF (Web Application Firewall)
- ✅ Request malware review

**Phone Exposure:**
- ✅ Remove from data broker listings
- ✅ Set carrier account PIN
- ✅ Enable spam call filtering
- ✅ Monitor for SIM swap attempts

### SEO & Metadata

All pages use `react-helmet-async` for dynamic meta tags:

```typescript
import { SEO } from '@/components/SEO';

<SEO
  title="Page Title — FootprintIQ"
  description="150-160 character description with keywords"
  canonical="https://footprintiq.app/page"
  structuredData={{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    // ...
  }}
/>
```

**Structured Data Types:**
- `SoftwareApplication` (homepage)
- `FAQPage` (homepage)
- `BreadcrumbList` (all pages)

**Sitemap:** `public/sitemap.xml` includes all public pages.

**Robots.txt:** `public/robots.txt` allows all crawlers.

### Analytics

Privacy-friendly tracking via Plausible:

```typescript
import { analytics } from '@/lib/analytics';

analytics.scanStarted('email');
analytics.scanSuccess('email', findingsCount);
analytics.scanError('email', 'provider_timeout');
analytics.providerError('shodan');
analytics.trackEvent('export_json', { findings: 10, redacted: 1 });
```

**Respects:**
- Do-Not-Track (DNT) header
- Cookie consent settings
- No tracking until consent granted

### Security & Compliance

**Row-Level Security (RLS):**
- All user data scoped to `auth.uid()`
- Storage buckets use user-scoped folders
- Support tickets isolated by user

**Input Validation:**
- Filename sanitization (path traversal prevention)
- HTML escaping in email templates
- File type/size limits on uploads

**Rate Limiting:**
- 5 requests/hour/IP on public support endpoint
- Circuit breaker: 5 fails → 60s cooldown

**CSP & Headers:**
```
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

**PII Handling:**
- Hash or omit PII in server logs
- Redact PII in UI by default
- Encrypted auth tokens (Supabase)
- Transient scan inputs (not stored)

### Performance Targets

**Core Web Vitals:**
- **LCP** < 2.5s (Largest Contentful Paint)
- **INP** < 200ms (Interaction to Next Paint)
- **CLS** < 0.1 (Cumulative Layout Shift)

**Optimizations:**
- ✅ Defer Plausible analytics script
- ✅ Lazy-load images below fold
- ✅ Explicit width/height on all images
- ✅ Reserved header/nav heights
- ⏳ Self-host WOFF2 fonts (TODO)
- ⏳ Compress OG images ≤400KB WebP (TODO)
- ⏳ Provider fetch: 20s timeout + 1 retry (TODO)

### Testing

**Unit Tests:**
```bash
# Test normalizers
npm run test src/lib/normalize/*.test.ts

# Test orchestrator
npm run test src/lib/orchestrate.test.ts

# Test demo mode
npm run test src/lib/demo.test.ts
```

**Lighthouse Audit:**
```bash
npm run lighthouse
# Target: Performance >90, A11Y >90, SEO 100
```

**Accessibility:**
- Semantic HTML (`<header>`, `<main>`, `<nav>`, `<section>`)
- ARIA labels on interactive elements
- Focus styles on all controls
- `aria-live` for scan status updates
- One `<h1>` per page

### Deployment Checklist

- [ ] Compress OG images to WebP ≤400KB
- [ ] Self-host fonts and preload in `index.html`
- [ ] Enable Plausible analytics
- [ ] Configure CSP headers
- [ ] Test all exports (JSON/CSV)
- [ ] Run Lighthouse audit (LCP <2.5s, CLS <0.1)
- [ ] Verify sitemap.xml accessible
- [ ] Test Demo Mode (`?demo=true`)
- [ ] Verify all trust pages linked in footer
- [ ] Review RLS policies for data isolation
- [ ] Test redact PII toggle on exports
- [ ] Enable rate limiting on public endpoints

## License
Proprietary — FootprintIQ © 2025

## Support
Email: support@footprintiq.app
Documentation: https://docs.footprintiq.app (coming soon)
