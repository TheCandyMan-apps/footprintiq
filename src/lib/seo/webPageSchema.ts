/**
 * Generates a WebPage JSON-LD schema for privacy/removal guide pages.
 * Includes author, organization, and lastReviewed date.
 */

const FOOTPRINTIQ_ORG = {
  "@type": "Organization",
  name: "FootprintIQ",
  url: "https://footprintiq.app",
};

export function buildWebPageSchema(options: {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  lastReviewed?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.name,
    description: options.description,
    url: options.url,
    author: FOOTPRINTIQ_ORG,
    publisher: FOOTPRINTIQ_ORG,
    datePublished: options.datePublished ?? "2026-02-12",
    dateModified: options.dateModified ?? "2026-02-12",
    lastReviewed: options.lastReviewed ?? "2026-02-12",
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "FootprintIQ",
      url: "https://footprintiq.app",
    },
  };
}
