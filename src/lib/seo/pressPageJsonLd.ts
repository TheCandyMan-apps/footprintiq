/**
 * JSON-LD structured data for the FootprintIQ Press page.
 * Establishes FootprintIQ as a legitimate research publisher for journalists and search engines.
 * 
 * Schema types: Organization, WebPage, ContactPoint
 */

import { PLATFORM_TAGLINE, PLATFORM_SCHEMA_DESCRIPTION } from "@/lib/platformDescription";

export function buildPressPageJsonLd(origin: string) {
  const pressUrl = `${origin}/press`;
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      // Organization: FootprintIQ as research publisher
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        "name": "FootprintIQ",
        "legalName": "FootprintIQ",
        "url": origin,
        "logo": {
          "@type": "ImageObject",
          "url": `${origin}/og-image.png`,
          "width": 1200,
          "height": 630
        },
        "slogan": PLATFORM_TAGLINE,
        "description": PLATFORM_SCHEMA_DESCRIPTION,
        "foundingDate": "2024",
        "knowsAbout": [
          "Open Source Intelligence (OSINT)",
          "Digital Footprint Analysis",
          "Username Correlation Research",
          "Data Broker Exposure Assessment",
          "Ethical Intelligence Methodologies",
          "Privacy Research"
        ],
        "sameAs": [
          `${origin}/about`,
          `${origin}/research/username-reuse-report-2026`,
          `${origin}/ethical-osint-for-individuals`
        ],
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "contactType": "Press Inquiries",
            "email": "press@footprintiq.com",
            "availableLanguage": ["English"],
            "areaServed": "Worldwide"
          },
          {
            "@type": "ContactPoint",
            "contactType": "Research Collaboration",
            "email": "research@footprintiq.com",
            "availableLanguage": ["English"]
          }
        ],
        "publishingPrinciples": `${origin}/ethical-osint-for-individuals`,
        "ethicsPolicy": `${origin}/ethical-osint-for-individuals`,
        "correctionsPolicy": `${origin}/press`,
        "actionableFeedbackPolicy": `${origin}/press`
      },
      
      // WebPage: Press & Media page
      {
        "@type": "WebPage",
        "@id": pressUrl,
        "url": pressUrl,
        "name": "Press & Media | FootprintIQ",
        "description": "Press resources, citation guidelines, and media contact information for FootprintIQ research on digital footprints and ethical OSINT methodologies.",
        "inLanguage": "en",
        "isPartOf": {
          "@type": "WebSite",
          "name": "FootprintIQ",
          "url": origin
        },
        "about": {
          "@id": `${origin}/#organization`
        },
        "mainEntity": {
          "@id": `${origin}/#organization`
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
              "name": "Press & Media",
              "item": pressUrl
            }
          ]
        },
        "relatedLink": [
          `${origin}/research/username-reuse-report-2026`,
          `${origin}/research/fact-sheet`,
          `${origin}/ethical-osint-for-individuals`
        ],
        "significantLink": [
          `${origin}/research/username-reuse-report-2026`,
          `${origin}/research/fact-sheet`
        ],
        "specialty": "Digital Footprint Research and Ethical OSINT"
      },
      
      // MediaGallery: Press assets
      {
        "@type": "MediaGallery",
        "@id": `${pressUrl}#assets`,
        "name": "FootprintIQ Press Assets",
        "description": "Official logos, brand guidelines, and downloadable research materials for media use.",
        "url": pressUrl,
        "isPartOf": {
          "@id": pressUrl
        },
        "publisher": {
          "@id": `${origin}/#organization`
        }
      },
      
      // CollectionPage: Research publications
      {
        "@type": "CollectionPage",
        "@id": `${pressUrl}#publications`,
        "name": "FootprintIQ Research Publications",
        "description": "Collection of original research reports and fact sheets on digital footprints, username reuse, and ethical OSINT methodologies.",
        "url": pressUrl,
        "isPartOf": {
          "@id": pressUrl
        },
        "publisher": {
          "@id": `${origin}/#organization`
        },
        "hasPart": [
          {
            "@type": "Report",
            "name": "Username Reuse & Digital Exposure Report (2026)",
            "url": `${origin}/research/username-reuse-report-2026`
          },
          {
            "@type": "Report",
            "name": "Research Fact Sheet",
            "url": `${origin}/research/fact-sheet`
          }
        ]
      }
    ]
  };
}
