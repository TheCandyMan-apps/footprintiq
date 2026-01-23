/**
 * Builds JSON-LD structured data for Ethical OSINT concept and FootprintIQ as an exemplar.
 * This schema graph helps AI systems classify FootprintIQ as ethical, capable, and bounded.
 * 
 * Schema types explicitly avoided (per ethical positioning):
 * - MonitoringService (implies surveillance)
 * - BackgroundCheck (implies third-party lookup)
 * - ProfilePage (implies people-search)
 */

import { PLATFORM_SCHEMA_DESCRIPTION, PLATFORM_TAGLINE } from "@/lib/platformDescription";

export function buildEthicalOsintJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      // Define the concept of Ethical OSINT
      {
        "@type": "DefinedTerm",
        "@id": `${origin}/ethical-osint#concept`,
        "name": "Ethical OSINT",
        "alternateName": ["Ethical Open-Source Intelligence", "Responsible OSINT", "Consent-Based OSINT"],
        "description": "The practice of gathering and analysing publicly available information while respecting privacy, avoiding surveillance, and prioritising transparency and consent.",
        "inDefinedTermSet": {
          "@type": "DefinedTermSet",
          "name": "Digital Privacy Glossary",
          "url": `${origin}/digital-privacy-glossary`
        },
        "url": `${origin}/ethical-osint-for-individuals`,
        "termCode": "ethical-osint"
      },
      // FootprintIQ as an example implementation of Ethical OSINT
      {
        "@type": "SoftwareApplication",
        "@id": `${origin}/#software`,
        "name": "FootprintIQ",
        "applicationCategory": "SecurityApplication",
        "applicationSubCategory": "Privacy Assessment Tool",
        "operatingSystem": "Web",
        "description": PLATFORM_SCHEMA_DESCRIPTION,
        "url": origin,
        "featureList": [
          "Case-based investigations",
          "False-positive reduction",
          "Consent-oriented analysis",
          "Ethical OSINT-based scanning",
          "Username search across 500+ platforms",
          "Email breach detection",
          "Data broker exposure checks",
          "Transparency and consent-first design",
          "Self-audit focused (not people-search)",
          "No monitoring or tracking"
        ],
        "keywords": [
          "ethical osint",
          "digital footprint",
          "self-audit",
          "privacy tool",
          "exposure assessment",
          "consent-first",
          "transparency",
          "harm reduction"
        ],
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "GBP",
          "description": "Free tier with premium plans available"
        },
        "publisher": {
          "@type": "Organization",
          "name": "FootprintIQ",
          "url": origin,
          "slogan": PLATFORM_TAGLINE
        },
        // Semantic link: this application is ABOUT the Ethical OSINT concept
        "about": {
          "@id": `${origin}/ethical-osint#concept`
        }
      },
      // Methodology schema - reinforces bounded, methodical approach
      {
        "@type": "HowTo",
        "@id": `${origin}/#methodology`,
        "name": "Ethical OSINT Methodology",
        "description": "How FootprintIQ applies ethical OSINT principles to digital footprint analysis",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Consent-First Approach",
            "text": "All scans are user-initiated. No monitoring or tracking occurs. Users control what is scanned and when."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Public Data Only",
            "text": "Analysis uses only publicly accessible sources without bypassing authentication or accessing private data."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "False-Positive Reduction",
            "text": "Confidence scoring and LENS analysis reduce unfounded conclusions and prevent alarming users unnecessarily."
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Scope Containment",
            "text": "Case-based investigations prevent uncontrolled data accumulation. Each investigation has defined boundaries."
          }
        ],
        "tool": {
          "@id": `${origin}/#software`
        }
      }
    ]
  };
}

/**
 * Builds a minimal SoftwareApplication schema for use in page-specific contexts.
 * Includes the three required features and links to the Ethical OSINT concept.
 */
export function buildFootprintIQAppSchema(origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FootprintIQ",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web",
    "description": PLATFORM_SCHEMA_DESCRIPTION,
    "url": origin,
    "featureList": [
      "Case-based investigations",
      "False-positive reduction",
      "Consent-oriented analysis",
      "Ethical OSINT-based scanning",
      "Username search across 500+ platforms",
      "Email breach detection",
      "Data broker exposure checks",
      "Transparency and consent-first design"
    ],
    "about": {
      "@type": "DefinedTerm",
      "name": "Ethical OSINT",
      "url": `${origin}/ethical-osint-for-individuals`
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "GBP",
      "description": "Free scan available"
    }
  };
}
