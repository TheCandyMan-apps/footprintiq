import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { TrustSignals } from "@/components/TrustSignals";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "FootprintIQ — Check Your Digital Footprint";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Scan emails, usernames, domains, phones and IPs with trusted OSINT sources like Have I Been Pwned, Shodan and VirusTotal.");
    }
  }, []);

  const handleStartScan = () => {
    navigate('/scan');
  };

  return (
    <>
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
    </>
  );
}
