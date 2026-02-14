import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  ArrowRight,
  ChevronRight,
  Briefcase,
  Search,
  ShieldAlert,
  CheckCircle2,
  Globe,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/how-employers-check-your-online-presence";

const webPageSchema = buildWebPageSchema({
  name: "How Employers Check Your Online Presence (2026) | FootprintIQ",
  description:
    "Learn exactly how employers screen candidates online, what they look for, what's legal, and how to audit your digital presence before your next job application.",
  url: PAGE_URL,
  datePublished: "2026-02-14",
  dateModified: "2026-02-14",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do employers really check your social media before hiring?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Multiple industry surveys consistently show that 70–90% of employers screen candidates' social media and online presence during the hiring process. This includes Google searches, LinkedIn reviews, and checks of public social media profiles on platforms like Instagram, X (Twitter), Facebook, and TikTok.",
      },
    },
    {
      "@type": "Question",
      name: "What do employers look for when searching candidates online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Employers typically look for red flags such as discriminatory or offensive content, references to illegal activity, complaints about previous employers, and unprofessional behaviour. They also look for positives: professional expertise, thought leadership, community involvement, and consistency between your resume and online profile.",
      },
    },
    {
      "@type": "Question",
      name: "Is it legal for employers to screen candidates' social media?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In most jurisdictions, it is legal for employers to review publicly available information. However, using protected characteristics (race, religion, disability, pregnancy, political affiliation in some states) discovered through social media screening is illegal under employment discrimination laws. Some states also restrict employers from requesting social media passwords.",
      },
    },
    {
      "@type": "Question",
      name: "Can I be rejected from a job because of my online presence?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — if the employer finds content that raises legitimate concerns about professional suitability, they may choose not to proceed with your application. This is why proactively auditing and managing your digital footprint before job searching is important. You can't control what employers search, but you can control what they find.",
      },
    },
    {
      "@type": "Question",
      name: "How do I clean up my online presence before a job search?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Start by searching for yourself (in incognito mode) using your name, email, and usernames. Review and update privacy settings on all social platforms. Remove or hide old posts that don't reflect your current professional image. Request removal from data brokers. Run a digital footprint scan to find exposure you might miss manually.",
      },
    },
    {
      "@type": "Question",
      name: "Do background check companies use OSINT?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Some do. Traditional background check companies focus on criminal records, credit, and employment verification. However, newer services incorporate open-source intelligence (OSINT) techniques to scan social media, public forums, and online activity. The quality and ethics of these services vary significantly.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "How Employers Check Your Online Presence", item: PAGE_URL },
  ],
};

const HowEmployersCheck = () => {
  return (
    <>
      <Helmet>
        <title>How Employers Check Your Online Presence (2026) | FootprintIQ</title>
        <meta name="description" content="Learn how employers screen candidates online, what they look for, and how to audit your digital presence before your next job application." />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="How Employers Check Your Online Presence (2026)" />
        <meta property="og:description" content="What employers look for, what's legal, and how to prepare your online presence for a job search." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={webPageSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        <nav className="max-w-5xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">How Employers Check Your Online Presence</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Briefcase className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Career &amp; Privacy</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              How Employers Check Your{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">Online Presence</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Before you get to the interview, your online presence gets screened. Here's exactly what employers look for — and how to make sure they find the right things.
            </p>
            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">See What Employers See <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>
        </section>

        {/* Intro */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">The Reality of Online Screening</h2>
            <p>
              The hiring process starts before the interview — and often before you even know you're being considered. Recruiters and hiring managers routinely search candidates' names, review LinkedIn profiles, and check public social media accounts as part of their screening process.
            </p>
            <p>
              This isn't new, but the depth and sophistication of online screening has increased significantly. Beyond a simple Google search, some employers use specialised screening services that aggregate social media posts, public records, and online activity into comprehensive candidate reports.
            </p>
            <p>
              The good news: you can prepare. By understanding what employers look for and auditing your own visibility first, you can control the narrative — making sure your online presence works for you, not against you.
            </p>
          </div>
        </section>

        {/* Step-by-step: What employers do */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Search className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">What Employers Actually Do</h2>
            </div>

            <div className="space-y-4">
              {[
                { step: "1", title: "Google your name", desc: "The most common first step. They'll search your full name, sometimes combined with your city, university, or current employer. They're looking at the first 1–2 pages of results." },
                { step: "2", title: "Review your LinkedIn", desc: "LinkedIn is treated as your professional identity. They check employment history consistency, endorsements, recommendations, activity, and who you're connected to." },
                { step: "3", title: "Check public social media", desc: "Instagram, X (Twitter), Facebook, and TikTok profiles are reviewed if publicly accessible. They're looking for professionalism, judgement, and anything that might raise concerns." },
                { step: "4", title: "Search data broker sites", desc: "Some employers or screening services check people-search sites like Spokeo or BeenVerified for additional background information, address history, and associated names." },
                { step: "5", title: "Use screening services", desc: "Larger companies may use professional screening services (Checkr, Sterling, HireRight) that combine criminal records, credit checks, and increasingly, social media analysis into a single report." },
                { step: "6", title: "Search for red flags", desc: "Specific searches for your name + controversial topics, complaints about employers, or content that might indicate poor judgement. They're also verifying claims on your resume against your online presence." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start bg-card border border-border/50 rounded-xl p-5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center text-sm">{item.step}</span>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Risks */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <ShieldAlert className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Risks of Unmanaged Online Presence</h2>
            </div>
            <p>An unaudited online presence can cost you opportunities you never knew you had:</p>
            <ul>
              <li><strong>Silent rejection:</strong> Most employers won't tell you that your online presence influenced their decision. You'll simply never hear back — and never know why.</li>
              <li><strong>Outdated impressions:</strong> Posts, photos, and comments from years ago may still be publicly visible and creating impressions that don't reflect who you are today.</li>
              <li><strong>Guilt by association:</strong> Tagged photos, group memberships, or comments on controversial posts can create negative associations even if you weren't directly involved.</li>
              <li><strong>Resume inconsistencies:</strong> If your LinkedIn says one thing and your resume says another, it raises credibility concerns — even if the discrepancy is innocent.</li>
              <li><strong>Data broker profiles:</strong> People-search sites may display your address, phone number, estimated income, and relatives — information you probably don't want a potential employer seeing.</li>
            </ul>
          </div>
        </section>

        {/* FootprintIQ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">How FootprintIQ Helps You Prepare</h2>
            </div>
            <p>
              FootprintIQ lets you see what an employer would find — before they find it. A single scan maps your visibility across social platforms, data brokers, breach databases, and public records, giving you a complete picture of your professional digital presence.
            </p>
            <p>
              Results are scored by confidence and prioritised by risk. You'll know exactly which exposures to address first and which are low-priority. The platform uses only publicly accessible data and operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>.
            </p>
            <p>
              Think of it as a pre-interview digital audit — the same kind of check employers run, but you do it first and on your own terms.
            </p>
          </div>
        </section>

        {/* Alternatives */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Other Ways to Audit Your Presence</h2>
            </div>
            <ul>
              <li><strong>Manual Google search</strong> — free but limited to what you think to search for. Use incognito mode and try multiple name variations.</li>
              <li><strong>BrandYourself</strong> — a reputation management tool focused on improving your Google results rather than mapping full exposure.</li>
              <li><strong>Social media privacy checkups</strong> — Facebook, Instagram, and LinkedIn all have built-in privacy review tools. Useful but platform-specific.</li>
              <li><strong>Have I Been Pwned</strong> — checks for breach exposure specifically. Important for ensuring old passwords haven't been leaked.</li>
              <li><strong>Removal services</strong> (DeleteMe, Optery) — handle data broker opt-outs automatically. Useful for removing listings but don't provide broader exposure mapping.</li>
            </ul>
            <p>
              For a thorough pre-job-search audit, combine a FootprintIQ scan with platform-specific privacy reviews and a HIBP check. See our <Link to="/how-to-clean-up-your-digital-footprint" className="text-accent hover:underline">digital footprint cleanup guide</Link> for the full process.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqSchema.mainEntity.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">{faq.name}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{faq.acceptedAnswer.text}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See What Employers See</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Run a free scan and audit your online presence before your next application.</p>
            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">Run Your Free Scan <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>
        </section>

        <section className="py-12 px-6"><div className="max-w-3xl mx-auto"><AboutFootprintIQBlock /></div></section>
      </main>
      <Footer />
    </>
  );
};

export default HowEmployersCheck;
