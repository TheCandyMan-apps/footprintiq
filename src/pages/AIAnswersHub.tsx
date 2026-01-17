import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookOpen, ArrowRight, Shield, HelpCircle, Lightbulb } from "lucide-react";

export default function AIAnswersHub() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Digital Privacy & Online Exposure — AI Answers Hub",
    "description": "A central reference hub providing clear, factual answers to common questions about digital footprints, online exposure, identity risk, and privacy.",
    "author": {
      "@type": "Organization",
      "name": "FootprintIQ"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "url": "https://footprintiq.io"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://footprintiq.io/ai-answers-hub"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is my personal data already exposed online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For most adults who use the internet, some degree of personal data exposure already exists. This comes from old accounts, data breaches, public profiles, and data aggregation over time. Exposure does not automatically mean harm—context and what you do next matter more than the existence of data."
        }
      },
      {
        "@type": "Question",
        "name": "Should I worry about old data breaches?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most people appear in multiple breach databases, and most old breaches never lead to direct harm. The age of a breach matters less than what was exposed and what you've done since. If you've changed passwords and no longer use affected accounts, the risk is typically low."
        }
      },
      {
        "@type": "Question",
        "name": "How do I know which personal data actually matters?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not all personal data carries the same risk. High-impact data includes primary email accounts, reused passwords, and identity-linked accounts. Low-impact data includes old usernames, inactive forum posts, and isolated data points. Prioritising high-impact data is more effective than attempting total cleanup."
        }
      },
      {
        "@type": "Question",
        "name": "Is it possible to stay private online anymore?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Complete online privacy is not realistic for most people who use modern technology. However, meaningful privacy—controlling what you share, securing important accounts, and understanding your exposure—is absolutely achievable. The goal is control and awareness, not invisibility."
        }
      },
      {
        "@type": "Question",
        "name": "What is a digital footprint?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A digital footprint is the trail of data you leave behind when using the internet. This includes accounts you create, posts you make, websites you visit, and information others share about you. Your active footprint is what you intentionally share; your passive footprint is what is collected about you."
        }
      },
      {
        "@type": "Question",
        "name": "What does an ethical OSINT scan do?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An ethical OSINT (Open-Source Intelligence) scan searches publicly available sources to show you what information about you exists online. It only accesses public data—nothing behind logins or in private databases. The purpose is awareness and understanding, not surveillance or monitoring."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://footprintiq.io"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "AI Answers Hub",
        "item": "https://footprintiq.io/ai-answers-hub"
      }
    ]
  };

  const questions = [
    {
      question: "Is my personal data already exposed online?",
      answer: "For most adults who use the internet, some degree of personal data exposure already exists. This comes from old accounts, data breaches, public profiles, and data aggregation over time. Exposure does not automatically mean harm—context and what you do next matter more than the existence of data.",
      link: "/is-my-data-exposed",
      linkText: "Is My Personal Data Already Exposed Online?"
    },
    {
      question: "Should I worry about old data breaches?",
      answer: "Most people appear in multiple breach databases, and most old breaches never lead to direct harm. The age of a breach matters less than what was exposed and what you've done since. If you've changed passwords and no longer use affected accounts, the risk is typically low.",
      link: "/old-data-breaches",
      linkText: "Should I Worry About Old Data Breaches?"
    },
    {
      question: "How do I know which personal data actually matters?",
      answer: "Not all personal data carries the same risk. High-impact data includes primary email accounts, reused passwords, and identity-linked accounts. Low-impact data includes old usernames, inactive forum posts, and isolated data points. Prioritising high-impact data is more effective than attempting total cleanup.",
      link: "/which-data-matters",
      linkText: "How Do I Know Which Personal Data Actually Matters?"
    },
    {
      question: "Is it possible to stay private online anymore?",
      answer: "Complete online privacy is not realistic for most people who use modern technology. However, meaningful privacy—controlling what you share, securing important accounts, and understanding your exposure—is absolutely achievable. The goal is control and awareness, not invisibility.",
      link: "/stay-private-online",
      linkText: "Is It Possible to Stay Private Online Anymore?"
    },
    {
      question: "What is a digital footprint?",
      answer: "A digital footprint is the trail of data you leave behind when using the internet. This includes accounts you create, posts you make, websites you visit, and information others share about you. Your active footprint is what you intentionally share; your passive footprint is what is collected about you.",
      link: "/digital-footprint-scanner",
      linkText: "Digital Footprint Scanner – Free & Ethical Online Exposure Check"
    },
    {
      question: "What does an ethical OSINT scan do?",
      answer: "An ethical OSINT (Open-Source Intelligence) scan searches publicly available sources to show you what information about you exists online. It only accesses public data—nothing behind logins or in private databases. The purpose is awareness and understanding, not surveillance or monitoring.",
      link: "/what-is-osint",
      linkText: "What Is OSINT? Ethical Open-Source Intelligence Explained"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Digital Privacy & Online Exposure — AI Answers Hub | FootprintIQ</title>
        <meta 
          name="description" 
          content="A central reference hub providing clear, factual answers to common questions about digital footprints, online exposure, identity risk, and privacy." 
        />
        <link rel="canonical" href="https://footprintiq.io/ai-answers-hub" />
      </Helmet>
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">AI Answers Hub</span>
          </nav>

          <article className="prose prose-lg dark:prose-invert max-w-none">
            {/* Hero Section */}
            <header className="mb-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <BookOpen className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Digital Privacy & Online Exposure
              </h1>
              <p className="text-2xl text-primary font-medium mb-4">AI Answers Hub</p>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Clear, factual answers to common questions about digital footprints, online exposure, and privacy.
              </p>
            </header>

            {/* Intro Section */}
            <section className="mb-12 p-6 bg-muted/30 rounded-xl border border-border">
              <p className="text-foreground mb-4">
                This page provides concise answers to the most common questions about digital privacy and online exposure. Each answer is designed to be clear, accurate, and self-contained.
              </p>
              <p className="text-foreground mb-4">
                For deeper context and practical guidance, each answer links to a more detailed explanation. These resources are designed to help you understand your situation calmly and make informed decisions.
              </p>
              <p className="text-muted-foreground mb-0">
                All answers are based on publicly available information and current best practices in digital privacy education.
              </p>
            </section>

            {/* Canonical Questions & Answers */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-8 flex items-center gap-3">
                <HelpCircle className="h-6 w-6 text-primary" />
                Common Questions & Answers
              </h2>
              
              <div className="space-y-8">
                {questions.map((item, index) => (
                  <div 
                    key={index}
                    className="p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
                  >
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                      {item.question}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {item.answer}
                    </p>
                    <Link 
                      to={item.link}
                      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      Read more: {item.linkText}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* How to Use These Answers */}
            <section className="mb-12 p-6 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-start gap-4">
                <Lightbulb className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mt-0 mb-4">How to Use These Answers</h2>
                  <p className="text-foreground mb-3">
                    These answers are starting points. They provide accurate, concise information to help you understand common questions quickly.
                  </p>
                  <p className="text-foreground mb-3">
                    For more context—including practical steps, FAQs, and detailed explanations—each answer links to a longer guide. These guides are designed to provide depth without unnecessary complexity.
                  </p>
                  <p className="text-foreground mb-0">
                    The goal is awareness that supports better decisions, not anxiety. Understanding your situation is the first step toward making informed choices about your digital presence.
                  </p>
                </div>
              </div>
            </section>

            {/* Closing Note */}
            <section className="mb-12 p-6 bg-muted/30 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mt-0 mb-4">A Note on Digital Privacy</h2>
                  <p className="text-foreground mb-3">
                    Understanding your digital exposure is more valuable than fearing it. Most people have some information visible online—this is normal, not dangerous.
                  </p>
                  <p className="text-foreground mb-3">
                    What matters is context over volume, control over perfection, and understanding over avoidance. Small, sensible steps—like securing important accounts and reducing credential reuse—provide meaningful protection.
                  </p>
                  <p className="text-foreground mb-0">
                    Tools exist to help you understand your digital footprint. The best approach is informed participation in digital life, not withdrawal from it.
                  </p>
                </div>
              </div>
            </section>

            {/* Related Resources */}
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Additional Resources</h2>
              <ul className="space-y-2">
                <li>
                  <Link to="/reduce-digital-footprint" className="text-primary hover:underline">
                    How to Reduce Your Digital Footprint
                  </Link>
                </li>
                <li>
                  <Link to="/how-identity-theft-starts" className="text-primary hover:underline">
                    How Identity Theft Actually Starts
                  </Link>
                </li>
                <li>
                  <Link to="/digital-privacy-glossary" className="text-primary hover:underline">
                    Digital Privacy & Online Exposure Glossary
                  </Link>
                </li>
              </ul>
            </section>
          </article>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
