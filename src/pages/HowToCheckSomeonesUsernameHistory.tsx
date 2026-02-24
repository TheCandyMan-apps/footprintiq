import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { History, Search, Layers, CheckCircle, AlertTriangle, Shield, Eye } from "lucide-react";

const origin = "https://footprintiq.app";

export default function HowToCheckSomeonesUsernameHistory() {
  const faqData = [
    { q: "Can you see someone's old usernames?", a: "You can sometimes find old usernames through cached web pages, archived profiles, and cross-platform OSINT scans. Platforms rarely expose username change history publicly, but digital traces often remain." },
    { q: "Is it legal to search for someone's username history?", a: "Yes, searching publicly available data is legal in most jurisdictions. Ethical OSINT only analyses information that's already publicly accessible — it doesn't bypass privacy settings or access private accounts." },
    { q: "What tools can check username history?", a: "OSINT tools like FootprintIQ scan 500+ platforms to find where a username currently exists. Combined with web archive services, you can sometimes trace how a username has been used over time." },
    { q: "Why would someone change their username?", a: "People change usernames for many reasons: rebranding, privacy, separating personal and professional identities, or — in some cases — to distance themselves from problematic past behaviour." },
    { q: "Can deleted accounts still be found?", a: "Sometimes. Cached pages, web archives, and mentions on other sites can preserve references to deleted accounts. However, this data becomes less reliable over time." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>How to Check Someone's Username History (Ethical OSINT Guide) | FootprintIQ</title>
        <meta name="description" content="Learn how to check username history across platforms using ethical OSINT methods. Understand what's possible, what's legal, and how username changes leave digital traces." />
        <link rel="canonical" href={`${origin}/how-to-check-someones-username-history`} />
      </Helmet>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Article",
            "headline": "How to Check Someone's Username History (Ethical OSINT Guide)",
            "description": "Learn how to check username history across platforms using ethical OSINT methods.",
            "author": { "@type": "Organization", "name": "FootprintIQ", "url": origin },
            "publisher": { "@type": "Organization", "name": "FootprintIQ", "url": origin },
            "datePublished": "2026-02-24",
            "dateModified": "2026-02-24",
            "mainEntityOfPage": `${origin}/how-to-check-someones-username-history`,
          },
          {
            "@type": "FAQPage",
            "mainEntity": faqData.map(f => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": { "@type": "Answer", "text": f.a },
            })),
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": origin },
              { "@type": "ListItem", "position": 2, "name": "Username History Guide", "item": `${origin}/how-to-check-someones-username-history` },
            ],
          },
        ],
      }} />

      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <History className="w-4 h-4" /> Username Intelligence
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            How to Check Someone's Username History
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Usernames change, but digital traces don't always disappear. Learn how ethical OSINT can reveal username patterns, cross-platform presence, and identity consistency.
          </p>
        </div>
      </section>

      <main className="container max-w-4xl mx-auto px-4 py-12 space-y-14">

        {/* Section 1 */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Why Username History Matters</h2>
          <p className="text-muted-foreground mb-4">
            A username is one of the most persistent identifiers on the internet. Unlike email addresses or phone numbers, usernames are publicly visible on most platforms, creating a traceable thread that connects accounts across the web.
          </p>
          <p className="text-muted-foreground mb-4">
            When someone changes their username — whether for rebranding, privacy, or evasion — the old username often leaves traces: cached search results, mentions by other users, archived forum posts, and platform-specific URL patterns that retain the original handle.
          </p>
          <p className="text-muted-foreground">
            Understanding username history is valuable for self-audit (discovering your own forgotten accounts), verification (confirming someone's identity consistency), and security assessment (identifying credential reuse patterns).
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">What's Actually Possible</h2>
          <p className="text-muted-foreground mb-4">
            Let's be clear about capabilities and limitations. Ethical OSINT can reveal a great deal, but it has boundaries.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-5 bg-card">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-primary" /> What You Can Find
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Current username presence across 500+ platforms</li>
                <li>• Cached versions of profiles via web archives</li>
                <li>• Mentions of old usernames in public posts</li>
                <li>• Username patterns suggesting identity links</li>
                <li>• Account creation dates on some platforms</li>
                <li>• Forum posts preserved under old handles</li>
              </ul>
            </div>
            <div className="border border-border rounded-lg p-5 bg-card">
              <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-destructive" /> What You Can't Find
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Platform-internal username change logs</li>
                <li>• Private account content or DMs</li>
                <li>• Usernames behind authentication walls</li>
                <li>• Deliberately scrubbed or GDPR-removed data</li>
                <li>• Accounts on closed or invite-only platforms</li>
                <li>• Usernames that were never publicly indexed</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3 – Methods */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Methods for Checking Username History</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" /> 1. Cross-Platform Username Scanning
              </h3>
              <p className="text-muted-foreground text-sm">
                The most straightforward approach. Tools like FootprintIQ scan 500+ platforms to check if a username currently exists, revealing the breadth of someone's online presence. If a username appears on 15 platforms, that's a significant footprint. If it appears on only one recently created dating profile, that's a potential red flag.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> 2. Web Archive Analysis
              </h3>
              <p className="text-muted-foreground text-sm">
                Services like the Wayback Machine capture snapshots of web pages over time. If a profile URL contained a username, older snapshots may show previous versions of that profile or confirm that a different username was associated with the same account URL.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> 3. Search Engine Cache & Indexing
              </h3>
              <p className="text-muted-foreground text-sm">
                Google and other search engines cache pages and may retain references to old usernames in snippets, titles, or URLs even after the live page has changed. Searching "site:twitter.com old_username" can sometimes reveal cached references.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> 4. Cross-Reference with Breach Data
              </h3>
              <p className="text-muted-foreground text-sm">
                Email addresses linked to breached databases may have been associated with different usernames across services. This correlation — when done ethically and for self-audit purposes — can reveal username history tied to a specific email.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 – Ethical Boundaries */}
        <section className="bg-muted/30 border border-border rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ethical & Legal Boundaries</h2>
          <p className="text-muted-foreground mb-4">
            Checking username history is legal when you're analysing publicly available data. However, ethical practice requires clear boundaries:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <strong className="text-foreground">Self-audit is the primary use case.</strong> Check your own username history to find and secure forgotten accounts.</li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <strong className="text-foreground">Verification is appropriate with consent.</strong> Checking someone's username consistency before a business or personal relationship is reasonable.</li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <strong className="text-foreground">Harassment is never acceptable.</strong> Using username history to stalk, doxx, or harass someone is illegal and unethical.</li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <strong className="text-foreground">Context matters.</strong> A username appearing on a platform doesn't prove identity. Always cross-validate before drawing conclusions.</li>
          </ul>
        </section>

        {/* Section 5 – Username Patterns */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Common Username Patterns to Watch For</h2>
          <p className="text-muted-foreground mb-4">
            Understanding how people typically create usernames helps identify connections and potential risks:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { pattern: "firstname_lastname", risk: "High identifiability — directly links to real identity" },
              { pattern: "handle + birth year", risk: "Common pattern that reveals age and identity clues" },
              { pattern: "Same handle everywhere", risk: "Maximum cross-platform traceability" },
              { pattern: "Random character strings", risk: "Harder to trace but may indicate throwaway accounts" },
              { pattern: "Brand or persona name", risk: "Professional use — usually intentionally public" },
              { pattern: "Variations with numbers", risk: "Suggests the base username was taken — look for the original" },
            ].map((item, i) => (
              <div key={i} className="border border-border rounded-lg p-3">
                <code className="text-xs text-primary font-mono">{item.pattern}</code>
                <p className="text-xs text-muted-foreground mt-1">{item.risk}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live Exposure Example */}
        <section className="border border-border rounded-xl overflow-hidden">
          <div className="bg-muted/50 px-6 py-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">What Happens When We Test a Common Username?</h2>
            <p className="text-sm text-muted-foreground mt-1">We scanned the username <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">alex.morgan92</code> across 500+ platforms. Here's what was found:</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { value: "7", label: "Public platform matches detected", color: "text-primary" },
                { value: "2", label: "Reused across social & dating platforms", color: "text-yellow-600" },
                { value: "1", label: "Indexed data broker reference", color: "text-destructive" },
                { value: "3", label: "Inactive legacy profiles", color: "text-muted-foreground" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              When the same username appears on both social media and dating platforms, scammers can cross-reference profile photos, bios, and location data to build a convincing fake identity — or to target you with personalised phishing. A single reused username creates a correlation chain that links your accounts together, making impersonation and social engineering significantly easier.
            </p>
            <div className="flex justify-center pt-2">
              <Button asChild size="lg">
                <Link to="/scan">Run Your Free Exposure Scan</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Blurred Identity Risk Score Preview */}
        <section className="relative border border-border rounded-xl p-6 md:p-8 overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-md bg-background/60 z-10 flex flex-col items-center justify-center">
            <Shield className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">Identity Risk Score</p>
            <p className="text-xs text-muted-foreground mb-4">Unlock full report in Pro</p>
            <Button asChild size="sm" variant="outline">
              <Link to="/pricing">Upgrade to Pro</Link>
            </Button>
          </div>
          <div className="select-none" aria-hidden="true">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Identity Risk Score</h3>
              <span className="text-3xl font-bold text-yellow-500">54</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mb-4">
              <div className="bg-gradient-to-r from-destructive via-yellow-500 to-primary h-3 rounded-full" style={{ width: "54%" }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
              <div className="bg-muted/50 rounded p-2"><div className="font-bold text-foreground">7</div>Exposures</div>
              <div className="bg-muted/50 rounded p-2"><div className="font-bold text-foreground">2</div>Breaches</div>
              <div className="bg-muted/50 rounded p-2"><div className="font-bold text-foreground">1</div>Broker</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Check Username Presence Now</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Scan a username across 500+ platforms to see where it currently appears. Understand your — or someone else's — digital footprint in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/scan">Run Username Scan</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/pricing">See Pro Features</Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <section className="border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Related Resources</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="ghost" size="sm"><Link to="/check-username-across-platforms">Check Username Across Platforms</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/username-reuse-risk">Username Reuse Risk</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/reverse-username-search">Reverse Username Search</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/verify-someone-online">Verify Someone Online</Link></Button>
          </div>
        </section>
      </main>
    </div>
  );
}
