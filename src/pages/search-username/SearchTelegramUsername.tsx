import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Telegram",
  slug: "search-telegram-username",
  profilePattern: "t.me/username",
  metaDesc: "Search Telegram usernames to find profiles, channels, and discover linked accounts across 500+ platforms. Free Telegram username lookup with OSINT intelligence.",
  howItWorks: (
    <>
      <p>Telegram usernames resolve at <code>t.me/username</code>. This URL can point to a personal profile, a public channel, a public group, or a bot. When you search a Telegram username, the system queries this endpoint to determine what type of entity exists at that handle and extracts publicly available metadata from the preview page.</p>
      <p>Public Telegram profiles display the display name, bio, and profile photo. Public channels show the channel name, description, subscriber count, and recent posts. Public groups reveal the group name, description, member count, and preview messages. This dual-entity nature means a single username search can reveal both personal accounts and content channels — providing richer intelligence than most single-purpose platforms.</p>
      <p>FootprintIQ extends the Telegram lookup by checking the same handle across 500+ platforms, connecting Telegram identities to accounts on Discord, Reddit, Twitter/X, and hundreds of other services. This cross-platform correlation is particularly valuable because Telegram users frequently participate in crypto, tech, and privacy-focused communities where the same handle appears on multiple niche platforms.</p>
      <p>The system also distinguishes between personal accounts, channels, groups, and bots — each entity type providing different intelligence value and investigative pathways for analysts.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Investigators use multiple approaches to locate and verify Telegram accounts:</p>
      <ul>
        <li><strong>Direct URL enumeration.</strong> Visit <code>t.me/username</code> to determine if a profile, channel, group, or bot exists at that handle. The preview page provides initial metadata without requiring a Telegram account.</li>
        <li><strong>Cross-platform handle correlation.</strong> Telegram usernames frequently match handles used on Discord, Reddit, Signal, and crypto forums. FootprintIQ's <Link to="/username-search" className="text-primary hover:underline">username search tool</Link> identifies these connections automatically.</li>
        <li><strong>Channel and group directory search.</strong> Public Telegram channels and groups are indexed by directory services like tgstat.com and Telemetr — providing discovery pathways through content topics and community names.</li>
        <li><strong>Bot ownership tracing.</strong> Telegram bots display their creator through the BotFather system. Bot listings in directories link development activity to a personal Telegram identity.</li>
        <li><strong>Forwarded message attribution.</strong> Public channel posts forwarded from other channels or users retain source attribution, creating discoverable connection paths between entities.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques guide</Link>.</p>
    </>
  ),
  usernameReuse: (
    <>
      <p>Telegram username reuse follows distinct patterns shaped by the platform's user demographics. Crypto traders, developers, privacy advocates, and tech community members — Telegram's core user base — tend to maintain consistent handles across Telegram, Discord, GitHub, Reddit, and specialised forums.</p>
      <p>This consistency creates a powerful correlation vector. A Telegram handle discovered in a public crypto channel often matches accounts on Twitter/X (for market commentary), Discord (for community participation), GitHub (for project contributions), and Reddit (for technical discussions). A <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link> can map this entire ecosystem from a single starting point.</p>
      <p>Channel administrators present particular exposure. Individuals who create and manage public Telegram channels frequently use the same handle for their personal account and their channel — linking their personal identity to their published content and subscriber base.</p>
      <p>The privacy-focused nature of Telegram's user base creates an ironic vulnerability: users who chose Telegram specifically for its privacy features often undermine that privacy by reusing identifiable handles across less private platforms.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Telegram provides specific OSINT opportunities through its messaging, broadcast, and community features:</p>
      <ul>
        <li><strong>Channel content analysis.</strong> Public channels reveal publishing interests, political views, commercial activities, product promotions, and audience engagement patterns over extended timeframes.</li>
        <li><strong>Group participation intelligence.</strong> Public group memberships indicate community affiliations, ideological leanings, professional interests, and geographic connections.</li>
        <li><strong>Bot ownership analysis.</strong> Bots created by a user reveal technical capabilities, project interests, and potentially commercial activities — each providing additional investigative leads.</li>
        <li><strong>Cross-platform correlation.</strong> The Telegram handle serves as a search key across all indexed platforms. Messaging platform users often share handles with gaming, development, and community platforms.</li>
        <li><strong>Temporal and activity analysis.</strong> Message timestamps, channel posting schedules, and online status patterns indicate timezone, daily routine, and activity levels.</li>
      </ul>
    </>
  ),
  privacyExposure: (
    <>
      <p>Telegram username exposure creates specific privacy concerns despite the platform's privacy-focused reputation:</p>
      <ul>
        <li><strong>Direct contact vector.</strong> A known Telegram username enables unsolicited direct messages without phone number disclosure — creating a communication channel that bypasses traditional contact barriers.</li>
        <li><strong>Channel ownership transparency.</strong> Public channels and bots are directly attributable to the creating account, linking content publication activity to a personal identity.</li>
        <li><strong>Cross-platform handle correlation.</strong> The same handle on Telegram and less private platforms enables identity correlation through a <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint check</Link> — undermining the privacy that Telegram's architecture was designed to provide.</li>
        <li><strong>Group membership exposure.</strong> Public group memberships reveal community affiliations, ideological associations, and interest areas that the user may consider private.</li>
        <li><strong>Phone number proximity risk.</strong> While Telegram usernames don't directly expose phone numbers, contacts who have the user's phone number can correlate it with the Telegram account through contact syncing.</li>
      </ul>
      <p>To reduce exposure: use a unique Telegram handle, review your privacy settings for who can find you by username, restrict who can add you to groups, and audit public channel and group memberships.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Telegram by username?", a: "Yes. Telegram usernames resolve at t.me/username for profiles, channels, groups, and bots. FootprintIQ checks Telegram alongside 500+ other platforms simultaneously." },
    { q: "Is Telegram username search free?", a: "Yes. FootprintIQ's free tier includes Telegram and 500+ platforms. No account or payment required." },
    { q: "What does a Telegram username reveal?", a: "A Telegram username can reveal personal profiles, public channels, groups, and bots. Public channels display subscriber counts, descriptions, and posted content history." },
    { q: "Can someone find my phone number from my Telegram username?", a: "Not directly. Telegram usernames do not expose phone numbers. However, contacts who already have your number may correlate it with your Telegram account through contact syncing." },
    { q: "How do investigators track Telegram accounts?", a: "Investigators use cross-platform username correlation, channel directory analysis, bot ownership tracing, and forwarded message attribution to map Telegram identities." },
    { q: "Can Telegram channels be traced to their owner?", a: "Public channels are attributed to the creating account. Channel admin lists and bot ownership records provide additional ownership intelligence." },
    { q: "Does Telegram show who viewed your profile?", a: "No. Telegram does not notify users when someone views their profile or reads their public channel posts. OSINT analysis is entirely passive." },
    { q: "How can I protect my Telegram privacy?", a: "Use a unique handle, restrict username visibility, disable contact syncing, limit who can add you to groups, and separate personal and channel identities." },
  ],
};

export default function SearchTelegramUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
