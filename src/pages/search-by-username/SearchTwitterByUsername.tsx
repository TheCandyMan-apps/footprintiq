import { Link } from "react-router-dom";
import { SearchByUsernameTemplate, type SearchByUsernamePlatformConfig } from "@/components/templates/SearchByUsernameTemplate";

const config: SearchByUsernamePlatformConfig = {
  platform: "Twitter/X",
  slug: "search-twitter-by-username",
  urlPattern: "x.com/username",
  titleSuffix: "Find Twitter Profiles",
  metaDesc: "Search Twitter/X by username to find profiles and discover linked accounts across 500+ platforms. Free Twitter username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Twitter/X profiles are accessible at <code>x.com/username</code>. When you search Twitter by username, OSINT tools query this URL and analyse the HTTP response — a valid 200 response with profile metadata confirms the account exists; a 404 indicates it does not.</p>
      <p>Public Twitter/X profiles expose considerable information: display name, bio text, follower and following counts, account creation date, pinned tweets, and recent post history. Location and website fields are optional but frequently populated, providing additional data points for identity correlation.</p>
      <p>FootprintIQ extends the Twitter lookup by simultaneously checking the same handle across 500+ platforms. This multi-platform enumeration reveals whether the Twitter identity connects to accounts on Instagram, Reddit, GitHub, gaming networks, and niche communities — delivering a comprehensive view of cross-platform exposure in seconds.</p>
    </>
  ),
  canYouFind: (
    <>
      <p>Yes — if their account is public. The majority of Twitter/X accounts are publicly accessible, meaning anyone can view their profile, tweets, and interactions without following them.</p>
      <ol>
        <li><strong>Enter the Twitter handle.</strong> FootprintIQ checks Twitter/X and 500+ additional platforms simultaneously, returning confidence-scored results.</li>
        <li><strong>Review the profile match.</strong> FootprintIQ confirms whether the account exists and extracts publicly visible metadata.</li>
        <li><strong>Examine cross-platform results.</strong> The same handle on other platforms adds context — professional details from LinkedIn, personal interests from Reddit, visual content from Instagram.</li>
        <li><strong>Expand with variations.</strong> If the user employs handle variations (appended numbers, underscores), run additional searches to capture the full footprint.</li>
      </ol>
      <p>For advanced methodology, see our <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link> guide.</p>
    </>
  ),
  osintTechniques: (
    <>
      <p>Professional investigators apply several techniques when researching Twitter/X usernames:</p>
      <ul>
        <li><strong>Username pivoting.</strong> Starting from a confirmed Twitter handle and systematically checking it across every indexed platform.</li>
        <li><strong>Network analysis.</strong> Reviewing public follower/following lists and reply patterns to identify connected accounts and social circles.</li>
        <li><strong>Temporal analysis.</strong> Examining tweet timestamps and activity patterns to identify timezone and daily routine.</li>
        <li><strong>Bio and metadata correlation.</strong> Comparing display names, profile photos, and linked URLs across matched platforms to confirm identity linkage.</li>
        <li><strong>Hashtag and topic analysis.</strong> Analysing frequently used hashtags and topics to build an interest and expertise profile.</li>
      </ul>
      <p>These techniques are automated in FootprintIQ's pipeline. Learn more about <Link to="/username-osint-techniques" className="text-primary hover:underline">username OSINT techniques</Link>.</p>
    </>
  ),
  privacyTips: (
    <>
      <p>To reduce your Twitter/X-related digital exposure:</p>
      <ul>
        <li><strong>Use a unique handle.</strong> Avoid reusing your Twitter username on other platforms — this breaks cross-referencing chains.</li>
        <li><strong>Audit your bio and metadata.</strong> Remove personal details such as location, workplace, or real name if they aren't necessary.</li>
        <li><strong>Review connected apps.</strong> Revoke access for third-party applications you no longer use.</li>
        <li><strong>Protect your tweets.</strong> If your content is sensitive, consider making your account private. Protected tweets are only visible to approved followers.</li>
        <li><strong>Delete dormant accounts.</strong> Old, forgotten accounts on other platforms still carry your username — deactivate or delete them.</li>
      </ul>
      <p>Run a <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link> to see your full online exposure and receive a prioritised remediation plan.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Twitter/X by username for free?", a: "Yes. FootprintIQ offers free scans covering Twitter/X and 500+ other platforms. No registration required for basic scans." },
    { q: "What information is visible on a public Twitter profile?", a: "Public profiles display the display name, bio, follower/following counts, join date, pinned tweets, and recent posts. Location and website fields are optional but frequently populated." },
    { q: "Can you find deleted Twitter accounts?", a: "Deleted accounts return a 'not found' status. However, cached versions may persist in search engine indexes or web archives. FootprintIQ checks live availability." },
    { q: "How do I find accounts linked to a Twitter username?", a: "Enter the Twitter handle into FootprintIQ. It checks the same handle across 500+ platforms and uses confidence scoring to identify genuine matches." },
    { q: "Is searching for a Twitter username legal?", a: "Yes. Querying publicly accessible profile URLs is legal. FootprintIQ never bypasses authentication or accesses private accounts." },
  ],
};

export default function SearchTwitterByUsername() {
  return <SearchByUsernameTemplate config={config} />;
}
