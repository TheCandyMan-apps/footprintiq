import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Keybase",
  slug: "search-keybase-username",
  profilePattern: "keybase.io/username",
  metaDesc: "Search Keybase usernames to find cryptographic identity profiles and discover linked accounts across 500+ platforms. Free Keybase username lookup with OSINT intelligence.",
  howItWorks: (
    <>
      <p>Keybase profiles are publicly accessible at <code>keybase.io/username</code>. OSINT tools query this URL to confirm whether a profile exists and contains cryptographic identity proofs.</p>
      <p>Keybase is unique among social platforms because it provides cryptographic verification of identity across services. A confirmed Keybase profile reveals the user's PGP keys, verified proofs linking to Twitter/X, GitHub, Reddit, personal domains, and other accounts. These proofs are cryptographically signed, making Keybase one of the most reliable sources for cross-platform identity confirmation.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, corroborating Keybase's verified proofs with broader username intelligence.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Keybase profiles:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>keybase.io/username</code>. FootprintIQ automates this.</li>
        <li><strong>Cryptographic proof chains.</strong> Keybase proofs link to Twitter/X, GitHub, Reddit, and domain ownership — creating verified cross-platform maps.</li>
        <li><strong>PGP key searches.</strong> Keybase profiles contain PGP public keys that can be cross-referenced with key servers.</li>
        <li><strong>Cross-platform pivot.</strong> Security-conscious users often maintain Keybase alongside GitHub, HN, and Mastodon profiles.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Keybase profiles provide exceptional OSINT value due to cryptographic verification:</p>
      <ul>
        <li><strong>Verified identity proofs.</strong> Cryptographic proofs link Keybase to Twitter/X, GitHub, Reddit, and domains with mathematical certainty.</li>
        <li><strong>PGP key intelligence.</strong> Public keys reveal email addresses, key creation dates, and associated identities.</li>
        <li><strong>Device tracking.</strong> Keybase device lists show the number and types of devices associated with the account.</li>
        <li><strong>Team memberships.</strong> Keybase team affiliations reveal professional and community connections.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Keybase username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Verified cross-platform links.</strong> Keybase proofs create provable connections between accounts — more certain than handle matching alone.</li>
        <li><strong>PGP email exposure.</strong> PGP keys often contain email addresses associated with real identities.</li>
        <li><strong>Device enumeration.</strong> Device lists reveal how many and what types of devices a user operates.</li>
      </ul>
      <p>To reduce exposure: audit verified proofs, remove proofs for accounts you want to keep separate, and review PGP key metadata.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Keybase by username?", a: "Yes. Keybase profiles are accessible at keybase.io/username. FootprintIQ checks this alongside 500+ platforms." },
    { q: "Is Keybase username search free?", a: "Yes. FootprintIQ's free tier includes Keybase along with 500+ other platforms." },
    { q: "What makes Keybase different from other platforms?", a: "Keybase uses cryptographic proofs to verify identity across platforms. This means linked accounts are mathematically proven, not just assumed from matching usernames." },
    { q: "What does a Keybase profile reveal?", a: "A Keybase profile shows verified proofs linking to other platforms, PGP public keys, device information, team memberships, and followers." },
  ],
};

export default function SearchKeybaseUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
