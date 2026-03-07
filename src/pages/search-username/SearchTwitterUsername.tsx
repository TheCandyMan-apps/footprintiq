import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Twitter/X",
  slug: "search-twitter-username",
  profilePattern: "x.com/username",
  metaDesc: "Search Twitter/X usernames to find profiles, tweet history, and linked accounts across 500+ platforms. Free Twitter username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Twitter/X profiles are publicly accessible at <code>x.com/username</code>. When you search a Twitter username, OSINT tools query this endpoint and parse the response to confirm whether the profile exists, is active, and is publicly visible. Suspended accounts return a distinct suspension notice, while deactivated profiles return a 404 — each status provides investigative intelligence.</p>
      <p>A confirmed public Twitter/X profile reveals the display name, bio, profile and banner photos, follower and following counts, join date, location (if set), linked website, verification status, and the complete public tweet timeline. Twitter's conversational, real-time nature means users frequently share opinions, locations, professional details, and personal connections that don't appear on curated platforms like Instagram or LinkedIn.</p>
      <p>FootprintIQ extends this by simultaneously checking the same handle across 500+ other platforms, revealing whether the Twitter/X identity connects to accounts on Instagram, Reddit, GitHub, Discord, and hundreds of niche communities. Reply graphs, mention networks, and follower overlaps provide additional correlation data that strengthens identity confidence.</p>
      <p>The platform's extensive API history means that historical tweet data, deleted tweets, and account metadata changes are frequently preserved in third-party archives — creating a richer intelligence picture than the current profile alone would suggest.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Investigators use several techniques to locate and verify Twitter/X accounts:</p>
      <ul>
        <li><strong>Direct URL enumeration.</strong> Navigate to <code>x.com/username</code> to confirm profile existence. FootprintIQ automates this programmatically across 500+ platforms in a single scan.</li>
        <li><strong>Advanced search operators.</strong> Twitter's search supports <code>from:username</code>, <code>to:username</code>, date ranges, and keyword filters to surface specific tweets and interactions — enabling targeted content analysis without accessing the full timeline.</li>
        <li><strong>Cross-platform pivot.</strong> The same handle discovered on Reddit, GitHub, Instagram, or Discord provides strong evidence for the corresponding Twitter/X account. FootprintIQ's <Link to="/username-search" className="text-primary hover:underline">username search tool</Link> identifies these connections automatically.</li>
        <li><strong>Reply and mention network mapping.</strong> Searching <code>@username</code> reveals who interacts with the account, mapping social and professional networks through public conversation patterns.</li>
        <li><strong>List membership analysis.</strong> Public Twitter lists curated by other users often categorise accounts by industry, location, or affiliation — providing contextual intelligence about the target's perceived identity.</li>
      </ul>
      <p>For detailed methodology, see our <Link to="/how-to-find-someone-on-twitter" className="text-primary hover:underline">guide to finding someone on Twitter/X</Link>.</p>
    </>
  ),
  usernameReuse: (
    <>
      <p>Twitter/X handles are among the most commonly reused identifiers across the internet. The platform's early adoption and cultural significance mean that many users established their preferred handle on Twitter first, then carried it to Instagram, Reddit, Discord, and newer platforms as they joined.</p>
      <p>This "Twitter-first" pattern makes Twitter handles exceptionally effective as search keys for <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookups</Link>. A confirmed Twitter username frequently unlocks profiles on five to fifteen additional platforms, depending on the user's online activity level.</p>
      <p>Professional users are particularly consistent. Journalists, developers, marketers, and public figures maintain handle consistency across Twitter/X, LinkedIn, GitHub, Medium, and personal websites as a deliberate branding strategy — inadvertently creating a comprehensive identity map accessible through a single search query.</p>
      <p>Even users who have abandoned Twitter/X often retain the same handle on platforms they migrated to — Mastodon, Bluesky, Threads, and Nostr. Tracking username migration patterns across decentralised social platforms has become a significant OSINT technique as the social media landscape fragments.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Twitter/X usernames are high-value OSINT pivot points due to the platform's open, conversational design:</p>
      <ul>
        <li><strong>Username enumeration.</strong> The Twitter handle serves as a universal search key. A single confirmed username can reveal dozens of connected accounts across professional, gaming, and community platforms.</li>
        <li><strong>Temporal analysis.</strong> Tweet timestamps reveal timezone, daily activity patterns, and work/sleep schedules. Gaps in activity may indicate travel, account changes, or significant life events.</li>
        <li><strong>Network mapping.</strong> Follower/following lists, reply threads, retweet patterns, and list memberships map professional and personal networks in forensic detail.</li>
        <li><strong>Geolocation indicators.</strong> Location fields, local event mentions, venue references, weather complaints, and transit commentary provide geographic intelligence — even when explicit geotags are disabled.</li>
        <li><strong>Opinion and affiliation analysis.</strong> Public tweets reveal political views, professional expertise, employer mentions, brand affiliations, and community positions — creating a detailed opinion profile that can span years.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced investigation workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Twitter/X username exposure creates compounding privacy risks:</p>
      <ul>
        <li><strong>Cross-platform identity linking.</strong> Reusing your Twitter handle on other platforms allows anyone with a <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint checker</Link> to map your entire digital presence with a single search.</li>
        <li><strong>Opinion trail.</strong> Years of public tweets create a searchable archive of opinions, complaints, political positions, and personal disclosures that can be used out of context during employment screening or public disputes.</li>
        <li><strong>Professional exposure.</strong> Employer mentions, work complaints, industry opinions, and client interactions can surface during background checks, hiring processes, and due diligence investigations.</li>
        <li><strong>Social engineering material.</strong> Public interactions, interests, relationship indicators, and daily routine disclosures provide material for targeted phishing, pretexting, and impersonation campaigns.</li>
        <li><strong>Deleted tweet persistence.</strong> Third-party archival services and cached search results may retain tweets long after deletion, creating a permanent record that the user cannot fully control.</li>
      </ul>
      <p>To reduce exposure: use a unique handle for Twitter/X, audit old tweets regularly, restrict DMs, review third-party app permissions, and consider using protected (private) mode for sensitive periods.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Twitter by username without an account?", a: "Yes. Public Twitter/X profiles are accessible via web browser at x.com/username without requiring an account. FootprintIQ performs this lookup programmatically across 500+ platforms." },
    { q: "Is Twitter/X username search free?", a: "Yes. FootprintIQ's free tier includes Twitter/X along with 500+ other platforms. No account required for basic scans." },
    { q: "What does a Twitter username reveal?", a: "A public Twitter profile shows display name, bio, profile photo, follower/following counts, join date, location, linked website, and public tweet history spanning years of activity." },
    { q: "Can you find a suspended or deleted Twitter account?", a: "Suspended accounts return a suspension notice. Deleted accounts return a 404. FootprintIQ records the status at scan time for investigative documentation." },
    { q: "How do investigators track Twitter/X accounts?", a: "Investigators use advanced search operators, reply network mapping, temporal analysis, cross-platform username correlation, and third-party archival services to build comprehensive profiles." },
    { q: "Can deleted tweets still be found?", a: "Often yes. Third-party archival services, cached search engine results, and screenshot databases frequently retain tweets after deletion from the platform." },
    { q: "Does searching someone's Twitter leave a trace?", a: "No. Viewing public Twitter profiles and tweets does not notify the account holder. FootprintIQ's analysis is entirely passive." },
    { q: "How can I protect my Twitter/X privacy?", a: "Use a unique handle, regularly audit old tweets, restrict DMs, remove third-party app permissions, and consider protected mode for sensitive periods." },
  ],
};

export default function SearchTwitterUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
