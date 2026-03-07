import { Link } from "react-router-dom";
import { SearchByUsernameTemplate, type SearchByUsernamePlatformConfig } from "@/components/templates/SearchByUsernameTemplate";

const config: SearchByUsernamePlatformConfig = {
  platform: "Twitch",
  slug: "search-twitch-by-username",
  urlPattern: "twitch.tv/username",
  titleSuffix: "Find Twitch Streamers",
  metaDesc: "Search Twitch by username to find streamers and discover linked accounts across 500+ platforms. Free Twitch username lookup with cross-platform OSINT scanning.",
  howItWorks: (
    <>
      <p>Twitch profiles are accessible at <code>twitch.tv/username</code>. When you search Twitch by username, OSINT tools query this URL and analyse the response to confirm whether a channel exists and is publicly accessible.</p>
      <p>Public Twitch profiles display the username, display name, bio, follower count, streaming schedule, linked social accounts, and panel content. Past broadcasts (VODs) and clips are also publicly accessible unless the streamer has disabled them. Twitch's integration with other platforms — particularly Discord, YouTube, and Twitter/X — creates a naturally interconnected digital presence.</p>
      <p>FootprintIQ checks the Twitch username and simultaneously scans 500+ additional platforms. The gaming and streaming community shows particularly high username reuse rates, making Twitch an excellent starting point for comprehensive cross-platform digital footprint analysis.</p>
    </>
  ),
  canYouFind: (
    <>
      <p>Yes. Twitch profiles are publicly accessible by default. Even non-partner streamers have discoverable profile pages with basic information.</p>
      <ol>
        <li><strong>Enter the Twitch handle.</strong> FootprintIQ checks Twitch and 500+ additional platforms simultaneously, returning confidence-scored results.</li>
        <li><strong>Review channel details.</strong> Twitch panels, bio, and linked accounts provide direct identity connections to other platforms.</li>
        <li><strong>Check gaming platforms.</strong> Twitch usernames frequently match handles on Steam, Discord, Xbox, PlayStation Network, and game-specific communities.</li>
        <li><strong>Examine social links.</strong> Twitch streamers commonly display their Twitter/X, Instagram, YouTube, and Discord in their channel panels.</li>
      </ol>
      <p>For advanced techniques, see our <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link> guide.</p>
    </>
  ),
  osintTechniques: (
    <>
      <p>When investigating Twitch usernames, professionals leverage the platform's inherently social nature:</p>
      <ul>
        <li><strong>Username pivoting.</strong> Using the Twitch handle to enumerate presence across gaming platforms, social media, and developer communities.</li>
        <li><strong>Panel and bio analysis.</strong> Twitch channel panels frequently contain direct links to other social accounts, Discord servers, and donation pages.</li>
        <li><strong>VOD and clip analysis.</strong> Past broadcasts may contain verbal disclosures, on-screen information, or background details that provide additional intelligence.</li>
        <li><strong>Chat log correlation.</strong> Public chat activity in other channels reveals interests, social connections, and communication patterns.</li>
        <li><strong>Streaming schedule analysis.</strong> Regular streaming times indicate timezone and routine, narrowing geographic possibilities.</li>
      </ul>
      <p>Learn more about <Link to="/username-osint-techniques" className="text-primary hover:underline">username OSINT techniques</Link>.</p>
    </>
  ),
  privacyTips: (
    <>
      <p>To reduce your Twitch-related digital exposure:</p>
      <ul>
        <li><strong>Use a unique Twitch handle.</strong> Don't reuse it on non-gaming platforms where different types of personal information are shared.</li>
        <li><strong>Audit your channel panels.</strong> Remove social links and personal information from panels if cross-platform association is a concern.</li>
        <li><strong>Manage VOD settings.</strong> Disable automatic VOD storage if past broadcasts could contain sensitive information.</li>
        <li><strong>Review linked accounts.</strong> Disconnect accounts (Discord, Steam, Twitter/X) that you don't want publicly associated with your Twitch identity.</li>
        <li><strong>Monitor chat activity.</strong> Be mindful of what you share in other streamers' chats — this activity is publicly logged and searchable.</li>
      </ul>
      <p>Run a <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link> to see your full online exposure across all platforms.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Twitch by username for free?", a: "Yes. FootprintIQ's free scan covers Twitch and 500+ other platforms. No registration required." },
    { q: "What information is visible on a Twitch profile?", a: "Public Twitch profiles display username, bio, follower count, linked social accounts, channel panels, streaming schedule, and past broadcasts (if enabled)." },
    { q: "Do Twitch streamers reuse usernames on other platforms?", a: "Yes — at very high rates. The gaming and streaming community shows some of the highest username reuse rates, with the same handle commonly appearing on Discord, Steam, YouTube, and Twitter/X." },
    { q: "Can you find someone's Discord from their Twitch username?", a: "If they use the same handle on Discord, FootprintIQ will detect it. Many streamers also list their Discord server link directly on their Twitch channel panels." },
    { q: "Is Twitch username search legal?", a: "Yes. Twitch profiles are publicly accessible. Searching publicly available URLs is legal and does not violate platform terms." },
  ],
};

export default function SearchTwitchByUsername() {
  return <SearchByUsernameTemplate config={config} />;
}
