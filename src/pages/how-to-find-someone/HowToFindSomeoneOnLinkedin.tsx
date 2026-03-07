import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { EthicalOsintTrustBlock } from "@/components/EthicalOsintTrustBlock";
import { HeroInputField } from "@/components/HeroInputField";
import { FinalCTA } from "@/components/FinalCTA";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Can you find someone on LinkedIn by username?", a: "LinkedIn uses custom profile URLs (linkedin.com/in/username) and real-name-based URLs. FootprintIQ checks LinkedIn alongside 500+ platforms to identify cross-platform presence." },
  { q: "What does a LinkedIn profile reveal?", a: "Public LinkedIn profiles show work history, education, skills, endorsements, recommendations, connections count, posts, and articles. This is often the most comprehensive professional identity data available on any platform." },
  { q: "Is it legal to search for someone on LinkedIn?", a: "Yes. Searching publicly visible LinkedIn profiles is legal. FootprintIQ only queries public data accessible without authentication." },
  { q: "Can you find a LinkedIn profile without a username?", a: "Yes. LinkedIn profiles are heavily indexed by Google. Searching 'site:linkedin.com \"First Last\" \"Company\"' often surfaces the correct profile. LinkedIn's own search also supports name and company queries." },
  { q: "How do you detect fake LinkedIn profiles?", a: "Fake profiles often have AI-generated photos, sparse work histories, few connections, generic bios, and inconsistent education or employment details. Cross-referencing with other platforms and checking whether claimed employers acknowledge the profile helps verify authenticity." },
];

const canonical = "https://footprintiq.app/how-to-find-someone-on-linkedin";

export default function HowToFindSomeoneOnLinkedin() {
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" }, { "@type": "ListItem", position: 2, name: "How To Find Someone On LinkedIn", item: canonical }] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", headline: "How To Find Someone On LinkedIn", description: "Learn how to find someone on LinkedIn using profile searches, professional network analysis, and cross-platform OSINT techniques.", author: { "@type": "Organization", name: "FootprintIQ" }, publisher: { "@type": "Organization", name: "FootprintIQ" }, datePublished: "2026-03-07", dateModified: "2026-03-07", mainEntityOfPage: { "@type": "WebPage", "@id": canonical } };

  return (
    <>
      <Helmet>
        <title>How To Find Someone On LinkedIn – Professional Profile Search | FootprintIQ</title>
        <meta name="description" content="Find someone on LinkedIn by name or username. Search professional profiles, analyse career history, and trace identities across platforms using ethical OSINT." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="How To Find Someone On LinkedIn – Professional Profile Search | FootprintIQ" />
        <meta property="og:description" content="Find someone on LinkedIn by name or username. Search professional profiles and trace identities." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30"><Briefcase className="h-3 w-3 mr-1.5" />LinkedIn Investigation Guide</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">How To Find Someone On LinkedIn</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              LinkedIn is the world's largest professional network, containing more verified identity data than almost any other social platform. Learn how to find LinkedIn profiles, extract professional intelligence, and connect professional identities to broader digital footprints.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Searching By Username</h2>
            <p>LinkedIn profiles use custom URLs in the format <code>linkedin.com/in/username</code>. Many users set this to their real name (e.g., <em>john-smith-42b3a1</em>), though LinkedIn also generates random alphanumeric suffixes for common names.</p>
            <p>A public LinkedIn profile provides the most comprehensive professional identity data available online:</p>
            <ul>
              <li><strong>Full name and headline.</strong> LinkedIn profiles typically display real names and professional headlines (e.g., "Senior Software Engineer at Google"). This is often the most reliable real-name source across all social platforms.</li>
              <li><strong>Work history.</strong> Current and past employment, including company names, job titles, dates of employment, and description of responsibilities. This creates a verifiable professional timeline.</li>
              <li><strong>Education.</strong> Schools, universities, degrees, and graduation dates. This data is particularly useful for verifying identity and establishing geographic history.</li>
              <li><strong>Skills and endorsements.</strong> Listed skills reveal professional competencies, and endorsements from connections provide social proof of those skills.</li>
              <li><strong>Recommendations.</strong> Written testimonials from colleagues provide third-party verification of employment relationships and professional reputation.</li>
              <li><strong>Posts and articles.</strong> LinkedIn's publishing platform reveals professional opinions, expertise areas, and network engagement patterns.</li>
              <li><strong>Connections.</strong> While the full list is restricted, connection count and mutual connections provide insight into professional network size and composition.</li>
              <li><strong>Certifications and licences.</strong> Professional certifications and licences, often with verification links, provide additional identity confirmation.</li>
            </ul>
            <p>FootprintIQ checks LinkedIn alongside 500+ platforms, connecting professional identities to personal accounts on other services.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Finding Profiles By Profile Information</h2>
            <p>LinkedIn is one of the easiest platforms to search because users intentionally make themselves discoverable for professional networking:</p>
            <ul>
              <li><strong>LinkedIn search.</strong> The platform's search supports queries by name, company, title, location, school, and industry. This is the most direct approach when you know someone's real name and at least one additional identifier.</li>
              <li><strong>Google site search.</strong> LinkedIn profiles are heavily indexed by Google. Searching <code>site:linkedin.com/in/ "First Last" "Company"</code> is often more effective than LinkedIn's own search, especially for users with privacy restrictions.</li>
              <li><strong>Company page employee lists.</strong> LinkedIn company pages list current employees. Browsing the employee list of a known employer can identify the target's profile.</li>
              <li><strong>Alumni search.</strong> LinkedIn's alumni tool allows searching for graduates of specific universities by year, degree, and current location — narrowing results when education history is known.</li>
              <li><strong>Group membership.</strong> LinkedIn groups organised around specific industries, locations, or interests list their members. Identifying relevant groups and browsing membership can surface target profiles.</li>
              <li><strong>Content engagement.</strong> Searching for the target's name in posts, comments, and article bylines can reveal their LinkedIn activity even if their profile is partially restricted.</li>
            </ul>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>OSINT Investigation Techniques</h2>
            <p>LinkedIn is uniquely valuable for OSINT because users voluntarily provide verified professional data. Key techniques include:</p>
            <ul>
              <li><strong>Employment verification.</strong> Cross-referencing LinkedIn employment history with company records, press releases, and other platforms can verify or disprove claimed professional relationships.</li>
              <li><strong>Geographic timeline construction.</strong> Work and education history with dates creates a geographic timeline showing where the individual has lived and worked. This is valuable for establishing presence in specific locations during specific periods.</li>
              <li><strong>Professional network mapping.</strong> Analysing connections, endorsements, and recommendations reveals professional relationships, reporting structures, and organisational hierarchies.</li>
              <li><strong>Skill and interest profiling.</strong> Listed skills, endorsed competencies, and followed companies create a detailed professional interest profile that can be cross-referenced with activity on other platforms.</li>
              <li><strong>Content analysis.</strong> Posts, articles, and comments on LinkedIn reveal professional opinions, industry knowledge, and communication style — useful for authorship attribution and identity correlation.</li>
              <li><strong>Profile URL analysis.</strong> Custom LinkedIn URLs often follow patterns that match usernames on other platforms. Even default URLs contain partial name information.</li>
              <li><strong>Cross-platform username pivoting.</strong> FootprintIQ's <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link> uses the LinkedIn handle as a search key across 500+ services.</li>
            </ul>
            <p>For a comprehensive guide, see our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques for username investigation</Link> guide.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Fake Profile Detection</h2>
            <p>LinkedIn fake profiles are increasingly sophisticated, often used for social engineering, corporate espionage, and recruitment scams:</p>
            <ul>
              <li><strong>AI-generated profile photos.</strong> Many fake LinkedIn profiles use AI-generated headshots. These can be detected by inconsistencies around earrings, background gradients, collar symmetry, and hair boundaries. Reverse-searching the image often returns no results for AI-generated photos.</li>
              <li><strong>Inconsistent employment history.</strong> Fake profiles may claim employment at real companies but with vague job titles, mismatched dates, or descriptions that don't align with the company's actual operations.</li>
              <li><strong>Connection patterns.</strong> Profiles with very few connections or connections concentrated in a single geographic region different from the claimed location are suspicious. Genuine professionals typically have diverse, industry-relevant connections.</li>
              <li><strong>Skills and endorsement anomalies.</strong> Fake profiles often have endorsements from other fake accounts, creating circular validation networks. Skills that don't align with claimed work history are another indicator.</li>
              <li><strong>Content engagement.</strong> Profiles with no posts, comments, or reactions despite claiming years of professional experience are more likely to be fabricated. Genuine professionals typically engage with their industry's content.</li>
              <li><strong>Education verification.</strong> Fake profiles may reference real universities but with degrees that the institution doesn't offer, or graduation dates that don't align with the claimed career timeline.</li>
            </ul>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Using FootprintIQ To Search Across Platforms</h2>
            <p>LinkedIn provides verified professional data, but the full picture emerges when combined with findings from other platforms:</p>
            <ul>
              <li><strong>Cross-platform enumeration.</strong> Enter a LinkedIn username and FootprintIQ checks the same handle across 500+ platforms. Professionals who maintain consistent personal brands often use matching handles across LinkedIn, GitHub, Twitter, and personal websites.</li>
              <li><strong>Professional-personal correlation.</strong> LinkedIn reveals the professional side of an identity. FootprintIQ combines this with personal accounts on social media, gaming platforms, and forums to build a comprehensive identity profile.</li>
              <li><strong>Profile metadata correlation.</strong> Names, profile images, and bio details from LinkedIn are compared against matched profiles on other platforms for identity verification.</li>
              <li><strong>Confidence scoring.</strong> Each result receives a confidence score based on multi-signal analysis to distinguish genuine identity matches from coincidental username overlaps.</li>
            </ul>
            <p>Start with a <Link to="/scan" className="text-primary hover:underline">free username scan</Link> to see what's publicly discoverable. You can also use our <Link to="/usernames" className="text-primary hover:underline">username search tool</Link>, run a <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link>, or check your full exposure with the <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint scanner</Link>.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-6">
                  <AccordionTrigger className="text-foreground font-medium text-left py-5">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <FinalCTA />
        <section className="py-12 bg-muted/10"><div className="max-w-3xl mx-auto px-6 space-y-8"><AboutFootprintIQBlock /></div></section>
      </main>
      <Footer />
    </>
  );
}
