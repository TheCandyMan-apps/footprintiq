import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const WhichDataMatters = () => {
  const faqs = [
    {
      question: "Is my name and address dangerous on its own?",
      answer: "Your name and address alone are usually low risk. This information is often publicly available through directories, voter records, and property listings. Risk increases when this data is combined with other information like account credentials or financial details. On its own, it's rarely enough to cause harm."
    },
    {
      question: "Are old usernames a real risk?",
      answer: "Old usernames are typically low risk unless you've reused them across multiple accounts with the same password. If someone can connect your username to active accounts with weak security, risk increases. Isolated usernames from inactive accounts usually don't matter."
    },
    {
      question: "Does deleting everything make me safer?",
      answer: "Deleting everything isn't necessary and often isn't practical. Focusing on securing your most important accounts and reducing password reuse provides more protection than chasing every old data point. Prioritisation is more effective than perfection."
    },
    {
      question: "Why do some people experience problems and others don't?",
      answer: "Most data exposure never leads to problems because attackers work at scale and target easy opportunities. People who experience issues often have reused passwords, unsecured important accounts, or were specifically targeted. Random exposure alone rarely causes harm."
    },
    {
      question: "How often should I reassess what matters?",
      answer: "An annual review is usually sufficient for most people. Check your important accounts, update passwords if needed, and review any breach notifications you've received. More frequent reviews are rarely necessary unless your circumstances change significantly."
    },
    {
      question: "What's the single most important thing to secure?",
      answer: "Your primary email account. This is typically the recovery method for all your other accounts. If someone gains access to your main email, they can reset passwords elsewhere. Securing this account with a strong, unique password and two-factor authentication provides significant protection."
    }
  ];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How Do I Know Which Personal Data Actually Matters?",
    "description": "Learn which types of personal data carry real risk and which are low-impact noise. A calm, practical guide to prioritising your digital privacy efforts.",
    "author": {
      "@type": "Organization",
      "name": "FootprintIQ"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "url": "https://footprintiq.app"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://footprintiq.app/which-data-matters"
    },
    "datePublished": "2025-01-17",
    "dateModified": "2025-01-17"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://footprintiq.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Digital Footprint Scanner",
        "item": "https://footprintiq.app/digital-footprint-scanner"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Which Personal Data Matters",
        "item": "https://footprintiq.app/which-data-matters"
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>How Do I Know Which Personal Data Actually Matters? | FootprintIQ</title>
        <meta 
          name="description" 
          content="Learn which types of personal data carry real risk and which are low-impact noise. A calm, practical guide to prioritising your digital privacy efforts." 
        />
        <link rel="canonical" href="https://footprintiq.app/which-data-matters" />
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/digital-footprint-scanner" className="hover:text-primary">Digital Footprint Scanner</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Which Personal Data Matters</span>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              A Practical Framework for Prioritising Your Personal Data
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A calm, practical guide to understanding which types of personal data carry real risk 
              and which are mostly noise.
            </p>
          </header>

          {/* Direct Answer */}
          <section className="mb-12 p-6 bg-muted/30 rounded-lg border border-border">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">The Short Answer</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Not all personal data carries the same risk. While exposure reports can list 
                dozens of data points, only a small portion typically requires attention.
              </p>
              <p>
                Some data matters far more than the rest. Information that provides access to 
                accounts, enables impersonation, or connects to financial services carries 
                genuine weight. Most other data points are either low-impact or already 
                widely available through normal means.
              </p>
              <p>
                Prioritisation is more effective than total cleanup. Securing your most 
                important accounts and reducing password reuse provides more protection 
                than attempting to remove every trace of your online presence.
              </p>
            </div>
          </section>

          {/* Why Everything Feels Important */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Why "Everything Feels Important" (But Isn't)
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                When you first see a list of your exposed data, the volume can feel 
                overwhelming. Seeing your name, old usernames, email addresses, and 
                account histories laid out creates a sense of vulnerability.
              </p>
              <p>
                This reaction is natural but often disproportionate to actual risk. 
                The sheer quantity of items creates anxiety, even when most individual 
                pieces carry little weight on their own.
              </p>
              <p>
                Context matters more than quantity. A single reused password on an 
                important account poses more practical risk than dozens of old forum 
                posts from accounts you no longer use.
              </p>
              <p>
                Understanding this distinction helps transform an overwhelming list 
                into a manageable set of priorities.
              </p>
            </div>
          </section>

          {/* High-Impact Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              High-Impact Personal Data (What Actually Matters)
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Certain types of data genuinely warrant attention because they provide 
                access to accounts or enable impersonation.
              </p>
              <p>
                Your primary email accounts are particularly important. These typically 
                serve as recovery methods for other services, meaning access to your 
                main email could potentially lead to access elsewhere.
              </p>
              <p>
                Password reuse patterns represent another significant concern. If you've 
                used the same password across multiple services and that password appears 
                in any <Link to="/digital-privacy-glossary" className="text-primary hover:underline">data breach</Link>, 
                the risk extends to every account sharing that password.
              </p>
              <p>
                Core financial or identity-linked accounts—banking, government services, 
                healthcare portals—carry weight because of what they connect to rather 
                than the accounts themselves.
              </p>
              <p>
                Data that enables account access or impersonation matters most. This 
                includes credentials, security question answers, and information used 
                for verification purposes.
              </p>
            </div>
          </section>

          {/* Medium-Impact Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Medium-Impact Data (Situational)
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Some data falls into a middle category where impact depends on 
                specific circumstances rather than the data type alone.
              </p>
              <p>
                Usernames reused across multiple sites can connect your activities 
                if someone is specifically looking. For most people, this connection 
                is harmless. For others with particular privacy needs, it may 
                warrant consideration.
              </p>
              <p>
                Public profiles on professional or social platforms contain 
                information you've chosen to share. The risk depends on what 
                you've posted and whether that content could be misused in 
                contexts you didn't anticipate.
              </p>
              <p>
                Old accounts that still exist but you no longer use represent 
                potential access points if they share credentials with current 
                accounts. Their importance depends entirely on password reuse.
              </p>
              <p>
                Context and reuse determine impact for this category. The same 
                username might be meaningless in one situation and worth 
                addressing in another.
              </p>
            </div>
          </section>

          {/* Low-Impact Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              Low-Impact Data (Mostly Noise)
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Much of what appears in exposure reports carries minimal practical risk. 
                Understanding this helps focus your attention where it matters.
              </p>
              <p>
                Old forum posts from inactive communities rarely cause problems. Unless 
                they contain personally identifying information or embarrassing content, 
                they're simply digital remnants with no practical impact.
              </p>
              <p>
                Inactive usernames from services you no longer use don't provide access 
                to anything valuable. They exist in databases but serve no function for 
                anyone.
              </p>
              <p>
                Isolated data points without access or linkage—your name on a comment 
                from years ago, a mention in a public document—are typically meaningless 
                on their own.
              </p>
              <p>
                Information without reuse or connection to active accounts represents 
                historical data rather than current vulnerability. Most of these items 
                can be acknowledged and set aside.
              </p>
            </div>
          </section>

          {/* How Attackers Think */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              How Attackers Think About "Useful" Data
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Understanding how exposed data might be misused helps clarify what 
                actually matters. The reality is usually less dramatic than people imagine.
              </p>
              <p>
                Most misuse operates through automation rather than targeting. Attackers 
                typically work at scale, testing large numbers of credential combinations 
                rather than carefully researching individual people.
              </p>
              <p>
                Combinations matter more than single items. An email address alone is 
                nearly useless. That same email paired with a password from a breached 
                service becomes useful if you've reused that password elsewhere.
              </p>
              <p>
                Effort versus reward drives most activity. Spending hours researching 
                one person rarely makes sense when automated tools can test thousands 
                of credential pairs in the same time. This is why targeted attacks 
                typically focus on high-value individuals rather than random people.
              </p>
            </div>
          </section>

          {/* How to Prioritise */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">
              How to Prioritise Without Obsessing
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Effective digital privacy doesn't require addressing every data point. 
                A focused approach provides better protection than exhaustive cleanup.
              </p>
              <p>
                Focus on securing core accounts first. Your primary email, financial 
                services, and any accounts that serve as identity verification deserve 
                attention. Strong, unique passwords and two-factor authentication on 
                these accounts provide significant protection.
              </p>
              <p>
                Reduce reuse going forward. Rather than changing every password 
                immediately, commit to using unique passwords for new accounts and 
                gradually updating important existing ones.
              </p>
              <p>
                Accept diminishing returns. After securing your most important accounts, 
                additional effort yields progressively smaller benefits. Perfect security 
                doesn't exist, and attempting to achieve it often causes more stress 
                than it prevents harm.
              </p>
              <p>
                Stop when further action adds stress without meaningful safety benefits. 
                Privacy maintenance should feel manageable, not consuming.
              </p>
              <p>
                Understanding what's actually exposed can help guide these priorities. 
                A <Link to="/digital-footprint-scanner" className="text-primary hover:underline">digital footprint scanner</Link> can 
                provide clarity about which data points exist, making prioritisation more informed.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Closing Summary */}
          <section className="mb-12 p-6 bg-muted/30 rounded-lg border border-border">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Moving Forward</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Context matters more than volume. A long list of exposed data points 
                doesn't automatically translate to high risk. Most items require 
                specific circumstances to become meaningful.
              </p>
              <p>
                Priority beats perfection. Securing your most important accounts 
                provides more protection than attempting to address every historical 
                data point. Focus on what matters most and accept that some exposure 
                is normal and manageable.
              </p>
              <p>
                Awareness serves you better than fear. Understanding which data actually 
                matters helps you make informed decisions without unnecessary anxiety. 
                Your digital footprint is something to understand and manage, not 
                something to fear.
              </p>
              <p>
                Small, sensible steps—like using unique passwords and enabling two-factor 
                authentication on important accounts—provide meaningful protection. 
                These actions are within reach for everyone and don't require 
                technical expertise.
              </p>
              <p>
                If you're looking to take practical steps toward reducing your exposure, 
                our guide on <Link to="/reduce-digital-footprint" className="text-primary hover:underline">how to reduce your digital footprint</Link> offers 
                straightforward, actionable approaches.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WhichDataMatters;
