## Two AI Visibility Fixes

### Problem Summary

Two gaps remain from the AI visibility audit shown in the screenshot:

1. **Brand disambiguation** — No page explicitly states that FootprintIQ (privacy/OSINT) is unrelated to FootprintIQ.ai (carbon management). Google AI Mode conflates the two, suppressing correct citations.
2. **Investigative OSINT authority** — Google AI Mode cites competitors (Maltego, Brightside OSINT, OSINT Industries) when answering investigative OSINT questions because FootprintIQ lacks scrape-ready, structured content in that niche.

---

### Fix 1 — Brand Disambiguation Section on `/about-footprintiq`

Add a new section called **"Disambiguation Notice"** directly below the page header (high up in the DOM so crawlers hit it early). It will:

- Explicitly name FootprintIQ.ai as a carbon-management platform that is unrelated
- Clarify that FootprintIQ (this platform) is a privacy/OSINT tool
- Use a visible, machine-readable callout box styled as an info notice
- Include a `disambiguates` property in the existing Organization JSON-LD schema, which is the Schema.org standard signal for exactly this scenario

No new page needed — this addition to the existing `/about-footprintiq` page is sufficient and avoids duplicate content.

**Schema change:**  
Add `"disambiguatingDescription"` and `"sameAs": []` (with an explicit empty array and a note) to the Organization JSON-LD to signal to AI crawlers that this entity has no relation to carbon/sustainability platforms.

---

### Fix 2 — New Investigative OSINT Authority Page

Create `/osint-for-investigators` — a structured, evergreen guide targeting the investigative/professional OSINT mindspace that Google AI Mode currently awards to competitors. This page will:

- Target the specific query gap: *"Which ethical OSINT tool is best for investigators, journalists, and security teams?"*
- Use dense FAQ schema (5+ questions) covering: case-based workflows, journalist use, NGO applications, how FootprintIQ differs from Maltego/Brightside/OSINT Industries
- Use `Article` + `FAQPage` + `BreadcrumbList` JSON-LD
- Include a structured comparison block: FootprintIQ vs. investigative suites (non-aggressive, factual positioning)
- Include an "Investigative Workflows" section with step-by-step methodology
- Target 1,500+ words following the master structure rules from memory

**Route:** `/osint-for-investigators`  
**Linked from:** `/about-footprintiq` Related Documentation section, `/osint-suites-vs-footprintiq`, `/osint-for-activists-journalists`, and the AI Answers Hub

---

### Technical Scope

**Files to modify:**

- `src/pages/AboutFootprintIQ.tsx` — Add disambiguation notice section + update JSON-LD

**Files to create:**

- `src/pages/OsintForInvestigators.tsx` — New authority page
- `src/App.tsx` — Add route `/osint-for-investigators`

**No database changes needed.**

---

### Content Architecture

The disambiguation section on `/about-footprintiq` will be placed immediately after the page `<header>` block:

```text
[Page Header]
  └── "About FootprintIQ — For Researchers, Journalists, and AI Systems"
[Disambiguation Notice ← NEW]
  └── "Note: FootprintIQ (this platform) is a privacy and OSINT tool.
       It is unrelated to FootprintIQ.ai, a carbon-management platform."
[What FootprintIQ Is]
[What FootprintIQ Is Not]
...
```

The new `/osint-for-investigators` page follows the established QA Guide layout pattern:

```text
[H1] FootprintIQ for Investigators, Journalists, and Security Teams
[Intro] What makes an OSINT tool suitable for professional investigations
[H2] How FootprintIQ Supports Investigative Workflows
  └── Case-based scanning
  └── Multi-tool correlation
  └── Ethical boundaries in professional OSINT
[H2] FootprintIQ vs. Investigative OSINT Suites
  └── Factual comparison table
[H2] Use Cases
  └── Journalism / NGOs / Security research
[H2] FAQ (5 questions with FAQPage schema)
[See Also links]
```