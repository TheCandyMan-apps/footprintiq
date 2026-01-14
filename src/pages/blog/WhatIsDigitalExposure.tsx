import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function WhatIsDigitalExposure() {
  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      {
        "@type": "ListItem" as const,
        position: 1,
        name: "Home",
        item: "https://footprintiq.app"
      },
      {
        "@type": "ListItem" as const,
        position: 2,
        name: "Blog",
        item: "https://footprintiq.app/blog"
      },
      {
        "@type": "ListItem" as const,
        position: 3,
        name: "What Is Digital Exposure?"
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    articleSection: "Educational",
    headline: "What Is Digital Exposure?",
    description: "Understand what digital exposure means, how it differs from a data breach, and why knowing your online visibility matters.",
    image: "https://footprintiq.app/blog-images/digital-exposure.webp",
    datePublished: "2026-01-11T11:00:00Z",
    dateModified: "2026-01-11T11:00:00Z",
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    keywords: "digital exposure, online visibility, public data, digital footprint",
    about: [
      { "@type": "Thing", name: "Digital exposure" },
      { "@type": "Thing", name: "Online visibility" },
      { "@type": "Thing", name: "Public data" }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO 
        title="What Is Digital Exposure?"
        description="Understand what digital exposure means, how it differs from a data breach, and why knowing your online visibility matters."
        canonical="https://footprintiq.app/blog/what-is-digital-exposure"
        ogImage="https://footprintiq.app/blog-images/digital-exposure.webp"
        article={{
          publishedTime: "2026-01-11T11:00:00Z",
          modifiedTime: "2026-01-11T11:00:00Z",
          author: "FootprintIQ",
          tags: ["Digital Exposure", "Privacy", "Online Visibility", "Digital Footprint"]
        }}
        schema={{
          organization: organizationSchema,
          breadcrumbs: breadcrumbs,
          custom: articleSchema
        }}
      />
      <Header />
      
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Back Link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Header Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Foundational</Badge>
            <Badge variant="outline">Privacy</Badge>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            What Is Digital Exposure?
          </h1>

          {/* Gradient Divider */}
          <div className="h-1 w-24 bg-gradient-to-r from-primary via-primary-glow to-accent rounded-full mb-8"></div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border
            prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-primary
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base prose-p:my-4
            prose-ul:my-6 prose-ol:my-6
            prose-li:text-muted-foreground prose-li:my-2 prose-li:leading-relaxed
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline">
            
            <p className="text-xl leading-relaxed !text-foreground/80 !my-8">
              Digital exposure refers to the information about you that exists online and 
              can be discovered, connected, or interpreted by others. It's a way of 
              understanding your visibility across the internet — not as a single event, 
              but as an ongoing pattern shaped by time and activity.
            </p>

            <h2>Exposure Is About Visibility</h2>
            
            <p>
              At its simplest, digital exposure describes what can be seen about you online. 
              This includes profiles you've created, accounts you've registered, information 
              that appears in public records, and data that has been collected or shared 
              about you over time.
            </p>
            
            <p>
              Some of this information you shared intentionally — a social media profile, 
              a professional bio, or a forum account. Other pieces may exist without your 
              direct involvement, such as mentions by others or data held by third parties.
            </p>

            <p>
              Understanding exposure means looking at what's actually accessible, rather 
              than what you assume or intend to be visible.
            </p>

            <h2>How Exposure Differs from a Breach</h2>
            
            <p>
              Digital exposure is distinct from a data breach. A breach is an event — a 
              specific incident where protected information is accessed without authorisation. 
              Exposure, by contrast, describes an ongoing state of visibility.
            </p>

            <p>
              Information can be exposed without ever being breached. A public social media 
              profile, an old forum post, or a professional directory listing are all forms 
              of exposure, but they don't involve any security failure.
            </p>

            <p>
              Conversely, breached data can contribute to your overall exposure. If your 
              email address appears in a leaked database, that becomes part of your 
              discoverable digital presence.
            </p>

            <h2>Patterns Across Platforms</h2>
            
            <p>
              Exposure becomes more significant when information connects across platforms. 
              A username used on multiple sites, an email address registered with many 
              services, or a phone number linked to various accounts — each creates a 
              thread that can be followed.
            </p>

            <p>
              These patterns aren't inherently problematic. They're simply how modern 
              online identity works. But understanding that these connections exist helps 
              explain how separate pieces of information can combine into a larger picture.
            </p>

            <p>
              <Link to="/blog/username-reuse" className="text-primary hover:underline">Username reuse across platforms</Link> is 
              one common example of how these patterns form and persist over time.
            </p>

            <h2>Persistence Over Time</h2>
            
            <p>
              One characteristic of digital exposure is its persistence. Information posted 
              years ago may still be accessible. Accounts you've forgotten continue to exist. 
              Cached versions of pages survive after the original is deleted.
            </p>

            <p>
              This persistence means that exposure is cumulative. Your current digital 
              presence includes not just recent activity, but the accumulated traces of 
              years of online participation.
            </p>

            <p>
              Understanding this helps explain why exposure isn't something that can be 
              fully controlled in a single action. It's a reflection of your entire 
              history of online activity.
            </p>

            <h2>Public vs. Private Information</h2>
            
            <p>
              Digital exposure primarily concerns information that is publicly accessible. 
              This is distinct from private data held by companies, which is protected by 
              terms of service, security measures, and regulations.
            </p>

            <p>
              However, the line between public and private isn't always clear. Information 
              you shared in a semi-private context — a small forum, a limited group, or a 
              now-defunct platform — may become more visible over time as contexts change.
            </p>

            <p>
              Similarly, information you consider private may be discoverable through 
              inference. Two pieces of public data, when combined, can reveal something 
              that neither would expose on its own.
            </p>

            <h2>Context and Interpretation</h2>
            
            <p>
              Raw exposure data tells only part of the story. The meaning of that data 
              depends on context — who is looking, why they're looking, and what they 
              already know.
            </p>

            <p>
              A professional network profile is meant to be found by recruiters and 
              colleagues. A gaming handle is intended for other players. When these 
              contexts mix — when a recruiter finds your gaming profile through a shared 
              username — the interpretation changes.
            </p>

            <p>
              Understanding exposure includes understanding how information might be 
              perceived in contexts different from where it was originally shared.
            </p>

            <h2>Awareness, Not Alarm</h2>
            
            <p>
              Learning about digital exposure isn't meant to create anxiety. Most people 
              have a digital presence, and that's a normal part of modern life. The goal 
              is awareness — understanding what exists and making informed choices about 
              how you engage online.
            </p>

            <p>
              Some exposure is intentional and valuable. Professionals benefit from being 
              findable. Creators build audiences through visibility. Community members 
              participate openly in shared spaces.
            </p>

            <p>
              The question isn't whether you have digital exposure — you almost certainly 
              do — but whether that exposure reflects your intentions and serves your goals.
            </p>

            <h2>Taking Stock of Your Exposure</h2>
            
            <p>
              Understanding your digital exposure starts with knowing what's out there. 
              This might include reviewing your known accounts, searching for your common 
              identifiers, and checking whether your information appears in any public databases.
            </p>

            <p>
              <Link to="/blog/free-username-search" className="text-primary hover:underline">Free username search tools</Link> provide 
              one starting point, though they capture only part of the picture. A fuller 
              understanding requires looking at multiple dimensions — usernames, email 
              addresses, phone numbers, and other identifiers.
            </p>

            <p>
              From there, you can decide what, if anything, you want to change. Some 
              people choose to consolidate their presence around a consistent identity. 
              Others prefer to maintain separation between different areas of their life. 
              Both approaches are valid.
            </p>
          </div>

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 rounded-3xl border-2 border-primary/20">
            <h3 className="text-2xl font-bold mb-3">See your exposure in context</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Our Exposure Score scan examines your public identifiers across multiple 
              dimensions — providing a structured view of your online visibility.
            </p>
            <Button asChild size="lg" className="font-semibold">
              <Link to="/scan">Run Exposure Score Scan</Link>
            </Button>
          </div>

          {/* Related Articles */}
          <div className="mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/blog/username-reuse" className="group">
                <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                  <Badge className="mb-3 bg-primary/10 text-primary">Related</Badge>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Why Username Reuse Creates Digital Exposure</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn how using the same username across platforms affects your visibility.
                  </p>
                </Card>
              </Link>
              <Link to="/blog/free-username-search" className="group">
                <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                  <Badge className="mb-3 bg-primary/10 text-primary">Practical</Badge>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Free Username Search: What It Shows — and What It Misses</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand what username search tools reveal and their limitations.
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}
