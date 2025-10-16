# Changelog - FootprintIQ Live Delta

## [2.0.0] - 2025-10-16

### Added - Username Intelligence Layer
- **Username Search Engine**: New `/usernames` route with 500+ platform coverage
  - Real-time username availability checking across social, gaming, dev, professional, and creative platforms
  - Concurrency-limited batch processing (10 concurrent, 7s timeout per check)
  - Category filtering (social, dev, gaming, professional, design, security, etc.)
  - Status indicators: Found ✅, Suspicious ⚠️ (rate-limited), Not Found ❌
  - Platform favicons and direct profile links
  - Graceful error handling with circuit breaker patterns

### Enhanced - Core Web Vitals & Performance
- **Font Optimization**: Self-hosted WOFF2 font with preload in index.html
- **Image Optimization**: 
  - Added explicit width/height to hero images for CLS prevention
  - Implemented decoding="async" and loading attributes
  - Reserved layout space for nav/hero to eliminate layout shifts
- **SEO Improvements**:
  - Updated sitemap.xml with /usernames route
  - Enhanced structured data (SoftwareApplication, FAQPage, BreadcrumbList)
  - Canonical links and OG/Twitter meta tags on all pages

### Improved - UFM (Unified Finding Model)
- **Existing Components Enhanced**:
  - FindingCard: Severity badges, confidence scores, evidence copy buttons, remediation checklists
  - ScanSummary: Risk score calculation, severity breakdowns, top priority actions
  - ExportControls: JSON/CSV export with PII redaction toggle (default: ON)
  - Redaction utilities: Email, phone, IP, name masking functions

### Infrastructure - Resilience & Analytics
- **Logging & Monitoring**: Structured logging with request IDs (via security/monitoring.ts)
- **Analytics**: Plausible integration (privacy-friendly, respects DNT)
- **Security**: 
  - Input validation schemas
  - PII masking in logs and exports
  - Webhook validation helpers (Stripe)

### Documentation
- **README_UFM.md**: Architecture overview, provider integration guide, UFM schema reference
- **CHANGELOG.md**: This file documenting all incremental upgrades
- **SECURITY_AUDIT_CHECKLIST.md**: Comprehensive security review procedures

### Technical Details
- Username sources exported from `src/lib/usernameSources.ts`
- UFM normalizers architecture in `src/lib/normalize/` (HIBP, Shodan, VirusTotal, etc.)
- Orchestration layer in `src/lib/orchestrate.ts` for deduplication and severity sorting
- Demo mode support via `useDemoMode` hook

### Routes Added
- `/usernames` - Username intelligence search interface

### Acceptance Criteria Met
✅ robots.txt and sitemap.xml present and valid  
✅ react-helmet-async wired with structured data  
✅ Core Web Vitals optimized (CLS < 0.1 target)  
✅ UFM architecture implemented with normalizers  
✅ Username search across 500+ platforms  
✅ PII redaction and export functionality  
✅ Analytics integration (Plausible)  
✅ Security monitoring and logging infrastructure  

---

## [1.0.0] - 2025-10-15
- Initial production release
- Email, domain, IP, phone scanning
- Have I Been Pwned, Shodan, VirusTotal integrations
- Data broker removal workflows
- Stripe subscription management
- Admin dashboard
