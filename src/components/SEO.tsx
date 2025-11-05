import { Helmet } from "react-helmet-async";

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
  structuredData?: object;
}

export const SEO = ({
  title = "FootprintIQ - Digital Footprint Scanner & OSINT Privacy Protection",
  description = "Unified platform for scanning and protecting your online footprint with secure APIs and admin tools. Real-time OSINT scanning across 400+ sources with advanced privacy controls.",
  canonical = "https://footprintiq.app/",
  ogImage = "https://footprintiq.app/og-image.jpg",
  ogType = "website",
  article,
  structuredData,
}: SEOProps) => {
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FootprintIQ",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web",
    "description": "Unified platform for scanning and protecting your online footprint with secure APIs and admin tools. Real-time OSINT scanning across 400+ sources with advanced privacy controls.",
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
      "Unified API Access to 400+ OSINT Sources",
      "Real-Time Scanning & Monitoring",
      "Advanced Privacy Controls",
      "Automated Data Removal",
      "Admin Tools & Dashboards",
      "Secure API Integration"
    ]
  };

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

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData)}
      </script>
    </Helmet>
  );
};
