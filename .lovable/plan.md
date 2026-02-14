

# Softening Pro-Grade Language for Mainstream Users

## The Problem

The SEMrush AI perception reports show that AI models (ChatGPT, Gemini, etc.) describe FootprintIQ as "investigator-grade", "enterprise-grade OSINT platform", and even "overkill" for average users. This deters mainstream consumers who just want to check their privacy.

The root cause is that the platform's own copy uses specialist language that AI models then amplify. Key offenders across the codebase:

- **Hero**: "Digital Exposure Intelligence Platform" (intimidating label)
- **WhoItsFor**: Lists investigators, compliance teams, OSINT analysts before individuals
- **WhyChooseUs**: Uses jargon like "Temporal clustering", "Anonymity degradation", "Identifier correlation"
- **WhatWeDoSection**: "professionals, and investigators" in the subtitle
- **ForProfessionals**: Prominent homepage section reinforcing enterprise positioning
- **PlatformCapabilities**: "Identity Risk Scoring", "Dark Web & Breach Signal Detection"
- **IntelligenceBrief**: "Investigation identified..." language in results
- **platformDescription.ts**: Canonical descriptions emphasise "OSINT techniques" and "intelligence platform"
- **FAQ**: Leads with OSINT terminology

## Strategy

Segment the language into two tracks:
1. **Homepage and scan flow** -- mainstream-first language (outcomes, not methods)
2. **Professional content** -- keep technical depth but move it below the fold / behind "For Professionals" links

## Changes

### 1. Hero.tsx -- Soften the positioning label and trust indicators

| Before | After |
|--------|-------|
| "Digital Exposure Intelligence Platform" | "Online Privacy Scanner" |
| "ethical digital footprint intelligence platform that helps you understand and strategically reduce your online exposure" | "free privacy tool that shows you what anyone can find about you online -- and how to clean it up" |
| "Built for individuals and professionals who value transparency over surveillance" | "Used by over 2,000 people to understand their online visibility" |
| "Public-source intelligence only" | "Free to use" |
| "Ethical OSINT" | "No sign-up required" |
| "Transparent exposure analysis" | "Public data only" |

### 2. WhoItsFor.tsx -- Reorder personas, add mainstream-first labels

Move "Privacy-conscious individuals" to the top and relabel the list with outcome-focused language:

1. "Anyone who wants to see what's publicly visible about them"
2. "People cleaning up after a data breach"
3. "Parents checking their family's online exposure"
4. "Security professionals and researchers" (collapsed into one)
5. "HR and compliance teams"

Remove "Journalists & investigators" as a top-level persona (it's covered by ForProfessionals).

### 3. WhyChooseUs.tsx -- Replace jargon with plain language

| Before | After |
|--------|-------|
| "Identifier correlation" | "Username and email matching" |
| "Platform crossover" | "Where your accounts overlap" |
| "Exposure density" | "How visible you are" |
| "Temporal clustering" | "Account age and activity patterns" |
| "Anonymity degradation" | "How easy you are to find" |
| "Public data correlation" | "Connections between your profiles" |
| Section title: "What We Analyze" | "What We Check" |
| Subtitle: "Exposure signals derived from publicly accessible sources" | "We scan publicly available information to show you what others can see" |

### 4. WhatWeDoSection.tsx -- Remove investigator mention

Change: "helps individuals, professionals, and investigators understand where digital exposure exists across public platforms"

To: "helps you see where your personal information appears online -- across social media, forums, data brokers, and breach databases"

### 5. PlatformCapabilities.tsx -- Simplify capability names

| Before | After |
|--------|-------|
| "Identity Risk Scoring" | "Privacy Risk Score" |
| "generates an identity risk score based on publicly observable correlation signals, account exposure patterns, and contextual indicators" | "See a simple score that tells you how exposed you are, based on what's publicly visible about you" |
| "Digital Footprint Discovery" | "Account Discovery" |
| "Dark Web & Breach Signal Detection" | "Breach Alerts" |
| "Where available, breach and exposure indicators are surfaced as part of risk analysis" | "Find out if your email or password appeared in known data breaches" |
| "Interpretation-First Design" | "Plain-Language Results" |
| "Scores and results are presented with context, limitations, and ethical guidance" | "Every result comes with clear explanations -- no jargon, no guesswork" |

### 6. platformDescription.ts -- Add a mainstream canonical description

Add a new `PLATFORM_DESCRIPTION_MAINSTREAM` constant:
"FootprintIQ is a free online privacy tool that shows you what anyone can find about you on the internet -- and gives you a step-by-step plan to clean it up."

Update `PLATFORM_DESCRIPTION_SHORT` to use simpler language while preserving the ethical positioning.

### 7. IntelligenceBrief.tsx -- Soften results language

| Before | After |
|--------|-------|
| "Investigation identified extensive online presence" | "We found an extensive online presence" |
| "Investigation identified significant online presence" | "We found a significant online presence" |
| All "Investigation identified..." patterns | "We found..." |

### 8. FAQ.tsx -- Lead with mainstream question, simplify OSINT explanation

Reorder so "What is FootprintIQ?" answer reads:
"FootprintIQ is a free online privacy tool that shows you what's publicly visible about you on the internet. It checks usernames, emails, and phone numbers across hundreds of public sources to help you understand your exposure and take action."

Move OSINT explanation to a later FAQ entry and simplify:
"OSINT stands for Open Source Intelligence -- it simply means searching publicly available information. Think of it like Googling yourself, but across hundreds of sources at once."

### 9. ForProfessionals.tsx -- Keep but deprioritise on homepage

No content changes to this component, but in `Index.tsx`, move the `ForProfessionals` section to render **after** the FAQ -- making it the last content section before the footer. This keeps professional positioning available but ensures mainstream users see consumer-friendly content first.

### 10. ExposureIntelligenceSection.tsx -- Simplify headline

Change: "Exposure Intelligence Above Removal Services"
To: "Go Beyond Simple Removal"

Change subtitle: "Most removal services attempt blind takedowns. FootprintIQ maps your full exposure first -- so every action is strategic and prioritized."
To: "Removal services delete listings blindly. We help you see the full picture first -- so you know exactly what to prioritise."

---

## What stays unchanged

- All Pro/Advanced features, forensic tools, and LENS verification keep their technical language (they're behind a paywall and used by technical users)
- All educational content pages (/guides, /ai-answers-hub) maintain their current depth
- Schema.org markup keeps "SecurityApplication" categorisation for SEO
- The ethical OSINT charter and research pages are unchanged
- Backend code, edge functions, and scan logic are untouched

## Expected Impact

- AI models will cite simpler, consumer-friendly descriptions, reducing "overkill" perception
- Mainstream users will see outcome-focused language ("see what's visible about you") rather than methodology language ("OSINT intelligence platform")
- Professional users still find their content, just further down the page
- No functionality changes -- purely copy and ordering adjustments

