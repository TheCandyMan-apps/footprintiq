import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { TrustSignals } from "@/components/TrustSignals";

export default function Home() {
  const navigate = useNavigate();

  const handleStartScan = () => {
    navigate('/scan');
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is my data private when using FootprintIQ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes — we query reputable OSINT providers and never store or sell your personal data. Your privacy is our top priority. All scans are encrypted and securely processed."
        }
      },
      {
        "@type": "Question",
        "name": "Is FootprintIQ free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! The free tier runs comprehensive checks across email breaches, username searches, and basic domain intelligence. Pro plans unlock deeper historical sources, continuous monitoring, and automated data removal from 100+ data brokers."
        }
      },
      {
        "@type": "Question",
        "name": "What OSINT sources does FootprintIQ use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FootprintIQ uses trusted OSINT sources including Have I Been Pwned for breach detection, Shodan for IP and device exposure, VirusTotal for domain and file reputation, plus 100+ data broker databases for comprehensive digital footprint analysis."
        }
      }
    ]
  };

  return (
    <>
      <SEO
        title="FootprintIQ — Digital Footprint Scanner & OSINT Privacy Protection"
        description="Scan your digital footprint with trusted OSINT sources. Check email breaches, usernames, domains, IPs, and phones. Remove personal data from 100+ data brokers automatically."
        canonical="https://footprintiq.com/"
        structuredData={faqStructuredData}
      />
      <Header />
      <Hero onStartScan={handleStartScan} />
      <TrustSignals />
      <HowItWorks />
      <WhyChooseUs />
      <Pricing />
      <Testimonials />
      
      <main className="px-6 py-16 mx-auto max-w-5xl">
        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">What you can scan</h2>
            <ul className="mt-3 list-disc ml-6 text-muted-foreground">
              <li>Email breach checks &amp; identity enrichment</li>
              <li>Username presence across major platforms</li>
              <li>Domain reputation, tech stack &amp; DNS history</li>
              <li>IP exposure &amp; open ports (Shodan)</li>
              <li>Phone number intelligence &amp; carrier checks</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Why it matters</h2>
            <ul className="mt-3 list-disc ml-6 text-muted-foreground">
              <li>Reduce risk from exposed data</li>
              <li>Protect your brand &amp; personal privacy</li>
              <li>Get step-by-step cleanup actions</li>
            </ul>
          </div>
        </section>

        <Link to="/scan" className="inline-flex mt-10 rounded-lg border border-border px-4 py-2 hover:bg-muted transition-colors">
          Run a free scan
        </Link>
      </main>
      
      <FAQ />
      <Footer />
    </>
  );
}
