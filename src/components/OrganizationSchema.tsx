import { Helmet } from "react-helmet-async";

export const OrganizationSchema = () => {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FootprintIQ",
    "url": "https://footprintiq.app",
    "logo": "https://footprintiq.app/logo-horizontal.png",
    "description": "Advanced OSINT platform for digital footprint scanning and online privacy protection",
    "sameAs": [
      "https://twitter.com/footprintiq",
      "https://github.com/footprintiq"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@footprintiq.app"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
    </Helmet>
  );
};
