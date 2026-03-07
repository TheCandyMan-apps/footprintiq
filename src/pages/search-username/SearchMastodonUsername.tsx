import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Mastodon",
  slug: "search-mastodon-username",
  profilePattern: "mastodon.social/@username",
  metaDesc: "Search Mastodon usernames to find fediverse profiles and discover linked accounts across 500+ platforms. Free Mastodon username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Mastodon profiles follow the pattern <code>instance.tld/@username</code> — for example, <code>mastodon.social/@username</code>. Unlike centralised platforms, Mastodon is a federated network (the "fediverse") with thousands of independent instances. OSINT tools must search across multiple instances to locate a user.</p>
      <p>A confirmed Mastodon profile reveals the display name, bio, profile photo, follower and following counts, post (toot) history, and pinned posts. Many Mastodon profiles include verified website links using the platform's rel="me" verification system, which provides cryptographic proof of identity across linked sites.</p>
      <p>FootprintIQ extends this by checking major Mastodon instances alongside 500+ other platforms, revealing cross-platform identity connections between fediverse accounts and mainstream social media.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Locating Mastodon profiles requires instance-aware searching:</p>
      <ul>
        <li><strong>Major instance checks.</strong> FootprintIQ checks popular instances like mastodon.social, mastodon.online, and mstdn.social programmatically.</li>
        <li><strong>Fediverse search tools.</strong> Services like instances.social and fediverse.info index profiles across the network.</li>
        <li><strong>Cross-platform pivot.</strong> Mastodon users often share their full handle (@user@instance) on Twitter/X bios during migration waves.</li>
        <li><strong>Website verification.</strong> Mastodon's rel="me" links on personal websites confirm the associated profile.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Mastodon usernames provide OSINT value despite the platform's decentralised nature:</p>
      <ul>
        <li><strong>Instance selection analysis.</strong> The chosen instance reveals community affiliations and interests (e.g., infosec.exchange for cybersecurity professionals).</li>
        <li><strong>Verified link chains.</strong> Mastodon's rel="me" verification system provides cryptographic proof linking profiles to personal websites and other accounts.</li>
        <li><strong>Migration history.</strong> Users who migrated from Twitter/X often shared their handles publicly, creating a permanent correlation record.</li>
        <li><strong>Content analysis.</strong> Post history reveals opinions, interests, and professional focus areas.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Mastodon username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Instance identity.</strong> Your chosen instance signals community membership and interests.</li>
        <li><strong>Verified links.</strong> rel="me" verification creates provable connections between your Mastodon profile and personal websites.</li>
        <li><strong>Federation visibility.</strong> Posts are distributed across the fediverse and may be cached on other instances even after deletion.</li>
        <li><strong>Migration trail.</strong> Public handle-sharing during Twitter/X migrations created permanent cross-platform links.</li>
      </ul>
      <p>To reduce exposure: choose a general-purpose instance, limit verified links, and be aware that federation means content is distributed beyond your home instance.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Mastodon by username?", a: "Yes. FootprintIQ checks major Mastodon instances programmatically alongside 500+ other platforms." },
    { q: "Is Mastodon username search free?", a: "Yes. FootprintIQ's free tier includes Mastodon along with 500+ other platforms." },
    { q: "How does Mastodon username search work across instances?", a: "Mastodon is federated, so users exist on different instances. FootprintIQ checks major instances and cross-references results." },
    { q: "What does a Mastodon profile reveal?", a: "A public Mastodon profile shows display name, bio, profile photo, verified website links, follower counts, and post history." },
  ],
};

export default function SearchMastodonUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
