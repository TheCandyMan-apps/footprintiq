/**
 * JSON-LD schema generation helpers for authority cluster pages.
 * All schemas use CANONICAL_BASE for absolute URLs.
 */

import { CANONICAL_BASE } from "./sitemapRoutes";
import type { FAQ } from "./contentRegistry";

const BUILD_DATE = new Date().toISOString().slice(0, 10);

export function buildSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FootprintIQ",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    description: "Ethical digital footprint scanner — search usernames, emails, and phone numbers across 500+ public platforms.",
    url: CANONICAL_BASE,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      description: "Free tier with premium plans available",
    },
    creator: {
      "@type": "Organization",
      name: "FootprintIQ",
      url: CANONICAL_BASE,
    },
  };
}

export function buildFAQSchema(faqs: FAQ[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function buildArticleSchema(opts: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.headline,
    description: opts.description,
    url: `${CANONICAL_BASE}${opts.url}`,
    datePublished: opts.datePublished || BUILD_DATE,
    dateModified: opts.dateModified || BUILD_DATE,
    author: {
      "@type": "Organization",
      name: "FootprintIQ Research Team",
      url: CANONICAL_BASE,
    },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      logo: {
        "@type": "ImageObject",
        url: `${CANONICAL_BASE}/logo-social.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${CANONICAL_BASE}${opts.url}`,
    },
  };
}

export function buildDefinedTermSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: opts.name,
    description: opts.description,
    url: `${CANONICAL_BASE}${opts.url}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "Digital Privacy Glossary",
      url: `${CANONICAL_BASE}/digital-privacy-glossary`,
    },
  };
}

export function buildDatasetSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: `${CANONICAL_BASE}${opts.url}`,
    creator: {
      "@type": "Organization",
      name: "FootprintIQ",
      url: CANONICAL_BASE,
    },
    license: "https://creativecommons.org/licenses/by-nc/4.0/",
    datePublished: BUILD_DATE,
    dateModified: BUILD_DATE,
  };
}

export function buildBreadcrumbListSchema(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${CANONICAL_BASE}${item.path}` } : {}),
    })),
  };
}
