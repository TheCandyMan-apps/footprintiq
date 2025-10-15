// /pages/index.tsx
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>FootprintIQ — Check Your Digital Footprint</title>
        <meta
          name="description"
          content="Scan emails, usernames, domains, phones and IPs with trusted OSINT sources like Have I Been Pwned, Shodan and VirusTotal."
        />
        <link rel="canonical" href="https://footprintiq.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="FootprintIQ — Digital Footprint Scanner" />
        <meta
          property="og:description"
          content="Breach checks, identity enrichment, device & domain intel in one private report."
        />
        <meta property="og:image" content="/og/cover.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FootprintIQ — Digital Footprint Scanner" />
        <meta name="twitter:description" content="See what the internet exposes about you, then clean it up." />
        <meta name="twitter:image" content="/og/cover.png" />
      </Head>

      <main className="px-6 py-16 mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold">FootprintIQ — Take Control of Your Digital Footprint</h1>
        <p className="mt-4 text-lg">
          Run a private OSINT scan to see what the internet exposes about you or your brand — breaches, social profiles,
          domain tech stacks, DNS history, IP exposure and more.
        </p>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">What you can scan</h2>
            <ul className="mt-3 list-disc ml-6">
              <li>Email breach checks &amp; identity enrichment</li>
              <li>Username presence across major platforms</li>
              <li>Domain reputation, tech stack &amp; DNS history</li>
              <li>IP exposure &amp; open ports (Shodan)</li>
              <li>Phone number intelligence &amp; carrier checks</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Why it matters</h2>
            <ul className="mt-3 list-disc ml-6">
              <li>Reduce risk from exposed data</li>
              <li>Protect your brand &amp; personal privacy</li>
              <li>Get step-by-step cleanup actions</li>
            </ul>
          </div>
        </section>

        <Link href="/scan" className="inline-flex mt-10 rounded-lg border px-4 py-2 hover:bg-black/5">
          Run a free scan
        </Link>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">FAQs</h2>
          <details className="mt-3">
            <summary>Is my data private?</summary>
            <p className="mt-2">Yes — we query reputable OSINT providers and never store or sell your data.</p>
          </details>
          <details className="mt-3">
            <summary>Is FootprintIQ free?</summary>
            <p className="mt-2">The free tier runs basic checks; Pro unlocks deeper historical sources.</p>
          </details>
        </section>
      </main>
    </>
  );
}
