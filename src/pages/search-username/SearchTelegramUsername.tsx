import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Telegram",
  slug: "search-telegram-username",
  profilePattern: "t.me/username",
  metaDesc: "Search Telegram usernames to find profiles, channels, and discover linked accounts across 500+ platforms. Free Telegram username lookup with OSINT intelligence.",
  howItWorks: (
    <>
      <p>Telegram usernames resolve at <code>t.me/username</code>. This URL can point to a personal profile, a public channel, a public group, or a bot. When you search a Telegram username, the system queries this endpoint to determine what type of entity exists at that handle.</p>
      <p>Public Telegram profiles display the display name, bio, and profile photo. Public channels show the channel name, description, subscriber count, and recent posts. This dual-entity nature means a single username search can reveal both personal accounts and content channels.</p>
      <p>FootprintIQ extends the Telegram lookup by checking the same handle across 500+ platforms, connecting Telegram identities to accounts on Discord, Reddit, Twitter/X, and hundreds of other services.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Telegram profiles can be located through several methods:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Visit <code>t.me/username</code> to determine if a profile, channel, or bot exists at that handle.</li>
        <li><strong>Cross-platform enumeration.</strong> Telegram usernames frequently match handles used on Discord, Reddit, and gaming platforms. FootprintIQ identifies these connections automatically.</li>
        <li><strong>Channel and group discovery.</strong> Public Telegram channels and groups are indexed by directory services, providing alternative discovery pathways.</li>
        <li><strong>Bot ownership.</strong> Telegram bots display their creator, linking bot development activity to a personal identity.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques guide</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Telegram provides specific OSINT opportunities due to its messaging and broadcast features:</p>
      <ul>
        <li><strong>Channel content analysis.</strong> Public channels reveal publishing interests, political views, commercial activities, and audience engagement patterns.</li>
        <li><strong>Group participation.</strong> Public group memberships indicate community affiliations and interest areas.</li>
        <li><strong>Bot ownership analysis.</strong> Bots created by a user reveal technical capabilities and project interests.</li>
        <li><strong>Cross-platform correlation.</strong> The Telegram handle serves as a search key across all indexed platforms. Messaging platform users often share handles with gaming and community platforms.</li>
        <li><strong>Temporal analysis.</strong> Message timestamps and channel posting schedules indicate timezone and activity patterns.</li>
      </ul>
    </>
  ),
  privacyExposure: (
    <>
      <p>Telegram username exposure creates specific privacy concerns:</p>
      <ul>
        <li><strong>Direct contact vector.</strong> A known Telegram username enables unsolicited direct messages without phone number disclosure.</li>
        <li><strong>Channel ownership transparency.</strong> Public channels and bots are directly attributable to the creating account.</li>
        <li><strong>Cross-platform handle reuse.</strong> The same handle on Telegram and other platforms enables identity correlation through username search.</li>
        <li><strong>Group membership visibility.</strong> Public group memberships reveal community affiliations and interest areas.</li>
      </ul>
      <p>To reduce exposure: use a unique Telegram handle, review your privacy settings for who can find you by username, and audit public group memberships.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Telegram by username?", a: "Yes. Telegram usernames resolve at t.me/username for profiles, channels, groups, and bots. FootprintIQ checks Telegram alongside 500+ other platforms." },
    { q: "Is Telegram username search free?", a: "Yes. FootprintIQ's free tier includes Telegram and 500+ platforms." },
    { q: "What does a Telegram username reveal?", a: "A Telegram username can reveal personal profiles, public channels, groups, and bots. Public channels display subscriber counts and posted content." },
    { q: "Can someone find my phone number from my Telegram username?", a: "Not directly. Telegram usernames do not expose phone numbers. However, Telegram's privacy settings control whether contacts who have your number can find your account." },
  ],
};

export default function SearchTelegramUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
