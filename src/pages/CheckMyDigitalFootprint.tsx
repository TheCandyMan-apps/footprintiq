import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { Button } from "@/components/ui/button";
import { Search, Shield, Eye, UserCheck, Mail, Globe, Database, ArrowRight, CheckCircle } from "lucide-react";

const faqs = [
  {
    q: "What does a digital footprint scan check?",
    a: "It searches public sources for usernames, email addresses, social profiles, data broker listings, and breach records linked to your identity.",
  },
  {
    q: "Is this scan free?",
    a: "Yes. You can run an initial exposure scan at no cost. Advanced features and deeper analysis may require a paid plan.",
  },
  {
    q: "Will anyone know I ran a scan?",
    a: "No. FootprintIQ queries publicly accessible data only. No accounts are accessed or contacted during a scan.",
  },
  {
    q: "How accurate are the results?",
    a: "Results include confidence scores so you can evaluate each finding. We recommend manual verification for any match before taking action.",
  },
];

const CheckMyDigitalFootprint = () => {
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Check My Digital Footprint: See What's Public About You",
    description:
      "Check your digital footprint and discover what personal data is publicly visible online. Run a free privacy exposure scan today.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: { "@type": "Organization", name: "FootprintIQ" },
    datePublished: "2026-02-13",
    dateModified: "2026-02-13",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://footprintiq.app/check-my-digital-footprint",
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Check My Digital Footprint",
        item: "https://footprintiq.app/check-my-digital-footprint",
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Check My Digital Footprint – Free Online Exposure Scan</title>
        <meta
          name="description"
          content="Check your digital footprint and discover what personal data is publicly visible online. Run a free privacy exposure scan today."
        />
        <link rel="canonical" href="https://footprintiq.app/check-my-digital-footprint" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Check My Digital Footprint – Free Online Exposure Scan" />
        <meta
          property="og:description"
          content="Check your digital footprint and discover what personal data is publicly visible online. Run a free privacy exposure scan today."
        />
        <meta property="og:url" content="https://footprintiq.app/check-my-digital-footprint" />
      </Helmet>
      <JsonLd data={articleLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Check My Digital Footprint: See What's Public About You
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Your online activity leaves traces. A digital footprint scan reveals what personal data is publicly
              visible — so you can take control of your exposure before someone else uses it.
            </p>
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link to="/scan">
                <Search className="w-5 h-5 mr-2" />
                Start Free Scan
              </Link>
            </Button>
          </div>
        </section>

        {/* What Is a Digital Footprint? */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">What Is a Digital Footprint?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A digital footprint is the collection of data trails you leave when using the internet. This includes
              social media profiles, forum accounts, data broker listings, comments, and any other publicly accessible
              information linked to your identity.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Some footprints are intentional — like social profiles you created. Others are passive — information
              collected and published about you without your direct involvement, such as data broker records or leaked
              credentials from past breaches.
            </p>
          </div>
        </section>

        {/* What Our Scan Checks */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">What Our Scan Checks</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: UserCheck, label: "Username exposure across 500+ platforms" },
                { icon: Globe, label: "Public social media profiles" },
                { icon: Database, label: "Data broker listings linked to your identity" },
                { icon: Mail, label: "Email breach indicators" },
                { icon: Eye, label: "Account reuse patterns" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border"
                >
                  <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why It Matters */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Why It Matters</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Publicly visible personal information can be used for social engineering, impersonation, credential
              stuffing, and targeted phishing. The more data points linked to your identity, the easier it becomes
              for bad actors to build a profile about you.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Understanding your digital footprint is the first step toward reducing unnecessary exposure. Whether
              you're protecting personal privacy or managing professional reputation, awareness gives you the power
              to act.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">How It Works</h2>
            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Enter a username or email",
                  desc: "Provide the identifier you'd like to check. No account access or passwords required.",
                },
                {
                  step: "2",
                  title: "We scan public sources",
                  desc: "Our pipeline queries hundreds of platforms and databases using ethical, publicly accessible methods.",
                },
                {
                  step: "3",
                  title: "Results with confidence scoring",
                  desc: "Each finding includes a confidence score so you can evaluate the reliability of every match.",
                },
                {
                  step: "4",
                  title: "Actionable guidance",
                  desc: "We provide context and recommended steps to reduce your exposure based on the findings.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="text-foreground font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Run Your Free Digital Footprint Scan
            </h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
              Enter a username or email to see what's publicly visible about you. No credit card required.
            </p>
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link to="/scan">
                <Search className="w-5 h-5 mr-2" />
                Start Free Scan
              </Link>
            </Button>
          </div>
        </section>

        <RelatedToolsGrid currentPath="/check-my-digital-footprint" />
      </main>

      <Footer />
    </>
  );
};

export default CheckMyDigitalFootprint;
