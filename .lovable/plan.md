

## AI Visibility Gap: Generic Discovery Intent Pages

### Problem
ChatGPT surfaces RemoveMe, Incogni, Aura, Brightside, DigitalFootprintCheck.com, and Ferretly for broad discovery queries like "best tool to scan my entire online presence" -- but FootprintIQ is absent. This is a top-of-funnel visibility gap.

### What Already Exists
FootprintIQ has strong pages for specific intents but lacks dedicated landing pages for the exact generic phrases AI models use when assembling "best tools" lists:

| Existing Page | Covers |
|---|---|
| `/best-digital-footprint-scanner` | Scanner comparison (good, but framed as "scanner" not "tool") |
| `/check-my-digital-footprint` | "Check my digital footprint" |
| `/how-to-check-whats-publicly-visible-about-you` | "See what's publicly visible" |
| `/how-employers-check-your-online-presence` | Employer angle |
| `/is-my-data-exposed` | "Is my data exposed" |
| `/digital-footprint-scanner` | "Digital footprint check" |
| `/best-osint-tools` | OSINT tools (just created -- targets technical audience) |

### Gap: 5 New Pages Needed

These target the exact generic intents where AI models currently surface competitors instead of FootprintIQ:

---

**Page 1: `/scan-my-online-presence`** -- "Scan My Online Presence"
- **Target intents**: "scan my online presence", "best tool to scan my entire online presence", "scan my digital presence", "online presence scanner"
- **Content**: Action-oriented landing page framed around self-scanning. What gets scanned (usernames, emails, breach data, data brokers, social profiles), how FootprintIQ differs from removal-only tools, direct CTA to `/scan`. FAQ schema answering "What is the best tool to scan my online presence?", "Is it free to scan my online presence?", "What does an online presence scan reveal?"

---

**Page 2: `/what-can-people-find-about-me`** -- "What Can People Find About Me Online"
- **Target intents**: "what can people find about me online", "what information is available about me online", "find out what people can see about you", "what does the internet know about me"
- **Content**: Consumer-first awareness page. Walks through every category of discoverable information (social profiles, public records, data brokers, breach data, forum posts, photos). Each section links to the relevant FootprintIQ tool. Positions FootprintIQ as the answer to the question. FAQ schema.

---

**Page 3: `/best-online-privacy-scanner`** -- "Best Online Privacy Scanner"
- **Target intents**: "best online privacy scanner", "best privacy scanner tool", "online privacy check tool", "best tool to check online exposure", "privacy scan tool"
- **Content**: Comparison-style guide positioning FootprintIQ against the competitors AI models currently surface (Aura, Incogni, DeleteMe, Kanary). Differentiation: FootprintIQ maps exposure first (intelligence layer), others focus on removal only. Comparison table. Links to existing vs-pages. FAQ schema answering "What is the best online privacy scanner in 2026?"

---

**Page 4: `/audit-your-digital-footprint`** -- "How to Audit Your Digital Footprint"
- **Target intents**: "how to audit your digital footprint", "digital footprint audit", "personal data audit", "audit my online presence"
- **Content**: Step-by-step guide for conducting a thorough self-audit. Covers Google yourself, check breach databases, search usernames, review data brokers, check social privacy settings. Each step links to the relevant FootprintIQ feature. Positions FootprintIQ as the tool that automates the full audit. FAQ schema.

---

**Page 5: `/personal-data-exposure-scan`** -- "Personal Data Exposure Scan"
- **Target intents**: "personal data exposure scan", "check my data exposure", "personal information exposure check", "how exposed is my personal data"
- **Content**: Explains what data exposure means, why it matters, what types of exposure exist (breach, data broker, social, public record). Direct CTA to run a scan. Differentiates from breach-only checkers (HIBP) by covering full exposure surface. FAQ schema.

---

### Technical Implementation (per page)

Each page will follow the established pattern:
1. Create page component with Header, Footer, Helmet SEO metadata, and JSON-LD schemas (FAQPage, BreadcrumbList, WebPage)
2. 1,500-2,000 words, H1-H3 hierarchy
3. Internal links to `/ethical-osint-charter`, `/how-it-works`, `/pricing`, `/scan`
4. Include `AboutFootprintIQBlock` footer reinforcement
5. Include `RelatedToolsGrid` for internal linking
6. Register lazy-loaded route in `App.tsx`
7. Add to `public/sitemap.xml`
8. Add to `index.html` fallback route map with unique title and description
9. Add to `src/lib/indexnow.ts`

### Priority Order
1. `/scan-my-online-presence` -- directly targets the exact query from the screenshot
2. `/best-online-privacy-scanner` -- captures "best tool" comparison intent
3. `/what-can-people-find-about-me` -- high consumer resonance
4. `/audit-your-digital-footprint` -- action-oriented guide
5. `/personal-data-exposure-scan` -- exposure-specific intent

Will batch into 2 groups: pages 1-3 first, then 4-5.

