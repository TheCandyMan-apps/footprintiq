import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Patreon",
  slug: "search-patreon-username",
  profilePattern: "patreon.com/username",
  metaDesc: "Search Patreon usernames to find creator profiles and discover linked accounts across 500+ platforms. Free Patreon username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Patreon profiles are publicly accessible at <code>patreon.com/username</code>. OSINT tools query this URL to confirm whether a creator page exists and contains public information.</p>
      <p>A confirmed Patreon profile reveals the creator's name, bio, profile and cover photos, number of patrons, tier descriptions, public posts, and linked social accounts. Patreon is a subscription-based platform where creators monetise content — its profiles often bridge creative and financial identity, revealing both what someone creates and how they fund it.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, revealing connections to YouTube, Twitter/X, Instagram, and other creator-focused communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Patreon profiles:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>patreon.com/username</code>. FootprintIQ automates this.</li>
        <li><strong>Cross-platform pivot.</strong> Creators promote their Patreon on YouTube, Twitter/X, and Instagram. Matching handles are common.</li>
        <li><strong>Google search.</strong> Searching <code>site:patreon.com "username"</code> surfaces creator pages and public posts.</li>
        <li><strong>Bio link analysis.</strong> Patreon links in social media bios confirm creator identity.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Patreon profiles provide creator economy OSINT value:</p>
      <ul>
        <li><strong>Financial indicators.</strong> Patron counts and tier pricing reveal revenue scale and monetisation approach.</li>
        <li><strong>Content focus.</strong> Tier descriptions and public posts reveal what the creator produces and for whom.</li>
        <li><strong>Linked accounts.</strong> Patreon profiles typically link to the creator's primary platforms (YouTube, podcast, blog).</li>
        <li><strong>Identity confirmation.</strong> Patreon profiles frequently display real names and professional identities.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Patreon username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Financial exposure.</strong> Patron counts and tier pricing reveal income indicators.</li>
        <li><strong>Identity linking.</strong> Patreon profiles connect creator aliases to financial and professional identity.</li>
        <li><strong>Cross-platform promotion.</strong> Active promotion creates permanent links between Patreon and social accounts.</li>
      </ul>
      <p>To reduce exposure: use a creator-specific handle, review public post visibility, and audit linked social accounts.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Patreon by username?", a: "Yes. Patreon pages are accessible at patreon.com/username. FootprintIQ checks this alongside 500+ platforms." },
    { q: "Is Patreon username search free?", a: "Yes. FootprintIQ's free tier includes Patreon along with 500+ other platforms." },
    { q: "What does a Patreon profile reveal?", a: "A public Patreon page shows creator name, bio, patron count, tier descriptions, public posts, and linked social accounts." },
    { q: "Can you see how much a Patreon creator earns?", a: "Patron counts are public. Some creators display earnings. Tier pricing is always visible. FootprintIQ records these public data points." },
  ],
};

export default function SearchPatreonUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
