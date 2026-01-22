import { Helmet } from "react-helmet-async";
import { 
  PLATFORM_META_DESCRIPTION, 
  PLATFORM_SCHEMA_DESCRIPTION,
  PLATFORM_TAGLINE 
} from "@/lib/platformDescription";

/**
 * Safely serialize JSON for embedding in script tags.
 * Escapes HTML-breaking characters to prevent XSS via JSON injection.
 * Only escapes <, >, and & (NOT double quotes).
 */
const safeJSONStringify = (data: unknown): string => {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
};

// Schema type definitions
interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  contactPoint?: {
    "@type": "ContactPoint";
    email: string;
    contactType: string;
    areaServed: string;
  };
}

interface BreadcrumbListSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

interface FAQPageSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

interface ArticleSchema {
  "@context": "https://schema.org";
  "@type": "Article" | "BlogPosting";
  headline: string;
  description?: string;
  author?: {
    "@type": "Organization" | "Person";
    name: string;
  };
  publisher?: OrganizationSchema | {
    "@type": "Organization";
    name: string;
    logo?: {
      "@type": "ImageObject";
      url: string;
    };
  };
  datePublished?: string;
  dateModified?: string;
  image?: string;
  keywords?: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  // Unified schema prop - all JSON-LD injected via dangerouslySetInnerHTML
  schema?: {
    article?: ArticleSchema;
    breadcrumbs?: BreadcrumbListSchema;
    faq?: FAQPageSchema;
    organization?: OrganizationSchema;
    custom?: Record<string, unknown> | Record<string, unknown>[];
  };
  // Legacy prop - kept for backward compatibility
  structuredData?: object;
}

// Reusable organization schema
export const organizationSchema: OrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FootprintIQ",
  url: "https://footprintiq.app",
  logo: "https://footprintiq.app/logo-social.png",
  description: PLATFORM_SCHEMA_DESCRIPTION,
  sameAs: [
    "https://twitter.com/footprintiq",
    "https://linkedin.com/company/footprintiq",
    "https://github.com/footprintiq"
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@footprintiq.app",
    contactType: "Customer Support",
    areaServed: "Worldwide"
  }
};

export const SEO = ({
  title = "FootprintIQ — Ethical Digital Footprint Intelligence",
  description = PLATFORM_META_DESCRIPTION,
  canonical = "https://footprintiq.app/",
  ogImage = "https://footprintiq.app/og-image.jpg",
  ogType = "website",
  article,
  schema,
  structuredData,
}: SEOProps) => {
  // Default structured data - only used if no schema or structuredData is provided
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FootprintIQ",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web",
    "description": PLATFORM_SCHEMA_DESCRIPTION,
    "url": "https://footprintiq.app",
    "image": "https://footprintiq.app/og-image.jpg",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "description": "Free tier with premium plans available"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127",
      "bestRating": "5"
    },
    "creator": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "url": "https://footprintiq.app"
    },
    "featureList": [
      "Ethical OSINT-based scanning",
      "Username search across 500+ platforms",
      "Email breach detection",
      "Data broker exposure checks",
      "Transparency and consent-first design",
      "False-positive reduction"
    ]
  };

  // Determine if we should show default schema
  const hasExplicitSchema = schema || structuredData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="FootprintIQ Digital Footprint Scanner" />
      <meta property="og:site_name" content="FootprintIQ" />

      {/* Article Meta Tags */}
      {article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.tags && article.tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="FootprintIQ Digital Footprint Scanner" />
      <meta name="twitter:site" content="@FootprintIQ" />

      {/* Schema.org JSON-LD - All injected via dangerouslySetInnerHTML with XSS protection */}
      
      {/* Organization schema */}
      {schema?.organization && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJSONStringify(schema.organization) }}
        />
      )}

      {/* Article schema */}
      {schema?.article && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJSONStringify(schema.article) }}
        />
      )}

      {/* Breadcrumbs schema */}
      {schema?.breadcrumbs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJSONStringify(schema.breadcrumbs) }}
        />
      )}

      {/* FAQ schema */}
      {schema?.faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJSONStringify(schema.faq) }}
        />
      )}

      {/* Custom schema(s) */}
      {schema?.custom && (
        Array.isArray(schema.custom)
          ? schema.custom.map((item, i) => (
              <script
                key={`custom-schema-${i}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeJSONStringify(item) }}
              />
            ))
          : (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeJSONStringify(schema.custom) }}
              />
            )
      )}

      {/* Legacy structuredData prop support */}
      {structuredData && !schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJSONStringify(structuredData) }}
        />
      )}

      {/* Default schema when no explicit schema is provided */}
      {!hasExplicitSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJSONStringify(defaultStructuredData) }}
        />
      )}
    </Helmet>
  );
};
