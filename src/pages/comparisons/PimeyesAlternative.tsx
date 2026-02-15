import { ComparisonPageLayout, ComparisonPageData } from "@/components/seo/ComparisonPageLayout";

const data: ComparisonPageData = {
  slug: "comparisons/pimeyes-alternative",
  title: "PimEyes Alternative – Ethical Digital Footprint Intelligence (2026) | FootprintIQ",
  metaDescription:
    "Looking for a PimEyes alternative? FootprintIQ offers ethical digital footprint intelligence using username, email, and breach scanning — without facial recognition or invasive surveillance.",
  h1: "PimEyes Alternative: Ethical Intelligence Without Facial Recognition",
  subtitle:
    "PimEyes uses facial recognition to find photos of people online. FootprintIQ takes a fundamentally different, privacy-first approach — no facial recognition, no biometric data, no surveillance.",
  competitorName: "PimEyes",
  competitorTagline: "Facial recognition search engine",
  footprintiqTagline: "Ethical Digital Footprint Intelligence Platform",
  introText:
    "PimEyes is a facial recognition search engine that allows users to upload a photo and find matching faces across the internet. While powerful, this approach raises significant privacy and ethical concerns — including potential misuse for stalking, harassment, and non-consensual surveillance. FootprintIQ takes the opposite approach: it analyses publicly accessible data through username enumeration, email breach detection, and data broker scanning to help you understand your own digital exposure — without ever using facial recognition, biometric data, or image analysis. If you're looking for a PimEyes alternative that prioritises ethics and privacy, FootprintIQ offers comprehensive digital footprint intelligence without the invasive techniques.",
  whoIsCompetitorFor: [
    "Users who want to find where their photos appear online via facial recognition",
    "Investigators searching for visual matches of a subject across web pages",
    "People verifying if their face has been used in catfishing or impersonation",
    "Researchers studying the spread of specific images across the internet",
  ],
  whoIsFootprintiqFor: [
    "Anyone who wants to understand their full digital exposure — without facial recognition",
    "Privacy-conscious users who want to audit their online presence ethically",
    "People cleaning up after a data breach and need breach + username + data broker scanning",
    "Professionals conducting authorised, ethical OSINT assessments",
    "Users who want actionable remediation guidance, not just raw image matches",
  ],
  comparisonRows: [
    { feature: "Facial recognition", competitor: "yes", footprintiq: "no" },
    { feature: "Biometric data processing", competitor: "yes", footprintiq: "no" },
    { feature: "Username search (500+ platforms)", competitor: "no", footprintiq: "yes" },
    { feature: "Email breach detection", competitor: "no", footprintiq: "yes" },
    { feature: "Data broker exposure scanning", competitor: "no", footprintiq: "yes" },
    { feature: "Dark web signal detection", competitor: "no", footprintiq: "yes" },
    { feature: "AI false-positive filtering (LENS)", competitor: "no", footprintiq: "yes" },
    { feature: "Remediation guidance", competitor: "no", footprintiq: "yes" },
    { feature: "Risk scoring and prioritisation", competitor: "no", footprintiq: "yes" },
    { feature: "Published ethical charter", competitor: "no", footprintiq: "yes" },
    { feature: "Consent-based scanning", competitor: "partial", footprintiq: "yes" },
    { feature: "Free tier available", competitor: "partial", footprintiq: "yes" },
  ],
  whyFootprintiqBetter: [
    "You want comprehensive digital exposure analysis without invasive facial recognition or biometric processing.",
    "You need username, email, breach, and data broker scanning in a single tool — PimEyes only does image matching.",
    "You want actionable remediation guidance with effort estimates and opt-out links, not just a list of image matches.",
    "You value ethical intelligence — FootprintIQ never processes biometric data or enables non-consensual surveillance.",
    "You want AI-powered accuracy — LENS confidence scoring eliminates false positives that raw image matching produces.",
  ],
  whyCompetitorBetter: [
    "You specifically need to find where your face (or someone's face with their consent) appears on the internet.",
    "You're investigating visual identity theft, catfishing, or non-consensual image use and need facial matching.",
    "You need image-based search capabilities that text-based OSINT tools cannot provide.",
    "You're a visual researcher tracking the spread of specific images across the web.",
  ],
  faqs: [
    {
      question: "Why is FootprintIQ a good PimEyes alternative?",
      answer:
        "FootprintIQ provides comprehensive digital footprint intelligence — username search, email breach detection, data broker scanning, and dark web monitoring — without using facial recognition or processing biometric data. If you want to understand your online exposure ethically, FootprintIQ covers more ground than PimEyes while respecting privacy boundaries.",
    },
    {
      question: "Does FootprintIQ use facial recognition?",
      answer:
        "No. FootprintIQ does not use facial recognition, biometric data, or image analysis of any kind. It analyses publicly accessible text-based data — usernames, email addresses, breach databases, and data broker listings — to map your digital exposure.",
    },
    {
      question: "Is PimEyes legal?",
      answer:
        "PimEyes operates in a legal grey area in many jurisdictions. The EU's GDPR restricts biometric data processing, and several countries have introduced facial recognition regulations. PimEyes has faced criticism from privacy regulators. FootprintIQ avoids these concerns entirely by not using facial recognition.",
    },
    {
      question: "Can FootprintIQ find where my photos appear online?",
      answer:
        "FootprintIQ does not perform image-based searches. It finds your public accounts, profiles, and mentions through username enumeration, email breach checks, and data broker scanning. For photo-specific searches, tools like Google Reverse Image Search or TinEye are alternatives that don't use facial recognition.",
    },
    {
      question: "Is FootprintIQ more private than PimEyes?",
      answer:
        "Yes. FootprintIQ processes no biometric data, operates under a published Ethical OSINT Charter, is designed for self-assessment, and never sells or monetises user data. PimEyes processes facial biometric data, which is one of the most sensitive categories of personal information.",
    },
    {
      question: "What does FootprintIQ check that PimEyes doesn't?",
      answer:
        "FootprintIQ covers username exposure across 500+ platforms, email breach history, data broker listings, dark web signal detection, and risk scoring — none of which PimEyes provides. PimEyes only matches facial images, which is a completely different (and more invasive) approach to online exposure analysis.",
    },
  ],
};

export default function PimeyesAlternative() {
  return <ComparisonPageLayout data={data} />;
}
