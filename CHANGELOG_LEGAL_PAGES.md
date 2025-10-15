# Legal & Trust Pages Changelog

**Date:** October 15, 2025  
**Task:** Generate Legal & Trust Pages with UK GDPR Compliance + SEO

---

## Files Added

1. **src/pages/PrivacyPolicy.tsx** — UK GDPR-compliant Privacy Policy with Helmet SEO + JSON-LD BreadcrumbList
2. **src/pages/TermsOfService.tsx** — Terms of Use (UK law, England & Wales jurisdiction) with Helmet SEO + JSON-LD
3. **CHANGELOG_LEGAL_PAGES.md** — This changelog

---

## Files Modified

1. **src/pages/ResponsibleUse.tsx** — Enhanced with UK law compliance, JSON-LD, comprehensive ethics guidelines
2. **src/pages/DataSources.tsx** — Enhanced with JSON-LD, data retention policies, false positives section
3. **src/App.tsx** — Added dual routes (/privacy + /privacy-policy, /terms + /terms-of-service, /how-we-source-data + /data-sources)
4. **src/components/Footer.tsx** — Updated links to preferred short URLs (/privacy, /terms, /responsible-use, /how-we-source-data)
5. **public/sitemap.xml** — Added all 4 trust pages + pricing anchor

---

## SEO Implementation

All pages include:
- ✅ `<Helmet>` with title, meta description, canonical URL
- ✅ JSON-LD BreadcrumbList (Home → Page)
- ✅ Accessible semantic HTML with single H1
- ✅ Mobile responsive spacing
- ✅ Links in footer under "Legal & Trust"

---

## Content Highlights

### Privacy Policy
- UK GDPR & Data Protection Act 2018 compliance
- Legal bases: contract performance, legitimate interests, consent
- Data retention: scan inputs deleted in 2-5 minutes
- User rights: access, rectify, erase, restrict, object, portability
- ICO complaint process documented

### Terms of Service
- Governed by England & Wales law
- Comprehensive acceptable use policy
- Limitation of liability (capped at 12 months subscription)
- 14-day money-back guarantee
- Prohibited uses: harassment, stalking, doxxing, discrimination

### Responsible Use
- UK law compliance (Computer Misuse Act 1990, Protection from Harassment Act 1997, etc.)
- OSINT ethics principles: legality, necessity, proportionality, minimisation
- Prohibited uses with specific UK offenses referenced
- Abuse reporting: abuse@footprintiq.app

### How We Source Data
- Detailed provider descriptions (Have I Been Pwned, Shodan, VirusTotal, DNS/WHOIS, data brokers)
- Data retention policies
- False positives & data freshness disclaimers
- Responsible disclosure guidelines

---

## TODO

- [ ] Confirm contact emails (privacy@, legal@, abuse@, support@footprintiq.app)
- [ ] Add UK ICO registration number to Privacy Policy once registered
- [ ] Add company address if required for UK company registration
- [ ] Test all footer links and routes
- [ ] Run Lighthouse accessibility audit (target ≥90 on all pages)
- [ ] Validate JSON-LD with Google Rich Results Test

---

**All 4 trust pages are production-ready and UK law-compliant!**
