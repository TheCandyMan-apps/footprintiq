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
import { Code } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Can you find someone on GitHub by username?", a: "Yes. GitHub profiles are publicly accessible at github.com/username. FootprintIQ checks GitHub alongside 500+ other platforms to identify cross-platform presence." },
  { q: "What does a GitHub profile reveal?", a: "Public GitHub profiles show repositories, commit histories, contribution graphs, follower/following lists, organisations, and bio information. Commit histories may also expose email addresses embedded in Git metadata." },
  { q: "Is it legal to search for someone on GitHub?", a: "Yes. GitHub profiles and public repositories are freely accessible. FootprintIQ only queries publicly available data." },
  { q: "Can you find someone's real name on GitHub?", a: "Many GitHub users display their real name in their profile. Additionally, Git commit metadata often contains real names and email addresses, even when the profile itself uses a pseudonym." },
  { q: "How do you detect fake GitHub accounts?", a: "Fake accounts typically have no repositories, no contribution history, recently created profiles, and may use generated usernames. Genuine developers usually have commit histories, starred repositories, and consistent coding activity over time." },
];

const canonical = "https://footprintiq.app/how-to-find-someone-on-github";

export default function HowToFindSomeoneOnGithub() {
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" }, { "@type": "ListItem", position: 2, name: "How To Find Someone On GitHub", item: canonical }] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", headline: "How To Find Someone On GitHub", description: "Learn how to find someone on GitHub using username searches, commit email extraction, and cross-platform OSINT techniques.", author: { "@type": "Organization", name: "FootprintIQ" }, publisher: { "@type": "Organization", name: "FootprintIQ" }, datePublished: "2026-03-07", dateModified: "2026-03-07", mainEntityOfPage: { "@type": "WebPage", "@id": canonical } };

  return (
    <>
      <Helmet>
        <title>How To Find Someone On GitHub – Developer Profile Search | FootprintIQ</title>
        <meta name="description" content="Find someone on GitHub by username. Search developer profiles, extract commit email addresses, and trace technical identities across platforms using ethical OSINT." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="How To Find Someone On GitHub – Developer Profile Search | FootprintIQ" />
        <meta property="og:description" content="Find someone on GitHub by username. Search developer profiles and trace technical identities." />
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
            <Badge variant="outline" className="mb-6 text-primary border-primary/30"><Code className="h-3 w-3 mr-1.5" />GitHub Investigation Guide</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">How To Find Someone On GitHub</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              GitHub is the world's largest code hosting platform and one of the most information-rich sources for OSINT on technical professionals. Learn how to find GitHub profiles, extract identity data from commit histories, and connect developer identities to broader digital footprints.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Searching By Username</h2>
            <p>GitHub profiles are publicly accessible at <code>github.com/username</code>. A public GitHub profile is remarkably data-rich compared to most social platforms:</p>
            <ul>
              <li><strong>Profile bio and details.</strong> GitHub profiles display the user's name (often real), location, employer, website, Twitter handle, and a bio. Many developers complete these fields truthfully because GitHub serves as a professional portfolio.</li>
              <li><strong>Public repositories.</strong> Every public repository reveals project names, descriptions, programming languages, commit histories, and collaborators. Repository names and descriptions often indicate the developer's professional focus and employer.</li>
              <li><strong>Contribution graph.</strong> The green-square contribution heatmap shows daily coding activity over the past year. Activity patterns reveal timezone (commits cluster during working hours), work schedule, and periods of inactivity.</li>
              <li><strong>Follower and following lists.</strong> These reveal professional networks, open-source community affiliations, and connections to specific organisations or projects.</li>
              <li><strong>Organisation memberships.</strong> Public organisation affiliations confirm employment relationships and community roles. Organisation pages list all public members.</li>
              <li><strong>Starred repositories.</strong> The list of repositories a user has starred reveals technology interests, tools they use, and projects they follow — creating a detailed technical interest profile.</li>
              <li><strong>Gists.</strong> Public code snippets (gists) may contain configuration files, scripts, or notes that reveal additional technical and personal details.</li>
            </ul>
            <p>FootprintIQ's <Link to="/search-github-username" className="text-primary hover:underline">GitHub username search</Link> checks the handle across 500+ platforms simultaneously, connecting the developer identity to accounts on other services.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Finding Profiles By Profile Information</h2>
            <p>GitHub's excellent indexing and transparent data model provide multiple pathways to locate someone without a known username:</p>
            <ul>
              <li><strong>GitHub search.</strong> The platform's search supports user queries by name, location, and other profile fields. Searching <code>type:user "John Smith" location:London</code> narrows results to matching profiles.</li>
              <li><strong>Google site search.</strong> Using <code>site:github.com "target name"</code> leverages Google's indexing to find profiles, repository contributions, and commit references that may not surface through GitHub's own search.</li>
              <li><strong>Commit email search.</strong> Git commits embed the author's email address. Appending <code>.patch</code> to any commit URL reveals the full commit metadata including the email. If you know someone's email, searching for it in commit messages or author fields can locate their GitHub activity.</li>
              <li><strong>Organisation pages.</strong> If you know someone's employer, checking the organisation's GitHub page reveals all public members, allowing identification of the target's account.</li>
              <li><strong>Repository contributor lists.</strong> If you know someone contributed to a specific open-source project, the contributor list reveals all accounts that have submitted code.</li>
              <li><strong>npm, PyPI, and package registry links.</strong> Published packages on registries like npm or PyPI often link to the author's GitHub profile, providing another discovery pathway for technical users.</li>
            </ul>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>OSINT Investigation Techniques</h2>
            <p>GitHub is arguably the most OSINT-rich platform for investigating technical professionals. Key techniques include:</p>
            <ul>
              <li><strong>Commit email extraction.</strong> Every Git commit contains an author email address. This email is publicly accessible in commit metadata and may be a personal email, work email, or university email that the developer inadvertently exposed. This is one of the highest-value OSINT signals on GitHub.</li>
              <li><strong>Commit message analysis.</strong> Commit messages may reference issue numbers, project codenames, client names, or internal tools that reveal the developer's employer, projects, and professional context.</li>
              <li><strong>Code content analysis.</strong> Repository code may contain API keys, configuration files with server addresses, database connection strings, comments with personal notes, or hardcoded email addresses — all of which provide additional intelligence.</li>
              <li><strong>Contribution timeline correlation.</strong> Cross-referencing GitHub activity with employment history (from LinkedIn) can verify work relationships. If someone claims to work at a company, their GitHub contributions to that company's repositories during the claimed period provide evidence.</li>
              <li><strong>Forked repository analysis.</strong> The repositories a developer has forked indicate projects they're interested in or contributing to, revealing technical stack preferences and professional focus areas.</li>
              <li><strong>Issue and pull request participation.</strong> Comments on issues and pull requests reveal communication style, expertise areas, and professional relationships with other developers.</li>
              <li><strong>SSH key fingerprint analysis.</strong> GitHub exposes users' SSH public keys at <code>github.com/username.keys</code>. While not directly identifying, these keys can be cross-referenced with other services that accept the same SSH key.</li>
            </ul>
            <p>For a comprehensive guide, see our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques for username investigation</Link> guide. You can also run a <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link> to trace connected accounts.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Fake Profile Detection</h2>
            <p>GitHub's focus on code contributions makes fake profile detection straightforward for experienced investigators:</p>
            <ul>
              <li><strong>Empty contribution graph.</strong> Genuine developers have commit histories. Accounts with no contributions, no repositories, and no activity are likely placeholder or fake accounts.</li>
              <li><strong>Forked-only repositories.</strong> Accounts that only fork repositories without making any commits to them suggest automated or low-effort accounts rather than active developers.</li>
              <li><strong>Profile completeness.</strong> Real developers typically complete their profile with name, location, and bio. Bare profiles with generic avatars and no identifying information warrant scrutiny.</li>
              <li><strong>Contribution authenticity.</strong> Some accounts inflate their contribution graph using automated commits to empty repositories. Examining the actual content of contributions — whether they're meaningful code changes or trivial additions — reveals authenticity.</li>
              <li><strong>Star and follower ratios.</strong> Accounts with many followers but no repositories or contributions may have used follower exchange services. Similarly, repositories with suspiciously high star counts relative to their content quality may use star-farming bots.</li>
            </ul>
            <p>FootprintIQ's confidence scoring helps assess whether a GitHub username match represents the same individual found on other platforms by analysing multi-signal consistency.</p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Using FootprintIQ To Search Across Platforms</h2>
            <p>GitHub identities often connect to a broad professional and social presence. FootprintIQ maps these connections comprehensively:</p>
            <ul>
              <li><strong>Cross-platform enumeration.</strong> Enter a GitHub handle and FootprintIQ checks the same username across 500+ platforms. Developers who use "codesmith_dev" on GitHub frequently maintain the same handle on Stack Overflow, Twitter, and personal blogs.</li>
              <li><strong>Profile link extraction.</strong> Website, Twitter, and organisation links from GitHub profiles are cross-referenced with discovered profiles for identity verification.</li>
              <li><strong>Commit email correlation.</strong> Email addresses extracted from Git commits can be used for additional searches across platforms that use email-based registration.</li>
              <li><strong>Confidence scoring.</strong> Each result receives a confidence score based on multi-signal analysis — profile consistency, metadata matching, and cross-platform presence patterns.</li>
              <li><strong>Investigation workflows.</strong> Results can be exported and integrated into broader cases with full documentation for professional use.</li>
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
