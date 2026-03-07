import { Link } from "react-router-dom";
import { SearchByUsernameTemplate, type SearchByUsernamePlatformConfig } from "@/components/templates/SearchByUsernameTemplate";

const config: SearchByUsernamePlatformConfig = {
  platform: "Instagram",
  slug: "search-instagram-by-username",
  urlPattern: "instagram.com/username",
  titleSuffix: "Find Instagram Profiles",
  metaDesc: "Search Instagram by username to find profiles and discover linked accounts across 500+ platforms. Free Instagram username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Instagram profiles follow a predictable URL structure: <code>instagram.com/username</code>. When you search Instagram by username, OSINT tools send an HTTP request to this URL and analyse the response to confirm whether the profile exists and is publicly accessible.</p>
      <p>Public Instagram profiles expose a wealth of information: profile photo, bio text, follower and following counts, post count, tagged locations in content, and story highlights. Even with limited posts, the metadata surrounding an Instagram account — when it was created, who follows it, and what bio details it shares — provides valuable intelligence for digital footprint analysis.</p>
      <p>FootprintIQ extends the Instagram lookup by simultaneously checking the same handle across 500+ other platforms. This cross-platform enumeration reveals whether the Instagram identity connects to accounts on Twitter/X, Reddit, TikTok, GitHub, gaming networks, and niche forums — transforming a single profile lookup into a comprehensive exposure assessment.</p>
    </>
  ),
  canYouFind: (
    <>
      <p>Yes — if their profile is public. Instagram's default privacy setting for new accounts varies by age group, but a significant proportion of accounts remain publicly accessible. For public profiles, anyone can view posts, followers, and bio information without following the account.</p>
      <p>To find someone on Instagram by username using FootprintIQ:</p>
      <ol>
        <li><strong>Enter the exact username.</strong> FootprintIQ checks Instagram and 500+ additional platforms simultaneously, returning confidence-scored results.</li>
        <li><strong>Review the Instagram match.</strong> If the profile exists and is public, FootprintIQ confirms its availability and extracts publicly visible metadata.</li>
        <li><strong>Examine cross-platform results.</strong> The same handle on other platforms provides additional context — professional details from LinkedIn, opinions from Reddit, or gaming activity from Steam.</li>
        <li><strong>Check handle variations.</strong> Instagram allows periods and underscores that may differ on other platforms. Search variations to capture the full footprint.</li>
      </ol>
      <p>For advanced techniques, see our <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link> guide.</p>
    </>
  ),
  osintTechniques: (
    <>
      <p>Professional investigators apply several OSINT techniques when researching Instagram usernames:</p>
      <ul>
        <li><strong>Username pivoting.</strong> Starting from a confirmed Instagram handle and systematically checking it across every indexed platform to map the full account constellation.</li>
        <li><strong>Bio and metadata correlation.</strong> Comparing Instagram bio text, linked URLs, and profile photos with data from other platforms to confirm identity linkage.</li>
        <li><strong>Follower network analysis.</strong> Examining public follower and following lists for mutual connections that strengthen identity correlation.</li>
        <li><strong>Geolocation analysis.</strong> Reviewing tagged locations in public posts to establish geographic patterns and frequent locations.</li>
        <li><strong>Temporal patterns.</strong> Analysing posting frequency and timing to identify timezone and activity routines.</li>
      </ul>
      <p>These techniques are built into FootprintIQ's automated scanning pipeline. Learn more about <Link to="/username-osint-techniques" className="text-primary hover:underline">username OSINT techniques</Link>.</p>
    </>
  ),
  privacyTips: (
    <>
      <p>To reduce your Instagram-related digital exposure:</p>
      <ul>
        <li><strong>Use a unique handle.</strong> Don't reuse your Instagram username on platforms where you share different types of content. This breaks cross-platform correlation chains.</li>
        <li><strong>Set your account to private.</strong> Private Instagram accounts restrict visibility to approved followers only — the single most effective privacy measure.</li>
        <li><strong>Audit your bio.</strong> Remove personal details such as location, workplace, or phone number from your bio unless they are necessary.</li>
        <li><strong>Review tagged photos.</strong> Untag yourself from photos that reveal locations, associates, or activities you prefer to keep private.</li>
        <li><strong>Revoke third-party app access.</strong> Disconnect apps you no longer use from your Instagram account settings.</li>
      </ul>
      <p>Run a <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link> to see your full online exposure and receive a prioritised remediation plan.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Instagram by username for free?", a: "Yes. FootprintIQ offers a free scan that checks Instagram and 500+ other platforms simultaneously. No account required for basic scans." },
    { q: "What information is visible on a public Instagram profile?", a: "Public Instagram profiles display the username, display name, bio, profile photo, follower/following counts, post count, and all public posts including tagged locations and comments." },
    { q: "Can you find a private Instagram account by username?", a: "You can confirm whether a private account exists, but its content (posts, stories, followers) is not publicly accessible. FootprintIQ only accesses publicly available information." },
    { q: "How do I find all accounts linked to an Instagram username?", a: "Enter the Instagram username into FootprintIQ. The tool checks whether the same handle exists on 500+ other platforms and applies confidence scoring to identify genuine matches." },
    { q: "Is searching for an Instagram username legal?", a: "Yes. Searching publicly accessible profile URLs is legal. FootprintIQ only queries publicly available data — it never bypasses authentication or accesses private accounts." },
  ],
};

export default function SearchInstagramByUsername() {
  return <SearchByUsernameTemplate config={config} />;
}
