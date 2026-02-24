import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Heart, AlertTriangle, Shield, Search, CheckCircle, XCircle, Eye } from "lucide-react";

const origin = "https://footprintiq.app";

export default function RomanceScamWarningSigns() {
  const faqData = [
    { q: "How do romance scams typically start?", a: "Romance scams usually begin on dating apps, social media, or messaging platforms. Scammers create attractive fake profiles, build emotional connections quickly, and eventually request money or personal information." },
    { q: "What are the biggest red flags in online dating?", a: "Key red flags include refusing video calls, professing love unusually fast, claiming to be overseas military or oil rig workers, and asking for money via gift cards or cryptocurrency." },
    { q: "Can OSINT tools help detect romance scams?", a: "Yes. Ethical OSINT tools can check if a username appears across multiple platforms, verify profile photo authenticity, and identify inconsistencies that suggest a fake identity." },
    { q: "How much money do romance scam victims lose?", a: "According to the FTC, romance scam losses exceeded $1.3 billion in 2023 in the US alone. Individual losses can range from hundreds to hundreds of thousands of pounds." },
    { q: "Should I report a suspected romance scammer?", a: "Yes. Report to the platform where you met them, to Action Fraud (UK) or the FTC (US), and to your bank if you sent money. Reporting helps protect other potential victims." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Romance Scam Warning Signs – How to Spot Fake Profiles Online | FootprintIQ</title>
        <meta name="description" content="Learn the warning signs of romance scams, how to spot fake dating profiles, and how ethical OSINT tools can help you verify someone's identity before it's too late." />
        <link rel="canonical" href={`${origin}/romance-scam-warning-signs`} />
      </Helmet>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Article",
            "headline": "Romance Scam Warning Signs – How to Spot Fake Profiles Online",
            "description": "Learn the warning signs of romance scams, how to spot fake dating profiles, and how ethical OSINT tools can help you verify someone's identity.",
            "author": { "@type": "Organization", "name": "FootprintIQ", "url": origin },
            "publisher": { "@type": "Organization", "name": "FootprintIQ", "url": origin },
            "datePublished": "2026-02-24",
            "dateModified": "2026-02-24",
            "mainEntityOfPage": `${origin}/romance-scam-warning-signs`,
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
              { "@type": "ListItem", "position": 2, "name": "Romance Scam Warning Signs", "item": `${origin}/romance-scam-warning-signs` },
            ],
          },
        ],
      }} />

      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-destructive/5 to-background">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" /> Romance Scam Prevention
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Romance Scam Warning Signs
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Online romance scams cost victims billions each year. Learn how to recognise the red flags, verify identities ethically, and protect yourself from emotional and financial exploitation.
          </p>
        </div>
      </section>

      <main className="container max-w-4xl mx-auto px-4 py-12 space-y-14">

        {/* Section 1 */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">How Romance Scams Work</h2>
          <p className="text-muted-foreground mb-4">
            Romance scams follow a predictable pattern. Scammers create fake profiles using stolen photos and fabricated backgrounds. They target people on dating apps, social media, and even gaming platforms. Once contact is established, they invest weeks or months building emotional trust before making financial requests.
          </p>
          <p className="text-muted-foreground mb-4">
            The psychology is deliberate: scammers mirror your interests, create urgency through fabricated crises, and isolate victims from friends and family who might recognise the deception. Understanding this pattern is the first step to protecting yourself.
          </p>
          <p className="text-muted-foreground">
            According to the FTC, romance scams are among the most financially damaging forms of consumer fraud, with reported losses exceeding $1.3 billion in 2023 alone — and many cases go unreported.
          </p>
        </section>

        {/* Section 2 – Red Flags */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">The Top Warning Signs</h2>
          <p className="text-muted-foreground mb-6">
            Not every online connection is a scam, but certain patterns consistently appear in fraudulent profiles. Watch for these red flags:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: XCircle, title: "Refuses Video Calls", desc: "Always has an excuse — bad connection, broken camera, working remotely. A genuine person will eventually show their face." },
              { icon: Heart, title: "Love-Bombs Quickly", desc: "Professes deep love within days or weeks. Genuine relationships develop gradually; scammers manufacture intensity." },
              { icon: AlertTriangle, title: "Fabricated Emergencies", desc: "Sudden hospital bills, stranded abroad, military deployment. These crises always lead to a request for money." },
              { icon: XCircle, title: "Avoids Meeting", desc: "Plans to meet always fall through. They cancel last-minute or create new obstacles that require financial help." },
              { icon: Shield, title: "Asks for Unusual Payment", desc: "Gift cards, cryptocurrency, or wire transfers — untraceable methods that legitimate partners would never request." },
              { icon: Eye, title: "Inconsistent Story Details", desc: "Names, ages, locations, or job details change between conversations. Scammers juggle multiple victims and lose track." },
            ].map((flag, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-lg border border-border bg-card">
                <flag.icon className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{flag.title}</h3>
                  <p className="text-muted-foreground text-sm">{flag.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 – Profile Analysis */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">How to Analyse a Suspicious Profile</h2>
          <p className="text-muted-foreground mb-4">
            Before emotionally investing in someone you've met online, take simple verification steps. These don't require technical expertise and can save you from significant harm.
          </p>
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
            <li><strong className="text-foreground">Reverse-search their profile photos.</strong> Use image search tools to check if photos appear elsewhere online, often stolen from models or public Instagram accounts.</li>
            <li><strong className="text-foreground">Check their username across platforms.</strong> A legitimate person usually has a consistent online presence. Scammers often create single-use profiles with no history.</li>
            <li><strong className="text-foreground">Verify their claimed profession.</strong> If they claim to be a doctor, soldier, or engineer, look for professional profiles on LinkedIn or industry directories.</li>
            <li><strong className="text-foreground">Look for age and location consistency.</strong> Cross-reference what they've told you with what their profile metadata and writing style suggest.</li>
            <li><strong className="text-foreground">Ask specific questions.</strong> Genuine people can provide verifiable details about their daily life. Scammers give vague, evasive, or contradictory answers.</li>
          </ol>
        </section>

        {/* Section 4 – OSINT Signals */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">What Ethical OSINT Can Reveal</h2>
          <p className="text-muted-foreground mb-4">
            Ethical OSINT tools analyse publicly available data to identify patterns that suggest fraud. This isn't surveillance — it's self-protection using information that's already public.
          </p>
          <div className="bg-muted/30 border border-border rounded-lg p-6 space-y-3">
            {[
              "Whether a username exists across multiple legitimate platforms",
              "Account creation dates that suggest recently fabricated profiles",
              "Inconsistencies between claimed identity and public records",
              "Email addresses linked to known breach databases",
              "Phone numbers associated with VoIP services commonly used by scammers",
              "Social media activity patterns that don't match claimed lifestyle",
            ].map((signal, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{signal}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            FootprintIQ scans 500+ platforms to check username presence, email breach exposure, and cross-platform correlation — all using ethical, consent-first methodology.
          </p>
        </section>

        {/* Section 5 – Case Example */}
        <section className="bg-card border border-border rounded-xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Case Example: The "Military Officer" Pattern</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-3">
            A user ran a username scan on someone claiming to be a US Army captain stationed overseas. The scan revealed the username existed only on one dating site — no LinkedIn, no Facebook, no military forums. The profile photo was traced to a stock photography site.
          </p>
          <p className="text-muted-foreground text-sm mb-3">
            The email address provided had appeared in three breach databases under a different name. The phone number was registered to a VoIP service, not a mobile carrier.
          </p>
          <p className="text-sm font-medium text-foreground">
            Result: Multiple red flags confirmed the profile was fabricated. The user avoided sending £3,000 for a "flight home."
          </p>
        </section>

        {/* Section 6 – Protection */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">How to Protect Yourself</h2>
          <p className="text-muted-foreground mb-4">
            Prevention is always better than recovery. Follow these practices when engaging with people online:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span>Never send money to someone you haven't met in person, regardless of the story.</span></li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span>Insist on video calls early in the relationship. Repeated refusals are a strong red flag.</span></li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span>Talk to trusted friends or family about new online relationships — scammers rely on secrecy.</span></li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span>Run a quick username or email check before emotional investment deepens.</span></li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span>Be sceptical of anyone who moves the conversation off the dating platform immediately.</span></li>
            <li className="flex items-start gap-2"><Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span>Report suspected scammers to the platform and to <a href="https://www.actionfraud.police.uk" target="_blank" rel="noopener noreferrer" className="text-primary underline">Action Fraud</a> (UK) or <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" className="text-primary underline">FTC</a> (US).</span></li>
          </ul>
        </section>

        {/* CTA */}
        <section className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Verify Before You Trust</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Run a free username scan to check if someone's profile is consistent across platforms. Protect yourself with facts, not assumptions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/scan">Run Free Username Scan</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/pricing">Compare Free vs Pro</Link>
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
            <Button asChild variant="ghost" size="sm"><Link to="/verify-someone-online">Verify Someone Online</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/check-if-someone-is-a-scammer">Check If Someone Is a Scammer</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/find-dating-profiles">Find Dating Profiles</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/check-my-digital-footprint">Check My Digital Footprint</Link></Button>
          </div>
        </section>
      </main>
    </div>
  );
}
