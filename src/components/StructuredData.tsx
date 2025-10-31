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

interface StructuredDataProps {
  organization?: OrganizationSchema;
  breadcrumbs?: BreadcrumbListSchema;
  faq?: FAQPageSchema;
  custom?: any;
}

export const StructuredData = ({ organization, breadcrumbs, faq, custom }: StructuredDataProps) => {
  return (
    <>
      {organization && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
      )}
      {breadcrumbs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
        />
      )}
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      )}
      {custom && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(custom) }}
        />
      )}
    </>
  );
};

// Reusable organization schema
export const organizationSchema: OrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FootprintIQ",
  url: "https://footprintiq.app",
  logo: "https://footprintiq.app/logo-social.png",
  description: "Enterprise OSINT platform for digital footprint analysis and threat intelligence",
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