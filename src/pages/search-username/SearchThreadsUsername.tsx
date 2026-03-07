import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Threads",
  slug: "search-threads-username",
  profilePattern: "threads.net/@username",
  metaDesc: "Search Threads usernames to find profiles and discover linked accounts across 500+ platforms. Free Threads username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Threads profiles are publicly accessible at <code>threads.net/@username</code>. OSINT tools query this URL to confirm whether a profile exists and contains public posts.</p>
      <p>A confirmed Threads profile reveals the display name, bio, profile photo, follower and following counts, and post history. Threads is Meta's text-based social platform, directly linked to Instagram accounts. This architectural connection means a Threads username almost always matches the user's Instagram handle — making cross-platform correlation automatic and highly reliable.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ platforms, including both Threads and Instagram, revealing the full scope of a user's digital presence.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Threads profiles from a username:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>threads.net/@username</code>. FootprintIQ automates this programmatically.</li>
        <li><strong>Instagram correlation.</strong> Threads accounts are tied to Instagram identities. Confirming one confirms the other.</li>
        <li><strong>Cross-platform pivot.</strong> Users who maintain Threads typically also have Instagram, and frequently use the same handle on Twitter/X and other platforms.</li>
        <li><strong>Google search.</strong> Searching <code>site:threads.net "@username"</code> surfaces profiles and public posts.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Threads usernames provide unique OSINT value due to the Instagram connection:</p>
      <ul>
        <li><strong>Guaranteed Instagram correlation.</strong> Every Threads account is linked to an Instagram account, providing automatic cross-platform intelligence.</li>
        <li><strong>Opinion and conversation analysis.</strong> Threads' text-based format reveals opinions, interests, and conversational patterns.</li>
        <li><strong>Network mapping.</strong> Follower/following relationships and reply threads map social connections.</li>
        <li><strong>Activity patterns.</strong> Post timestamps reveal timezone and daily usage habits.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Threads username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Automatic Instagram linking.</strong> Your Threads account directly confirms your Instagram identity — and vice versa.</li>
        <li><strong>Text-based opinion trail.</strong> Posts create a searchable archive of opinions and personal views.</li>
        <li><strong>Meta ecosystem exposure.</strong> Threads activity connects to the broader Meta identity (Instagram, Facebook).</li>
      </ul>
      <p>To reduce exposure: be aware that Threads and Instagram identities are inseparable. Audit both platforms together and review post visibility settings.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Threads by username?", a: "Yes. Threads profiles are accessible at threads.net/@username. FootprintIQ checks this programmatically alongside 500+ platforms." },
    { q: "Is Threads username search free?", a: "Yes. FootprintIQ's free tier includes Threads along with 500+ other platforms." },
    { q: "Are Threads and Instagram usernames the same?", a: "Yes. Threads accounts are linked to Instagram accounts and share the same username. Confirming one confirms the other." },
    { q: "What does a Threads profile reveal?", a: "A public Threads profile shows display name, bio, profile photo, follower/following counts, and post history." },
  ],
};

export default function SearchThreadsUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
