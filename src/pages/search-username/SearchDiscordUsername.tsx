import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Discord",
  slug: "search-discord-username",
  profilePattern: "@username (no public URL)",
  metaDesc: "Search Discord usernames to discover cross-platform accounts across 500+ sites. Free Discord username lookup with OSINT intelligence.",
  howItWorks: (
    <>
      <p>Discord uses unique handles in the format <code>@username</code> (since the 2023 migration from discriminator tags). Unlike most platforms, Discord does not have publicly accessible profile pages — you cannot visit a URL to view a Discord profile.</p>
      <p>This makes Discord one of the most challenging platforms for external OSINT. However, Discord usernames are extremely valuable as cross-platform search keys because gamers and community members frequently reuse the same handle across Discord, Steam, Twitch, Reddit, and gaming forums.</p>
      <p>FootprintIQ compensates for Discord's closed architecture by checking the same handle across 500+ platforms with publicly accessible profiles, effectively mapping the digital footprint that Discord itself doesn't expose.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Discord's semi-private nature requires adapted discovery techniques:</p>
      <ul>
        <li><strong>Cross-platform enumeration.</strong> The primary approach. Search the Discord username across all indexed platforms using FootprintIQ to find publicly accessible profiles using the same handle.</li>
        <li><strong>Public server directories.</strong> Platforms like Disboard and Discord.me list public servers where member lists may be browsable.</li>
        <li><strong>Linked accounts.</strong> Within shared servers, Discord profiles may display linked Steam, Xbox, Spotify, Twitter/X, and YouTube accounts — creating verified cross-platform connections.</li>
        <li><strong>User ID analysis.</strong> Discord's snowflake IDs encode account creation timestamps, providing temporal intelligence about when the identity was established.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/how-to-find-someone-on-discord" className="text-primary hover:underline">guide to finding someone on Discord</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Discord investigation requires cross-platform techniques due to the platform's closed nature:</p>
      <ul>
        <li><strong>Gaming identity correlation.</strong> Discord usernames overlap heavily with Steam, Twitch, Xbox, and PlayStation handles. FootprintIQ searches all gaming platforms simultaneously.</li>
        <li><strong>Linked account exploitation.</strong> Discord's account linking feature (Steam, Xbox, Spotify, YouTube) creates verified cross-platform connections visible in shared servers.</li>
        <li><strong>Server participation analysis.</strong> The servers someone joins reflect interests, professional affiliations, and community involvement.</li>
        <li><strong>Message history analysis.</strong> Within shared servers, message content reveals writing style, timezone, expertise, and personal details.</li>
        <li><strong>Activity status intelligence.</strong> Discord shows current games, Spotify listening, and custom status — providing real-time behavioural data.</li>
      </ul>
      <p>Explore our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide for advanced investigation workflows.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Discord username exposure creates specific risks despite the platform's semi-private design:</p>
      <ul>
        <li><strong>Gaming identity bridge.</strong> A Discord handle shared with Steam or Twitch links your semi-private Discord identity to publicly accessible gaming profiles.</li>
        <li><strong>Linked account leakage.</strong> Connected accounts (Spotify, YouTube, etc.) are visible to anyone in shared servers, potentially revealing real names and interests.</li>
        <li><strong>Server membership inference.</strong> Public server directories can reveal community affiliations and interest areas.</li>
        <li><strong>Social engineering vector.</strong> Known Discord handles enable targeted contact via friend requests or shared server infiltration.</li>
      </ul>
      <p>To reduce exposure: use a unique Discord handle, review linked accounts, and audit server memberships regularly.</p>
    </>
  ),
  faqs: [
    { q: "Can you find someone on Discord by username?", a: "Discord doesn't have public profile URLs, but FootprintIQ checks the same username across 500+ platforms with public profiles, revealing connected accounts." },
    { q: "Is Discord username search free?", a: "Yes. FootprintIQ's free tier checks Discord handles across 500+ platforms. No account required." },
    { q: "Can you see a Discord profile without being friends?", a: "Limited profile information is visible in shared servers. Full profiles require mutual server membership or friend status." },
    { q: "How do Discord usernames work now?", a: "Since 2023, Discord uses unique @username handles instead of the old username#1234 format. These unique handles work as effective cross-platform search keys." },
  ],
};

export default function SearchDiscordUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
