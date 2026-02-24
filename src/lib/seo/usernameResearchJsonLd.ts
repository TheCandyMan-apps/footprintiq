/**
 * JSON-LD structured data for the Username Reuse & Digital Exposure (2026) research.
 * Designed for search engines and AI systems to recognise this as citable, original research.
 * 
 * Schema types: Report, Dataset, WebPage, Organization
 */

import { PLATFORM_TAGLINE } from "@/lib/platformDescription";

export function buildUsernameResearchJsonLd(origin: string) {
  const reportUrl = `${origin}/research/username-reuse-report-2026`;
  const factSheetUrl = `${origin}/research/fact-sheet`;
  
  const modifiedDate = "2026-02-24";
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      // Person: Robin Clifford as author
      {
        "@type": "Person",
        "@id": `${origin}/#author`,
        "name": "Robin Clifford",
        "jobTitle": "Founder",
        "worksFor": {
          "@id": `${origin}/#organization`
        },
        "url": `${origin}/research/media-kit`
      },
      
      // Organization: FootprintIQ as publisher
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        "name": "FootprintIQ",
        "url": origin,
        "slogan": PLATFORM_TAGLINE,
        "description": "An ethical digital footprint intelligence platform using open-source intelligence (OSINT) techniques.",
        "founder": {
          "@id": `${origin}/#author`
        },
        "sameAs": [
          `${origin}/about`,
          `${origin}/research/media-kit`
        ]
      },
      
      // Report: Primary research document
      {
        "@type": "Report",
        "@id": `${reportUrl}#report`,
        "name": "Username Reuse & Digital Exposure Report (2026)",
        "alternateName": [
          "FootprintIQ Username Reuse Study 2026",
          "Digital Exposure Research 2026"
        ],
        "headline": "Username Reuse & Digital Exposure: Patterns, Risks, and Ethical Analysis",
        "description": "A systematic analysis of username reuse patterns across digital platforms, examining how publicly available data creates exposure risks. The research establishes false positive rates, data staleness metrics, and ethical OSINT methodologies for digital footprint assessment.",
        "abstract": "This report analyses username reuse as a visibility pattern affecting digital exposure. Key findings include a 41% false positive rate in automated username matching, 89% data staleness in aggregated records, and a median of 4.2 linked public profiles per reused username. The research emphasises ethical, consent-based open-source intelligence methodologies.",
        "url": reportUrl,
        "datePublished": "2026-01-01",
        "dateModified": modifiedDate,
        "inLanguage": "en",
        "author": [
          { "@id": `${origin}/#author` },
          { "@id": `${origin}/#organization` }
        ],
        "publisher": {
          "@id": `${origin}/#organization`
        },
        "copyrightHolder": {
          "@id": `${origin}/#organization`
        },
        "copyrightYear": 2026,
        "genre": "Research Report",
        "about": [
          {
            "@type": "DefinedTerm",
            "name": "Username Reuse",
            "description": "The practice of using identical or similar usernames across multiple digital platforms, creating correlation opportunities."
          },
          {
            "@type": "DefinedTerm",
            "name": "Digital Exposure",
            "description": "The extent to which an individual's information is publicly accessible and aggregatable across online platforms."
          },
          {
            "@type": "DefinedTerm",
            "name": "Ethical OSINT",
            "description": "Open-source intelligence gathering that prioritises consent, transparency, accuracy, and harm prevention."
          }
        ],
        "keywords": [
          "username reuse",
          "digital exposure",
          "OSINT research",
          "digital footprint",
          "public data analysis",
          "ethical intelligence",
          "privacy research",
          "false positive analysis",
          "data staleness",
          "platform correlation"
        ],
        "citation": "FootprintIQ. (2026). Username Reuse & Digital Exposure Report. FootprintIQ Research.",
        "isAccessibleForFree": true,
        "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
        "hasPart": {
          "@id": `${reportUrl}#dataset`
        }
      },
      
      // Dataset: Research data and findings
      {
        "@type": "Dataset",
        "@id": `${reportUrl}#dataset`,
        "name": "Username Reuse Analysis Dataset (2026)",
        "description": "Aggregated, anonymised findings from systematic analysis of username patterns across public digital platforms. Data covers false positive rates, profile linkage frequencies, and data age distributions.",
        "url": reportUrl,
        "datePublished": "2026-01-01",
        "dateModified": modifiedDate,
        "creator": {
          "@id": `${origin}/#organization`
        },
        "publisher": {
          "@id": `${origin}/#organization`
        },
        "license": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
        "isAccessibleForFree": true,
        "keywords": [
          "username patterns",
          "false positive rates",
          "digital footprint metrics",
          "OSINT methodology"
        ],
        "measurementTechnique": "Ethical open-source intelligence (OSINT) analysis using publicly accessible data sources only. No authentication bypass, no private data access, no surveillance methodologies.",
        "variableMeasured": [
          {
            "@type": "PropertyValue",
            "name": "False Positive Rate",
            "value": "41%",
            "description": "Percentage of automated username matches that represent false positives or unverified correlations"
          },
          {
            "@type": "PropertyValue",
            "name": "Data Staleness Rate",
            "value": "89%",
            "description": "Percentage of data broker entries referencing outdated information"
          },
          {
            "@type": "PropertyValue",
            "name": "Median Linked Profiles",
            "value": "4.2",
            "description": "Median number of public profiles linked to a single reused username"
          },
          {
            "@type": "PropertyValue",
            "name": "Account Age Threshold",
            "value": "58%",
            "description": "Percentage of username-linked accounts containing profile data five years old or older"
          }
        ],
        "temporalCoverage": "2024/2026",
        "spatialCoverage": {
          "@type": "Place",
          "name": "Global (publicly accessible platforms)"
        },
        "distribution": {
          "@type": "DataDownload",
          "contentUrl": factSheetUrl,
          "encodingFormat": "application/pdf",
          "name": "Research Fact Sheet (PDF)"
        }
      },
      
      // WebPage: The research page itself
      {
        "@type": "WebPage",
        "@id": reportUrl,
        "url": reportUrl,
        "name": "Username Reuse & Digital Exposure Report (2026) | FootprintIQ Research",
        "description": "Original research analysing username reuse patterns and digital exposure risks using ethical OSINT methodologies.",
        "inLanguage": "en",
        "isPartOf": {
          "@type": "WebSite",
          "name": "FootprintIQ",
          "url": origin
        },
        "about": {
          "@id": `${reportUrl}#report`
        },
        "mainEntity": {
          "@id": `${reportUrl}#report`
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": origin
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Research",
              "item": `${origin}/research`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Username Reuse Report 2026",
              "item": reportUrl
            }
          ]
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [".research-abstract", ".key-findings"]
        },
        "relatedLink": [
          `${origin}/ethical-osint-for-individuals`,
          `${origin}/press`,
          factSheetUrl
        ]
      },
      
      // ScholarlyArticle: Alternative typing for academic indexing
      {
        "@type": "ScholarlyArticle",
        "@id": `${reportUrl}#article`,
        "name": "Username Reuse & Digital Exposure: Patterns, Risks, and Ethical Analysis",
        "headline": "Username Reuse & Digital Exposure Report (2026)",
        "abstract": "A systematic analysis of username reuse patterns across digital platforms. Findings indicate 41% false positive rates in automated matching, 89% data staleness in aggregated records, and ethical OSINT principles for consent-based digital footprint assessment.",
        "author": [
          { "@id": `${origin}/#author` },
          { "@id": `${origin}/#organization` }
        ],
        "publisher": {
          "@id": `${origin}/#organization`
        },
        "datePublished": "2026-01-01",
        "dateModified": modifiedDate,
        "url": reportUrl,
        "sameAs": reportUrl,
        "isAccessibleForFree": true,
        "inLanguage": "en",
        "keywords": "username reuse, digital exposure, OSINT, ethical intelligence, privacy research"
      }
    ]
  };
}

/**
 * Builds citation metadata for the research report.
 * Can be used independently for citation widgets.
 */
export function buildResearchCitationMeta() {
  return {
    title: "Username Reuse & Digital Exposure Report (2026)",
    authors: ["FootprintIQ Research"],
    year: 2026,
    publisher: "FootprintIQ",
    url: "/research/username-reuse-report-2026",
    doi: null, // No DOI assigned
    citation: {
      apa: "FootprintIQ. (2026). Username Reuse & Digital Exposure Report. FootprintIQ Research. https://footprintiq.lovable.app/research/username-reuse-report-2026",
      mla: "FootprintIQ. \"Username Reuse & Digital Exposure Report.\" FootprintIQ Research, 2026, footprintiq.lovable.app/research/username-reuse-report-2026.",
      chicago: "FootprintIQ. 2026. \"Username Reuse & Digital Exposure Report.\" FootprintIQ Research. https://footprintiq.lovable.app/research/username-reuse-report-2026."
    }
  };
}
