import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrustSignals } from "@/components/TrustSignals";
import { Link } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";

const DigitalPrivacyGlossary = () => {
  const glossaryTerms = [
    {
      term: "Account Linking",
      definition: "Account linking occurs when multiple online accounts are connected through shared identifiers such as email addresses, usernames, or phone numbers. This connection may be intentional, such as using the same email to sign up for services, or unintentional, discovered through data aggregation. Linked accounts can reveal patterns about a person's online activity across platforms."
    },
    {
      term: "Active Digital Footprint",
      definition: "An active digital footprint consists of data that a person deliberately shares online. This includes social media posts, comments, uploaded photos, forum contributions, and profile information. Unlike passive footprints, active footprints result from conscious choices about what to publish or share publicly."
    },
    {
      term: "Credit Freeze",
      definition: "A credit freeze is a security measure that restricts access to a person's credit report. When a freeze is in place, lenders cannot view the credit file, which helps prevent new accounts from being opened fraudulently. Availability and procedures for credit freezes vary by country and jurisdiction."
    },
    {
      term: "Data Aggregation",
      definition: "Data aggregation is the process of collecting and combining information from multiple sources into a single dataset. In the context of online exposure, aggregation allows small pieces of information from different platforms to be combined, potentially revealing more about a person than any single source would alone."
    },
    {
      term: "Data Breach",
      definition: "A data breach is an incident where protected or confidential information is accessed, disclosed, or stolen without authorization. Breaches can affect organizations of any size and may expose personal data including email addresses, passwords, financial information, or identity documents. The effects of a breach often extend well beyond the initial incident."
    },
    {
      term: "Data Broker",
      definition: "A data broker is a business that collects personal information from various sources and sells or licenses that data to other organizations. Data brokers compile information from public records, online activity, purchase history, and other sources. Most people are unaware of which data brokers hold information about them."
    },
    {
      term: "Data Removal Service",
      definition: "A data removal service is a commercial offering that attempts to delete or suppress personal information from online sources, including data broker databases and people-search websites. These services vary in effectiveness and scope, and complete removal of all personal data from the internet is generally not achievable."
    },
    {
      term: "Digital Footprint",
      definition: "A digital footprint is the trail of data a person creates through their online activity. This includes information shared intentionally, such as social media posts, as well as data collected passively, such as browsing history and location data. A digital footprint can be examined using ethical OSINT tools to understand online exposure."
    },
    {
      term: "Ethical OSINT",
      definition: "Ethical OSINT refers to the practice of gathering and analyzing publicly available information while respecting legal boundaries and privacy considerations. Ethical practitioners use only data that is legitimately accessible without bypassing access controls or violating terms of service. The purpose is typically awareness, security research, or risk assessment rather than surveillance."
    },
    {
      term: "Identity Fraud",
      definition: "Identity fraud is the use of another person's identity information to obtain goods, services, or financial benefits through deception. This may involve using stolen credit card details, creating fake accounts, or impersonating someone to access their resources. Identity fraud is a specific type of fraudulent activity that relies on misusing personal data."
    },
    {
      term: "Identity Misuse",
      definition: "Identity misuse is a broad term covering any unauthorized use of another person's personal information. This includes but is not limited to financial fraud, account takeover, impersonation, and harassment. Misuse can range from minor violations to serious criminal activity, and victims may not discover it for months or years."
    },
    {
      term: "Identity Theft",
      definition: "Identity theft is the act of obtaining and using another person's personal identifying information, typically for financial gain or to commit fraud. Despite common perceptions, identity theft rarely begins with a dramatic hack. It more often results from the gradual accumulation and exploitation of personal data over time."
    },
    {
      term: "Online Exposure",
      definition: "Online exposure refers to the extent to which a person's information is accessible through internet sources. High exposure means more personal data is publicly available or stored across multiple platforms. Understanding online exposure helps individuals assess their risk surface and prioritize protective actions."
    },
    {
      term: "Open-Source Intelligence (OSINT)",
      definition: "Open-source intelligence, or OSINT, is the collection and analysis of information from publicly available sources. These sources include websites, social media, public records, news articles, and other openly accessible data. OSINT is used in cybersecurity, journalism, research, and personal awareness applications such as digital footprint scanning."
    },
    {
      term: "Passive Digital Footprint",
      definition: "A passive digital footprint consists of data collected about a person without their direct input or awareness. This includes IP addresses, browsing behavior, device information, and tracking cookies. Passive footprints are generated automatically through normal internet use and can be collected by websites, advertisers, and service providers."
    },
    {
      term: "Password Manager",
      definition: "A password manager is a software application that securely stores and organizes login credentials. Password managers enable users to create strong, unique passwords for each account without needing to remember them individually. Using a password manager reduces the risks associated with password reuse and weak passwords."
    },
    {
      term: "Personal Data",
      definition: "Personal data is any information that can be used to identify a specific individual, either directly or in combination with other data. This includes names, email addresses, phone numbers, identification numbers, location data, and online identifiers. Personal data is subject to various protection regulations depending on jurisdiction."
    },
    {
      term: "Public Data",
      definition: "Public data is information that is openly accessible without requiring special permissions or bypassing access controls. This includes government records, published content, publicly visible social media profiles, and information on websites without login requirements. Public data forms the foundation of legitimate OSINT research."
    },
    {
      term: "Risk Surface",
      definition: "Risk surface describes the total extent of a person's or organization's exposure to potential threats. In digital privacy, risk surface includes all the platforms, accounts, and data points that could be exploited. Reducing risk surface involves limiting unnecessary exposure and securing critical accounts."
    },
    {
      term: "Signal vs Noise (in data exposure)",
      definition: "In the context of data exposure, signal refers to information that meaningfully increases risk or enables identification, while noise refers to data that has little practical value for misuse. Effective privacy management focuses on reducing high-signal exposure rather than attempting to eliminate all traces of online presence."
    },
    {
      term: "Two-Factor Authentication (2FA)",
      definition: "Two-factor authentication is a security method that requires two different forms of verification before granting access to an account. Typically this combines something the user knows, such as a password, with something the user has, such as a phone or security key. Enabling 2FA significantly reduces the risk of unauthorized account access."
    },
    {
      term: "Username Reuse",
      definition: "Username reuse is the practice of using the same username or handle across multiple online platforms. While convenient, this practice makes it easier to connect accounts and build a comprehensive profile of a person's online activity. Varying usernames across platforms can reduce the ease of cross-platform tracking."
    }
  ];

  const faqItems = [
    {
      question: "What is a digital footprint?",
      answer: "A digital footprint is the trail of data created through online activity, including both information shared intentionally and data collected passively about a person's browsing and online behavior."
    },
    {
      question: "What is the difference between OSINT and hacking?",
      answer: "OSINT uses only publicly available information that can be accessed without bypassing security controls. Hacking involves unauthorized access to protected systems or data. Ethical OSINT practitioners work within legal and ethical boundaries."
    },
    {
      question: "What does online exposure mean?",
      answer: "Online exposure refers to how much of a person's information is accessible through internet sources. Higher exposure means more data is publicly available or stored across multiple platforms."
    },
    {
      question: "How is personal data different from public data?",
      answer: "Personal data is any information that can identify a specific person. Public data is information openly accessible without special permissions. Some personal data may also be public data if it has been published openly."
    },
    {
      question: "What is a risk surface?",
      answer: "Risk surface describes the total extent of exposure to potential threats, including all platforms, accounts, and data points that could be exploited. Reducing risk surface means limiting unnecessary exposure."
    }
  ];

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://footprintiq.app';

  const definedTermSetId = `${origin}/digital-privacy-glossary#term-set`;

  const definedTermSetJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": definedTermSetId,
    "name": "Digital Privacy & Online Exposure Glossary",
    "description": "Comprehensive glossary of terms related to digital footprints, online exposure, OSINT, and identity risk. Clear definitions for non-technical readers.",
    "url": `${origin}/digital-privacy-glossary`,
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "url": origin
    },
    "hasDefinedTerm": [
      {
        "@type": "DefinedTerm",
        "@id": `${origin}/digital-privacy-glossary#digital-footprint`,
        "name": "Digital Footprint",
        "description": "A digital footprint is the trail of data a person creates through their online activity. This includes information shared intentionally, such as social media posts, as well as data collected passively, such as browsing history and location data.",
        "inDefinedTermSet": definedTermSetId
      },
      {
        "@type": "DefinedTerm",
        "@id": `${origin}/digital-privacy-glossary#active-digital-footprint`,
        "name": "Active Digital Footprint",
        "description": "An active digital footprint consists of data that a person deliberately shares online. This includes social media posts, comments, uploaded photos, forum contributions, and profile information.",
        "inDefinedTermSet": definedTermSetId
      },
      {
        "@type": "DefinedTerm",
        "@id": `${origin}/digital-privacy-glossary#passive-digital-footprint`,
        "name": "Passive Digital Footprint",
        "description": "A passive digital footprint consists of data collected about a person without their direct input or awareness. This includes IP addresses, browsing behavior, device information, and tracking cookies.",
        "inDefinedTermSet": definedTermSetId
      },
      {
        "@type": "DefinedTerm",
        "@id": `${origin}/digital-privacy-glossary#online-exposure`,
        "name": "Online Exposure",
        "description": "Online exposure refers to the extent to which a person's information is accessible through internet sources. High exposure means more personal data is publicly available or stored across multiple platforms.",
        "inDefinedTermSet": definedTermSetId
      },
      {
        "@type": "DefinedTerm",
        "@id": `${origin}/digital-privacy-glossary#osint`,
        "name": "Open-Source Intelligence (OSINT)",
        "description": "Open-source intelligence, or OSINT, is the collection and analysis of information from publicly available sources. These sources include websites, social media, public records, news articles, and other openly accessible data.",
        "inDefinedTermSet": definedTermSetId
      },
      {
        "@type": "DefinedTerm",
        "@id": `${origin}/digital-privacy-glossary#ethical-osint`,
        "name": "Ethical OSINT",
        "description": "Ethical OSINT refers to the practice of gathering and analyzing publicly available information while respecting legal boundaries and privacy considerations. Ethical practitioners use only data that is legitimately accessible without bypassing access controls.",
        "inDefinedTermSet": definedTermSetId
      },
      {
        "@type": "DefinedTerm",
        "@id": `${origin}/digital-privacy-glossary#data-breach`,
        "name": "Data Breach",
        "description": "A data breach is an incident where protected or confidential information is accessed, disclosed, or stolen without authorization. Breaches can affect organizations of any size and may expose personal data including email addresses, passwords, and financial information.",
        "inDefinedTermSet": definedTermSetId
      },
      {
        "@type": "DefinedTerm",
        "@id": `${origin}/digital-privacy-glossary#data-aggregation`,
        "name": "Data Aggregation",
        "description": "Data aggregation is the process of collecting and combining information from multiple sources into a single dataset. In the context of online exposure, aggregation allows small pieces of information from different platforms to be combined.",
        "inDefinedTermSet": definedTermSetId
      },
      {
        "@type": "DefinedTerm",
        "@id": `${origin}/digital-privacy-glossary#identity-theft`,
        "name": "Identity Theft",
        "description": "Identity theft is the act of obtaining and using another person's personal identifying information, typically for financial gain or to commit fraud. Despite common perceptions, identity theft rarely begins with a dramatic hack.",
        "inDefinedTermSet": definedTermSetId
      },
      {
        "@type": "DefinedTerm",
        "@id": `${origin}/digital-privacy-glossary#identity-misuse`,
        "name": "Identity Misuse",
        "description": "Identity misuse is a broad term covering any unauthorized use of another person's personal information. This includes but is not limited to financial fraud, account takeover, impersonation, and harassment.",
        "inDefinedTermSet": definedTermSetId
      },
      {
        "@type": "DefinedTerm",
        "@id": `${origin}/digital-privacy-glossary#data-broker`,
        "name": "Data Broker",
        "description": "A data broker is a business that collects personal information from various sources and sells or licenses that data to other organizations. Data brokers compile information from public records, online activity, purchase history, and other sources.",
        "inDefinedTermSet": definedTermSetId
      }
    ]
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Digital Privacy & Online Exposure Glossary",
    "description": "Comprehensive glossary of digital privacy terms including digital footprint, OSINT, data breach, identity theft, and online exposure.",
    "url": `${origin}/digital-privacy-glossary`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "FootprintIQ",
      "url": origin
    },
    "about": {
      "@id": definedTermSetId
    },
    "mainEntity": {
      "@id": definedTermSetId
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
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
        "name": "Digital Footprint Scanner",
        "item": `${origin}/digital-footprint-scanner`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Digital Privacy Glossary",
        "item": `${origin}/digital-privacy-glossary`
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Digital Privacy & Online Exposure Glossary | FootprintIQ</title>
        <meta 
          name="description" 
          content="Comprehensive glossary of digital privacy terms including digital footprint, OSINT, data breach, identity theft, and online exposure. Clear definitions for non-technical readers." 
        />
        <meta 
          name="keywords" 
          content="digital footprint definition, OSINT meaning, data breach explained, identity theft glossary, online exposure terms, digital privacy dictionary" 
        />
        <link rel="canonical" href={`${origin}/digital-privacy-glossary`} />
        
        <meta property="og:title" content="Digital Privacy & Online Exposure Glossary | FootprintIQ" />
        <meta property="og:description" content="Comprehensive glossary of digital privacy terms. Clear, neutral definitions for digital footprint, OSINT, data breach, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/digital-privacy-glossary`} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Digital Privacy & Online Exposure Glossary" />
        <meta name="twitter:description" content="Comprehensive glossary of digital privacy terms. Clear, neutral definitions for non-technical readers." />
        
        <script type="application/ld+json">
          {JSON.stringify(definedTermSetJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(webPageJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="bg-muted/30 border-b border-border">
            <div className="max-w-4xl mx-auto px-6 py-3">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/digital-footprint-scanner" className="hover:text-foreground transition-colors">Digital Footprint Scanner</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground">Digital Privacy Glossary</span>
              </nav>
            </div>
          </div>

          {/* Hero Section */}
          <section className="py-16 px-6 bg-gradient-to-b from-muted/50 to-background">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Reference Guide</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Digital Privacy & Online Exposure Glossary
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Clear, neutral definitions of key terms related to digital footprints, online exposure, 
                OSINT, and identity risk. Written for non-technical readers.
              </p>
            </div>
          </section>

          {/* Quick Navigation */}
          <section className="py-8 px-6 border-b border-border">
            <div className="max-w-4xl mx-auto">
              <p className="text-sm text-muted-foreground mb-4">Jump to:</p>
              <div className="flex flex-wrap gap-2">
                {glossaryTerms.map((item, index) => (
                  <a 
                    key={index}
                    href={`#${item.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.term}
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* Glossary Content */}
          <article className="py-12 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {glossaryTerms.map((item, index) => (
                  <div 
                    key={index} 
                    id={item.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    className="scroll-mt-24"
                  >
                    <h3 className="text-xl font-semibold text-foreground mb-3 pb-2 border-b border-border">
                      {item.term}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* FAQ Section */}
          <section className="py-12 px-6 bg-muted/30">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index} className="bg-card rounded-lg p-6 border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {item.question}
                    </h3>
                    <p className="text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Related Resources */}
          <section className="py-12 px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Related Resources
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link 
                  to="/reduce-digital-footprint"
                  className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors group"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    How to Reduce Your Digital Footprint
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Practical, ethical steps to reduce online exposure over time.
                  </p>
                </Link>
                <Link 
                  to="/how-identity-theft-starts"
                  className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors group"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    How Identity Theft Actually Starts
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Understanding the real origins of identity misuse.
                  </p>
                </Link>
                <Link 
                  to="/digital-footprint-scanner"
                  className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors group"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    Digital Footprint Scanner
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Understand your online exposure with ethical OSINT tools.
                  </p>
                </Link>
                <Link 
                  to="/what-is-osint"
                  className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors group"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    What Is OSINT?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Learn about open-source intelligence and how it works.
                  </p>
                </Link>
              </div>
            </div>
          </section>

          <TrustSignals />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DigitalPrivacyGlossary;
