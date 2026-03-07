import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { EthicalOsintTrustBlock } from "@/components/EthicalOsintTrustBlock";
import { FinalCTA } from "@/components/FinalCTA";
import { Badge } from "@/components/ui/badge";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Can you find someone using just a photo?", a: "In some cases, yes. Reverse image search engines can match a photo against indexed images across the web, identifying where the same image appears. However, this technique has significant limitations — it works best with exact or near-exact matches and is less reliable with modified or low-resolution images." },
  { q: "Is reverse image search legal?", a: "Yes. Reverse image search queries publicly indexed images — the same content available through regular search engines. It does not access private accounts or protected content." },
  { q: "What tools are available for photo-based investigation?", a: "Google Images, TinEye, and Yandex Images are the most widely used reverse image search engines. Specialised tools like PimEyes search specifically for facial matches, though their use raises significant ethical considerations." },
  { q: "Can FootprintIQ search by photo?", a: "FootprintIQ specialises in username, email, and phone number-based OSINT. For photo-based investigation, we recommend combining reverse image search tools with FootprintIQ's cross-platform username enumeration for the most comprehensive results." },
  { q: "How accurate is reverse image search?", a: "Accuracy depends on the image's uniqueness and indexing. Exact matches are highly reliable. Modified, cropped, or compressed images may not return results. AI-generated or heavily filtered photos are particularly challenging for current reverse image search technology." },
];

export default function FindSomeoneByPhoto() {
  const canonical = "https://footprintiq.app/find-someone-by-photo";
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" }, { "@type": "ListItem", position: 2, name: "Find Someone By Photo", item: canonical }] };

  return (
    <>
      <Helmet>
        <title>Find Someone By Photo – Reverse Image Search Guide | FootprintIQ</title>
        <meta name="description" content="Learn how to find someone by photo using reverse image search and OSINT techniques. Understand the tools, limitations, and ethical considerations." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Find Someone By Photo – Reverse Image Search Guide | FootprintIQ" />
        <meta property="og:description" content="Learn how to find someone by photo using reverse image search and OSINT techniques." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30"><Camera className="h-3 w-3 mr-1.5" />Photo-Based Investigation</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">How To Find Someone Online Using Their Photo</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Reverse image search and photo-based OSINT techniques can help identify where an image appears online, verify identities, and detect impersonation. Learn how these tools work — and their important limitations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg"><Link to="/scan">Try Username Search Instead</Link></Button>
              <Button asChild variant="outline" size="lg"><Link to="/comparisons/pimeyes">PimEyes Alternatives</Link></Button>
            </div>
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Reverse Image Search Works</h2>
            <p>Reverse image search engines take an image as input and return web pages where the same or visually similar images appear. The underlying technology uses perceptual hashing and computer vision to match images regardless of minor modifications like resizing, cropping, or compression.</p>
            <p>The major reverse image search engines include:</p>
            <ul>
              <li><strong>Google Images.</strong> The most comprehensive index, covering billions of web pages. Best for finding where an exact image appears online, including social media profiles, news articles, and websites.</li>
              <li><strong>TinEye.</strong> Specialises in exact and near-exact image matching with a focus on copyright and attribution. Useful for tracking image provenance and detecting unauthorised usage.</li>
              <li><strong>Yandex Images.</strong> Particularly strong for Eastern European and Russian-language content. Often returns results that Google misses, especially for social media profile photos.</li>
              <li><strong>Bing Visual Search.</strong> Microsoft's image search with good coverage of Western social media and news sources.</li>
            </ul>
            <p>Each engine has different strengths and indexing coverage. Professional investigators typically query multiple engines for comprehensive results.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>When Photo-Based Investigation Is Useful</h2>
            <p>Photo-based OSINT is most effective in specific scenarios:</p>
            <ul>
              <li><strong>Catfish and impersonation detection.</strong> Reverse image search can reveal when a profile photo is stolen from another person's social media, a stock photo site, or a public figure's account.</li>
              <li><strong>Verifying identity claims.</strong> When someone claims to be a specific person, reverse image search can confirm or refute whether the photo they're using actually belongs to that individual.</li>
              <li><strong>Tracking image distribution.</strong> Understanding where a specific image has been shared, reposted, or repurposed across the web.</li>
              <li><strong>Linking profiles.</strong> When the same unique profile photo appears on multiple platforms, it provides strong evidence that the accounts belong to the same person.</li>
              <li><strong>EXIF data analysis.</strong> Photos may contain embedded metadata — camera model, GPS coordinates, timestamps — that provide intelligence beyond the visual content.</li>
            </ul>
            <p>However, photo-based search has significant limitations. It cannot identify individuals from new or unique photos, works poorly with heavily filtered or AI-generated images, and raises serious ethical concerns when used for facial recognition purposes.</p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Combining Photo Search With Username OSINT</h2>
            <p>The most effective approach combines photo-based investigation with username and email OSINT:</p>
            <ol>
              <li><strong>Start with what you have.</strong> If you have a photo, run reverse image searches to identify associated profiles and usernames.</li>
              <li><strong>Pivot to username search.</strong> Once you have a username from a matched profile, enter it into FootprintIQ to enumerate the same handle across 500+ platforms.</li>
              <li><strong>Cross-reference profile photos.</strong> Compare profile photos across matched platforms. FootprintIQ's confidence scoring uses perceptual image hashing to detect matching photos automatically.</li>
              <li><strong>Expand with email pivots.</strong> If any discovered profile reveals an email address, use FootprintIQ's <Link to="/email-breach-check" className="text-primary hover:underline">email breach check</Link> to find additional accounts and breach history.</li>
            </ol>
            <p>This multi-modal approach — combining photo, username, and email intelligence — produces significantly more comprehensive results than any single technique alone. For a comparison of visual search tools, see our <Link to="/comparisons/pimeyes" className="text-primary hover:underline">PimEyes alternatives</Link> guide.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Ethical Considerations For Photo-Based OSINT</h2>
            <p>Photo-based investigation carries heightened ethical responsibilities compared to username or email searches:</p>
            <ul>
              <li><strong>Consent and proportionality.</strong> Facial recognition technology raises serious privacy concerns. The scope of any photo-based investigation should be proportional to its legitimate purpose — catfish detection and self-audit are very different from surveillance.</li>
              <li><strong>No harassment or doxxing.</strong> Photo-based OSINT should never be used to identify, locate, or harass individuals. This is a firm ethical boundary.</li>
              <li><strong>Accuracy limitations.</strong> Visual similarity does not guarantee identity. False positives — especially with common-looking photos — can lead to incorrect identifications with real consequences.</li>
              <li><strong>Legal considerations.</strong> Some jurisdictions regulate facial recognition technology and biometric data processing. Ensure compliance with applicable privacy laws.</li>
            </ul>
            <p>FootprintIQ's approach prioritises username and email-based investigation, which are more accurate and carry fewer ethical concerns than facial recognition. See our <Link to="/ethical-osint" className="text-primary hover:underline">Ethical OSINT Charter</Link>.</p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
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
