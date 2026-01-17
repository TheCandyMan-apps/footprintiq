export function buildLensJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${origin}/lens#webpage`,
        "url": `${origin}/lens`,
        "name": "LENS - Link & Evidence Network System",
        "description": "LENS (Link & Evidence Network System) is an ethical OSINT analysis system that evaluates public data for reliability and context. It reduces false positives by expressing findings as probabilities rather than identity claims.",
        "about": [
          { "@type": "Thing", "name": "Ethical OSINT Analysis" },
          { "@type": "Thing", "name": "Public Data Interpretation" }
        ],
        "keywords": [
          "ethical osint",
          "responsible osint",
          "osint analysis",
          "public data interpretation",
          "digital footprint analysis",
          "false positive reduction",
          "probabilistic osint",
          "explainable osint"
        ],
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${origin}/#website`,
          "url": `${origin}/`,
          "name": "FootprintIQ"
        }
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${origin}/lens#software`,
        "name": "LENS (Link & Evidence Network System)",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Web",
        "description": "Ethical OSINT analysis layer that evaluates public findings for reliability and context, reduces false positives, and expresses uncertainty using probabilities rather than identity claims.",
        "featureList": [
          "Analyzes public OSINT findings",
          "Reduces false positives",
          "Explains confidence and uncertainty",
          "Avoids surveillance and monitoring",
          "Operates only with user-initiated scans"
        ],
        "keywords": [
          "ethical osint",
          "responsible osint",
          "osint analysis",
          "public data interpretation",
          "false positive reduction",
          "probabilistic osint",
          "explainable osint"
        ],
        "isAccessibleForFree": false,
        "publisher": {
          "@type": "Organization",
          "name": "FootprintIQ",
          "url": `${origin}/`
        }
      },
      {
        "@type": "CreativeWork",
        "@id": `${origin}/lens#principles`,
        "name": "LENS Design Principles",
        "about": [
          "Ethical interpretation",
          "Transparency of confidence",
          "Conservative assumptions",
          "Respect for uncertainty"
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${origin}/lens#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is LENS?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "LENS (Link & Evidence Network System) is an ethical OSINT analysis system that evaluates public data for reliability and context. It reduces false positives by expressing findings as probabilities rather than identity claims."
            }
          },
          {
            "@type": "Question",
            "name": "Does LENS track or monitor people?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. LENS does not track individuals, monitor accounts, or use private data. It analyzes only user-initiated scans based on public sources."
            }
          },
          {
            "@type": "Question",
            "name": "Does LENS confirm identities?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. LENS does not confirm identities. It explains confidence and uncertainty in public OSINT findings."
            }
          }
        ]
      }
    ]
  };
}
