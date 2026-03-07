import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Twitter/X",
  slug: "search-twitter-username",
  profilePattern: "x.com/username",
  metaDesc: "Search Twitter/X usernames to find profiles, tweet history, and linked accounts across 500+ platforms. Free Twitter username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Twitter/X profiles are publicly accessible at <code>x.com/username</code>. When you search a Twitter username, OSINT tools query this endpoint and parse the response to confirm whether the profile exists, is active, and is publicly visible.</p>
      <p>A confirmed public Twitter/X profile reveals the display name, bio, profile and banner photos, follower and following counts, join date, location (if set), linked website, and the complete public tweet timeline. Twitter's conversational nature means users frequently share opinions, locations, professional details, and personal connections that don't appear on other platforms.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Twitter/X identity connects to accounts on Instagram, Reddit, GitHub, Discord, and hundreds of niche communities. Reply graphs and follower overlaps provide additional correlation data.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Several approaches help locate Twitter/X profiles when you have a username or partial information:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>x.com/username</code> to confirm profile existence. FootprintIQ automates this programmatically across platforms.</li>
        <li><strong>Advanced search operators.</strong> Twitter's search supports <code>from:username</code>, date ranges, and keyword filters to surface specific tweets and interactions from a target account.</li>
        <li><strong>Cross-platform pivot.</strong> The same handle discovered on Reddit, GitHub, or Instagram provides strong evidence for the corresponding Twitter/X account. FootprintIQ identifies these connections automatically.</li>
        <li><strong>Reply and mention networks.</strong> Searching <code>to:username</code> or <code>@username</code> reveals who interacts with the account — useful for mapping social networks.</li>
      </ul>
      <p>For detailed methodology, see our <Link to="/how-to-find-someone-on-twitter" className="text-primary hover:underline">guide to finding someone on Twitter/X</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Twitter/X usernames are high-value OSINT pivot points due to the platform's open, conversational design:</p>
      <ul>
        <li><strong>Username enumeration.</strong> The Twitter handle serves as a universal search key. A single confirmed username can reveal dozens of connected accounts across platforms.</li>
        <li><strong>Temporal analysis.</strong> Tweet timestamps reveal timezone, daily patterns, and activity schedules. Gaps in activity may indicate travel or account changes.</li>
        <li><strong>Network mapping.</strong> Follower/following lists, reply threads, and retweet patterns map professional and personal networks in detail.</li>
        <li><strong>Geolocation indicators.</strong> Location fields, local event mentions, venue check-ins, and weather references provide geographic intelligence.</li>
        <li><strong>Opinion and affiliation analysis.</strong> Public tweets reveal political views, professional expertise, employer mentions, and community affiliations.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced investigation workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Twitter/X username exposure creates specific privacy risks:</p>
      <ul>
        <li><strong>Cross-platform identity linking.</strong> Reusing your Twitter handle on other platforms allows anyone to map your entire digital presence with a single search.</li>
        <li><strong>Opinion trail.</strong> Years of public tweets create a searchable archive of opinions, complaints, and personal disclosures that can be used out of context.</li>
        <li><strong>Professional exposure.</strong> Employer mentions, work complaints, and industry opinions can surface during background checks and hiring processes.</li>
        <li><strong>Social engineering material.</strong> Public interactions, interests, and personal details provide material for targeted phishing campaigns.</li>
      </ul>
      <p>To reduce exposure: use a unique handle for Twitter/X, audit old tweets regularly, restrict DMs, and review third-party app permissions connected to your account.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Twitter by username without an account?", a: "Yes. Public Twitter/X profiles are accessible via web browser at x.com/username without requiring an account. FootprintIQ performs this lookup programmatically." },
    { q: "Is Twitter/X username search free?", a: "Yes. FootprintIQ's free tier includes Twitter/X along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a Twitter username reveal?", a: "A public Twitter profile shows display name, bio, profile photo, follower/following counts, join date, location, linked website, and public tweet history. Cross-referenced with other platforms, the same username reveals a broader digital identity." },
    { q: "Can you find a suspended or deleted Twitter account?", a: "Suspended accounts return a suspension notice. Deleted accounts return a 404. FootprintIQ records the status at scan time for investigative documentation." },
  ],
};

export default function SearchTwitterUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
