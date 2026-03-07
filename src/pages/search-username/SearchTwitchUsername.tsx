import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Twitch",
  slug: "search-twitch-username",
  profilePattern: "twitch.tv/username",
  metaDesc: "Search Twitch usernames to find streamer profiles and discover linked accounts across 500+ platforms. Free Twitch username lookup with OSINT intelligence.",
  howItWorks: (
    <>
      <p>Twitch profiles are accessible at <code>twitch.tv/username</code>. When you search a Twitch username, the system queries this URL to confirm channel existence and extract publicly available metadata.</p>
      <p>A public Twitch profile displays the channel name, bio, profile photo, banner image, follower count, streaming schedule, past broadcasts (VODs), clips, and linked social accounts. Twitch's integration with gaming and streaming ecosystems makes it particularly valuable for mapping gaming identities.</p>
      <p>FootprintIQ extends the Twitch lookup by checking the same handle across 500+ platforms, connecting the Twitch identity to accounts on Discord, Steam, YouTube, Twitter/X, and hundreds of other services.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Twitch profiles can be located through several methods:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Visit <code>twitch.tv/username</code> to confirm channel existence. FootprintIQ automates this programmatically.</li>
        <li><strong>Cross-platform handle reuse.</strong> Streamers consistently use the same handle across Twitch, Discord, YouTube, and Twitter/X. Finding the handle on one platform confirms the Twitch identity.</li>
        <li><strong>Panel links.</strong> Twitch channel panels frequently contain links to Discord servers, social media profiles, and donation pages.</li>
        <li><strong>Clip and VOD discovery.</strong> Twitch clips are indexed by search engines, providing alternative discovery pathways.</li>
      </ul>
      <p>For advanced methodology, see our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques guide</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Twitch provides rich intelligence for gaming and streaming identity analysis:</p>
      <ul>
        <li><strong>Streaming schedule analysis.</strong> Regular streaming times indicate timezone, availability patterns, and lifestyle.</li>
        <li><strong>VOD and clip analysis.</strong> Past broadcasts reveal voice, appearance (if using a webcam), gaming preferences, and social interactions with chat and other streamers.</li>
        <li><strong>Chat interaction mapping.</strong> Frequent chatters, moderators, and subscribers reveal the streamer's community and social connections.</li>
        <li><strong>Panel link intelligence.</strong> Channel panels link to Discord servers, social media, merchandise stores, and donation platforms — each providing additional identity data.</li>
        <li><strong>Gaming identity correlation.</strong> Twitch handles frequently match Steam, Xbox, PlayStation, and Discord usernames, enabling comprehensive gaming identity mapping.</li>
      </ul>
    </>
  ),
  privacyExposure: (
    <>
      <p>Twitch username exposure creates specific risks in the streaming ecosystem:</p>
      <ul>
        <li><strong>Real-time visibility.</strong> Live streaming exposes real-time activity, voice, and potentially face and environment to a public audience.</li>
        <li><strong>Cross-platform gaming identity.</strong> The same handle on Twitch, Discord, and Steam creates a comprehensive gaming identity profile.</li>
        <li><strong>Panel link exposure.</strong> Social media links, donation pages, and Discord server links in channel panels create explicit identity bridges.</li>
        <li><strong>VOD permanence.</strong> Past broadcasts and clips persist unless manually deleted, creating a long-term content archive.</li>
      </ul>
      <p>To reduce exposure: use a unique Twitch handle, review panel links, manage VOD retention settings, and audit linked accounts.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Twitch by username?", a: "Yes. Twitch channels are accessible at twitch.tv/username. FootprintIQ checks Twitch alongside 500+ platforms simultaneously." },
    { q: "Is Twitch username search free?", a: "Yes. FootprintIQ's free tier includes Twitch and 500+ other platforms." },
    { q: "What does a Twitch username reveal?", a: "A Twitch channel shows the streamer's name, bio, profile photo, follower count, VODs, clips, and linked social accounts displayed in channel panels." },
    { q: "Can you find someone's Discord from their Twitch?", a: "Many Twitch streamers link their Discord server in channel panels. Additionally, the same username on both platforms is a strong identity correlation signal." },
  ],
};

export default function SearchTwitchUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
